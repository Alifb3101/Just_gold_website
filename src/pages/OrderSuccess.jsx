import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';

const verificationCache = new Map();

const formatDate = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatMoney = (value) => {
  const amount = Number(value ?? 0) || 0;
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 2,
  }).format(amount);
};

function SuccessSkeleton() {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-[#E7DBC2] bg-white p-6 lg:p-8 animate-pulse">
      <div className="h-7 w-48 bg-[#EFE4CC] rounded" />
      <div className="mt-2 h-4 w-72 bg-[#EFE4CC] rounded" />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-[#F7F1E4]" />
        ))}
      </div>
    </div>
  );
}

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';
  const codOrderNo = searchParams.get('order_no') || '';
  const paymentType = searchParams.get('payment') || (sessionId ? 'stripe' : 'cod');
  const orderIdParam = searchParams.get('order_id') || searchParams.get('orderId') || '';

  const verifyStripeSession = useCartStore((state) => state.verifyStripeSession);
  const getGuestOrder = useCartStore((state) => state.getGuestOrder);

  const [state, setState] = useState({
    isLoading: Boolean(sessionId || orderIdParam),
    error: '',
    data: null,
  });
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    setIsEntering(true);
  }, []);

  useEffect(() => {
    const cached = sessionId ? verificationCache.get(sessionId) : null;

    let active = true;

    const loadGuestOrder = async (orderId) => {
      if (!orderId) return null;
      try {
        const response = await getGuestOrder(orderId);
        if (!active) return null;
        return response?.data ?? response;
      } catch (error) {
        if (!active) return null;
        console.error('[order-success] guest-order failed', error);
        toast.error('Unable to load order details. Please refresh.');
        return null;
      }
    };

    const loadFromSession = () => {
      try {
        const raw = sessionStorage.getItem('last_order_payload');
        if (!raw) return null;
        return JSON.parse(raw);
      } catch {
        return null;
      }
    };

    const hydrateFromStripe = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: '' }));
      try {
        const response = cached || (await verifyStripeSession(sessionId));
        if (!active) return;

        const payload = response?.data ?? response;
        verificationCache.set(sessionId, payload);

        const stripeOrderId = payload?.order_id || payload?.orderId;
        const storedOrderId = sessionStorage.getItem('last_order_id') || '';
        const guestOrder = await loadGuestOrder(stripeOrderId || orderIdParam || storedOrderId);
        const sessionFallback = guestOrder || loadFromSession();

        setState({
          isLoading: false,
          error: '',
          data: sessionFallback || payload,
        });
      } catch (error) {
        if (!active) return;
        setState({
          isLoading: false,
          error: 'We could not verify your payment right now. Redirecting to home...',
          data: null,
        });
      }
    };

    const hydrateFromOrderIdOnly = async () => {
      const storedOrderId = sessionStorage.getItem('last_order_id') || '';
      const targetId = orderIdParam || storedOrderId;
      if (!targetId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: '' }));
      const guestOrder = await loadGuestOrder(targetId);
      const sessionFallback = guestOrder || loadFromSession();
      if (!active) return;
      if (guestOrder || sessionFallback) {
        setState({ isLoading: false, error: '', data: guestOrder || sessionFallback });
      } else {
        setState({
          isLoading: false,
          error: 'Unable to load order details right now.',
          data: null,
        });
      }
    };

    if (sessionId) {
      void hydrateFromStripe();
      return () => {
        active = false;
      };
    }

    const storedOrderId = sessionStorage.getItem('last_order_id') || '';
    if (orderIdParam || storedOrderId) {
      void hydrateFromOrderIdOnly();
      return () => {
        active = false;
      };
    }

    // COD / fallback display if nothing to load
    const sessionFallback = loadFromSession();
    setState({
      isLoading: false,
      error: '',
      data:
        sessionFallback || {
          order_number: codOrderNo || 'N/A',
          payment_status: 'pending',
          total_amount: 0,
          shipping_address: null,
          estimated_delivery: null,
        },
    });

    return () => {
      active = false;
    };
  }, [sessionId, codOrderNo, verifyStripeSession, getGuestOrder, orderIdParam]);

  useEffect(() => {
    if (!state.error) return;
    toast.error('Order verification failed. Redirecting to home.');
    const timer = window.setTimeout(() => navigate('/', { replace: true }), 5000);
    return () => window.clearTimeout(timer);
  }, [state.error, navigate]);

  const display = useMemo(() => {
    if (!state.data) return null;

    const payload = state.data?.data ?? state.data; // support {data:{...}}

    const shipping = payload.shipping_address ?? payload.shippingAddress ?? null;
    const contact = payload.contact ?? {
      email: payload.guest_email ?? payload.guestEmail,
      full_name: payload.guest_full_name ?? payload.guestFullName,
      phone: payload.guest_phone ?? payload.guestPhone,
    };
    const totals = payload.totals ?? {};
    const items = Array.isArray(payload.items) ? payload.items : [];

    return {
      orderNo: payload.order_number ?? payload.orderNo ?? payload.order_id ?? payload.id ?? 'N/A',
      paymentStatus: payload.payment_status ?? 'pending',
      orderStatus: payload.order_status ?? '',
      paymentMethod: payload.payment_method || paymentType,
      total: totals.total ?? payload.total_amount ?? payload.total ?? 0,
      currency: totals.currency ?? payload.currency ?? 'AED',
      shipping,
      contact,
      items,
      estimatedDelivery: payload.estimated_delivery,
    };
  }, [state.data, paymentType]);

  return (
    <main
      className={`max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 transition-all duration-300 ease-out ${
        isEntering ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {state.isLoading ? <SuccessSkeleton /> : null}

      {!state.isLoading && state.error ? (
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-300 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-[#3E2723]">Verification in progress</h1>
          <p className="mt-2 text-sm text-[#7A6A4D]">{state.error}</p>
        </div>
      ) : null}

      {!state.isLoading && !state.error && display ? (
        <section className="mx-auto max-w-3xl rounded-2xl border border-[#E7DBC2] bg-white p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-[#3E2723]">Order Confirmed</h1>
          <p className="mt-1 text-sm text-[#7A6A4D]">
            Your order has been placed successfully via {display.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Stripe'}.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Order Number" value={display.orderNo} />
            <InfoCard label="Payment Status" value={String(display.paymentStatus).toUpperCase()} />
            <InfoCard label="Total Amount" value={formatMoney(display.total)} />
            <InfoCard label="Payment Method" value={display.paymentMethod || 'Stripe'} />
            <InfoCard label="Estimated Delivery" value={formatDate(display.estimatedDelivery)} />
            <InfoCard
              label="Shipping Address"
              value={display.shipping
                ? `${display.shipping.address_line_1 ?? ''} ${display.shipping.city ?? ''} ${display.shipping.emirate ?? ''}`.trim()
                : 'N/A'}
              wide
            />
            <InfoCard
              label="Contact"
              value={display.contact?.email || display.contact?.full_name || display.contact?.phone ? `${display.contact?.full_name ?? ''} ${display.contact?.email ?? ''} ${display.contact?.phone ?? ''}`.trim() : 'N/A'}
              wide
            />
          </div>

          {Array.isArray(display.items) && display.items.length > 0 ? (
            <div className="mt-6 border-t border-[#EFE4CC] pt-4 space-y-3">
              <p className="text-sm font-semibold text-[#3E2723]">Items</p>
              <div className="space-y-3">
                {display.items.map((item, idx) => (
                  <div key={`${item.id ?? idx}-${item.product_variant_id ?? ''}`} className="flex items-center gap-3 rounded-xl border border-[#EFE4CC] bg-[#FFFDF7] p-3">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.name} className="h-12 w-12 rounded-lg object-cover bg-[#F6F1EA]" />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#3E2723] truncate">{item.name || item.product_name}</p>
                      <p className="text-xs text-[#7A6A4D]">
                        {item.variant?.name || item.variant?.shade ? `${item.variant?.name ?? ''} ${item.variant?.shade ?? ''}`.trim() : ''}
                      </p>
                      <p className="text-xs text-[#7A6A4D]">
                        Qty: {item.quantity} · {formatMoney(item.unit_price ?? item.price ?? 0)} each
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#3E2723]">{formatMoney(item.total_price ?? (item.unit_price ?? item.price ?? 0) * (item.quantity ?? 1))}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <Link
            to="/shop"
            className="mt-7 inline-flex items-center rounded-xl bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white hover:bg-[#C19B2C] transition"
          >
            Continue Shopping
          </Link>
        </section>
      ) : null}
    </main>
  );
}

function InfoCard({ label, value, wide = false }) {
  return (
    <div className={`rounded-xl border border-[#EFE4CC] bg-[#FFFDF7] p-4 ${wide ? 'md:col-span-2' : ''}`}>
      <p className="text-xs uppercase tracking-wide text-[#7A6A4D]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#3E2723] break-words">{value}</p>
    </div>
  );
}
