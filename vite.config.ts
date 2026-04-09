import { defineConfig, loadEnv, type PluginOption } from 'vite'
import path from 'path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

import react from '@vitejs/plugin-react'
import vitePluginPrerenderer from 'vite-plugin-prerenderer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PRERENDER_ROUTES = ['/', '/eye', '/face', '/lips', '/nails', '/makeup-kits', '/tools', '/best-sellers', '/new']
const PRERENDER_SEO_OPTIONS = {
  '/': {
    title: 'Just Gold Cosmetics | Premium Lipstick, Face & Beauty Products',
    keyWords: 'just gold cosmetics, premium makeup, cosmetics, beauty products, high-end makeup',
    description: 'Discover premium makeup and cosmetics from Just Gold Cosmetics. Shop high-end beauty essentials with free shipping.',
  },
  '/eye': {
    title: 'Eye Makeup Collection | Just Gold Cosmetics',
    keyWords: 'eye makeup, eyeliner, mascara, eyeshadow, just gold cosmetics',
    description: 'Discover premium eye makeup from Just Gold Cosmetics with long-wear formulas, rich pigments, and elegant finishes.',
  },
  '/face': {
    title: 'Face Makeup Collection | Just Gold Cosmetics',
    keyWords: 'face makeup, blush, contour, highlighter, just gold cosmetics',
    description: 'Shop premium face makeup at Just Gold Cosmetics, including blush, contour, highlighter, and setting essentials.',
  },
  '/lips': {
    title: 'Lipstick Collection | Just Gold Cosmetics',
    keyWords: 'lipstick collection, matte lipstick, glossy lipstick, just gold cosmetics',
    description: 'Explore premium lipstick collection from Just Gold Cosmetics. Matte, glossy, and long-lasting shades for every look.',
  },
  '/nails': {
    title: 'Nail Products | Just Gold Cosmetics',
    keyWords: 'nail products, nail color, nails, just gold cosmetics',
    description: 'Shop premium nail products from Just Gold Cosmetics for long-wear color and polished, elegant looks.',
  },
  '/makeup-kits': {
    title: 'Makeup Kits | Just Gold Cosmetics',
    keyWords: 'makeup kits, beauty kits, cosmetics set, just gold cosmetics',
    description: 'Explore curated makeup kits from Just Gold Cosmetics for complete beauty looks in one premium set.',
  },
  '/tools': {
    title: 'Makeup Tools | Just Gold Cosmetics',
    keyWords: 'makeup tools, brushes, beauty tools, just gold cosmetics',
    description: 'Find professional makeup tools and brushes from Just Gold Cosmetics for smooth and precise application.',
  },
  '/best-sellers': {
    title: 'Best Sellers | Just Gold Cosmetics',
    keyWords: 'best sellers, top cosmetics, popular makeup, just gold cosmetics',
    description: 'Shop best-selling makeup and cosmetics from Just Gold Cosmetics, loved for premium quality and performance.',
  },
  '/new': {
    title: 'New Arrivals | Just Gold Cosmetics',
    keyWords: 'new arrivals, latest makeup, new cosmetics, just gold cosmetics',
    description: 'Discover the latest arrivals from Just Gold Cosmetics, including new premium makeup and beauty essentials.',
  },
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:5000'
  const isVercel = process.env.VERCEL === '1'
  const isCI = process.env.CI === '1' || process.env.CI === 'true'
  const enablePrerender = env.VITE_ENABLE_PRERENDER === 'true'

  const plugins: PluginOption[] = [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ]

  // This plugin depends on a local Chrome runtime (Puppeteer). Keep it opt-in
  // so serverless/CI providers (e.g. Vercel) do not fail during build.
  if (enablePrerender && !isVercel && !isCI) {
    plugins.push(
      vitePluginPrerenderer({
        routes: PRERENDER_ROUTES,
        options: PRERENDER_SEO_OPTIONS,
      })
    )
  }

  return {
  plugins,
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  
  // Build optimizations
  build: {
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React ecosystem
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI components chunk
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          // Query/state management chunk
          'vendor-state': ['@tanstack/react-query', 'zustand'],
          // Animation chunk
          'vendor-animation': ['framer-motion'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Use esbuild for minification (faster, built-in)
    minify: 'esbuild',
    // Generate source maps for debugging (disabled in production)
    sourcemap: mode !== 'production',
  },
  
  server: {
    host: true,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
      '/uploads': {
        target: proxyTarget,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  }
})
