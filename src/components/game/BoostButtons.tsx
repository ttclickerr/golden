import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, TrendingUp, Activity } from 'lucide-react';
import { useGameState } from '@/lib/stores/useGameState';
import { applovinService } from '@/services/ApplovinService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Компонент с кнопками буста для монетизации
 */
export default function BoostButtons() {
  const { t } = useTranslation();
  const gameState = useGameState();
  
  const [incomeBoostActive, setIncomeBoostActive] = useState(false);
  const [incomeBoostRemaining, setIncomeBoostRemaining] = useState(0);
  const [clickBoostActive, setClickBoostActive] = useState(false);
  const [clickBoostRemaining, setClickBoostRemaining] = useState(0);
  
  // Обратный отсчет для бустов
  useEffect(() => {
    const timer = setInterval(() => {
      if (incomeBoostRemaining > 0) {
        setIncomeBoostRemaining(prev => prev - 1);
      } else if (incomeBoostActive) {
        setIncomeBoostActive(false);
        toast.info(t('boosts.incomeBoostEnded'));
      }
      
      if (clickBoostRemaining > 0) {
        setClickBoostRemaining(prev => prev - 1);
      } else if (clickBoostActive) {
        setClickBoostActive(false);
        toast.info(t('boosts.clickBoostEnded'));
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [incomeBoostRemaining, clickBoostRemaining, incomeBoostActive, clickBoostActive, t]);
  
  // Форматирование времени
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Активация буста дохода
  const activateIncomeBoost = async () => {
    const result = await applovinService.showRewardedAd();
    
    if (result) {
      const multiplier = applovinService.getRewardMultiplier();
      const duration = applovinService.getRewardDuration();
      
      if (gameState.addTemporaryMultiplier) {
        gameState.addTemporaryMultiplier('income', multiplier, duration);
        setIncomeBoostActive(true);
        setIncomeBoostRemaining(duration);
        
        toast.success(t('boosts.incomeBoostActivated', { multiplier, duration: Math.floor(duration / 60) }));
      } else {
        // Если метод не найден, используем временное решение
        toast.success("Income boost activated!");
        setIncomeBoostActive(true);
        setIncomeBoostRemaining(1800); // 30 минут
      }
    } else {
      toast.error(t('boosts.adNotAvailable'));
    }
  };
  
  // Активация буста клика
  const activateClickBoost = async () => {
    const result = await applovinService.showRewardedAd();
    
    if (result) {
      const multiplier = applovinService.getRewardMultiplier();
      const duration = applovinService.getRewardDuration();
      
      if (gameState.addTemporaryMultiplier) {
        gameState.addTemporaryMultiplier('click', multiplier, duration);
        setClickBoostActive(true);
        setClickBoostRemaining(duration);
        
        toast.success(t('boosts.clickBoostActivated', { multiplier, duration: Math.floor(duration / 60) }));
      } else {
        // Если метод не найден, используем временное решение
        toast.success("Click boost activated!");
        setClickBoostActive(true);
        setClickBoostRemaining(1800); // 30 минут
      }
    } else {
      toast.error(t('boosts.adNotAvailable'));
    }
  };
  
  return (
    <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-4 mt-6">
      <button
        className={cn(
          "flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-white",
          "border transition-all duration-200",
          incomeBoostActive 
            ? "bg-[rgba(76,195,165,0.3)] border-[#4cc3a5]" 
            : "bg-[rgba(0,0,0,0.3)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(76,195,165,0.2)] hover:border-[#4cc3a5]/50"
        )}
        onClick={activateIncomeBoost}
        disabled={incomeBoostActive}
      >
        <TrendingUp className="h-4 w-4 mr-2 text-[#4cc3a5]" />
        <span className="flex-1 text-sm font-medium">
          {incomeBoostActive 
            ? t('boosts.incomeBoostActive', { time: formatTime(incomeBoostRemaining) })
            : t('boosts.activateIncomeBoost')}
        </span>
        <span className="text-yellow-400 text-xs font-semibold ml-2">
          {incomeBoostActive ? "" : "for 30s"}
        </span>
      </button>
      
      <button
        className={cn(
          "flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-white",
          "border transition-all duration-200",
          clickBoostActive 
            ? "bg-[rgba(76,195,165,0.3)] border-[#4cc3a5]" 
            : "bg-[rgba(0,0,0,0.3)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(76,195,165,0.2)] hover:border-[#4cc3a5]/50"
        )}
        onClick={activateClickBoost}
        disabled={clickBoostActive}
      >
        <Activity className="h-4 w-4 mr-2 text-[#4cc3a5]" />
        <span className="flex-1 text-sm font-medium">
          {clickBoostActive 
            ? t('boosts.clickBoostActive', { time: formatTime(clickBoostRemaining) })
            : t('boosts.activateClickBoost')}
        </span>
        <span className="text-yellow-400 text-xs font-semibold ml-2">
          {clickBoostActive ? "" : "for 30s"}
        </span>
      </button>
    </div>
  );
}