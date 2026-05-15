/**
 * Shipment Tracking Demo Component
 * 
 * Visual showcase of all shipment tracking states and features
 * Use this for testing and UI verification
 */

import React, { useState } from "react";
import {
  ShipmentTracking,
  ShipmentStatusBadge,
  DeliveryAnimationCard,
} from "@/app/components/shipment";
import { MOCK_SHIPMENT_DATA } from "@/app/components/shipment/MOCK_DATA";

/**
 * Demo Component showcasing all features
 */
export const ShipmentTrackingDemo: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<"in_transit">(
    "in_transit"
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF8] via-[#FFF9F0] to-[#FDF6E9] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold font-['Playfair_Display'] text-[#2C1F1B] mb-2">
            Shipment Tracking Demo
          </h1>
          <p className="text-[#6B4A3A]">
            Interactive showcase of all tracking component states
          </p>
        </div>

        {/* Status Badge Showcase */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#2C1F1B] mb-4">
            Status Badges
          </h2>
          <div className="bg-white rounded-2xl p-8 border border-[#E7DBC2]">
            <div className="flex flex-wrap gap-4">
              <ShipmentStatusBadge status="pending" size="lg" />
              <ShipmentStatusBadge status="shipped" size="lg" />
              <ShipmentStatusBadge status="in_transit" size="lg" />
              <ShipmentStatusBadge status="delivered" size="lg" />
              <ShipmentStatusBadge status="failed" size="lg" />
            </div>
          </div>
        </section>

        {/* Delivery Animation Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#2C1F1B] mb-4">
            Delivery Progress
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <DeliveryAnimationCard tracking={MOCK_SHIPMENT_DATA.pending} />
            <DeliveryAnimationCard tracking={MOCK_SHIPMENT_DATA.shipped} />
            <DeliveryAnimationCard tracking={MOCK_SHIPMENT_DATA.in_transit} />
          </div>
        </section>

        {/* Shipment Tracking - Full Component */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#2C1F1B] mb-4">
            Full Tracking Component
          </h2>

          {/* Status Selector */}
          <div className="mb-6 bg-white rounded-2xl p-6 border border-[#E7DBC2]">
            <label className="block text-sm font-semibold text-[#2C1F1B] mb-3">
              Select Status:
            </label>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  "pending",
                  "shipped",
                  "in_transit",
                  "delivered",
                  "failed",
                ] as const
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    selectedStatus === status
                      ? "bg-[#D4AF37] text-white"
                      : "bg-[#F0EBE0] text-[#6B4A3A] hover:bg-[#E7DBC2]"
                  }`}
                >
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking Component */}
          <div>
            <ShipmentTracking
              tracking={MOCK_SHIPMENT_DATA[selectedStatus]}
              timeline={
                selectedStatus === "in_transit"
                  ? MOCK_SHIPMENT_DATA.timeline
                  : selectedStatus === "delivered"
                    ? MOCK_SHIPMENT_DATA.timelineDelivered
                    : selectedStatus === "failed"
                      ? MOCK_SHIPMENT_DATA.timelineFailed
                      : undefined
              }
              isLoading={false}
            />
          </div>
        </section>

        {/* No Tracking State */}
        <section>
          <h2 className="text-2xl font-bold text-[#2C1F1B] mb-4">
            No Tracking Available
          </h2>
          <ShipmentTracking
            tracking={undefined}
            isLoading={false}
          />
        </section>

        {/* Loading State */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-[#2C1F1B] mb-4">
            Loading State
          </h2>
          <ShipmentTracking
            tracking={undefined}
            isLoading={true}
          />
        </section>

        {/* Info Section */}
        <section className="mt-12 bg-[#FFF9F0] rounded-2xl p-8 border border-[#E7DBC2]">
          <h3 className="text-lg font-semibold text-[#2C1F1B] mb-4">
            How to Use
          </h3>
          <ul className="space-y-2 text-[#6B4A3A]">
            <li>
              ✓ Import components from{" "}
              <code className="bg-white px-2 py-1 rounded">
                @/app/components/shipment
              </code>
            </li>
            <li>
              ✓ Pass tracking data as prop to ShipmentTracking component
            </li>
            <li>
              ✓ Use MOCK_DATA.ts for testing and development
            </li>
            <li>
              ✓ See QUICK_START.md for integration guide
            </li>
            <li>
              ✓ Check README.md for full documentation
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ShipmentTrackingDemo;
