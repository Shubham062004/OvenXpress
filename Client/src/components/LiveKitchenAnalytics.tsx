import { TrendingUp, Star, Users, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const LiveKitchenAnalytics = () => {
  const analyticsData = {
    todayOrders: 247,
    topSellers: [
      'Margherita Pizza',
      'Pasta Carbonara', 
      'Grilled Salmon',
      'Caesar Salad',
      'Tiramisu'
    ],
    reviews: [
      { rating: 5, comment: "Best pizza in town!", customer: "Raj K." },
      { rating: 5, comment: "Amazing carbonara!", customer: "Priya S." },
      { rating: 4, comment: "Great service", customer: "Amit P." }
    ],
    happyCustomers: 1284
  };

  return (
    <section className="py-16 bg-creamy-beige">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-rich-brown mb-4">
            Live Kitchen Analytics
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time insights from our kitchen to your table
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Orders */}
          <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-warm transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-warm-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-6 w-6 text-warm-orange" />
              </div>
              <h3 className="text-2xl font-bold text-rich-brown mb-2">{analyticsData.todayOrders}</h3>
              <p className="text-muted-foreground text-sm">Today's Orders</p>
              <div className="flex items-center justify-center mt-2 text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-xs">+12% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Bestsellers */}
          <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-warm transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-deep-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-deep-red" />
              </div>
              <h3 className="text-lg font-bold text-rich-brown mb-3 text-center">Top 5 Bestsellers</h3>
              <ul className="space-y-2">
                {analyticsData.topSellers.map((item, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="w-5 h-5 bg-warm-orange text-white rounded-full flex items-center justify-center text-xs mr-2">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground truncate">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Live Reviews */}
          <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-warm transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-warm-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-warm-orange" />
              </div>
              <h3 className="text-lg font-bold text-rich-brown mb-3 text-center">Live Reviews</h3>
              <div className="space-y-3">
                {analyticsData.reviews.slice(0, 2).map((review, index) => (
                  <div key={index} className="bg-white/50 rounded-lg p-2">
                    <div className="flex items-center mb-1">
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-warm-orange text-warm-orange" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">{review.customer}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Happy Customers */}
          <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-warm transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-deep-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-deep-red" />
              </div>
              <h3 className="text-2xl font-bold text-rich-brown mb-2">{analyticsData.happyCustomers.toLocaleString()}</h3>
              <p className="text-muted-foreground text-sm">Happy Customers</p>
              <div className="flex items-center justify-center mt-2 text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-xs">+8% this month</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LiveKitchenAnalytics;