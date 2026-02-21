import React, { useMemo, useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { useApp } from '@/app/contexts/AppContext';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
    rating: number;
    reviews: number;
    badge?: string;
    slug?: string;
    description?: string;
  };
}

export const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  const { convertPrice } = useApp();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productSlug = useMemo(() => {
    const normalized = (product.slug ?? product.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    return `${product.id}-${normalized}`;
  }, [product.id, product.name, product.slug]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Link to={`/product/${productSlug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="group relative bg-white rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
      >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-3 right-3 z-10 bg-[#D4AF37] text-white text-xs font-semibold px-3 py-1 rounded-full">
          {product.badge}
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className="absolute top-3 left-3 z-20 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
      >
        <Heart
          className={`w-4 h-4 ${
            isWishlisted ? 'fill-[#B76E79] text-[#B76E79]' : 'text-[#4A4A4A]'
          }`}
        />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-[#FAF3E0]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <h3
          className="font-bold text-lg md:text-xl text-[#3E2723] leading-tight line-clamp-2 group-hover:text-[#D4AF37] transition-colors"
          style={{ fontWeight: 700 }}
        >
          {product.name}
        </h3>

        {product.description ? (
          <p className="text-sm text-gray-600 leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>
        ) : null}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < product.rating
                    ? 'fill-[#D4AF37] text-[#D4AF37]'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-[#4A4A4A]">({product.reviews})</span>
        </div>

        {/* Price */}
        <p className="font-semibold text-lg text-[#D4AF37]">
          {convertPrice(product.price)}
        </p>
      </div>

      {/* Golden Border Animation */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37]/30 transition-all duration-300 rounded-lg pointer-events-none" />
    </motion.div>
    </Link>
  );
});
