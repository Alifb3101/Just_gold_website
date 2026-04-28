import React, { useState } from 'react';
import { Mail, Check, Lock, Truck, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { ApiError } from '@/app/api/http';
import { subscribeToNewsletter } from '@/services/newsletterService';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(false);
    setSubmitMessage('');
    setIsSubmitting(true);

    try {
      const response = await subscribeToNewsletter({ email });
      setIsSubmitted(true);
      setSubmitMessage(response.message || 'Subscribed successfully');
      setEmail('');

      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setSubmitMessage('Email is already subscribed');
        } else if (err.status === 400) {
          setSubmitMessage('Invalid request body');
        } else {
          setSubmitMessage(err.message || 'Unable to subscribe right now. Please try again.');
        }
      } else {
        setSubmitMessage((err as Error)?.message || 'Unable to subscribe right now. Please try again.');
      }
      setSubmitError(true);
      setIsSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-10 bg-gradient-to-br from-[#F5E6D3] to-[#FAF3E0] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#B76E79]/10 rounded-full blur-3xl" />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1 bg-[#D4AF37] text-white text-xs font-semibold tracking-wider rounded-full mb-4">
              EXCLUSIVE OFFER
            </span>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#3E2723] mb-4">
              Get 15% Off Your First Order
            </h2>
            <p className="text-[#4A4A4A] text-lg mb-8">
              Join our exclusive community and be the first to know about new launches, special offers, and beauty tips
            </p>
          </motion.div>

          {/* Newsletter Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className={`w-full pl-12 pr-4 py-4 rounded-full border-2 outline-none transition-colors bg-white ${
                  submitError
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitted || isSubmitting}
              className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
                isSubmitted
                  ? 'bg-green-500 text-white'
                  : isSubmitting
                  ? 'bg-[#D4AF37]/80 text-white cursor-not-allowed'
                  : 'bg-[#D4AF37] text-white hover:bg-[#C9B037] hover:shadow-lg'
              }`}
            >
              {isSubmitted ? (
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Subscribed!
                </span>
              ) : isSubmitting ? (
                'Subscribing...'
              ) : (
                'Subscribe'
              )}
            </button>
          </motion.form>

          {submitMessage ? (
            <p
              role="status"
              aria-live="polite"
              className={`mb-6 text-sm font-medium ${submitError ? 'text-red-600' : 'text-green-700'}`}
            >
              {submitMessage}
            </p>
          ) : null}

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#4A4A4A]"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D4AF37]" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#D4AF37]" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>UAE Based</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
