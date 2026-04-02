/**
 * Sitemap Generation Build Script
 * Run: node scripts/build-sitemap.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = process.env.VITE_SITE_URL || 'https://luxurycosmetics.com';
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateUrlEntry(url) {
  let entry = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n`;
  if (url.lastmod) {
    entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
  }
  entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
  entry += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
  entry += `  </url>`;
  return entry;
}

function generateSitemapXml(urls) {
  const urlEntries = urls.map(generateUrlEntry).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function fetchAllProducts() {
  const allProducts = [];
  let page = 1;
  const limit = 100;

  try {
    while (true) {
      const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`);
      if (!response.ok) break;
      
      const data = await response.json();
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

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...');
  const today = new Date().toISOString().split('T')[0];
  const urls = [];

  // Static pages
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/shop', priority: 0.9, changefreq: 'daily' },
    { path: '/contact', priority: 0.5, changefreq: 'monthly' },
    { path: '/faqs', priority: 0.5, changefreq: 'monthly' },
    { path: '/shipping-returns', priority: 0.5, changefreq: 'monthly' },
    { path: '/track-order', priority: 0.4, changefreq: 'monthly' },
  ];

  console.log('  Adding static pages...');
  for (const page of staticPages) {
    urls.push({
      loc: `${SITE_URL}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  // Fetch and add categories
  console.log('  Fetching categories...');
  const categories = await fetchCategories();
  console.log(`  Found ${categories.length} categories`);
  
  for (const category of categories) {
    urls.push({
      loc: `${SITE_URL}/shop?category=${category.id}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.8,
    });

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
  console.log('  Fetching products...');
  const products = await fetchAllProducts();
  console.log(`  Found ${products.length} products`);
  
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

async function main() {
  try {
    const sitemap = await generateSitemap();
    
    // Ensure dist directory exists
    const distDir = join(__dirname, '..', 'dist');
    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true });
    }
    
    // Write to dist folder
    const distPath = join(distDir, 'sitemap.xml');
    writeFileSync(distPath, sitemap, 'utf-8');
    console.log(`\n✅ Sitemap generated: ${distPath}`);
    
    // Also write to public folder for dev
    const publicDir = join(__dirname, '..', 'public');
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }
    const publicPath = join(publicDir, 'sitemap.xml');
    writeFileSync(publicPath, sitemap, 'utf-8');
    console.log(`✅ Sitemap generated: ${publicPath}`);
    
    console.log(`\n📊 Total URLs: ${sitemap.split('<url>').length - 1}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

main();
