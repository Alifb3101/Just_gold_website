import React from 'react';
import { ArrowRight, Gift, Tag } from 'lucide-react';
import { motion } from 'motion/react';

export function PromoBanner() {
  return (
    <section className="py-16 bg-[#FAF3E0]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Banner - Makeup Kits Discount */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1602532386405-9f3cce79a00b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
              alt="Makeup Kits"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-6 h-6 text-[#D4AF37]" />
                <span className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
                  Special Offer
                </span>
              </div>
              <h3 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-white mb-3">
                Makeup Kits
              </h3>
              <p className="text-2xl font-bold text-[#D4AF37] mb-2">
                Up to 30% Off
              </p>
              <p className="text-white/90 mb-6 max-w-sm">
                Complete your look with our curated makeup kits
              </p>
              <button className="flex items-center gap-2 text-white group-hover:text-[#D4AF37] transition-colors w-fit">
                <span className="font-semibold">Shop Kits</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37] transition-all duration-300 rounded-2xl" />
          </motion.div>

          {/* Right Banner - Free Gift */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1759563876829-47c081a2afd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
              alt="Free Gift"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/70 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-center items-end p-8 md:p-12 text-right">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-6 h-6 text-[#D4AF37]" />
                <span className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
                  Limited Time
                </span>
              </div>
              <h3 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-white mb-3">
                Free Gift
              </h3>
              <p className="text-2xl font-bold text-[#D4AF37] mb-2">
                With Purchase
              </p>
              <p className="text-white/90 mb-6 max-w-sm">
                Spend AED 300 or more and receive a luxury gift
              </p>
              <button className="flex items-center gap-2 text-white group-hover:text-[#D4AF37] transition-colors">
                <span className="font-semibold">Learn More</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37] transition-all duration-300 rounded-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
