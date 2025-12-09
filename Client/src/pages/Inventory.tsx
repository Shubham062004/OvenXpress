import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import inventoryAPI, { InventoryItem } from "@/services/inventoryAPI";

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all inventory items
  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryAPI.getAllItems();
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Inventory Management</h1>
        <Button
          onClick={fetchInventory}
          variant="outline"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Error Handling */}
      {error && (
        <div className="text-red-500 text-center mb-4">
          {error}
        </div>
      )}

      {/* Inventory List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item._id} className="shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-800">{item.name}</h2>
                <span className="text-sm text-gray-500 capitalize">{item.category}</span>
              </div>
              <div className="text-sm text-gray-600">
                Quantity: <span className="font-semibold">{item.quantity} {item.unit}</span>
              </div>
              <div className="text-sm text-gray-600">
                Reorder Level: <span className="font-semibold">{item.reorderLevel}</span>
              </div>
              <div className="text-sm text-gray-600">
                Branch ID: <span className="font-semibold">{item.branch}</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Last Updated: {new Date(item.updatedAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && items.length === 0 && !error && (
        <div className="text-center text-gray-500 mt-12">
          No inventory items found.
        </div>
      )}
    </div>
  );
};

export default Inventory;
