import { useEffect, useRef, useState } from 'react';
import { useGameState } from '@/lib/stores/useGameState';
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp, Clock, Award } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

const CurrencyDisplay = () => {
  const { t } = useTranslation();
  const { currentCurrency, passiveIncome, clickValue, level, xp, xpRequired } = useGameState();
  const [displayCurrency, setDisplayCurrency] = useState(currentCurrency);
  const prevCurrencyRef = useRef(currentCurrency);
  
  // Рассчитываем будущее значение клика при повышении уровня (как в оригинальном WealthTycoon)
  const nextLevelClickValue = clickValue * 1.1;
  
  // Рассчитываем прогресс XP
  const xpProgress = (xp / xpRequired) * 100;
  
  // Smooth number animation
  useEffect(() => {
    // Skip animation for large differences
    if (Math.abs(currentCurrency - prevCurrencyRef.current) > 1000) {
      setDisplayCurrency(currentCurrency);
      prevCurrencyRef.current = currentCurrency;
      return;
    }
    
    const start = prevCurrencyRef.current;
    const end = currentCurrency;
    const duration = 500; // milliseconds
    const startTime = performance.now();
    
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = start + (end - start) * progress;
      
      setDisplayCurrency(value);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevCurrencyRef.current = end;
      }
    };
    
    requestAnimationFrame(animate);
  }, [currentCurrency]);

  return (
    <div className="bg-[rgba(0,0,0,0.3)] rounded-xl shadow p-4 mb-4 text-white border border-[#4cc3a5]/30">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-white/70">Balance:</h2>
            <div className="flex items-center text-2xl font-bold">
              <DollarSign className="h-5 w-5 mr-1 text-[#4cc3a5]" />
              <span>{formatNumber(displayCurrency)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-1 text-right">
            <div className="flex items-center justify-end text-sm">
              <Clock className="h-4 w-4 mr-1 text-[#4cc3a5]" />
              <span>${formatNumber(passiveIncome * 3600)} / hr</span>
            </div>
            <div className="flex items-center justify-end text-sm">
              <TrendingUp className="h-4 w-4 mr-1 text-[#4cc3a5]" />
              <span>${formatNumber(passiveIncome)} / sec</span>
            </div>
          </div>
        </div>
        
        {/* Уровень и прогресс XP в стиле WealthTycoon */}
        <div className="flex justify-between items-center bg-[rgba(0,0,0,0.3)] p-3 rounded-lg">
          <div className="flex-1 flex flex-col items-center">
            <div className="text-lg font-bold">{level} LEVEL</div>
            <div className="text-sm text-[#4cc3a5]">${clickValue.toFixed(2)} per click</div>
          </div>
          
          <div className="text-2xl px-2">→</div>
          
          <div className="flex-1 flex flex-col items-center">
            <div className="text-lg font-bold">{level + 1} LEVEL</div>
            <div className="text-sm text-[#4cc3a5]">${nextLevelClickValue.toFixed(2)} per click</div>
          </div>
        </div>
        
        {/* Прогресс-бар для XP */}
        <div className="h-5 w-full bg-[#2c2c44] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#4cc3a5] rounded-full flex items-center justify-center text-xs text-black font-medium"
            style={{ width: `${xpProgress}%` }}
          >
            {xp}/{xpRequired} XP
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyDisplay;
