import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";

/**
 * Компонент для отображения реального Google AdMob баннера
 */
export default function MobileBanner() {
  const [isPremium, setIsPremium] = useState(() => {
    const savedPremiumType = localStorage.getItem('premium-type');
    const testModeActive = localStorage.getItem('premium-test-mode') === 'enabled';
    return (savedPremiumType === 'lifetime' || savedPremiumType === 'weekly') && !testModeActive;
  });

  // Listen for premium status changes
  useEffect(() => {
    const handlePremiumChange = () => {
      const savedPremiumType = localStorage.getItem('premium-type');
      const testModeActive = localStorage.getItem('premium-test-mode') === 'enabled';
      setIsPremium((savedPremiumType === 'lifetime' || savedPremiumType === 'weekly') && !testModeActive);
    };

    window.addEventListener('premiumStatusChanged', handlePremiumChange);
    
    return () => {
      window.removeEventListener('premiumStatusChanged', handlePremiumChange);
    };
  }, []);
  
  // Hide ads for premium users
  if (isPremium) {
    return null;
  }

  // Показываем единообразный баннер на всех устройствах
  return (
    <div
      className="h-[60px] w-full fixed bottom-0 left-0 z-50 bg-gradient-to-r from-purple-900 to-indigo-900 border-t border-purple-400/30"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        paddingLeft: 'env(safe-area-inset-left, 0)',
        paddingRight: 'env(safe-area-inset-right, 0)'
      }}
    >
      <div className="flex items-center justify-center h-full text-white text-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-medium">Advertisement Space</span>
          <div className="px-2 py-1 bg-white/10 rounded text-xs">AdSense</div>
        </div>
      </div>
    </div>
  );
}