/**
 * Shipment Tracking - Quick Start Guide
 * 
 * Follow these steps to integrate the shipment tracking system
 * into your order pages.
 */

/**
 * STEP 1: Install & Import
 * ========================
 * 
 * The components are already created in:
 * - src/app/components/shipment/
 * - src/types/shipment.ts
 * - src/utils/shipmentUtils.ts
 * - src/services/shipmentService.ts
 * - src/hooks/useShipmentTracking.ts
 */

/**
 * STEP 2: Update Your Order API Response
 * ========================================
 * 
 * Make sure your order API returns tracking data:
 * 
 * GET /api/orders/:orderId
 * 
 * {
 *   "order_number": "ORD-2024-001",
 *   "tracking": {
 *     "status": "in_transit",
 *     "courier_provider": "aramex",
 *     "tracking_number": "123456789",
 *     "shipped_date": "2024-01-16T14:30:00Z",
 *     "estimated_delivery": "2024-01-20T18:00:00Z",
 *     "tracking_url": "https://...",
 *     "current_location": "Dubai Distribution Center",
 *     "updated_at": "2024-01-18T09:15:00Z"
 *   },
 *   "tracking_timeline": [
 *     {
 *       "status": "shipped",
 *       "timestamp": "2024-01-16T14:30:00Z",
 *       "location": "Dubai Warehouse",
 *       "description": "Package shipped"
 *     }
 *   ]
 * }
 */

/**
 * STEP 3: Add to Orders Page
 * ===========================
 */

import { ShipmentTracking, DeliveryAnimationCard } from "@/app/components/shipment";

// In your Orders.jsx or order detail component:
export function OrderCard({ order }) {
  return (
    <div className="bg-white rounded-3xl p-8">
      {/* Existing order details... */}

      {/* Add shipment tracking section */}
      {order.tracking && (
        <>
          <div className="my-6 border-t border-[#E7DBC2]" />
          <ShipmentTracking
            tracking={order.tracking}
            timeline={order.tracking_timeline}
            isLoading={false}
          />
        </>
      )}
    </div>
  );
}

/**
 * STEP 4: Optional - Add Delivery Animation Card
 * ===============================================
 */

// In order details sidebar:
export function OrderDetailsSidebar({ order }) {
  return (
    <aside className="space-y-6">
      <DeliveryAnimationCard tracking={order?.tracking} />
      {/* Other sidebar content */}
    </aside>
  );
}

/**
 * STEP 5: Optional - Add Auto-Refresh
 * ====================================
 */

import { useShipmentTracking } from "@/hooks/useShipmentTracking";

export function OrderDetailsWithAutoRefresh({ order }) {
  const { tracking, timeline, isLoading } = useShipmentTracking({
    trackingNumber: order?.tracking?.tracking_number,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <ShipmentTracking
      tracking={tracking || order?.tracking}
      timeline={timeline || order?.tracking_timeline}
      isLoading={isLoading}
    />
  );
}

/**
 * INTEGRATION CHECKLIST
 * ====================
 * 
 * ☐ 1. Files created in correct locations
 *      - src/types/shipment.ts
 *      - src/utils/shipmentUtils.ts
 *      - src/services/shipmentService.ts
 *      - src/hooks/useShipmentTracking.ts
 *      - src/app/components/shipment/*
 * 
 * ☐ 2. Backend API returns tracking data in expected format
 *      - Check your /orders and /orders/:id endpoints
 * 
 * ☐ 3. Import components in your pages
 *      import { ShipmentTracking } from "@/app/components/shipment"
 * 
 * ☐ 4. Add to order display template
 *      <ShipmentTracking tracking={order.tracking} ... />
 * 
 * ☐ 5. Test with mock data
 *      Use MOCK_DATA.ts for development
 * 
 * ☐ 6. Verify responsive layout on mobile
 * 
 * ☐ 7. Test tracking URL opens in new tab
 * 
 * ☐ 8. Test tracking number copy functionality
 * 
 * ☐ 9. Test all shipment status states
 *      - pending, shipped, in_transit, delivered, failed
 * 
 * ☐ 10. Verify colors match your brand
 *       Edit src/utils/shipmentUtils.ts if needed
 */

/**
 * TESTING WITH MOCK DATA
 * ======================
 */

import { MOCK_SHIPMENT_DATA, TEST_SCENARIOS } from "@/app/components/shipment/MOCK_DATA";

// Test different statuses:
export function ShipmentTestDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h2>Pending Status</h2>
        <ShipmentTracking tracking={MOCK_SHIPMENT_DATA.pending} />
      </div>

      <div>
        <h2>In Transit Status</h2>
        <ShipmentTracking
          tracking={MOCK_SHIPMENT_DATA.in_transit}
          timeline={MOCK_SHIPMENT_DATA.timeline}
        />
      </div>

      <div>
        <h2>Delivered Status</h2>
        <ShipmentTracking
          tracking={MOCK_SHIPMENT_DATA.delivered}
          timeline={MOCK_SHIPMENT_DATA.timelineDelivered}
        />
      </div>

      <div>
        <h2>Failed Status</h2>
        <ShipmentTracking
          tracking={MOCK_SHIPMENT_DATA.failed}
          timeline={MOCK_SHIPMENT_DATA.timelineFailed}
        />
      </div>
    </div>
  );
}

