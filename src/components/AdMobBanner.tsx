/// <reference types="vite/client" />
import { useState, useEffect, useRef } from 'react';
import { trackAnalyticsEvent } from '../lib/trackAnalyticsEvent';
import { useAuth } from '@/hooks/useAuth';

interface AdMobBannerProps {
  onReward?: (amount: number) => void;
  className?: string;
  adType?: 'banner' | 'interstitial' | 'rewarded';
  trigger?: string;
}

declare const importMeta: ImportMeta;

export function AdMobBanner({ onReward, className = "", adType = 'banner', trigger }: AdMobBannerProps) {
  const { user } = useAuth();
  const [adLoaded, setAdLoaded] = useState(false);
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
      const newPremiumStatus = (savedPremiumType === 'lifetime' || savedPremiumType === 'weekly') && !testModeActive;
      console.log('AdMobBanner premium status changed:', newPremiumStatus);
      setIsPremium(newPremiumStatus);
    };
    window.addEventListener('premiumStatusChanged', handlePremiumChange);
    return () => {
      window.removeEventListener('premiumStatusChanged', handlePremiumChange);
    };
  }, []);

  useEffect(() => {
    if (isPremium) return;
    // Только для мобильных bridge/плагинов
    if (typeof window !== 'undefined' && (window as any).admob) {
      (window as any).admob.banner.config({
        id: import.meta.env.VITE_ADMOB_BANNER_ID,
        isTesting: true,
        autoShow: true,
      });
      setAdLoaded(true);
      // Логируем показ баннера во все системы аналитики
      const userId = user?.uid || 'anonymous';
      trackAnalyticsEvent({ event: 'banner_shown', adType: 'banner', provider: 'admob', userId });
    }
  }, [isPremium]);

  const showRewardedAd = async () => {
    if (!adLoaded) return;
    
    try {
      if (typeof window !== 'undefined' && (window as any).admob) {
        const result = await (window as any).admob.rewardvideo.show();
        if (result && onReward) {
          onReward(1);
        }
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
    }
  };

  const showInterstitialAd = async () => {
    if (!adLoaded) return;
    
    try {
      if (typeof window !== 'undefined' && (window as any).admob) {
        await (window as any).admob.interstitial.show();
      }
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
    }
  };

  if (isPremium) {
    return null;
  }

  if (!adLoaded) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[20] transition-opacity duration-300">
      {adType === 'banner' && (
        <div ref={bannerRef} className={`w-full h-[60px] fixed left-0 bottom-0 m-0 p-0 z-[20] bg-transparent ${className}`}></div>
      )}

      {adType === 'rewarded' && (
        <button 
          className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${className}`}
          onClick={showRewardedAd}
        >
          Watch Ad for Reward
        </button>
      )}

      {adType === 'interstitial' && (
        <button 
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${className}`}
          onClick={showInterstitialAd}
        >
          Show Interstitial
        </button>
      )}
    </div>
  );
}