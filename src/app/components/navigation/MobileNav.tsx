import React, { useEffect, useState } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  User,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/store/categoryStore";
import { useAuth } from "@/app/contexts/AuthContext";
import type { ApiCategoryNode } from "@/app/api/categories/categories.api-model";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  headerOffset?: number;
}

export function MobileNav({
  isOpen,
  onClose,
  headerOffset = 110,
}: MobileNavProps) {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<ApiCategoryNode | null>(null);

  const navigate = useNavigate();
  const { categories } = useCategories();
  const { isAuthenticated, user } = useAuth();

  /* BODY SCROLL LOCK */
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setMounted(true);
    else {
      const t = setTimeout(() => {
        setMounted(false);
        setActiveCategory(null);
      }, 420);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const goCategory = (cat: ApiCategoryNode) => {
    navigate(`/shop?category=${cat.id}`);
    onClose();
  };

  const goSub = (parent: ApiCategoryNode, subId: number) => {
    navigate(`/shop?category=${subId}`);
    onClose();
  };

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed left-0 right-0 bottom-0 z-50 lg:hidden bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{ top: headerOffset }}
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 z-50 lg:hidden bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)]
        transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col`}
        style={{
          width: "min(86vw, 380px)",
          top: headerOffset,
          height: `calc(100vh - ${headerOffset}px)`,
        }}
      >
        {/* HEADER */}
        <div className="h-[64px] flex items-center justify-between px-6 border-b border-black/10">
          {activeCategory ? (
            <button
              onClick={() => setActiveCategory(null)}
              className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 transition flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-black/70" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 transition flex items-center justify-center"
            >
              <X className="w-5 h-5 text-black/70" />
            </button>
          )}

          <div className="text-[12px] tracking-widest uppercase text-black/40">
            Menu
          </div>

          <div className="w-9" />
        </div>

        {/* ACCOUNT SECTION */}
        <div className="border-b border-black/10 px-6 py-5 bg-[#fafafa]">
          {isAuthenticated ? (
            <button
              onClick={() => {
                navigate("/account");
                onClose();
              }}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-black/70" />
                </div>

                <div className="text-left">
                  <div className="text-sm font-semibold text-black/90">
                    {user?.name || "My Account"}
                  </div>
                  <div className="text-xs text-black/50">
                    View profile & orders
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-black/30" />
            </button>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                onClose();
              }}
              className="w-full text-left"
            >
              <div className="text-sm font-semibold text-black/90">
                Sign in
              </div>
              <div className="text-xs text-black/50 mt-1">
                Track orders, wishlist & faster checkout
              </div>
            </button>
          )}
        </div>

        {/* NAVIGATION WITH SUBCATEGORY */}
        <div className="flex-1 overflow-hidden relative">

          {/* MAIN PANEL */}
          <div
            className={`absolute inset-0 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]
            ${activeCategory ? "-translate-x-full" : "translate-x-0"}`}
          >
            <nav className="h-full overflow-y-auto">
              <ul>
                {categories.map((cat) => {
                  const hasSub =
                    cat.subcategories && cat.subcategories.length > 0;

                  return (
                    <li key={cat.id} className="border-b border-black/5">
                      <button
                        onClick={() =>
                          hasSub
                            ? setActiveCategory(cat)
                            : goCategory(cat)
                        }
                        className="w-full px-6 py-5 flex items-center justify-between text-[16px] font-medium text-black/85 hover:bg-black/[0.02] transition"
                      >
                        {cat.name}
                        {hasSub && (
                          <ChevronRight className="w-5 h-5 text-black/30" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* SUBCATEGORY PANEL */}
          <div
            className={`absolute inset-0 bg-white transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]
            ${activeCategory ? "translate-x-0" : "translate-x-full"}`}
          >
            {activeCategory && (
              <nav className="h-full overflow-y-auto">
                <ul>
                  <li className="border-b border-black/5">
                    <button
                      onClick={() => goCategory(activeCategory)}
                      className="w-full px-6 py-5 flex items-center justify-between text-[16px] font-semibold text-black hover:bg-black/[0.02] transition"
                    >
                      View all {activeCategory.name}
                      <ChevronRight className="w-5 h-5 text-black/30" />
                    </button>
                  </li>

                  {activeCategory.subcategories?.map((sub) => (
                    <li key={sub.id} className="border-b border-black/5">
                      <button
                        onClick={() =>
                          goSub(activeCategory, sub.id)
                        }
                        className="w-full px-6 py-5 flex items-center justify-between text-[16px] text-black/80 hover:bg-black/[0.02] transition"
                      >
                        {sub.name}
                        <ChevronRight className="w-5 h-5 text-black/25" />
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>

        </div>

        {/* SOCIAL FOOTER */}
        <div className="border-t border-black/10 px-6 py-4 flex justify-center gap-6 text-black/40">
          <Facebook className="w-4 h-4 hover:text-black transition" />
          <Instagram className="w-4 h-4 hover:text-black transition" />
          <Youtube className="w-4 h-4 hover:text-black transition" />
        </div>
      </aside>
    </>
  );
}