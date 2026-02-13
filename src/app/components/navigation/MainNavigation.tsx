import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Menu,
  ChevronDown,
  User,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ApiCategoryNode } from "@/app/api/categories/categories.api-model";

import { useApp } from "@/app/contexts/AppContext";
import { useCart } from "@/app/contexts/CartContext";
import { useWishlist } from "@/app/contexts/WishlistContext";
import { useCategories } from "@/store/categoryStore";

import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";

const LOGO_URL =
  "https://i.postimg.cc/PqTfCmLW/Whats-App-Image-2026-02-03-at-12-22-57-PM-Nero-AI-Background-Remover-transparent.png";

export function MainNavigation() {
  const { isRTL, currency, setCurrency } = useApp();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { categories, status } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const categoryParam = params.get("category");

  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  // ✅ Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ Search
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // ✅ HEADER FULL HEIGHT
  const headerWrapRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const el = headerWrapRef.current;
    if (!el) return;

    const update = () => {
      setHeaderHeight(Math.round(el.getBoundingClientRect().height));
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const el = headerWrapRef.current;
      if (!el) return;
      setHeaderHeight(Math.round(el.getBoundingClientRect().height));
    }, 320);
    return () => clearTimeout(t);
  }, [isMobileSearchOpen]);

  const menuItems = useMemo(() => categories, [categories]);

  const goCategory = (cat: ApiCategoryNode) => {
    navigate(`/shop?category=${cat.id}`);
  };

  const goSubcategory = (parent: ApiCategoryNode, subId: number) => {
    navigate(`/shop?category=${subId}`);
  };

  return (
    <>
      {/* ✅ CRAZY PREMIUM HEADER WRAP */}
      <header
        ref={headerWrapRef}
        dir={isRTL ? "rtl" : "ltr"}
        className="sticky top-0 z-50"
      >
        {/* ✅ Top Glow Strip */}
        <div className="h-[2.5px] lg:h-[3px] w-full bg-gradient-to-r from-[#D4AF37] via-[#F1D08B] to-[#D4AF37]" />

        {/* ✅ Brand Bar (BIG logo + text + icons) */}
        <div className="bg-gradient-to-b from-[#FFF7EB] to-white">
          <div className="max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-10">
            <div className="relative flex items-center justify-between py-3 sm:py-5 lg:py-8">
              {/* LEFT: Mobile Menu */}
              <div className="flex items-center gap-2">
                <button
                  className="lg:hidden rounded-full p-2 active:scale-95 transition"
                  onClick={() => {
                    setIsMobileMenuOpen(true);
                    setIsMobileSearchOpen(false);
                  }}
                  aria-label="Open menu"
                >
                  <Menu className="w-4 h-4 sm:w-7 sm:h-7 text-[#3E2723]" />
                </button>

                {/* Mobile Search (Left) */}
                <button
                  className="lg:hidden rounded-full p-1 sm:p-2 active:scale-95 transition"
                  onClick={() => {
                    setIsMobileSearchOpen((p) => !p);
                    setIsMobileMenuOpen(false);
                  }}
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 sm:w-7 sm:h-7 text-[#3E2723]" />
                </button>

                {/* Desktop Search (Left) */}
                <div className="hidden lg:flex items-center">
                  <div className="relative w-[320px] xl:w-[420px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 text-[#D4AF37]" />
                    <input
                      type="text"
                      placeholder="Search luxury beauty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="
                        w-full pl-16 pr-6 py-4
                        rounded-full
                        border border-[#D4AF37]/25
                        bg-white/85
                        backdrop-blur
                        shadow-[0_10px_30px_rgba(212,175,55,0.12)]
                        focus:outline-none focus:border-[#D4AF37]
                        text-lg
                        transition
                      "
                    />
                  </div>
                </div>
              </div>

              {/* CENTER: BIG LOGO + BRAND TEXT */}
              <div className="absolute left-1/2 -translate-x-1/2">
                <Link
                  to="/"
                  aria-label="Home"
                  className="group flex items-center gap-2 sm:gap-3"
                >
                  {/* Logo */}
                  <img
                    src={LOGO_URL}
                    alt="Just Gold"
                    className="
                      object-contain
                      w-[78px] h-[38px]
                      sm:w-[110px] sm:h-[52px]
                      md:w-[100px] md:h-[45px]
                      lg:w-[160px] lg:h-[70px]
                      xl:w-[180px] xl:h-[100px]
                      drop-shadow-[0_0_20px_rgba(212,175,55,0.35)]
                      group-hover:scale-[1.05]
                      transition-transform duration-300
                    "
                  />

                  {/* Brand Text (HIDDEN on tiny mobile only) */}
      
                </Link>
              </div>

              {/* RIGHT: Icons + Currency */}
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
                {/* Currency */}
                <div className="flex items-center">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="
                      bg-white/70 backdrop-blur
                      border border-[#D4AF37]/20
                      text-[#3E2723]
                      font-semibold
                      rounded-full px-2 py-1 sm:px-3 sm:py-2
                      hover:border-[#D4AF37]/60
                      transition
                      cursor-pointer outline-none
                      text-[10px] sm:text-sm lg:text-base
                    "
                  >
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="KWD">KWD</option>
                  </select>
                </div>

                {/* Account Icon - Hidden on mobile */}
                <div className="hidden sm:block">
                  <IconLink to="/account" label="Account">
                    <User className="w-7 h-7 lg:w-9 lg:h-9" />
                  </IconLink>
                </div>

                <IconLink to="/wishlist" label="Wishlist" badge={wishlistCount}>
                  <Heart className="w-4 h-4 sm:w-7 sm:h-7 lg:w-9 lg:h-9" />
                </IconLink>

                <IconLink to="/cart" label="Cart" badge={cartCount}>
                  <ShoppingCart className="w-4 h-4 sm:w-7 sm:h-7 lg:w-9 lg:h-9" />
                </IconLink>

              </div>
            </div>

            {/* ✅ Mobile Search Dropdown */}
            <div
              className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
                isMobileSearchOpen ? "max-h-20 opacity-100 pb-2" : "max-h-0 opacity-0"
              }`}
            >
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="
                      w-full pl-10 pr-3 py-2.5 rounded-full
                      border border-[#D4AF37]/25
                      bg-white/85
                      text-sm
                      focus:outline-none focus:border-[#D4AF37]
                      transition
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Main Menu Bar (Desktop mega categories) */}
        <nav className="bg-white/90 backdrop-blur border-b border-[#D4AF37]/15 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hidden lg:block">
          <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-10">
            <div className="md:h-[65px] lg:h-[70px] xl:h-[85px] h-[85px] flex items-center justify-center">
              {/* Desktop Menu Items */}
              <div className="hidden lg:flex items-center gap-6 md:gap-7 lg:gap-8 xl:gap-12">
                {status === 'loading' && menuItems.length === 0 ? (
                  <div className="flex gap-4">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="w-20 h-4 rounded-full bg-[#D4AF37]/20 animate-pulse" />
                    ))}
                  </div>
                ) : null}

                {menuItems.map((item) => {
                  const isActive =
                    location.pathname === "/shop" &&
                    (categoryParam === String(item.id) ||
                      item.subcategories?.some((s) => String(s.id) === categoryParam));

                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => {
                        if (closeTimerRef.current) {
                          window.clearTimeout(closeTimerRef.current);
                          closeTimerRef.current = null;
                        }
                        if (item.subcategories && item.subcategories.length > 0) {
                          setActiveMenu(item.id);
                        }
                      }}
                      onMouseLeave={() => {
                        if (!item.subcategories || item.subcategories.length === 0) return;
                        if (closeTimerRef.current) {
                          window.clearTimeout(closeTimerRef.current);
                        }
                        closeTimerRef.current = window.setTimeout(() => {
                          setActiveMenu(null);
                        }, 200);
                      }}
                    >
                      <button
                        onClick={() => {
                          if (item.subcategories && item.subcategories.length > 0) {
                            goCategory(item);
                          } else {
                            goCategory(item);
                            setActiveMenu(null);
                          }
                        }}
                        className={`
                          relative flex items-center gap-1
                          font-bold tracking-wide md:text-sm lg:text-sm xl:text-lg
                          transition
                          py-3.5
                          group
                          ${isActive ? "text-[#D4AF37]" : "text-[#3E2723] hover:text-[#D4AF37]"}
                        `}
                      >
                        <span className="relative">
                          {item.name}
                        </span>

                        {item.subcategories && item.subcategories.length > 0 && (
                          <ChevronDown className="w-4 h-4 opacity-80" />
                        )}

                        {/* Crazy underline */}
                        <span
                          className={`
                            absolute -bottom-[8px] left-1/2 -translate-x-1/2
                            h-[3px]
                            bg-gradient-to-r from-[#D4AF37] via-[#F1D08B] to-[#D4AF37]
                            rounded-full
                            transition-all duration-300
                            ${isActive ? "w-full" : "w-0 group-hover:w-full"}
                          `}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mega Menu */}
          {activeMenu !== null && (
            <MegaMenu
              category={menuItems.find((c) => c.id === activeMenu) as ApiCategoryNode}
              onSelectCategory={goCategory}
              onSelectSubcategory={goSubcategory}
              onClose={() => setActiveMenu(null)}
              onMouseEnter={() => {
                if (closeTimerRef.current) {
                  window.clearTimeout(closeTimerRef.current);
                  closeTimerRef.current = null;
                }
              }}
              onMouseLeave={() => {
                if (closeTimerRef.current) {
                  window.clearTimeout(closeTimerRef.current);
                }
                closeTimerRef.current = window.setTimeout(() => {
                  setActiveMenu(null);
                }, 200);
              }}
            />
          )}
        </nav>
      </header>

      {/* ✅ Mobile Drawer offset under FULL header */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        headerOffset={headerHeight}
      />
    </>
  );
}

/* ✅ IconLink (kept your badges + improved premium style) */
function IconLink({
  to,
  children,
  badge,
  label,
}: {
  to: string;
  children: React.ReactNode;
  badge?: number;
  label: string;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="
        relative
        inline-flex items-center justify-center
        rounded-full
        p-1.5 sm:p-2.5 lg:p-3
        text-[#3E2723]
        transition-all duration-300
        hover:bg-[#D4AF37]/15
        hover:shadow-[0_0_12px_rgba(212,175,55,0.3)]
        hover:scale-[1.05]
        active:scale-98
      "
    >
      {children}

      {typeof badge === "number" && badge > 0 && (
        <span
          className="
            absolute top-0 right-0
            translate-x-1/3 -translate-y-1/3
            bg-[#D4AF37] text-white
            text-[9px] sm:text-[11px] lg:text-sm font-bold
            min-w-[16px] h-[16px]
            sm:min-w-[20px] sm:h-[20px]
            lg:min-w-[26px] lg:h-[26px]
            px-1 sm:px-1.5 rounded-full
            flex items-center justify-center
            shadow-[0_8px_16px_rgba(212,175,55,0.35)]
          "
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
