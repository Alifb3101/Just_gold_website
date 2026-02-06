import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Share2, Star, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';

// ============================================
// 🎯 TYPE DEFINITIONS (Ready for API)
// ============================================

interface ProductImage {
  id: number;
  url: string;
  alt: string;
  type: 'image' | 'video';
  thumbnail?: string;
}

interface ProductShade {
  id: string;
  name: string;
  colorHex: string;
}

interface ProductTab {
  id: string;
  label: string;
  content: string | React.ReactNode;
}

interface ProductReview {
  id: number;
  name: string;
  rating: number;
  date: string;
  verified: boolean;
  comment: string;
}

interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  currency: string;
  description: string;
  images: ProductImage[];
  shades: ProductShade[];
  tabs: ProductTab[];
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
  inStock: boolean;
}

// ============================================
// 🎨 DUMMY DATA (Replace with API call)
// ============================================

const DUMMY_PRODUCT: Product = {
  id: '1',
  name: 'AIRBRUSH FLAWLESS BLUR CONCEALER',
  subtitle: '5.5 MEDIUM',
  price: 175.00,
  currency: 'AED',
  description: 'Light-as-AIR, full-coverage concealer with elastic stretch and up to 24 hour creaseless wear*',
  images: [
    { id: 1, url: 'https://makeupempire.in/cdn/shop/files/pl_2_1120x.jpg?v=1738925922', alt: 'Product Main', type: 'image' },
    { id: 2, url: 'https://makeupempire.in/cdn/shop/files/DSC08791_1120x.jpg?v=1764156833', alt: 'Product Detail', type: 'image' },
    { id: 3, url: 'https://makeupempire.in/cdn/shop/files/9_be052f7c-5561-40a8-a3aa-56b1e62ba4d9_1120x.jpg?v=1764156833', alt: 'Product Usage', type: 'image' },
    { id: 4, url: 'https://makeupempire.in/cdn/shop/files/IMG_2028_1120x.jpg?v=1764156833', alt: 'Product Application', type: 'image' },
    { id: 5, url: 'https://makeupempire.in/cdn/shop/files/1_8f4a07fd-02da-477d-9ae4-dd3c9080477e_1120x.jpg?v=1764156833', alt: 'Product Texture', type: 'image' },
    { id: 6, url: 'https://makeupempire.in/cdn/shop/videos/c/vp/995d2f2a4e0441199742821cb91e9440/995d2f2a4e0441199742821cb91e9440.HD-1080p-2.5Mbps-63858587.mp4?v=0', alt: 'Product Video', type: 'video', thumbnail: 'https://makeupempire.in/cdn/shop/files/pl_2_1120x.jpg?v=1738925922' },
  ],
  shades: [
    { id: '1', name: '1 Fair', colorHex: '#F5D5C0' },
    { id: '2', name: '2 Light', colorHex: '#F0C9B0' },
    { id: '3', name: '3 Medium', colorHex: '#E8B896' },
    { id: '4', name: '4 Tan', colorHex: '#D9A87E' },
    { id: '5', name: '5 Deep', colorHex: '#C89466' },
  ],
  tabs: [
    {
      id: 'how-to-apply',
      label: 'HOW TO APPLY',
      content: `Apply concealer with the precision applicator. Blend seamlessly with your fingertips or a brush. Build coverage as needed for a flawless finish.`,
    },
    {
      id: 'benefits',
      label: 'BENEFITS',
      content: `24-hour creaseless wear • Full coverage • Lightweight formula • Hydrating ingredients • Brightening effect`,
    },
    {
      id: 'key-features',
      label: 'KEY FEATURES',
      content: `Elastic stretch technology • Air-light texture • Long-lasting formula • Color-correcting pigments`,
    },
    {
      id: 'ingredients',
      label: 'INGREDIENTS',
      content: `Water, Cyclopentasiloxane, Titanium Dioxide, Dimethicone, Glycerin, and other premium ingredients.`,
    },
  ],
  reviews: [
    {
      id: 1,
      name: 'Sarah M.',
      rating: 5,
      date: '2026-01-15',
      verified: true,
      comment: 'Amazing concealer! Covers everything and feels so lightweight. Worth every penny!',
    },
    {
      id: 2,
      name: 'Emma R.',
      rating: 5,
      date: '2026-01-10',
      verified: true,
      comment: 'Best concealer I have ever used. No creasing and lasts all day!',
    },
  ],
  averageRating: 4.8,
  totalReviews: 156,
  inStock: true,
};

// ============================================
// 📦 MAIN COMPONENT
// ============================================

