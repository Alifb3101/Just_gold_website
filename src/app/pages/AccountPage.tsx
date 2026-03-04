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
        <div className="animate-pulse text-[#3E2723]">
          Loading your account...
        </div>
      </div>
    );
  }

  const displayName =
    user?.name?.trim() || name?.trim() || "Beauty Insider";
  const displayEmail = user?.email || email || "Not provided";
  const displayPhone = user?.phone ?? phone ?? "Add phone number";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF8] via-[#FFF9F0] to-[#FDF6E9]">

      {/* CONTAINER */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-['Playfair_Display'] text-[#2C1F1B]">
              My Account
            </h1>
            <p className="text-[#6B4A3A] mt-2">
              Manage your profile, addresses and activity.
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2C1F1B] text-white hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* PROFILE + QUICK LINKS */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* PROFILE CARD */}
          <div className="xl:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-[#D4AF37]/20">

            <div className="flex gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F5D98F] flex items-center justify-center text-[#2C1F1B] text-xl font-bold shadow-md">
                {displayName.charAt(0)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#B08938]">
                  <ShieldCheck size={14} />
                  Secure Profile
                </div>

                <h2 className="text-2xl font-semibold text-[#2C1F1B] mt-2">
                  {displayName}
                </h2>

                <div className="mt-4 flex flex-col sm:flex-row sm:gap-8 text-sm text-[#6B4A3A]">
                  <span className="flex items-center gap-2">
                    <Mail size={14} className="text-[#D4AF37]" />
                    {displayEmail}
                  </span>
                  <span className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Phone size={14} className="text-[#D4AF37]" />
                    {displayPhone}
                  </span>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard title="Wishlist" value={wishlistItems.length} />
              <StatCard title="Cart Items" value={cartItems.length} />
              <StatCard
                title="Subtotal"
                value={`AED ${subtotal.toFixed(2)}`}
              />
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#D4AF37]/20 space-y-4">
            <QuickLink to="/orders" icon={Package} label="Orders" />
            <QuickLink to="/wishlist" icon={Heart} label="Wishlist" />
            <QuickLink to="/account" icon={User} label="Profile" />
          </div>
        </div>

        {/* ADDRESS SECTION */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#D4AF37]/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-[#2C1F1B]">
              Saved Addresses
            </h3>

            <button
              onClick={() => setIsAdding((p) => !p)}
              className="px-5 py-2 rounded-xl border border-[#2C1F1B] hover:bg-[#2C1F1B] hover:text-white transition"
            >
              {isAdding ? "Close" : "Add Address"}
            </button>
          </div>

          {isAdding && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm("phone", e.target.value)}
              />
              <PremiumInput
                placeholder="Address Line 1 *"
                value={addressForm.line1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm("line1", e.target.value)}
              />
              <PremiumInput
                placeholder="City"
                value={addressForm.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateForm("city", e.target.value)}
              />

              <select
                className="col-span-1 md:col-span-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#D4AF37]"
                value={addressForm.emirate}
                onChange={(e) =>
                  updateForm("emirate", e.target.value)
                }
              >
                <option value="">Select Emirate *</option>
                {EMIRATES.map((em) => (
                  <option key={em}>{em}</option>
                ))}
              </select>

              <button
                onClick={handleCreate}
                disabled={isSubmittingAddress}
                className="col-span-1 md:col-span-2 bg-[#D4AF37] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
              >
                {isSubmittingAddress ? "Saving..." : "Save Address"}
              </button>
            </div>
          )}

          {isLoadingAddresses ? (
            <div className="text-[#6B4A3A]">Loading...</div>
          ) : addresses.length === 0 ? (
            <div className="text-[#6B4A3A]">
              No addresses added yet.
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-6 rounded-2xl border ${
                    addr.is_default
                      ? "border-[#D4AF37] bg-[#FFF9ED]"
                      : "border-[#E5D8C2]"
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">
                        {addr.label}
                        {addr.is_default && (
                          <span className="ml-3 text-xs text-[#B08938]">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[#6B4A3A]">
                        {addr.full_name}
                      </div>
                      <div className="text-sm text-[#6B4A3A]">
                        {addr.line1}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!addr.is_default && (
                        <button
                          onClick={() =>
                            handleSetDefault(addr.id)
                          }
                          className="text-sm border px-3 py-1 rounded-lg"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDelete(addr.id)
                        }
                        className="text-sm text-red-600 border border-red-300 px-3 py-1 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function StatCard({ title, value }: any) {
  return (
    <div className="p-6 rounded-2xl border border-[#E5D8C2] bg-[#FFFBF3]">
      <p className="text-xs uppercase tracking-widest text-[#B08938]">
        {title}
      </p>
      <p className="text-2xl font-bold text-[#2C1F1B] mt-2">
        {value}
      </p>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }: any) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition"
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-xs text-[#B08938]">Open →</span>
    </Link>
  );
}

function PremiumInput(props: any) {
  return (
    <input
      {...props}
      className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#D4AF37] outline-none"
    />
  );
}