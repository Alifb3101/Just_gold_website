import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, CreditCard, Apple } from 'lucide-react';
import { useApp } from '@/app/contexts/AppContext';

export function Footer() {
  const { language, setLanguage, currency, setCurrency } = useApp();

  const shopLinks = [
    'New Arrivals',
    'Best Sellers',
    'Face',
    'Eyes',
    'Lips',
    'Brushes',
    'Makeup Kits',
    'Giftsets'
  ];

  const aboutLinks = [
    'Our Story',
    'Sustainability',
    'Careers',
    'Press',
    'Store Locator',
    'Blog'
  ];

  const supportLinks = [
    'Contact Us',
    'Shipping & Returns',
    'Track Order',
    'FAQs',
    'Size Guide',
    'Terms & Conditions',
    'Privacy Policy'
  ];

  return (
    <footer className="bg-[#3E2723] text-white">
      {/* Main Footer */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Shop Column */}
          <div>
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#D4AF37] mb-6">
              Shop
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-[#FAF3E0] hover:text-[#D4AF37] transition-colors inline-block hover:translate-x-1 transform duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#D4AF37] mb-6">
              About
            </h3>
            <ul className="space-y-3">
              {aboutLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-[#FAF3E0] hover:text-[#D4AF37] transition-colors inline-block hover:translate-x-1 transform duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#D4AF37] mb-6">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-[#FAF3E0] hover:text-[#D4AF37] transition-colors inline-block hover:translate-x-1 transform duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us Column */}
          <div>
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#D4AF37] mb-6">
              Follow Us
            </h3>
            
            {/* Social Media Icons */}
            <div className="flex gap-4 mb-8">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#D4AF37]/20 hover:bg-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:text-white transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#D4AF37]/20 hover:bg-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:text-white transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#D4AF37]/20 hover:bg-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:text-white transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#D4AF37]/20 hover:bg-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:text-white transition-all duration-300"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 text-[#FAF3E0]">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <a href="mailto:hello@justgold.ae" className="hover:text-[#D4AF37] transition-colors">
                  hello@justgold.ae
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <a href="tel:+971501234567" className="hover:text-[#D4AF37] transition-colors">
                  +971 50 123 4567
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>Dubai, United Arab Emirates</span>
              </div>
            </div>

            {/* Language & Currency - Mobile */}
            <div className="mt-6 lg:hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#FAF3E0]">Language</span>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                  className="text-sm text-[#D4AF37] font-medium"
                >
                  {language === 'en' ? 'English' : 'العربية'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#FAF3E0]">Currency</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="text-sm text-[#D4AF37] font-medium bg-transparent border border-[#D4AF37]/30 rounded px-2 py-1"
                >
                  <option value="AED" className="bg-[#3E2723]">AED</option>
                  <option value="USD" className="bg-[#3E2723]">USD</option>
                  <option value="INR" className="bg-[#3E2723]">INR</option>
                  <option value="KWD" className="bg-[#3E2723]">KWD</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods & Bottom Bar */}
      <div className="border-t border-[#D4AF37]/20">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center justify-center">
              <div
                aria-label="Just Gold logo"
                className="h-10 w-28"
                style={{
                  background:
                    "linear-gradient(125deg, #c89a2e 0%, #d9b54a 28%, #f3e3c5 55%, #fff6e6 75%, #d4af37 100%), radial-gradient(120% 120% at 20% 15%, rgba(255,255,255,0.35), transparent 55%)",
                  maskImage:
                    "url('https://i.postimg.cc/PqTfCmLW/Whats-App-Image-2026-02-03-at-12-22-57-PM-Nero-AI-Background-Remover-transparent.png')",
                  WebkitMaskImage:
                    "url('https://i.postimg.cc/PqTfCmLW/Whats-App-Image-2026-02-03-at-12-22-57-PM-Nero-AI-Background-Remover-transparent.png')",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  filter:
                    "drop-shadow(0 6px 18px rgba(212, 175, 55, 0.28)) drop-shadow(0 1px 4px rgba(0,0,0,0.12))",
                }}
              />
            </div>

            {/* Payment Icons */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span className="text-sm text-[#FAF3E0]">We Accept:</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-white rounded flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-[#3E2723]" />
                </div>
                <div className="w-10 h-7 bg-white rounded flex items-center justify-center">
                  <Apple className="w-6 h-6 text-[#3E2723]" />
                </div>
                <div className="px-3 py-1 bg-white rounded text-[#3E2723] text-xs font-semibold">
                  Tabby
                </div>
                <div className="px-3 py-1 bg-white rounded text-[#3E2723] text-xs font-semibold">
                  Tamara
                </div>
                <div className="px-3 py-1 bg-white rounded text-[#3E2723] text-xs font-semibold">
                  COD
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-sm text-[#FAF3E0]">
              © 2026 Just Gold. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
