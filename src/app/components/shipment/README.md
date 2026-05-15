# Shipment Tracking System Documentation

Complete professional shipment tracking system for the Luxury Cosmetics E-commerce platform.

## Features ✨

- **Multi-Status Tracking**: Pending, Shipped, In Transit, Delivered, Failed
- **Color-Coded Badges**: Premium status indicators with icons
- **Timeline View**: Track shipment progression with timestamps
- **Delivery Animation**: Progress bar showing delivery status
- **Courier Support**: FedEx, DHL, Aramex, UPS with provider-specific styling
- **Real-time Updates**: Auto-polling for tracking updates
- **Copy Tracking Number**: One-click clipboard copy
- **Responsive Design**: Mobile-first, fully responsive layout
- **Error Handling**: Graceful fallbacks for missing data
- **Premium UI**: Luxury cosmetics brand aesthetic

## Project Structure

```
src/
├── types/
│   └── shipment.ts                    # TypeScript interfaces
├── utils/
│   └── shipmentUtils.ts               # Status configs & utilities
├── services/
│   └── shipmentService.ts             # API integration
├── hooks/
│   └── useShipmentTracking.ts         # Custom React hook
└── app/components/shipment/
    ├── index.ts                       # Barrel export
    ├── ShipmentTracking.tsx           # Main component
    ├── ShipmentStatusBadge.tsx        # Status badge component
    ├── ShipmentTimeline.tsx           # Timeline component
    ├── DeliveryAnimationCard.tsx      # Animation card component
    ├── INTEGRATION_GUIDE.md           # Usage examples
    └── MOCK_DATA.ts                   # Development data
```

## Components

### 1. ShipmentTracking
Main component displaying complete shipment information.

**Props:**
```typescript
interface ShipmentTrackingProps {
  tracking?: ShipmentTracking;      // Tracking data
  timeline?: ShipmentTimeline[];    // Event timeline
  isLoading?: boolean;              // Loading state
}
```

**Features:**
- Shipment status badge
- Courier provider info
- Tracking number with copy button
- Shipped and estimated delivery dates
- Current location
- Tracking timeline (expandable)
- Track package button

### 2. ShipmentStatusBadge
Reusable status badge component.

**Props:**
```typescript
interface ShipmentStatusBadgeProps {
  status: ShipmentStatus;           // Status type
  size?: 'sm' | 'md' | 'lg';       // Badge size
  showIcon?: boolean;               // Show status icon
}
```

### 3. ShipmentTimeline
Timeline view of shipment events.

**Props:**
```typescript
interface ShipmentTimelineProps {
  timeline?: ShipmentTimeline[];    // Timeline events
  isLoading?: boolean;              // Loading state
}
```

### 4. DeliveryAnimationCard
Enhanced card with delivery progress animation.

**Props:**
```typescript
interface DeliveryAnimationCardProps {
  tracking?: ShipmentTracking;      // Tracking data
  compact?: boolean;                // Compact layout
}
```

## Status Colors

| Status | Color | Background | Icon |
|--------|-------|-----------|------|
| Pending | #B08938 | #FFF9F0 | 📦 |
| Shipped | #1D4ED8 | #EFF6FF | 🚚 |
| In Transit | #C2410C | #FEF3E2 | ✈️ |
| Delivered | #15803D | #F0FDF4 | ✓ |
| Failed | #991B1B | #FEF2F2 | ✕ |

## Data Types

### ShipmentStatus
```typescript
type ShipmentStatus = "pending" | "shipped" | "in_transit" | "delivered" | "failed";
```

### ShipmentTracking
```typescript
interface ShipmentTracking {
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
```

### ShipmentTimeline
```typescript
interface ShipmentTimeline {
  status: ShipmentStatus;
  timestamp: string;
  location?: string;
  description: string;
}
```

## Usage Examples

### Basic Usage in Orders Page

