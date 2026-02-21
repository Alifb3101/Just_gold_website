import React, { useMemo, useState, useCallback } from 'react';
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

export const ProductCard = React.memo(function ProductCard({
  product,
  onPrefetch,
}: ProductCardProps) {
  const { convertPrice } = useApp();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [isAdding, setIsAdding] = useState(false);

  const productPath = useMemo(() => {
    const slugSegment = product.slug
      ? `${product.id}-${product.slug}`
      : product.id;
    return `/product/${slugSegment}`;
  }, [product.id, product.slug]);

  const variantId = String(product.id);
  const isWishlisted = isInWishlist(variantId);

  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isWishlisted) {
        removeFromWishlist(variantId);
      } else {
        addToWishlist(variantId, {
          name: product.name,
          image: product.thumbnailUrl || product.imageUrl,
        });
      }
    },
    [variantId, isWishlisted, addToWishlist, removeFromWishlist, product]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!product.inStock) return;

      setIsAdding(true);

      addToCart(variantId, 1, {
        name: product.name,
        image: product.thumbnailUrl || product.imageUrl,
      });

      setTimeout(() => setIsAdding(false), 700);
    },
    [variantId, product, addToCart]
  );

  const image = product.thumbnailUrl || product.imageUrl;
  const hoverImage = product.hoverImageUrl;

  return (
    <Link
      to={productPath}
      className="block h-full"
      onMouseEnter={() => onPrefetch?.()}
      onFocus={() => onPrefetch?.()}
    >
      <div className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-[#E9E3D8] transition-all duration-300 hover:shadow-sm">

        {/* Wishlist */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted
                ? 'fill-[#C6A94A] text-[#C6A94A]'
                : 'text-[#9A8F84]'
            }`}
          />
        </button>

        {/* Image (ORIGINAL HOVER FUNCTIONALITY PRESERVED) */}
        <div className="relative aspect-square overflow-hidden bg-[#F6F1EA]">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 ${
              hoverImage
                ? 'group-hover:scale-105 group-hover:opacity-0'
                : 'group-hover:scale-105'
            }`}
          />
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${product.name} alternate view`}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3 sm:p-4">

          {/* Title */}
          <h3 className="
            text-[13px]
            [@media(max-width:350px)]:text-[12px]
            sm:text-base
            font-semibold
            text-[#4A3F35]
            leading-snug
            line-clamp-2
            min-h-[2.5rem]
          ">
            {product.name}
          </h3>

          {/* Description */}
          {product.shortDescription && (
            <p className="
              mt-1
              text-[11px]
              [@media(max-width:350px)]:text-[10px]
              sm:text-sm
              text-[#8C7A6B]
              line-clamp-2
              min-h-[2rem]
            ">
              {product.shortDescription}
            </p>
          )}

          <div className="flex-1" />

          {/* Price */}
          <div className="mt-3">
            <span className="
              text-[14px]
              [@media(max-width:350px)]:text-[13px]
              sm:text-lg
              font-semibold
              text-[#C6A94A]
            ">
              {convertPrice(product.price)}
            </span>
          </div>

          {/* Add To Bag (UI Enhanced, Functionality Same) */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
            className={`
              mt-3
              w-full
              h-[38px]
              [@media(max-width:350px)]:h-[34px]
              sm:h-11
              text-[11px]
              [@media(max-width:350px)]:text-[10px]
              sm:text-sm
              rounded-lg
              font-medium
              flex items-center justify-center gap-2
              transition-all duration-200
              ${
                product.inStock
                  ? `
                    border border-[#C6A94A]
                    text-[#8A6E2F]
                    bg-white
                    hover:bg-[#F5EBD2]
                    active:scale-[0.98]
                  `
                  : `
                    bg-[#EAE4DB]
                    text-[#A79B8F]
                    cursor-not-allowed
                  `
              }
              ${isAdding ? 'opacity-70' : ''}
            `}
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {isAdding ? 'ADDING...' : 'ADD TO BAG'}
          </button>

        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';
 