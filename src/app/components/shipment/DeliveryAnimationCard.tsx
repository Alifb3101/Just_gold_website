import React from "react";
import { ShipmentTracking as ShipmentTrackingType } from "@/types/shipment";
import { calculateDeliveryDays } from "@/utils/shipmentUtils";

interface DeliveryAnimationCardProps {
  tracking?: ShipmentTrackingType;
  compact?: boolean;
}

/**
 * Delivery Animation Card Component
 * Enhanced card with delivery progress animation
 */
export const DeliveryAnimationCard: React.FC<DeliveryAnimationCardProps> = ({
  tracking,
  compact = false,
}) => {
  if (!tracking) return null;

  const deliveryDays = calculateDeliveryDays(tracking.estimated_delivery);
  const progressPercent =
    tracking.status === "delivered"
      ? 100
      : tracking.status === "in_transit"
        ? 65
        : tracking.status === "shipped"
          ? 35
          : 10;

  return (
    <div
      className={`
        rounded-2xl bg-gradient-to-br from-[#FFFDF8] via-white to-[#FFF9F0]
        border border-[#D4AF37]/20 p-6 shadow-sm
        ${compact ? "md:col-span-2" : ""}
      `}
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-[#2C1F1B]">Delivery Progress</p>
          <p className="text-sm font-semibold text-[#B08938]">{progressPercent}%</p>
        </div>

        <div className="relative h-2 w-full rounded-full bg-[#E7DBC2] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B08938] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Status Steps */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex flex-col items-center gap-1">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              progressPercent >= 10
                ? "bg-[#D4AF37] text-white"
                : "bg-[#E7DBC2] text-[#6B4A3A]"
            }`}
          >
            ✓
          </div>
          <span className="text-[11px] font-medium text-[#6B4A3A]">Pending</span>
        </div>

        <div className="flex-1 h-1 bg-[#E7DBC2] mx-1" />

        <div className="flex flex-col items-center gap-1">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              progressPercent >= 35
                ? "bg-[#D4AF37] text-white"
                : "bg-[#E7DBC2] text-[#6B4A3A]"
            }`}
          >
            📦
          </div>
          <span className="text-[11px] font-medium text-[#6B4A3A]">Shipped</span>
        </div>

        <div className="flex-1 h-1 bg-[#E7DBC2] mx-1" />

        <div className="flex flex-col items-center gap-1">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              progressPercent >= 65
                ? "bg-[#D4AF37] text-white"
                : "bg-[#E7DBC2] text-[#6B4A3A]"
            }`}
          >
            🚚
          </div>
          <span className="text-[11px] font-medium text-[#6B4A3A]">Transit</span>
        </div>

        <div className="flex-1 h-1 bg-[#E7DBC2] mx-1" />

        <div className="flex flex-col items-center gap-1">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              progressPercent >= 100
                ? "bg-[#16A34A] text-white"
                : "bg-[#E7DBC2] text-[#6B4A3A]"
            }`}
          >
            ✓
          </div>
          <span className="text-[11px] font-medium text-[#6B4A3A]">
            Delivered
          </span>
        </div>
      </div>

      {/* Estimated Delivery */}
      {deliveryDays > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-[#E7DBC2] text-center">
          <p className="text-xs text-[#6B4A3A] mb-1">Estimated Delivery</p>
          <p className="text-lg font-bold text-[#D4AF37]">
            {deliveryDays} day{deliveryDays !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
};
