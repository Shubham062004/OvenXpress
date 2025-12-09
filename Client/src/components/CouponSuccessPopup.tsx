import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CouponSuccessPopupProps {
  show: boolean;
  couponCode: string;
  onClose: () => void;
}

const CouponSuccessPopup: React.FC<CouponSuccessPopupProps> = ({ show, couponCode, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9998] flex items-center justify-center transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div 
        className={`bg-card rounded-3xl shadow-2xl p-8 max-w-md mx-4 transform transition-all duration-300 ${
          visible ? 'scale-100 rotate-0' : 'scale-50 rotate-12'
        }`}
      >
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="w-20 h-20 text-green-500 animate-bounce" />
          </div>
          <div className="text-6xl mb-4 animate-pulse">
            🥳 🎉 🎊
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Woohoo! 
          </h2>
          <p className="text-xl text-muted-foreground mb-4">
            Coupon <span className="font-bold text-warm-orange">{couponCode}</span> Applied!
          </p>
          <p className="text-lg text-green-600 font-semibold">
            You're saving money! 💰
          </p>
        </div>
      </div>
    </div>
  );
};

export default CouponSuccessPopup;
