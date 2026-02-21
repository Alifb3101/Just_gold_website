import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from '@/app/contexts/AppContext';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { CartProvider } from '@/app/contexts/CartContext';
import { WishlistProvider } from '@/app/contexts/WishlistContext';
import { Toaster } from '@/app/components/ui/sonner';
import { MainNavigation } from '@/app/components/navigation/MainNavigation';
import { Footer } from '@/app/components/Footer';
import { HomePage } from '@/app/pages/HomePage';
import { ShopPage } from '@/app/pages/ShopPage';
import { CartPage } from '@/app/pages/CartPage';
import { WishlistPage } from '@/app/pages/WishlistPage';
import { ProductDetailsPage } from '@/app/pages/ProductDetailsPage';
import { CategoryProvider } from '@/store/categoryStore';
import { LoginPage } from '@/app/pages/LoginPage';
import { RegisterPage } from '@/app/pages/RegisterPage';
import { AccountPage } from '@/app/pages/AccountPage';

import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  return null;
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
              <div className="min-h-screen bg-[#FFF9F0]">
                {/* Navigation */}


              
                {/* <UtilityBar /> */}
                <MainNavigation />

                {/* Routes */}
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
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
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Routes>

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
