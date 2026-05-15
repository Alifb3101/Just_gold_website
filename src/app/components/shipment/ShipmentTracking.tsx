import React, { useState } from "react";
import { ShipmentTracking as ShipmentTrackingType } from "@/types/shipment";
import {
  formatShipmentDate,
  calculateDeliveryDays,
  getCourierInfo,
  isTrackingAvailable,
} from "@/utils/shipmentUtils";
import { ShipmentStatusBadge } from "./ShipmentStatusBadge";
import { ShipmentTimeline } from "./ShipmentTimeline";

interface ShipmentTrackingProps {
  tracking?: ShipmentTrackingType;
  timeline?: any[];
  isLoading?: boolean;
}

/**
 * Main Shipment Tracking Component
 * Displays comprehensive shipment information with track button
 */
export const ShipmentTracking: React.FC<ShipmentTrackingProps> = ({
  tracking,
  timeline,
  isLoading = false,
}) => {
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#E7DBC2] bg-white p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#F0EBE0] rounded-lg w-1/3" />
          <div className="h-4 bg-[#F0EBE0] rounded-lg w-1/2" />
          <div className="h-4 bg-[#F0EBE0] rounded-lg w-1/3" />
        </div>
      </div>
    );
  }

  // No tracking available
  if (!tracking || !isTrackingAvailable(tracking.status)) {
    return (
      <div className="rounded-2xl border border-[#E7DBC2] bg-gradient-to-br from-[#FFFDF8] to-[#FFF9F0] p-6 md:p-8">
        <div className="flex items-center gap-4">
          <span className="text-3xl">📦</span>
          <div>
            <h3 className="font-semibold text-[#2C1F1B]">
              Tracking Information
            </h3>
            <p className="text-sm text-[#6B4A3A] mt-1">
              Tracking will be updated soon. We'll notify you when your package
              ships.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const courierInfo = getCourierInfo(tracking.courier_provider);
  const deliveryDays = calculateDeliveryDays(tracking.estimated_delivery);
  const shippedDate = formatShipmentDate(tracking.shipped_date);
  const estimatedDate = formatShipmentDate(tracking.estimated_delivery);

  return (
    <div className="rounded-2xl border border-[#E7DBC2] bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#2C1F1B] flex items-center gap-2">
            <span className="text-2xl">{courierInfo.icon}</span>
            Shipment Details
          </h3>
          <p className="text-sm text-[#6B4A3A] mt-1">
            Track your package in real-time
          </p>
        </div>

        <ShipmentStatusBadge status={tracking.status} size="lg" />
      </div>

      {/* Divider */}
      <div className="border-t border-[#E7DBC2] my-6" />

      {/* Main Info Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Courier */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B08938]">
            Courier Provider
          </label>
          <p className="text-base font-semibold text-[#2C1F1B]">
            {courierInfo.name}
          </p>
        </div>

        {/* Tracking Number */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B08938]">
            Tracking Number
          </label>
          <div className="flex items-center gap-2">
            <p className="text-base font-mono text-[#2C1F1B] break-all">
              {tracking.tracking_number}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(tracking.tracking_number);
              }}
              className="p-1 hover:bg-[#F0EBE0] rounded text-[#6B4A3A] transition"
              title="Copy tracking number"
            >
              📋
            </button>
          </div>
        </div>

        {/* Shipped Date */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B08938]">
            Shipped Date
          </label>
          <p className="text-base font-semibold text-[#2C1F1B]">
            {shippedDate}
          </p>
        </div>

        {/* Estimated Delivery */}
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B08938]">
            Estimated Delivery
          </label>
          <div>
            <p className="text-base font-semibold text-[#2C1F1B]">
              {estimatedDate}
            </p>
            {deliveryDays > 0 && (
              <p className="text-xs text-[#16A34A] mt-0.5 font-medium">
                in {deliveryDays} day{deliveryDays !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Current Location */}
      {tracking.current_location && (
        <div className="rounded-lg bg-[#FFF9F0] border border-[#E7DBC2] p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B08938] mb-1">
            Current Location
          </p>
          <p className="text-sm font-medium text-[#2C1F1B]">
            📍 {tracking.current_location}
          </p>
        </div>
      )}

      {/* Timeline */}
      {timeline && timeline.length > 0 && (
        <>
          <button
            onClick={() => setIsTrackingOpen(!isTrackingOpen)}
            className="w-full text-left flex items-center justify-between py-3 px-4 rounded-lg hover:bg-[#F0EBE0] transition"
          >
            <span className="font-semibold text-[#2C1F1B]">View Timeline</span>
            <span className={`transition-transform ${isTrackingOpen ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>

          {isTrackingOpen && (
            <ShipmentTimeline timeline={timeline} isLoading={false} />
          )}
        </>
      )}

      {/* Divider before button */}
      <div className="border-t border-[#E7DBC2] my-6" />

      {/* Track Button */}
      {tracking.tracking_url && (
        <button
          onClick={() => window.open(tracking.tracking_url, "_blank")}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D4AF37] text-white font-semibold hover:bg-[#C19B2C] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <span>Track Package</span>
          <span className="text-lg">→</span>
        </button>
      )}

      {/* Update timestamp */}
      {tracking.updated_at && (
        <p className="text-xs text-[#A08970] mt-4">
          Last updated: {new Date(tracking.updated_at).toLocaleString("en-AE")}
        </p>
      )}
    </div>
  );
};
