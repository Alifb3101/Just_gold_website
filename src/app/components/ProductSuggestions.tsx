import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { ASSET_BASE_URL } from '@/app/api/http';
import { getProductImage } from '@/app/utils/productImage';

/* =========================
   🧠 Types & Interfaces
========================= */
type SuggestionProduct = {
  id: number;
  name: string;
  price: number;
  main_image: string;
  main_image_variants?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
    zoom?: string;
  };
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
  <div className="animate-pulse rounded-lg overflow-hidden bg-white border border-gray-200">
    <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
    <div className="p-2 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const SkeletonSection = ({ count = 10 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
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

  const imageSource = useMemo(
    () => ({ image: product.main_image, image_variants: product.main_image_variants }),
    [product.main_image, product.main_image_variants]
  );

  const imageUrl = useMemo(() => {
    const candidate = getProductImage(imageSource, 'thumbnail') || getProductImage(imageSource, 'medium');
    if (!candidate) return `${ASSET_BASE_URL}/placeholder.png`;
    if (candidate.startsWith('http')) return candidate;
    if (candidate.startsWith('/')) return `${ASSET_BASE_URL}${candidate}`;
    return `${ASSET_BASE_URL}/${candidate}`;
  }, [imageSource]);

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
      to={`/product/${product.id}-${product.slug}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className="group relative flex flex-col h-full rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#D4AF37]"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-110"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `${ASSET_BASE_URL}/placeholder.png`;
          }}
        />
        {/* Hover Badge */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-[#D4AF37] rounded">View</span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-2.5">
        <h3 className="text-xs font-semibold text-[#3E2723] line-clamp-2 group-hover:text-[#D4AF37] transition-colors duration-300 leading-tight">
          {product.name}
        </h3>
        <p className="text-[#D4AF37] font-bold text-xs mt-auto pt-1.5">
          AED {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
        </p>
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
  if (!products?.length && !loading) return null;

  const validProducts = (products || []).filter(p => p && p.id && p.name && p.slug);

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="mb-5 flex items-center gap-2">
        {Icon && (
          <div className="flex-shrink-0">
            {Icon}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-bold text-[#3E2723]">
            {title}
          </h2>
        </div>
      </div>

      {/* Products Grid or Skeleton */}
      {loading ? (
        <SkeletonSection count={6} />
      ) : validProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
          {validProducts.slice(0, 10).map((product, index) => (
            <ProductCard
              key={`${sectionType}-${product.id}`}
              product={product}
              position={index}
              sectionType={sectionType}
            />
          ))}
        </div>
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
    <div ref={sectionRef} className="border-t border-gray-200 py-8 md:py-12 mt-6 md:mt-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#3E2723]">
            Curated For You
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Explore related luxury products
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Suggestions Sections */}
        <div className="space-y-8">
          {/* Similar Products */}
          <SuggestionSection
            title="Similar Products"
            subtitle=""
            products={suggestions?.similarProducts || []}
            loading={loading}
            sectionType="similar"
            Icon={
              <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center text-white text-xs font-bold">
                ✓
              </div>
            }
          />

          {/* Frequently Bought Together */}
          <SuggestionSection
            title="Often Bought Together"
            subtitle=""
            products={suggestions?.frequentlyBoughtTogether || []}
            loading={loading}
            sectionType="bought_together"
            Icon={
              <div className="w-6 h-6 bg-[#8B7355] rounded-full flex items-center justify-center text-white text-xs font-bold">
                +
              </div>
            }
          />

          {/* Trending Products */}
          <SuggestionSection
            title="Trending Now"
            subtitle=""
            products={suggestions?.trendingProducts || []}
            loading={loading}
            sectionType="trending"
            Icon={<TrendingUp className="w-6 h-6 text-[#D4AF37]" />}
          />
        </div>
      </div>
    </div>
  );
}