import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Menu,
  ChevronDown,
  MapPin,
  User,
  Heart,
  X,
  ShoppingCart,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ApiCategoryNode } from "@/app/api/categories/categories.api-model";

import { useApp } from "@/app/contexts/AppContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { useCart } from "@/app/contexts/CartContext";
import { useWishlist } from "@/app/contexts/WishlistContext";
import { useCategories } from "@/store/categoryStore";
import { fetchSearchSuggestions, fetchTrendingSearches } from "@/services/searchService";
import { getProducts } from "@/services/productService";

import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import StorePortal from "../home/store_reveal";

const LOGO_URL =
  "https://i.postimg.cc/PqTfCmLW/Whats-App-Image-2026-02-03-at-12-22-57-PM-Nero-AI-Background-Remover-transparent.png";

export function MainNavigation() {
  const { isRTL, currency, setCurrency } = useApp();
  const { isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { categories, status } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const categoryParam = params.get("category");
  const searchParam = params.get("search") ?? "";

  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  // ✅ Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ Search
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; slug: string; thumbnail?: string | null }>>([]);
  const [trending, setTrending] = useState<Array<{ query: string; search_count: number }>>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isStorePortalOpen, setIsStorePortalOpen] = useState(false);
  const suggestionAbortRef = useRef<AbortController | null>(null);
  const suggestionNavigateAbortRef = useRef<AbortController | null>(null);
  const trendingLoadedRef = useRef(false);
  const debounceRef = useRef<number | null>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ HEADER FULL HEIGHT
  const headerWrapRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // ✅ Hide-on-scroll behavior
  const [isNavHidden, setIsNavHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

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

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  // ✅ Hide nav when scrolling down, show when scrolling up or near top
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const delta = currentY - lastScrollYRef.current;
          if (currentY > 120 && delta > 6) {
            setIsNavHidden(true);
          } else if (delta < -6 || currentY <= 120) {
            setIsNavHidden(false);
          }
          lastScrollYRef.current = currentY;
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);











  
  const closeMobileSearchUI = () => {
    setIsMobileSearchOpen(false);
    setIsSuggestOpen(false);
    mobileSearchInputRef.current?.blur();
  };

  const handleSearchNavigate = (query: string) => {
    const trimmed = query.trim();
    const nextParams = new URLSearchParams(location.search);
    if (trimmed) {
      nextParams.set("search", trimmed);
    } else {
      nextParams.delete("search");
    }
    navigate(`/shop${nextParams.toString() ? `?${nextParams.toString()}` : ""}`);
    setIsSuggestOpen(false);
    if (isMobileSearchOpen) closeMobileSearchUI();
  };

  const loadSuggestions = (value: string) => {
    const trimmed = value.trim();
    suggestionAbortRef.current?.abort();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSuggestionsLoading(false);
      setIsSuggestOpen(false);
      return;
    }
    setIsSuggestionsLoading(true);
    const controller = new AbortController();
    suggestionAbortRef.current = controller;
    fetchSearchSuggestions(trimmed, controller.signal)
      .then((data) => {
        setSuggestions(data.slice(0, 8));
        setIsSuggestOpen(true);
      })
      .catch((err) => {
        if ((err as any)?.name === "AbortError") return;
        console.error('[search] suggestions failed', err);
      })
      .finally(() => {
        setIsSuggestionsLoading(false);
      });
  };

  const handleSuggestionClick = async (slug: string) => {
    suggestionNavigateAbortRef.current?.abort();
    const controller = new AbortController();
    suggestionNavigateAbortRef.current = controller;
    try {
      console.debug('[search] suggestion navigate lookup', slug);
      const page = await getProducts(
        {
          category: null,
          search: slug,
          minPrice: null,
          maxPrice: null,
          color: null,
          size: null,
          sort: 'newest',
          cursor: null,
        },
        controller.signal
      );
      const hit = page.products.find((p) => p.slug === slug) ?? page.products[0];
      if (hit) {
        navigate(`/product/${hit.id}-${hit.slug}`);
        setIsSuggestOpen(false);
        if (isMobileSearchOpen) closeMobileSearchUI();
        return;
      }
      navigate(`/shop?search=${encodeURIComponent(slug)}`);
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
      console.error('[search] suggestion navigate failed', err);
      navigate(`/shop?search=${encodeURIComponent(slug)}`);
    }
    if (isMobileSearchOpen) closeMobileSearchUI();
  };

  const closeSuggestions = () => {
    setIsSuggestOpen(false);
  };

  const handleFocus = () => {
    if (!searchQuery.trim() && !trendingLoadedRef.current) {
      const controller = new AbortController();
      fetchTrendingSearches(controller.signal)
        .then((data) => {
          setTrending(data);
          trendingLoadedRef.current = true;
          setIsSuggestOpen(true);
        })
        .catch((err) => {
          if ((err as any)?.name === "AbortError") return;
          console.error('[search] trending failed', err);
        });
    } else if (!searchQuery.trim() && trendingLoadedRef.current && trending.length > 0) {
      setIsSuggestOpen(true);
    } else if (searchQuery.trim().length >= 2) {
      setIsSuggestOpen(true);
    }
  };

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => loadSuggestions(searchQuery), 280);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      suggestionAbortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const menuItems = useMemo(() => categories, [categories]);

  const goCategory = (cat: ApiCategoryNode) => {
    navigate(`/shop?category=${cat.id}`);
  };

  const goSubcategory = (parent: ApiCategoryNode, subId: number) => {
    navigate(`/shop?category=${subId}`);
  };

  const smallNavStyles = `
    @media (max-width: 300px) {
      .nav-root .nav-bar { padding-top: 10px; padding-bottom: 10px; }
      .nav-root .nav-btn { padding: 10px; }
      .nav-root .nav-icon { width: 20px; height: 20px; }
      .nav-root .nav-logo { width: 68px; height: 32px; }
      .nav-root .nav-search-input {
        padding-top: 10px;
        padding-bottom: 10px;
        padding-left: 36px;
        font-size: 13px;
      }
      .nav-root .nav-popup { left: 8px !important; right: 8px !important; }
    }
  `;

  const mobilePopupTop = Math.max(headerHeight + 8, 64);

  return (
    <>
      {/* ✅ CRAZY PREMIUM HEADER WRAP */}
      <style dangerouslySetInnerHTML={{ __html: smallNavStyles }} />

      <header
        ref={headerWrapRef}
        dir={isRTL ? "rtl" : "ltr"}
        className={`sticky top-0 z-50 nav-root transition-transform duration-300 ease-out ${
          isNavHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        {/* ✅ Top Glow Strip */}
        <div className="h-[2.5px] lg:h-[3px] w-full bg-gradient-to-r from-[#D4AF37] via-[#F1D08B] to-[#D4AF37]" />

        {/* ✅ Brand Bar (BIG logo + text + icons) */}
        <div className="bg-gradient-to-b from-[#FFF7EB] to-white">
          <div className="max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-10 nav-bar">
            <div className="relative flex items-center justify-between py-4 sm:py-5 lg:py-8">
              {/* LEFT: Mobile Menu */}
              <div className="flex items-center gap-2">
                <button
                  className="lg:hidden rounded-full p-3 active:scale-95 transition nav-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(true);
                    setIsMobileSearchOpen(false);
                  }}
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-6 sm:w-8 sm:h-8 nav-icon text-[#3E2723]" />
                </button>

                {/* Mobile Search (Left) */}
                <button
                  className="lg:hidden rounded-full p-2.5 sm:p-3 active:scale-95 transition nav-btn"
                  onClick={() => {
                    setIsMobileSearchOpen((p) => !p);
                    setIsMobileMenuOpen(false);
                  }}
                  aria-label="Search"
                >
                  <Search className="w-5 h-6 sm:w-8 sm:h-8 nav-icon text-[#3E2723]" />
                </button>

                {/* Desktop Search (Left) */}
                <div className="hidden lg:flex items-center gap-3">
                  <div className="relative w-[320px] xl:w-[420px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 text-[#D4AF37]" />
                    <input
                      type="text"
                      placeholder="Search luxury beauty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={handleFocus}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearchNavigate(searchQuery);
                        }
                      }}
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
                    {isSuggestOpen && (
                      <div className="absolute left-0 right-0 top-[110%] bg-white shadow-xl rounded-2xl border border-[#D4AF37]/20 overflow-hidden z-20">
                        <div className="flex justify-end p-2 border-b border-[#D4AF37]/15 bg-white sticky top-0 z-10">
                          <button
                            type="button"
                            className="text-[#3E2723] hover:text-[#D4AF37] p-1"
                            onClick={closeSuggestions}
                            aria-label="Close suggestions"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="max-h-80 overflow-auto">
                          {searchQuery.trim().length >= 2 ? (
                            <>
                              {isSuggestionsLoading ? (
                                <div className="p-4 space-y-3">
                                  {Array.from({ length: 4 }).map((_, idx) => (
                                    <div key={idx} className="h-4 rounded-full bg-[#D4AF37]/15 animate-pulse" />
                                  ))}
                                </div>
                              ) : suggestions.length > 0 ? (
                                suggestions.map((item) => (
                                  <button
                                    key={item.slug}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5E6D3] text-left"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSuggestionClick(item.slug)}
                                  >
                                    {item.thumbnail ? (
                                      <img src={item.thumbnail} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                    ) : (
                                      <div className="w-12 h-12 rounded bg-[#D4AF37]/15" />
                                    )}
                                    <div>
                                      <div className="text-sm font-semibold text-[#3E2723]">{item.name}</div>
                                      <div className="text-xs text-gray-500">View product</div>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-sm text-gray-500">No suggestions</div>
                              )}
                            </>
                          ) : (
                            <>
                              {trending.length > 0 ? (
                                <div className="p-3">
                                  <div className="text-xs font-semibold text-gray-500 mb-2">Trending now</div>
                                  <div className="flex flex-col gap-2">
                                    {trending.map((t) => (
                                      <button
                                        key={t.query}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F5E6D3]"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSearchNavigate(t.query)}
                                      >
                                        <div className="text-sm text-[#3E2723] font-medium">{t.query}</div>
                                        <div className="text-xs text-gray-500">{t.search_count} searches</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Desktop Store Logo (Right after search bar) */}
                  <button
                    type="button"
                    className="
                      flex items-center justify-center
                      w-[52px] h-[52px]
                      rounded-full
                      border border-[#D4AF37]/25
                      bg-white/85
                      backdrop-blur
                      shadow-[0_10px_30px_rgba(212,175,55,0.12)]
                      hover:shadow-[0_12px_36px_rgba(212,175,55,0.18)]
                      active:scale-95
                      transition
                    "
                    onClick={() => setIsStorePortalOpen(true)}
                    aria-label="Open store locator"
                  >
                    <MapPin className="w-8 h-8 text-[#3E2723]" />
                  </button>
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
                      object-contain nav-logo
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
                      rounded-full px-1 py-1 sm:px-3 sm:py-2
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
                  <IconLink to={isAuthenticated ? "/account" : "/login"} label="Account">
                    <User className="w-7 h-7 lg:w-9 lg:h-9" />
                  </IconLink>
                </div>

                <IconLink to="/wishlist" label="Wishlist" badge={wishlistCount}>
                  <Heart className="w-5 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 nav-icon" />
                </IconLink>

                <IconLink to="/cart" label="Cart" badge={cartCount}>
                  <ShoppingCart className="w-5 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 nav-icon" />
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
                    onFocus={handleFocus}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchNavigate(searchQuery);
                      }
                    }}
                    ref={mobileSearchInputRef}
                    className="
                      w-full pl-11 pr-3 py-3 rounded-full nav-search-input
                      border border-[#D4AF37]/25
                      bg-white/85
                      text-sm
                      focus:outline-none focus:border-[#D4AF37]
                      transition
                    "
                  />
                  {isSuggestOpen && !isMobileSearchOpen && (
                    <div className="absolute left-0 right-0 top-[105%] bg-white shadow-xl rounded-xl border border-[#D4AF37]/20 overflow-hidden z-20">
                      <div className="flex justify-end p-2 border-b border-[#D4AF37]/15 bg-white sticky top-0 z-10">
                        <button
                          type="button"
                          className="text-[#3E2723] hover:text-[#D4AF37] p-1"
                          onClick={closeSuggestions}
                          aria-label="Close suggestions"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="max-h-72 overflow-auto">
                        {searchQuery.trim().length >= 2 ? (
                          <>
                            {isSuggestionsLoading ? (
                              <div className="p-3 space-y-2">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                  <div key={idx} className="h-4 rounded-full bg-[#D4AF37]/15 animate-pulse" />
                                ))}
                              </div>
                            ) : suggestions.length > 0 ? (
                              suggestions.map((item) => (
                                <button
                                  key={item.slug}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#F5E6D3] text-left"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => handleSuggestionClick(item.slug)}
                                >
                                  {item.thumbnail ? (
                                    <img src={item.thumbnail} alt={item.name} className="w-10 h-10 rounded object-cover" />
                                  ) : (
                                    <div className="w-10 h-10 rounded bg-[#D4AF37]/15" />
                                  )}
                                  <div>
                                    <div className="text-sm font-semibold text-[#3E2723]">{item.name}</div>
                                    <div className="text-xs text-gray-500">View product</div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500">No suggestions</div>
                            )}
                          </>
                        ) : trending.length > 0 ? (
                          <div className="p-3 space-y-2">
                            <div className="text-xs font-semibold text-gray-500">Trending now</div>
                            {trending.map((t) => (
                              <button
                                key={t.query}
                                className="w-full text-left px-2 py-2 rounded-lg hover:bg-[#F5E6D3]"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSearchNavigate(t.query)}
                              >
                                <div className="text-sm text-[#3E2723] font-medium">{t.query}</div>
                                <div className="text-xs text-gray-500">{t.search_count} searches</div>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
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

      {/* Store Reveal Overlay */}
      <StorePortal isOpen={isStorePortalOpen} onClose={() => setIsStorePortalOpen(false)} />

      {/* ✅ Mobile/Tablet search popup (sits above hero) */}
      {isMobileSearchOpen && isSuggestOpen && (
        <div
          className="lg:hidden fixed left-3 right-3 z-50 transition-transform duration-150 ease-out"
          style={{ top: mobilePopupTop }}
        >
          <div className="rounded-2xl bg-white shadow-xl border border-[#D4AF37]/15 overflow-hidden will-change-transform">
            <div className="flex justify-end p-3 border-b border-[#D4AF37]/15 bg-white sticky top-0 z-10">
              <button
                type="button"
                className="text-[#3E2723] hover:text-[#D4AF37] p-1"
                onClick={closeSuggestions}
                aria-label="Close suggestions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-3 pb-3 pt-2 max-h-[70vh] overflow-y-auto">
              {searchQuery.trim().length >= 2 ? (
                <div className="space-y-2">
                  {isSuggestionsLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="h-10 rounded-xl bg-[#D4AF37]/12 animate-pulse" />
                      ))}
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <button
                        key={item.slug}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F5E6D3] transition text-left"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionClick(item.slug)}
                      >
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.name} className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-[#D4AF37]/15" />
                        )}
                        <div>
                          <div className="text-sm font-semibold text-[#3E2723]">{item.name}</div>
                          <div className="text-xs text-gray-500">View product</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-2 py-3 text-sm text-gray-500">No suggestions</div>
                  )}
                </div>
              ) : trending.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 px-2">Trending now</div>
                  {trending.map((t) => (
                    <button
                      key={t.query}
                      className="w-full text-left px-3 py-3 rounded-xl hover:bg-[#F5E6D3] transition"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSearchNavigate(t.query)}
                    >
                      <div className="text-sm text-[#3E2723] font-medium">{t.query}</div>
                      <div className="text-xs text-gray-500">{t.search_count} searches</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-2 py-3 text-sm text-gray-500">Start typing to search</div>
              )}
            </div>
          </div>
        </div>
      )}

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
