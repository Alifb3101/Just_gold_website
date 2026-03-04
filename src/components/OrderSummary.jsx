import React, { memo, useMemo } from 'react';

const aed = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  maximumFractionDigits: 2,
});

const OrderSummary = memo(function OrderSummary({
  items,
  subtotal,
  shippingFee = 0,
  discount = 0,
  compact = false,
}) {
  const total = useMemo(
    () => Math.max(0, subtotal + shippingFee - discount),
    [subtotal, shippingFee, discount]
  );

  return (
    <aside className={`rounded-2xl border border-[#E7DBC2] bg-white p-5 ${compact ? '' : 'lg:sticky lg:top-24'}`}>
      <h3 className="text-lg font-semibold text-[#3E2723]">Order Summary</h3>

      <div className="mt-4 max-h-[320px] space-y-3 overflow-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="h-14 w-14 rounded-lg object-cover bg-[#F6F1EA]"
              loading="lazy"
              decoding="async"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#3E2723]">{item.name}</p>
              <p className="text-xs text-[#7A6A4D]">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-[#3E2723]">{aed.format(item.subtotal)}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2 border-t border-[#EFE4CC] pt-4 text-sm">
        <div className="flex items-center justify-between text-[#7A6A4D]">
          <span>Subtotal</span>
          <span>{aed.format(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-[#7A6A4D]">
          <span>Shipping</span>
          <span>{shippingFee <= 0 ? 'Free' : aed.format(shippingFee)}</span>
        </div>
        {discount > 0 ? (
          <div className="flex items-center justify-between text-green-700">
            <span>Discount</span>
            <span>-{aed.format(discount)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-[#EFE4CC] pt-2 text-base font-bold text-[#3E2723]">
          <span>Total</span>
          <span>{aed.format(total)}</span>
        </div>
      </div>
    </aside>
  );
});

export default OrderSummary;