```tsx
import { ShipmentTracking } from "@/app/components/shipment";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  return (
    <div className="space-y-8">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-3xl p-8">
          <ShipmentTracking
            tracking={order.tracking}
            timeline={order.tracking_timeline}
            isLoading={false}
          />
        </div>
      ))}
    </div>
  );
}
```

### With Delivery Animation Card

```tsx
import { 
  ShipmentTracking, 
  DeliveryAnimationCard 
} from "@/app/components/shipment";

export default function OrderDetailsPage({ orderId }) {
  const [order, setOrder] = useState(null);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {/* Order items */}
      </div>

      <aside className="space-y-6">
        <DeliveryAnimationCard tracking={order?.tracking} />
        <ShipmentTracking
          tracking={order?.tracking}
          timeline={order?.tracking_timeline}
        />
      </aside>
    </div>
  );
}
```

### With Auto-Refresh Hook

```tsx
import { useShipmentTracking } from "@/hooks/useShipmentTracking";
import { ShipmentTracking } from "@/app/components/shipment";

export default function OrderTracking({ trackingNumber }) {
  const { tracking, timeline, isLoading, error, refetch } = 
    useShipmentTracking({
      trackingNumber,
      autoRefresh: true,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    });

  if (error) return <div>Error: {error}</div>;

  return (
    <ShipmentTracking
      tracking={tracking}
      timeline={timeline}
      isLoading={isLoading}
    />
  );
}
```

## Courier Support

**Supported Providers:**
- FedEx (fedex)
- DHL (dhl)
- Aramex (aramex)
- UPS (ups)
- Custom/Generic (default)

Add more providers in `src/utils/shipmentUtils.ts`:

```typescript
const providers = {
  mycarrier: {
    name: "My Carrier",
    icon: "📦",
    color: "#D4AF37",
  },
};
```

## API Integration

### Fetch Shipment Tracking
```typescript
import { fetchShipmentTracking } from "@/services/shipmentService";

const response = await fetchShipmentTracking(
  "1234567890",
  authToken
);

// Returns:
// {
//   tracking: { ... },
//   timeline: [ ... ],
//   error?: string
// }
```

### Fetch Shipment Timeline
```typescript
import { fetchShipmentTimeline } from "@/services/shipmentService";

const timeline = await fetchShipmentTimeline(
  "1234567890",
  authToken
);
```

## Expected Backend Response Format

```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "order_number": "ORD-2024-001",
    "tracking": {
      "id": "track-123",
      "status": "in_transit",
      "courier_provider": "aramex",
      "tracking_number": "1234567890",
      "shipped_date": "2024-01-16T14:30:00Z",
      "estimated_delivery": "2024-01-20T18:00:00Z",
      "tracking_url": "https://track.aramex.com/track/1234567890",
      "current_location": "Dubai Distribution Center",
      "updated_at": "2024-01-18T09:15:00Z"
    },
    "tracking_timeline": [
      {
        "status": "pending",
        "timestamp": "2024-01-15T10:00:00Z",
        "location": "Warehouse",
        "description": "Order received and being prepared"
      },
      {
        "status": "shipped",
        "timestamp": "2024-01-16T14:30:00Z",
        "location": "Dubai Warehouse",
        "description": "Package shipped from warehouse"
      },
      {
        "status": "in_transit",
        "timestamp": "2024-01-17T08:00:00Z",
        "location": "Dubai Distribution Center",
        "description": "In transit to delivery location"
      }
    ]
  }
}
```

## Utilities

### Formatting Functions
```typescript
import { 
  formatShipmentDate,
  formatShipmentDateTime,
  calculateDeliveryDays,
  getCourierInfo,
  isTrackingAvailable 
} from "@/utils/shipmentUtils";

// Format date: "January 20, 2024"
formatShipmentDate("2024-01-20T18:00:00Z");

// Format with time: "Jan 20, 2024, 06:00 PM"
formatShipmentDateTime("2024-01-20T18:00:00Z");

// Calculate days: 2
calculateDeliveryDays("2024-01-22T18:00:00Z");

// Get courier info
getCourierInfo("aramex");
// { name: "Aramex", icon: "🚚", color: "#003399" }

// Check if tracking available
isTrackingAvailable("shipped");  // true
isTrackingAvailable("pending");  // false
```

