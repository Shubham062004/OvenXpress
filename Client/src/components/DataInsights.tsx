import { TrendingUp, Users, Clock, Star } from 'lucide-react';

const DataInsights = () => {
  const chartData = [
    { name: 'Margherita Pizza', orders: 45, revenue: 1350 },
    { name: 'Pasta Carbonara', orders: 32, revenue: 1280 },
    { name: 'Grilled Salmon', orders: 28, revenue: 1680 },
    { name: 'Caesar Salad', orders: 25, revenue: 750 },
    { name: 'Tiramisu', orders: 40, revenue: 800 },
  ];

  return (
    <section className="py-16 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Live Kitchen <span className="text-warm-orange">Analytics</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time insights from our kitchen to ensure the best dining experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Today's Orders */}
          <div className="bg-card rounded-2xl p-6 shadow-soft animate-slide-in-left">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warm-orange/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-warm-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">Live Count</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">147</h3>
            <p className="text-sm text-muted-foreground">Today's Orders</p>
            <div className="mt-2 text-sm text-green-600">+12% from yesterday</div>
          </div>

          {/* Top Bestsellers */}
          <div className="bg-card rounded-2xl p-6 shadow-soft animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-deep-red/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-deep-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">Top 5</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Bestsellers</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">1. Margherita Pizza</span>
                <span className="font-semibold">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">2. Tiramisu</span>
                <span className="font-semibold">40</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">3. Pasta Carbonara</span>
                <span className="font-semibold">32</span>
              </div>
            </div>
          </div>

          {/* Best Reviews */}
          <div className="bg-card rounded-2xl p-6 shadow-soft animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">4.9⭐</h3>
            <p className="text-sm text-muted-foreground">Today's Reviews</p>
            <div className="mt-2 text-xs text-green-600">"Amazing food quality!"</div>
          </div>

          {/* Happy Customers */}
          <div className="bg-card rounded-2xl p-6 shadow-soft animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">Today</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">1,234</h3>
            <p className="text-sm text-muted-foreground">Happy Customers</p>
            <div className="mt-2 text-sm text-yellow-600">+18% satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataInsights;