/**
 * Shipment Service
 * Handles shipment tracking API calls
 */

import { ShipmentTrackingResponse } from "@/types/shipment";
import { apiFetch } from "@/lib/apiClient";

/**
 * Fetch shipment tracking data
 */
export const fetchShipmentTracking = async (
  trackingNumber: string,
  token?: string
): Promise<ShipmentTrackingResponse> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const data = await apiFetch(`/shipments/${trackingNumber}`, { headers });
    return data;
  } catch (error) {
    console.error("Error fetching shipment tracking:", error);
    throw new Error("Failed to fetch tracking information");
  }
};

/**
 * Fetch shipment timeline
 */
export const fetchShipmentTimeline = async (
  trackingNumber: string,
  token?: string
) => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const data = await apiFetch(`/shipments/${trackingNumber}/timeline`, {
      headers,
    });
    return data;
  } catch (error) {
    console.error("Error fetching shipment timeline:", error);
    return null;
  }
};

/**
 * Refresh shipment data (for polling)
 */
export const refreshShipmentData = async (
  trackingNumber: string,
  token?: string
) => {
  try {
    return await fetchShipmentTracking(trackingNumber, token);
  } catch (error) {
    console.error("Error refreshing shipment data:", error);
    return null;
  }
};
