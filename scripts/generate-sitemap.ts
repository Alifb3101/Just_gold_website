/**
 * Dynamic Sitemap Generator
 * This script generates sitemap.xml by fetching products and categories from the API
 * Run: npm run generate:sitemap
 */

const SITE_URL = process.env.VITE_SITE_URL || 'https://luxurycosmetics.com';
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

interface Category {
  id: number;
  name: string;
  subcategories?: Array<{ id: number; name: string }>;
}

interface Product {
  id: number;
  slug: string;
  name: string;
  updated_at?: string;
}

interface ProductResponse {
  products: Product[];
  
  totalPages: number;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateUrlEntry(url: SitemapUrl): string {
  let entry = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n`;
  if (url.lastmod) {
    entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
  }
  entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
  entry += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
  entry += `  </url>`;
  return entry;
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(generateUrlEntry).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function fetchAllProducts(): Promise<Product[]> {
  const allProducts: Product[] = [];
  let page = 1;
  const limit = 100;

  try {
    while (true) {
      const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`);
      if (!response.ok) break;
      
      const data: ProductResponse = await response.json();
      if (!data.products || data.products.length === 0) break;
      
      allProducts.push(...data.products);
      
      if (page >= data.totalPages) break;
      page++;
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  return allProducts;
}

export async function generateSitemap(): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  const urls: SitemapUrl[] = [];

  // Static pages
  const staticPages: Array<{ path: string; priority: number; changefreq: SitemapUrl['changefreq'] }> = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/shop', priority: 0.9, changefreq: 'daily' },
    { path: '/contact', priority: 0.5, changefreq: 'monthly' },
    { path: '/faqs', priority: 0.5, changefreq: 'monthly' },
    { path: '/shipping-returns', priority: 0.5, changefreq: 'monthly' },
    { path: '/track-order', priority: 0.4, changefreq: 'monthly' },
  ];

  // Add static pages
  for (const page of staticPages) {
    urls.push({
      loc: `${SITE_URL}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  // Fetch and add categories
  const categories = await fetchCategories();
  for (const category of categories) {
    const categorySlug = generateSlug(category.name);
    urls.push({
      loc: `${SITE_URL}/shop?category=${category.id}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.8,
    });

    // Add subcategories
    if (category.subcategories) {
      for (const sub of category.subcategories) {
        urls.push({
          loc: `${SITE_URL}/shop?category=${sub.id}`,
          lastmod: today,
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
    }
  }

  // Fetch and add products
  const products = await fetchAllProducts();
  for (const product of products) {
    const productSlug = product.slug || generateSlug(product.name);
    urls.push({
      loc: `${SITE_URL}/product/${product.id}-${productSlug}`,
      lastmod: product.updated_at ? product.updated_at.split('T')[0] : today,
      changefreq: 'weekly',
      priority: 0.8,
    });
  }

  return generateSitemapXml(urls);
}

// For Node.js execution
export async function writeSitemap(outputPath: string): Promise<void> {
  const fs = await import('fs/promises');
  const sitemap = await generateSitemap();
  await fs.writeFile(outputPath, sitemap, 'utf-8');
  console.log(`Sitemap generated: ${outputPath}`);
  console.log(`Total URLs: ${sitemap.split('<url>').length - 1}`);
}

// Export for potential use in build scripts
export default { generateSitemap, writeSitemap };
