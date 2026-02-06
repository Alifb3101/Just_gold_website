import React from 'react';
import { Instagram } from 'lucide-react';
import { motion } from 'motion/react';

const instagramImages = [
  'https://images.unsplash.com/photo-1608979002523-9d5c42b613de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500',
  'https://images.unsplash.com/photo-1758297679736-2e6ff92d2021?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500',
  'https://images.unsplash.com/photo-1759794701417-2faa88125815?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500',
  'https://images.unsplash.com/photo-1625480858342-4f691f627153?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500',
  'https://images.unsplash.com/photo-1758272421578-840698d05a00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500',
  'https://images.unsplash.com/photo-1760264558903-b9fdc0857a67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500',
];

export function InstagramFeed() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Instagram className="w-8 h-8 text-[#D4AF37]" />
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#3E2723]">
              Join the Gold Standard
            </h2>
          </div>
          <p className="text-[#4A4A4A] mb-4">
            Share your Just Gold moments with #JustGold
          </p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#C9B037] font-semibold transition-colors"
          >
            @JustGoldCosmetics
          </a>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramImages.map((image, index) => (
            <motion.a
              key={index}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
            >
              <img
                src={image}
                alt={`Instagram post ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                <span className="text-white font-semibold text-sm flex items-center gap-1">
                  <Instagram className="w-4 h-4" />
                  #JustGold
                </span>
              </div>

              {/* Golden Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37] transition-all duration-300 rounded-lg" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
