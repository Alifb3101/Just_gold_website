import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/app/contexts/AuthContext";
import { preloadOrderSuccessPage } from "@/pages/prefetch";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import OrderSummary from "@/components/OrderSummary";

/* ---------------- UAE CONFIG ---------------- */

const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

const INITIAL_ADDRESS = {
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  emirate: "",
};

/* ---------------- VALIDATION ---------------- */

const validateAddress = (address) => {
  const next = {};
  if (!String(address.full_name).trim())
    next.full_name = "Full name is required.";
  if (!String(address.phone).trim())
    next.phone = "Phone number is required.";
  if (!String(address.address_line_1).trim())
    next.address_line_1 = "Address line 1 is required.";
  if (!String(address.city).trim())
    next.city = "City is required.";
  if (!String(address.emirate).trim()) {
    next.emirate = "Emirate is required.";
  } else if (!UAE_EMIRATES.includes(address.emirate)) {
    next.emirate = "Please select a valid emirate.";
  }
  return next;
};

const normalizeAddressList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

/* ================== MAIN COMPONENT ================== */

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, user } = useAuth();

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const shipping = useCartStore((s) => s.shipping);
  const discount = useCartStore((s) => s.discount);
  const isLoading = useCartStore((s) => s.isLoading);
  const checkout = useCartStore((s) => s.checkout);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const setShippingAddress = useCartStore((s) => s.setShippingAddress);
  const setShippingAddressId = useCartStore((s) => s.setShippingAddressId);
  const setGuestDetails = useCartStore((s) => s.setGuestDetails);
  const placeOrder = useCartStore((s) => s.placeOrder);
  const clearCartLocal = useCartStore((s) => s.clearCartLocal);
  const guestEmailValue = useCartStore((s) => s.checkout.guestEmail);
  const guestFullNameValue = useCartStore((s) => s.checkout.guestFullName);
  const guestPhoneValue = useCartStore((s) => s.checkout.guestPhone);

  const setAuth = useAuthStore((s) => s.setAuth);
  const hydrateAuth = useAuthStore((s) => s.hydrate);

  const [address, setAddress] = useState(INITIAL_ADDRESS);
  const [errors, setErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isEntering, setIsEntering] = useState(false);
  const [guestEmail, setGuestEmail] = useState(guestEmailValue || "");
  const [guestFullName, setGuestFullName] = useState(guestFullNameValue || "");
  const [guestPhone, setGuestPhone] = useState(guestPhoneValue || "");

  const submitLockRef = useRef(false);

  const isAuthenticated = Boolean(token);
  const isGuest = !isAuthenticated;

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    setAuth({ token, user });
  }, [token, user, setAuth]);

  useEffect(() => {
    setGuestDetails({ email: guestEmail, fullName: guestFullName, phone: guestPhone });
  }, [guestEmail, guestFullName, guestPhone, setGuestDetails]);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart, token]);

  const loadAddresses = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get("/addresses");
      const list = normalizeAddressList(response.data);
      setSavedAddresses(list);

      const preferred =
        list.find((item) => item?.is_default) ?? list[0] ?? null;

      if (preferred?.id) {
        setSelectedAddressId(Number(preferred.id));
        setShippingAddressId(Number(preferred.id));
      }
    } catch {
      toast.error("Unable to load saved addresses.");
    }
  }, [token, setShippingAddressId]);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  useEffect(() => {
    setIsEntering(true);
    preloadOrderSuccessPage();
  }, []);

  useEffect(() => {
    if (errors.guest_email && guestEmail.trim()) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.guest_email;
        return next;
      });
    }
  }, [errors.guest_email, guestEmail]);

  useEffect(() => {
    const canceled = searchParams.get("canceled");
    if (canceled) {
      toast.info("Payment was cancelled. You can review your cart and try again.");
    }
  }, [searchParams]);

  const onAddressChange = useCallback(
    (field, value) => {
      setSelectedAddressId(null);
      setShippingAddressId(null);
      setAddress((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [setShippingAddressId]
  );

  const onSelectSavedAddress = useCallback(
    (id) => {
      setSelectedAddressId(Number(id));
      setShippingAddressId(Number(id));
      setErrors({});
    },
    [setShippingAddressId]
  );

  const placeOrderDisabled = useMemo(
    () =>
      checkout.isPlacingOrder ||
      isLoading ||
      items.length === 0 ||
      (isGuest && !guestEmail.trim()),
    [checkout.isPlacingOrder, isLoading, items.length, isGuest, guestEmail]
  );

  const onPlaceOrder = useCallback(async () => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;

    if (!items.length) {
      toast.error("Your cart is empty.");
      submitLockRef.current = false;
      return;
    }

    if (!selectedAddressId) {
      const nextErrors = validateAddress(address);
      if (isGuest && !guestEmail.trim()) {
        nextErrors.guest_email = "Email is required.";
      }
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        toast.error("Please complete required fields.");
        submitLockRef.current = false;
        return;
      }
      setShippingAddress(address);
      if (isGuest) {
        setGuestDetails({
          email: guestEmail.trim(),
          fullName: guestFullName.trim() || address.full_name,
          phone: guestPhone.trim() || address.phone,
        });
      }
    } else if (isGuest) {
      setGuestDetails({
        email: guestEmail.trim(),
        fullName: guestFullName.trim() || address.full_name,
        phone: guestPhone.trim() || address.phone,
      });
    }

    try {
      const data = await placeOrder();

      if (checkout.paymentMethod === "stripe") {
        if (!data?.url) {
          toast.error("Unable to start secure payment.");
          submitLockRef.current = false;
          return;
        }
        window.location.href = data.url;
        return;
      }

      // COD path (guest or authenticated)
      const orderPayload = data?.data || data?.order || data;
      const orderId = orderPayload?.order_id || orderPayload?.orderId || orderPayload?.id;
      const orderNumber = orderPayload?.order_number || orderPayload?.orderNumber;
      if (orderId) {
        try {
          sessionStorage.setItem("last_order_id", String(orderId));
          if (orderNumber) sessionStorage.setItem("last_order_number", String(orderNumber));
          sessionStorage.setItem("last_order_payload", JSON.stringify(orderPayload));
        } catch {
          // ignore
        }
      }
      clearCartLocal();
      if (orderId) {
        navigate(`/order-success?order_id=${encodeURIComponent(orderId)}&payment=cod`, {
          replace: true,
        });
      } else {
        navigate("/order-success?payment=cod", { replace: true });
      }
      toast.success("Order placed successfully.");
    } catch (error) {
      toast.error(error?.message || "Unable to place order.");
    } finally {
      submitLockRef.current = false;
    }
  }, [
    items.length,
    selectedAddressId,
    address,
    setShippingAddress,
    placeOrder,
    checkout.paymentMethod,
    clearCartLocal,
    navigate,
    isGuest,
    guestEmail,
    guestFullName,
    guestPhone,
    setGuestDetails,
  ]);

  return (
    <main
      className={`min-h-screen bg-gradient-to-b from-[#FFFDF8] via-[#FFF9F0] to-[#FDF6E9] transition-all duration-500 ${
        isEntering ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        {searchParams.get("canceled") ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-[#5A452E] flex items-center justify-between gap-3">
            <p className="font-medium">Payment was cancelled. Review your cart and try again.</p>
            <button
              onClick={() => navigate("/cart")}
              className="rounded-xl bg-[#D4AF37] px-4 py-2 text-white text-xs font-semibold hover:bg-[#C19B2C] transition"
            >
              Return to Cart
            </button>
          </div>
        ) : null}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_520px] gap-12">

          {/* LEFT SIDE */}
          <section className="space-y-10">

            <LuxuryCard step="1" title="Shipping Address">

              {isGuest ? (
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <InputField
                    label="Email for receipt"
                    type="email"
                    value={guestEmail}
                    error={errors.guest_email}
                    onChange={setGuestEmail}
                  />
                </div>
              ) : null}

              {savedAddresses.map((addr) => {
                const active =
                  Number(selectedAddressId) === Number(addr.id);

                return (
                  <button
                    key={addr.id}
                    onClick={() => onSelectSavedAddress(addr.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition ${
                      active
                        ? "border-[#D4AF37] bg-[#FFF8EA] shadow-md"
                        : "border-[#E7DBC2] hover:border-[#D4AF37]"
                    }`}
                  >
                    <p className="font-semibold">
                      {addr.full_name}
                    </p>
                    <p className="text-sm text-[#6B5A43]">
                      {addr.line1 || addr.address_line_1}
                    </p>
                  </button>
                );
              })}

              <div className="mt-8">
                <AddressForm
                  values={address}
                  errors={errors}
                  onChange={onAddressChange}
                />
              </div>
            </LuxuryCard>

            <LuxuryCard step="2" title="Payment Method">
              <PaymentMethodSelector
                value={checkout.paymentMethod}
                onChange={(method) => {
                  setPaymentMethod(method);
                }}
              />
            </LuxuryCard>

            <button
              onClick={onPlaceOrder}
              disabled={placeOrderDisabled}
              className={`w-full py-4 rounded-2xl font-semibold text-lg tracking-wide transition-all duration-300 ${
                placeOrderDisabled
                  ? "bg-[#D8C9A5] text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-[#D4AF37] via-[#E6C35C] to-[#C19B2C] text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95"
              }`}
            >
              {checkout.isPlacingOrder
                ? "Processing..."
                : "Place Secure Order"}
            </button>
          </section>

          {/* RIGHT SIDE */}
          <aside className="xl:sticky xl:top-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#D4AF37]/20">
              <OrderSummary items={items} subtotal={subtotal} shippingFee={shipping} discount={discount} />
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}

