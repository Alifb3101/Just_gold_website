import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Slider } from '@/app/components/ui/slider';
import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { useApp } from '@/app/contexts/AppContext';

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
  activeFilters: any;
}

const categories = ['Face', 'Eyes', 'Lips', 'Tools & Brushes', 'Kits & Sets', 'Best Sellers'];
const productTypes = ['Foundation', 'Lipstick', 'Mascara', 'Eyeshadow', 'Blush', 'Bronzer', 'Primer', 'Setting Spray'];
const shades = [
  { name: 'Nude', color: '#F5D5C0' },
  { name: 'Pink', color: '#FFB6C1' },
  { name: 'Red', color: '#DC143C' },
  { name: 'Brown', color: '#8B4513' },
  { name: 'Coral', color: '#FF7F50' },
  { name: 'Berry', color: '#B76E79' },
];

export function FilterSidebar({ onFilterChange, activeFilters }: FilterSidebarProps) {
  const { currency } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedShades, setSelectedShades] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [specialOffers, setSpecialOffers] = useState({
    onSale: false,
    newArrivals: false,
    limitedEdition: false,
    freeShipping: false,
  });

  const handleCategoryChange = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    onFilterChange({ ...activeFilters, categories: updated });
  };

  const handleTypeChange = (type: string) => {
    const updated = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(updated);
    onFilterChange({ ...activeFilters, types: updated });
  };

  const handleShadeChange = (shade: string) => {
    const updated = selectedShades.includes(shade)
      ? selectedShades.filter(s => s !== shade)
      : [...selectedShades, shade];
    setSelectedShades(updated);
    onFilterChange({ ...activeFilters, shades: updated });
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedShades([]);
    setSelectedRating(null);
    setSpecialOffers({ onSale: false, newArrivals: false, limitedEdition: false, freeShipping: false });
    onFilterChange({});
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedTypes.length +
    selectedShades.length +
    (selectedRating ? 1 : 0) +
    Object.values(specialOffers).filter(Boolean).length;

  return (
    <div className="w-full lg:w-[280px] bg-white rounded-lg border border-[#D4AF37]/30 p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#3E2723]">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            Clear All
            {activeFilterCount > 0 && (
              <span className="bg-[#D4AF37] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#D4AF37] focus:ring-[#D4AF37]"
          />
        </div>
      </div>

      {/* Accordion Filters */}
      <Accordion type="multiple" className="space-y-4" defaultValue={['category', 'price']}>
        {/* Category Filter */}
        <AccordionItem value="category" className="border-b border-[#D4AF37]/20">
          <AccordionTrigger className="text-[#3E2723] font-semibold hover:text-[#D4AF37]">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                    className="border-[#D4AF37] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                  />
                  <label
                    htmlFor={category}
                    className="text-sm text-gray-700 cursor-pointer hover:text-[#D4AF37]"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Product Type Filter */}
        <AccordionItem value="type" className="border-b border-[#D4AF37]/20">
          <AccordionTrigger className="text-[#3E2723] font-semibold hover:text-[#D4AF37]">
            Product Type
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {productTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleTypeChange(type)}
                    className="border-[#D4AF37] data-[state=checked]:bg-[#D4AF37]"
                  />
                  <label htmlFor={type} className="text-sm text-gray-700 cursor-pointer hover:text-[#D4AF37]">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="price" className="border-b border-[#D4AF37]/20">
          <AccordionTrigger className="text-[#3E2723] font-semibold hover:text-[#D4AF37]">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1000}
                step={10}
                className="[&_[role=slider]]:bg-[#D4AF37] [&_[role=slider]]:border-[#D4AF37]"
              />
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="border-[#D4AF37]"
                  placeholder="Min"
                />
                <span className="text-gray-500">-</span>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="border-[#D4AF37]"
                  placeholder="Max"
                />
              </div>
              <p className="text-xs text-[#D4AF37]">
                {currency} {priceRange[0]} - {currency} {priceRange[1]}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Shade/Color Filter */}
        <AccordionItem value="shade" className="border-b border-[#D4AF37]/20">
          <AccordionTrigger className="text-[#3E2723] font-semibold hover:text-[#D4AF37]">
            Shade/Color
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-4 gap-3">
              {shades.map((shade) => (
                <button
                  key={shade.name}
                  onClick={() => handleShadeChange(shade.name)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    selectedShades.includes(shade.name)
                      ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] ring-offset-2'
                      : 'border-gray-300 hover:border-[#D4AF37]'
                  }`}
                  style={{ backgroundColor: shade.color }}
                  title={shade.name}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Customer Rating Filter */}
        <AccordionItem value="rating" className="border-b border-[#D4AF37]/20">
          <AccordionTrigger className="text-[#3E2723] font-semibold hover:text-[#D4AF37]">
            Customer Rating
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {[4, 3, 2].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`flex items-center space-x-2 w-full p-2 rounded hover:bg-[#F5E6D3] transition-colors ${
                    selectedRating === rating ? 'bg-[#F5E6D3]' : ''
                  }`}
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < rating ? 'text-[#D4AF37]' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-700">& Up</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Special Offers Filter */}
        <AccordionItem value="offers" className="border-b-0">
          <AccordionTrigger className="text-[#3E2723] font-semibold hover:text-[#D4AF37]">
            Special Offers
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {Object.entries({
                onSale: 'On Sale',
                newArrivals: 'New Arrivals',
                limitedEdition: 'Limited Edition',
                freeShipping: 'Free Shipping',
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <label htmlFor={key} className="text-sm text-gray-700">
                    {label}
                  </label>
                  <Switch
                    id={key}
                    checked={specialOffers[key as keyof typeof specialOffers]}
                    onCheckedChange={(checked) =>
                      setSpecialOffers((prev) => ({ ...prev, [key]: checked }))
                    }
                    className="data-[state=checked]:bg-[#D4AF37]"
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Apply Filters Button */}
      <button className="w-full mt-6 bg-[#D4AF37] text-white py-3 rounded-lg font-semibold hover:bg-[#C4A037] transition-colors">
        Apply Filters
      </button>
    </div>
  );
}
