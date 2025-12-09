import api from './api';

export interface BranchInventoryItem {
  _id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  lastUpdated: Date;
  minimumStock: number;
  pricePerUnit: number;
}

export interface BranchStaff {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  role: string;
  branch: number;
  salary: number;
  joinDate: Date;
  performance: {
    dailyPoints: number;
    weeklyPoints: number;
    monthlyPoints: number;
    customerRating: number;
    ordersHandled: number;
  };
  attendance: {
    date: Date;
    checkInTime: Date;
    checkOutTime?: Date;
    hoursWorked: number;
    selfieUrl: string;
  }[];
}

export interface BranchOrder {
  _id: string;
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
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  branch: number;
  customer?: {
    _id: string;
    name: string;
    phone: string;
  };
  isOffline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialRequest {
  itemId: string;
  quantity: number;
}

export const branchAPI = {
  // Get branch orders with optional filters
  getBranchOrders: (branchId: number, filters?: { date?: string; status?: string }) => 
    api.get(`/branches/${branchId}/orders`, { params: filters }),
  
  // Get staff assigned to a branch
  getBranchStaff: (branchId: number) => 
    api.get(`/branches/${branchId}/staff`),
  
  // Get inventory items assigned to a branch
  getBranchInventory: (branchId: number) => 
    api.get(`/branches/${branchId}/inventory`),
  
  // Create an offline order at a branch (manager only)
  createOfflineOrder: (branchId: number, orderData: { 
    items: { menuItemId: string; quantity: number; price: number }[];
    total: number;
    paymentMethod: 'cash' | 'card' | 'upi';
  }) => api.post(`/branches/${branchId}/orders/offline`, orderData),
  
  // Create end-of-day material requests (manager only)
  createMaterialRequests: (branchId: number, requests: MaterialRequest[]) => 
    api.post(`/branches/${branchId}/requests`, { requests })
};

export default branchAPI;