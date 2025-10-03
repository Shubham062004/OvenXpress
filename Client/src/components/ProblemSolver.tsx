import { Truck, Clock, Heart, Users, Shield, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ProblemSolver = () => {
  const solutions = [
    {
      icon: Truck,
      title: "Lightning Fast Delivery",
      description: "Get your favorite meals delivered hot and fresh in under 30 minutes, guaranteed.",
      color: "text-warm-orange",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Craving late-night snacks? We're always open to satisfy your hunger, any time of day.",
      color: "text-deep-red",
    },
    {
      icon: Heart,
      title: "Personalized Experience",
      description: "AI-powered recommendations based on your preferences and dietary requirements.",
      color: "text-warm-orange",
    },
    {
      icon: Users,
      title: "Group Orders Made Easy",
      description: "Organizing office lunch or family dinner? Our group ordering system handles it all.",
      color: "text-deep-red",
    },
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description: "Not satisfied? 100% money-back guarantee on every order. Your happiness is our priority.",
      color: "text-warm-orange",
    },
    {
      icon: Zap,
      title: "Smart Meal Planning",
      description: "Weekly meal subscriptions with nutritional tracking and automatic reordering.",
      color: "text-deep-red",
    },
  ];

  return (
    <section id="about" className="py-16 bg-soft-tan">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-rich-brown mb-4">
            Why Choose Oven Express?
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            We solve the everyday challenges of food ordering and delivery, making your dining experience effortless and enjoyable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const IconComponent = solution.icon;
            return (
              <Card
                key={index}
                className="group border-0 bg-white/50 backdrop-blur-sm hover:bg-white shadow-soft hover:shadow-warm transition-all duration-300 hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-warm mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-rich-brown mb-4 group-hover:text-warm-orange transition-colors duration-200">
                    {solution.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {solution.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12 animate-fade-in-up">
          <div className="bg-gradient-warm p-8 rounded-3xl text-white max-w-4xl mx-auto shadow-floating">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Experience the Difference?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of satisfied customers who have made Oven Express their go-to choice for delicious, reliable food delivery.
            </p>
            <button className="bg-white text-rich-brown font-semibold px-8 py-3 rounded-full text-lg hover:bg-creamy-beige transition-colors duration-200 shadow-soft">
              Start Your Order
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolver;