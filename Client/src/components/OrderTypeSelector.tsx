import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UtensilsCrossed, ShoppingBag, Truck } from 'lucide-react';

export type OrderType = 'dine-in' | 'take-away' | 'delivery';

interface OrderTypeSelectorProps {
  value: OrderType;
  onChange: (value: OrderType) => void;
  deliveryAddress?: string;
  onAddressChange?: (address: string) => void;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({ 
  value, 
  onChange, 
  deliveryAddress = '', 
  onAddressChange 
}) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <h3 className="text-xl font-bold text-foreground mb-4">Order Type</h3>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as OrderType)}>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-3 rounded-xl border-2 border-border hover:border-warm-orange transition-colors cursor-pointer">
            <RadioGroupItem value="dine-in" id="dine-in" />
            <Label htmlFor="dine-in" className="flex items-center gap-2 cursor-pointer flex-1">
              <UtensilsCrossed className="h-4 w-4 text-warm-orange" />
              <div>
                <p className="font-semibold text-sm">Dine-In</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-xl border-2 border-border hover:border-warm-orange transition-colors cursor-pointer">
            <RadioGroupItem value="take-away" id="take-away" />
            <Label htmlFor="take-away" className="flex items-center gap-2 cursor-pointer flex-1">
              <ShoppingBag className="h-4 w-4 text-warm-orange" />
              <div>
                <p className="font-semibold text-sm">Take-Away</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-xl border-2 border-border hover:border-warm-orange transition-colors cursor-pointer">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
              <Truck className="h-4 w-4 text-warm-orange" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Delivery (+₹20)</p>
              </div>
            </Label>
          </div>
        </div>
      </RadioGroup>
      
      {value === 'delivery' && (
        <div className="mt-4 animate-fade-in">
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

export default OrderTypeSelector;
