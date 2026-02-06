import React from 'react';
import { ArrowRight } from 'lucide-react';

interface MegaMenuProps {
  category: string;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function MegaMenu({ category, onClose, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  const menuContent: Record<string, { categories: string[], featured?: string }> = {
    'MAKEUP': {
      categories: ['All Makeup', 'Face', 'Eyes', 'Lips', 'Cheeks', 'Nails', 'Sets & Kits'],
      featured: 'Golden Hour Collection'
    },
    'FACE': {
      categories: ['All Face', 'Foundation', 'Concealer', 'Powder', 'Primer', 'Bronzer', 'Highlighter', 'Setting Spray'],
      featured: 'Flawless Skin Collection'
    },
    'EYES': {
      categories: ['All Eyes', 'Eyeshadow Palettes', 'Eyeliner', 'Mascara', 'Eyebrow', 'Eye Primer', 'False Lashes'],
      featured: 'Smokey Eye Essentials'
    },
    'LIPS': {
      categories: ['All Lips', 'Lipstick', 'Lip Gloss', 'Lip Liner', 'Lip Balm', 'Lip Stain', 'Lip Sets'],
      featured: 'Luxury Lip Collection'
    },
    'TOOLS & BRUSHES': {
      categories: ['All Tools', 'Face Brushes', 'Eye Brushes', 'Lip Brushes', 'Sponges', 'Brush Sets', 'Applicators'],
      featured: 'Professional Brush Set'
    }
  };

  const content = menuContent[category];
  if (!content) return null;

  return (
    <div 
      className="absolute top-full left-0 w-full bg-white border-t border-[#D4AF37]/20 shadow-lg"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave ?? onClose}
    >
      <div className="max-w-[1920px] mx-auto px-8 py-8">
        <div className="grid grid-cols-5 gap-8">
          {/* Categories Column */}
          <div className="col-span-2">
            <h3 className="font-['Playfair_Display'] text-lg font-semibold text-[#D4AF37] mb-4">
              Shop {category}
            </h3>
            <ul className="space-y-3">
              {content.categories.map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-[#3E2723] hover:text-[#D4AF37] transition-colors flex items-center justify-between group"
                  >
                    <span>{item}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured Collection */}
          {content.featured && (
            <div className="col-span-3 bg-[#FAF3E0] p-6 rounded-lg border border-[#D4AF37]/20 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-6">
                <div className="w-48 h-48 bg-[#F5E6D3] rounded-lg flex items-center justify-center">
                  <span className="text-[#D4AF37] text-sm">Featured Product</span>
                </div>
                <div className="flex-1">
                  <span className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wide">Featured</span>
                  <h4 className="font-['Playfair_Display'] text-2xl font-semibold text-[#3E2723] mt-2 mb-3">
                    {content.featured}
                  </h4>
                  <p className="text-[#4A4A4A] mb-4">
                    Discover our most coveted products, handpicked for their exceptional quality and timeless elegance.
                  </p>
                  <button className="px-6 py-2 bg-[#D4AF37] text-white rounded-full hover:bg-[#C9B037] transition-colors flex items-center gap-2">
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
