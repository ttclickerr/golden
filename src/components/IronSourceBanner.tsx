/// <reference types="vite/client" />
import { useEffect, useRef, useState } from 'react';

interface IronSourceBannerProps {
  className?: string;
}

export function IronSourceBanner({ className = "" }: IronSourceBannerProps) {
  const [isPremium, setIsPremium] = useState(() => {
    const savedPremiumType = localStorage.getItem('premium-type');
    const testModeActive = localStorage.getItem('premium-test-mode') === 'enabled';
    return (savedPremiumType === 'lifetime' || savedPremiumType === 'weekly') && !testModeActive;
  });
  const bannerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isPremium) return;
    // Инициализация IronSource SDK для web/mobile
    // Для web: вставка iframe или вызов window.IronSourceSDK (если интегрирован)
    // Для mobile: используйте bridge/capacitor/cordova
    if (typeof window !== 'undefined' && (window as any).IronSourceSDK && bannerRef.current) {
      (window as any).IronSourceSDK.showBanner({
        appKey: import.meta.env.VITE_IRONSOURCE_APP_KEY,
        placementId: import.meta.env.VITE_IRONSOURCE_BANNER_ID,
        container: bannerRef.current
      });
    } else if (bannerRef.current) {
      // Web fallback: показать iframe-заглушку
      bannerRef.current.innerHTML = `<iframe src="https://demo-ironsource.com/banner?placement=${import.meta.env.VITE_IRONSOURCE_BANNER_ID}" style="width:100%;height:60px;border:none;"></iframe>`;
    }
  }, [isPremium]);

  if (isPremium) {
    return null;
  }

  return (
    <div ref={bannerRef} className={`w-full h-[60px] ${className}`}></div>
  );
}
