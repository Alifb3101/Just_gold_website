import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Package,
  Plus,
  X,
  ChevronRight,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { useWishlist } from "@/app/contexts/WishlistContext";
import { useCart } from "@/app/contexts/CartContext";
import {
  listAddresses,
  setDefaultAddress,
  deleteAddress,
  createAddress,
  type Address,
  type CreateAddressInput,
} from "@/services/addressService";
import { ApiError } from "@/app/api/http";

export function AccountPage() {
  const { user, name, email, phone, token, isAuthReady, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { items: cartItems, subtotal } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = React.useState(false);

  const [addressForm, setAddressForm] =
    React.useState<CreateAddressInput & { emirate?: string }>({
      label: "Home",
      full_name: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      country: "United Arab Emirates",
      emirate: "",
    });

  const EMIRATES = [
    "Abu Dhabi",
    "Dubai",
    "Sharjah",
    "Ajman",
    "Umm Al Quwain",
    "Ras Al Khaimah",
    "Fujairah",
  ];

  const updateForm = (
    key: keyof (CreateAddressInput & { emirate?: string }),
    value: string
  ) => {
    setAddressForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadAddresses = React.useCallback(async () => {
    if (!token) return;
    setIsLoadingAddresses(true);
    try {
      const res = await listAddresses(token);
      setAddresses(res ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      toast.error("Unable to load addresses");
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [token, logout, navigate]);

  React.useEffect(() => {
    if (isAuthReady && token) loadAddresses();
  }, [isAuthReady, token, loadAddresses]);

  const handleSetDefault = async (id: number) => {
    if (!token) return;
    await setDefaultAddress(token, id);
    toast.success("Default address updated");
    loadAddresses();
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    await deleteAddress(token, id);
    toast.success("Address removed");
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCreate = async () => {
    if (!token) return;
    const { full_name, phone, line1, emirate } = addressForm;
    if (!full_name || !phone || !line1 || !emirate) {
      toast.error("Required fields missing");
      return;
    }
    setIsSubmittingAddress(true);
    try {
      const created = await createAddress(token, {
        ...addressForm,
        country: "United Arab Emirates",
      });
      setAddresses((prev) => [created, ...prev]);
      toast.success("Address added");
      setIsAdding(false);
    } catch {
      toast.error("Unable to add address");
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0]">
        <div className="animate-pulse text-[#3E2723] text-sm tracking-wide">
          Loading your account…
        </div>
      </div>
    );
  }

  const displayName = user?.name?.trim() || name?.trim() || "Beauty Insider";
  const displayEmail = user?.email || email || "Not provided";
  const displayPhone = user?.phone ?? phone ?? "Add phone number";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF8] via-[#FFF9F0] to-[#FDF6E9]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14 space-y-5 sm:space-y-7">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="hidden sm:block text-[10px] uppercase tracking-[0.3em] text-[#B08938] mb-1">
              Member Portal
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-['Playfair_Display'] text-[#2C1F1B] leading-tight">
              My Account
            </h1>
            <p className="text-sm text-[#6B4A3A] mt-1 sm:hidden">
              Manage your profile &amp; addresses.
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-[#2C1F1B] text-white text-sm font-medium hover:bg-[#3E2723] hover:shadow-lg active:scale-95 transition-all duration-200 flex-shrink-0"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-[#D4AF37]/20 overflow-hidden">
          {/* Gold accent bar */}
          <div className="h-1 bg-gradient-to-r from-[#D4AF37] via-[#F5D98F] to-[#D4AF37]" />

          <div className="p-5 sm:p-7 lg:p-8">
            {/* Identity row */}
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Avatar */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px] rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F5D98F] flex items-center justify-center text-[#2C1F1B] text-lg sm:text-xl font-bold shadow-md flex-shrink-0">
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                {/* Verified badge */}
                <div className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-widest text-[#B08938] mb-1">
                  <ShieldCheck size={11} />
                  Verified Member
                </div>

                {/* Name */}
                <h2 className="text-xl sm:text-2xl font-semibold font-['Playfair_Display'] text-[#2C1F1B] leading-tight truncate">
                  {displayName}
                </h2>

                {/* Contact — column on mobile, row on sm */}
                <div className="mt-2.5 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1">
                  <span className="flex items-center gap-2 text-xs sm:text-sm text-[#6B4A3A] min-w-0">
                    <Mail size={12} className="text-[#D4AF37] flex-shrink-0" />
                    <span className="truncate">{displayEmail}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs sm:text-sm text-[#6B4A3A]">
                    <Phone size={12} className="text-[#D4AF37] flex-shrink-0" />
                    {displayPhone}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-5 sm:my-6 h-px bg-[#F0E8D8]" />

            {/* Stats — always 3 columns */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              <StatCard title="Wishlist" value={wishlistItems.length} />
              <StatCard title="Cart" value={cartItems.length} />
              <StatCard
                title="Subtotal"
                value={`AED ${subtotal.toFixed(0)}`}
                isHighlight
              />
            </div>
          </div>
        </div>

        {/* ── QUICK LINKS ── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-[#D4AF37]/20 p-5 sm:p-6 lg:p-7">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#B08938] font-medium mb-3 sm:mb-4">
            Quick Access
          </p>
          {/* Stack on mobile, 3-col grid on sm+ */}
          <div className="flex flex-col gap-2 sm:grid sm:grid-cols-3 sm:gap-3">
            <QuickLink to="/orders" icon={<Package size={16} />} label="My Orders" />
            <QuickLink to="/wishlist" icon={<Heart size={16} />} label="Wishlist" />
            <QuickLink to="/account" icon={<User size={16} />} label="Profile" />
          </div>
        </div>

        {/* ── ADDRESSES ── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-[#D4AF37]/20 overflow-hidden">

          {/* Section header */}
          <div className="flex items-center justify-between px-5 sm:px-7 lg:px-8 pt-5 sm:pt-7 lg:pt-8 pb-4 border-b border-[#F0E8D8]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#B08938] font-medium mb-0.5">
                Delivery
              </p>
              <h3 className="text-lg sm:text-xl font-semibold font-['Playfair_Display'] text-[#2C1F1B]">
                Saved Addresses
              </h3>
            </div>

            <button
              onClick={() => setIsAdding((p) => !p)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 flex-shrink-0 ${
                isAdding
                  ? "border border-[#2C1F1B] text-[#2C1F1B] hover:bg-[#F5EFE6]"
                  : "bg-[#2C1F1B] text-white hover:bg-[#3E2723] shadow-sm hover:shadow-md"
              }`}
            >
              {isAdding ? <X size={13} /> : <Plus size={13} />}
              {isAdding ? "Cancel" : "Add New"}
            </button>
          </div>

          <div className="px-5 sm:px-7 lg:px-8 pb-6 sm:pb-8">

            {/* ADD FORM */}
            {isAdding && (
              <div className="mt-5 sm:mt-6 bg-[#FFFBF3] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#EDE0C4] space-y-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#B08938] font-semibold">
                  New Address Details
                </p>

                {/* 1-col mobile → 2-col sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PremiumInput
                    placeholder="Full Name *"
                    value={addressForm.full_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateForm("full_name", e.target.value)
                    }
                  />
                  <PremiumInput
                    placeholder="Phone *"
                    value={addressForm.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateForm("phone", e.target.value)
                    }
                  />
                  <PremiumInput
                    placeholder="Address Line 1 *"
                    value={addressForm.line1}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateForm("line1", e.target.value)
                    }
                  />
                  <PremiumInput
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateForm("city", e.target.value)
                    }
                  />
                </div>

                <select
                  className="w-full border border-[#D4C4A8] rounded-xl px-4 py-3 text-sm bg-white text-[#2C1F1B] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all duration-200"
                  value={addressForm.emirate}
                  onChange={(e) => updateForm("emirate", e.target.value)}
                >
                  <option value="">Select Emirate *</option>
                  {EMIRATES.map((em) => (
                    <option key={em}>{em}</option>
                  ))}
                </select>

                <button
                  onClick={handleCreate}
                  disabled={isSubmittingAddress}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C9952A] text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmittingAddress ? "Saving…" : "Save Address"}
                </button>
              </div>
            )}

            {/* ADDRESS LIST */}
            {isLoadingAddresses ? (
              <div className="flex items-center justify-center gap-3 py-12 text-[#6B4A3A]">
                <div className="w-5 h-5 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
                <span className="text-sm">Loading addresses…</span>
              </div>
            ) : addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[#FFF0D8] flex items-center justify-center">
                  <MapPin size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2C1F1B]">No saved addresses yet.</p>
                  <p className="text-xs text-[#B08938] mt-0.5">Add your first address above.</p>
                </div>
              </div>
            ) : (
              /* 1-col mobile → 2-col md+ */
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    addr={addr}
                    onSetDefault={handleSetDefault}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════
   COMPONENTS
══════════════════════════════════ */

function StatCard({
  title,
  value,
  isHighlight,
}: {
  title: string;
  value: string | number;
  isHighlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 sm:p-4 text-center ${
        isHighlight
          ? "bg-gradient-to-br from-[#FFF9ED] to-[#FFF3D0] border border-[#D4AF37]/30"
          : "bg-[#FFFBF3] border border-[#EFE5D0]"
      }`}
    >
      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#B08938] font-medium mb-1 sm:mb-1.5 leading-none">
        {title}
      </p>
      <p className="text-base sm:text-xl lg:text-2xl font-bold text-[#2C1F1B] leading-none">
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between px-4 py-3.5 rounded-xl border border-[#EFE5D0] hover:border-[#D4AF37] hover:bg-[#FFFBF3] hover:shadow-sm active:scale-[0.98] transition-all duration-200"
    >
      <div className="flex items-center gap-3 text-[#6B4A3A] group-hover:text-[#2C1F1B] transition-colors duration-200">
        <span className="text-[#D4AF37]">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ChevronRight
        size={15}
        className="text-[#C4B09A] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all duration-200"
      />
    </Link>
  );
}

function AddressCard({
  addr,
  onSetDefault,
  onDelete,
}: {
  addr: Address;
  onSetDefault: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div
      className={`relative rounded-xl p-4 sm:p-5 border transition-all duration-200 ${
        addr.is_default
          ? "border-[#D4AF37]/50 bg-[#FFFBF3]"
          : "border-[#EFE5D0] bg-white hover:border-[#D4C090] hover:shadow-sm"
      }`}
    >
      {/* Default pill */}
      {addr.is_default && (
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-[#FFF3CC] border border-[#D4AF37]/40 rounded-full px-2 py-0.5">
          <CheckCircle2 size={10} className="text-[#D4AF37]" />
          <span className="text-[9px] uppercase tracking-wider text-[#A07830] font-semibold">
            Default
          </span>
        </div>
      )}

      {/* Label */}
      <p className="text-[10px] uppercase tracking-wider text-[#B08938] font-semibold mb-1.5 pr-16">
        {addr.label}
      </p>

      {/* Name + address */}
      <p className="text-sm font-semibold text-[#2C1F1B]">{addr.full_name}</p>
      <p className="text-xs text-[#6B4A3A] mt-0.5 leading-relaxed">{addr.line1}</p>

      {/* Action row */}
      <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-[#F0E8D8]">
        {!addr.is_default && (
          <button
            onClick={() => onSetDefault(addr.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#D4C090] text-[#6B4A3A] text-xs font-medium hover:bg-[#FFFBF3] hover:border-[#D4AF37] hover:text-[#2C1F1B] active:scale-[0.97] transition-all duration-200"
          >
            <CheckCircle2 size={12} />
            Set Default
          </button>
        )}
        <button
          onClick={() => onDelete(addr.id)}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-100 text-red-400 text-xs font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-500 active:scale-[0.97] transition-all duration-200 ${
            addr.is_default ? "flex-1" : "px-4"
          }`}
        >
          <Trash2 size={12} />
          {addr.is_default && <span>Remove</span>}
        </button>
      </div>
    </div>
  );
}

function PremiumInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border border-[#D4C4A8] rounded-xl px-4 py-3 text-sm bg-white text-[#2C1F1B] placeholder:text-[#B0957A] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all duration-200"
    />
  );
}