export function ProductDetailsPage() {
  const { productId } = useParams();
  
  // 🔄 TODO: Replace with actual API call
  // const { data: product, isLoading } = useQuery(['product', productId], fetchProduct);
  const product = DUMMY_PRODUCT;

  // ============================================
  // 🎯 STATE MANAGEMENT
  // ============================================
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedShade, setSelectedShade] = useState(product.shades[2].id);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(product.tabs[0].id);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  // ============================================
  // 🎬 HANDLERS
  // ============================================
  
  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToBag = () => {
    // TODO: Add to cart logic with API
    console.log('Added to bag:', { productId, selectedShade, quantity });
  };

  const toggleAccordion = (id: string) => {
    setExpandedAccordion(expandedAccordion === id ? null : id);
  };

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
              <div className="aspect-square bg-white rounded-xl overflow-hidden border border-gray-100 mb-3">
                <div className="tablet-landscape-gallery">
                {product.images[selectedImage].type === 'video' ? (
                  <video
                    key={product.images[selectedImage].id}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                    poster={product.images[selectedImage].thumbnail}
                  >
                    <source src={product.images[selectedImage].url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={product.images[selectedImage].url}
                    alt={product.images[selectedImage].alt}
                    className="w-full h-full object-contain"
                  />
                )}
                </div>
              </div>

              {/* 3. Thumbnail Gallery */}
              <div className="mb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 tablet-landscape-thumbnails">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImage === index
                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] scale-105'
                          : 'border-gray-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image.type === 'video' ? (image.thumbnail || image.url) : image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                      {image.type === 'video' && (
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

              {/* 4. Big Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#3E2723] mb-2 leading-tight">
                {product.name}
              </h2>
              <p className="text-base text-[#D4AF37] font-semibold mb-4">
                {product.subtitle}
              </p>

              {/* 5. Description */}
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {product.description}
              </p>

              {/* 6. Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-sm text-gray-500">{product.currency}</span>
                <span className="text-3xl font-bold text-[#3E2723]">
                  {product.price.toFixed(2)}
                </span>
              </div>

              {/* 7. Shade Selection */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#3E2723] mb-2">
                  CHOOSE SHADE: {product.shades.find(s => s.id === selectedShade)?.name}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.shades.map((shade) => (
                    <button
                      key={shade.id}
                      onClick={() => setSelectedShade(shade.id)}
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
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 9. Add to Bag Button - Mobile */}
              <div className="mb-6">
                <button
                  onClick={handleAddToBag}
                  className="w-full bg-[#3E2723] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#2E1F1B] transition-all shadow-lg hover:shadow-xl"
                >
                  ADD TO BAG
                </button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-[32px] font-bold text-[#3E2723] mb-1 md:mb-2 lg:mb-3 leading-tight tracking-tight">
                {product.name}
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-[#D4AF37] font-semibold mb-3 md:mb-4 lg:mb-5">
                {product.subtitle}
              </p>

              {/* Description */}
              <p className="text-sm md:text-base lg:text-[15px] text-gray-600 mb-4 md:mb-6 lg:mb-7 leading-relaxed">
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4 md:mb-6 lg:mb-8">
                <span className="text-sm text-gray-500">{product.currency}</span>
                <span className="text-3xl font-bold text-[#3E2723]">
                  {product.price.toFixed(2)}
                </span>
              </div>

              {/* Shade Selection */}
              <div className="mb-4 md:mb-6">
                <label className="block text-xs md:text-sm font-semibold text-[#3E2723] mb-2 md:mb-3">
                  CHOOSE SHADE: {product.shades.find(s => s.id === selectedShade)?.name}
                </label>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {product.shades.map((shade) => (
                    <button
                      key={shade.id}
                      onClick={() => setSelectedShade(shade.id)}
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
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stock Status - Desktop Only */}
              <div>
                {product.inStock ? (
                  <p className="text-green-600 font-semibold">✓ In Stock</p>
                ) : (
                  <p className="text-red-600 font-semibold">Out of Stock</p>
                )}
              </div>
            </div>
          </div>
          
          {/* ==================== RIGHT: IMAGES - DESKTOP ONLY ==================== */}
          <div className="order-2 lg:order-1 hidden lg:block">
            
            {/* Desktop: Vertical Thumbnail + Main Image Layout */}
            <div className="flex gap-4 desktop-carousel-container">
              {/* Vertical Thumbnail Carousel */}
              <div className="flex flex-col gap-2 w-24 h-[600px] overflow-y-auto desktop-carousel">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === index
                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] ring-offset-2'
                        : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-[#D4AF37]'
                    }`}
                  >
                    <img
                      src={image.type === 'video' ? (image.thumbnail || image.url) : image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    {image.type === 'video' && (
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
              <div className="flex-1 bg-white rounded-2xl overflow-hidden h-[600px] w-[600px] md:h-[500px] md:w-[500px] xl:h-[600px] xl:w-[600px]">
                {product.images[selectedImage].type === 'video' ? (
                  <video
                    key={product.images[selectedImage].id}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                    poster={product.images[selectedImage].thumbnail}
                  >
                    <source src={product.images[selectedImage].url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={product.images[selectedImage].url}
                    alt={product.images[selectedImage].alt}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Tablet Landscape: Horizontal Thumbnail + Main Image Layout */}
            <div className="tablet-landscape-layout" style={{display: 'none'}}>
              {/* Main Display Area */}
              <div className="tablet-landscape-image">
                {product.images[selectedImage].type === 'video' ? (
                  <video
                    key={product.images[selectedImage].id}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-contain"
                    poster={product.images[selectedImage].thumbnail}
                  >
                    <source src={product.images[selectedImage].url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={product.images[selectedImage].url}
                    alt={product.images[selectedImage].alt}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Horizontal Thumbnail Gallery Below Main Image */}
              <div className="tablet-landscape-thumbnails">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === index
                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] scale-105'
                        : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-[#D4AF37]'
                    }`}
                  >
                    <img
                      src={image.type === 'video' ? (image.thumbnail || image.url) : image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    {image.type === 'video' && (
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

        {/* ============================================ */}
        {/* 📱 ACCORDION SECTION (Mobile)               */}
        {/* ============================================ */}
        
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
            {product.reviews.map((review) => (
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
            ))}
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
