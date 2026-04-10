import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Apple
} from "lucide-react";
import { Link } from "react-router-dom";
import instagramIcon from "../../../media/instagram.png";
import tiktokIcon from "../../../media/tiktok.png";

export function Footer() {
  const shopLinks = [
    { label: "New Arrivals", to: "/category/new-in" },
    { label: "Best Sellers", to: "/category/best-seller" },
    { label: "Face", to: "/category/face" },
    { label: "Eyes", to: "/category/eyes" },
    { label: "Lips", to: "/category/lips" },
  ];

  const supportLinks = [
    { label: "Contact Us", to: "/contact" },
    { label: "Shipping & Returns", to: "/shipping-returns" },
    { label: "Track Order", to: "/track-order" },
    { label: "FAQs", to: "/faqs" },
  ];

  const socialLinks = [
    { iconImage: instagramIcon, href: "https://www.instagram.com/justgoldcosmetics/", label: "Instagram" },
    { iconImage: tiktokIcon, href: "https://www.tiktok.com/@just.gold.make.up", label: "TikTok" },
  ];

  return (
    <footer className="text-[#2B2B2B] relative bg-gradient-to-b from-[#FFF7EB] via-[#FFFDF8] to-[#FFF7EB]">

      {/* GOLD TOP LINE */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>

      {/* MAIN FOOTER */}
      <div className="max-w-[1600px] mx-auto px-8 py-20">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">

          {/* LOGO + DESCRIPTION */}
          <div className="space-y-6">

            {/* LOGO (UNCHANGED) */}
            <div
              aria-label="Just Gold logo"
              className="h-12 w-32"
              style={{
                background:
                  "linear-gradient(125deg, rgb(165 129 46) 0%, rgb(217, 181, 74) 28%, rgb(153 146 133) 55%, rgb(91 66 21) 75%, rgb(100 84 29) 100%), radial-gradient(120% 120% at 20% 15%, rgb(189 173 173 / 35%), #e7e0e000 55%)",
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
                filter: "drop-shadow(0 10px 25px rgba(212,175,55,0.25))",
              }}
            />

            <p className="text-sm text-[#6B6B6B] leading-relaxed">
              Luxury beauty products crafted with elegance and quality.
              Discover premium cosmetics designed for modern beauty.
            </p>

            {/* SOCIAL */}
            <div className="flex gap-4">

              {socialLinks.map(({ iconImage, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 bg-white/70 backdrop-blur rounded-full flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <img
                    src={iconImage}
                    alt=""
                    aria-hidden="true"
                    className="w-[18px] h-[18px] object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              ))}

            </div>

          </div>

          {/* SHOP */}
          <div>

            <h3 className="text-sm tracking-[0.25em] font-semibold mb-6 text-[#3a3a3a]">
              SHOP
            </h3>

            <ul className="space-y-3 text-sm text-[#6B6B6B]">

              {shopLinks.map((item) => (
                <li key={item.label} className="group cursor-pointer relative w-fit">
                  <Link to={item.to} className="group-hover:text-[#D4AF37] transition">
                    {item.label}
                  </Link>

                  <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
                </li>
              ))}

            </ul>

          </div>

          {/* SUPPORT */}
          <div>

            <h3 className="text-sm tracking-[0.25em] font-semibold mb-6 text-[#3a3a3a]">
              SUPPORT
            </h3>

            <ul className="space-y-3 text-sm text-[#6B6B6B]">

              {supportLinks.map((item) => (
                <li key={item.label} className="group cursor-pointer relative w-fit">
                  <Link to={item.to} className="group-hover:text-[#D4AF37] transition">
                    {item.label}
                  </Link>

                  <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
                </li>
              ))}

            </ul>

          </div>

          {/* CONTACT */}
          <div>

            <h3 className="text-sm tracking-[0.25em] font-semibold mb-6 text-[#3a3a3a]">
              CONTACT
            </h3>

            <div className="space-y-4 text-sm text-[#6B6B6B]">

              <a
                href="mailto:justgoldcosmetic@gmail.com"
                className="flex gap-3 items-center hover:text-[#D4AF37] transition"
              >
                <Mail size={16} className="text-[#D4AF37]" />
                justgoldcosmetic@gmail.com
              </a>

              <a
                href="tel:+971505762104"
                className="flex gap-3 items-center hover:text-[#D4AF37] transition"
              >
                <Phone size={16} className="text-[#D4AF37]" />
                +971 50 576 2104
              </a>

              <a
                href="https://maps.app.goo.gl/nHodevUT1nwYzCPB7"
                target="_blank"
                rel="noreferrer"
                className="flex gap-3 items-center hover:text-[#D4AF37] transition"
              >
                <MapPin size={16} className="text-[#D4AF37]" />
                DOMESTIC PERFUMES CO, Dubai, UAE
              </a>

            </div>

          </div>

        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-[#F0E3D1]">

        <div className="max-w-[1600px] mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">

          <p className="text-sm text-[#6B6B6B]">
            © 2026 Just Gold. All rights reserved.
          </p>

          <div className="flex items-center gap-3">

            <CreditCard size={20} className="text-[#444]" />
            <Apple size={20} className="text-[#444]" />

            {/* <span className="px-3 py-1 bg-[#2B2B2B] text-white text-xs rounded">
              Tabby
            </span>

            <span className="px-3 py-1 bg-[#2B2B2B] text-white text-xs rounded">
              Tamara
            </span> */}

          </div>

        </div>

      </div>

    </footer>
  );
}