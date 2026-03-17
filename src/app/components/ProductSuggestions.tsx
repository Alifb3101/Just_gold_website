import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { api } from '@/services/api';
import { ASSET_BASE_URL } from '@/app/api/http';

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

// Skeleton Loading Card
const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col h-full overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
    <div className="aspect-square bg-gray-200" />
    <div className="flex flex-col flex-1 p-3 md:p-4 space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4" />
      <div className="h-4 bg-gray-300 rounded w-1/2 mt-auto" />
    </div>
  </div>
);

const SkeletonSection = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
    {Array(count)
      .fill(null)
      .map((_, i) => (
        <SkeletonCard key={i} />
      ))}
  </div>
);

const ProductCard = ({ product, position, sectionType }: { product: SuggestionProduct; position: number; sectionType: string }) => {
  const imageUrl = product.main_image
    ? product.main_image.startsWith('http')
      ? product.main_image
      : `${ASSET_BASE_URL}/${product.main_image}`
    : `${ASSET_BASE_URL}/placeholder.png`;

  const handleClick = useCallback(() => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'suggestion_click', {
        suggestion_type: sectionType,
        product_id: product.id,
        position: position,
      });
    }
  }, [product.id, position, sectionType]);

  return (
    <Link
      to={`/products/${product.slug}`}
      onClick={handleClick}
      className="group relative flex flex-col h-full overflow-hidden rounded-xl bg-white border border-[#F0E8DC] shadow-[0_8px_24px_rgba(34,27,22,0.06)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(212,175,55,0.15)] hover:border-[#D4AF37]"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FFF8EF] to-white aspect-square">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          decoding="async"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-3 md:p-4">
        <h3 className="text-xs md:text-sm font-bold text-[#3E2723] line-clamp-2 group-hover:text-[#D4AF37] transition-colors mb-2">
          {product.name}
        </h3>
        <p className="text-[#D4AF37] font-bold text-sm md:text-base mt-auto">
          AED {product.price.toFixed(2)}
        </p>
      </div>

      {/* View Button */}
      <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="mb-4 px-4 py-2 bg-[#D4AF37] text-white text-xs font-bold rounded-lg shadow-lg pointer-events-auto">
          View Product
        </div>
      </div>
    </Link>
  );
};

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
  sectionType: 'similar' | 'bought_together' | 'trending';
  Icon?: React.ReactNode;
}) => {
  if (!products?.length && !loading) {
    return null;
  }

  return (
    <section className="mb-12 md:mb-16">
      {/* Section Header */}
      <div className="mb-6 md:mb-8 flex items-center gap-3">
        {Icon && <div className="text-[#D4AF37]">{Icon}</div>}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#3E2723]">{title}</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Products Grid or Skeleton */}
      {loading ? (
        <SkeletonSection count={8} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} position={index} sectionType={sectionType} />
            ))}
          </div>

          {/* View All Link */}
          <div className="mt-6 md:mt-8 text-center">
            <button className="inline-flex items-center gap-2 text-[#D4AF37] font-bold hover:gap-3 transition-all duration-300 group">
              <span>Explore More</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export function ProductSuggestions({ productId }: ProductSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldFetch(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Start loading 100px before section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fetch suggestions when section is visible
  useEffect(() => {
    if (!shouldFetch || !productId) return;

    const fetchSuggestions = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/products/${productId}/suggestions`);

        if (response.data?.success === false) {
          console.warn('[suggestions] API returned success:false', response.data?.message);
          setSuggestions(null);
          return;
        }

        setSuggestions(response.data?.data || null);
      } catch (err) {
        // Non-blocking error - suggestions are optional
        console.error('[suggestions] fetch error:', err);
        setSuggestions(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce fetch to avoid rapid calls
    const timeout = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeout);
  }, [shouldFetch, productId]);

  // Don't render if no data and not loading
  if (!shouldFetch || (!suggestions && !loading)) {
    return <div ref={sectionRef} />;
  }

  const hasSimilar = suggestions?.similarProducts?.length > 0;
  const hasBoughtTogether = suggestions?.frequentlyBoughtTogether?.length > 0;
  const hasTrending = suggestions?.trendingProducts?.length > 0;

  // Don't render container if no products at all
  if (!hasSimilar && !hasBoughtTogether && !hasTrending && !loading) {
    return null;
  }

  return (
    <div ref={sectionRef} className="border-t border-gray-200 pt-8 md:pt-12 mt-8 md:mt-12">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 md:px-6">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-[#3E2723] mb-2">Curated For You</h1>
          <p className="text-gray-600 text-sm md:text-base">Discover products selected based on your interests</p>
        </div>

        {/* Suggestions Sections */}
        <div className="space-y-12 md:space-y-16">
          <SuggestionSection
            title="Similar Products"
            subtitle="Explore other items in this category"
            products={suggestions?.similarProducts || []}
            loading={loading}
            sectionType="similar"
            Icon={<div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center text-white text-xs font-bold">✓</div>}
          />

          <SuggestionSection
            title="Frequently Bought Together"
            subtitle="Customers often purchase these items together"
            products={suggestions?.frequentlyBoughtTogether || []}
            loading={loading}
            sectionType="bought_together"
            Icon={<div className="w-6 h-6 rounded-full bg-[#8B7355] flex items-center justify-center text-white text-xs font-bold">+</div>}
          />

          <SuggestionSection
            title="Trending Now"
            subtitle="Popular items gaining traction"
            products={suggestions?.trendingProducts || []}
            loading={loading}
            sectionType="trending"
            Icon={<TrendingUp className="w-6 h-6" />}
          />
        </div>
      </div>
    </div>
  );
}
