import React, { useMemo, useState } from "react";
import { Search, Truck, Package, CheckCircle2, MapPin, Clock } from "lucide-react";

type TrackingStatus = {
  orderId: string;
  email: string;
  stage: "processing" | "shipped" | "out_for_delivery" | "delivered";
  updatedAt: string;
};

export function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<TrackingStatus | null>(null);

  const timeline = useMemo(() => {
    const steps = [
      { key: "processing", label: "Processing", icon: <Package className="w-5 h-5" /> },
      { key: "shipped", label: "Shipped", icon: <Truck className="w-5 h-5" /> },
      { key: "out_for_delivery", label: "Out for Delivery", icon: <MapPin className="w-5 h-5" /> },
      { key: "delivered", label: "Delivered", icon: <CheckCircle2 className="w-5 h-5" /> },
    ];
    return steps.map((step) => ({
      ...step,
      active: status ? steps.findIndex((s) => s.key === status.stage) >= steps.findIndex((s) => s.key === step.key) : false,
    }));
  }, [status]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!orderId.trim() || !email.trim()) return;
    setStatus({
      orderId: orderId.trim(),
      email: email.trim(),
      stage: "processing",
      updatedAt: new Date().toISOString(),
    });
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
              className="w-full md:w-auto bg-[#D4AF37] text-white rounded-lg py-3 px-6 font-semibold hover:bg-[#c4992f] transition flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Track Order
            </button>
          </form>

          {status ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-[#2B2B2B] bg-[#FFF7EB] border border-[#E9D9B8] rounded-xl p-4">
                <div>
                  <p className="font-semibold">Order {status.orderId}</p>
                  <p className="text-[#5C5140]">Updates sent to {status.email}</p>
                </div>
                <div className="flex items-center gap-2 text-[#A1863A]">
                  <Clock className="w-4 h-4" />
                  <span>Last updated {new Date(status.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {timeline.map((step) => (
                  <div
                    key={step.key}
                    className={`rounded-xl border p-4 flex flex-col items-center text-center gap-2 ${
                      step.active ? "border-[#D4AF37] bg-white" : "border-[#E9D9B8] bg-[#FFFCF7]"
                    }`}
                  >
                    <span className={`p-3 rounded-full ${step.active ? "bg-[#D4AF37] text-white" : "bg-[#FFF4DC] text-[#B08A2E]"}`}>
                      {step.icon}
                    </span>
                    <p className="text-sm font-semibold text-[#2B2B2B]">{step.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-[#5C5140]">
                Live tracking links are shared via email and SMS once your parcel is in transit. If you need to change delivery details, reply to the shipping notification.
              </p>
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
