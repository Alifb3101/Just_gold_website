import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const collections = [
  {
    name: 'Golden Hour Glow',
    productCount: 12,
    image: 'https://i.postimg.cc/zf8DynLf/imgi-173-14183-copy-1-1512x.jpg',
    description: 'Radiant makeup for sun-kissed beauty'
  },
  {
    name: 'Luxe Essentials',
    productCount: 18,
    image: 'https://i.postimg.cc/7LwP5gCH/imgi-166-Whats-App-Image2024-05-18at6-21-09PM-4472x.jpg',
    description: 'Your everyday makeup must-haves'
  },
  {
    name: 'Evening Elegance',
    productCount: 15,
    image: 'https://i.postimg.cc/W4TpdMDM/imgi-188-2-eaa0d212-adc1-4b2f-8cbf-add5b14b7d8e-720x.png',
    description: 'Glamorous looks for special occasions'
  },
  {
    name: 'Natural Beauty',
    productCount: 10,
    image: 'https://i.postimg.cc/pdRVmD9V/imgi-49-71rf-Sf-WR-s-L-SL1500-1728x.jpg',
    description: 'Effortlessly beautiful, naturally you'
  }
];

export function FeaturedCollections() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 bg-[#FAF3E0]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#3E2723] mb-2">
              Our Signature Collections
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#B76E79]" />
          </div>
          
          {/* Navigation Arrows - Desktop */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collections Scroll */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {collections.map((collection, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative flex-shrink-0 w-80 md:w-96 snap-start cursor-pointer"
            >
              <div className="relative h-[500px] rounded-2xl overflow-hidden">
                {/* Image */}
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-sm font-semibold text-[#D4AF37] mb-2">
                    {collection.productCount} Products
                  </p>
                  <h3 className="font-['Playfair_Display'] text-2xl font-bold mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-[#FFF9F0] mb-4">
                    {collection.description}
                  </p>
                  <button className="flex items-center gap-2 text-white group-hover:text-[#D4AF37] transition-colors">
                    <span className="font-semibold">Explore Collection</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Golden Border on Hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37] transition-all duration-300 rounded-2xl" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
