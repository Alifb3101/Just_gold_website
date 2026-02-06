import React from 'react';
import { HeroSlider } from '@/app/components/home/HeroSlider';
import { CategoryLinks } from '@/app/components/home/CategoryLinks';
import { FeaturedCollections } from '@/app/components/home/FeaturedCollections';
import { BestSellers } from '@/app/components/home/BestSellers';
import { PromoBanner } from '@/app/components/home/PromoBanner';
import { InstagramFeed } from '@/app/components/home/InstagramFeed';
import { Newsletter } from '@/app/components/home/Newsletter';
import { BrandMarqueePage } from '@/app/components/home/BrandMarqueePage';

export function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <HeroSlider />

      {/* Brand Marquee */}
      <BrandMarqueePage />

      {/* Category Quick Links - Updated Compact Design */}
      <CategoryLinks />

      {/* Featured Collections */}
      <FeaturedCollections />

      {/* Best Sellers */}
      <BestSellers />

      {/* Promotional Banner */}
      <PromoBanner />

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Newsletter Signup */}
      <Newsletter />
    </main>
  );
}
