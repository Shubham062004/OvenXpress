// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  Heart,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Star,
  Clock,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { userAPI, orderAPI } from '@/services/api';

interface Address {
  _id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    menuItem: {
      name: string;
      image?: string;
    };
    quantity: number;
    price: number;
  }>;
  status: string;
  totalAmount: number;
  createdAt: string;
  orderType: string;
}

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  // Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    birthday: user?.birthday || '',
  });

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: '',
    address: ''
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('👤 Fetching user profile data...');

        // Fetch addresses
        const addressResponse = await userAPI.getAddresses();
        const userAddresses = addressResponse.data.data || [];
        setAddresses(userAddresses);
        console.log(`✅ Loaded ${userAddresses.length} addresses`);

        // Fetch orders
        setIsLoadingOrders(true);
        const ordersResponse = await orderAPI.getMyOrders();
        const userOrders = ordersResponse.data.data || [];
        setOrders(userOrders);
        console.log(`✅ Loaded ${userOrders.length} orders`);

      } catch (error) {
        console.error('❌ Error fetching user data:', error);
        toast({
          title: 'Error loading profile',
          description: 'Some information may not be available',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingOrders(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user, toast]);

  // Update profile
  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    
    try {
      console.log('👤 Updating profile...');
      
      const response = await userAPI.updateProfile(profileData);
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        updateUser(updatedUser);
        setIsEditingProfile(false);
        
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully',
        });
        
        console.log('✅ Profile updated successfully');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Add/Edit address
  const handleSaveAddress = async () => {
    if (!addressForm.label.trim() || !addressForm.address.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all address fields',
        variant: 'destructive'
      });
      return;
    }

    setIsAddressLoading(true);

    try {
      console.log('🏠 Saving address...');
      
      let response;
      if (editingAddressId) {
        response = await userAPI.updateAddress(editingAddressId, addressForm);
      } else {
        response = await userAPI.addAddress(addressForm);
      }

      if (response.data.success) {
        // Refresh addresses
        const addressResponse = await userAPI.getAddresses();
        setAddresses(addressResponse.data.data || []);
        
        // Reset form
        setAddressForm({ label: '', address: '' });
        setIsAddingAddress(false);
        setEditingAddressId(null);
        
        toast({
          title: editingAddressId ? 'Address Updated' : 'Address Added',
          description: `Your address has been ${editingAddressId ? 'updated' : 'added'} successfully`,
        });
        
        console.log('✅ Address saved successfully');
      }
    } catch (error) {
      console.error('❌ Error saving address:', error);
      toast({
        title: 'Address Error',
        description: 'Failed to save address. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAddressLoading(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    try {
      console.log('🗑️ Deleting address:', addressId);
      
      const response = await userAPI.deleteAddress(addressId);
      
      if (response.data.success) {
        setAddresses(prev => prev.filter(addr => addr._id !== addressId));
        
        toast({
          title: 'Address Deleted',
          description: 'Address has been removed from your account',
        });
        
        console.log('✅ Address deleted successfully');
      }
    } catch (error) {
      console.error('❌ Error deleting address:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete address. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profileImage} />
                  <AvatarFallback className="text-xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <Badge variant={user.role === 'customer' ? 'secondary' : 'default'}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    
                    {user.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    
                    {user.birthday && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(user.birthday).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Addresses
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    View your past orders and track current ones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Button onClick={() => window.location.href = '/menu'}>
                        Browse Menu
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatDate(order.createdAt)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <CreditCard className="h-4 w-4" />
                                    ₹{order.totalAmount}
                                  </div>
                                </div>
                              </div>
                              
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              {order.items.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <img
                                    src={item.menuItem.image || '/placeholder.svg'}
                                    alt={item.menuItem.name}
                                    className="w-10 h-10 rounded object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder.svg';
                                    }}
                                  />
                                  <span className="text-sm">
                                    {item.menuItem.name} × {item.quantity}
                                  </span>
                                </div>
                              ))}
                              
                              {order.items.length > 3 && (
                                <p className="text-sm text-muted-foreground">
                                  +{order.items.length - 3} more items
                                </p>
                              )}
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                {order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)} Order
                              </span>
                              
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                                {order.status === 'delivered' && (
                                  <Button variant="outline" size="sm">
                                    <Heart className="h-4 w-4 mr-1" />
                                    Reorder
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Delivery Addresses</CardTitle>
                      <CardDescription>
                        Manage your delivery addresses
                      </CardDescription>
                    </div>
                    
                    <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingAddressId ? 'Edit Address' : 'Add New Address'}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="label">Address Label</Label>
                            <Input
                              id="label"
                              placeholder="e.g., Home, Office, etc."
                              value={addressForm.label}
                              onChange={(e) => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="address">Full Address</Label>
                            <Textarea
                              id="address"
                              placeholder="Enter complete address with landmark"
                              value={addressForm.address}
                              onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                              rows={4}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveAddress}
                              disabled={isAddressLoading}
                              className="flex-1"
                            >
                              {isAddressLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              {editingAddressId ? 'Update' : 'Save'} Address
                            </Button>
                            
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAddingAddress(false);
                                setEditingAddressId(null);
                                setAddressForm({ label: '', address: '' });
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">No addresses added yet</p>
                      <Button onClick={() => setIsAddingAddress(true)}>
                        Add Your First Address
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {addresses.map((address) => (
                        <Card key={address._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">{address.label}</h4>
                                  {address.isDefault && (
                                    <Badge variant="secondary" className="text-xs">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground">{address.address}</p>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingAddressId(address._id);
                                    setAddressForm({
                                      label: address.label,
                                      address: address.address
                                    });
                                    setIsAddingAddress(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteAddress(address._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="birthday">Birthday</Label>
                      <Input
                        id="birthday"
                        type="date"
                        value={profileData.birthday}
                        onChange={(e) => setProfileData(prev => ({ ...prev, birthday: e.target.value }))}
                        disabled={!isEditingProfile}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isEditingProfile ? (
                      <>
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={isUpdatingProfile}
                        >
                          {isUpdatingProfile ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Save Changes
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileData({
                              name: user?.name || '',
                              phone: user?.phone || '',
                              birthday: user?.birthday || '',
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditingProfile(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
