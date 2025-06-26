import { useState } from 'react';
import { adMobService } from '../services/admob-universal';
import { trackAnalyticsEvent } from '../lib/trackAnalyticsEvent';
import { useAuth } from '@/hooks/useAuth';

interface InterstitialAdProps {
  onAdClosed: () => void;
  onAdFailed?: (error: string) => void;
  trigger?: 'manual' | 'auto';
}

export function InterstitialAd({ onAdClosed, onAdFailed, trigger = 'manual' }: InterstitialAdProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const showInterstitial = async () => {
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      const success = await adMobService.showInterstitial();
      
      // Логируем показ interstitial рекламы
      const userId = user?.uid || 'anonymous';
      await trackAnalyticsEvent({ event: 'interstitial_shown', adType: 'interstitial', provider: 'admob', userId });
      
      if (!success) {
        onAdFailed?.('Не удалось загрузить рекламу');
        await trackAnalyticsEvent({ event: 'error', adType: 'interstitial', provider: 'admob', userId });
      }
      
      onAdClosed();
    } catch (error) {
      console.error('Interstitial ad error:', error);
      onAdFailed?.('Ошибка при показе рекламы');
      const userId = user?.uid || 'anonymous';
      await trackAnalyticsEvent({ event: 'error', adType: 'interstitial', provider: 'admob', userId });
    } finally {
      setIsLoading(false);
    }
  };

  if (trigger === 'auto') {
    // Автоматический показ при монтировании компонента
    setTimeout(showInterstitial, 1000);
    return null;
  }

  return (
    <button
      onClick={showInterstitial}
      disabled={isLoading}
      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded transition-all duration-300 flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Загрузка...
        </>
      ) : (
        <>
          <span>📺</span>
          Показать рекламу
        </>
      )}
    </button>
  );
}