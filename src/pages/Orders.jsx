import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/apiClient";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("auth_token");

        if (!token) {
          navigate("/login");
          return;
        }

        const data = await apiFetch("/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setOrders(data || []);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast.error("Unable to load orders.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-AE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFFDF8] via-[#FFF9F0] to-[#FDF6E9] py-12">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-['Playfair_Display'] text-[#2C1F1B]">
            My Orders
          </h1>
          <p className="mt-2 text-[#6B4A3A]">
            Track, manage and review your purchases.
          </p>
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="text-center py-20 text-[#6B4A3A]">
            Loading your orders...
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && orders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#6B4A3A] mb-6">
              You have not placed any orders yet.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl bg-[#D4AF37] text-white font-semibold hover:bg-[#C19B2C] transition"
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* ORDER LIST */}
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-[#D4AF37]/20 shadow-xl p-6 md:p-8 transition hover:shadow-2xl"
            >
              {/* TOP BAR */}
              <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#B08938] font-semibold">
                    Order Number
                  </p>
                  <p className="text-lg font-semibold text-[#2C1F1B]">
                    {order.order_number}
                  </p>
                  <p className="text-sm text-[#6B4A3A] mt-1">
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 items-start lg:items-center">
                  <Badge label={order.tracking?.status} />
                  <Badge label={order.payment?.status} />
                  <p className="text-2xl font-bold text-[#2C1F1B]">
                    {order.pricing.currency} {order.pricing.total}
                  </p>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="my-6 border-t border-[#E7DBC2]" />

              {/* SUMMARY */}
              <div className="grid md:grid-cols-3 gap-6 text-sm text-[#6B4A3A]">
                <div>
                  <p className="font-semibold text-[#2C1F1B]">
                    Shipping To
                  </p>
                  <p>{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.line1}</p>
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.emirate}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-[#2C1F1B]">Payment</p>
                  <p>{order.payment.method.toUpperCase()}</p>
                  <p>Status: {order.payment.status}</p>
                </div>

                <div>
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.id ? null : order.id
                      )
                    }
                    className="text-[#B08938] font-semibold hover:underline"
                  >
                    {expandedOrder === order.id
                      ? "Hide Details"
                      : "View Details"}
                  </button>
                </div>
              </div>

              {/* EXPANDED DETAILS */}
              {expandedOrder === order.id && (
                <div className="mt-8 space-y-6">
                  {/* ITEMS */}
                  <div>
                    <h3 className="font-semibold text-[#2C1F1B] mb-4">
                      Order Items
                    </h3>

                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row gap-4 border rounded-xl p-4"
                        >
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />

                          <div className="flex-1">
                            <p className="font-semibold text-[#2C1F1B]">
                              {item.name}
                            </p>
                            <p className="text-sm text-[#6B4A3A]">
                              SKU: {item.sku}
                            </p>
                            <p className="text-sm text-[#6B4A3A]">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold">
                              {order.pricing.currency} {item.total_price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TIMELINE */}
                  <div>
                    <h3 className="font-semibold text-[#2C1F1B] mb-4">
                      Order Timeline
                    </h3>

                    <div className="space-y-3">
                      {order.timeline.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                          <p className="text-[#2C1F1B]">
                            {step.status} – {formatDate(step.date)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    {order.permissions?.can_cancel && (
                      <button className="px-5 py-2 rounded-xl border border-red-400 text-red-600 hover:bg-red-50 transition">
                        Cancel Order
                      </button>
                    )}

                    {order.invoice?.invoice_url && (
                      <a
                        href={order.invoice.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 rounded-xl border border-[#D4AF37] text-[#2C1F1B] hover:bg-[#FFF6E5] transition"
                      >
                        Download Invoice
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/* ---------- BADGE ---------- */

function Badge({ label }) {
  const styles = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const style =
    styles[label?.toLowerCase()] || "bg-gray-100 text-gray-700";

  return (
    <span className={`px-4 py-1 rounded-full text-xs font-semibold uppercase ${style}`}>
      {label}
    </span>
  );
}