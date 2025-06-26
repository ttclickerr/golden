import { useState, useEffect } from 'react';
import { adMobService } from '../services/admob-universal';

interface RewardedAdProps {
  onRewardEarned: (reward: { type: string; amount: number }) => void;
  onAdClosed: () => void;
  onAdFailed?: (error: string) => void;
}

export function RewardedAd({ onRewardEarned, onAdClosed, onAdFailed }: RewardedAdProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [adReady, setAdReady] = useState(false);

  useEffect(() => {
    // Инициализация AdMob rewarded рекламы
    const initializeRewardedAd = () => {
      const rewardedAdId = import.meta.env.VITE_ADMOB_REWARDED_ID;
      
      if (!rewardedAdId) {
        console.log('AdMob rewarded ad ID not found');
        return;
      }

      setAdReady(true);
    };

    initializeRewardedAd();
  }, []);

  const showRewardedAd = async () => {
    if (!adReady) {
      onAdFailed?.('Ad not ready');
      return;
    }

    setIsLoading(true);

    try {
      const result = await adMobService.showRewarded();
      
      if (result.success && result.reward) {
        onRewardEarned(result.reward);
      } else {
        onAdFailed?.('Не удалось загрузить рекламу');
      }
      
      onAdClosed();
    } catch (error) {
      console.error('Rewarded ad error:', error);
      onAdFailed?.(error instanceof Error ? error.message : 'Ошибка при показе рекламы');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={showRewardedAd}
      disabled={!adReady || isLoading}
      className="w-full px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded text-xs transition-all duration-300 flex items-center justify-center gap-1"
    >
      {isLoading ? (
        <>
          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ...
        </>
      ) : (
        <>
          <span className="text-sm">📺</span>
          Watch
        </>
      )}
    </button>
  );
}