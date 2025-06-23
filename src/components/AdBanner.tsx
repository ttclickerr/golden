import { useEffect, useState } from "react";
import { adMobService } from "../services/admob-universal";
import { trackAllAnalytics, AnalyticsEvents } from '../lib/analytics-universal';
import { trackAnalyticsEvent } from '../lib/trackAnalyticsEvent';

interface AdBannerProps {
  onClose?: () => void;
  className?: string;
}

export function AdBanner({ onClose, className = "" }: AdBannerProps) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [isPremium, setIsPremium] = useState(() => {
    const savedPremiumType = localStorage.getItem('premium-type');
    const testModeActive = localStorage.getItem('premium-test-mode') === 'enabled';
    return (savedPremiumType === 'lifetime' || savedPremiumType === 'weekly') && !testModeActive;
  });

  useEffect(() => {
    const initAdSense = async () => {
      // Load AdSense script for web
      if (!document.querySelector('script[src*="adsbygoogle"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.VITE_ADMOB_APP_ID}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        
        script.onload = () => {
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          setAdLoaded(true);
          trackAnalyticsEvent({ event: 'banner_shown', adType: 'banner', provider: 'admob', userId: localStorage.getItem('user_id') || 'anonymous' });
        };
        script.onerror = () => {
          trackAnalyticsEvent({ event: 'ad_failed', adType: 'banner', provider: 'admob', userId: localStorage.getItem('user_id') || 'anonymous' });
        };
      } else {
        setAdLoaded(true);
        trackAnalyticsEvent({ event: 'banner_shown', adType: 'banner', provider: 'admob', userId: localStorage.getItem('user_id') || 'anonymous' });
      }
    };

    initAdSense();
  }, []);

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

  if (!adLoaded) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[9999] ${className}`}>
      <div id="admob-banner-production" className="w-full h-[60px] bg-white border-t border-gray-200 relative overflow-hidden">
        <ins 
          className="adsbygoogle"
          style={{ 
            display: 'block',
            width: '100%',
            height: '50px'
          }}
          data-ad-client={import.meta.env.VITE_ADMOB_APP_ID}
          data-ad-slot={import.meta.env.VITE_ADMOB_BANNER_ID}
          data-ad-format="auto"
          data-full-width-responsive="true"
          ref={(el) => {
            if (el && adLoaded && !(el as any)._initialized) {
              (el as any)._initialized = true;
              setTimeout(() => {
                try {
                  if ((window as any).adsbygoogle) {
                    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                    // Аналитика клика по баннеру
                    el.addEventListener('click', () => {
                      trackAllAnalytics({ name: AnalyticsEvents.AD_CLICKED, params: { type: 'banner', placement: 'bottom' } });
                    }, { once: true });
                  }
                } catch (error) {
                  console.error('AdMob initialization error:', error);
                  trackAllAnalytics({ name: AnalyticsEvents.AD_FAILED, params: { type: 'banner', placement: 'bottom', error: error instanceof Error ? error.message : String(error) } });
                }
              }, 100);
            }
          }}
        />
      </div>
    </div>
  );
}