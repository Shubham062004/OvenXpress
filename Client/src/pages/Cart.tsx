// src/pages/Cart.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, Trash2, ShoppingCart, MapPin, Clock, Loader2, Tag, CreditCard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { orderAPI, couponAPI, userAPI } from '@/services/api';
import OrderTypeSelector from '@/components/OrderTypeSelector';
import CouponSuccessPopup from '@/components/CouponSuccessPopup';

interface Address {
  _id: string;
  label: string;
  address: string;
  isDefault?: boolean;
}

interface Coupon {
  _id: string;
  code: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
}

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Order details
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [showCouponSuccess, setShowCouponSuccess] = useState(false);
  
  // Loading states
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Constants
  const deliveryFee = orderType === 'delivery' ? 40 : 0;
  const gstRate = 0.18; // 18% GST
  const subtotal = getTotal();
  const gstAmount = Math.round(subtotal * gstRate);
  const discountAmount = couponDiscount;
  const finalTotal = Math.max(0, subtotal + gstAmount + deliveryFee - discountAmount);

  // Fetch user addresses and available coupons
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('🛒 Fetching cart data...');

        // Fetch user addresses
        const addressResponse = await userAPI.getAddresses();
        const userAddresses = addressResponse.data.data || [];
        setAddresses(userAddresses);
        
        // Set default address
        const defaultAddress = userAddresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        }
        
        console.log(`✅ Loaded ${userAddresses.length} addresses`);

        // Fetch available coupons
        const couponResponse = await couponAPI.getActive();
        const coupons = couponResponse.data.data || [];
        setAvailableCoupons(coupons);
        console.log(`✅ Loaded ${coupons.length} available coupons`);

      } catch (error) {
        console.error('❌ Error fetching cart data:', error);
        toast({
          title: 'Error loading data',
          description: 'Some features may not work properly',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, toast]);

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Invalid coupon',
        description: 'Please enter a coupon code',
        variant: 'destructive'
      });
      return;
    }

    setIsApplyingCoupon(true);
    
    try {
      console.log('🎫 Applying coupon:', couponCode);
      
      const response = await couponAPI.validate({
        code: couponCode,
        orderValue: subtotal,
        userId: user?._id
      });

      if (response.data.success) {
        const { coupon, discount } = response.data.data;
        setAppliedCoupon(coupon);
        setCouponDiscount(discount);
        setShowCouponSuccess(true);
        
        toast({
          title: 'Coupon Applied!',
          description: `You saved ₹${discount} with ${coupon.code}`,
        });
        
        console.log('✅ Coupon applied successfully:', coupon.code, 'Discount:', discount);
      }
    } catch (error: any) {
      console.error('❌ Error applying coupon:', error);
      const message = error.response?.data?.message || 'Invalid or expired coupon code';
      toast({
        title: 'Coupon Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    toast({
      title: 'Coupon Removed',
      description: 'Coupon discount has been removed from your order',
    });
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before placing an order',
        variant: 'destructive'
      });
      return;
    }

    if (orderType === 'delivery' && !selectedAddress) {
      toast({
        title: 'Address Required',
        description: 'Please select a delivery address',
        variant: 'destructive'
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      console.log('📝 Placing order...');
      
      const orderData = {
        items: items.map(item => ({
          menuItem: item.id,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: specialInstructions || undefined
        })),
        orderType,
        deliveryAddress: orderType === 'delivery' ? selectedAddress : undefined,
        specialInstructions: specialInstructions || undefined,
        couponCode: appliedCoupon?.code,
        pricing: {
          subtotal,
          gstAmount,
          deliveryFee,
          discountAmount,
          finalTotal
        }
      };

      const response = await orderAPI.createOrder(orderData);

      if (response.data.success) {
        const order = response.data.data;
        console.log('✅ Order placed successfully:', order._id);
        
        // Clear cart
        clearCart();
        
        toast({
          title: 'Order Placed Successfully!',
          description: `Your order #${order.orderNumber} has been placed`,
        });

        // Navigate to order confirmation or orders page
        navigate(`/orders/${order._id}`, { replace: true });
      }
    } catch (error: any) {
      console.error('❌ Error placing order:', error);
      const message = error.response?.data?.message || 'Failed to place order. Please try again.';
      toast({
        title: 'Order Failed',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading cart...</span>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet. 
              Browse our menu to find delicious food!
            </p>
            <Button 
              onClick={() => navigate('/menu')}
              className="bg-warm-orange hover:bg-warm-orange/90"
              size="lg"
            >
              Browse Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8" />
            Your Cart ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-warm-orange font-bold">₹{item.price}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">₹{item.price * item.quantity}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Order Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Order Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderTypeSelector
                    selectedType={orderType}
                    onTypeChange={setOrderType}
                  />
                </CardContent>
              </Card>

              {/* Delivery Address */}
              {orderType === 'delivery' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {addresses.length > 0 ? (
                      <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery address" />
                        </SelectTrigger>
                        <SelectContent>
                          {addresses.map((address) => (
                            <SelectItem key={address._id} value={address._id}>
                              <div>
                                <div className="font-medium">{address.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {address.address}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground mb-2">No addresses found</p>
                        <Button
                          variant="outline"
                          onClick={() => navigate('/profile')}
                        >
                          Add Address
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Special Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Special Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any special requests for your order..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Coupon Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Apply Coupon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                        <p className="text-sm text-green-600">₹{couponDiscount} saved</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          disabled={isApplyingCoupon}
                        />
                        <Button
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponCode.trim()}
                        >
                          {isApplyingCoupon ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                      
                      {availableCoupons.length > 0 && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Available Coupons:</Label>
                          <div className="mt-2 space-y-2">
                            {availableCoupons.slice(0, 3).map((coupon) => (
                              <div
                                key={coupon._id}
                                className="p-2 border rounded cursor-pointer hover:bg-muted"
                                onClick={() => setCouponCode(coupon.code)}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{coupon.code}</span>
                                  <Badge variant="secondary">
                                    {coupon.type === 'percentage' 
                                      ? `${coupon.value}% OFF` 
                                      : `₹${coupon.value} OFF`
                                    }
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {coupon.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  
                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>₹{deliveryFee}</span>
                    </div>
                  )}
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal}</span>
                  </div>
                  
                  <Button
                    className="w-full bg-warm-orange hover:bg-warm-orange/90"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || (orderType === 'delivery' && !selectedAddress)}
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Place Order - ₹{finalTotal}
                      </>
                    )}
                  </Button>
                  
                  {orderType === 'delivery' && !selectedAddress && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please select a delivery address to continue
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Success Popup */}
      {showCouponSuccess && appliedCoupon && (
        <CouponSuccessPopup
          coupon={appliedCoupon}
          discount={couponDiscount}
          onClose={() => setShowCouponSuccess(false)}
        />
      )}
    </div>
  );
};

export default Cart;
