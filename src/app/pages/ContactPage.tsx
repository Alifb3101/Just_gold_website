import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { SEOHead } from '@/app/components/seo';
import { apiFetch } from "@/lib/apiClient";

export function ContactPage() {
  const [formState, setFormState] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: "name" | "email" | "phone" | "message", value: string) => {
    setError("");
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!formState.name.trim() || !formState.email.trim() || !formState.phone.trim() || !formState.message.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
          phone: formState.phone.trim(),
          message: formState.message.trim(),
        }),
      });
      
      setSuccess(true);
      setFormState({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setError("Unable to send your message. Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
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
            icon: <Mail className="w-5 h-5" />, label: "Email", value: "justgoldcosmetic@gmail.com", href: "mailto:justgoldcosmetic@gmail.com"
          }, {
            icon: <Phone className="w-5 h-5" />, label: "Phone", value: "+971 50 576 2104", href: "tel:+971505762104"
          }, {
            icon: <MapPin className="w-5 h-5" />, label: "Boutique", value: "Murshid Bazzar, Deira, Dubai", href: "https://maps.google.com/?q=Dubai%20UAE"
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
                  <p className="text-lg font-semibold text-xs break-all">{item.value}</p>
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
                <p className="font-semibold">Wholesale</p>
                <p className="text-[#5C5140] text-xs break-all">justgoldcosmetic@gmail.com</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FFF7EB] border border-[#E9D9B8]">
                <p className="font-semibold">Press & Media</p>
                <p className="text-[#5C5140] text-xs break-all">justgoldcosmetic@gmail.com</p>
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
                <label className="text-sm font-semibold text-[#2B2B2B]">Full Name</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="John Doe"
                  disabled={loading || success}
                  className="w-full rounded-lg border border-[#E9D9B8] px-4 py-3 bg-[#FFFCF7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2B2B2B]">Email Address</label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="john@example.com"
                  disabled={loading || success}
                  className="w-full rounded-lg border border-[#E9D9B8] px-4 py-3 bg-[#FFFCF7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2B2B2B]">Phone Number</label>
                <input
                  type="tel"
                  value={formState.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+971 50 123 4567"
                  disabled={loading || success}
                  className="w-full rounded-lg border border-[#E9D9B8] px-4 py-3 bg-[#FFFCF7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2B2B2B]">Your Message</label>
                <textarea
                  value={formState.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="How can we help you?"
                  disabled={loading || success}
                  rows={4}
                  className="w-full rounded-lg border border-[#E9D9B8] px-4 py-3 bg-[#FFFCF7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  required
                />
              </div>
              {error && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>Thank you! Your message has been sent successfully. Our concierge team will respond within 24 hours.</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-[#D4AF37] text-white rounded-lg py-3 font-semibold hover:bg-[#c4992f] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Message Sent
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
