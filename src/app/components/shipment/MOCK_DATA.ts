/**
 * Mock Data for Shipment Tracking Development & Testing
 */

import { ShipmentTracking, ShipmentTimeline } from "@/types/shipment";

export const MOCK_SHIPMENT_DATA = {
  // Pending status - not yet shipped
  pending: {
    id: "track-001",
    status: "pending" as const,
    courier_provider: "aramex",
    tracking_number: "TX1234567890",
    shipped_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    estimated_delivery: new Date(Date.now() + 432000000).toISOString(), // 5 days
    tracking_url: "https://track.aramex.com/tracking",
    current_location: "Warehouse - Being Prepared",
    updated_at: new Date().toISOString(),
  } as ShipmentTracking,

  // Shipped status - just shipped
  shipped: {
    id: "track-002",
    status: "shipped" as const,
    courier_provider: "fedex",
    tracking_number: "FX9876543210",
    shipped_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    estimated_delivery: new Date(Date.now() + 345600000).toISOString(), // 4 days
    tracking_url: "https://tracking.fedex.com/en/tracking",
    current_location: "Dubai Distribution Center",
    updated_at: new Date().toISOString(),
  } as ShipmentTracking,

  // In Transit status - on the way
  in_transit: {
    id: "track-003",
    status: "in_transit" as const,
    courier_provider: "dhl",
    tracking_number: "DH1111111111",
    shipped_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    estimated_delivery: new Date(Date.now() + 172800000).toISOString(), // 2 days
    tracking_url: "https://tracking.dhl.com/en/tracking",
    current_location: "Abu Dhabi Regional Hub",
    updated_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  } as ShipmentTracking,

  // Delivered status - completed
  delivered: {
    id: "track-004",
    status: "delivered" as const,
    courier_provider: "ups",
    tracking_number: "UP2222222222",
    shipped_date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    estimated_delivery: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    tracking_url: "https://tracking.ups.com/track",
    current_location: "Delivered to recipient",
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  } as ShipmentTracking,

  // Failed status - issue with delivery
  failed: {
    id: "track-005",
    status: "failed" as const,
    courier_provider: "aramex",
    tracking_number: "TX3333333333",
    shipped_date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    estimated_delivery: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    tracking_url: "https://track.aramex.com/tracking",
    current_location: "Delivery Attempted - No One Home",
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  } as ShipmentTracking,

  // Timeline events for "in_transit" package
  timeline: [
    {
      status: "pending" as const,
      timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      location: "Warehouse",
      description: "Order received and being prepared for shipment",
    },
    {
      status: "shipped" as const,
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      location: "Dubai Main Distribution Center",
      description: "Package picked up and shipped",
    },
    {
      status: "in_transit" as const,
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      location: "Dubai Sorting Facility",
      description: "Package sorted and transferred to local hub",
    },
    {
      status: "in_transit" as const,
      timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      location: "Abu Dhabi Regional Hub",
      description: "Arrived at regional distribution center",
    },
    {
      status: "in_transit" as const,
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      location: "Delivery Vehicle",
      description: "Out for delivery with local courier",
    },
  ] as ShipmentTimeline[],

  // Complete timeline for delivered package
  timelineDelivered: [
    {
      status: "pending" as const,
      timestamp: new Date(Date.now() - 432000000).toISOString(),
      location: "Warehouse",
      description: "Order received and being prepared",
    },
    {
      status: "shipped" as const,
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      location: "Dubai Distribution Center",
      description: "Package shipped",
    },
    {
      status: "in_transit" as const,
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      location: "Abu Dhabi Hub",
      description: "In transit to destination",
    },
    {
      status: "in_transit" as const,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      location: "Local Delivery Station",
      description: "Out for delivery",
    },
    {
      status: "delivered" as const,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      location: "Customer Address",
      description: "Package delivered successfully",
    },
  ] as ShipmentTimeline[],

  // Failed timeline
  timelineFailed: [
    {
      status: "pending" as const,
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      location: "Warehouse",
      description: "Order received",
    },
    {
      status: "shipped" as const,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      location: "Dubai Distribution",
      description: "Package shipped",
    },
    {
      status: "in_transit" as const,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      location: "Local Delivery Station",
      description: "Out for delivery",
    },
    {
      status: "failed" as const,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      location: "Customer Address",
      description: "Delivery attempted - no one home. Please contact carrier.",
    },
  ] as ShipmentTimeline[],
};

/**
 * Test fixtures for different scenarios
 */
export const TEST_SCENARIOS = {
  // User hasn't made any orders yet
  noOrders: [],

  // Order with no tracking yet
  pendingOrder: {
    id: "order-001",
    order_number: "ORD-2024-001",
    created_at: new Date().toISOString(),
    status: "processing",
    tracking: MOCK_SHIPMENT_DATA.pending,
    tracking_timeline: [],
  },

  // Order in transit
  inTransitOrder: {
    id: "order-002",
    order_number: "ORD-2024-002",
    created_at: new Date(Date.now() - 432000000).toISOString(),
    status: "shipped",
    tracking: MOCK_SHIPMENT_DATA.in_transit,
    tracking_timeline: MOCK_SHIPMENT_DATA.timeline,
  },

  // Successfully delivered order
  deliveredOrder: {
    id: "order-003",
    order_number: "ORD-2024-003",
    created_at: new Date(Date.now() - 864000000).toISOString(),
    status: "completed",
    tracking: MOCK_SHIPMENT_DATA.delivered,
    tracking_timeline: MOCK_SHIPMENT_DATA.timelineDelivered,
  },

  // Failed delivery
  failedOrder: {
    id: "order-004",
    order_number: "ORD-2024-004",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    status: "failed",
    tracking: MOCK_SHIPMENT_DATA.failed,
    tracking_timeline: MOCK_SHIPMENT_DATA.timelineFailed,
  },
};

/**
 * Multiple orders for list view testing
 */
export const MOCK_ORDERS_LIST = [
  TEST_SCENARIOS.pendingOrder,
  TEST_SCENARIOS.inTransitOrder,
  TEST_SCENARIOS.deliveredOrder,
  TEST_SCENARIOS.failedOrder,
];

/**
 * Real-world example with all fields
 */
export const FULL_ORDER_EXAMPLE = {
  id: "order-full-001",
  order_number: "ORD-2024-FULL",
  created_at: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
  updated_at: new Date().toISOString(),
  status: "completed",
  payment: {
    method: "stripe",
    status: "paid",
    amount: 299.99,
    currency: "AED",
  },
  shipping_address: {
    full_name: "Sarah Johnson",
    line1: "123 Marina Boulevard",
    city: "Dubai",
    emirate: "Dubai",
    postal_code: "00000",
    country: "UAE",
  },
  items: [
    {
      id: "item-1",
      name: "Luxury Face Serum",
      sku: "LFS-001",
      quantity: 1,
      thumbnail:
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883",
      price: 199.99,
    },
    {
      id: "item-2",
      name: "Diamond Lip Gloss",
      sku: "DLG-002",
      quantity: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa",
      price: 100.0,
    },
  ],
  tracking: {
    id: "track-full-001",
    status: "delivered" as const,
    courier_provider: "aramex",
    tracking_number: "AEXP1234567890XYZ",
    shipped_date: new Date(Date.now() - 432000000).toISOString(),
    estimated_delivery: new Date(Date.now() - 86400000).toISOString(),
    tracking_url: "https://track.aramex.com/tracking/AEXP1234567890XYZ",
    current_location: "Delivered to recipient",
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  tracking_timeline: MOCK_SHIPMENT_DATA.timelineDelivered,
};
