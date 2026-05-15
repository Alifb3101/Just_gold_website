import { ShipmentStatus } from "@/types/shipment";

/**
 * Shipment status color and styling utilities
 */

export const SHIPMENT_STATUS_CONFIG: Record<
  ShipmentStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    icon: string;
  }
> = {
  pending: {
    label: "Pending",
    color: "#6B4A3A",
    bgColor: "#FFF9F0",
    borderColor: "#D4AF37",
    textColor: "#B08938",
    icon: "📦",
  },
  shipped: {
    label: "Shipped",
    color: "#2563EB",
    bgColor: "#EFF6FF",
    borderColor: "#3B82F6",
    textColor: "#1D4ED8",
    icon: "🚚",
  },
  in_transit: {
    label: "In Transit",
    color: "#EA580C",
    bgColor: "#FEF3E2",
    borderColor: "#FB923C",
    textColor: "#C2410C",
    icon: "✈️",
  },
  delivered: {
    label: "Delivered",
    color: "#16A34A",
    bgColor: "#F0FDF4",
    borderColor: "#22C55E",
    textColor: "#15803D",
    icon: "✓",
  },
  failed: {
    label: "Failed",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    borderColor: "#EF4444",
    textColor: "#991B1B",
    icon: "✕",
  },
};

/**
 * Get status configuration
 */
export const getStatusConfig = (status: ShipmentStatus) => {
  return SHIPMENT_STATUS_CONFIG[status] || SHIPMENT_STATUS_CONFIG.pending;
};

/**
 * Format date to readable format
 */
export const formatShipmentDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-AE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

/**
 * Format date with time
 */
export const formatShipmentDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-AE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

/**
 * Calculate days until delivery
 */
export const calculateDeliveryDays = (estimatedDelivery: string): number => {
  try {
    const now = new Date();
    const deliveryDate = new Date(estimatedDelivery);
    const diffTime = deliveryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
};

/**
 * Get courier provider icon/display
 */
export const getCourierInfo = (
  provider: string
): { name: string; icon: string; color: string } => {
  const providers: Record<
    string,
    { name: string; icon: string; color: string }
  > = {
    fedex: {
      name: "FedEx",
      icon: "📦",
      color: "#4D148C",
    },
    dhl: {
      name: "DHL",
      icon: "🚚",
      color: "#FFCC00",
    },
    aramex: {
      name: "Aramex",
      icon: "🚚",
      color: "#003399",
    },
    ups: {
      name: "UPS",
      icon: "📦",
      color: "#FFB81C",
    },
    default: {
      name: provider || "Courier",
      icon: "📦",
      color: "#D4AF37",
    },
  };

  return providers[provider?.toLowerCase()] || providers.default;
};

/**
 * Check if tracking is available
 */
export const isTrackingAvailable = (
  status: ShipmentStatus | undefined
): boolean => {
  return status !== undefined && status !== "pending";
};
