import React from 'react';
import { Star } from 'lucide-react';
import { ProductCard } from '@/app/components/products/ProductCard';

const products = [
  {
    id: 1,
    name: 'Luxe Matte Lipstick - Rose Gold',
    image: 'https://i.postimg.cc/zf8DynLf/imgi-173-14183-copy-1-1512x.jpg',
    price: 150,
    rating: 5,
    reviews: 234,
    badge: 'Best Seller'
  },
  {
    id: 2,
    name: 'Flawless Foundation - Golden Beige',
    image: 'https://i.postimg.cc/7LwP5gCH/imgi-166-Whats-App-Image2024-05-18at6-21-09PM-4472x.jpg',
    price: 280,
    rating: 5,
    reviews: 189,
    badge: 'Best Seller'
  },
  {
    id: 3,
    name: 'Golden Hour Eyeshadow Palette',
    image: 'https://i.postimg.cc/pdRVmD9V/imgi-49-71rf-Sf-WR-s-L-SL1500-1728x.jpg',
    price: 320,
    rating: 5,
    reviews: 312,
    badge: 'Best Seller'
  },
  {
    id: 4,
    name: 'Volume Luxe Mascara',
    image: 'https://images.unsplash.com/photo-1620531940052-d0d9aff03c32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500',
    price: 125,
    rating: 4,
    reviews: 156,
    badge: 'Best Seller'
  },
  {
    id: 5,
    name: 'Rose Gold Blush Powder',
    image: 'https://images.unsplash.com/photo-1764333746618-6285bf70db23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500',
    price: 180,
    rating: 5,
    reviews: 201,
    badge: 'Best Seller'
  },
  {
    id: 6,
    name: 'Champagne Glow Highlighter',
    image: 'https://images.unsplash.com/photo-1629684027309-92e2cc2de5ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500',
    price: 195,
    rating: 5,
    reviews: 278,
    badge: 'Best Seller'
  },
  {
    id: 7,
    name: 'Luxury Lip Gloss - Golden Kiss',
    image: 'https://i.postimg.cc/7LwP5gCH/imgi-166-Whats-App-Image2024-05-18at6-21-09PM-4472x.jpg',
    price: 110,
    rating: 4,
    reviews: 143,
    badge: 'Best Seller'
  },
  {
    id: 8,
    name: 'Perfect Skin Concealer',
    image: 'https://i.postimg.cc/zf8DynLf/imgi-173-14183-copy-1-1512x.jpg',
    price: 165,
    rating: 5,
    reviews: 267,
    badge: 'Best Seller'
  }
];

export function BestSellers() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Star className="w-6 h-6 fill-[#D4AF37] text-[#D4AF37]" />
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#3E2723]">
              Golden Favorites
            </h2>
            <Star className="w-6 h-6 fill-[#D4AF37] text-[#D4AF37]" />
          </div>
          <p className="text-[#4A4A4A] max-w-2xl mx-auto">
            Discover our most loved products, chosen by beauty enthusiasts worldwide
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] rounded-full hover:bg-[#D4AF37] hover:text-white transition-all duration-300 font-semibold">
            View All Best Sellers
          </button>
        </div>
      </div>
    </section>
  );
}
