/**
 * Shipment Tracking Types
 */

export type ShipmentStatus = "pending" | "shipped" | "in_transit" | "delivered" | "failed";

export interface ShipmentTracking {
  id?: string;
  status: ShipmentStatus;
  courier_provider: string;
  tracking_number: string;
  shipped_date: string;
  estimated_delivery: string;
  tracking_url: string;
  current_location?: string;
  updated_at?: string;
}

export interface ShipmentTimeline {
  status: ShipmentStatus;
  timestamp: string;
  location?: string;
  description: string;
}

export interface ShipmentTrackingResponse {
  tracking: ShipmentTracking;
  timeline?: ShipmentTimeline[];
  error?: string;
}
