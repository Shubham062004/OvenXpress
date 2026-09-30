// src/pages/Cart.tsx
import * as React from 'react';
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
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  MapPin,
  Clock,
  Loader2,
  Tag,
  CreditCard,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { useToast } from '@/hooks/use-toast';
import { orderAPI, couponAPI, userAPI } from '@/services/api';
import OrderTypeSelector from '@/components/OrderTypeSelector';
import CouponSuccessPopup from '@/components/CouponSuccessPopup';

type OrderType = 'dine-in' | 'takeaway' | 'delivery';

interface Address {
  _id: string;
  label: string;
  address?: string;
  isDefault?: boolean;
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}

interface CouponType {
  _id?: string;
  id?: string;
  code: string;
  title?: string;
  description?: string;
  type: 'percentage' | 'fixed';
  discount?: number;
  value?: number;
  minOrderValue: number;
  maxDiscount?: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  notes?: string;
}

const getErrorMessage = (err: unknown): string => {
  if (!err || typeof err !== 'object') return String(err ?? 'Unknown error');
  const maybe = err as Record<string, unknown>;
  const response = maybe.response as { data?: { message?: string } } | undefined;
  if (response?.data?.message && typeof response.data.message === 'string') {
    return response.data.message;
  }
  if (typeof maybe.message === 'string') return maybe.message;
  return 'Network error';
};

