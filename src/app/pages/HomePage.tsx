import React, { Suspense } from 'react';
import { HeroSlider } from '@/app/components/home/HeroSlider';
import { CategoryLinks } from '@/app/components/home/CategoryLinks';
import { BrandMarqueePage } from '@/app/components/home/BrandMarqueePage';
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
      
      {/* Hero Section */}
      <HeroSlider />

      {/* Brand Marquee */}
      <BrandMarqueePage />

      {/* Category Quick Links - Updated Compact Design */}
      <CategoryLinks />

      {/* Dynamic Homepage Product Sections */}
      <Suspense fallback={<div className="h-72 bg-[#FFF9F0]" />}>
        <HomepageProductSectionsLazy />
      </Suspense>

      {/* Instagram Reels */}
      <Suspense fallback={<div className="h-[520px] bg-[#F8F6F2]" />}>
        <InstagramReelsSectionLazy />
      </Suspense>


      {/* Promotional Banner */}
      <Suspense fallback={<div className="h-40 bg-[#FFF9F0]" />}>
        <PromoBannerLazy />
      </Suspense>


      {/* Instagram Feed */}
      {/* <Suspense fallback={<div className="h-64 bg-[#FFF9F0]" />}>
        <InstagramFeedLazy />
      </Suspense> */}

      {/* Newsletter Signup */}
      <Suspense fallback={<div className="h-40 bg-[#FFF9F0]" />}>
        <NewsletterLazy />
      </Suspense>
    </main>
  );
}
