// SEO Configuration and Constants
export const SEO_CONFIG = {
  siteName: 'Luxury Cosmetics',
  siteUrl: 'https://luxurycosmetics.com', // Update with your actual domain
  defaultTitle: 'Luxury Cosmetics - Premium Beauty & Skincare Products',
  defaultDescription: 'Discover premium luxury cosmetics, skincare, and beauty products. Shop the finest selection of high-end makeup, serums, and beauty essentials with free shipping.',
  defaultImage: '/og-image.jpg', // Add this image to public folder
  twitterHandle: '@luxurycosmetics',
  locale: 'en_US',
  currency: 'USD',
  brand: 'Luxury Cosmetics',
};

export type SEOProps = {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
};

export type ProductSEOData = {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  sku: string;
  brand?: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  url: string;
  category?: string;
  rating?: {
    value: number;
    count: number;
  };
};

export type BreadcrumbItem = {
  name: string;
  url: string;
};

/**
 * Generate full page title with site name
 */
export function generateTitle(pageTitle?: string): string {
  if (!pageTitle) return SEO_CONFIG.defaultTitle;
  return `${pageTitle} | ${SEO_CONFIG.siteName}`;
}

/**
 * Generate canonical URL from path
 */
export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SEO_CONFIG.siteUrl}${cleanPath}`;
}

/**
 * Generate full image URL
 */
export function generateImageUrl(imagePath?: string): string {
  if (!imagePath) return `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`;
  if (imagePath.startsWith('http')) return imagePath;
  return `${SEO_CONFIG.siteUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
}

/**
 * Truncate description to SEO-friendly length (max 160 chars)
 */
export function truncateDescription(description: string, maxLength = 160): string {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Strip HTML tags from content
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Generate product slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Format price for structured data
 */
export function formatPrice(price: number): string {
  return price.toFixed(2);
}