const Cart = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal: cartSubtotal,
    branchId: cartBranchId,
    branchName: cartBranchName,
  } = useCart();
  const { selectedBranch, setIsBranchModalOpen } = useBranch();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // UI / order state
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponType | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [availableCoupons, setAvailableCoupons] = useState<CouponType[]>([]);
  const [showCouponSuccess, setShowCouponSuccess] = useState(false);

  // loading flags
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Authoritative restaurant GST rate (5%)
  const deliveryFee = orderType === 'delivery' ? 40 : 0;
  const gstRate = 0.05;
  const subtotal = cartSubtotal ?? 0;
  const gstAmount = Math.round(subtotal * gstRate);
  const discountAmount = couponDiscount;
  const finalTotal = Math.max(0, subtotal + gstAmount + deliveryFee - discountAmount);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // addresses
        const addressResponse = await userAPI.getAddresses();
        const userAddresses = (addressResponse.data?.data ?? []) as Address[];
        setAddresses(userAddresses);
        const defaultAddr = userAddresses.find((a) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr._id);

        // available coupons
        const couponResponse = await couponAPI.getActive();
        const coupons = (couponResponse.data?.data ?? []) as CouponType[];
        setAvailableCoupons(coupons);
      } catch (err) {
        console.error('Error fetching cart data', err);
        toast({
          title: 'Error loading data',
          description: getErrorMessage(err),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, toast]);

  const itemCount = items.reduce((s: number, it: CartItem) => s + (it.quantity ?? 0), 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Invalid coupon',
        description: 'Please enter a coupon code',
        variant: 'destructive',
      });
      return;
    }

    setIsApplyingCoupon(true);
    try {
      // backend expects orderValue or total depending on your API
      const response = await couponAPI.validate({
        code: couponCode,
        orderValue: subtotal,
        userId: user?._id,
      });

      if (response.data?.success) {
        const data = response.data.data as {
          coupon: CouponType;
          discount: number;
        } | null;

        if (data?.coupon) {
          setAppliedCoupon(data.coupon);
          setCouponDiscount(data.discount ?? 0);
          setShowCouponSuccess(true);
          toast({
            title: 'Coupon Applied!',
            description: `You saved ₹${data.discount ?? 0}`,
          });
        } else {
          toast({
            title: 'Coupon Error',
            description: 'Invalid coupon response from server',
            variant: 'destructive',
          });
        }
      } else {
        throw new Error(response.data?.message ?? 'Invalid coupon');
      }
    } catch (err) {
      console.error('Error applying coupon', err);
      toast({
        title: 'Coupon Error',
        description: getErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    toast({
      title: 'Coupon Removed',
      description: 'Coupon discount has been removed from your order',
    });
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before placing an order',
        variant: 'destructive',
      });
      return;
    }

    if (orderType === 'delivery' && !selectedAddress) {
      toast({
        title: 'Address Required',
        description: 'Please select a delivery address',
        variant: 'destructive',
      });
      return;
    }

    const selectedAddressObj = addresses.find((a) => a._id === selectedAddress);
    const addressString = selectedAddressObj
      ? selectedAddressObj.address ||
        [selectedAddressObj.line1, selectedAddressObj.city, selectedAddressObj.pincode]
          .filter(Boolean)
          .join(', ')
      : selectedAddress;

    const payload = {
      items: items.map((item: CartItem) => ({
        id: item.id,
        quantity: item.quantity,
        notes: item.notes,
      })),
      branchId: selectedBranch?.id || cartBranchId || undefined,
      orderType: orderType === 'dine-in' ? 'DINE_IN' : orderType === 'takeaway' ? 'TAKEAWAY' : 'DELIVERY',
      address: addressString,
      deliveryAddress: selectedAddressObj || null,
      specialInstructions: specialInstructions || undefined,
      couponCode: appliedCoupon?.code || undefined,
      paymentMethod: 'CASH',
    };

    setIsPlacingOrder(true);
    try {
      const response = await orderAPI.createOrder(payload);
      if (response.data?.success) {
        const order = response.data.data;
        clearCart();
        toast({
          title: 'Order Placed Successfully!',
          description: `Your order #${order.orderNumber ?? order._id ?? '—'} has been placed`,
        });
        navigate(`/orders/${order._id ?? order.id}`, { replace: true });
      } else {
        throw new Error(response.data?.message ?? 'Failed to place order');
      }
    } catch (err) {
      console.error('Error placing order', err);
      toast({
        title: 'Order Failed',
        description: getErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet. Browse our menu to find delicious food!
            </p>
            <Button onClick={() => navigate('/menu')} className="bg-warm-orange hover:bg-warm-orange/90" size="lg">
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
            Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: CartItem) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image ?? '/placeholder.svg'}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-warm-orange font-bold">₹{item.price}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}>
                          <Minus className="h-4 w-4" />
                        </Button>

                        <span className="w-12 text-center font-medium">{item.quantity}</span>

                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">₹{item.price * item.quantity}</p>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-8 w-8 p-0" onClick={() => removeItem(item.id)}>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Order Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderTypeSelector
                    value={orderType}
                    onChange={(v) => setOrderType(v as OrderType)}
                  />
                </CardContent>
              </Card>

              {orderType === 'delivery' && (
                <Card>
                  <CardHeader><CardTitle>Delivery Address</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {addresses.length > 0 ? (
                      <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                        <SelectTrigger><SelectValue placeholder="Select delivery address" /></SelectTrigger>
                        <SelectContent>
                          {addresses.map((addr) => (
                            <SelectItem key={addr._id} value={addr._id}>
                              <div>
                                <div className="font-medium">{addr.label}</div>
                                <div className="text-sm text-muted-foreground">{addr.address ?? `${addr.line1 ?? ''}, ${addr.city ?? ''}`}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground mb-2">No addresses found</p>
                        <Button variant="outline" onClick={() => navigate('/profile')}>Add Address</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle>Special Instructions</CardTitle></CardHeader>
                <CardContent>
                  <Textarea placeholder="Any special requests for your order..." value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} rows={3} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Apply Coupon</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                        <p className="text-sm text-green-600">₹{couponDiscount} saved</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700">Remove</Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Input placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} disabled={isApplyingCoupon} />
                        <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode.trim()}>
                          {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>

                      {availableCoupons.length > 0 && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Available Coupons:</Label>
                          <div className="mt-2 space-y-2">
                            {availableCoupons.slice(0, 3).map((c) => (
                              <div key={c._id} className="p-2 border rounded cursor-pointer hover:bg-muted" onClick={() => setCouponCode(c.code)}>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{c.code}</span>
                                  <Badge variant="secondary">{c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Branch info */}
                  <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-muted/60 border border-border">
                    <div className="flex items-center gap-2 text-foreground">
                      <MapPin className="w-4 h-4 text-warm-orange shrink-0" />
                      <span>
                        Kitchen:{' '}
                        <strong>{selectedBranch?.name || cartBranchName || 'Default Branch'}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBranchModalOpen(true)}
                      className="text-warm-orange hover:underline text-xs font-semibold"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (5%)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>₹{deliveryFee}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-warm-orange">₹{finalTotal}</span>
                  </div>

                  <Button
                    className="w-full bg-warm-orange hover:bg-warm-orange/90 text-white"
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
                    <p className="text-xs text-muted-foreground text-center">
                      Please select a delivery address to continue
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {showCouponSuccess && appliedCoupon && (
        <CouponSuccessPopup
          show={showCouponSuccess}
          couponCode={appliedCoupon.code}
          onClose={() => setShowCouponSuccess(false)}
        />
      )}
    </div>
  );
};

export default Cart;
