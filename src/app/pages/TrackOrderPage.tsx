import React, { useMemo, useState } from "react";
import { Search, Truck, Package, CheckCircle2, MapPin, Clock, AlertCircle, ShoppingBag, CreditCard, MapPin as LocationIcon } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

type OrderItem = {
  id: string;
  name: string;
  thumbnail: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type OrderData = {
  id: string;
  order_number: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  payment: {
    method: string;
    status: string;
  };
  pricing: {
    subtotal: number;
    tax: number;
    shipping_fee: number;
    discount: number;
    total: number;
    currency: string;
  };
  order_status: string;
  shipping_address: {
    line1: string;
    line2: string;
    city: string;
    emirate: string;
    country: string;
    full_name: string;
    phone: string;
  };
  items: OrderItem[];
  tracking: {
    courier: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    estimated_delivery: string | null;
    status: string;
  };
  timeline: {
    status: string;
    date: string;
  }[];
  created_at: string;
  updated_at: string;
};

type TrackOrderResponse = {
  success: boolean;
  data: OrderData;
};

type TrackingStatus = {
  orderId: string;
  email: string;
  stage: "processing" | "shipped" | "out_for_delivery" | "delivered";
  updatedAt: string;
  orderData: OrderData | null;
};

export function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<TrackingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const timeline = useMemo(() => {
    const steps = [
      { key: "processing", label: "Processing", icon: <Package className="w-5 h-5" /> },
      { key: "shipped", label: "Shipped", icon: <Truck className="w-5 h-5" /> },
      { key: "out_for_delivery", label: "Out for Delivery", icon: <MapPin className="w-5 h-5" /> },
      { key: "delivered", label: "Delivered", icon: <CheckCircle2 className="w-5 h-5" /> },
    ];
    return steps.map((step) => ({
      ...step,
      active: status ? step.key === status.stage : false,
    }));
  }, [status]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!orderId.trim() || !email.trim()) return;
    
    setLoading(true);
    setError("");
    setStatus(null);

    try {
      const response = await apiFetch<TrackOrderResponse>(
        `/orders/track?order_number=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`
      );
      
      if (response.success && response.data) {
        const orderData = response.data;
        const stageMapping: Record<string, "processing" | "shipped" | "out_for_delivery" | "delivered"> = {
          confirmed: "processing",
          processing: "processing",
          shipped: "shipped",
          out_for_delivery: "out_for_delivery",
          delivered: "delivered",
        };
        
        setStatus({
          orderId: orderData.order_number,
          email: orderData.customer.email,
          stage: stageMapping[orderData.order_status] || "processing",
          updatedAt: orderData.updated_at,
          orderData,
        });
      } else {
        setError("Order not found. Please check your order number and email.");
      }
    } catch (err) {
      setError("Unable to track order. Please try again or contact customer service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F0] via-white to-[#FFF9F0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
        <div className="space-y-3 text-center">
          <p className="text-xs tracking-[0.3em] text-[#B08A2E]">ORDER VISIBILITY</p>
          <h1 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-[#2B2B2B]">Track Your Order</h1>
          <p className="text-sm sm:text-base text-[#5C5140] max-w-3xl mx-auto">
            Enter your order number and email to view the latest status. If you need assistance, our concierge can help instantly.
          </p>
        </div>

        <div className="bg-white border border-[#E9D9B8] rounded-2xl p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#2B2B2B]">Order Number</label>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="#JG-10234"
                className="w-full rounded-lg border border-[#E9D9B8] px-4 py-3 bg-[#FFFCF7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#2B2B2B]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[#E9D9B8] px-4 py-3 bg-[#FFFCF7] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-[#D4AF37] text-white rounded-lg py-3 px-6 font-semibold hover:bg-[#c4992f] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Clock className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? "Tracking..." : "Track Order"}
            </button>
          </form>

          {error && (
            <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {status && status.orderData ? (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-[#2B2B2B] bg-[#FFF7EB] border border-[#E9D9B8] rounded-xl p-4">
                <div>
                  <p className="font-semibold">Order {status.orderData.order_number}</p>
                  <p className="text-[#5C5140]">{status.orderData.customer.name}</p>
                </div>
                <div className="flex items-center gap-2 text-[#A1863A]">
                  <Clock className="w-4 h-4" />
                  <span>Last updated {new Date(status.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {timeline.map((step) => (
                  <div
                    key={step.key}
                    className={`rounded-xl border-2 p-4 flex flex-col items-center text-center gap-2 relative ${
                      step.active 
                        ? "border-[#D4AF37] bg-gradient-to-b from-[#FFFCF7] to-[#FFF4DC] shadow-lg" 
                        : "border-[#E9D9B8] bg-[#FFFCF7]"
                    }`}
                  >
                    {step.active && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        Current
                      </span>
                    )}
                    <span className={`p-4 rounded-full relative ${
                      step.active 
                        ? "bg-[#D4AF37] text-white ring-4 ring-[#D4AF37]/20" 
                        : "bg-[#FFF4DC] text-[#B08A2E]"
                    }`}>
                      {step.active ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                    </span>
                    <p className={`text-sm font-semibold ${step.active ? "text-[#D4AF37]" : "text-[#2B2B2B]"}`}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Items */}
                <div className="bg-white border border-[#E9D9B8] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="font-semibold text-[#2B2B2B]">Order Items</h3>
                  </div>
                  <div className="space-y-4">
                    {status.orderData.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-[#2B2B2B]">{item.name}</p>
                          <p className="text-sm text-[#5C5140]">SKU: {item.sku}</p>
                          <p className="text-sm text-[#5C5140]">Qty: {item.quantity} × {status.orderData?.pricing.currency} {item.unit_price}</p>
                        </div>
                        <p className="font-semibold text-[#2B2B2B]">
                          {status.orderData?.pricing.currency} {item.total_price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment */}
                <div className="space-y-4">
                  {/* Shipping Address */}
                  <div className="bg-white border border-[#E9D9B8] rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <LocationIcon className="w-5 h-5 text-[#D4AF37]" />
                      <h3 className="font-semibold text-[#2B2B2B]">Shipping Address</h3>
                    </div>
                    <div className="text-sm text-[#5C5140] space-y-1">
                      <p className="font-semibold text-[#2B2B2B]">{status.orderData.shipping_address.full_name}</p>
                      <p>{status.orderData.shipping_address.line1}</p>
                      {status.orderData.shipping_address.line2 && <p>{status.orderData.shipping_address.line2}</p>}
                      <p>
                        {status.orderData.shipping_address.city}, {status.orderData.shipping_address.emirate}
                      </p>
                      <p>{status.orderData.shipping_address.country}</p>
                      <p>Phone: {status.orderData.shipping_address.phone}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-white border border-[#E9D9B8] rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                      <h3 className="font-semibold text-[#2B2B2B]">Payment</h3>
                    </div>
                    <div className="text-sm text-[#5C5140] space-y-2">
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <span className="font-semibold text-[#2B2B2B] capitalize">{status.orderData.payment.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-semibold text-[#2B2B2B] capitalize">{status.orderData.payment.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="bg-white border border-[#E9D9B8] rounded-xl p-6">
                    <h3 className="font-semibold text-[#2B2B2B] mb-4">Order Summary</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between text-[#5C5140]">
                        <span>Subtotal:</span>
                        <span>{status.orderData.pricing.currency} {status.orderData.pricing.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-[#5C5140]">
                        <span>Shipping:</span>
                        <span>{status.orderData.pricing.currency} {status.orderData.pricing.shipping_fee}</span>
                      </div>
                      {status.orderData.pricing.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{status.orderData.pricing.currency} {status.orderData.pricing.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-[#2B2B2B] pt-2 border-t border-[#E9D9B8]">
                        <span>Total:</span>
                        <span>{status.orderData.pricing.currency} {status.orderData.pricing.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              {status.orderData.tracking.tracking_number && (
                <div className="bg-white border border-[#E9D9B8] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="font-semibold text-[#2B2B2B]">Tracking Information</h3>
                  </div>
                  <div className="text-sm text-[#5C5140] space-y-2">
                    {status.orderData.tracking.courier && (
                      <div className="flex justify-between">
                        <span>Courier:</span>
                        <span className="font-semibold text-[#2B2B2B]">{status.orderData.tracking.courier}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tracking Number:</span>
                      <span className="font-semibold text-[#2B2B2B]">{status.orderData.tracking.tracking_number}</span>
                    </div>
                    {status.orderData.tracking.estimated_delivery && (
                      <div className="flex justify-between">
                        <span>Estimated Delivery:</span>
                        <span className="font-semibold text-[#2B2B2B]">
                          {new Date(status.orderData.tracking.estimated_delivery).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {status.orderData.tracking.tracking_url && (
                      <a
                        href={status.orderData.tracking.tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-[#D4AF37] hover:underline"
                      >
                        Track on courier website →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline History */}
              {status.orderData.timeline.length > 0 && (
                <div className="bg-white border border-[#E9D9B8] rounded-xl p-6">
                  <h3 className="font-semibold text-[#2B2B2B] mb-4">Order Timeline</h3>
                  <div className="space-y-3">
                    {status.orderData.timeline.map((event, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                          {index < (status.orderData?.timeline.length ?? 0) - 1 && (
                            <div className="w-0.5 h-full bg-[#E9D9B8] mt-1" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[#2B2B2B] capitalize">{event.status}</p>
                          <p className="text-[#5C5140]">
                            {new Date(event.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#5C5140]">
              You'll see live status here after submitting your order number. If you don't have one, please check your confirmation email.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
