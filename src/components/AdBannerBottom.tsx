import React, { useState, useEffect } from 'react';
import { trackAnalyticsEvent } from '../lib/trackAnalyticsEvent';
import { useAuth } from '@/hooks/useAuth';

interface AdBannerBottomProps {
  isPremium?: boolean;
  className?: string;
}

const AD_BANNER_HEIGHT = 60; // px

export function AdBannerBottom({ isPremium = false, className = "" }: AdBannerBottomProps) {
  const { user } = useAuth();
  const [adLoaded, setAdLoaded] = useState(false);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Определяем production среду
    const isProd = import.meta.env.PROD && 
                   window.location.hostname !== 'localhost' && 
                   !window.location.hostname.includes('replit');
    setIsProduction(isProd);
    
    if (isProd && !isPremium) {
      // Загружаем AdSense скрипт только в production
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.VITE_ADMOB_APP_ID}`;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        setAdLoaded(true);
        // Логируем показ баннера
        const userId = user?.uid || 'anonymous';
        trackAnalyticsEvent({ 
          event: 'banner_shown', 
          adType: 'banner', 
          provider: 'admob', 
          userId,
          placement: 'bottom'
        });
      };
      
      script.onerror = () => {
        console.warn('AdSense failed to load');
      };
      
      document.head.appendChild(script);
      
      return () => {
        // Cleanup: удаляем скрипт при размонтировании
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [isPremium, user?.uid]);

  // Не показываем рекламу для премиум пользователей
  if (isPremium) {
    return null;
  }

  return (
    <div 
      className={`fixed left-0 right-0 bottom-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-600/30 ${className}`}
      style={{ height: `${AD_BANNER_HEIGHT}px` }}
    >
      {isProduction && adLoaded ? (
        // Production: настоящая реклама
        <div className="w-full h-full flex items-center justify-center">
          <ins 
            className="adsbygoogle"
            style={{ 
              display: 'block',
              width: '100%',
              height: `${AD_BANNER_HEIGHT}px`,
              maxWidth: '728px'
            }}
            data-ad-client={import.meta.env.VITE_ADMOB_APP_ID}
            data-ad-slot={import.meta.env.VITE_ADMOB_BANNER_ID}
            data-ad-format="auto"
            data-full-width-responsive="true"
            ref={(el) => {
              if (el && !(el as any)._initialized) {
                (el as any)._initialized = true;
                setTimeout(() => {
                  try {
                    if ((window as any).adsbygoogle) {
                      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                    }
                  } catch (error) {
                    console.warn('AdSense initialization error:', error);
                  }
                }, 100);
              }
            }}
          />
        </div>
      ) : (
        // Development/Fallback: макет рекламы
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Advertisement Space</span>
            <div className="px-2 py-1 bg-slate-700/50 rounded text-xs">AdMob Ready</div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
