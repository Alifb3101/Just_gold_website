import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Trash2, Heart, ShoppingBag, Lock, RotateCcw, Headphones } from 'lucide-react';
import { useCart } from '@/app/contexts/CartContext';
import { useWishlist } from '@/app/contexts/WishlistContext';
import { useApp } from '@/app/contexts/AppContext';
import { preloadCheckoutPage } from '@/pages/prefetch';
import { QuantitySelector } from '@/app/components/ui/quantity-selector';
import { Input } from '@/app/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { SEOHead } from '@/app/components/seo';

const toProductSlugSegment = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    shipping,
    discountAmount,
    total,
    freeShippingRemaining,
    applyPromoCode,
    promoCode,
    isApplyingCoupon,
  } = useCart();
  const { addToWishlist } = useWishlist();
  const { convertPrice } = useApp();
  const [promoInput, setPromoInput] = useState('');

  const handleMoveToWishlist = (item: any) => {
    const variantId = item.variantModelNo && item.variantModelNo !== 'NULL'
      ? String(item.id)
      : undefined;
    addToWishlist(String(item.productId), variantId, { name: item.name, image: item.image });
    removeFromCart(String(item.id));
  };

  const handleApplyPromo = () => {
    if (promoInput.trim()) {
      applyPromoCode(promoInput);
      setPromoInput('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-center py-16 px-4">
          <div className="mb-6">
            <ShoppingBag className="w-24 h-24 mx-auto text-[#D4AF37] stroke-[1.5]" />
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#3E2723] mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">Let's fill it with golden beauty!</p>
          <Link to="/" className="inline-block bg-[#D4AF37] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#C4A037] transition-colors">
            Start Shopping 
          </Link>
        </div>
      </div>
    ); 
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      {/* SEO */}
      <SEOHead
        title="Shopping Cart"
        description="Review your shopping cart and proceed to checkout. Luxury cosmetics with free shipping on orders over $50."
        path="/cart"
        noIndex={true}
      />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#D4AF37] cursor-pointer">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#D4AF37] font-semibold">Cart</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#3E2723] text-center">
            Your Golden Cart
          </h1>
          <p className="text-center text-[#D4AF37] mt-2">({items.length} {items.length === 1 ? 'item' : 'items'})</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items - Left Column */}
          <div className="flex-1">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#3E2723]">Shopping Cart</h2>
              <Link to="/" className="text-[#D4AF37] hover:underline text-sm font-medium">
                Continue Shopping
              </Link>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {items.map((item) => {
                const slugSegment = toProductSlugSegment(item.name);
                const productPathBase = slugSegment
                  ? `/product/${item.productId}-${slugSegment}`
                  : `/product/${item.productId}`;
                const productPath = item.selectedVariantId
                  ? `${productPathBase}?selectedVariantId=${encodeURIComponent(item.selectedVariantId)}`
                  : productPathBase;

                return (
                <div key={item.id} className="bg-white rounded-lg border border-[#D4AF37]/30 p-4 md:p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link
                        to={productPath}
                        className="block w-20 h-20 md:w-32 md:h-32 rounded-lg border border-[#D4AF37]/30 overflow-hidden bg-[#FAF3E0]"
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        {/* Left: Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={productPath}
                            className="block"
                          >
                            <h3 className="font-semibold text-[#3E2723] mb-1 line-clamp-2 hover:text-[#D4AF37] transition-colors">{item.name}</h3>
                          </Link>
                          {item.category && <p className="text-sm text-[#D4AF37] mb-2">{item.category}</p>}
                          {item.colorPanelType && item.colorPanelValue && item.variantModelNo && item.variantModelNo !== 'NULL' && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-600">Color:</span>
                              <div className="w-5 h-5 rounded-full border border-gray-300 overflow-hidden">
                                {item.colorPanelType === 'image' ? (
                                  <img
                                    src={item.colorPanelValue}
                                    alt={`${item.name} color swatch`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : (
                                  <div
                                    className="w-full h-full"
                                    style={{ background: item.colorPanelValue }}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                          <p className={`text-sm ${item.inStock ? 'text-green-600' : 'text-orange-600'} mb-3`}>
                            {item.inStock ? 'In Stock' : 'Low Stock'}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => removeFromCart(String(item.id))}
                              className="text-sm text-gray-600 hover:text-red-500 underline"
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => handleMoveToWishlist(item)}
                              className="text-sm text-[#D4AF37] hover:text-[#B76E79] underline flex items-center gap-1"
                            >
                              <Heart className="w-4 h-4" />
                              Move to Wishlist
                            </button>
                          </div>
                        </div>

                        {/* Right: Quantity and Price */}
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-3">
                          {/* Quantity Selector */}
                          <QuantitySelector
                            quantity={item.quantity}
                            onIncrease={() => updateQuantity(String(item.id), item.quantity + 1)}
                            onDecrease={() => updateQuantity(String(item.id), item.quantity - 1)}
                            max={item.maxQuantity}
                            size="sm"
                          />

                          {/* Price */}
                          <div className="text-right">
                            {item.originalPrice && (
                              <p className="text-sm text-gray-400 line-through">
                                {convertPrice(item.originalPrice * item.quantity)}
                              </p>
                            )}
                            <p className="font-bold text-lg text-[#D4AF37]">
                              {convertPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>

            {/* Cart Actions */}
            <div className="flex items-center justify-between mt-6 pb-6 border-b border-gray-200">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-gray-600 hover:text-red-500 text-sm underline">
                    Clear Cart
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all items from your cart. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearCart} className="bg-red-500 hover:bg-red-600">
                      Clear Cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Order Summary - Right Column (Sticky) */}
          <div className="lg:w-[400px] flex-shrink-0">
            <div className="bg-white rounded-xl border-2 border-[#D4AF37] p-6 sticky top-4 shadow-lg">
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#3E2723] text-center mb-6">
                Order Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{convertPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping:</span>
                  <span className={shipping === 0 ? 'text-[#D4AF37] font-semibold' : 'font-semibold'}>
                    {shipping === 0 ? 'FREE' : convertPrice(shipping)}
                  </span>
                </div>
                {freeShippingRemaining !== null ? (
                  freeShippingRemaining > 0 ? (
                    <p className="text-xs text-[#D4AF37]">
                      Spend {convertPrice(freeShippingRemaining)} more to unlock free shipping.
                    </p>
                  ) : (
                    <p className="text-xs text-[#388E3C]">Free shipping is applied to your cart.</p>
                  )
                ) : null}
                <p className="text-xs text-gray-500">All prices include VAT.</p>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-semibold">-{convertPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-[#D4AF37] pt-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-[#3E2723]">Total:</span>
                  <span className="text-2xl font-bold text-[#D4AF37]">{convertPrice(total)}</span>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="mb-6">
                <p className="text-sm font-medium text-[#3E2723] mb-2">Promo Code</p>
                
                {/* Applied Promo Badge */}
                {promoCode && (
                  <div className="mb-3 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full text-xs">✓</span>
                      <span className="text-sm font-semibold text-green-700">{promoCode}</span>
                      {discountAmount > 0 && (
                        <span className="text-xs text-green-600">(-{convertPrice(discountAmount)})</span>
                      )}
                    </div>
                    <button
                      onClick={() => void applyPromoCode('')}
                      disabled={isApplyingCoupon}
                      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="flex-1 border-gray-300 uppercase text-sm"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={!promoInput.trim() || isApplyingCoupon}
                    className="px-4 py-2 bg-[#3E2723] text-white rounded-lg text-sm font-medium hover:bg-[#5D4037] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 mb-6">
                <Link
                  to="/checkout"
                  onMouseEnter={() => {
                    void preloadCheckoutPage();
                  }}
                  onFocus={() => {
                    void preloadCheckoutPage();
                  }}
                  className="w-full bg-[#D4AF37] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#C4A037] transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  Proceed to Checkout
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/"
                  className="block w-full border-2 border-[#D4AF37] text-[#D4AF37] py-3 rounded-lg font-semibold text-center hover:bg-[#F5E6D3] transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mb-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Lock className="w-8 h-8 mx-auto text-[#D4AF37] mb-2" />
                  <p className="text-xs text-gray-600">Secure Payment</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-8 h-8 mx-auto text-[#D4AF37] mb-2" />
                  <p className="text-xs text-gray-600">Free Returns</p>
                </div>
                <div className="text-center">
                  <Headphones className="w-8 h-8 mx-auto text-[#D4AF37] mb-2" />
                  <p className="text-xs text-gray-600">24/7 Support</p>
                </div>
              </div>

              {/* Accepted Payments */}
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">We Accept</p>
                <div className="flex items-center justify-center gap-3">
                  {['💳', '💵', '📱'].map((icon, index) => (
                    <div key={index} className="w-12 h-8 border border-gray-300 rounded flex items-center justify-center text-xl">
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}