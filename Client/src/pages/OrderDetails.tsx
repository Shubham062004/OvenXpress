import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  UtensilsCrossed,
  Package,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  ChefHat,
  ShoppingBag,
  Loader2,
  Phone,
} from 'lucide-react';
import { orderAPI } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import useSocket from '@/hooks/useSocket';

interface OrderItem {
  menuItem: {
    _id?: string;
    name?: string;
    image?: string;
    imageUrl?: string;
    description?: string;
  } | string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status:
    | 'ORDER_PLACED'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'OUT_FOR_DELIVERY'
    | 'COMPLETED'
    | 'CANCELLED';
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  items: OrderItem[];
  subtotal: number;
  gst: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  address?: string;
  specialInstructions?: string;
  paymentMethod: string;
  paymentStatus: string;
  branch?: number | string;
}

const statusSteps = [
  { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Received by restaurant', icon: ShoppingBag },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Accepted by kitchen', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'Preparing', desc: 'Baking fresh in oven', icon: ChefHat },
  { key: 'READY_OR_OUT', label: 'On The Way / Ready', desc: 'Ready for pickup or out', icon: Truck },
  { key: 'COMPLETED', label: 'Delivered / Completed', desc: 'Enjoy your meal!', icon: CheckCircle2 },
];

const getStepIndex = (status: string, orderType: string): number => {
  switch (status) {
    case 'ORDER_PLACED':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'PREPARING':
      return 2;
    case 'READY':
    case 'OUT_FOR_DELIVERY':
      return 3;
    case 'COMPLETED':
      return 4;
    default:
      return 0;
  }
};

const OrderDetails: React.FC = () => {
  const { orderId } = useParams() as { orderId?: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { on, off } = useSocket();

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await orderAPI.getOrderById(orderId);
        if (res.data?.success && res.data.data) {
          setOrder(res.data.data);
        } else {
          setError('Order not found or unauthorized.');
        }
      } catch (err: any) {
        console.error('Error fetching order details', err);
        const msg = err.response?.data?.message || 'Could not load order details.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Real-time status listener via socket
  useEffect(() => {
    const handleStatusUpdate = (data: any) => {
      if (data && (data.orderId === orderId || data.orderNumber === order?.orderNumber)) {
        setOrder((prev) => (prev ? { ...prev, status: data.status } : null));
        toast({
          title: 'Order Status Updated',
          description: `Your order is now: ${data.status.replace(/_/g, ' ')}`,
        });
      }
    };

    on('order:status', handleStatusUpdate);
    return () => {
      off('order:status', handleStatusUpdate);
    };
  }, [on, off, orderId, order?.orderNumber, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-warm-orange mb-3" />
        <p className="text-muted-foreground text-sm font-medium">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-3" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Order Not Available</h2>
        <p className="text-muted-foreground text-sm max-w-md mb-6">{error || 'Unable to retrieve this order.'}</p>
        <Button onClick={() => navigate('/orders')} variant="outline">
          Back to Order History
        </Button>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status, order.orderType);
  const isCancelled = order.status === 'CANCELLED';

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleReorder = () => {
    let addedCount = 0;
    order.items.forEach((item) => {
      const itemId =
        typeof item.menuItem === 'object' && item.menuItem?._id
          ? item.menuItem._id
          : String(item.menuItem || '');

      if (itemId) {
        addItem(
          {
            id: itemId,
            name: item.name,
            price: item.price,
          },
          item.quantity
        );
        addedCount += item.quantity;
      }
    });

    toast({
      title: 'Items added to cart',
      description: `${addedCount} items added to your cart.`,
    });
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/orders')}
          >
            <ArrowLeft className="h-4 w-4" />
            All Orders
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReorder} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Reorder
            </Button>
          </div>
        </div>

        {/* Order Header Card */}
        <Card className="border border-border shadow-soft">
          <CardHeader className="bg-gradient-to-r from-warm-orange/10 via-amber-500/5 to-transparent pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-warm-orange">
                  Oven Xpress Live Tracker
                </CardDescription>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                  Order #{order.orderNumber}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Placed on {orderDate}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:self-start">
                <Badge variant={isCancelled ? 'destructive' : 'default'} className="capitalize px-3 py-1 text-xs">
                  {order.status.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline" className="capitalize text-xs">
                  {order.orderType?.toLowerCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            {/* Live Progress Tracker */}
            {isCancelled ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                <AlertCircle className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Order Cancelled</h4>
                  <p className="text-xs opacity-90">This order was cancelled. If you were charged, a refund has been initiated.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Order Progress
                </h3>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-4 right-4 h-0.5 bg-muted -z-0 hidden sm:block">
                    <div
                      className="h-full bg-warm-orange transition-all duration-500"
                      style={{
                        width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                    {statusSteps.map((step, idx) => {
                      const isPast = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      const Icon = step.icon;

                      return (
                        <div
                          key={step.key}
                          className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCurrent
                                ? 'bg-warm-orange text-white border-warm-orange ring-4 ring-warm-orange/20 scale-110'
                                : isPast
                                ? 'bg-warm-orange text-white border-warm-orange'
                                : 'bg-background text-muted-foreground border-muted'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="sm:mt-1">
                            <p
                              className={`text-xs font-semibold ${
                                isCurrent
                                  ? 'text-warm-orange'
                                  : isPast
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground hidden sm:block">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Delivery & Service Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-muted/30 rounded-xl space-y-1.5 border border-border">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  {order.orderType === 'DELIVERY' ? (
                    <Truck className="h-4 w-4 text-warm-orange" />
                  ) : order.orderType === 'DINE_IN' ? (
                    <UtensilsCrossed className="h-4 w-4 text-warm-orange" />
                  ) : (
                    <Package className="h-4 w-4 text-warm-orange" />
                  )}
                  <span>Order Type: {order.orderType?.replace(/_/g, ' ')}</span>
                </div>
                {order.address && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-warm-orange" />
                    <span>{order.address}</span>
                  </p>
                )}
                {order.specialInstructions && (
                  <p className="text-xs italic text-muted-foreground pt-1">
                    "{order.specialInstructions}"
                  </p>
                )}
              </div>

              <div className="p-4 bg-muted/30 rounded-xl space-y-1.5 border border-border">
                <h4 className="font-semibold text-foreground">Payment Details</h4>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Method:</span>
                  <span className="font-medium text-foreground uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Payment Status:</span>
                  <span className="font-medium text-foreground capitalize">
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Items Receipt */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Order Receipt
              </h3>

              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-1">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-muted text-warm-orange font-bold text-xs flex items-center justify-center">
                        {item.quantity}x
                      </span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="font-mono text-foreground font-medium">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-2" />

              {/* Authoritative Price Breakdown */}
              <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-mono">₹{order.subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-mono">₹{order.gst}</span>
                </div>

                {order.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-mono">₹{order.deliveryFee}</span>
                  </div>
                )}

                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({order.couponCode || 'Promo'})</span>
                    <span className="font-mono">-₹{order.discount}</span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="flex justify-between text-base font-bold text-foreground pt-1">
                  <span>Total Amount</span>
                  <span className="text-warm-orange font-mono">₹{order.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetails;
