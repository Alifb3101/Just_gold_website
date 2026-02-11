import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { useApp } from '@/app/contexts/AppContext';
import { useCart } from '@/app/contexts/CartContext';
import { useWishlist } from '@/app/contexts/WishlistContext';
import type { ProductListItem } from '@/app/features/products/product-list.model';
import { motion } from 'motion/react';

interface ShopProductCardProps {
  product: ProductListItem & {
    alternateImage?: string;
    originalPrice?: number;
    category?: string;
    rating?: number;
    reviews?: number;
    badge?: string;
    colors?: string[];
  };
  onQuickView?: (product: ProductListItem) => void;
  onPrefetch?: () => void;
}

export const ShopProductCard = React.memo(function ShopProductCard({
  product,
  onQuickView,
  onPrefetch,
}: ShopProductCardProps) {
  const { convertPrice } = useApp();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [showQuickView, setShowQuickView] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const baseImage = product.thumbnailUrl || product.imageUrl;
  const hoverImage = product.hoverImageUrl || product.alternateImage;
  const hasHoverImage = Boolean(hoverImage);

  const numericId = Number(product.id);
  const isWishlisted = isInWishlist(numericId);
  const rating = product.rating ?? 0;
  const reviews = product.reviews ?? 0;
  const productPath = useMemo(() => {
    const slugSegment = product.slug ? `${product.id}-${product.slug}` : product.id;
    return `/product/${slugSegment}`;
  }, [product.id, product.slug]);

  const handleAddToCart = async () => {
    setIsAdding(true);
    addToCart({
      id: numericId,
      name: product.name,
      image: baseImage,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category ?? 'All',
      inStock: product.inStock ?? true,
      maxQuantity: 10,
    });
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(numericId);
    } else {
      addToWishlist({
        id: numericId,
        name: product.name,
        image: baseImage,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category ?? 'All',
        rating,
        reviews,
        inStock: product.inStock ?? true,
        addedDate: new Date().toISOString(),
      });
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <Link
      to={productPath}
      className="block"
      onMouseEnter={() => onPrefetch?.()}
      onFocus={() => onPrefetch?.()}
    >
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
      onMouseEnter={() => {
        setShowQuickView(true);
      }}
      onMouseLeave={() => {
        setShowQuickView(false);
      }}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.badge && (
          <div className="bg-[#D4AF37] text-white text-xs font-semibold px-3 py-1 rounded-full">
            {product.badge}
          </div>
        )}
        {product.originalPrice && (
          <div className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            SALE
          </div>
        )}
      </div>

      {/* Wishlist & Quick View Icons */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleWishlistToggle}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md"
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isWishlisted ? 'fill-[#D4AF37] text-[#D4AF37] scale-110' : 'text-gray-600'
            }`}
          />
        </button>
        {showQuickView && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleQuickView}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-all shadow-md"
          >
            <Eye className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-[#FAF3E0]">
        <img
          src={baseImage}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-all duration-500 ${
            hasHoverImage ? 'group-hover:scale-105 group-hover:opacity-0' : 'group-hover:scale-105'
          }`}
        />

        {hasHoverImage && (
          <img
            src={hoverImage}
            alt={`${product.name} alternate view`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
          />
        )}

        {/* Quick View Overlay */}
        {showQuickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center"
          >
            <button
              onClick={handleQuickView}
              className="bg-white text-[#D4AF37] px-6 py-2 rounded-full font-semibold hover:bg-[#D4AF37] hover:text-white transition-all z-20 relative"
            >
              Quick View
            </button>
          </motion.div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category Tag */}
        <p className="text-xs text-[#D4AF37] mb-1 font-medium">{product.category ?? 'Beauty'}</p>

        {/* Product Name */}
        <h3 className="font-medium text-[#3E2723] mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < rating
                    ? 'fill-[#D4AF37] text-[#D4AF37]'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-[#D4AF37]">({reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {convertPrice(product.originalPrice)}
            </span>
          )}
          <span className="font-bold text-lg text-[#D4AF37]">
            {convertPrice(product.price)}
          </span>
        </div>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-2 mb-3">
            {product.colors.slice(0, 4).map((color, index) => (
              <button
                key={index}
                className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-[#D4AF37] transition-colors"
                style={{ backgroundColor: color }}
                title={`Color ${index + 1}`}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-gray-500 flex items-center">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={isAdding || !product.inStock}
          className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 z-20 relative ${
            isAdding
              ? 'bg-green-500 text-white'
              : product.inStock
              ? 'border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAdding ? (
            <>
              <span className="animate-spin">✓</span>
              Added!
            </>
          ) : product.inStock ? (
            <>
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </>
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>

      {/* Golden Border Animation */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37]/50 transition-all duration-300 rounded-lg pointer-events-none" />
    </motion.div>
    </Link>
  );
});
