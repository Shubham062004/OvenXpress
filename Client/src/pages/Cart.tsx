import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, X, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import OffersCarousel from '@/components/OffersCarousel';

const Cart = () => {
  const [couponCode, setCouponCode] = useState('');
  const { 
    items, 
    totalItems, 
    subtotal, 
    total, 
    discount, 
    appliedCoupon, 
    updateQuantity, 
    removeItem, 
    applyCoupon, 
    removeCoupon 
  } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isEmpty = items.length === 0;
  const deliveryFee = 50;
  const tax = Math.round(subtotal * 0.18);
  const finalTotal = total + deliveryFee + tax;

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      const success = applyCoupon(couponCode.trim().toUpperCase());
      if (success) {
        toast({
          title: "Coupon applied!",
          description: `${couponCode.toUpperCase()} has been applied to your order.`,
        });
        setCouponCode('');
      } else {
        toast({
          title: "Invalid coupon",
          description: "Please check your coupon code and try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleOfferApply = (code: string) => {
    setCouponCode(code);
    const success = applyCoupon(code);
    if (success) {
      toast({
        title: "Offer applied!",
        description: `${code} has been applied to your order.`,
      });
    }
  };

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-8 opacity-50">
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full text-muted-foreground">
              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Add some delicious items to get started!</p>
          <Button 
            className="bg-gradient-warm hover:opacity-90 px-8 py-3"
            onClick={() => navigate('/menu')}
          >
            Order Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Your <span className="text-warm-orange">Cart</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Offers Carousel */}
              <OffersCarousel onApplyOffer={handleOfferApply} />
              
              {/* Coupon Section */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-warm-orange" />
                  Apply Coupon
                </h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleApplyCoupon}
                    className="bg-gradient-warm hover:opacity-90"
                  >
                    Apply Coupon
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <span className="text-green-800 font-medium">
                      {appliedCoupon.code} applied - {appliedCoupon.description}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={removeCoupon}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-card rounded-2xl p-6 shadow-soft">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
                        <p className="text-warm-orange font-bold">₹{item.price}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-8 h-8 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-8 h-8 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-2xl p-6 shadow-soft h-fit">
              <h3 className="text-xl font-bold text-foreground mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-semibold">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-semibold">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span className="font-semibold">₹{tax}</span>
                </div>
                <div className="border-t border-border pt-3">
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 mb-2">
                      <span className="font-semibold">🎉 You saved:</span>
                      <span className="font-bold">₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-warm-orange">₹{finalTotal}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-gradient-warm hover:opacity-90 text-lg py-3">
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;