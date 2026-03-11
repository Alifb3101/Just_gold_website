import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  SEO_CONFIG,
  generateTitle,
  generateCanonicalUrl,
  generateImageUrl,
  truncateDescription,
  type SEOProps,
} from '@/app/utils/seo';

interface SEOHeadProps extends SEOProps {
  path?: string;
}

/**
 * SEO Head Component - Manages all meta tags for a page
 * Uses react-helmet-async for server-side rendering compatibility
 */
export function SEOHead({
  title,
  description = SEO_CONFIG.defaultDescription,
  canonicalUrl,
  path = '',
  image,
  imageAlt,
  type = 'website',
  noIndex = false,
  keywords = [],
}: SEOHeadProps) {
  const fullTitle = generateTitle(title);
  const fullDescription = truncateDescription(description);
  const canonical = canonicalUrl || generateCanonicalUrl(path);
  const ogImage = generateImageUrl(image);
  const ogImageAlt = imageAlt || title || SEO_CONFIG.siteName;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={fullDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content={SEO_CONFIG.locale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
      {SEO_CONFIG.twitterHandle && (
        <meta name="twitter:site" content={SEO_CONFIG.twitterHandle} />
      )}
    </Helmet>
  );
}

export default SEOHead;
