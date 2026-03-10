import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";

const FAQS = [
  {
    q: "Which products are best for sensitive skin?",
    a: "Look for our hypoallergenic, fragrance-free selections. Use filters on the shop page to narrow by concern or ingredient, and patch-test on the wrist before first use.",
  },
  {
    q: "How long does delivery take?",
    a: "Dubai and Abu Dhabi orders typically arrive same-day or next-day. Other Emirates take 1-3 business days, while GCC deliveries take 3-7 business days depending on customs.",
  },
  {
    q: "Can I return opened cosmetics?",
    a: "For hygiene reasons, opened items can only be returned if they are faulty or damaged on arrival. Unopened products may be returned within 14 days of delivery.",
  },
  {
    q: "Do you offer instalments?",
    a: "Yes. At checkout you can pay with Tabby or Tamara for flexible instalment options, subject to provider approval.",
  },
  {
    q: "How do I track my order?",
    a: "Use the Track Order page from the footer and enter your order number and email. You'll also receive live tracking links via email and SMS once shipped.",
  },
];

export function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F0] via-white to-[#FFF9F0]">
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