/* ================= ADDRESS FORM ================= */

function AddressForm({ values, errors, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <InputField
        label="Full Name"
        value={values.full_name}
        error={errors.full_name}
        onChange={(v) => onChange("full_name", v)}
      />

      <InputField
        label="Phone Number"
        value={values.phone}
        error={errors.phone}
        onChange={(v) => onChange("phone", v)}
      />

      <div className="md:col-span-2">
        <InputField
          label="Address Line 1"
          value={values.address_line_1}
          error={errors.address_line_1}
          onChange={(v) => onChange("address_line_1", v)}
        />
      </div>

      <div className="md:col-span-2">
        <InputField
          label="Apartment, Suite (Optional)"
          value={values.address_line_2}
          onChange={(v) => onChange("address_line_2", v)}
        />
      </div>

      <InputField
        label="City"
        value={values.city}
        error={errors.city}
        onChange={(v) => onChange("city", v)}
      />

      <div>
        <label className="block text-sm font-medium mb-2">
          Emirate
        </label>
        <select
          value={values.emirate}
          onChange={(e) =>
            onChange("emirate", e.target.value)
          }
          className="w-full rounded-xl border border-[#E5D7B2] bg-white px-4 py-3 focus:ring-2 focus:ring-[#D4AF37] transition"
        >
          <option value="">Select Emirate</option>
          {UAE_EMIRATES.map((em) => (
            <option key={em} value={em}>
              {em}
            </option>
          ))}
        </select>
        {errors.emirate && (
          <p className="text-red-500 text-xs mt-1">
            {errors.emirate}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Country
        </label>
        <input
          value="United Arab Emirates"
          disabled
          className="w-full rounded-xl border border-[#E5D7B2] bg-[#F8F5EC] px-4 py-3 text-[#7A6B50]"
        />
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, error, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl px-4 py-3 border transition ${
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-[#E5D7B2] focus:ring-[#D4AF37]"
        } focus:ring-2 bg-white`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

function LuxuryCard({ step, title, children }) {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-[#D4AF37]/20 shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-[#2C1F1B] text-white flex items-center justify-center text-sm font-semibold">
          {step}
        </div>
        <h2 className="text-xl font-semibold text-[#2C1F1B]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}