## Styling

The components use Tailwind CSS with a luxury cosmetics color palette:

- **Primary Gold**: #D4AF37
- **Dark Brown**: #2C1F1B
- **Light Cream**: #FFF9F0
- **Border**: #E7DBC2
- **Text**: #6B4A3A

All colors can be customized in `src/utils/shipmentUtils.ts`.

## Error Handling

### Missing Tracking
When no tracking is available, the component displays:
```
📦 Tracking Information
Tracking will be updated soon. We'll notify you when your 
package ships.
```

### Failed Status
Failed shipments show with red badge:
- Icon: ✕
- Color: #991B1B
- Background: #FEF2F2

### API Errors
Service handles errors gracefully:
```typescript
try {
  const data = await fetchShipmentTracking(trackingNumber);
} catch (error) {
  console.error("Error:", error.message);
  // Show user-friendly error message
}
```

## Development

### Using Mock Data
```typescript
import { MOCK_SHIPMENT_DATA } from "@/app/components/shipment/MOCK_DATA";

// Use in components for testing
<ShipmentTracking
  tracking={MOCK_SHIPMENT_DATA.in_transit}
  timeline={MOCK_SHIPMENT_DATA.timeline}
/>
```

### Testing Status States
```typescript
const statuses = ["pending", "shipped", "in_transit", "delivered", "failed"];

statuses.forEach((status) => {
  <ShipmentStatusBadge status={status} size="lg" />;
});
```

## Performance Optimization

- **Memoization**: Components use React.memo for performance
- **Lazy Loading**: Timeline is collapsible to reduce render time
- **Polling Strategy**: Auto-refresh only if status !== "delivered"
- **Efficient API Calls**: Parallel fetching of tracking + timeline

## Accessibility

- ✓ Semantic HTML structure
- ✓ Color-independent status indicators (icons + colors)
- ✓ Clear button labels and descriptions
- ✓ Keyboard navigation support
- ✓ Screen reader friendly

## Browser Support

- ✓ Chrome/Edge (latest)
- ✓ Firefox (latest)
- ✓ Safari (latest)
- ✓ Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Custom Status Colors
Edit `src/utils/shipmentUtils.ts`:

```typescript
export const SHIPMENT_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#YOUR_COLOR",
    bgColor: "#YOUR_BG",
    borderColor: "#YOUR_BORDER",
    textColor: "#YOUR_TEXT",
    icon: "🎯",
  },
};
```

### Custom Courier Icons
```typescript
const providers = {
  your_carrier: {
    name: "Your Carrier",
    icon: "🚁",
    color: "#ABC123",
  },
};
```

### Custom Styling
Components accept standard Tailwind classes and inline styles for maximum flexibility.

## File Size

- ShipmentTracking.tsx: ~3.5 KB
- ShipmentStatusBadge.tsx: ~1.2 KB
- ShipmentTimeline.tsx: ~2.1 KB
- DeliveryAnimationCard.tsx: ~2.8 KB
- shipmentUtils.ts: ~2.4 KB
- **Total**: ~12 KB (gzipped ~3 KB)

## Migration from Existing Tracking

If you have existing tracking implementation:

1. **Update Order Model** to include required fields
2. **Create Service Endpoint** returning expected response format
3. **Replace Old Components** with ShipmentTracking
4. **Update API Calls** to use fetchShipmentTracking

See `INTEGRATION_GUIDE.md` for detailed examples.

## Support

For issues or questions:
1. Check `INTEGRATION_GUIDE.md` for usage examples
2. Review mock data in `MOCK_DATA.ts`
3. Test with sample tracking numbers
4. Check console for error messages
