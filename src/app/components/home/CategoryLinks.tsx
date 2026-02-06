import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, Eye, Circle, Brush, Gift, Star } from 'lucide-react';

const categories = [
  {
    name: 'Lips',
    icon: Circle,
    productCount: 24,
    image: 'https://images.unsplash.com/photo-1581713845245-ca131fdb3064?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    name: 'Eyes',
    icon: Eye,
    productCount: 32,
    image: 'https://images.unsplash.com/photo-1542833807-ad5af0977050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    name: 'Face',
    icon: Sparkles,
    productCount: 28,
    image: 'https://images.unsplash.com/photo-1550281378-521929a11c42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    name: 'Tools & Brushes',
    icon: Brush,
    productCount: 18,
    image: 'https://images.unsplash.com/photo-1680244169777-a3d7d758a264?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    name: 'Kits & Sets',
    icon: Gift,
    productCount: 15,
    image: 'https://images.unsplash.com/photo-1602532381225-eec578361933?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
  {
    name: 'Best Sellers',
    icon: Star,
    productCount: 20,
    image: 'https://images.unsplash.com/photo-1760264558903-b9fdc0857a67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  },
];

export function CategoryLinks() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-white relative mt-0 sm:mt-6">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation Arrows */}
        <div className="hidden lg:block">
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border-2 border-[#D4AF37] rounded-full flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border-2 border-[#D4AF37] rounded-full flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Category Cards Container - Horizontal Scroll */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-2 sm:gap-3 md:gap-2 lg:gap-3 xl:gap-6 pb-6 pt-2 min-w-max lg:min-w-0 lg:justify-center">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer flex-shrink-0"
                >
                  <Link to="/shop">
                    {/* Category Card */}
                    <div className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[185px] xl:w-[220px] h-[180px] sm:h-[230px] md:h-[260px] lg:h-[270px] xl:h-[280px] bg-gradient-to-br from-[#F5E6D3] to-[#FAF3E0] rounded-xl border border-[#D4AF37]/30 overflow-hidden relative hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                      {/* Gold shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      {/* Product Image */}
                      <div className="h-[60%] overflow-hidden relative">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F5E6D3]/80" />
                      </div>

                      {/* Category Info */}
                      <div className="h-[40%] flex flex-col items-center justify-center p-4 relative z-10">
                        {/* Icon */}
                        <div className="mb-2 text-[#D4AF37]">
                          <Icon className="w-6 h-6 md:w-8 md:h-8 stroke-[1.5]" />
                        </div>

                        {/* Category Name */}
                        <h3 className="font-['Playfair_Display'] text-base md:text-lg font-semibold text-[#3E2723] text-center mb-1">
                          {category.name}
                        </h3>

                        {/* Product Count */}
                        <p className="text-xs md:text-sm text-[#D4AF37]">
                          ({category.productCount} Products)
                        </p>
                      </div>

                      {/* Hover Border Glow */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37] rounded-xl transition-all duration-300 pointer-events-none" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}