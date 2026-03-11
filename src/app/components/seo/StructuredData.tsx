import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG, formatPrice, type ProductSEOData, type BreadcrumbItem } from '@/app/utils/seo';

interface ProductSchemaProps {
  product: ProductSEOData;
}

/**
 * Product JSON-LD Schema Component
 * Generates Schema.org Product structured data for rich results
 */
export function ProductSchema({ product }: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || SEO_CONFIG.brand,
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.currency || SEO_CONFIG.currency,
      price: formatPrice(product.price),
      availability: `https://schema.org/${product.availability}`,
      seller: {
        '@type': 'Organization',
        name: SEO_CONFIG.siteName,
      },
    },
    ...(product.category && { category: product.category }),
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.value.toFixed(1),
        reviewCount: product.rating.count,
        bestRating: '5',
        worstRating: '1',
      },
    }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb JSON-LD Schema Component
 * Generates Schema.org BreadcrumbList structured data
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  socialLinks?: string[];
}

/**
 * Organization JSON-LD Schema Component
 * Generates Schema.org Organization structured data
 */
export function OrganizationSchema({
  name = SEO_CONFIG.siteName,
  url = SEO_CONFIG.siteUrl,
  logo = `${SEO_CONFIG.siteUrl}/logo.png`,
  description = SEO_CONFIG.defaultDescription,
  socialLinks = [],
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    ...(socialLinks.length > 0 && { sameAs: socialLinks }),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface WebSiteSchemaProps {
  searchUrl?: string;
}

/**
 * WebSite JSON-LD Schema Component
 * Generates Schema.org WebSite structured data with search action
 */
export function WebSiteSchema({ searchUrl }: WebSiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    ...(searchUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: searchUrl,
        },
        'query-input': 'required name=search_term_string',
      },
    }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface CategorySchemaProps {
  name: string;
  description: string;
  url: string;
  image?: string;
}

/**
 * Category/Collection JSON-LD Schema Component
 * Generates Schema.org CollectionPage structured data
 */
export function CategorySchema({ name, description, url, image }: CategorySchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    ...(image && { image }),
    isPartOf: {
      '@type': 'WebSite',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export default {
  ProductSchema,
  BreadcrumbSchema,
  OrganizationSchema,
  WebSiteSchema,
  CategorySchema,
};
