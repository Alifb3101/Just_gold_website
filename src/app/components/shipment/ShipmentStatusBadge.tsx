import React from "react";
import { ShipmentStatus } from "@/types/shipment";
import { getStatusConfig } from "@/utils/shipmentUtils";

interface ShipmentStatusBadgeProps {
  status: ShipmentStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

/**
 * Shipment Status Badge Component
 * Displays shipment status with color coding
 */
export const ShipmentStatusBadge: React.FC<ShipmentStatusBadgeProps> = ({
  status,
  size = "md",
  showIcon = true,
}) => {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full font-semibold
        transition-all duration-200 border
        ${sizeClasses[size]}
        ${config.textColor && `text-[${config.textColor}]`}
        ${config.borderColor && `border-[${config.borderColor}]`}
        ${config.bgColor && `bg-[${config.bgColor}]`}
      `}
      style={{
        color: config.textColor,
        borderColor: config.borderColor,
        backgroundColor: config.bgColor,
      }}
    >
      {showIcon && <span className={`${iconSizeClasses[size]} text-lg`}>
        {config.icon}
      </span>}
      <span>{config.label}</span>
    </div>
  );
};
