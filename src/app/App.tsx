import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/app/contexts/AppContext';
import { CartProvider } from '@/app/contexts/CartContext';
import { WishlistProvider } from '@/app/contexts/WishlistContext';
import { Toaster } from '@/app/components/ui/sonner';
import { UtilityBar } from '@/app/components/navigation/UtilityBar';
import { MainNavigation } from '@/app/components/navigation/MainNavigation';
import { Footer } from '@/app/components/Footer';
import { HomePage } from '@/app/pages/HomePage';
import { ShopPage } from '@/app/pages/ShopPage';
import { CartPage } from '@/app/pages/CartPage';
import { WishlistPage } from '@/app/pages/WishlistPage';
import { ProductDetailsPage } from '@/app/pages/ProductDetailsPage';


function App() {
  return (
    <AppProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
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
                <Route path="/wishlist" element={<WishlistPage />} />
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
        </WishlistProvider>
      </CartProvider>
    </AppProvider>
  );
}

export default App;
