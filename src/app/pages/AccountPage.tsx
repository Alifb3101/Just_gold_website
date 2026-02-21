import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, LogOut, Mail, MapPin, Package, Phone, ShieldCheck, ShoppingBag, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { useWishlist } from "@/app/contexts/WishlistContext";
import { useCart } from "@/app/contexts/CartContext";
import { listAddresses, setDefaultAddress, deleteAddress, createAddress, type Address, type CreateAddressInput } from "@/services/addressService";
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
  const [addressForm, setAddressForm] = React.useState<CreateAddressInput>({
    label: "Home",
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  const updateForm = (key: keyof CreateAddressInput, value: string) => {
    setAddressForm(prev => ({ ...prev, [key]: value }));
  };

  const loadAddresses = React.useCallback(async () => {
    if (!token) return;
    setIsLoadingAddresses(true);
    try {
      const res = await listAddresses(token);
      setAddresses(res ?? []);
    } catch (err) {
      const unauthorized = err instanceof ApiError && err.status === 401;
      const notFound = err instanceof ApiError && err.status === 404;
      if (unauthorized) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (notFound) {
        toast.error("Address not found");
      } else {
        toast.error((err as Error)?.message || "Unable to load addresses");
      }
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [token, logout, navigate]);

  React.useEffect(() => {
    if (isAuthReady && token) {
      loadAddresses();
    }
  }, [isAuthReady, token, loadAddresses]);

  const handleSetDefault = async (id: number) => {
    if (!token) return;
    try {
      await setDefaultAddress(token, id);
      toast.success("Default address updated");
      await loadAddresses();
    } catch (err) {
      const unauthorized = err instanceof ApiError && err.status === 401;
      const notFound = err instanceof ApiError && err.status === 404;
      if (unauthorized) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (notFound) toast.error("Address not found"); else toast.error((err as Error)?.message || "Unable to set default");
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await deleteAddress(token, id);
      toast.success("Address removed");
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      const unauthorized = err instanceof ApiError && err.status === 401;
      const notFound = err instanceof ApiError && err.status === 404;
      if (unauthorized) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (notFound) toast.error("Address not found"); else toast.error((err as Error)?.message || "Unable to delete address");
    }
  };

  const handleCreate = async () => {
    if (!token) return;
    if (!addressForm.full_name || !addressForm.phone || !addressForm.line1) {
      toast.error("Full name, phone, and address line 1 are required");
      return;
    }
    setIsSubmittingAddress(true);
    try {
      const created = await createAddress(token, addressForm);
      toast.success("Address added");
      setAddresses(prev => [created, ...prev]);
      setIsAdding(false);
      setAddressForm({
        label: "Home",
        full_name: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
      });
    } catch (err) {
      const unauthorized = err instanceof ApiError && err.status === 401;
      if (unauthorized) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      toast.error((err as Error)?.message || "Unable to add address");
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0] text-[#3E2723]">
        <span>Loading your account...</span>
      </div>
    );
  }

  const displayName = user?.name?.trim() || name?.trim() || "Beauty Insider";
  const displayEmail = user?.email || email || "Not provided";
  const displayPhone = (user?.phone ?? phone) || "Add a phone number";

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  const quickLinks = [
    {
      label: "Wishlist",
      value: `${wishlistItems.length} item${wishlistItems.length === 1 ? "" : "s"}`,
      icon: Heart,
      to: "/wishlist",
      accent: "bg-[#D4AF37]/10 text-[#D4AF37]",
    },
    {
      label: "Shopping Bag",
      value: `${cartItems.length} item${cartItems.length === 1 ? "" : "s"}`,
      icon: ShoppingBag,
      to: "/cart",
      accent: "bg-[#3E2723]/10 text-[#3E2723]",
    },
    {
      label: "Orders",
      value: "Tracking soon",
      icon: Package,
      to: "/shop",
      accent: "bg-[#B08938]/10 text-[#B08938]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#B08938]">Account</p>
            <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#3E2723]">Your profile</h1>
            <p className="text-sm text-[#6B4A3A]">Manage your details, favorites, and preferences.</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-[#3E2723] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#2c1f1b] transition"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(62,39,35,0.08)] border border-[#D4AF37]/20">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F1D08B] text-[#3E2723] font-bold flex items-center justify-center uppercase">
                {displayName.slice(0, 1)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 text-sm text-[#B08938]">
                  <ShieldCheck className="w-4 h-4" />
                  Secure area
                </div>
                <h2 className="text-2xl font-semibold text-[#3E2723]">{displayName}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-sm text-[#6B4A3A]">
                  <span className="inline-flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                    {displayEmail}
                  </span>
                  <span className="inline-flex items-center gap-2 mt-1 sm:mt-0">
                    <Phone className="w-4 h-4 text-[#D4AF37]" />
                    {displayPhone}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#FFF6E5] border border-[#F1D08B]">
                <p className="text-xs uppercase tracking-wide text-[#B08938]">Wishlist</p>
                <p className="text-2xl font-semibold text-[#3E2723] mt-1">{wishlistItems.length}</p>
                <p className="text-xs text-[#6B4A3A]">Saved favorites</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E5D8C2]">
                <p className="text-xs uppercase tracking-wide text-[#B08938]">Bag</p>
                <p className="text-2xl font-semibold text-[#3E2723] mt-1">{cartItems.length}</p>
                <p className="text-xs text-[#6B4A3A]">Items ready to checkout</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E5D8C2]">
                <p className="text-xs uppercase tracking-wide text-[#B08938]">Subtotal</p>
                <p className="text-2xl font-semibold text-[#3E2723] mt-1">${subtotal.toFixed(2)}</p>
                <p className="text-xs text-[#6B4A3A]">Before shipping and taxes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(62,39,35,0.08)] border border-[#D4AF37]/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#B08938]">Shortcuts</p>
                <h3 className="text-lg font-semibold text-[#3E2723]">Quick actions</h3>
              </div>
              <User className="w-5 h-5 text-[#D4AF37]" />
            </div>

            <div className="space-y-3">
              {quickLinks.map(({ label, value, icon: Icon, to, accent }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center justify-between rounded-xl border border-[#E5D8C2] bg-[#FFFBF3] px-4 py-3 hover:border-[#D4AF37] transition"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#3E2723]">{label}</p>
                      <p className="text-xs text-[#6B4A3A]">{value}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#B08938]">Open</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(62,39,35,0.08)] border border-[#D4AF37]/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#B08938] text-sm font-semibold">
                <MapPin className="w-4 h-4" />
                Addresses
              </div>
              <button
                onClick={() => setIsAdding(prev => !prev)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#3E2723] px-4 py-2 rounded-lg border border-[#E5D8C2] hover:border-[#D4AF37] hover:bg-[#FFF6E5] transition"
              >
                {isAdding ? "Close" : "Add address"}
              </button>
            </div>

            {isAdding && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-[#E5D8C2] rounded-xl p-4 bg-[#FFFBF3]">
                <input
                  className="rounded-lg border border-[#E5D8C2] px-3 py-2 text-sm"
                  placeholder="Label (Home, Work)"
                  value={addressForm.label}
                  onChange={e => updateForm("label", e.target.value)}
                />
                <input
                  className="rounded-lg border border-[#E5D8C2] px-3 py-2 text-sm"
                  placeholder="Full name *"
                  value={addressForm.full_name}
                  onChange={e => updateForm("full_name", e.target.value)}
                />
                <input
                  className="rounded-lg border border-[#E5D8C2] px-3 py-2 text-sm"
                  placeholder="Phone *"
                  value={addressForm.phone}
                  onChange={e => updateForm("phone", e.target.value)}
                />
                <input
                  className="rounded-lg border border-[#E5D8C2] px-3 py-2 text-sm"
                  placeholder="Address line 1 *"
                  value={addressForm.line1}
                  onChange={e => updateForm("line1", e.target.value)}
                />
                <input
                  className="rounded-lg border border-[#E5D8C2] px-3 py-2 text-sm"
                  placeholder="Address line 2"
                  value={addressForm.line2}
                  onChange={e => updateForm("line2", e.target.value)}
                />
                <input
                  className="rounded-lg border border-[#E5D8C2] px-3 py-2 text-sm"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={e => updateForm("city", e.target.value)}
                />
                <input
                  className="rounded-lg border border-[#E5D8C2] px-3 py-2 text-sm"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={e => updateForm("state", e.target.value)}
                />
                <input
                  className="rounded-lg border border-[#E5D8C2] px-3 py-2 text-sm"
                  placeholder="Postal code"
                  value={addressForm.postal_code}
                  onChange={e => updateForm("postal_code", e.target.value)}
                />
                <input
                  className="rounded-lg border border-[#E5D8C2] px-3 py-2 text-sm"
                  placeholder="Country"
                  value={addressForm.country}
                  onChange={e => updateForm("country", e.target.value)}
                />
                <div className="md:col-span-2 flex items-center gap-3">
                  <button
                    onClick={handleCreate}
                    disabled={isSubmittingAddress}
                    className="px-4 py-2 rounded-lg bg-[#D4AF37] text-white font-semibold hover:bg-[#C4A037] disabled:opacity-60"
                  >
                    {isSubmittingAddress ? "Saving..." : "Save address"}
                  </button>
                  <p className="text-xs text-[#6B4A3A]">* Required</p>
                </div>
              </div>
            )}

            {isLoadingAddresses ? (
              <p className="text-sm text-[#6B4A3A]">Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <p className="text-sm text-[#6B4A3A]">No addresses yet. Add one to speed up checkout.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-xl border px-4 py-3 ${addr.is_default ? "border-[#D4AF37] bg-[#FFF9ED]" : "border-[#E5D8C2]"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 text-sm text-[#3E2723]">
                        <div className="flex items-center gap-2 font-semibold">
                          <span>{addr.label || "Address"}</span>
                          {addr.is_default && <span className="text-xs text-[#D4AF37] font-semibold">Default</span>}
                        </div>
                        <p className="text-[#6B4A3A]">{addr.full_name}</p>
                        <p className="text-[#6B4A3A]">{addr.phone}</p>
                        <p className="text-[#6B4A3A]">{addr.line1}</p>
                        {addr.line2 && <p className="text-[#6B4A3A]">{addr.line2}</p>}
                        <p className="text-[#6B4A3A]">{[addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ")}</p>
                        {addr.country && <p className="text-[#6B4A3A]">{addr.country}</p>}
                      </div>
                      <div className="flex flex-col gap-2 text-sm">
                        {!addr.is_default && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="px-3 py-1 rounded-lg border border-[#D4AF37] text-[#3E2723] hover:bg-[#FFF6E5]"
                          >
                            Set default
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(addr.id)}
                          className="px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
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

          <div className="bg-white rounded-2xl p-6 shadow-[0_20px_60px_rgba(62,39,35,0.08)] border border-[#D4AF37]/20 space-y-3">
            <div className="flex items-center gap-2 text-[#B08938] text-sm font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Security tips
            </div>
            <ul className="space-y-2 text-sm text-[#6B4A3A] list-disc list-inside">
              <li>Use a strong, unique password.</li>
              <li>Sign out on shared devices.</li>
              <li>Keep your contact details up to date.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
