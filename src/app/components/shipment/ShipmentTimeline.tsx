import React from "react";
import { ShipmentTimeline } from "@/types/shipment";
import { formatShipmentDateTime, getStatusConfig } from "@/utils/shipmentUtils";

interface ShipmentTimelineProps {
  timeline?: ShipmentTimeline[];
  isLoading?: boolean;
}

/**
 * Shipment Timeline Component
 * Displays shipment progression with timeline
 */
export const ShipmentTimeline: React.FC<ShipmentTimelineProps> = ({
  timeline,
  isLoading = false,
}) => {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-[#E7DBC2] pt-6">
      <h4 className="text-sm font-semibold text-[#2C1F1B] mb-4 uppercase tracking-wide">
        Tracking Timeline
      </h4>

      <div className="space-y-4">
        {timeline.map((event, index) => {
          const config = getStatusConfig(event.status);
          const isLast = index === timeline.length - 1;

          return (
            <div key={index} className="flex gap-4">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div
                  className="w-3 h-3 rounded-full border-2"
                  style={{
                    borderColor: config.color,
                    backgroundColor: config.color,
                  }}
                />
                {!isLast && (
                  <div
                    className="w-0.5 h-12 mt-2"
                    style={{ backgroundColor: config.borderColor }}
                  />
                )}
              </div>

              {/* Timeline content */}
              <div className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#2C1F1B]">
                    {config.label}
                  </span>
                  {event.location && (
                    <span className="text-xs text-[#6B4A3A]">
                      • {event.location}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B4A3A] mb-1">{event.description}</p>
                <p className="text-xs text-[#A08970]">
                  {formatShipmentDateTime(event.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
