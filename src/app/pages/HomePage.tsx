import React from 'react';
import { HeroSlider } from '@/app/components/home/HeroSlider';
import { CategoryLinks } from '@/app/components/home/CategoryLinks';
import { FeaturedCollections } from '@/app/components/home/FeaturedCollections';
import { HomepageProductSections } from '@/app/components/home/HomepageProductSections';
import { PromoBanner } from '@/app/components/home/PromoBanner';
import { InstagramFeed } from '@/app/components/home/InstagramFeed';
import { Newsletter } from '@/app/components/home/Newsletter';
import { BrandMarqueePage } from '@/app/components/home/BrandMarqueePage';
import { SEOHead, OrganizationSchema, WebSiteSchema } from '@/app/components/seo';
import { SEO_CONFIG } from '@/app/utils/seo';

export function HomePage() {
  return (
    <main>
      {/* SEO Meta Tags */}
      <SEOHead
        title="Premium Beauty & Skincare Products"
        description="Discover premium luxury cosmetics, skincare, and beauty products. Shop the finest selection of high-end makeup, serums, and beauty essentials with free shipping."
        path="/"
        keywords={[
          'luxury cosmetics',
          'premium beauty',
          'skincare',
          'makeup',
          'high-end beauty',
          'luxury skincare',
          'beauty products',
        ]}
      />
      
      {/* Structured Data */}
      <OrganizationSchema
        name={SEO_CONFIG.siteName}
        url={SEO_CONFIG.siteUrl}
        description={SEO_CONFIG.defaultDescription}
        socialLinks={[
          'https://www.instagram.com/luxurycosmetics',
          'https://www.facebook.com/luxurycosmetics',
          'https://twitter.com/luxurycosmetics',
        ]}
      />
      <WebSiteSchema searchUrl={`${SEO_CONFIG.siteUrl}/shop?search={search_term_string}`} />

      {/* Hero Section */}
      <HeroSlider />

      {/* Brand Marquee */}
      <BrandMarqueePage />

      {/* Category Quick Links - Updated Compact Design */}
      <CategoryLinks />

      {/* Featured Collections */}
      <FeaturedCollections />

      {/* Dynamic Homepage Product Sections */}
      <HomepageProductSections />

      {/* Promotional Banner */}
      <PromoBanner />

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Newsletter Signup */}
      <Newsletter />
    </main>
  );
}
