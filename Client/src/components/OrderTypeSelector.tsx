// src/components/OrderTypeSelector.tsx
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UtensilsCrossed, ShoppingBag, Truck } from 'lucide-react';

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

interface OrderTypeSelectorProps {
  // Primary props used by Cart.tsx
  selectedType?: OrderType;
  onTypeChange?: (value: OrderType) => void;

  // Backwards-compatible alternative prop names (optional)
  value?: OrderType;
  onChange?: (value: OrderType) => void;

  // Optional address props
  deliveryAddress?: string;
  onAddressChange?: (address: string) => void;
}

/**
 * OrderTypeSelector
 *
 * - Supports both (selectedType, onTypeChange) and (value, onChange)
 * - Normalizes "take-away" => "takeaway" if necessary
 * - Guards missing callbacks to avoid runtime errors
 */
const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  value,
  onChange,
  deliveryAddress = '',
  onAddressChange,
}) => {
  // choose the current value from either prop
  const current: OrderType =
    normalizeOrderType((selectedType ?? value) as OrderType) ?? 'dine-in';

  // prefer onTypeChange, fall back to onChange
  const handleTypeChange = (v: string) => {
    const normalized = normalizeOrderType(v);
    if (onTypeChange) return onTypeChange(normalized);
    if (onChange) return onChange(normalized);
    // nothing to do if no callback provided
  };

  return (
    <div className="bg-card rounded-2xl p-4 md:p-6 shadow-soft">
      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">Order Type</h3>

      <RadioGroup value={current} onValueChange={(v) => handleTypeChange(v as string)}>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 rounded-xl border-2 border-border hover:border-warm-orange transition-colors cursor-pointer">
            <RadioGroupItem value="dine-in" id="dine-in" />
            <Label htmlFor="dine-in" className="flex items-center gap-2 cursor-pointer flex-1">
              <UtensilsCrossed className="h-4 w-4 text-warm-orange" />
              <div>
                <p className="font-medium text-sm">Dine In</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-xl border-2 border-border hover:border-warm-orange transition-colors cursor-pointer">
            <RadioGroupItem value="takeaway" id="takeaway" />
            <Label htmlFor="takeaway" className="flex items-center gap-2 cursor-pointer flex-1">
              <ShoppingBag className="h-4 w-4 text-warm-orange" />
              <div>
                <p className="font-medium text-sm">Takeaway / Pickup</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-xl border-2 border-border hover:border-warm-orange transition-colors cursor-pointer">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
              <Truck className="h-4 w-4 text-warm-orange" />
              <div>
                <p className="font-medium text-sm">Delivery (+₹20)</p>
              </div>
            </Label>
          </div>
        </div>
      </RadioGroup>

      {current === 'delivery' && (
        <div className="mt-4">
          <Input
            placeholder="Enter delivery address"
            value={deliveryAddress}
            onChange={(e) => onAddressChange?.(e.target.value)}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

/** normalize different string variants to our OrderType union */
function normalizeOrderType(v?: string | null): OrderType {
  if (!v) return 'dine-in';
  const s = String(v).trim().toLowerCase();
  if (s === 'take-away' || s === 'take_away' || s === 'take away') return 'takeaway';
  if (s === 'takeaway') return 'takeaway';
  if (s === 'delivery') return 'delivery';
  return 'dine-in';
}

export default OrderTypeSelector;
