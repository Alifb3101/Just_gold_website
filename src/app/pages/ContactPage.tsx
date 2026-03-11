import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react";
import { SEOHead } from '@/app/components/seo';

export function ContactPage() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: "name" | "email" | "message", value: string) => {
    setSubmitted(false);
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F0] via-white to-[#FFF9F0]">
      {/* SEO */}
      <SEOHead
        title="Contact Us"
        description="Get in touch with our customer service team. We're here to help with orders, products, and any questions about luxury cosmetics."
        path="/contact"
        keywords={['contact', 'customer service', 'support', 'luxury cosmetics']}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-xs tracking-[0.3em] text-[#B08A2E]">WE'RE HERE TO HELP</p>
          <h1 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-[#2B2B2B]">Contact Just Gold</h1>
          <p className="text-sm sm:text-base text-[#5C5140] max-w-3xl mx-auto">
            Whether you have a question about an order, products, or our services, our concierge team is ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[{
            icon: <Mail className="w-5 h-5" />, label: "Email", value: "hello@justgold.ae", href: "mailto:hello@justgold.ae"
          }, {
            icon: <Phone className="w-5 h-5" />, label: "Phone", value: "+971 50 123 4567", href: "tel:+971501234567"
          }, {
            icon: <MapPin className="w-5 h-5" />, label: "Boutique", value: "Dubai, UAE", href: "https://maps.google.com/?q=Dubai%20UAE"
          }].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.label === "Boutique" ? "_blank" : undefined}
              rel={item.label === "Boutique" ? "noreferrer" : undefined}
              className="block bg-white border border-[#E9D9B8] rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 text-[#2B2B2B]">
                <span className="p-3 rounded-full bg-[#FFF4DC] text-[#B08A2E]">{item.icon}</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#A1863A]">{item.label}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white border border-[#E9D9B8] rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-3 rounded-full bg-[#FFF4DC] text-[#B08A2E]"><Clock className="w-5 h-5" /></span>
              <div>
                <p className="text-sm font-semibold text-[#2B2B2B]">Concierge Hours</p>
                <p className="text-sm text-[#5C5140]">Daily, 9:00 AM – 9:00 PM GST</p>
              </div>
            </div>
            <p className="text-sm text-[#5C5140] leading-relaxed">
              We aim to respond within 24 hours. For urgent requests, call us directly and reference your order number for faster support.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#2B2B2B]">
              <div className="p-4 rounded-xl bg-[#FFF7EB] border border-[#E9D9B8]">
                <p className="font-semibold">Wholesale & Partnerships</p>
                <p className="text-[#5C5140]">business@justgold.ae</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FFF7EB] border border-[#E9D9B8]">
                <p className="font-semibold">Press & Media</p>
                <p className="text-[#5C5140]">press@justgold.ae</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E9D9B8] rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="p-3 rounded-full bg-[#FFF4DC] text-[#B08A2E]"><MessageSquare className="w-5 h-5" /></span>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#A1863A]">Send a Message</p>
                <p className="text-lg font-semibold text-[#2B2B2B]">We'll get back shortly</p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2B2B2B]">Name</label>
                <input
                  value={formState.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#E9D9B8] px-4 py-3 bg-[#FFFCF7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2B2B2B]">Email</label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#E9D9B8] px-4 py-3 bg-[#FFFCF7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2B2B2B]">Message</label>
                <textarea
                  value={formState.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-lg border border-[#E9D9B8] px-4 py-3 bg-[#FFFCF7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#D4AF37] text-white rounded-lg py-3 font-semibold hover:bg-[#c4992f] transition"
              >
                Submit
              </button>
              {submitted ? (
                <p className="text-sm text-[#2B2B2B] bg-[#F4F0E6] border border-[#E9D9B8] rounded-lg p-3">
                  Thank you for reaching out. Our concierge will reply to {formState.email || "your email"} soon.
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
