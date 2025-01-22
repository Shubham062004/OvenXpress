import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const AdminDashboard = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "" });
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu-items');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      if (response.ok) {
        fetchMenuItems();
        setNewItem({ name: "", price: "", category: "" });
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory }),
      });
      if (response.ok) {
        fetchCategories();
        setNewCategory("");
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Menu Items</h2>
            <form onSubmit={handleAddItem} className="mb-4">
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                className="w-full p-2 mb-2 border rounded"
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full p-2 mb-2 border rounded"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="w-full bg-orange-500 text-white px-4 py-2 rounded">
                Add Item
              </button>
            </form>
            <ul>
              {menuItems.map((item) => (
                <li key={item._id} className="flex justify-between items-center mb-2">
                  <span>{item.name} - ₹{item.price}</span>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Categories</h2>
            <form onSubmit={handleAddCategory} className="mb-4">
              <input
                type="text"
                placeholder="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
              />
              <button type="submit" className="w-full bg-orange-500 text-white px-4 py-2 rounded">
                Add Category
              </button>
            </form>
            <ul>
              {categories.map((category) => (
                <li key={category._id} className="flex justify-between items-center mb-2">
                  <span>{category.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
