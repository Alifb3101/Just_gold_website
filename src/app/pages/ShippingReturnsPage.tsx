import React from "react";
import { Truck, RotateCcw, ShieldCheck, Clock, CheckCircle } from "lucide-react";
import { SEOHead } from '@/app/components/seo';

export function ShippingReturnsPage() {
  const highlights = [
    { icon: <Truck className="w-5 h-5" />, title: "Express Shipping", desc: "Same-day delivery in Dubai on orders placed before 3 PM." },
    { icon: <ShieldCheck className="w-5 h-5" />, title: "Insured Parcels", desc: "Every order ships with full-value insurance and discreet packaging." },
    { icon: <Clock className="w-5 h-5" />, title: "Fast Processing", desc: "Orders dispatch within 24 hours on business days." },
  ];

  const returnSteps = [
    "Submit a return request within 14 days of delivery.",
    "Ensure items are unused, sealed, and in original packaging.",
    "We'll arrange a courier pickup or drop-off at a partner point.",
    "Refunds are processed within 5-7 business days once received.",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F0] via-white to-[#FFF9F0]">
      {/* SEO */}
      <SEOHead
        title="Shipping & Returns"
        description="Learn about our shipping options, delivery times, and hassle-free return policy. Express shipping available with insured parcels."
        path="/shipping-returns"
        keywords={['shipping', 'delivery', 'returns', 'refund policy', 'express delivery']}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
        <div className="space-y-3 text-center">
          <p className="text-xs tracking-[0.3em] text-[#B08A2E]">DELIVERY & CARE</p>
          <h1 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-[#2B2B2B]">Shipping & Returns</h1>
          <p className="text-sm sm:text-base text-[#5C5140] max-w-3xl mx-auto">
            Premium fulfillment with real-time tracking, insured parcels, and a smooth return experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {highlights.map((item) => (
            <div key={item.title} className="bg-white border border-[#E9D9B8] rounded-2xl p-5 shadow-sm flex items-start gap-3">
              <span className="p-3 rounded-full bg-[#FFF4DC] text-[#B08A2E]">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[#2B2B2B]">{item.title}</p>
                <p className="text-sm text-[#5C5140]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E9D9B8] rounded-2xl p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-full bg-[#FFF4DC] text-[#B08A2E]"><Truck className="w-5 h-5" /></span>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#A1863A]">Shipping</p>
                <p className="text-xl font-semibold text-[#2B2B2B]">Options & Timelines</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-[#5C5140]">
              <li><strong className="text-[#2B2B2B]">Dubai & Abu Dhabi:</strong> Same-day or next-day delivery.</li>
              <li><strong className="text-[#2B2B2B]">Other Emirates:</strong> 1-3 business days with live tracking.</li>
              <li><strong className="text-[#2B2B2B]">GCC Shipping:</strong> 3-7 business days; duties calculated at checkout.</li>
              <li>Shipping is free on qualifying orders; see cart for thresholds.</li>
            </ul>
          </div>

          <div className="bg-white border border-[#E9D9B8] rounded-2xl p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-full bg-[#FFF4DC] text-[#B08A2E]"><RotateCcw className="w-5 h-5" /></span>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#A1863A]">Returns</p>
                <p className="text-xl font-semibold text-[#2B2B2B]">Hassle-Free Process</p>
              </div>
            </div>
            <div className="space-y-2">
              {returnSteps.map((step, index) => (
                <div key={step} className="flex items-start gap-3 text-sm text-[#5C5140]">
                  <span className="mt-1 text-[#B08A2E]">{index + 1}.</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#4A4030] bg-[#FFF7EB] border border-[#E9D9B8] rounded-lg p-3">
              For hygiene reasons, opened cosmetics cannot be returned unless faulty. Keep seals intact for smooth processing.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E9D9B8] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-full bg-[#FFF4DC] text-[#B08A2E]"><CheckCircle className="w-5 h-5" /></span>
            <div>
              <p className="text-sm font-semibold text-[#2B2B2B]">Need help with a delivery?</p>
              <p className="text-sm text-[#5C5140]">Chat with our concierge or email <span className="font-semibold">shipping@justgold.ae</span>.</p>
            </div>
          </div>
          <a
            href="mailto:shipping@justgold.ae"
            className="px-5 py-3 rounded-lg bg-[#D4AF37] text-white font-semibold hover:bg-[#c4992f] transition"
          >
            Contact Shipping Desk
          </a>
        </div>
      </div>
    </div>
  );
}
