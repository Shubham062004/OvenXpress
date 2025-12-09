import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShoppingCart, Package, Users, UtensilsCrossed, Plus, Edit, Trash2, CheckCircle, Loader2, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import * as branchAPI from "@/services/branchAPI";
import { BranchOrder, BranchInventoryItem, BranchStaff } from "@/services/branchAPI";
import { useAuth } from "@/contexts/AuthContext";
import useSocket from "@/hooks/useSocket";

interface Order {
  _id: string;
  customerName: string;
  items: {
    menuItem: {
      _id: string;
      name: string;
      image: string;
    };
    quantity: number;
    price: number;
  }[];
  total: number;
  paymentMethod: string;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  isOffline: boolean;
  createdAt: string;
}

interface RawMaterial {
  _id: string;
  name: string;
  quantity: number;
  lastUpdated: string;
}

interface StaffMember {
  _id: string;
  name: string;
  role: string;
  checkedIn: boolean;
  currentTask: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

const BranchManager = () => {
  const { id } = useParams<{ id: string }>();
  const branchId = parseInt(id || "1");
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [notifications, setNotifications] = useState<{id: string, message: string, type: string}[]>([]);
  const [showOfflineOrderDialog, setShowOfflineOrderDialog] = useState(false);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [isLoading, setIsLoading] = useState({
    orders: false,
    inventory: false,
    staff: false,
    menu: false
  });
  const [error, setError] = useState<string | null>(null);
  
  // Initialize socket connection
  const { isConnected, on, off } = useSocket();

  useEffect(() => {
    loadBranchData();
  }, [branchId]);

  // Set up socket event listeners for real-time updates
  useEffect(() => {
    if (isConnected && branchId) {
      // Listen for new orders
      on('new_order', (data) => {
        toast.success(`New order received: #${data.orderId}`);
        setNotifications(prev => [...prev, {
          id: Date.now().toString(),
          message: `New order #${data.orderId} received`,
          type: 'new_order'
        }]);
        loadBranchData(); // Refresh orders list
      });
      
      // Listen for order status changes
      on('order_status_changed', (data) => {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === data.orderId 
              ? { ...order, status: data.status } 
              : order
          )
        );
      });
      
      // Listen for kitchen notifications
      on('kitchen_notification', (data) => {
        toast.info(data.message);
        setNotifications(prev => [...prev, {
          id: Date.now().toString(),
          message: data.message,
          type: data.type
        }]);
      });
      
      // Cleanup listeners on unmount
      return () => {
        off('new_order');
        off('order_status_changed');
        off('kitchen_notification');
      };
    }
  }, [isConnected, branchId, on, off]);

  const loadBranchData = async () => {
    // Load orders
    setIsLoading(prev => ({ ...prev, orders: true }));
    try {
      const response = await branchAPI.getBranchOrders(branchId);
      if (response.data.success) {
        const apiOrders = response.data.data;
        setOrders(apiOrders.map((order: BranchOrder) => ({
          _id: order._id,
          customerName: order.customer?.name || 'Walk-in Customer',
          items: order.items,
          total: order.total,
          paymentMethod: 'Cash', // Default as API might not have this
          status: order.status,
          isOffline: order.isOffline,
          createdAt: order.createdAt
        })));
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      toast.error('Failed to load orders');
      // Fallback to localStorage if API fails
      const storedOrders = localStorage.getItem(`branch_${branchId}_orders`);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } finally {
      setIsLoading(prev => ({ ...prev, orders: false }));
    }

    // Load inventory
    setIsLoading(prev => ({ ...prev, inventory: true }));
    try {
      const response = await branchAPI.getBranchInventory(branchId);
      if (response.data.success) {
        const apiInventory = response.data.data;
        setRawMaterials(apiInventory.map((item: BranchInventoryItem) => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity,
          lastUpdated: item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : 'N/A'
        })));
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      toast.error('Failed to load inventory');
      // Fallback to localStorage if API fails
      const storedMaterials = localStorage.getItem(`branch_${branchId}_materials`);
      if (storedMaterials) {
        setRawMaterials(JSON.parse(storedMaterials));
      }
    } finally {
      setIsLoading(prev => ({ ...prev, inventory: false }));
    }

    // Load staff
    setIsLoading(prev => ({ ...prev, staff: true }));
    try {
      const response = await branchAPI.getBranchStaff(branchId);
      if (response.data.success) {
        const apiStaff = response.data.data;
        setStaff(apiStaff.map((member: BranchStaff) => ({
          _id: member._id,
          name: member.user.name,
          role: member.role,
          checkedIn: member.attendance && member.attendance.length > 0 && 
                    member.attendance[member.attendance.length - 1].checkInTime && 
                    !member.attendance[member.attendance.length - 1].checkOutTime,
          currentTask: 'On duty' // Default task
        })));
      }
    } catch (err) {
      console.error('Error loading staff:', err);
      toast.error('Failed to load staff');
      // Fallback to localStorage if API fails
      const storedStaff = localStorage.getItem(`branch_${branchId}_staff`);
      if (storedStaff) {
        setStaff(JSON.parse(storedStaff));
      } else {
        const defaultStaff: StaffMember[] = [
          { _id: '760', name: 'Rajesh Kumar', role: 'Chef', checkedIn: true, currentTask: 'Preparing orders' },
          { _id: '761', name: 'Priya Sharma', role: 'Server', checkedIn: true, currentTask: 'Taking orders' },
          { _id: '762', name: 'Amit Patel', role: 'Kitchen Helper', checkedIn: false, currentTask: 'Off duty' },
        ];
        setStaff(defaultStaff);
      }
    } finally {
      setIsLoading(prev => ({ ...prev, staff: false }));
    }

    // Load menu items - keep using localStorage for now as we don't have a menu API yet
    const storedMenu = localStorage.getItem('menuItems');
    if (storedMenu) {
      setMenuItems(JSON.parse(storedMenu));
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: "pending" | "preparing" | "ready" | "completed" | "cancelled") => {
    try {
      // This is a placeholder as the API endpoint for updating order status isn't in the branchAPI
      // In a real implementation, you would call the API to update the order status
      
      // For now, update the local state
      const updatedOrders = orders.map(order => {
        if (order._id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      setOrders(updatedOrders);
      
      toast.success(`Order ${newStatus}`);
      
      // Refresh orders from API
      loadBranchData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const addOfflineOrder = async (customerName: string, items: string, totalAmount: number, paymentMethod: string) => {
    try {
      // Parse items string into array of items
      // This is a simplified version - in a real app, you'd have a proper UI for selecting menu items
      const parsedItems = items.split(',').map(item => {
        const [name, quantity = "1"] = item.trim().split('x');
        return {
          menuItemId: "placeholder-id", // In a real app, you'd have the actual menu item ID
          quantity: parseInt(quantity),
          price: totalAmount / items.split(',').length // Simplified price calculation
        };
      });
      
      const response = await branchAPI.createOfflineOrder(branchId, {
        items: parsedItems,
        total: totalAmount,
        paymentMethod: paymentMethod as 'cash' | 'card' | 'upi'
      });
      
      if (response.data.success) {
        toast.success("Offline order added");
        // Refresh orders from API
        loadBranchData();
      } else {
        toast.error("Failed to add offline order");
      }
    } catch (error) {
      console.error('Error adding offline order:', error);
      toast.error('Failed to add offline order');
      
      // Fallback to localStorage if API fails
      const newOrder: Order = {
        _id: Date.now().toString(),
        customerName,
        items: [{ menuItem: { _id: '1', name: items, image: '' }, quantity: 1, price: totalAmount }],
        total: totalAmount,
        paymentMethod,
        status: "preparing",
        isOffline: true,
        createdAt: new Date().toISOString()
      };
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
    } finally {
      setShowOfflineOrderDialog(false);
    }
  };

  const requestRawMaterials = async (productName: string, quantity: number) => {
    try {
      const materialRequest = {
        itemId: productName, // In a real app, you'd have the actual item ID
        quantity: Number(quantity)
      };
      
      const response = await branchAPI.createMaterialRequests(branchId, [materialRequest]);
      
      if (response.data.success) {
        toast.success(`Requested ${quantity} kg of ${productName}`);
        // Refresh inventory data
        loadBranchData();
      } else {
        toast.error("Failed to create material request");
      }
    } catch (error) {
      console.error('Error requesting materials:', error);
      toast.error('Failed to create material request');
      
      // Fallback to localStorage if API fails
      const request = {
        id: Date.now().toString(),
        branchName: `Branch ${branchId}`,
        branchId,
        item: productName,
        requestedQuantity: quantity,
        status: "Pending",
        date: new Date().toISOString()
      };
      
      const existingRequests = localStorage.getItem('branchRequests');
      const requests = existingRequests ? JSON.parse(existingRequests) : [];
      requests.push(request);
      localStorage.setItem('branchRequests', JSON.stringify(requests));
    } finally {
      setShowRequestDialog(false);
    }
  };

  const updateStaffTask = async (staffId: string, newTask: string) => {
    try {
      // This is a placeholder as the API endpoint for updating staff tasks isn't in the branchAPI
      // In a real implementation, you would call the API to update the staff task
      
      // For now, update the local state
      const updatedStaff = staff.map(member => {
        if (member._id === staffId) {
          return { ...member, currentTask: newTask };
        }
        return member;
      });
      setStaff(updatedStaff);
      
      toast.success(`Task updated for ${staff.find(s => s._id === staffId)?.name}`);
      
      // Refresh staff data from API
      loadBranchData();
    } catch (error) {
      console.error('Error updating staff task:', error);
      toast.error('Failed to update staff task');
    }
  };

  const requestMenuUpdate = (menuItem: MenuItem) => {
    // Store menu update request for owner approval
    const request = {
      branchId,
      menuItem,
      timestamp: new Date().toISOString()
    };
    
    const existingRequests = localStorage.getItem('menuUpdateRequests');
    const requests = existingRequests ? JSON.parse(existingRequests) : [];
    requests.push(request);
    localStorage.setItem('menuUpdateRequests', JSON.stringify(requests));
    
    toast.success("Menu update request sent to owner");
    setShowMenuDialog(false);
    setEditingMenuItem(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Preparing": return "bg-yellow-500";
      case "Out for Delivery": return "bg-blue-500";
      case "Delivered": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 px-2 sm:px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">Branch {branchId} Manager</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage orders, staff, inventory, and menu</p>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 sm:mb-8 h-auto">
            <TabsTrigger value="orders" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <UtensilsCrossed className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Menu</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl text-primary">Online Orders</CardTitle>
                <Dialog open={showOfflineOrderDialog} onOpenChange={setShowOfflineOrderDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Offline Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Offline Order</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      addOfflineOrder(
                        formData.get('customerName') as string,
                        formData.get('items') as string,
                        Number(formData.get('amount')),
                        formData.get('payment') as string
                      );
                    }} className="space-y-4">
                      <Input name="customerName" placeholder="Customer Name" required />
                      <Textarea name="items" placeholder="Items ordered" required />
                      <Input name="amount" type="number" placeholder="Total Amount (₹)" required />
                      <Input name="payment" placeholder="Payment Method (Cash/QR)" required />
                      <Button type="submit" className="w-full">Add Order</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {isLoading.orders ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No orders today</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map(order => (
                          <TableRow key={order._id}>
                            <TableCell className="font-medium">
                              {order._id.substring(0, 8)}
                              {order.isOffline && <Badge variant="outline" className="ml-2">Offline</Badge>}
                            </TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>
                              {order.items.map(item => 
                                `${item.menuItem.name} x${item.quantity}`
                              ).join(', ')}
                            </TableCell>
                            <TableCell className="font-medium">₹{order.total}</TableCell>
                            <TableCell>{order.paymentMethod}</TableCell>
                            <TableCell>
                              <Badge variant={
                                order.status === "pending" ? "outline" :
                                order.status === "preparing" ? "default" :
                                order.status === "ready" ? "secondary" : 
                                order.status === "completed" ? "success" : "destructive"
                              }>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {order.status === "pending" && (
                                  <Button size="sm" onClick={() => updateOrderStatus(order._id, "preparing")} disabled={isLoading.orders}>
                                    Preparing
                                  </Button>
                                )}
                                {order.status === "preparing" && (
                                  <Button size="sm" onClick={() => updateOrderStatus(order._id, "ready")} disabled={isLoading.orders}>
                                    Ready
                                  </Button>
                                )}
                                {order.status === "ready" && (
                                  <Button size="sm" onClick={() => updateOrderStatus(order._id, "completed")} disabled={isLoading.orders}>
                                    Complete
                                  </Button>
                                )}
                                {order.status === "completed" && (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl text-primary">Raw Materials Received</CardTitle>
                <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                  <DialogTrigger asChild>
                    <Button>Request Materials (EOD)</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Raw Materials</DialogTitle>
                      <DialogDescription>Request materials needed for tomorrow</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      requestRawMaterials(
                        formData.get('product') as string,
                        Number(formData.get('quantity'))
                      );
                    }} className="space-y-4">
                      <Input name="product" placeholder="Product Name" required />
                      <Input name="quantity" type="number" placeholder="Required Quantity (kg)" required />
                      <Button type="submit" className="w-full">Submit Request</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {rawMaterials.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No materials received today</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Quantity Received (kg)</TableHead>
                          <TableHead>Time Received</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rawMaterials.map(material => (
                          <TableRow key={material.id}>
                            <TableCell className="font-medium">{material.productName}</TableCell>
                            <TableCell>{material.quantityReceived}</TableCell>
                            <TableCell>{material.timeReceived}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Staff Management</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading.staff ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : staff.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No staff assigned</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Staff Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Check-in Status</TableHead>
                          <TableHead>Current Task</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staff.map(member => (
                          <TableRow key={member._id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.role}</TableCell>
                            <TableCell>
                              <Badge variant={member.checkedIn ? "default" : "secondary"}>
                                {member.checkedIn ? "Checked In" : "Off Duty"}
                              </Badge>
                            </TableCell>
                            <TableCell>{member.currentTask}</TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" disabled={isLoading.staff}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Update Task for {member.name}</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    updateStaffTask(member._id, formData.get('task') as string);
                                  }} className="space-y-4">
                                    <Input name="task" placeholder="New task" defaultValue={member.currentTask} required />
                                    <Button type="submit" className="w-full">Update Task</Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl text-primary">Menu Management</CardTitle>
                <Button onClick={() => {
                  setEditingMenuItem(null);
                  setShowMenuDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems.map(item => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                          <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                        <p className="text-xl font-bold text-primary mb-3">₹{item.price}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingMenuItem(item);
                            setShowMenuDialog(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingMenuItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
                  <DialogDescription>
                    Changes will be sent to owner for approval
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const menuItem: MenuItem = {
                    id: editingMenuItem?.id || Date.now().toString(),
                    name: formData.get('name') as string,
                    price: Number(formData.get('price')),
                    category: formData.get('category') as string,
                    image: ''
                  };
                  requestMenuUpdate(menuItem);
                }} className="space-y-4">
                  <Input name="name" placeholder="Dish Name" defaultValue={editingMenuItem?.name} required />
                  <Input name="price" type="number" placeholder="Price" defaultValue={editingMenuItem?.price} required />
                  <Input name="category" placeholder="Category" defaultValue={editingMenuItem?.category} required />
                  <Button type="submit" className="w-full">Request Update</Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BranchManager;
