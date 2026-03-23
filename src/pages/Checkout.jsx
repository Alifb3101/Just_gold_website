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
import { MapPin, Phone, Mail, Lock, CheckCircle2 } from "lucide-react";

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
      className={`min-h-screen bg-gradient-to-br from-[#FFFDF8] via-[#FFF9F0] to-[#F8F2E8] transition-all duration-700 ${
        isEntering ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37]/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#2C1F1B] mb-2">Secure Checkout</h1>
          <p className="text-[#7A6B50] flex items-center gap-2">
            <Lock size={16} />
            Your order is protected and secure
          </p>
        </div>

        {/* Cancelled Payment Alert */}
        {searchParams.get("canceled") ? (
          <div className="mb-8 rounded-2xl border-l-4 border-[#D4AF37] bg-gradient-to-r from-amber-50 to-transparent px-6 py-4 flex items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="font-semibold text-[#3E2723] mb-1">Payment Cancelled</p>
              <p className="text-sm text-[#5A452E]">You can review your cart and try again at any time.</p>
            </div>
            <button
              onClick={() => navigate("/cart")}
              className="rounded-xl bg-[#D4AF37] px-6 py-2 text-white text-sm font-semibold hover:bg-[#C19B2C] transition-all duration-200 hover:shadow-lg flex-shrink-0"
            >
              Return to Cart
            </button>
          </div>
        ) : null}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT SIDE - FORM */}
          <section className="lg:col-span-2 space-y-6">

            {/* Shipping Address Card */}
            <LuxuryCard 
              step="1" 
              title="Shipping Address"
              icon={<MapPin size={20} />}
              description="Where should we deliver your order?"
            >
              {isGuest ? (
                <div className="grid grid-cols-1 gap-5 mb-6 pb-6 border-b border-[#E5DCC5]">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#3E2723] mb-2">
                      <Mail size={16} />
                      Email for Receipt
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={`w-full rounded-xl px-4 py-3 border transition ${
                        errors.guest_email
                          ? "border-red-400 focus:ring-red-400"
                          : "border-[#E5DCC5] focus:ring-[#D4AF37]"
                      } focus:ring-2 bg-white focus:outline-none`}
                    />
                    {errors.guest_email && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <span>•</span> {errors.guest_email}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-6 pb-6 border-b border-[#E5DCC5]">
                  <p className="text-xs font-semibold text-[#7A6B50] uppercase tracking-wider mb-4">Your Saved Addresses</p>
                  <div className="space-y-3">
                    {savedAddresses.map((addr) => {
                      const active = Number(selectedAddressId) === Number(addr.id);
                      return (
                        <button
                          key={addr.id}
                          onClick={() => onSelectSavedAddress(addr.id)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition duration-200 ${
                            active
                              ? "border-[#D4AF37] bg-gradient-to-r from-[#FFF8EA] to-white shadow-md"
                              : "border-[#E5DCC5] bg-white hover:border-[#D4AF37]/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              active ? "border-[#D4AF37] bg-[#D4AF37]" : "border-[#D4AF37]/40"
                            }`}>
                              {active && <CheckCircle2 size={20} className="text-white -m-2.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[#3E2723]">{addr.full_name}</p>
                              <p className="text-sm text-[#7A6B50] mt-1">{addr.line1 || addr.address_line_1}</p>
                              {(addr.line2 || addr.address_line_2) && (
                                <p className="text-xs text-[#999] mt-1">{addr.line2 || addr.address_line_2}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Address Form */}
              <div>
                {savedAddresses.length > 0 && !selectedAddressId && (
                  <button
                    onClick={() => {
                      setSelectedAddressId(null);
                      setAddress(INITIAL_ADDRESS);
                      setErrors({});
                    }}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#D4AF37] bg-white hover:bg-[#FFF9F0] text-[#D4AF37] font-semibold flex items-center justify-center gap-2 transition duration-200 mb-4"
                  >
                    <span className="text-xl">+</span>
                    Add New Address
                  </button>
                )}
                <p className="text-xs font-semibold text-[#7A6B50] uppercase tracking-wider mb-4">
                  {savedAddresses.length > 0 ? "Or Enter New Address" : "Enter Delivery Address"}
                </p>
                <AddressForm
                  values={address}
                  errors={errors}
                  onChange={onAddressChange}
                />
              </div>
            </LuxuryCard>

            {/* Payment Method Card */}
            <LuxuryCard 
              step="2" 
              title="Payment Method"
              icon={<Lock size={20} />}
              description="Choose how you'd like to pay"
            >
              <PaymentMethodSelector
                value={checkout.paymentMethod}
                onChange={(method) => {
                  setPaymentMethod(method);
                }}
              />
            </LuxuryCard>

            {/* Place Order Button */}
            <button
              onClick={onPlaceOrder}
              disabled={placeOrderDisabled}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                placeOrderDisabled
                  ? "bg-gradient-to-r from-[#D8C9A5] to-[#C9B896] text-white/70 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#D4AF37] via-[#E6C35C] to-[#C19B2C] text-white shadow-lg hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
              }`}
            >
              {checkout.isPlacingOrder ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Place Secure Order
                </>
              )}
            </button>
          </section>

          {/* RIGHT SIDE - ORDER SUMMARY */}
          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="bg-gradient-to-br from-white to-[#FFF8F0] rounded-2xl p-7 shadow-xl border border-[#D4AF37]/20">
              <h3 className="text-lg font-bold text-[#2C1F1B] mb-6 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-[#D4AF37]" />
                Order Summary
              </h3>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#3E2723] mb-2">
          <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>
          Full Name
        </label>
        <input
          type="text"
          value={values.full_name}
          onChange={(e) => onChange("full_name", e.target.value)}
          className={`w-full rounded-xl px-4 py-3 border transition ${
            errors.full_name
              ? "border-red-400 focus:ring-red-400"
              : "border-[#E5DCC5] focus:ring-[#D4AF37]"
          } focus:ring-2 bg-white focus:outline-none`}
          placeholder="Your full name"
        />
        {errors.full_name && (
          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
            <span>•</span> {errors.full_name}
          </p>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#3E2723] mb-2">
          <Phone size={14} className="text-[#D4AF37]" />
          Phone Number
        </label>
        <input
          type="tel"
          value={values.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          className={`w-full rounded-xl px-4 py-3 border transition ${
            errors.phone
              ? "border-red-400 focus:ring-red-400"
              : "border-[#E5DCC5] focus:ring-[#D4AF37]"
          } focus:ring-2 bg-white focus:outline-none`}
          placeholder="+971 50 XXX XXXX"
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
            <span>•</span> {errors.phone}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-[#3E2723] mb-2">
          <MapPin size={14} className="text-[#D4AF37]" />
          Address Line 1
        </label>
        <input
          type="text"
          value={values.address_line_1}
          onChange={(e) => onChange("address_line_1", e.target.value)}
          className={`w-full rounded-xl px-4 py-3 border transition ${
            errors.address_line_1
              ? "border-red-400 focus:ring-red-400"
              : "border-[#E5DCC5] focus:ring-[#D4AF37]"
          } focus:ring-2 bg-white focus:outline-none`}
          placeholder="Street address"
        />
        {errors.address_line_1 && (
          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
            <span>•</span> {errors.address_line_1}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-semibold text-[#3E2723] mb-2 block">
          Apartment, Suite, Floor (Optional)
        </label>
        <input
          type="text"
          value={values.address_line_2}
          onChange={(e) => onChange("address_line_2", e.target.value)}
          className="w-full rounded-xl px-4 py-3 border border-[#E5DCC5] focus:ring-[#D4AF37] focus:ring-2 bg-white focus:outline-none transition"
          placeholder="Apartment, suite, floor, building name, etc."
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#3E2723] mb-2">
          <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>
          City
        </label>
        <input
          type="text"
          value={values.city}
          onChange={(e) => onChange("city", e.target.value)}
          className={`w-full rounded-xl px-4 py-3 border transition ${
            errors.city
              ? "border-red-400 focus:ring-red-400"
              : "border-[#E5DCC5] focus:ring-[#D4AF37]"
          } focus:ring-2 bg-white focus:outline-none`}
          placeholder="City"
        />
        {errors.city && (
          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
            <span>•</span> {errors.city}
          </p>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#3E2723] mb-2">
          <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>
          Emirate
        </label>
        <select
          value={values.emirate}
          onChange={(e) => onChange("emirate", e.target.value)}
          className={`w-full rounded-xl px-4 py-3 border transition focus:outline-none ${
            errors.emirate
              ? "border-red-400 focus:ring-red-400"
              : "border-[#E5DCC5] focus:ring-[#D4AF37]"
          } focus:ring-2 bg-white`}
        >
          <option value="">Select Emirate</option>
          {UAE_EMIRATES.map((em) => (
            <option key={em} value={em}>
              {em}
            </option>
          ))}
        </select>
        {errors.emirate && (
          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
            <span>•</span> {errors.emirate}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-semibold text-[#3E2723] mb-2 block">Country</label>
        <div className="relative">
          <input
            value="United Arab Emirates"
            disabled
            className="w-full rounded-xl px-4 py-3 text-[#7A6B50] border border-[#E5DCC5] bg-gradient-to-r from-[#F8F5EC] to-[#FFF8F0] cursor-not-allowed"
          />
          <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, error, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl px-4 py-3 border transition ${
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-[#E5DCC5] focus:ring-[#D4AF37]"
        } focus:ring-2 bg-white focus:outline-none`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

function LuxuryCard({ step, title, children, icon, description }) {
  return (
    <div className="bg-gradient-to-br from-white to-[#FFF8F0] rounded-2xl border border-[#E5DCC5] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="px-6 lg:px-8 py-5 border-b border-[#E5DCC5] bg-gradient-to-r from-[#FFFDF8] to-[#FFF8F0]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C19B2C] text-white flex items-center justify-center text-sm font-bold shadow-lg">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#2C1F1B] flex items-center gap-2">
              {icon && <span className="text-[#D4AF37]">{icon}</span>}
              {title}
            </h3>
            {description && <p className="text-xs text-[#7A6B50] mt-1">{description}</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}