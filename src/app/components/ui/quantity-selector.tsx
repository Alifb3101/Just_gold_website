import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  max?: number;
  min?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  max = 10,
  min = 1,
  size = 'md',
}: QuantitySelectorProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const containerClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  return (
    <div className={`flex items-center ${containerClasses[size]}`}>
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className={`${sizeClasses[size]} border-2 border-[#D4AF37] rounded-md flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#D4AF37] transition-all duration-200`}
      >
        <Minus className="w-4 h-4" />
      </button>

      <span className={`${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'} font-semibold text-[#3E2723] min-w-[2rem] text-center`}>
        {quantity}
      </span>

      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className={`${sizeClasses[size]} border-2 border-[#D4AF37] rounded-md flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#D4AF37] transition-all duration-200`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
