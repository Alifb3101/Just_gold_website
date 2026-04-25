import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";
import { SEOHead } from '@/app/components/seo';

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Dubai orders typically arrive within 1-2 business days when placed before 3 PM. Other Emirates take 1-3 business days, while GCC deliveries take 3-7 business days depending on customs.",
  },
  {
    q: "What is your return policy?",
    a: "You can return unopened products within 7 days of delivery. For hygiene reasons, opened items can only be returned if they are faulty or damaged on arrival.",
  },

  {
    q: "How do I track my order?",
    a: "Use the Track Order page from the footer and enter your order number and email. You'll also receive live tracking links via email and SMS once your order ships.",
  },
  {
    q: "Do you ship internationally?",
    a: "We currently ship within the UAE and to GCC countries (Saudi Arabia, Kuwait, Qatar, Bahrain, Oman). International shipping duties are calculated at checkout.",
  },
  {
    q: "Are your products authentic?",
    a: "Yes, all Just Gold Cosmetics products are 100% authentic and sourced directly from authorized distributors. We guarantee quality and freshness on every item.",
  },
  {
    q: "Do you offer wholesale or bulk orders?",
    a: "Yes, we offer wholesale pricing for bulk orders. Please contact us at justgoldcosmetic@gmail.com for partnership inquiries and wholesale pricing.",
  },
  {
    q: "How can I contact customer service?",
    a: "You can reach our concierge team at justgoldcosmetic@gmail.com or call +971 50 576 2104. Our team is available daily from 9:00 AM to 9:00 PM GST.",
  },
  {
    q: "How do I choose the right lipstick shade?",
    a: "For fair skin tones, try nude, pink, and coral shades. Medium skin tones look great with berry, rose, and mauve. Deep skin tones are complemented by red, wine, and deep plum shades. We recommend checking product images and customer reviews for reference.",
  },
  {
    q: "What is the shelf life of your cosmetics?",
    a: "Most of our products have a shelf life of 12-24 months when unopened. After opening, lipsticks typically last 12-18 months, eyeshadows 24 months, and liquid foundations 6-12 months. Check the PAO (Period After Opening) symbol on each product.",
  },
  {
    q: "How should I store my makeup products?",
    a: "Store cosmetics in a cool, dry place away from direct sunlight. Heat and humidity can degrade product quality. Avoid keeping products in the bathroom for extended periods. Keep lids tightly closed to prevent drying and contamination.",
  },
  {
    q: "Are your products cruelty-free?",
    a: "We are committed to ethical sourcing. Many of our products are cruelty-free. Please check individual product descriptions or contact our customer service for specific cruelty-free certification details.",
  },
  {
    q: "What if a product is out of stock?",
    a: "Out-of-stock items can be restocked. Use the 'Notify Me' feature on the product page to receive an email when the item becomes available again. Popular items typically return within 1-2 weeks.",
  },
  {
    q: "How do I know which foundation shade matches my skin?",
    a: "Identify your skin undertone (cool, warm, or neutral). Cool undertones suit pink-based foundations, warm undertones need yellow-based shades, and neutral undertones work with balanced formulas. We offer shade descriptions on each product page to help you choose.",
  },
  {
    q: "What are the essential makeup brushes for beginners?",
    a: "Start with a foundation brush or beauty sponge, concealer brush, powder brush, blending brush for eyeshadow, eyeliner brush, and a lip brush. Our makeup kits include curated brush sets perfect for building your collection.",
  },
  {
    q: "How can I make my lipstick last longer?",
    a: "Start with exfoliated, moisturized lips. Apply a lip liner as a base, then apply lipstick. Blot with tissue, reapply, and finish with a clear lip gloss or setting powder for long-lasting wear.",
  },
  {
    q: "Do you offer makeup tutorials or application tips?",
    a: "Check our social media channels and blog for makeup tutorials, tips, and trends. We regularly share application guides for our products to help you achieve professional looks at home.",
  },
];

export function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F0] via-white to-[#FFF9F0]">
      {/* SEO */}
      <SEOHead
        title="Frequently Asked Questions"
        description="Find answers to common questions about orders, delivery, returns, and products. Get help with luxury cosmetics shopping."
        path="/faqs"
        keywords={['FAQ', 'help', 'questions', 'orders', 'delivery', 'returns']}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-xs tracking-[0.3em] text-[#B08A2E]">FREQUENT QUESTIONS</p>
          <h1 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-[#2B2B2B]">FAQs</h1>
          <p className="text-sm sm:text-base text-[#5C5140] max-w-2xl mx-auto">
            Quick answers to the most common questions about orders, delivery, and returns.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((item, index) => (
            <AccordionItem
              key={item.q}
              value={`item-${index}`}
              className="border border-[#E9D9B8] rounded-xl px-4"
            >
              <AccordionTrigger className="text-left font-semibold text-[#2B2B2B]">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-[#5C5140] leading-relaxed pb-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
