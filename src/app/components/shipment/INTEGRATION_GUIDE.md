/**
 * INTEGRATION GUIDE: Shipment Tracking Components
 * 
 * Usage Examples and Integration Patterns
 */

import { ShipmentTracking as ShipmentTrackingType } from "@/types/shipment";

/**
 * EXAMPLE 1: Basic Integration in Orders Page
 * 
 * import { ShipmentTracking } from "@/app/components/shipment";
 * 
 * export default function Orders() {
 *   const [orders, setOrders] = useState([]);
 * 
 *   return (
 *     <div className="space-y-8">
 *       {orders.map((order) => (
 *         <div key={order.id} className="bg-white rounded-3xl p-8">
 *           {/* Existing order details... */}
 * 
 *           {/* Add shipment tracking section */}
 *           <ShipmentTracking
 *             tracking={order.tracking}
 *             timeline={order.tracking_timeline}
 *             isLoading={false}
 *           />
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */

/**
 * EXAMPLE 2: In Individual Order Details Page
 * 
 * import { ShipmentTracking, DeliveryAnimationCard } from "@/app/components/shipment";
 * 
 * export default function OrderDetailsPage({ orderId }) {
 *   const [order, setOrder] = useState(null);
 *   const [isLoading, setIsLoading] = useState(true);
 * 
 *   useEffect(() => {
 *     // Fetch order details
 *     fetchOrder(orderId);
 *   }, [orderId]);
 * 
 *   return (
 *     <div className="grid lg:grid-cols-3 gap-8">
 *       {/* Main content */}
 *       <div className="lg:col-span-2">
 *         {/* Order items and details */}
 *       </div>
 * 
 *       {/* Shipment Info Sidebar */}
 *       <aside className="space-y-6">
 *         <DeliveryAnimationCard tracking={order?.tracking} compact={true} />
 *         
 *         <ShipmentTracking
 *           tracking={order?.tracking}
 *           timeline={order?.tracking_timeline}
 *           isLoading={isLoading}
 *         />
 *       </aside>
 *     </div>
 *   );
 * }
 */

/**
 * EXAMPLE 3: Expected Order Data Structure
 * 
 * {
 *   id: "order-123",
 *   order_number: "ORD-2024-001",
 *   created_at: "2024-01-15T10:00:00Z",
 *   status: "completed",
 *   
 *   // Tracking section
 *   tracking: {
 *     id: "track-123",
 *     status: "in_transit",
 *     courier_provider: "aramex",
 *     tracking_number: "1234567890",
 *     shipped_date: "2024-01-16T14:30:00Z",
 *     estimated_delivery: "2024-01-20T18:00:00Z",
 *     tracking_url: "https://track.aramex.com/track/1234567890",
 *     current_location: "Dubai Distribution Center",
 *     updated_at: "2024-01-18T09:15:00Z"
 *   },
 * 
 *   // Optional timeline
 *   tracking_timeline: [
 *     {
 *       status: "pending",
 *       timestamp: "2024-01-15T10:00:00Z",
 *       location: "Warehouse",
 *       description: "Order received and being prepared"
 *     },
 *     {
 *       status: "shipped",
 *       timestamp: "2024-01-16T14:30:00Z",
 *       location: "Dubai Warehouse",
 *       description: "Package shipped from warehouse"
 *     },
 *     {
 *       status: "in_transit",
 *       timestamp: "2024-01-17T08:00:00Z",
 *       location: "Dubai Distribution Center",
 *       description: "In transit to delivery location"
 *     }
 *   ]
 * }
 */

/**
 * EXAMPLE 4: Responsive Grid Layout
 * 
 * export default function OrderPage({ order }) {
 *   return (
 *     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 *       {/* Main content */}
 *       <div className="lg:col-span-2 space-y-8">
 *         {/* Order summary */}
 *         <section className="bg-white rounded-3xl p-8">
 *           <h2>Order Items</h2>
 *           {/* Items list */}
 *         </section>
 * 
 *         {/* Tracking in main area on mobile */}
 *         <ShipmentTracking
 *           tracking={order.tracking}
 *           timeline={order.tracking_timeline}
 *         />
 *       </div>
 * 
 *       {/* Sidebar */}
 *       <aside className="space-y-6">
 *         <DeliveryAnimationCard tracking={order.tracking} />
 *         <OrderSummary items={order.items} />
 *       </aside>
 *     </div>
 *   );
 * }
 */

/**
 * EXAMPLE 5: With Error Handling and Polling
 * 
 * import { useEffect, useState } from "react";
 * import { ShipmentTracking } from "@/app/components/shipment";
 * 
 * export default function OrderWithTracking({ orderId }) {
 *   const [order, setOrder] = useState(null);
 *   const [isLoading, setIsLoading] = useState(true);
 * 
 *   useEffect(() => {
 *     const fetchOrder = async () => {
 *       try {
 *         const data = await apiFetch(`/orders/${orderId}`);
 *         setOrder(data);
 *       } catch (error) {
 *         console.error("Error fetching order:", error);
 *       } finally {
 *         setIsLoading(false);
 *       }
 *     };
 * 
 *     fetchOrder();
 * 
 *     // Poll for updates every 2 minutes if not delivered
 *     const interval = setInterval(() => {
 *       if (order?.tracking?.status !== "delivered") {
 *         fetchOrder();
 *       }
 *     }, 2 * 60 * 1000);
 * 
 *     return () => clearInterval(interval);
 *   }, [orderId]);
 * 
 *   if (isLoading) return <LoadingState />;
 * 
 *   return (
 *     <div>
 *       <ShipmentTracking
 *         tracking={order?.tracking}
 *         timeline={order?.tracking_timeline}
 *         isLoading={false}
 *       />
 *     </div>
 *   );
 * }
 */

/**
 * EXAMPLE 6: Styling Customization
 * 
 * You can override the colors by modifying src/utils/shipmentUtils.ts
 * 
 * export const SHIPMENT_STATUS_CONFIG = {
 *   pending: {
 *     label: "Pending",
 *     color: "#6B4A3A",           // Primary color
 *     bgColor: "#FFF9F0",         // Background color
 *     borderColor: "#D4AF37",     // Border color
 *     textColor: "#B08938",       // Text color
 *     icon: "📦",
 *   },
 *   // ... other statuses
 * };
 */

/**
 * EXAMPLE 7: API Integration - Sample Backend Response
 * 
 * GET /api/orders/:orderId
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "order-123",
 *     "order_number": "ORD-2024-001",
 *     "tracking": {
 *       "status": "in_transit",
 *       "courier_provider": "aramex",
 *       "tracking_number": "1234567890",
 *       "shipped_date": "2024-01-16T14:30:00Z",
 *       "estimated_delivery": "2024-01-20T18:00:00Z",
 *       "tracking_url": "https://track.aramex.com/track/1234567890",
 *       "current_location": "Dubai Distribution Center",
 *       "updated_at": "2024-01-18T09:15:00Z"
 *     },
 *     "tracking_timeline": [...]
 *   }
 * }
 */

export {};
