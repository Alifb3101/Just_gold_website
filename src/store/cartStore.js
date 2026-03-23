import { create } from 'zustand';
import { api, toFriendlyErrorMessage } from '@/services/api';

const isDev = import.meta.env.DEV;

const debugCheckout = (label, details) => {
  if (!isDev) return;
  console.debug(`[checkout-debug] ${label}`, details);
};

const isNotFound = (error) => Number(error?.response?.status ?? 0) === 404;

const hasAuthToken = () => {
  try {
    return Boolean(localStorage.getItem('auth_token'));
  } catch {
    return false;
  }
};

const postWithFallback = async (path, _fallbackPath, payload) => {
  debugCheckout('POST', {
    path,
    payloadKeys: Object.keys(payload ?? {}),
    payment_method: payload?.payment_method,
  });
  return api.post(path, payload);
};

const getWithFallback = async (path) => {
  debugCheckout('GET', { path });
  return api.get(path);
};

const toShippingAddressPayload = (shippingAddress = {}) => ({
  label: shippingAddress.label || 'Checkout',
  full_name: String(shippingAddress?.full_name ?? '').trim(),
  phone: String(shippingAddress?.phone ?? '').trim(),
  line1: String(shippingAddress?.address_line_1 ?? shippingAddress?.line1 ?? '').trim(),
  line2: String(shippingAddress?.address_line_2 ?? shippingAddress?.line2 ?? '').trim() || undefined,
  city: String(shippingAddress?.city ?? '').trim() || undefined,
  emirate: String(shippingAddress?.emirate ?? '').trim() || undefined,
  country: String(shippingAddress?.country ?? 'United Arab Emirates').trim(),
});

const buildCheckoutPayload = ({ paymentMethod, shippingAddressId, shippingAddress, guest, couponCode }) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const successUrl = origin
    ? `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`
    : undefined;
  const cancelUrl = origin ? `${origin}/checkout` : undefined;

  const payload = {
    payment_method: paymentMethod,
    ...(shippingAddressId ? { shipping_address_id: shippingAddressId } : {}),
    frontend_url: origin || undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
  };
  if (shippingAddress) {
    payload.shipping_address = toShippingAddressPayload(shippingAddress);
  }
  if (guest?.email) {
    payload.guest_email = guest.email;
    payload.guest_full_name = guest.fullName || payload.shipping_address?.full_name;
    payload.guest_phone = guest.phone || payload.shipping_address?.phone;
  }
  if (couponCode) {
    payload.coupon_code = couponCode;
  }
  return payload;
};

const createCheckoutSession = async ({ paymentMethod, shippingAddressId, shippingAddress, guest, couponCode }) => {
  const payload = buildCheckoutPayload({ paymentMethod, shippingAddressId, shippingAddress, guest, couponCode });

  debugCheckout('checkout payload', {
    paymentMethod,
    payloadKeys: Object.keys(payload ?? {}),
  });

  return postWithFallback('/checkout/create-session', null, payload);
};

const normalizeAddressList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const toAddressCreatePayload = (shippingAddress) => ({
  label: 'Checkout',
  full_name: String(shippingAddress?.full_name ?? '').trim(),
  phone: String(shippingAddress?.phone ?? '').trim(),
  line1: String(shippingAddress?.address_line_1 ?? '').trim(),
  line2: String(shippingAddress?.address_line_2 ?? '').trim() || undefined,
  city: String(shippingAddress?.city ?? '').trim() || undefined,
  emirate: String(shippingAddress?.emirate ?? '').trim() || undefined,
  postal_code: String(shippingAddress?.postal_code ?? '').trim() || undefined,
  country: 'UAE',
});

const equalsIgnoreCase = (left, right) =>
  String(left ?? '').trim().toLowerCase() === String(right ?? '').trim().toLowerCase();

