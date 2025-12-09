import { useState } from "react";
import { 
  Home, 
  Users, 
  UserCog, 
  Package, 
  UtensilsCrossed, 
  Tag,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Section = "home" | "managers" | "staff" | "inventory" | "menu" | "offers";

const COLORS = ['#ee7c2b', '#8a2828', '#d4a574', '#c45a3c'];

export default function Founderr() {
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock data - in real app, this would come from backend/localStorage
  const todayOrders = {
    total: 291,
    branch1: 50,
    branch2: 100,
    branch3: 51,
    branch4: 90
  };

  const todaySales = 152150;

  const salesData = [
    { name: 'Mon', sales: 12000 },
    { name: 'Tue', sales: 19000 },
    { name: 'Wed', sales: 15000 },
    { name: 'Thu', sales: 22000 },
    { name: 'Fri', sales: 28000 },
    { name: 'Sat', sales: 35000 },
    { name: 'Sun', sales: 21150 }
  ];

  const branchSalesData = [
    { name: 'Branch 1', value: 35000 },
    { name: 'Branch 2', value: 50000 },
    { name: 'Branch 3', value: 32000 },
    { name: 'Branch 4', value: 35150 }
  ];

  const managers = [
    { id: 1, name: "Rajesh Kumar", branch: "Branch 1", contact: "+91 98765 43210", performance: "Excellent" },
    { id: 2, name: "Priya Sharma", branch: "Branch 2", contact: "+91 98765 43211", performance: "Good" },
    { id: 3, name: "Amit Patel", branch: "Branch 3", contact: "+91 98765 43212", performance: "Excellent" },
    { id: 4, name: "Sneha Reddy", branch: "Branch 4", contact: "+91 98765 43213", performance: "Good" }
  ];

  const staffList = [
    { id: 760, name: "Arjun Singh", branch: "Branch 1", role: "Chef", points: 450, leaves: 2, salary: 32500, paid: false },
    { id: 761, name: "Meera Das", branch: "Branch 2", role: "Waiter", points: 380, leaves: 1, salary: 28000, paid: true },
    { id: 762, name: "Vikram Nair", branch: "Branch 3", role: "Chef", points: 420, leaves: 3, salary: 31500, paid: false },
    { id: 763, name: "Anjali Verma", branch: "Branch 4", role: "Cashier", points: 400, leaves: 0, salary: 30000, paid: true },
    { id: 764, name: "Rohit Joshi", branch: "Branch 1", role: "Delivery", points: 360, leaves: 1, salary: 27000, paid: false }
  ];

  const inventory = [
    { id: 1, item: "Onion", quantity: 150, unit: "kg", price: 30, total: 4500, updated: "2024-01-20" },
    { id: 2, item: "Tomato", quantity: 100, unit: "kg", price: 40, total: 4000, updated: "2024-01-20" },
    { id: 3, item: "Vegetables", quantity: 200, unit: "kg", price: 50, total: 10000, updated: "2024-01-20" },
    { id: 4, item: "Fruits", quantity: 80, unit: "kg", price: 60, total: 4800, updated: "2024-01-20" },
    { id: 5, item: "Spices", quantity: 50, unit: "kg", price: 200, total: 10000, updated: "2024-01-20" },
    { id: 6, item: "Grains", quantity: 300, unit: "kg", price: 45, total: 13500, updated: "2024-01-20" }
  ];

  const menuItems = [
    { id: 1, name: "Margherita Pizza", category: "Pizza", price: 299, cost: 120, profit: 179, available: true },
    { id: 2, name: "Pasta Carbonara", category: "Pasta", price: 249, cost: 100, profit: 149, available: true },
    { id: 3, name: "Grilled Salmon", category: "Main Course", price: 599, cost: 280, profit: 319, available: true },
    { id: 4, name: "Tiramisu", category: "Dessert", price: 199, cost: 80, profit: 119, available: true },
    { id: 5, name: "Caesar Salad", category: "Salad", price: 179, cost: 70, profit: 109, available: true }
  ];

  const offers = [
    { id: 1, title: "Weekend Special", discount: "20% OFF", type: "Festive", active: true, duration: "2 days", usage: 45 },
    { id: 2, title: "FIRST50", discount: "₹50 OFF", type: "Coupon", active: true, duration: "7 days", usage: 120 },
    { id: 3, title: "Family Pack", discount: "25% OFF", type: "Weekly", active: false, duration: "Expired", usage: 89 },
    { id: 4, title: "Today's Special", discount: "15% OFF", type: "Daily", active: true, duration: "Today", usage: 34 }
  ];

  const renderHome = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Total Orders */}
      <Card className="bg-gradient-warm text-white shadow-warm">
        <CardHeader>
          <CardTitle className="text-4xl font-bold flex items-center gap-3">
            <TrendingUp className="h-10 w-10" />
            Total Orders Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-6xl font-bold mb-4">{todayOrders.total}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm sm:text-lg">
            <div>Branch 1: <span className="font-bold">{todayOrders.branch1}</span></div>
            <div>Branch 2: <span className="font-bold">{todayOrders.branch2}</span></div>
            <div>Branch 3: <span className="font-bold">{todayOrders.branch3}</span></div>
            <div>Branch 4: <span className="font-bold">{todayOrders.branch4}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Sales */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <DollarSign className="h-6 w-6 text-warm-orange" />
            Today's Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-warm-orange mb-6">₹{todaySales.toLocaleString()}</div>
          
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Sales Trend */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#ee7c2b" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Branch-wise Sales */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Branch-wise Sales</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={branchSalesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ₹${entry.value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {branchSalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scrolling Tip */}
      <Card className="bg-accent text-accent-foreground shadow-soft overflow-hidden">
        <CardContent className="py-4">
          <div className="animate-[scroll_20s_linear_infinite] whitespace-nowrap">
            💡 Tip: Maintain consistent quality across all branches • Monitor peak hours for better staffing • Update seasonal menu regularly • Keep inventory levels optimal
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderManagers = () => (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-6 w-6 text-warm-orange" />
            Branch Managers
          </CardTitle>
          <Button className="bg-gradient-warm hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Add Manager
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manager ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell className="font-medium">{manager.id}</TableCell>
                  <TableCell>{manager.name}</TableCell>
                  <TableCell>{manager.branch}</TableCell>
                  <TableCell>{manager.contact}</TableCell>
                  <TableCell>
                    <Badge variant={manager.performance === "Excellent" ? "default" : "secondary"}>
                      {manager.performance}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manager Details - {manager.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Name</Label>
                              <Input defaultValue={manager.name} />
                            </div>
                            <div>
                              <Label>Branch</Label>
                              <Input defaultValue={manager.branch} />
                            </div>
                            <div>
                              <Label>Contact</Label>
                              <Input defaultValue={manager.contact} />
                            </div>
                            <Button className="bg-gradient-warm w-full">Save Changes</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-warm-orange" />
            All Staff Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {staffList.map((staff) => (
              <Card key={staff.id} className="shadow-soft hover:shadow-warm transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{staff.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {staff.id}</p>
                      <p className="text-sm text-muted-foreground">{staff.branch} • {staff.role}</p>
                    </div>
                    <Badge variant={staff.paid ? "default" : "destructive"}>
                      {staff.paid ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span>Points:</span>
                      <span className="font-bold text-warm-orange">{staff.points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Leaves:</span>
                      <span className="font-bold">{staff.leaves}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salary:</span>
                      <span className="font-bold text-lg">₹{staff.salary.toLocaleString()}</span>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-warm">View Details</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{staff.name} - Full Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Personal Info</Label>
                            <p className="text-sm text-muted-foreground mt-2">
                              Branch: {staff.branch}<br />
                              Role: {staff.role}<br />
                              ID: {staff.id}
                            </p>
                          </div>
                          <div>
                            <Label>Performance</Label>
                            <p className="text-sm text-muted-foreground mt-2">
                              Points: {staff.points}<br />
                              Leaves: {staff.leaves}<br />
                              Salary: ₹{staff.salary.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label>Payment Method</Label>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline">Cash</Button>
                            <Button size="sm" variant="outline">QR</Button>
                            <Button size="sm" variant="outline">Bank</Button>
                            <Button size="sm" variant="outline">Online</Button>
                          </div>
                        </div>
                        <Button className="w-full bg-gradient-warm">
                          Mark as Paid
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6 text-warm-orange" />
            Raw Materials Inventory
          </CardTitle>
          <Button className="bg-gradient-warm hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price (₹)</TableHead>
                <TableHead>Total Value (₹)</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>₹{item.price}</TableCell>
                  <TableCell className="font-bold">₹{item.total.toLocaleString()}</TableCell>
                  <TableCell>{item.updated}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Card className="mt-6 bg-accent text-accent-foreground">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Material Cost:</span>
                <span className="text-2xl font-bold">
                  ₹{inventory.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold">Profit (Sales - Cost):</span>
                <span className="text-2xl font-bold text-warm-orange">
                  ₹{(todaySales - inventory.reduce((sum, item) => sum + item.total, 0)).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );

  const renderMenu = () => (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-warm-orange" />
            Menu Management
          </CardTitle>
          <Button className="bg-gradient-warm hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dish Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Cost (₹)</TableHead>
                <TableHead>Profit (₹)</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>₹{item.price}</TableCell>
                  <TableCell>₹{item.cost}</TableCell>
                  <TableCell className="font-bold text-warm-orange">₹{item.profit}</TableCell>
                  <TableCell>
                    {item.available ? (
                      <Badge variant="default">Available</Badge>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderOffers = () => (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-warm-orange" />
            Offers & Discounts Management
          </CardTitle>
          <Button className="bg-gradient-warm hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <Card key={offer.id} className={`shadow-soft ${offer.active ? 'border-warm-orange border-2' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{offer.title}</h3>
                      <p className="text-2xl font-bold text-warm-orange mt-1">{offer.discount}</p>
                      <Badge className="mt-2" variant="outline">{offer.type}</Badge>
                    </div>
                    {offer.active ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-bold">{offer.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Usage Count:</span>
                      <span className="font-bold">{offer.usage}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {offer.active ? (
                      <Button size="sm" variant="destructive" className="flex-1">
                        <XCircle className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const sidebarItems = [
    { id: "home" as Section, label: "Home", icon: Home },
    { id: "managers" as Section, label: "Managers", icon: UserCog },
    { id: "staff" as Section, label: "Staff", icon: Users },
    { id: "inventory" as Section, label: "Inventory", icon: Package },
    { id: "menu" as Section, label: "Menu", icon: UtensilsCrossed },
    { id: "offers" as Section, label: "Offers", icon: Tag }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-lg"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64 bg-card border-r border-border fixed h-full overflow-y-auto transition-transform duration-300 z-40`}>
        <div className="p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-warm bg-clip-text text-transparent mb-2">
            Oven Express
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Owner Dashboard</p>
        </div>
        
        <nav className="px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base ${
                activeSection === item.id
                  ? 'bg-gradient-warm text-white shadow-warm'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 p-4 sm:p-6 lg:p-8 w-full">
        <div className="max-w-7xl mx-auto">
          {activeSection === "home" && renderHome()}
          {activeSection === "managers" && renderManagers()}
          {activeSection === "staff" && renderStaff()}
          {activeSection === "inventory" && renderInventory()}
          {activeSection === "menu" && renderMenu()}
          {activeSection === "offers" && renderOffers()}
        </div>
      </main>
    </div>
  );
}