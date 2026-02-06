import React, { useEffect, useMemo, useState } from "react";
import { X, ChevronRight, ChevronLeft, User, Facebook, Instagram, Youtube } from "lucide-react";

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

  // ✅ Submenu panel state
  const [activeCategory, setActiveCategory] = useState<MenuItem | null>(null);

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
    () => [
      { label: "Face", submenu: ["Foundation", "Concealer", "Powder", "Primer", "Setting Spray"] },
      { label: "Lips", submenu: ["Lipstick", "Lip Gloss", "Lip Liner", "Lip Balm"] },
      { label: "Eyes", submenu: ["Eyeshadow", "Eyeliner", "Mascara", "Brows", "Lashes"] },
      { label: "Accessories", submenu: ["Brushes", "Sponges", "Tools", "Bags"] },
      { label: "Skin & Nail Care", submenu: ["Cleanser", "Moisturizer", "Serum", "Nail Care"] },
      { label: "Fragrance", submenu: ["Women", "Men", "Body Mist", "Gift Sets"] },
      { label: "Brands", submenu: ["Forever52", "Character", "NYX", "Maybelline"] },
      { label: "New In", submenu: ["All New", "New Face", "New Eyes", "New Lips"] },
      { label: "Collections", submenu: ["Limited Edition", "Trending", "Seasonal"] },
      { label: "Offers", submenu: ["Sale", "Bundles", "Best Deals"] },
    ],
    []
  );

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
                  const hasSub = item.submenu && item.submenu.length > 0;

                  return (
                    <li key={index} className="border-b border-black/5">
                      <button
                        onClick={() => hasSub && setActiveCategory(item)}
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
                  <a
                    href="#"
                    className="
                      px-5 py-[18px] flex items-center justify-between
                      text-[15px] font-semibold text-black/90
                      hover:bg-black/[0.03] transition
                    "
                  >
                    View all
                    <ChevronRight className="w-5 h-5 text-black/35" />
                  </a>
                </li>

                {(activeCategory?.submenu || []).map((sub, idx) => (
                  <li key={idx} className="border-b border-black/5">
                    <a
                      href="#"
                      className="
                        px-5 py-[18px] flex items-center justify-between
                        text-[15px] font-medium text-black/80
                        hover:bg-black/[0.03] transition
                      "
                    >
                      {sub}
                      <ChevronRight className="w-5 h-5 text-black/30" />
                    </a>
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