/**
 * COMMON ISSUES & FIXES
 * ======================
 */

/*
Issue: Tracking data is undefined
Fix: Make sure your order object has a 'tracking' property
     Check backend API response

Issue: Status badge colors not showing
Fix: Ensure Tailwind CSS is configured in your project
     Check tailwind.config.js includes the src directory

Issue: Tracking URL doesn't open
Fix: Verify tracking_url field is populated in backend
     Check that the URL is valid and reachable

Issue: Timeline not showing
Fix: Pass timeline prop to ShipmentTracking component
     Make sure timeline array is not empty

Issue: Layout issues on mobile
Fix: Component is fully responsive by default
     Check if parent container has proper constraints
     Test in browser dev tools mobile view

Issue: Copy button not working
Fix: Browser must support navigator.clipboard API
     Add fallback for older browsers if needed

Issue: Dates showing incorrectly
Fix: Ensure backend sends ISO 8601 format dates
     Check your timezone configuration
*/

/**
 * FILE SIZES & PERFORMANCE
 * ========================
 * 
 * Component sizes (minified):
 * - ShipmentTracking.tsx: ~3.5 KB
 * - ShipmentStatusBadge.tsx: ~1.2 KB
 * - ShipmentTimeline.tsx: ~2.1 KB
 * - DeliveryAnimationCard.tsx: ~2.8 KB
 * - Utilities & Types: ~5 KB
 * Total: ~15 KB (gzipped ~4 KB)
 * 
 * Performance optimizations:
 * - Components use React.memo
 * - Timeline is collapsible
 * - Auto-refresh only runs if not delivered
 * - No external dependencies beyond React
 */

/**
 * CUSTOMIZATION
 * ==============
 */

// Change status colors:
// Edit src/utils/shipmentUtils.ts
// Update SHIPMENT_STATUS_CONFIG object

// Add courier providers:
// Edit getCourierInfo() function
// Add new provider to the providers object

// Customize styling:
// All classes use Tailwind CSS
// Can override with inline styles on any component

/**
 * SUPPORT & RESOURCES
 * ====================
 * 
 * Documentation files:
 * - README.md - Full feature documentation
 * - INTEGRATION_GUIDE.md - Detailed integration examples
 * - MOCK_DATA.ts - Test data and scenarios
 * - This file - Quick start guide
 * 
 * Component files:
 * - ShipmentTracking.tsx - Main component
 * - ShipmentStatusBadge.tsx - Status badge
 * - ShipmentTimeline.tsx - Timeline view
 * - DeliveryAnimationCard.tsx - Animation card
 * 
 * Utility files:
 * - shipmentUtils.ts - Formatting & config
 * - shipmentService.ts - API integration
 * - useShipmentTracking.ts - Custom hook
 * 
 * Type definitions:
 * - shipment.ts - TypeScript interfaces
 */

export {};
