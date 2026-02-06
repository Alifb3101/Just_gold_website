import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { FilterSidebar } from '@/app/components/shop/FilterSidebar';
import { ShopProductCard } from '@/app/components/shop/ShopProductCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

// Mock products data
const generateMockProducts = () => {
  const products = [];
  const categories = ['Face', 'Eyes', 'Lips', 'Tools & Brushes', 'Kits & Sets'];
  const names = [
    'Luxe Foundation', 'Golden Glow Highlighter', 'Velvet Lipstick', 'Diamond Eyeshadow Palette',
    'Silk Mascara', 'Rose Blush', 'Contour Palette', 'Setting Spray', 'Makeup Brush Set',
    'Lip Gloss', 'Eyeliner Pencil', 'Brow Gel', 'Primer', 'Concealer', 'Bronzer',
    'Lip Liner', 'Eyeshadow Stick', 'Makeup Sponge', 'Face Powder', 'Lip Balm',
    'Eye Primer', 'Setting Powder', 'Face Mist', 'Makeup Remover'
  ];

  for (let i = 1; i <= 24; i++) {
    const hasDiscount = Math.random() > 0.7;
    const originalPrice = Math.floor(Math.random() * 200) + 100;
    const price = hasDiscount ? Math.floor(originalPrice * 0.8) : originalPrice;
    
    products.push({
      id: i,
      name: `${names[Math.floor(Math.random() * names.length)]} ${i}`,
      image: `https://images.unsplash.com/photo-${
        ['1522338242992-e1d5e5d8b07f', '1590439471364-192aa70c0a13', '1631214524244-b8df052a5b17',
         '1583241800698-8cf3c5f8f67e', '1512496015851-a90fb38ba796', '1596462502726-77f8cc2ba7ad'][i % 6]
      }?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400`,
      alternateImage: `https://images.unsplash.com/photo-${
        ['1596462502726-77f8cc2ba7ad', '1522338242992-e1d5e5d8b07f', '1590439471364-192aa70c0a13'][i % 3]
      }?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400`,
      price,
      originalPrice: hasDiscount ? originalPrice : undefined,
      category: categories[Math.floor(Math.random() * categories.length)],
      rating: Math.floor(Math.random() * 2) + 4,
      reviews: Math.floor(Math.random() * 200) + 10,
      badge: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'NEW' : 'LIMITED') : undefined,
      colors: Array.from({ length: Math.floor(Math.random() * 6) + 1 }, () => 
        ['#F5D5C0', '#FFB6C1', '#DC143C', '#8B4513', '#FF7F50', '#B76E79'][Math.floor(Math.random() * 6)]
      ),
      inStock: Math.random() > 0.1,
    });
  }
  return products;
};

export function ShopPage() {
  const [products] = useState(generateMockProducts());
  const [activeFilters, setActiveFilters] = useState({});
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      {/* Hero Section */}
      <div
        className="relative h-[300px] md:h-[400px] bg-gradient-to-br from-[#D4AF37] via-[#B76E79] to-[#D4AF37] flex items-center justify-center"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        <div className="text-center text-white z-10">
          <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Discover Your Gold
          </h1>
          <p className="text-lg md:text-xl opacity-90">Premium cosmetics for every look</p>
        </div>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#D4AF37] cursor-pointer">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#D4AF37] font-semibold">Shop All</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block flex-shrink-0">
            <FilterSidebar onFilterChange={setActiveFilters} activeFilters={activeFilters} />
          </aside>

          {/* Products Section */}
          <div className="flex-1">
            {/* Sort and Mobile Filter Bar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              {/* Mobile Filter Button */}
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden flex items-center gap-2 px-4 py-2 border-2 border-[#D4AF37] text-[#D4AF37] rounded-lg hover:bg-[#D4AF37] hover:text-white transition-colors">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="font-['Playfair_Display'] text-2xl text-[#3E2723]">
                      Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar onFilterChange={setActiveFilters} activeFilters={activeFilters} />
                  </div>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full mt-4 bg-[#D4AF37] text-white py-3 rounded-lg font-semibold"
                  >
                    Show {products.length} Results
                  </button>
                </SheetContent>
              </Sheet>

              <div className="flex-1" />

              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] border-[#D4AF37] focus:ring-[#D4AF37]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="bestselling">Best Selling</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-600 mb-6">
              Showing <span className="font-semibold text-[#D4AF37]">{products.length}</span> products
            </p>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex items-center justify-center gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                Previous
              </button>
              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                    page === 1
                      ? 'bg-[#D4AF37] text-white'
                      : 'border border-gray-300 text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}