import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useApp } from '@/app/contexts/AppContext';
import { useCart } from '@/app/contexts/CartContext';
import { useWishlist } from '@/app/contexts/WishlistContext';
import type { ProductListItem } from '@/app/features/products/product-list.model';

type ProductCardProps = {
  product: ProductListItem;
  onPrefetch?: () => void;
};

export const ProductCard = React.memo(function ProductCard({ product, onPrefetch }: ProductCardProps) {
  const { convertPrice } = useApp();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);

  const productPath = useMemo(() => {
    const slugSegment = product.slug ? `${product.id}-${product.slug}` : product.id;
    return `/product/${slugSegment}`;
  }, [product.id, product.slug]);

  const numericId = Number(product.id);
  const isWishlisted = Number.isFinite(numericId) ? isInWishlist(numericId) : false;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!Number.isFinite(numericId)) return;
    if (isWishlisted) {
      removeFromWishlist(numericId);
      return;
    }
    addToWishlist({
      id: numericId,
      name: product.name,
      image: product.thumbnailUrl || product.imageUrl,
      price: product.price,
      category: 'All',
      rating: 0,
      reviews: 0,
      inStock: product.inStock,
      addedDate: new Date().toISOString(),
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!Number.isFinite(numericId) || !product.inStock) return;
    setIsAdding(true);
    addToCart({
      id: numericId,
      name: product.name,
      image: product.thumbnailUrl || product.imageUrl,
      price: product.price,
      category: 'All',
      inStock: product.inStock,
      maxQuantity: 10,
    });
    window.setTimeout(() => setIsAdding(false), 800);
  };

  const image = product.thumbnailUrl || product.imageUrl;
  const hoverImage = product.hoverImageUrl;

  return (
    <Link
      to={productPath}
      className="block"
      onMouseEnter={() => onPrefetch?.()}
      onFocus={() => onPrefetch?.()}
    >
      <div className="group relative bg-white rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isWishlisted ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-600'
            }`}
          />
        </button>

        <div className="relative aspect-square overflow-hidden bg-[#FAF3E0]">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 ${
              hoverImage ? 'group-hover:scale-105 group-hover:opacity-0' : 'group-hover:scale-105'
            }`}
          />
          {hoverImage ? (
            <img
              src={hoverImage}
              alt={`${product.name} alternate view`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
            />
          ) : null}
        </div>

        <div className="p-4">
          <h3 className="font-medium text-[#3E2723] mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-lg text-[#D4AF37]">{convertPrice(product.price)}</span>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAdding}
              className={`px-3 py-2 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors ${
                product.inStock
                  ? 'border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              } ${isAdding ? 'opacity-80' : ''}`}
            >
              <ShoppingBag className="w-4 h-4" />
              {isAdding ? 'Adding…' : 'Add'}
            </button>
          </div>
          {!product.inStock ? <p className="text-xs text-gray-500 mt-2">Out of stock</p> : null}
        </div>

        <div
          className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37]/50 transition-all duration-300 rounded-lg pointer-events-none"
          aria-hidden
        />
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';
