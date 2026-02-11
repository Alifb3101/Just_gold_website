import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Share2, Star, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { fetchProductByIdSlug } from '@/app/api/products/product-details.api';
import type { Product, ProductImage, ProductShade } from '@/app/features/products/product-details.model';
import { useCart } from '@/app/contexts/CartContext';

// ============================================
// 📦 MAIN COMPONENT
// ============================================

export function ProductDetailsPage() {
  const { productSlug } = useParams<{ productSlug: string }>();
  const { addToCart } = useCart();

  // ============================================
  // 🎯 STATE MANAGEMENT
  // ============================================
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedShade, setSelectedShade] = useState('');
  const [variantMedia, setVariantMedia] = useState<(ProductImage | null)[]>([null, null]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  const { productId, slug } = useMemo(() => {
    const match = (productSlug ?? '').match(/^(\d+)-(.*)$/);
    if (match) {
      return { productId: match[1], slug: match[2] };
    }
    return { productId: productSlug ?? '', slug: undefined };
  }, [productSlug]);

  const {
    data: product,
    isPending: isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: ({ signal }) => fetchProductByIdSlug(productId, slug, signal),
    enabled: Boolean(productId),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!product) return;
    const defaultShade = product.shades[0]?.id ?? '';
    setSelectedShade(defaultShade);
    setSelectedImage(0);
    const defaultVariantImages = product.images.filter((img) => img.variantId === defaultShade);
    const fallbackImages = product.images.filter((img) => !img.variantId).slice(0, 2);
    setVariantMedia([
      defaultVariantImages[0] ?? fallbackImages[0] ?? null,
      defaultVariantImages[1] ?? fallbackImages[1] ?? null,
    ]);
    setActiveTab(product.tabs[0]?.id ?? '');
    setExpandedAccordion(null);
    setQuantity(1);
  }, [product]);

  // ============================================
  // 🎬 HANDLERS
  // ============================================
  
  const selectedShadeData = useMemo(() => {
    if (!product) return undefined;
    return product.shades.find((shade) => shade.id === selectedShade) ?? product.shades[0];
  }, [product, selectedShade]);

  const maxStock = selectedShadeData?.stock ?? 0;
  const effectivePrice = selectedShadeData?.discountPrice ?? selectedShadeData?.price ?? product?.price ?? 0;
  const originalPrice = selectedShadeData?.discountPrice ? selectedShadeData.price : undefined;
  const discountPercent = selectedShadeData?.discountPrice && selectedShadeData.price
    ? Math.max(0, Math.round((1 - (selectedShadeData.discountPrice / selectedShadeData.price)) * 100))
    : 0;
  const isOutOfStock = maxStock === 0;

  const baseMedia: ProductImage[] = useMemo(() => {
    if (!product) return [];
    return product.images.filter((img) => !img.variantId);
  }, [product]);

  const gallery: (ProductImage | null)[] = useMemo(() => [variantMedia[0], variantMedia[1], ...baseMedia], [variantMedia, baseMedia]);

  useEffect(() => {
    if (!selectedShade) return;
    setSelectedImage(0);
    setQuantity(1);
  }, [selectedShade]);

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      setQuantity((prev) => (maxStock ? Math.min(prev + 1, maxStock) : prev + 1));
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  const handleAddToBag = () => {
    if (!product || !selectedShadeData) return;
    if (maxStock && quantity > maxStock) return;

    addToCart(
      {
        id: Number(selectedShadeData.id),
        name: `${product.name} - ${selectedShadeData.name}`,
        image: selectedShadeData.imageUrl || selectedShadeData.secondaryImageUrl || variantMedia[0]?.url || '',
        price: effectivePrice,
        originalPrice,
        category: 'Beauty',
        inStock: maxStock > 0,
        maxQuantity: maxStock || 10,
      },
      quantity
    );
  };

  const handleShadeSelect = (shadeId: string) => {
    if (!product) return;
    setSelectedShade(shadeId);
    const variantImages = product.images.filter((image) => image.variantId === shadeId);
    setVariantMedia([variantImages[0] ?? null, variantImages[1] ?? null]);
    setSelectedImage(0);
  };

  const handleMediaSelect = (index: number) => {
    const maxIndex = Math.max(0, gallery.length - 1);
    setSelectedImage(Math.max(0, Math.min(index, maxIndex)));
  };

  const getThumbnailSrc = (image: ProductImage | null) => {
    if (!image) return '';
    if (image.type === 'video') {
      return (
        image.thumbnail ||
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"%3E%3Crect width="120" height="120" rx="16" fill="%23F1E8DA"/%3E%3Cpolygon points="48,35 88,60 48,85" fill="%23D4AF37"/%3E%3C/svg%3E'
      );
    }
    return image.url;
  };

  const toggleAccordion = (id: string) => {
    setExpandedAccordion(expandedAccordion === id ? null : id);
  };

  if (!productSlug) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-sm text-red-600">
        Invalid product URL.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-sm text-gray-500">
        Loading product...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-sm text-red-600">
        {(error as Error)?.message || 'Unable to load product.'}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-sm text-red-600">
        Product not found.
      </div>
    );
  }

  const currentImage = gallery[selectedImage] ?? gallery[0];

  // ============================================
  // 🎨 RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb - Desktop Only */}
      <div className="hidden md:block bg-[#FFF9F0] border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="hover:text-[#D4AF37] cursor-pointer">Home</span>
            <span>/</span>
            <span className="hover:text-[#D4AF37] cursor-pointer">Makeup</span>
            <span>/</span>
            <span className="hover:text-[#D4AF37] cursor-pointer">EVEN MORE MAGIC!</span>
            <span>/</span>
            <span className="hover:text-[#D4AF37] cursor-pointer">Makeup Collections</span>
            <span>/</span>
            <span className="hover:text-[#D4AF37] cursor-pointer">Airbrush Effect</span>
            <span>/</span>
            <span className="text-[#D4AF37] uppercase font-semibold">AIRBRUSH FLAWLESS BLUR CONCEALER</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-4 md:py-8 lg:py-12 tablet-landscape-container">
        
        {/* ============================================ */}
        {/* 📸 PRODUCT SECTION (Image + Details)        */}
        {/* ============================================ */}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 lg:gap-16 mb-8 md:mb-16">
          
          {/* ==================== LEFT: PRODUCT DETAILS ==================== */}
          <div className="order-1 lg:order-2 lg:max-w-[600px]">
            
            {/* Mobile Layout */}
            <div className="lg:hidden">
              {/* 1. Small Title */}
              <h1 className="text-sm font-semibold text-[#3E2723] mb-3 uppercase">
                {product.name}
              </h1>
              
              {/* 2. Main Image */}
              <div
                className="bg-white rounded-xl overflow-hidden border border-gray-100 mb-3"
                style={{ aspectRatio: '2 / 3' }}
              >
                <div className="tablet-landscape-gallery">
                {currentImage ? (
                  currentImage.type === 'video' ? (
                    <video
                      key={currentImage.id}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                      preload="metadata"
                      poster={getThumbnailSrc(currentImage)}
                    >
                      <source src={currentImage.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={currentImage.url}
                      alt={currentImage.alt}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No media available
                  </div>
                )}
                </div>
              </div>

              {/* 3. Thumbnail Gallery */}
              {gallery.some(Boolean) && (
                <div className="mb-4">
                  <div className="flex gap-2 overflow-x-auto pb-2 tablet-landscape-thumbnails">
                    {gallery.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleMediaSelect(index)}
                        className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                          selectedImage === index
                            ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] scale-105'
                            : 'border-gray-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                          {image ? (
                            <img
                              src={getThumbnailSrc(image)}
                              alt={image.alt}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#F4EFE6]" />
                          )}
                        {image?.type === 'video' && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white/90 rounded-full flex items-center justify-center">
                              <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-[#D4AF37] border-b-[3px] border-b-transparent ml-0.5"></div>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Big Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#3E2723] mb-2 leading-tight">
                {product.name}
              </h2>
              <p className="text-base text-[#D4AF37] font-semibold mb-4">
                {product.productModelNo}
              </p>

              {/* 5. Description */}
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {product.description}
              </p>

              {/* 6. Price */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-500">{product.currency}</span>
                  <span className="text-3xl font-bold text-[#3E2723]">
                    {effectivePrice.toFixed(2)}
                  </span>
                </div>
                {originalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-400 line-through">{originalPrice.toFixed(2)}</span>
                    <span className="text-sm font-semibold text-red-600">-{discountPercent}%</span>
                  </div>
                )}
              </div>

              {/* 7. Shade Selection */}
              {product.shades.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                    CHOOSE SHADE: {selectedShadeData?.name} {selectedShadeData?.variantModelNo}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {product.shades.map((shade) => (
                      <button
                        key={shade.id}
                        onClick={() => handleShadeSelect(shade.id)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedShade === shade.id
                            ? 'border-[#D4AF37] scale-110 shadow-lg'
                            : 'border-gray-300 hover:border-[#D4AF37]'
                        }`}
                        style={{ backgroundColor: shade.colorHex }}
                        title={shade.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 8. Quantity Selector - Mobile */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                  QUANTITY
                </label>
                <div className="flex items-center">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      className="p-2 hover:bg-gray-100 transition"
                      disabled={quantity === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="p-2 hover:bg-gray-100 transition"
                      disabled={maxStock !== 0 && quantity >= maxStock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {maxStock > 0 && (
                    <span className="ml-3 text-xs text-gray-500">Max {maxStock} available</span>
                  )}
                </div>
              </div>

              {/* 9. Add to Bag Button - Mobile */}
              <div className="mb-6">
                <button
                  onClick={handleAddToBag}
                  disabled={isOutOfStock}
                  className={`w-full py-3 px-6 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-[#3E2723] text-white hover:bg-[#2E1F1B]'
                  }`}
                >
                  {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}
                </button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-[32px] font-bold text-[#3E2723] mb-1 md:mb-2 lg:mb-3 leading-tight tracking-tight">
                {product.name}
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-[#D4AF37] font-semibold mb-3 md:mb-4 lg:mb-5">
                {product.productModelNo ? `Model No: ${product.productModelNo}` : product.subtitle}
              </p>

              {/* Description */}
              <p className="text-sm md:text-base lg:text-[15px] text-gray-600 mb-4 md:mb-6 lg:mb-7 leading-relaxed">
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-center gap-4 mb-4 md:mb-6 lg:mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-500">{product.currency}</span>
                  <span className="text-3xl font-bold text-[#3E2723]">
                    {effectivePrice.toFixed(2)}
                  </span>
                </div>
                {originalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-400 line-through">{originalPrice.toFixed(2)}</span>
                    <span className="text-sm font-semibold text-red-600">-{discountPercent}%</span>
                  </div>
                )}
                {maxStock > 0 ? (
                  <span className="text-sm text-green-600 font-semibold">In stock: {maxStock}</span>
                ) : (
                  <span className="text-sm text-red-600 font-semibold">Out of stock</span>
                )}
              </div>

              {/* Shade Selection */}
              {product.shades.length > 0 && (
                <div className="mb-4 md:mb-6">
                  <label className="block text-xs md:text-sm font-semibold text-[#3E2723] mb-2 md:mb-3">
                    CHOOSE SHADE: {selectedShadeData?.name} {selectedShadeData?.variantModelNo}
                  </label>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {product.shades.map((shade) => (
                      <button
                        key={shade.id}
                        onClick={() => handleShadeSelect(shade.id)}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all ${
                          selectedShade === shade.id
                            ? 'border-[#D4AF37] scale-110 shadow-lg'
                            : 'border-gray-300 hover:border-[#D4AF37]'
                        }`}
                        style={{ backgroundColor: shade.colorHex }}
                        title={shade.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector - Desktop Only */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#3E2723] mb-3">
                  QUANTITY
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      className="p-3 hover:bg-gray-100 transition"
                      disabled={quantity === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="p-3 hover:bg-gray-100 transition"
                      disabled={maxStock !== 0 && quantity >= maxStock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {maxStock > 0 && (
                    <span className="text-sm text-gray-500">Max {maxStock} available</span>
                  )}
                </div>
              </div>

              {/* Stock Status - Desktop Only */}
              <div>
                {maxStock > 0 ? (
                  <p className="text-green-600 font-semibold">✓ In Stock ({maxStock} available)</p>
                ) : (
                  <p className="text-red-600 font-semibold">Out of Stock</p>
                )}
              </div>

              {/* CTA - Desktop */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
                <button
                  onClick={handleAddToBag}
                  disabled={isOutOfStock}
                  className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-[#3E2723] text-white hover:bg-[#2E1F1B]'
                  }`}
                >
                  {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}
                </button>
                <button
                  className="w-full sm:w-auto px-6 py-3 border-2 border-[#D4AF37] text-[#D4AF37] rounded-lg font-semibold hover:bg-[#D4AF37] hover:text-white transition-colors"
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? 'Notify Me' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
          
          {/* ==================== RIGHT: IMAGES - DESKTOP ONLY ==================== */}
          <div className="order-2 lg:order-1 hidden lg:block">
            
            {/* Desktop: Vertical Thumbnail + Main Image Layout */}
            <div className="flex gap-4 desktop-carousel-container">
              {/* Vertical Thumbnail Carousel */}
              <div className="flex flex-col gap-2 w-24 h-[600px] overflow-y-auto desktop-carousel">
                {gallery.map((image, index) => ( 

                  
                  <button
                    key={index}
                    onClick={() => handleMediaSelect(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === index
                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] ring-offset-2'
                        : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-[#D4AF37]'
                    }`}
                  >
                    {image ? (
                      <img
                        src={getThumbnailSrc(image)}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F4EFE6]" />
                    )}
                    {image?.type === 'video' && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-[#D4AF37] border-b-[6px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Main Display Area */}
              <div
                className="flex-1 bg-white rounded-2xl overflow-hidden max-h-[720px] flex items-center justify-center"
                style={{ aspectRatio: '2 / 3' }}
              >
                {currentImage ? (
                  currentImage.type === 'video' ? (
                    <video
                      key={currentImage.id}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-contain"
                      poster={getThumbnailSrc(currentImage)}
                    >
                      <source src={currentImage.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={currentImage.url}
                      alt={currentImage.alt}
                      className="w-full h-full object-contain"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No media available
                  </div>
                )}
              </div>
            </div>

            {/* Tablet Landscape: Horizontal Thumbnail + Main Image Layout */}
            <div className="tablet-landscape-layout" style={{display: 'none'}}>
              {/* Main Display Area */}
              <div className="tablet-landscape-image flex items-center justify-center" style={{ aspectRatio: '2 / 3' }}>
                {currentImage ? (
                  currentImage.type === 'video' ? (
                    <video
                      key={currentImage.id}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-contain"
                      poster={currentImage.thumbnail}
                    >
                      <source src={currentImage.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                        <img
                          src={currentImage.url}
                          alt={currentImage.alt}
                          className="w-full h-full object-contain"
                        />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No media available
                  </div>
                )}
              </div>

              {/* Horizontal Thumbnail Gallery Below Main Image */}
              <div className="tablet-landscape-thumbnails">
                {gallery.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleMediaSelect(index)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === index
                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] scale-105'
                        : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-[#D4AF37]'
                    }`}
                  >
                    {image ? (
                      <img
                        src={getThumbnailSrc(image)}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F4EFE6]" />
                    )}
                    {image?.type === 'video' && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-[#D4AF37] border-b-[4px] border-b-transparent ml-0.5"></div>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* ============================================ */}
        {/* �📑 TABS SECTION (Desktop)                   */}
        {/* ============================================ */}
        
        {product.tabs.length > 0 && (
          <div className="hidden lg:block mb-16">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 mb-8">
            {product.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 font-bold transition-all ${
                  activeTab === tab.id
                    ? 'text-[#D4AF37] border-b-4 border-[#D4AF37]'
                    : 'text-gray-500 hover:text-[#3E2723]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="prose max-w-none">
            {product.tabs.map(
              (tab) =>
                activeTab === tab.id && (
                  <div key={tab.id} className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {tab.content}
                  </div>
                )
            )}
          </div>
          </div>
        )}

        {/* ============================================ */}
        {/* 📱 ACCORDION SECTION (Mobile)               */}
        {/* ============================================ */}
        
        {product.tabs.length > 0 && (
          <div className="lg:hidden mb-8 md:mb-16">
            {product.tabs.map((tab) => (
              <div key={tab.id} className="border-b border-gray-200">
                <button
                  onClick={() => toggleAccordion(tab.id)}
                  className="w-full flex items-center justify-between py-3 md:py-4 text-left text-sm md:text-base font-bold text-[#3E2723]"
                >
                  {tab.label}
                  {expandedAccordion === tab.id ? (
                    <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </button>
                {expandedAccordion === tab.id && (
                  <div className="pb-3 md:pb-4 text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {tab.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}


        {/* ⭐ REVIEWS SECTION                          */}
       
        
        <div className="border-t border-gray-200 pt-6 md:pt-12">
          {/* Reviews Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#3E2723] mb-2">
                Customer Reviews
              </h2>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.averageRating)
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-lg">{product.averageRating}</span>
                <span className="text-gray-500">({product.totalReviews} reviews)</span>
              </div>
            </div>
            <button className="w-full md:w-auto px-4 md:px-6 py-2.5 md:py-3 border-2 border-[#D4AF37] text-[#D4AF37] rounded-lg text-sm md:text-base font-bold hover:bg-[#D4AF37] hover:text-white transition-all">
              Write a Review
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 md:space-y-6">
            {product.reviews.length === 0 ? (
              <p className="text-sm md:text-base text-gray-500">No reviews yet.</p>
            ) : (
              product.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 md:pb-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 md:mb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm md:text-base text-[#3E2723]">{review.name}</span>
                        {review.verified && (
                          <span className="text-[10px] md:text-xs bg-green-100 text-green-700 px-2 py-0.5 md:py-1 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 md:w-4 md:h-4 ${
                                i < review.rating
                                  ? 'fill-[#D4AF37] text-[#D4AF37]'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs md:text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-6 md:mt-8 pb-24 md:pb-0">
            <button className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg text-sm md:text-base font-semibold hover:border-[#D4AF37] transition-all">
              Load More Reviews
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
