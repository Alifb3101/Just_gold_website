import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AppProvider } from '@/app/contexts/AppContext';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { CartProvider } from '@/app/contexts/CartContext';
import { WishlistProvider } from '@/app/contexts/WishlistContext';
import { Toaster } from '@/app/components/ui/sonner';
import { MainNavigation } from '@/app/components/navigation/MainNavigation';
import { Footer } from '@/app/components/Footer';
import { OrganizationSchema } from '@/app/components/seo';
import { HomePage } from '@/app/pages/HomePage';
import { ShopPage } from '@/app/pages/ShopPage';
import { CartPage } from '@/app/pages/CartPage';
import { WishlistPage } from '@/app/pages/WishlistPage';
import { ProductDetailsPage } from '@/app/pages/ProductDetailsPage';
import { CategoryProvider } from '@/store/categoryStore';
import { LoginPage } from '@/app/pages/LoginPage';
import { RegisterPage } from '@/app/pages/RegisterPage';
import { AccountPage } from '@/app/pages/AccountPage';
import { ContactPage } from '@/app/pages/ContactPage';
import { ShippingReturnsPage } from '@/app/pages/ShippingReturnsPage';
import { TrackOrderPage } from '@/app/pages/TrackOrderPage';
import { FAQPage } from '@/app/pages/FAQPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SEO_CONFIG } from '@/app/utils/seo';

import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import Orders from '@/pages/Orders';

const CheckoutPage = lazy(() => import('@/pages/Checkout'));
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccess'));

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  return null;
}

function RouteSEO() {
  const location = useLocation();
  const cleanPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/+$/, '');
  const canonicalUrl = `${SEO_CONFIG.siteUrl}${cleanPath}`;
  const noIndex = cleanPath === '/cart' || cleanPath === '/login' || cleanPath === '/checkout';

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}
    </Helmet>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <CartProvider>
          <WishlistProvider>
            <CategoryProvider>
            <Router>
              <ScrollToTop />
              <RouteSEO />
              <OrganizationSchema
                name="Just Gold Cosmetics"
                url="https://www.justgoldcosmetics.com"
                logo="https://res.cloudinary.com/dvagrhc2w/image/upload/v1775553633/JG-Floral_300x-8_zvuqnr.png"
              />
              <div className="min-h-screen bg-[#FFF9F0]">
                {/* Navigation */}


              
                {/* <UtilityBar /> */}
                <MainNavigation />

                {/* Routes */}
                <ErrorBoundary>
                  <Suspense
                    fallback={
                      <div className="min-h-[50vh] flex items-center justify-center text-sm text-[#7A6A4D]">
                        Loading...
                      </div>
                    }
                  >
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/category/:categorySlug" element={<ShopPage />} />
                      <Route path="/product/:productSlug" element={<ProductDetailsPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route
                        path="/wishlist"
                        element={
                          <ProtectedRoute>
                            <WishlistPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/account"
                        element={
                          <ProtectedRoute>
                            <AccountPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
                      <Route path="/track-order" element={<TrackOrderPage />} />
                      <Route path="/faqs" element={<FAQPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                       <Route
                         path="/orders"
                         element={
                           <ProtectedRoute>
                             <Orders />
                           </ProtectedRoute>
                         }
                       />
                      <Route path="/order-success" element={<OrderSuccessPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>

                {/* Footer */}
                <Footer />

                {/* Toast Notifications */}
                <Toaster 
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      background: '#FFF9F0',
                      border: '1px solid #D4AF37',
                      color: '#3E2723',
                    },
                    className: 'font-semibold',
                  }}
                />
              </div>
            </Router>
            </CategoryProvider>
          </WishlistProvider>
        </CartProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
