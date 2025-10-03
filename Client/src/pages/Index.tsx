import HeroCarousel from '@/components/HeroCarousel';
import DailyOffers from '@/components/DailyOffers';
import MenuSection from '@/components/MenuSection';
import ProblemSolver from '@/components/ProblemSolver';
import LiveKitchenAnalytics from '@/components/LiveKitchenAnalytics';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroCarousel />
      <DailyOffers />
      <LiveKitchenAnalytics />
      <MenuSection />
      <ProblemSolver />
      <Footer />
    </div>
  );
};

export default Index;
