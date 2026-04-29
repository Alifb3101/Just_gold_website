import React, { Suspense } from 'react';
import { HeroSlider } from '@/app/components/home/HeroSlider';
import { CategoryLinks } from '@/app/components/home/CategoryLinks';
import { BrandMarqueePage } from '@/app/components/home/BrandMarqueePage';
import { DealOfTheDay } from '@/app/components/home/DealOfTheDay';
import { SEOHead } from '@/app/components/seo';

const HomepageProductSectionsLazy = React.lazy(() =>
  import('@/app/components/home/HomepageProductSections').then((module) => ({ default: module.HomepageProductSections }))
);
const PromoBannerLazy = React.lazy(() =>
  import('@/app/components/home/PromoBanner').then((module) => ({ default: module.PromoBanner }))
);
const InstagramReelsSectionLazy = React.lazy(() =>
  import('@/app/components/home/InstagramReelsSection').then((module) => ({ default: module.InstagramReelsSection }))
);
const InstagramFeedLazy = React.lazy(() =>
  import('@/app/components/home/InstagramFeed').then((module) => ({ default: module.InstagramFeed }))
);
const NewsletterLazy = React.lazy(() =>
  import('@/app/components/home/Newsletter').then((module) => ({ default: module.Newsletter }))
);

export function HomePage() {
  return (
    <main>
      <h1 className="sr-only">Just Gold Cosmetics</h1>
      {/* SEO Meta Tags */}
      <SEOHead
        title="Just Gold Cosmetics - Premium Makeup & Cosmetics"
        description="Discover premium makeup and cosmetics from Just Gold Cosmetics. Shop high-end beauty essentials with free shipping."
        path="/"
        keywords={[
          'just gold cosmetics',
          'premium makeup',
          'cosmetics',
          'beauty products',
          'high-end makeup',
          'face makeup',
          'lip products',
        ]}
      />
      
      {/* ========================================
          SECTION 1: HERO SLIDER
          File: src/app/components/home/HeroSlider.tsx
          Description: Large banner with carousel of hero images
          ======================================== */}
      <HeroSlider />

      {/* ========================================
          SECTION 2: BRAND MARQUEE
          File: src/app/components/home/BrandMarqueePage.tsx
          Description: Scrolling brand logos/marquee
          ======================================== */}
      <BrandMarqueePage />

      {/* ========================================
          SECTION 3: CATEGORY QUICK LINKS
          File: src/app/components/home/CategoryLinks.tsx
          Description: Quick navigation to product categories
          Categories: Lips, Eyes, Face, Nails, Brushes, Makeup Kits, Best Sellers
          ======================================== */}
      <CategoryLinks />

      {/* ========================================
          SECTION 4: DEAL OF THE DAY
          File: src/app/components/home/DealOfTheDay.tsx
          Description: Featured deal product with large image and details
          Endpoint: Uses /homepage API data (deal_of_the_day)
          ======================================== */}
      <Suspense fallback={<div className="h-96 bg-[#FFF9F0]" />}>
        <DealOfTheDay />
      </Suspense>


            {/* ========================================
          SECTION 2: BRAND MARQUEE
          File: src/app/components/home/BrandMarqueePage.tsx
          Description: Scrolling brand logos/marquee
          ======================================== */}
      <BrandMarqueePage />

      {/* ========================================
          SECTION 5: BEST SELLERS
          File: src/app/components/home/HomepageProductSections.tsx
          Description: Product carousel - Best selling items
          ======================================== */}
      <Suspense fallback={<div className="h-72 bg-[#FFF9F0]" />}>
        <HomepageProductSectionsLazy />
      </Suspense>

      {/* ========================================
          SECTION 6: INSTAGRAM REELS
          File: src/app/components/home/InstagramReelsSection.tsx
          Description: Embedded Instagram reels/video section
          ======================================== */}
      <Suspense fallback={<div className="h-[520px] bg-[#F8F6F2]" />}>
        <InstagramReelsSectionLazy />
      </Suspense>

      

      {/* ========================================
          SECTION 7: PROMOTIONAL BANNER
          File: src/app/components/home/PromoBanner.tsx
          Description: Two-card promo banner
          - Left card: Makeup Kits (30% off) → links to /category/makeupkits
          - Right card: Free Gift (with purchase) → links to /category/gift-sets
          ======================================== */}
      <Suspense fallback={<div className="h-40 bg-[#FFF9F0]" />}>
        <PromoBannerLazy />
      </Suspense>

      {/* ========================================
          SECTION 8: INSTAGRAM FEED
          Status: DISABLED (commented out)
          File: src/app/components/home/InstagramFeed.tsx
          Description: Instagram feed embed
          To enable: Uncomment the Suspense block below
          ======================================== */}
      {/* <Suspense fallback={<div className="h-64 bg-[#FFF9F0]" />}>
        <InstagramFeedLazy />
      </Suspense> */}

      {/* ========================================
          SECTION 9: NEWSLETTER SIGNUP
          File: src/app/components/home/Newsletter.tsx
          Description: Email subscription form with benefits
          Endpoint: POST /newsletter/subscribe
          ======================================== */}
      <Suspense fallback={<div className="h-40 bg-[#FFF9F0]" />}>
        <NewsletterLazy />
      </Suspense>
    </main>
  );
}
