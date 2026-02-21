import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Trash2, Heart, ShoppingBag, Lock, RotateCcw, Headphones, X } from 'lucide-react';
import { useCart } from '@/app/contexts/CartContext';
import { useWishlist } from '@/app/contexts/WishlistContext';
import { useApp } from '@/app/contexts/AppContext';
import { QuantitySelector } from '@/app/components/ui/quantity-selector';
import { Input } from '@/app/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';

export function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal, applyPromoCode, promoCode, discount } = useCart();
  const { addToWishlist } = useWishlist();
  const { convertPrice, currency } = useApp();
  const [promoInput, setPromoInput] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);

  const shipping = subtotal > 500 ? 0 : 25;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + shipping - discountAmount;

  const handleMoveToWishlist = (item: any) => {
    addToWishlist(String(item.id), { name: item.name, image: item.image });
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
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-[#D4AF37]/30 p-4 md:p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 md:w-32 md:h-32 rounded-lg border border-[#D4AF37]/30 overflow-hidden bg-[#FAF3E0]">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        {/* Left: Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#3E2723] mb-1 line-clamp-2">{item.name}</h3>
                          <p className="text-sm text-[#D4AF37] mb-2">{item.category}</p>
                          {item.shade && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-600">Shade:</span>
                              <div className="w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: item.shade }} />
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
              ))}
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
                {shipping > 0 && (
                  <p className="text-xs text-[#D4AF37]">
                    Add {convertPrice(500 - subtotal)} more for FREE shipping!
                  </p>
                )}
                <p className="text-xs text-gray-500">All prices include VAT.</p>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%):</span>
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
                {!showPromoInput ? (
                  <button
                    onClick={() => setShowPromoInput(true)}
                    className="text-[#D4AF37] text-sm hover:underline font-medium"
                  >
                    Have a promo code?
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        className="border-[#D4AF37] flex-1"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A037] transition-colors font-semibold"
                      >
                        Apply
                      </button>
                    </div>
                    {promoCode && (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
                        <span className="text-sm text-green-700 font-medium">{promoCode} applied</span>
                        <button onClick={() => applyPromoCode('')} className="text-green-700 hover:text-green-900">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 mb-6">
                <button className="w-full bg-[#D4AF37] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#C4A037] transition-all hover:shadow-xl flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5" />
                  Proceed to Checkout
                  <ChevronRight className="w-5 h-5" />
                </button>
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