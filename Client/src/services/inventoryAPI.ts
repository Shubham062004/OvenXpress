// src/services/inventoryAPI.ts
import api from './api';

export interface InventoryItem {
  _id: string;
  name: string;
  quantity: number;
  category: string;
  unit: string;
  reorderLevel: number;
  branch: number;
  updatedAt: string;
}

export const inventoryAPI = {
  // Get all inventory items
  getAllItems: () => api.get<InventoryItem[]>('/inventory'),

  // Get specific inventory item
  getItemById: (id: string) => api.get<InventoryItem>(`/inventory/${id}`),

  // Create new inventory item
  createItem: (itemData: Partial<InventoryItem>) => api.post('/inventory', itemData),

  // Update inventory item
  updateItem: (id: string, itemData: Partial<InventoryItem>) =>
    api.put(`/inventory/${id}`, itemData),

  // Delete inventory item
  deleteItem: (id: string) => api.delete(`/inventory/${id}`),

  // Receive stock
  receiveStock: (id: string, quantity: number, notes?: string) =>
    api.put(`/inventory/${id}/receive`, { quantity, notes }),

  // Distribute stock
  distributeStock: (id: string, branchId: number, quantity: number) =>
    api.put(`/inventory/${id}/distribute`, { branchId, quantity }),

  // Get inventory stats
  getStats: () => api.get('/inventory/stats'),

  // Get branch inventory
  getBranchInventory: (branchId: number) =>
    api.get<InventoryItem[]>(`/inventory/branch/${branchId}`)
};

// ✅ Export default for easier import
export default inventoryAPI;
