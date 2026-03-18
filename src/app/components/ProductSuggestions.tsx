import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { ASSET_BASE_URL } from '@/app/api/http';

/* =========================
   🧠 Types & Interfaces
========================= */
type SuggestionProduct = {
  id: number;
  name: string;
  price: number;
  main_image: string;
  slug: string;
};

type SuggestionsData = {
  similarProducts: SuggestionProduct[];
  frequentlyBoughtTogether: SuggestionProduct[];
  trendingProducts: SuggestionProduct[];
};

type ProductSuggestionsProps = {
  productId: number | string;
};

type SectionType = 'similar' | 'bought_together' | 'trending';

interface CachedSuggestions {
  data: SuggestionsData;
  timestamp: number;
}

/* =========================
   ⚙️ Configuration
========================= */
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const SUGGESTION_CACHE = new Map<string | number, CachedSuggestions>();

/* =========================
   ✨ Skeleton Loading
========================= */
const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl overflow-hidden bg-white border border-gray-200">
    <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const SkeletonSection = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array(count).fill(null).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

/* =========================
   💎 Product Card Component
========================= */
const ProductCard = React.memo(({
  product,
  position,
  sectionType,
}: {
  product: SuggestionProduct;
  position: number;
  sectionType: SectionType;
}) => {
  // Validate product data
  if (!product?.id || !product?.name || !product?.slug) {
    return null;
  }

  const imageUrl = useMemo(() => {
    if (!product.main_image) return `${ASSET_BASE_URL}/placeholder.png`;
    if (product.main_image.startsWith('http')) return product.main_image;
    return `${ASSET_BASE_URL}/${product.main_image}`;
  }, [product.main_image]);

  const handleClick = useCallback(() => {
    // Track suggestion click event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'suggestion_click', {
        event_category: 'product_suggestion',
        suggestion_type: sectionType,
        product_id: product.id,
        product_name: product.name,
        position: position,
      });
    }
  }, [product.id, product.name, position, sectionType]);

  const handleMouseEnter = useCallback(() => {
    // Track impression (more precise than view)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'view_item', {
        event_category: 'product_suggestion',
        suggestion_type: sectionType,
        product_id: product.id,
        product_name: product.name,
      });
    }
  }, [product.id, product.name, sectionType]);

  return (
    <Link
      to={`/product/${product.slug}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className="group relative flex flex-col h-full rounded-2xl overflow-hidden 
      bg-white/80 backdrop-blur border border-[#F0E8DC] 
      shadow-[0_8px_24px_rgba(0,0,0,0.04)] 
      hover:shadow-[0_16px_48px_rgba(212,175,55,0.2)] 
      hover:-translate-y-2 transition-all duration-400 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#FFF8EF]">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `${ASSET_BASE_URL}/placeholder.png`;
          }}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover Label */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="px-4 py-2 text-xs font-bold text-white bg-[#D4AF37] rounded-full shadow-lg whitespace-nowrap">
            View Product
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-3 md:p-4">
        <h3 className="text-xs md:text-sm font-bold text-[#3E2723] line-clamp-2 group-hover:text-[#D4AF37] transition-colors duration-300">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <p className="text-[#D4AF37] font-bold text-sm md:text-base">
            AED {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
          </p>
          <span className="text-xs text-gray-400 group-hover:text-[#D4AF37] transition-colors duration-300 font-medium">
            →
          </span>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

/* =========================
   📦 Section Component
========================= */
const SuggestionSection = ({
  title,
  subtitle,
  products,
  loading,
  sectionType,
  Icon,
}: {
  title: string;
  subtitle: string;
  products: SuggestionProduct[];
  loading: boolean;
  sectionType: SectionType;
  Icon?: React.ReactNode;
}) => {
  const navigate = useNavigate();

  if (!products?.length && !loading) return null;

  const validProducts = (products || []).filter(p => p && p.id && p.name && p.slug);

  const handleExploreClick = useCallback(() => {
    navigate('/shop');
  }, [navigate]);

  return (
    <section className="mb-16 md:mb-20">
      {/* Section Header */}
      <div className="mb-8 md:mb-10 flex items-start gap-3 md:gap-4">
        {Icon && (
          <div className="flex-shrink-0 mt-1">
            {Icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl md:text-3xl font-bold text-[#3E2723] tracking-tight">
            {title}
          </h2>
          <p className="text-gray-600 text-sm md:text-base mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Products Grid or Skeleton */}
      {loading ? (
        <SkeletonSection count={8} />
      ) : validProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {validProducts.map((product, index) => (
              <ProductCard
                key={`${sectionType}-${product.id}`}
                product={product}
                position={index}
                sectionType={sectionType}
              />
            ))}
          </div>

          {/* Explore Button */}
          <div className="mt-8 md:mt-10 text-center">
            <button 
              onClick={handleExploreClick}
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold text-white 
              bg-gradient-to-r from-[#D4AF37] to-[#C9A227] rounded-full shadow-lg 
              hover:shadow-[0_12px_32px_rgba(212,175,55,0.3)] 
              hover:scale-105 transition-all duration-300"
              type="button"
              aria-label={`Explore more ${title}`}
            >
              Explore Collection
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
};

/* =========================
   🚀 MAIN COMPONENT
========================= */
export default function ProductSuggestions({ productId }: ProductSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /* 1. Intersection Observer - Lazy Load Section */
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !shouldFetch) {
          setShouldFetch(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [shouldFetch]);

  /* 2. Fetch Suggestions - With Cache */
  useEffect(() => {
    if (!shouldFetch || !productId) return;

    const fetchSuggestions = async () => {
      const cacheKey = String(productId);

      // Check cache first
      const cached = SUGGESTION_CACHE.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setSuggestions(cached.data);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        abortControllerRef.current = new AbortController();

        const response = await api.get(
          `/products/${productId}/suggestions`,
          { signal: abortControllerRef.current.signal }
        );

        // Validate response structure
        if (!response.data) {
          throw new Error('Invalid response format');
        }

        const { data, success } = response.data;

        if (success === false) {
          setError(null); // Silent fail for API errors
          setSuggestions(null);
          return;
        }

        if (!data) {
          setSuggestions(null);
          return;
        }

        // Validate and type-check the data
        const validated: SuggestionsData = {
          similarProducts: Array.isArray(data.similarProducts) ? data.similarProducts : [],
          frequentlyBoughtTogether: Array.isArray(data.frequentlyBoughtTogether) ? data.frequentlyBoughtTogether : [],
          trendingProducts: Array.isArray(data.trendingProducts) ? data.trendingProducts : [],
        };

        // Cache the results
        SUGGESTION_CACHE.set(cacheKey, {
          data: validated,
          timestamp: Date.now(),
        });

        setSuggestions(validated);
      } catch (err: any) {
        // Handle specific errors gracefully
        if (err.name === 'AbortError') {
          return; // Request was cancelled
        }

        if (err.response?.status === 404) {
          // 404 is expected for products without suggestions
          setSuggestions(null);
          setError(null);
        } else {
          // Other errors
          console.error('[ProductSuggestions] Fetch error:', err);
          setSuggestions(null);
          setError(null); // Silent failure
        }
      } finally {
        setLoading(false);
      }
    };

    // Debounce fetch to avoid rapid calls
    const timeoutId = setTimeout(fetchSuggestions, 300);

    return () => {
      clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };
  }, [shouldFetch, productId]);

  /* 3. Calculate if we have any suggestions */
  const hasSuggestions = useMemo(() => {
    if (!suggestions) return false;
    return (
      (suggestions.similarProducts?.length ?? 0) > 0 ||
      (suggestions.frequentlyBoughtTogether?.length ?? 0) > 0 ||
      (suggestions.trendingProducts?.length ?? 0) > 0
    );
  }, [suggestions]);

  // Don't render if we haven't fetched yet or if there's no data
  if (!shouldFetch || (!hasSuggestions && !loading)) {
    return <div ref={sectionRef} />;
  }

  return (
    <div ref={sectionRef} className="border-t border-gray-200 pt-12 md:pt-16 mt-8 md:mt-12 bg-gradient-to-b from-transparent via-[#FFF8F0]/30 to-white/50">
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-12 md:mb-16 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3E2723] mb-2 tracking-tight">
            Curated For You
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Discover handpicked luxury selections based on your interests
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[#D4AF37] to-[#b8962e] mx-auto mt-4 rounded-full" />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Suggestions Sections */}
        <div className="space-y-16 md:space-y-20">
          {/* Similar Products */}
          <SuggestionSection
            title="Similar Products"
            subtitle="Explore other items in this category"
            products={suggestions?.similarProducts || []}
            loading={loading}
            sectionType="similar"
            Icon={
              <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                ✓
              </div>
            }
          />

          {/* Frequently Bought Together */}
          <SuggestionSection
            title="Frequently Bought Together"
            subtitle="Customers often purchase these items together"
            products={suggestions?.frequentlyBoughtTogether || []}
            loading={loading}
            sectionType="bought_together"
            Icon={
              <div className="w-8 h-8 bg-[#8B7355] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                +
              </div>
            }
          />

          {/* Trending Products */}
          <SuggestionSection
            title="Trending Now"
            subtitle="Popular items gaining traction this month"
            products={suggestions?.trendingProducts || []}
            loading={loading}
            sectionType="trending"
            Icon={<TrendingUp className="w-8 h-8 text-[#D4AF37] flex-shrink-0" />}
          />
        </div>
      </div>
    </div>
  );
}