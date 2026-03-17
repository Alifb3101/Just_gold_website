import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { api } from '@/services/api';
import { ASSET_BASE_URL } from '@/app/api/http';

/* =========================
   💅 Inline Styles (Shimmer)
========================= */
const shimmerStyle = `
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
.shimmer {
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}
`;

/* =========================
   🧠 Types
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

/* =========================
   ✨ Skeleton
========================= */
const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl overflow-hidden bg-white border border-gray-200">
    <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 shimmer" />
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
   💎 Product Card
========================= */
const ProductCard = ({
  product,
  position,
  sectionType,
}: {
  product: SuggestionProduct;
  position: number;
  sectionType: string;
}) => {
  const imageUrl = product.main_image
    ? product.main_image.startsWith('http')
      ? product.main_image
      : `${ASSET_BASE_URL}/${product.main_image}`
    : `${ASSET_BASE_URL}/placeholder.png`;

  const handleClick = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'suggestion_click', {
        suggestion_type: sectionType,
        product_id: product.id,
        position,
      });
    }
  }, [product.id, position, sectionType]);

  return (
    <Link
      to={`/products/${product.slug}`}
      onClick={handleClick}
      className="group relative flex flex-col h-full rounded-2xl overflow-hidden 
      bg-white/70 backdrop-blur-lg border border-[#F0E8DC] 
      shadow-[0_10px_30px_rgba(0,0,0,0.06)] 
      hover:shadow-[0_20px_60px_rgba(212,175,55,0.25)] 
      hover:-translate-y-1 transition-all duration-500"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition">
          <div className="px-4 py-2 text-xs font-semibold text-white bg-[#D4AF37] rounded-full shadow-xl">
            Quick View
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-sm font-semibold text-[#3E2723] line-clamp-2 group-hover:text-[#D4AF37] transition">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="text-[#D4AF37] font-bold text-base">
            AED {product.price.toFixed(2)}
          </p>
          <span className="text-xs text-gray-400 group-hover:text-[#D4AF37] transition">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
};

/* =========================
   📦 Section
========================= */
const SuggestionSection = ({
  title,
  subtitle,
  products,
  loading,
  sectionType,
  Icon,
}: any) => {
  if (!products?.length && !loading) return null;

  return (
    <section className="mb-16">
      <div className="mb-8 flex items-center gap-3">
        {Icon && <div className="text-[#D4AF37]">{Icon}</div>}
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#3E2723]">
            {title}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
      </div>

      {loading ? (
        <SkeletonSection />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product: any, index: number) => (
              <ProductCard
                key={product.id}
                product={product}
                position={index}
                sectionType={sectionType}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white 
            bg-gradient-to-r from-[#D4AF37] to-[#b8962e] rounded-full shadow-lg 
            hover:scale-105 hover:shadow-[0_10px_30px_rgba(212,175,55,0.4)] transition">
              Explore Collection
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </section>
  );
};

/* =========================
   🚀 MAIN COMPONENT
========================= */
export default function ProductSuggestions({ productId }: ProductSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  /* Inject shimmer CSS */
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = shimmerStyle;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  /* Intersection Observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldFetch(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* Fetch */
  useEffect(() => {
    if (!shouldFetch || !productId) return;

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${productId}/suggestions`);
        if (res.data?.success === false) {
          setSuggestions(null);
          return;
        }
        setSuggestions(res.data?.data || null);
      } catch {
        setSuggestions(null);
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(t);
  }, [shouldFetch, productId]);

  if (!shouldFetch || (!suggestions && !loading)) {
    return <div ref={sectionRef} />;
  }

  return (
    <div ref={sectionRef} className="border-t pt-12 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#3E2723]">
            Curated For You ✨
          </h1>
          <p className="text-gray-500 mt-3">
            Handpicked luxury selections based on your taste
          </p>
          <div className="w-24 h-[2px] bg-[#D4AF37] mx-auto mt-4 rounded-full" />
        </div>

        <SuggestionSection
          title="Similar Products"
          subtitle="Explore related items"
          products={suggestions?.similarProducts || []}
          loading={loading}
          sectionType="similar"
          Icon={<div className="w-6 h-6 bg-[#D4AF37] rounded-full text-white flex items-center justify-center text-xs">✓</div>}
        />

        <SuggestionSection
          title="Frequently Bought Together"
          subtitle="Customers love these combos"
          products={suggestions?.frequentlyBoughtTogether || []}
          loading={loading}
          sectionType="bought_together"
          Icon={<div className="w-6 h-6 bg-[#8B7355] rounded-full text-white flex items-center justify-center text-xs">+</div>}
        />

        <SuggestionSection
          title="Trending Now"
          subtitle="Hot picks right now"
          products={suggestions?.trendingProducts || []}
          loading={loading}
          sectionType="trending"
          Icon={<TrendingUp className="w-6 h-6 text-[#D4AF37]" />}
        />
      </div>
    </div>
  );
}