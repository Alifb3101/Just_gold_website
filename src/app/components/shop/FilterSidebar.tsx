import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import type { ProductFilters, ProductSort } from '@/app/features/products/product-cursor-list.model';
import type { ApiCategoryNode } from '@/app/api/categories/categories.api-model';
import { useCategories } from '@/store/categoryStore';

type FilterSidebarProps = {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
};

const COLORS = ['Nude', 'Pink', 'Red', 'Brown', 'Coral', 'Berry'];
const SIZES = ['Mini', 'Standard', 'Large'];
const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price_low', label: 'Price: Low → High' },
  { value: 'price_high', label: 'Price: High → Low' },
];

const parseNullableNumber = (raw: string): number | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
};

export const FilterSidebar = React.memo(function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const { categories } = useCategories();

  const selectedCategoryId = filters.category === null ? null : String(filters.category);

  const selectedParent = useMemo<ApiCategoryNode | null>(() => {
    if (!selectedCategoryId) return null;
    const directParent = categories.find((cat) => String(cat.id) === selectedCategoryId);
    if (directParent) return directParent;
    return (
      categories.find((cat) => cat.subcategories?.some((sub) => String(sub.id) === selectedCategoryId)) ?? null
    );
  }, [categories, selectedCategoryId]);

  const subcategoryOptions = useMemo(() => {
    if (!selectedParent) return [];
    return selectedParent.subcategories ?? [];
  }, [selectedParent]);

  const parentIdValue = selectedParent ? String(selectedParent.id) : null;
  const selectedSubOrAll =
    selectedParent && selectedCategoryId && selectedCategoryId !== String(selectedParent.id)
      ? selectedCategoryId
      : 'all';

  const [minPriceInput, setMinPriceInput] = useState(filters.minPrice?.toString() ?? '');
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice?.toString() ?? '');

  useEffect(() => {
    setMinPriceInput(filters.minPrice?.toString() ?? '');
    setMaxPriceInput(filters.maxPrice?.toString() ?? '');
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const nextMin = parseNullableNumber(minPriceInput);
      const nextMax = parseNullableNumber(maxPriceInput);
      if (nextMin === filters.minPrice && nextMax === filters.maxPrice) return;
      onChange({ ...filters, minPrice: nextMin, maxPrice: nextMax });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [minPriceInput, maxPriceInput, filters, onChange]);

  const activeCount = useMemo(() => {
    return [filters.minPrice, filters.maxPrice, filters.color, filters.size]
      .filter((v) => v !== null)
      .length + (filters.sort !== 'newest' ? 1 : 0);
  }, [filters]);

  const handleClearAll = useCallback(() => {
    const preservedCategory = selectedCategoryId ?? filters.category;
    onChange({
      category: preservedCategory,
      minPrice: null,
      maxPrice: null,
      color: null,
      size: null,
      sort: 'newest',
    });
  }, [onChange, selectedCategoryId, filters.category]);

  return (
    <div className="w-full bg-white rounded-lg border border-[#D4AF37]/30 p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#3E2723]">Filters</h3>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm text-[#D4AF37] hover:underline flex items-center gap-2"
          >
            Clear
            <span className="bg-[#D4AF37] text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
              {activeCount}
            </span>
          </button>
        ) : null}
      </div>

      <Accordion type="multiple" className="space-y-4" defaultValue={['category', 'price', 'sort']}>
        <AccordionItem value="sort" className="border-b border-[#D4AF37]/20">
          <AccordionTrigger className="text-[#3E2723] font-semibold hover:text-[#D4AF37]">Sort</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filters.sort}
              onValueChange={(value) => onChange({ ...filters, sort: value as ProductSort })}
            >
              <SelectTrigger className="border-[#D4AF37] focus:ring-[#D4AF37]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

         <AccordionItem value="category" className="border-b border-[#D4AF37]/20">
          <AccordionTrigger className="text-[#3E2723] font-semibold hover:text-[#D4AF37]">Category</AccordionTrigger>
          <AccordionContent>
            {selectedParent ? (
              <div className="space-y-3">
                <div className="text-sm text-[#3E2723] font-semibold">
                  Selected: <span className="text-[#D4AF37]">{selectedParent.name}</span>
                </div>
                {subcategoryOptions.length > 0 ? (
                  <div>
                    <label className="text-xs text-gray-600 mb-2 block">Subcategory</label>
                    <Select
                      value={selectedSubOrAll}
                      onValueChange={(value) =>
                        onChange({
                          ...filters,
                          category: value === 'all' ? String(selectedParent.id) : value,
                        })
                      }
                    >
                      <SelectTrigger className="border-[#D4AF37] focus:ring-[#D4AF37]">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {subcategoryOptions.map((sub) => (
                          <SelectItem key={sub.id} value={String(sub.id)}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No subcategories for this category.</p>
                )}
              </div>
            ) : (
              <Select
                value={parentIdValue ?? 'all'}
                onValueChange={(value) =>
                  onChange({
                    ...filters,
                    category: value === 'all' ? null : value,
                  })
                }
              >
                <SelectTrigger className="border-[#D4AF37] focus:ring-[#D4AF37]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-b border-[#D4AF37]/20">
          <AccordionTrigger className="text-[#3E2723] font-semibold hover:text-[#D4AF37]">Price</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-600" htmlFor="minPrice">Min</label>
                <Input
                  id="minPrice"
                  inputMode="numeric"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="border-[#D4AF37] focus-visible:ring-[#D4AF37]"
                  placeholder=""
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600" htmlFor="maxPrice">Max</label>
                <Input
                  id="maxPrice"
                  inputMode="numeric"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="border-[#D4AF37] focus-visible:ring-[#D4AF37]"
                  placeholder=""
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Updates after 300ms pause.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color" className="border-b border-[#D4AF37]/20">
          <AccordionTrigger className="text-[#3E2723] font-semibold hover:text-[#D4AF37]">Color</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filters.color ?? 'all'}
              onValueChange={(value) => onChange({ ...filters, color: value === 'all' ? null : value })}
            >
              <SelectTrigger className="border-[#D4AF37] focus:ring-[#D4AF37]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {COLORS.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size" className="border-b border-[#D4AF37]/20">
          <AccordionTrigger className="text-[#3E2723] font-semibold hover:text-[#D4AF37]">Size</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filters.size ?? 'all'}
              onValueChange={(value) => onChange({ ...filters, size: value === 'all' ? null : value })}
            >
              <SelectTrigger className="border-[#D4AF37] focus:ring-[#D4AF37]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating" className="border-b border-[#D4AF37]/20">
          <AccordionTrigger className="text-[#3E2723] font-semibold hover:text-[#D4AF37]">Rating</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-gray-500">Server-side filtering handles supported fields only.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
});

FilterSidebar.displayName = 'FilterSidebar';
