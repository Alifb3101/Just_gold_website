import React, { useMemo } from 'react';

const OPTIONS = [
  { value: 'stripe', title: 'Stripe (Card)', desc: 'Secure online card payment via Stripe Checkout.' },
  { value: 'cod', title: 'Cash on Delivery', desc: 'Pay with cash when your order is delivered.' },
];

export default function PaymentMethodSelector({ value, onChange, allowedMethods }) {
  const availableOptions = useMemo(() => {
    if (Array.isArray(allowedMethods) && allowedMethods.length > 0) {
      const set = new Set(allowedMethods);
      return OPTIONS.filter((opt) => set.has(opt.value));
    }
    return OPTIONS;
  }, [allowedMethods]);

  const handleChange = (next) => {
    if (typeof onChange === 'function') {
      onChange(next);
    }
  };

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Payment method">
      {availableOptions.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleChange(option.value)}
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
  );
}
