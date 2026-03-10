import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useCart } from "@/app/contexts/CartContext";

const verificationCache = new Map();

const formatMoney = (value) => {
  const amount = Number(value ?? 0) || 0;

  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
  }).format(amount);
};

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-[#7A6A4D] py-1">
      <span>{label}</span>
      <span className="font-semibold text-[#3E2723]">{value}</span>
    </div>
  );
}

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id") || "";
  const orderIdParam =
    searchParams.get("order_id") || searchParams.get("orderId") || "";

  const verifyStripeSession = useCartStore((s) => s.verifyStripeSession);
  const getGuestOrder = useCartStore((s) => s.getGuestOrder);
  const clearZustandCart = useCartStore((s) => s.clearCartLocal);
  const { clearCartLocal: clearContextCart } = useCart();

  const clearedRef = useRef(false);

  const [state, setState] = useState({
    isLoading: true,
    data: null,
    error: "",
  });

  // Clear cart once on mount after successful order
  useEffect(() => {
    if (clearedRef.current) return;
    clearedRef.current = true;
    clearZustandCart();
    clearContextCart();
  }, []);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        if (sessionId) {
          const res =
            verificationCache.get(sessionId) ||
            (await verifyStripeSession(sessionId));

          const payload = res?.data ?? res;
          verificationCache.set(sessionId, payload);

          const orderId = payload?.order_id || payload?.orderId;
          const order = await getGuestOrder(orderId);

          if (!active) return;

          setState({
            isLoading: false,
            data: order?.data ?? order ?? payload,
            error: "",
          });
        } else if (orderIdParam) {
          const order = await getGuestOrder(orderIdParam);

          setState({
            isLoading: false,
            data: order?.data ?? order,
            error: "",
          });
        }
      } catch (e) {
        setState({
          isLoading: false,
          error: "Unable to verify order",
          data: null,
        });
      }
    };

    hydrate();

    return () => {
      active = false;
    };
  }, [sessionId, orderIdParam, verifyStripeSession, getGuestOrder]);

  const display = useMemo(() => {
    if (!state.data) return null;

    const payload = state.data?.data ?? state.data;

    return {
      orderNo: payload.order_number,
      paymentStatus: payload.payment_status,
      orderStatus: payload.order_status,
      paymentMethod: payload.payment_method,
      subtotal: payload?.totals?.subtotal,
      shippingFee: payload?.totals?.shipping_fee,
      discount: payload?.totals?.discount,
      total: payload?.totals?.total,
      items: payload.items || [],
      shipping: payload.shipping_address,
    };
  }, [state.data]);

  if (state.error) {
    toast.error(state.error);
    navigate("/");
  }

  return (
    <main className="min-h-screen bg-[#faf7ef] py-14 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="text-center mb-14">

          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#f3e3a2] shadow-lg">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-[#3E2723]">
            Order Confirmed 🎉
          </h1>

          <p className="mt-3 text-[#7A6A4D]">
            Thank you for your purchase.
          </p>

          <div className="mt-5 inline-flex items-center bg-white border border-[#E7DBC2] px-5 py-2 rounded-full text-sm shadow-sm">
            Order No:
            <span className="ml-2 font-semibold">{display?.orderNo}</span>
          </div>

        </div>


        {/* MAIN GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 items-start">

          {/* PRODUCTS */}

          <div>

            <h2 className="text-xl font-semibold text-[#3E2723] mb-6">
              Products Ordered
            </h2>

            <div className="space-y-4">

              {display?.items.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[80px_1fr_auto] items-center gap-6 bg-white border border-[#F1E6D0] rounded-xl px-6 py-5 shadow-sm hover:shadow-md transition"
                >

                  {/* IMAGE */}

                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover border border-[#efe6d3]"
                  />

                  {/* INFO */}

                  <div className="min-w-0">

                    <p className="text-[15px] font-semibold text-[#3E2723] leading-tight">
                      {item.name}
                    </p>

                    <p className="text-sm text-[#8A7A5C] mt-1">
                      {item.variant?.name} · Shade {item.variant?.shade}
                    </p>

                    <p className="text-sm text-[#8A7A5C]">
                      Qty {item.quantity}
                    </p>

                  </div>

                  {/* PRICE */}

                  <div className="text-right text-[15px] font-semibold text-[#3E2723] whitespace-nowrap">
                    {formatMoney(item.total_price)}
                  </div>

                </div>
              ))}

            </div>

          </div>


          {/* ORDER SUMMARY */}

          <div className="bg-white border border-[#F1E6D0] rounded-2xl p-6 shadow-sm sticky top-24">

            <h2 className="text-lg font-semibold text-[#3E2723] mb-5">
              Order Summary
            </h2>

            <div className="space-y-2">

              <Row label="Subtotal" value={formatMoney(display?.subtotal)} />
              <Row label="Shipping" value={formatMoney(display?.shippingFee)} />
              <Row label="Discount" value={formatMoney(display?.discount)} />

              <div className="border-t border-[#EFE4CC] pt-4 mt-2 flex justify-between text-base font-semibold text-[#3E2723]">
                <span>Total</span>
                <span>{formatMoney(display?.total)}</span>
              </div>

            </div>


            {/* PAYMENT */}

            <div className="mt-6">

              <h3 className="text-sm font-semibold text-[#3E2723] mb-2">
                Payment
              </h3>

              <div className="flex justify-between bg-[#FFFDF7] border border-[#EFE4CC] px-3 py-2 rounded-lg text-sm">
                <span className="capitalize">{display?.paymentMethod}</span>

                <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded">
                  {display?.orderStatus}
                </span>
              </div>

            </div>


            {/* SHIPPING */}

            {display?.shipping && (

              <div className="mt-6 text-sm text-[#7A6A4D] space-y-1">

                <p className="font-medium text-[#3E2723]">
                  {display.shipping.full_name}
                </p>

                <p>{display.shipping.line1}</p>
                <p>{display.shipping.line2}</p>

                <p>
                  {display.shipping.city}, {display.shipping.emirate}
                </p>

                <p>{display.shipping.phone}</p>

              </div>

            )}

            <Link
              to="/shop"
              className="mt-8 block w-full text-center bg-[#D4AF37] text-white py-3.5 rounded-xl font-semibold tracking-wide hover:bg-[#c49d2f] transition shadow-sm"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}