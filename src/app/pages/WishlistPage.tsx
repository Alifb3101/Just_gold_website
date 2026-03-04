import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, ShoppingBag, Trash2, Share2, Star } from 'lucide-react';
import { useWishlist } from '@/app/contexts/WishlistContext';
import { useCart } from '@/app/contexts/CartContext';
import { useApp } from '@/app/contexts/AppContext';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

const toProductSlugSegment = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { convertPrice } = useApp();
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  const handleAddToCart = async (item: any) => {
    const itemId = String(item.id);
    if (!item.inStock || addingItemId === itemId) return;

    setAddingItemId(itemId);
    await addToCart(
      String(item.productId),
      item.productVariantId ? String(item.productVariantId) : undefined,
      1,
      { name: item.name, image: item.image }
    );
    setAddingItemId(null);
    setAddedItemId(itemId);
    window.setTimeout(() => {
      setAddedItemId((current) => (current === itemId ? null : current));
    }, 1200);
  };

  const handleAddAllToCart = () => {
    items.forEach(item => {
      if (item.inStock) {
        handleAddToCart(item);
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-center py-16 px-4">
          <div className="mb-6 relative">
            <Heart className="w-24 h-24 mx-auto text-[#D4AF37] stroke-[1.5]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-xl animate-pulse" />
            </div>
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#3E2723] mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-gray-600 mb-8">Save your favorites here for later</p>
          <Link to="/" className="inline-block bg-[#D4AF37] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#C4A037] transition-colors">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#D4AF37] cursor-pointer">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#D4AF37] font-semibold">Wishlist</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Heart className="w-8 h-8 text-[#D4AF37] fill-[#D4AF37]" />
            <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#3E2723]">
              Your Wishlist
            </h1>
          </div>
          <p className="text-center text-[#D4AF37]">
            You have {items.length} {items.length === 1 ? 'saved item' : 'saved items'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddAllToCart}
              className="flex items-center gap-2 bg-[#D4AF37] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#C4A037] transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Add All to Cart
            </button>
          </div>

          <button className="flex items-center gap-2 text-[#D4AF37] hover:text-[#B76E79] transition-colors">
            <Share2 className="w-5 h-5" />
            Share Wishlist
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item, index) => {
            const slugSegment = toProductSlugSegment(item.name);
            const productPath = slugSegment
              ? `/product/${item.productId}-${slugSegment}`
              : `/product/${item.productId}`;

            return (
            <Link key={item.id} to={productPath} className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative bg-white rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFromWishlist(String(item.productId), item.productVariantId ? String(item.productVariantId) : undefined);
                }}
                className="absolute top-3 right-3 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-md group"
              >
                <Heart className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37] group-hover:fill-white group-hover:text-white transition-all" />
              </button>

              {/* Stock Badge */}
              <div className="absolute top-3 left-3 z-10">
                {item.inStock ? (
                  <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    In Stock
                  </div>
                ) : (
                  <div className="bg-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-[#FAF3E0]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Category */}
                <p className="text-xs text-[#D4AF37] mb-1 font-medium">{item.category}</p>

                {/* Product Name */}
                <h3 className="-[#3E2723] mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors min-h-[2.5rem]">
                  {item.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < (item.rating ?? 0)
                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#D4AF37]">({item.reviews})</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  {typeof (item as any).discountedPrice === 'number' && (item as any).discountedPrice < item.price ? (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        {convertPrice(item.price)}
                      </span>
                      <span className="font-bold text-lg text-[#D4AF37]">
                        {convertPrice((item as any).discountedPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-lg text-[#D4AF37]">
                      {convertPrice(item.price)}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(item);
                  }}
                  disabled={!item.inStock || addingItemId === item.id}
                  className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 z-20 relative ${
                    addedItemId === item.id
                      ? 'bg-green-500 text-white'
                      : addingItemId === item.id
                      ? 'bg-[#C4A037] text-white'
                      : item.inStock
                      ? 'bg-[#D4AF37] text-white hover:bg-[#C4A037]'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {addingItemId === item.id ? (
                    <>
                      <span className="animate-spin">◌</span>
                      Adding...
                    </>
                  ) : addedItemId === item.id ? (
                    <>
                      <span>✓</span>
                      Added!
                    </>
                  ) : item.inStock ? (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </>
                  ) : (
                    'Notify Me'
                  )}
                </button>

                {/* Added Date */}
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Added {formatDistanceToNow(new Date(item.addedDate), { addSuffix: true })}
                </p>
              </div>

              {/* Golden Border Animation */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37]/50 transition-all duration-300 rounded-lg pointer-events-none" />
            </motion.div>
            </Link>
          )})}
        </div>
      </div>
    </div>
  );
}