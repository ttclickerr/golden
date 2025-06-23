/// <reference types="vite/client" />
import { useState, useEffect, useRef } from 'react';
import { trackAnalyticsEvent } from '../lib/trackAnalyticsEvent';

interface AdMobBannerProps {
  onReward?: (amount: number) => void;
  className?: string;
  adType?: 'banner' | 'interstitial' | 'rewarded';
  trigger?: string;
}

declare const importMeta: ImportMeta;

export function AdMobBanner({ onReward, className = "", adType = 'banner', trigger }: AdMobBannerProps) {
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
      setIsPremium((savedPremiumType === 'lifetime' || savedPremiumType === 'weekly') && !testModeActive);
    };
    window.addEventListener('premiumStatusChanged', handlePremiumChange);
    return () => {
      window.removeEventListener('premiumStatusChanged', handlePremiumChange);
    };
  }, []);

  useEffect(() => {
    if (isPremium) return;
    // Для мобильных bridge
    if (typeof window !== 'undefined' && (window as any).admob) {
      (window as any).admob.banner.config({
        id: import.meta.env.VITE_ADMOB_BANNER_ID,
        isTesting: true,
        autoShow: true,
      });
      setAdLoaded(true);
      // Логируем показ баннера во все системы аналитики
      const userId = localStorage.getItem('user_id') || 'anonymous';
      trackAnalyticsEvent({ event: 'banner_shown', adType: 'banner', provider: 'admob', userId });
      return;
    }
    // Для web: AdSense fallback
    if (bannerRef.current) {
      // Удаляем все margin/padding у body и html (глобально, чтобы убрать отступы сверху)
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
      // Вставляем скрипт adsbygoogle, если его нет
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.VITE_ADMOB_APP_ID}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }
      // Вставляем баннер
      bannerRef.current.innerHTML = `<ins class="adsbygoogle" style="display:block;width:100vw;max-width:100vw;height:60px;margin:0;padding:0;position:fixed;left:0;bottom:0;z-index:9999;background:transparent" data-ad-client="${import.meta.env.VITE_ADMOB_APP_ID}" data-ad-slot="${import.meta.env.VITE_ADMOB_BANNER_ID}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      setTimeout(() => {
        try {
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          (window as any).adsbygoogle.push({});
        } catch {}
      }, 100);
      setAdLoaded(true);
      // Логируем показ баннера во все системы аналитики
      const userId = localStorage.getItem('user_id') || 'anonymous';
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

  if (adType === 'banner') {
    return (
      <div ref={bannerRef} className={`w-full h-[60px] fixed left-0 bottom-0 m-0 p-0 z-[9999] bg-transparent ${className}`}></div>
    );
  }

  if (adType === 'rewarded') {
    return (
      <button 
        className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${className}`}
        onClick={showRewardedAd}
      >
        Watch Ad for Reward
      </button>
    );
  }

  if (adType === 'interstitial') {
    return (
      <button 
        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${className}`}
        onClick={showInterstitialAd}
      >
        Show Interstitial
      </button>
    );
  }

  return null;
}