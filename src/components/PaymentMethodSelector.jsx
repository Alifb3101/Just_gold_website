import React, { useMemo } from 'react';

const OPTIONS = [
  { value: 'stripe', title: 'Stripe (Card)', desc: 'Secure online card payment via Stripe Checkout.', disabled: true },
  { value: 'cod', title: 'Cash on Delivery', desc: 'Pay with cash when your order is delivered.', disabled: false },
];

const DISABLED_OPTIONS = [
  { value: 'stripe', title: 'Stripe (Card)', desc: 'Coming Soon - Online Payment' },
];

export default function PaymentMethodSelector({ value, onChange, allowedMethods }) {
  const availableOptions = useMemo(() => {
    if (Array.isArray(allowedMethods) && allowedMethods.length > 0) {
      const set = new Set(allowedMethods);
      return OPTIONS.filter((opt) => set.has(opt.value));
    }
    return OPTIONS.filter((opt) => !opt.disabled);
  }, [allowedMethods]);

  const handleChange = (next, isDisabled) => {
    if (!isDisabled && typeof onChange === 'function') {
      onChange(next);
    }
  };

  return (
    <div className="space-y-4" role="radiogroup" aria-label="Payment method">
      {/* Enabled Options */}
      <div className="space-y-3">
        {availableOptions.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange(option.value, false)}
              className={`w-full text-left rounded-xl border p-4 transition focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                active
                  ? 'border-[#D4AF37] bg-[#FFF8EA] shadow-sm'
                  : 'border-[#E7DBC2] bg-white hover:border-[#D4AF37]/70'
              }`}
              aria-pressed={active}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                    active ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#D4AF37]'
                  }`}
                >
                  {active ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#3E2723]">{option.title}</p>
                  <p className="mt-1 text-xs text-[#7A6A4D]">{option.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Disabled Options */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-[#999] uppercase tracking-wide">Currently Unavailable</p>
        {DISABLED_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled
            className="w-full text-left rounded-xl border p-4 transition opacity-50 cursor-not-allowed border-[#E7DBC2] bg-gray-50"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 bg-gray-100" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#999]">{option.title}</p>
                <p className="mt-1 text-xs text-[#BBB]">{option.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