const resolveAddressId = async (shippingAddress) => {
  debugCheckout('resolve address start', {
    full_name: shippingAddress?.full_name,
    phone: shippingAddress?.phone,
    line1: shippingAddress?.address_line_1,
  });

  const listResponse = await getWithFallback('/addresses');
  const addresses = normalizeAddressList(listResponse.data);

  debugCheckout('address list loaded', {
    count: addresses.length,
  });

  const match = addresses.find((item) => {
    const line1 = item?.line1 ?? item?.address_line_1;
    return (
      equalsIgnoreCase(item?.full_name, shippingAddress?.full_name) &&
      equalsIgnoreCase(item?.phone, shippingAddress?.phone) &&
      equalsIgnoreCase(line1, shippingAddress?.address_line_1)
    );
  });

  if (match?.id) {
    debugCheckout('address matched existing', { id: Number(match.id) });
    return Number(match.id);
  }

  const payload = toAddressCreatePayload(shippingAddress);

  try {
    debugCheckout('address create', { path: '/addresses' });
    const createResponse = await api.post('/addresses', payload);
    debugCheckout('address create success', { id: Number(createResponse.data?.id) });
    return Number(createResponse.data?.id);
  } catch (error) {
    throw error;
  }
};

const normalizeCart = (payload) => {
  const items = Array.isArray(payload?.items)
    ? payload.items.map((item, index) => {
        const productId = String(item.product_id ?? item.productId ?? index + 1);
        const variantId = item.product_variant_id ? String(item.product_variant_id) : null;
        const quantity = Number(item.quantity ?? 1) || 1;
        const unitPrice = Number(item.current_price ?? item.price ?? 0) || 0;

        return {
          id: variantId ? `${productId}:${variantId}` : `${productId}:base`,
          productId,
          productVariantId: variantId,
          name: item.product_name ?? item.name ?? 'Product',
          image: item.main_image ?? item.image ?? '',
          quantity,
          price: unitPrice,
          subtotal: Number(item.subtotal ?? unitPrice * quantity) || 0,
        };
      })
    : [];

  const subtotal = Number(payload?.totals?.subtotal ?? items.reduce((sum, item) => sum + item.subtotal, 0)) || 0;
  const itemCount = Number(payload?.totals?.items ?? items.reduce((sum, item) => sum + item.quantity, 0)) || 0;
  const discount = Number(payload?.totals?.discount ?? payload?.coupon?.discount_amount ?? 0) || 0;
  const shipping = Number(payload?.totals?.shipping ?? 0) || 0;
  const total = Number(payload?.totals?.total ?? subtotal + shipping - discount) || 0;
  const currency = payload?.totals?.currency ?? 'AED';
  const freeShippingRemaining = payload?.free_shipping_remaining ?? payload?.totals?.free_shipping_remaining ?? null;
  const isFreeShipping = Boolean(payload?.is_free_shipping ?? payload?.totals?.is_free_shipping ?? shipping === 0);

  return { items, subtotal, itemCount, discount, shipping, total, currency, freeShippingRemaining, isFreeShipping };
};

const validateAddress = (address) => {
  const requiredFields = ['full_name', 'phone', 'address_line_1', 'city', 'emirate'];
  const missing = requiredFields.filter((key) => !String(address?.[key] ?? '').trim());
  return { valid: missing.length === 0, missing };
};

