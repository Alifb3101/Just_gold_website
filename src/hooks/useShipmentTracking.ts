/**
 * useShipmentTracking Hook
 * Manages shipment tracking state and polling
 */

import { useEffect, useState, useCallback } from "react";
import { ShipmentTracking, ShipmentTimeline } from "@/types/shipment";
import {
  fetchShipmentTracking,
  fetchShipmentTimeline,
  refreshShipmentData,
} from "@/services/shipmentService";

interface UseShipmentTrackingOptions {
  trackingNumber?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds, default 5 minutes
}

export const useShipmentTracking = ({
  trackingNumber,
  autoRefresh = false,
  refreshInterval = 5 * 60 * 1000, // 5 minutes default
}: UseShipmentTrackingOptions) => {
  const [tracking, setTracking] = useState<ShipmentTracking | null>(null);
  const [timeline, setTimeline] = useState<ShipmentTimeline[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tracking data
  const fetchTracking = useCallback(async () => {
    if (!trackingNumber) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      const [trackingData, timelineData] = await Promise.all([
        fetchShipmentTracking(trackingNumber, token),
        fetchShipmentTimeline(trackingNumber, token),
      ]);

      if (trackingData?.tracking) {
        setTracking(trackingData.tracking);
      }

      if (timelineData?.timeline) {
        setTimeline(timelineData.timeline);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch tracking data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [trackingNumber]);

  // Initial fetch
  useEffect(() => {
    if (trackingNumber) {
      fetchTracking();
    }
  }, [trackingNumber, fetchTracking]);

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh || !trackingNumber || tracking?.status === "delivered") {
      return;
    }

    const interval = setInterval(() => {
      refreshShipmentData(trackingNumber);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, trackingNumber, refreshInterval, tracking?.status]);

  return {
    tracking,
    timeline,
    isLoading,
    error,
    refetch: fetchTracking,
  };
};
