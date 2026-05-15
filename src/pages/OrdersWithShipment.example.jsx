/**
 * UPDATED Orders.jsx with Shipment Tracking Integration
 * 
 * This is an example of how to integrate the ShipmentTracking component
 * into the existing Orders page. Copy the relevant parts into your actual Orders.jsx file.
 */

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/apiClient";
import { ShipmentTracking, DeliveryAnimationCard } from "@/app/components/shipment";

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

  const cancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await apiFetch(`/orders/my/${orderId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.success) {
        toast.success("Order cancelled successfully");
        const data = await apiFetch("/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setOrders(data || []);
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Unable to cancel order. Please try again.");
    }
  };

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

                <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 items-start lg:items-center">
                  <div className="flex flex-wrap gap-4 items-center">
                    {/* Status badges */}
                  </div>
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
                  <p className="font-semibold text-[#2C1F1B]">Shipping To</p>
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

              {/* SHIPMENT TRACKING SECTION - NEW */}
              {order.tracking && (
                <>
                  <div className="my-6 border-t border-[#E7DBC2]" />
                  
                  <div className="mb-6">
                    <ShipmentTracking
                      tracking={order.tracking}
                      timeline={order.tracking_timeline}
                      isLoading={false}
                    />
                  </div>
                </>
              )}

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
                          className="grid gap-4 rounded-2xl border border-[#E7DBC2] bg-[#FFFCF7] p-4 shadow-sm md:grid-cols-[96px_minmax(0,1fr)_auto] md:items-center md:p-5"
                        >
                          <div className="flex items-start gap-4 md:contents">
                            <img
                              src={item.thumbnail}
                              alt={item.name}
                              className="h-24 w-24 rounded-xl object-cover ring-1 ring-[#D4AF37]/15 md:h-[96px] md:w-[96px]"
                            />

                            <div className="min-w-0 flex-1">
                              <p className="text-base font-semibold text-[#2C1F1B] leading-snug">
                                {item.name}
                              </p>

                              <div className="mt-3 grid gap-2 text-sm text-[#6B4A3A] sm:grid-cols-2">
                                <div>
                                  <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B08938]">
                                    Quantity
                                  </span>
                                  <span className="mt-0.5 block text-[#2C1F1B]">
                                    {item.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CANCEL BUTTON */}
                  <div>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="px-6 py-2 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
                    >
                      Cancel Order
                    </button>
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