export const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  currency: 'AED',
  freeShippingRemaining: null,
  isFreeShipping: false,
  itemCount: 0,
  isLoading: false,
  isSyncing: false,
  error: null,
  lastFetchedAt: 0,
  checkout: {
    paymentMethod: 'cod',
    shippingAddress: null,
    shippingAddressId: null,
    guestEmail: '',
    guestFullName: '',
    guestPhone: '',
    couponCode: '',
    isPlacingOrder: false,
  },

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      // Backend auto-loads saved coupon per user/guest, no need to send coupon_code
      const response = await api.get('/cart');
      const normalized = normalizeCart(response.data);
      const responseCoupon = response?.data?.coupon?.code ?? '';
      const checkout = get().checkout ?? {};
      set({
        ...normalized,
        checkout: { ...checkout, couponCode: responseCoupon || '' },
        isLoading: false,
        error: null,
        lastFetchedAt: Date.now(),
      });
    } catch (error) {
      set({ isLoading: false, error: toFriendlyErrorMessage(error, 'Unable to load cart right now.') });
    }
  },

  setPaymentMethod: (paymentMethod) => {
    set((state) => ({ checkout: { ...state.checkout, paymentMethod } }));
  },

  setShippingAddress: (shippingAddress) => {
    set((state) => ({ checkout: { ...state.checkout, shippingAddress } }));
  },

  setShippingAddressId: (shippingAddressId) => {
    set((state) => ({
      checkout: {
        ...state.checkout,
        shippingAddressId:
          shippingAddressId === null || shippingAddressId === undefined
            ? null
            : Number(shippingAddressId),
      },
    }));
  },

  setGuestDetails: ({ email, fullName, phone }) => {
    set((state) => ({
      checkout: {
        ...state.checkout,
        guestEmail: typeof email === 'string' ? email : state.checkout.guestEmail,
        guestFullName: typeof fullName === 'string' ? fullName : state.checkout.guestFullName,
        guestPhone: typeof phone === 'string' ? phone : state.checkout.guestPhone,
      },
    }));
  },

  setCouponCode: (couponCode) => {
    set((state) => ({
      checkout: { ...state.checkout, couponCode: couponCode ?? '' },
    }));
  },

  applyCoupon: async (code) => {
    const normalized = String(code ?? '').trim();
    if (!normalized) return false;
    try {
      const response = await api.post('/cart/apply-coupon', { coupon_code: normalized });
      const normalized_cart = normalizeCart(response.data);
      const responseCoupon = response?.data?.coupon?.code ?? '';
      const checkout = get().checkout ?? {};
      set({
        ...normalized_cart,
        checkout: { ...checkout, couponCode: responseCoupon || '' },
      });
      return true;
    } catch (error) {
      console.error('[cart] applyCoupon failed', error);
      return false;
    }
  },

  removeCoupon: async () => {
    try {
      const response = await api.post('/cart/remove-coupon');
      const normalized_cart = normalizeCart(response.data);
      const checkout = get().checkout ?? {};
      set({
        ...normalized_cart,
        checkout: { ...checkout, couponCode: '' },
      });
      return true;
    } catch (error) {
      console.error('[cart] removeCoupon failed', error);
      return false;
    }
  },

  clearCartLocal: () => {
    set((state) => ({
      items: [],
      subtotal: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      currency: 'AED',
      freeShippingRemaining: null,
      isFreeShipping: false,
      itemCount: 0,
      checkout: { ...state.checkout, couponCode: '' },
    }));
  },

  removeItemOptimistic: async (itemId) => {
    const previous = get().items;
    const previousSubtotal = get().subtotal;
    const previousItemCount = get().itemCount;
    const previousShipping = get().shipping;
    const previousDiscount = get().discount;
    const previousTotal = get().total;
    const previousCurrency = get().currency;
    const previousFreeShippingRemaining = get().freeShippingRemaining;
    const previousIsFreeShipping = get().isFreeShipping;
    const nextItems = previous.filter((item) => item.id !== itemId);
    const nextSubtotal = nextItems.reduce((sum, item) => sum + item.subtotal, 0);
    const nextCount = nextItems.reduce((sum, item) => sum + item.quantity, 0);

    set({
      items: nextItems,
      subtotal: nextSubtotal,
      itemCount: nextCount,
      // Preserve server-calculated values until the next sync
      shipping: previousShipping,
      discount: previousDiscount,
      total: Math.max(0, nextSubtotal + previousShipping - previousDiscount),
      currency: previousCurrency,
      freeShippingRemaining: previousFreeShippingRemaining,
      isFreeShipping: previousIsFreeShipping,
    });

    try {
      const target = previous.find((item) => item.id === itemId);
      if (target?.productVariantId) {
        await api.delete(`/cart/${target.productVariantId}`);
      } else {
        await api.delete(`/cart/product/${target?.productId}`);
      }
    } catch (error) {
      set({
        items: previous,
        subtotal: previousSubtotal,
        itemCount: previousItemCount,
        shipping: previousShipping,
        discount: previousDiscount,
        total: previousTotal,
        currency: previousCurrency,
        freeShippingRemaining: previousFreeShippingRemaining,
        isFreeShipping: previousIsFreeShipping,
      });
      throw new Error(toFriendlyErrorMessage(error, 'Unable to update cart item.'));
    }
  },

  placeOrder: async () => {
    const { checkout, items } = get();

    if (!items.length) {
      throw new Error('Your cart is empty. Add products before checkout.');
    }

    const guestEmail = String(checkout.guestEmail ?? '').trim();
    const isGuest = !hasAuthToken();
    const paymentMethod = checkout.paymentMethod;

    const hasSavedAddressId =
      Number.isFinite(Number(checkout.shippingAddressId)) && Number(checkout.shippingAddressId) > 0;

    const validation = validateAddress(checkout.shippingAddress);
    const missing = validation.missing ?? [];
    const guestMissing = isGuest && !guestEmail ? [...missing, 'guest_email'] : missing;

    if (!hasSavedAddressId && guestMissing.length > 0) {
      throw new Error('Please complete all required shipping and contact fields.');
    }

    set((state) => ({ checkout: { ...state.checkout, isPlacingOrder: true } }));

    try {
      if (isGuest) {
        const response = await createCheckoutSession({
          paymentMethod,
          shippingAddress: checkout.shippingAddress,
          guest: {
            email: guestEmail,
            fullName: checkout.guestFullName || checkout.shippingAddress?.full_name,
            phone: checkout.guestPhone || checkout.shippingAddress?.phone,
          },
          couponCode: checkout.couponCode?.trim() || undefined,
        });

        debugCheckout('checkout session created (guest)', {
          hasUrl: Boolean(response?.data?.url),
          responseKeys: Object.keys(response?.data ?? {}),
        });

        return response.data;
      }

      const shippingAddressId = hasSavedAddressId
        ? Number(checkout.shippingAddressId)
        : await resolveAddressId(checkout.shippingAddress);
      if (!Number.isFinite(shippingAddressId) || shippingAddressId <= 0) {
        throw new Error('Unable to resolve shipping address. Please try again.');
      }

      debugCheckout('shipping address resolved', {
        shipping_address_id: shippingAddressId,
        payment_method: paymentMethod,
      });

      const response = await createCheckoutSession({
        paymentMethod,
        shippingAddressId,
        couponCode: checkout.couponCode?.trim() || undefined,
      });

      debugCheckout('checkout session created', {
        hasUrl: Boolean(response?.data?.url),
        responseKeys: Object.keys(response?.data ?? {}),
      });

      return response.data;
    } catch (error) {
      debugCheckout('placeOrder failed', {
        status: Number(error?.response?.status ?? 0),
        message: error?.response?.data?.message || error?.message,
        code: error?.response?.data?.code,
      });
      throw new Error(toFriendlyErrorMessage(error, 'Unable to place order. Please try again.'));
    } finally {
      set((state) => ({ checkout: { ...state.checkout, isPlacingOrder: false } }));
    }
  },

  verifyStripeSession: async (sessionId) => {
    const encodedSession = encodeURIComponent(sessionId);
    const response = await getWithFallback(`/orders/verify?session_id=${encodedSession}`);
    return response.data;
  },

  getGuestOrder: async (orderId) => {
    const encodedId = encodeURIComponent(orderId);
    const response = await getWithFallback(`/checkout/guest-order/${encodedId}`);
    return response.data;
  },
}));
