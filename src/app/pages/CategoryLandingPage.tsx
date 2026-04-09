import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/app/components/seo';

type CategoryLandingPageProps = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  path: string;
  categorySlug: string;
};

export function CategoryLandingPage({
  title,
  description,
  h1,
  intro,
  path,
  categorySlug,
}: CategoryLandingPageProps) {
  return (
    <main className="min-h-screen bg-[#FFF9F0]">
      <SEOHead
        title={title}
        description={description}
        path={path}
        keywords={[
          'just gold cosmetics',
          h1.toLowerCase(),
          categorySlug,
          'premium makeup',
          'cosmetics',
        ]}
      />

      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2A1B14] mb-6">{h1}</h1>
        <p className="text-[16px] leading-8 text-[#4A3A2A]">{intro}</p>

        <div className="mt-8">
          <Link
            to={`/category/${categorySlug}`}
            className="inline-flex items-center rounded-full bg-[#D4AF37] text-white font-semibold px-6 py-3 hover:bg-[#B9962E] transition-colors"
          >
            Shop {h1}
          </Link>
        </div>
      </section>
    </main>
  );
}
