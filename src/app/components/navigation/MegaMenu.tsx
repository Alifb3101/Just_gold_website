import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ApiCategoryNode } from '@/app/api/categories/categories.api-model';

interface MegaMenuProps {
  category: ApiCategoryNode | undefined;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onSelectCategory: (category: ApiCategoryNode) => void;
  onSelectSubcategory: (parent: ApiCategoryNode, subId: number) => void;
}

export function MegaMenu({ category, onClose, onMouseEnter, onMouseLeave, onSelectCategory, onSelectSubcategory }: MegaMenuProps) {
  const content = useMemo(() => category, [category]);
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
          <div className="col-span-3">
            <h3 className="font-['Playfair_Display'] text-lg font-semibold text-[#D4AF37] mb-4">
              Shop {content.name}
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory(content);
                    onClose();
                  }}
                  className="w-full text-left text-[#3E2723] hover:text-[#D4AF37] transition-colors flex items-center justify-between group"
                >
                  <span>View all {content.name}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              {(content.subcategories ?? []).map((sub) => (
                <li key={sub.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSubcategory(content, sub.id);
                      onClose();
                    }}
                    className="w-full text-left text-[#3E2723] hover:text-[#D4AF37] transition-colors flex items-center justify-between group"
                  >
                    <span>{sub.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Decorative / featured placeholder to keep layout consistent */}
          <div className="col-span-2 bg-[#FAF3E0] p-6 rounded-lg border border-[#D4AF37]/20">
            <div className="h-full flex items-center justify-center text-[#D4AF37] font-semibold">
              Explore premium picks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
