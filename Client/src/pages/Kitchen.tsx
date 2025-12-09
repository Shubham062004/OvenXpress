import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Clock, CheckCircle, AlertTriangle, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { orderAPI } from '@/services/api';
import useSocket from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem {
  menuItem: {
    _id: string;
    name: string;
  };
  quantity: number;
  specialInstructions?: string;
}

interface KitchenOrder {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  priority: 'high' | 'normal';
  createdAt: string;
  estimatedTime?: number;
}

interface KitchenAlert {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'error';
  timestamp: Date;
}

const Kitchen = () => {
  const [activeOrders, setActiveOrders] = useState<KitchenOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<KitchenOrder[]>([]);
  const [alerts, setAlerts] = useState<KitchenAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const mountedRef = useRef(true);
  
  // Initialize socket connection with proper checks
  const socket = useSocket();
  const isConnected = socket?.isConnected || false;
  const on = socket?.on;
  const off = socket?.off;
  const emit = socket?.emit;
  const joinRoom = socket?.joinRoom;

  // Get user's branch with fallback
  const userBranch = user?.branch || 1;

  // Load initial orders
  const fetchOrders = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setIsLoading(true);
      console.log(`🍳 Fetching kitchen orders for branch ${userBranch}...`);
      
      // Use existing API or create kitchen-specific endpoint
      const response = await orderAPI.getBranchOrders(userBranch, {
        status: 'all',
        date: new Date().toISOString().split('T')[0]
      });
      
      if (!mountedRef.current) return;
      
      const orders = response.data.data || [];
      console.log(`✅ Loaded ${orders.length} kitchen orders`);
      
      setActiveOrders(orders.filter(order => 
        ['placed', 'confirmed', 'preparing'].includes(order.status)
      ));
      
      setCompletedOrders(orders.filter(order => 
        ['ready', 'delivered', 'cancelled'].includes(order.status)
      ).slice(0, 10));
      
    } catch (error) {
      console.error('❌ Error fetching kitchen orders:', error);
      if (mountedRef.current) {
        toast({
          title: 'Failed to load orders',
          description: 'Please try refreshing the page',
          variant: 'destructive'
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userBranch, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Socket event handlers with proper cleanup
  useEffect(() => {
    if (!isConnected || !user || !on || !off || !joinRoom || !emit) {
      console.log('🔌 Socket not ready or user not authenticated');
      return;
    }

    console.log(`🔌 Setting up kitchen socket listeners for branch ${userBranch}...`);

    // Join kitchen rooms
    joinRoom('kitchen');
    if (userBranch) {
      joinRoom(`branch_${userBranch}`);
      joinRoom(`kitchen_${userBranch}`);
    }

    // Handle new orders
    const handleNewOrder = (data: any) => {
      if (!mountedRef.current) return;
      
      console.log('🆕 New kitchen order received:', data);
      
      // Play notification sound (optional)
      try {
        const audio = new Audio("/sounds/new-order.mp3");
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        console.log('Audio not available:', e);
      }
      
      toast({
        title: 'New Order Received!',
        description: `Order #${data.orderNumber || 'New'} has been placed`,
      });
      
      const newOrder: KitchenOrder = {
        _id: data._id || data.orderId || Date.now().toString(),
        orderNumber: data.orderNumber || `OX-${Date.now().toString().slice(-6)}`,
        items: data.items || [],
        status: data.status || 'pending',
        priority: data.priority || 'normal',
        createdAt: data.createdAt || new Date().toISOString()
      };
      
      setActiveOrders(prev => [newOrder, ...prev]);
    };

    // Handle order status updates
    const handleOrderStatusChange = ({ orderId, newStatus, orderData }: any) => {
      if (!mountedRef.current) return;
      
      console.log('🔄 Order status changed:', { orderId, newStatus });
      
      if (['ready', 'completed', 'cancelled', 'delivered'].includes(newStatus)) {
        // Move from active to completed
        setActiveOrders(prev => {
          const order = prev.find(o => o._id === orderId);
          if (order && ['ready', 'completed'].includes(newStatus)) {
            setCompletedOrders(prevCompleted => [
              { ...order, status: newStatus },
              ...prevCompleted
            ].slice(0, 10));
          }
          return prev.filter(o => o._id !== orderId);
        });
      } else {
        // Update status in active orders
        setActiveOrders(prev => 
          prev.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
      }
    };

    // Handle kitchen notifications
    const handleKitchenNotification = (data: any) => {
      if (!mountedRef.current) return;
      
      const newAlert: KitchenAlert = {
        id: Date.now().toString(),
        message: data.message || 'Kitchen notification',
        type: data.type || 'info',
        timestamp: new Date()
      };
      
      setAlerts(prev => [newAlert, ...prev].slice(0, 15));
      
      toast({
        title: data.type === 'warning' ? 'Kitchen Alert!' : 'Kitchen Notification',
        description: newAlert.message,
        variant: data.type === 'warning' ? 'destructive' : 'default'
      });
    };

    // Register event listeners
    on('new_order', handleNewOrder);
    on('kitchen_new_order', handleNewOrder);
    on('order_status_changed', handleOrderStatusChange);
    on('kitchen_notification', handleKitchenNotification);
    on('kitchen_alert', handleKitchenNotification);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up kitchen socket listeners...');
      off('new_order', handleNewOrder);
      off('kitchen_new_order', handleNewOrder);
      off('order_status_changed', handleOrderStatusChange);
      off('kitchen_notification', handleKitchenNotification);
      off('kitchen_alert', handleKitchenNotification);
    };
  }, [isConnected, user, userBranch, on, off, joinRoom, emit, toast]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      console.log(`🔄 Updating order ${orderId} status to ${status}...`);
      
      await orderAPI.updateOrderStatus(orderId, status);
      
      // Emit socket event if available
      if (emit) {
        emit('order_status_update', {
          orderId,
          status,
          branchId: userBranch,
          estimatedTime: status === 'preparing' ? 15 : undefined
        });
      }
      
      // Update local state immediately for better UX
      if (['ready', 'completed', 'cancelled'].includes(status)) {
        setActiveOrders(prev => {
          const order = prev.find(o => o._id === orderId);
          if (order && ['ready', 'completed'].includes(status)) {
            setCompletedOrders(prevCompleted => [
              { ...order, status: status as any },
              ...prevCompleted
            ].slice(0, 10));
          }
          return prev.filter(o => o._id !== orderId);
        });
      } else {
        setActiveOrders(prev => 
          prev.map(order => 
            order._id === orderId 
              ? { ...order, status: status as any }
              : order
          )
        );
      }
      
      toast({
        title: 'Order Updated',
        description: `Order status changed to ${status}`,
      });
      
      console.log('✅ Order status updated successfully');
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update order status',
        variant: 'destructive'
      });
    }
  }, [emit, userBranch, toast]);

  const sendKitchenAlert = useCallback((message: string, type: 'warning' | 'info') => {
    if (emit) {
      emit('kitchen_alert', {
        type,
        branchId: userBranch,
        message
      });
    }
    
    // Add to local alerts immediately
    const newAlert: KitchenAlert = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    
    setAlerts(prev => [newAlert, ...prev].slice(0, 15));
    
    toast({
      title: type === 'warning' ? 'Alert Sent' : 'Notification Sent',
      description: message,
    });
  }, [emit, userBranch, toast]);

  const getTimeElapsed = useCallback((createdAt: string) => {
    try {
      const created = new Date(createdAt);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes === 1) return '1 minute ago';
      return `${diffMinutes} minutes ago`;
    } catch (e) {
      return 'Recently';
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Kitchen <span className="text-warm-orange">Dashboard</span>
        </h1>
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-warm-orange" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Kitchen <span className="text-warm-orange">Dashboard</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Branch {userBranch} • {user?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      {/* Rest of the component remains the same... */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="active" className="text-lg py-3">
            Active Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-lg py-3">
            Completed ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-lg py-3">
            Alerts ({alerts.length})
          </TabsTrigger>
        </TabsList>
        
        {/* Active Orders Tab */}
        <TabsContent value="active" className="space-y-6">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-xl text-muted-foreground mb-4">No active orders</p>
                <p className="text-muted-foreground">New orders will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map(order => (
                <Card key={order._id} className={`
                  ${order.priority === 'high' ? 'border-red-500 border-2' : ''}
                  ${order.status === 'pending' ? 'bg-orange-50' : ''}
                `}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">
                      #{order.orderNumber}
                      {order.priority === 'high' && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Priority
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {getTimeElapsed(order.createdAt)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Items:</h3>
                        <ul className="space-y-2">
                          {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span className="text-sm">
                                {item.menuItem?.name || 'Unknown Item'} × {item.quantity}
                              </span>
                              {item.specialInstructions && (
                                <Badge variant="outline" className="text-xs">
                                  Special
                                </Badge>
                              )}
                            </li>
                          ))}
                        </ul>
                        
                        {order.items.some(item => item.specialInstructions) && (
                          <div className="mt-3 p-2 bg-muted rounded-md text-sm">
                            <p className="font-medium">Special Instructions:</p>
                            {order.items
                              .filter(item => item.specialInstructions)
                              .map((item, index) => (
                                <p key={index} className="mt-1">
                                  <span className="font-medium">{item.menuItem?.name}:</span> {item.specialInstructions}
                                </p>
                              ))
                            }
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Badge variant={
                          order.status === 'pending' ? 'outline' : 
                          order.status === 'preparing' ? 'default' : 
                          'secondary'
                        }>
                          {order.status}
                        </Badge>
                        
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => updateOrderStatus(order._id, 'preparing')}
                              className="bg-warm-orange hover:bg-warm-orange/90"
                            >
                              Start
                            </Button>
                          )}
                          
                          {order.status === 'preparing' && (
                            <Button 
                              size="sm"
                              onClick={() => updateOrderStatus(order._id, 'ready')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Ready
                            </Button>
                          )}
                          
                          <Button 
                            size="sm"
                            variant="outline" 
                            className="text-red-500"
                            onClick={() => updateOrderStatus(order._id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="flex justify-center mt-8 gap-4">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => sendKitchenAlert('Kitchen is running low on ingredients', 'warning')}
            >
              <AlertTriangle className="h-4 w-4" />
              Report Low Stock
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => sendKitchenAlert('Orders may be delayed due to high volume', 'info')}
            >
              <Bell className="h-4 w-4" />
              Notify Delay
            </Button>
          </div>
        </TabsContent>
        
        {/* Completed Orders Tab */}
        <TabsContent value="completed" className="space-y-6">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-xl text-muted-foreground mb-4">No completed orders</p>
                <p className="text-muted-foreground">Completed orders will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedOrders.map(order => (
                <Card key={order._id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">
                      #{order.orderNumber}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {getTimeElapsed(order.createdAt)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Items:</h3>
                        <ul className="space-y-1">
                          {order.items.map((item, index) => (
                            <li key={index} className="text-sm">
                              {item.menuItem?.name || 'Unknown Item'} × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Badge variant={
                          order.status === 'ready' ? 'secondary' : 'default'
                        }>
                          {order.status}
                        </Badge>
                        
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-xl text-muted-foreground mb-4">No alerts</p>
                <p className="text-muted-foreground">Kitchen alerts will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {alerts.map(alert => (
                    <li key={alert.id} className={`
                      p-4 rounded-lg flex items-start gap-3
                      ${alert.type === 'warning' ? 'bg-red-50' : 
                        alert.type === 'error' ? 'bg-red-100' : 'bg-blue-50'}
                    `}>
                      {alert.type === 'warning' || alert.type === 'error' ? (
                        <AlertTriangle className={`
                          h-5 w-5 mt-0.5
                          ${alert.type === 'error' ? 'text-red-600' : 'text-amber-600'}
                        `} />
                      ) : (
                        <Bell className="h-5 w-5 mt-0.5 text-blue-600" />
                      )}
                      
                      <div className="flex-1">
                        <p className="font-medium">
                          {alert.message}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Kitchen;
