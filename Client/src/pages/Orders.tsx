import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Truck,
  UtensilsCrossed,
  Package,
  Loader2,
} from 'lucide-react';
import { orderAPI } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  menuItem: {
    _id?: string;
    name?: string;
    image?: string;
    imageUrl?: string;
  } | string;
  name: string;
  price: number;
  quantity: number;
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
  address?: string;
  paymentMethod: string;
  paymentStatus: string;
}

const statusColorMap: Record<string, string> = {
  ORDER_PLACED: 'bg-blue-100 text-blue-800 border-blue-200',
  CONFIRMED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  PREPARING: 'bg-amber-100 text-amber-800 border-amber-200',
  READY: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800 border-purple-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const formatStatusText = (status: string): string => {
  switch (status) {
    case 'ORDER_PLACED':
      return 'Order Placed';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'PREPARING':
      return 'Preparing in Kitchen';
    case 'READY':
      return 'Ready for Pickup / Handover';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status || 'Processing';
  }
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getMyOrders();
        const data = res.data?.data || res.data || [];
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load orders', err);
        toast({
          title: 'Error loading orders',
          description: 'Could not fetch your order history. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const activeStatuses = ['ORDER_PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'];

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return activeStatuses.includes(o.status);
    if (filter === 'completed') return !activeStatuses.includes(o.status);
    return true;
  });

  const handleReorder = (order: Order) => {
    try {
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
        description: `${addedCount} items from order #${order.orderNumber} added to your cart.`,
      });
      navigate('/cart');
    } catch {
      toast({
        title: 'Reorder error',
        description: 'Unable to populate cart with previous order items.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              My Orders
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track active deliveries and review your order history
            </p>
          </div>

          <Button
            variant="outline"
            className="w-fit"
            onClick={() => navigate('/menu')}
          >
            Browse Menu
          </Button>
        </div>

        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as 'all' | 'active' | 'completed')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Past Orders</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground text-sm">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="text-center py-16 px-4">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                No orders found
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {filter === 'active'
                  ? 'You currently have no active orders in preparation or delivery.'
                  : "You haven't placed any orders yet. Discover our fresh oven delicacies today!"}
              </p>
              <Button
                className="bg-warm-orange text-white hover:bg-warm-orange/90 mt-2"
                onClick={() => navigate('/menu')}
              >
                Order Delicious Food
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isActive = activeStatuses.includes(order.status);
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <Card
                  key={order._id}
                  className="overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="bg-muted/40 p-4 sm:p-6 pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-foreground">
                          #{order.orderNumber || order._id.slice(-6)}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                            statusColorMap[order.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {formatStatusText(order.status)}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {orderDate}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-6 space-y-4">
                    {/* Item summary */}
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-foreground">
                            <strong className="text-warm-orange mr-2">
                              {item.quantity}x
                            </strong>
                            {item.name}
                          </span>
                          <span className="text-muted-foreground font-mono">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {order.orderType === 'DELIVERY' ? (
                            <Truck className="h-4 w-4 text-warm-orange" />
                          ) : order.orderType === 'DINE_IN' ? (
                            <UtensilsCrossed className="h-4 w-4 text-warm-orange" />
                          ) : (
                            <Package className="h-4 w-4 text-warm-orange" />
                          )}
                          <span className="capitalize">{order.orderType?.toLowerCase() || 'Delivery'}</span>
                        </div>

                        <span>•</span>

                        <div>
                          Total: <strong className="text-foreground font-semibold">₹{order.total}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleReorder(order)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reorder
                        </Button>

                        <Button
                          size="sm"
                          className="bg-warm-orange text-white hover:bg-warm-orange/90 gap-1.5"
                          onClick={() => navigate(`/orders/${order._id}`)}
                        >
                          {isActive ? 'Track Live' : 'View Receipt'}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
