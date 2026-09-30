import HeroCarousel from '@/components/HeroCarousel';
import DailyOffers from '@/components/DailyOffers';
import MenuSection from '@/components/MenuSection';
import ProblemSolver from '@/components/ProblemSolver';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroCarousel />
      <DailyOffers />
      <MenuSection />
      <ProblemSolver />
      <Footer />
    </div>
  );
};

export default Index;
