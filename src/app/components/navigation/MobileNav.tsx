import React, { useEffect, useMemo, useState } from "react";
import { X, ChevronRight, ChevronLeft, User, Facebook, Instagram, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/store/categoryStore";
import type { ApiCategoryNode } from "@/app/api/categories/categories.api-model";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;

  /** ✅ Your website header height (px). Drawer will start below it */
  headerOffset?: number;
}

type MenuItem = {
  label: string;
  submenu?: string[];
  href?: string;
};

export function MobileNav({ isOpen, onClose, headerOffset = 110 }: MobileNavProps) {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { categories } = useCategories();

  // ✅ Submenu panel state
  const [activeCategory, setActiveCategory] = useState<ApiCategoryNode | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const t = setTimeout(() => {
        setMounted(false);
        setActiveCategory(null);
      }, 380); // ✅ matches slower animation
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const menuItems: MenuItem[] = useMemo(
    () => categories.map((c) => ({ label: c.name, submenu: c.subcategories?.map((s) => s.name) })),
    [categories]
  );

  const findCategory = (label: string) => categories.find((c) => c.name === label) ?? null;
  const goCategory = (cat: ApiCategoryNode) => {
    navigate(`/shop?category=${cat.id}`);
    onClose();
  };

  const goSub = (parent: ApiCategoryNode, subId: number) => {
    navigate(`/shop?category=${subId}`);
    onClose();
  };

  if (!mounted) return null;

  // ✅ drawer width  (not full)
  const drawerWidth = "min(82vw, 370px)";

  return (
    <>
      {/* ✅ Overlay (ONLY below header) */}
      <div
        className={`
          fixed left-0 right-0 bottom-0 z-50 lg:hidden bg-black/45
          transition-opacity duration-[380ms]
          ${isOpen ? "opacity-100" : "opacity-0"}
        `}
        style={{ top: headerOffset }}
        onClick={onClose}
      />

      {/* ✅ Drawer (starts below header) */}
      <aside
        className={`
          fixed left-0 z-50 lg:hidden bg-white shadow-2xl overflow-hidden
          transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          width: drawerWidth,
          top: headerOffset,
          height: `calc(100vh - ${headerOffset}px)`,
          fontFamily: "'Montserrat', Arial, sans-serif",
        }}
      >
        {/* ✅ Drawer Top Bar (NO MENU TEXT) */}
        <div className="h-[56px] flex items-center justify-between px-4 border-b border-black/10">
          {/* Left: back OR close */}
          {activeCategory ? (
            <button
              onClick={() => setActiveCategory(null)}
              className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 transition flex items-center justify-center"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5 text-black/70" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 transition flex items-center justify-center"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-black/70" />
            </button>
          )}

          {/* Center: clean empty (like screenshot) */}
          <div className="flex-1" />

          {/* Right: small thin line decoration (premium look) */}
          <div className="w-9 h-9 flex items-center justify-center">
            <div className="w-5 h-[2px] rounded-full bg-black/10" />
          </div>
        </div>

        {/* ✅ Panels Wrapper */}
        <div className="relative h-[calc(100%-56px-86px)]">
          {/* ✅ MAIN MENU PANEL */}
          <div
            className={`
              absolute inset-0 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]
              ${activeCategory ? "-translate-x-full" : "translate-x-0"}
            `}
          >
            <nav className="h-full overflow-y-auto">
              <ul>
                {menuItems.map((item, index) => {
                  const cat = findCategory(item.label);
                  const hasSub = cat?.subcategories && cat.subcategories.length > 0;

                  return (
                    <li key={index} className="border-b border-black/5">
                      <button
                        onClick={() => {
                          if (!cat) return;
                          if (hasSub) setActiveCategory(cat);
                          else goCategory(cat);
                        }}
                        className="
                          w-full px-5 py-[18px]
                          flex items-center justify-between
                          text-[15px] font-medium text-black/85
                          hover:bg-black/[0.03] transition
                        "
                      >
                        <span>{item.label}</span>
                        {hasSub && <ChevronRight className="w-5 h-5 text-black/35" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* ✅ SUBMENU PANEL */}
          <div
            className={`
              absolute inset-0 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]
              ${activeCategory ? "translate-x-0" : "translate-x-full"}
            `}
          >
            <nav className="h-full overflow-y-auto">
              <ul>
                {/* ✅ View All Row */}
                <li className="border-b border-black/5">
                  <button
                    type="button"
                    onClick={() => activeCategory && goCategory(activeCategory)}
                    className="
                      w-full px-5 py-[18px] flex items-center justify-between
                      text-[15px] font-semibold text-black/90
                      hover:bg-black/[0.03] transition
                    "
                  >
                    View all {activeCategory?.name ?? ''}
                    <ChevronRight className="w-5 h-5 text-black/35" />
                  </button>
                </li>

                {(activeCategory?.subcategories || []).map((sub, idx) => (
                  <li key={idx} className="border-b border-black/5">
                    <button
                      type="button"
                      onClick={() => activeCategory && goSub(activeCategory, sub.id)}
                      className="
                        w-full px-5 py-[18px] flex items-center justify-between
                        text-[15px] font-medium text-black/80
                        hover:bg-black/[0.03] transition
                      "
                    >
                      {sub.name}
                      <ChevronRight className="w-5 h-5 text-black/30" />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* ✅ Footer (Login + Social) */}
        <div className="h-[86px] border-t border-black/10 flex items-center justify-between px-5">
          <button className="flex items-center gap-2 text-sm font-medium text-black/80 hover:text-black transition">
            <User className="w-4 h-4" />
            Log in
          </button>

          <div className="flex items-center gap-3">
            <button className="text-black/55 hover:text-black transition">
              <Facebook className="w-4 h-4" />
            </button>
            <button className="text-black/55 hover:text-black transition">
              <Instagram className="w-4 h-4" />
            </button>
            <button className="text-black/55 hover:text-black transition">
              <Youtube className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
