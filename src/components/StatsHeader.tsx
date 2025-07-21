import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Volume2, Moon, Settings, History } from "lucide-react";
import { GameState } from "@/hooks/useGameState";
import { ExtendedGameState } from "@/types/commonTypes";
import { formatNumber, ACHIEVEMENTS } from "@/lib/gameData";
import { TransactionHistory, type Transaction, useTransactionHistory } from "@/components/TransactionHistory";
import { useTranslation } from "@/lib/i18n";
import { useLocation } from "wouter";
import { GameClock } from "@/components/GameClock";

// Generate static transaction history based on game state
function generateRecentTransactions(gameState: ExtendedGameState): Transaction[] {
  const transactions: Transaction[] = [];
  const baseTime = Date.now();
  
  // Add investment transactions with static timestamps (5 minutes apart)
  Object.entries(gameState.investments || {}).forEach(([assetId, quantity], index) => {
    if (quantity > 0) {
      transactions.push({
        id: `inv-${assetId}`,
        type: 'investment',
        amount: 100,
        description: `Купил акцию ${assetId}`,
        timestamp: new Date(baseTime - (index + 1) * 300000), // 5 minutes apart
        source: 'Trading'
      });
    }
  });
  
  // Add business transactions with static timestamps  
  Object.entries(gameState.businesses || {}).forEach(([businessId, owned], index) => {
    if (owned) {
      transactions.push({
        id: `bus-${businessId}`,
        type: 'business',
        amount: 5000,
        description: `Купил бизнес ${businessId}`,
        timestamp: new Date(baseTime - (index + 10) * 600000), // 10 minutes apart, older
        source: 'Business'
      });
    }
  });
  
  // Add recent passive income (current time)
  if (gameState.passiveIncome > 0) {
    transactions.push({
      id: 'passive-current',
      type: 'passive',
      amount: gameState.passiveIncome,
      description: 'Пассивный доход',
      timestamp: new Date(baseTime - 60000), // 1 minute ago
      source: 'Investments'
    });
  }
  
  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20);
}

interface StatsHeaderProps {
  gameState: ExtendedGameState;
  realPassiveIncome?: number;
  onSettingsClick?: () => void;
  isCollapsed?: boolean;
  onAchievementUnlock?: (achievementId: string) => void;
  transactions?: any[];
  onExpandHome?: () => void;
}

export function StatsHeader({ gameState, realPassiveIncome, onSettingsClick, isCollapsed = false, onAchievementUnlock, transactions, onExpandHome }: StatsHeaderProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [moneyAnimation, setMoneyAnimation] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const prevBalance = useRef(gameState.balance);
  const [clicksPerMinute, setClicksPerMinute] = useState(0);
  const clickTimestamps = useRef<number[]>([]);
  const prevMaxCPM = useRef(0);
  // Используем переданный массив транзакций вместо локального хука
  const displayTransactions = transactions || [];
  
  // Вычисляем прогресс XP
  const xpProgress = (gameState.maxXp && gameState.maxXp > 0) ? 
    Math.min(((gameState.xp || 0) / gameState.maxXp) * 100, 100) : 0;
  
  // Анимация добавления денег
  useEffect(() => {
    const balanceDiff = gameState.balance - prevBalance.current;
    if (balanceDiff > 0.05) { // Показываем анимацию только при значимом изменении
      setMoneyAnimation(`+$${balanceDiff.toFixed(1)}`);
      setTimeout(() => setMoneyAnimation(null), 2000);
    }
    prevBalance.current = gameState.balance;
  }, [gameState.balance]);

  // Трекинг скорости кликов в реальном времени
  useEffect(() => {
    const now = Date.now();
    // Добавляем новый клик
    clickTimestamps.current.push(now);
    
    // Убираем клики старше 5 секунд для еще более точного отображения
    clickTimestamps.current = clickTimestamps.current.filter(timestamp => 
      now - timestamp < 5000
    );
    
    // Вычисляем скорость кликов в минуту на основе последних 5 секунд
    const clicksInLast5Sec = clickTimestamps.current.length;
    const clicksPerMinuteCalc = Math.round((clicksInLast5Sec * 12)); // умножаем на 12 чтобы получить клики в минуту
    setClicksPerMinute(clicksPerMinuteCalc);
  }, [gameState.totalClicks]);

  // Автоматический сброс анимации при отсутствии кликов
  useEffect(() => {
    const resetTimer = setInterval(() => {
      const now = Date.now();
      // Убираем старые клики
      clickTimestamps.current = clickTimestamps.current.filter(timestamp => 
        now - timestamp < 5000
      );
      
      // Пересчитываем скорость
      const clicksInLast5Sec = clickTimestamps.current.length;
      const clicksPerMinuteCalc = Math.round((clicksInLast5Sec * 12));
      setClicksPerMinute(clicksPerMinuteCalc);
      
      // Проверяем достижения по скорости кликов
      if (clicksPerMinuteCalc > prevMaxCPM.current) {
        prevMaxCPM.current = clicksPerMinuteCalc;
        
        // Проверяем все достижения скорости кликов (только для игроков уровня 2+)
        if (gameState.level >= 2) {
          const speedAchievements = ACHIEVEMENTS.filter(a => a.type === 'click_speed');
          speedAchievements.forEach(achievement => {
            if (clicksPerMinuteCalc >= achievement.requirement && 
                !(gameState.achievements || []).includes(achievement.id)) {
              // Вызываем функцию разблокировки достижения
              if (onAchievementUnlock) {
                onAchievementUnlock(achievement.id);
              }
              
              // Показываем уведомление
              console.log(`🏆 Achievement unlocked: ${achievement.name} (${clicksPerMinuteCalc} CPM)`);
            }
          });
        } else {
          console.log('🎊 Click speed achievements отключены для игрока уровня 1: упрощенный режим');
        }
      }
    }, 50); // Обновляем каждые 50мс для максимальной отзывчивости

    return () => clearInterval(resetTimer);
  }, [gameState.achievements, onAchievementUnlock]);

  const handleHeaderClick = () => {
    if (isCollapsed && onExpandHome) {
      onExpandHome();
    } else {
      setLocation('/');
    }
  };

  return (
    <header className={`relative mx-2 mt-2 transition-all duration-500 ease-in-out overflow-hidden ${
      isCollapsed ? 'max-h-20 opacity-90' : 'max-h-72 opacity-100'
    }`}>
      {/* Premium Header with Gradient Border */}
      <div className="relative bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 rounded-2xl p-[1px] backdrop-blur-md">
        <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-2xl px-2 py-1 border border-white/10">
          
          {/* Top Bar - Logo & Controls - Always Visible */}
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-all duration-200 hover:scale-[1.02]" 
              onClick={handleHeaderClick}
              title="Перейти на главную страницу"
            >
              <div className="relative">
                <div className={`bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30 transition-all duration-300 ${
                  isCollapsed ? 'w-6 h-6' : 'w-8 h-8'
                }`}>
                  <i className={`fas fa-crown text-white ${isCollapsed ? 'text-xs' : 'text-sm'}`}></i>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
              </div>
              <h1 className={`font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent transition-all duration-300 ${
                isCollapsed ? 'text-sm' : 'text-lg'
              }`}>
{isCollapsed ? 'TC' : t('tycoonClicker')}
              </h1>
              
              {/* Collapsed State - Mini Stats */}
              {isCollapsed && (
                <div className="space-y-1">
                  <div className="text-emerald-400 font-semibold text-sm">
                    ${gameState.balance.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    <div className="text-green-400 font-bold bg-green-900/20 px-2 py-1 rounded text-sm">
                      ${(realPassiveIncome || 0) > 0 ? (realPassiveIncome || 0).toFixed(1) : '0.0'}/s
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-1.5 py-0.5 rounded text-[10px] font-bold">
                      LVL {gameState.level}
                    </div>

                    <div className="text-xs font-black tracking-wide bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      WIZA
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setHistoryOpen(true)}
                className={`bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all hover:scale-105 border border-white/10 ${
                  isCollapsed ? 'w-7 h-7' : 'w-8 h-8'
                }`}
                title="История транзакций"
              >
                <History className={`text-green-300 ${isCollapsed ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
              </button>
              <button 
                onClick={onSettingsClick}
                className={`bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all hover:scale-105 border border-white/10 ${
                  isCollapsed ? 'w-7 h-7' : 'w-8 h-8'
                }`}
              >
                <Settings className={`text-gray-300 ${isCollapsed ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
              </button>
            </div>
          </div>
          
          {/* Expanded Stats Section - Hidden when collapsed */}
          {!isCollapsed && (
            <>
              <div className="mt-1 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-1.5 border border-white/5">
                {/* Balance with WIZA in top right */}
                <div className="relative mb-1.5">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-0.5">{t('balance')}:</div>
                    <div className="relative">
                      <div className="text-xl font-bold text-emerald-400">
                        ${gameState.balance.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                      </div>
                      {moneyAnimation && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-green-400 font-bold text-lg animate-bounce">
                          {moneyAnimation}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* WIZA в правом верхнем углу на уровне слова "Баланс" */}
                  <div className="absolute top-0 right-0">
                    <div className="text-right">
                      <div className="font-bold tracking-wider bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent drop-shadow-lg"
                           style={{fontFamily: 'Arial Black, sans-serif', letterSpacing: '1px', fontSize: '1.5rem'}}>
                        WIZA
                      </div>
                      <div className="text-xs font-extrabold text-yellow-400 tracking-wide -mt-1 uppercase" style={{letterSpacing: '1.5px'}}>
                        PREMIUM
                      </div>
                    </div>
                  </div>
                </div>

                {/* Retro Income & Click Rate Display */}
                <div className="text-center mb-1.5">
                  <div className="flex items-center justify-center gap-2 mb-0.5">
                    <div className="text-xs text-gray-400">{t('income')}:</div>
                  </div>
                  <div className="flex items-center justify-center text-green-400 text-sm font-semibold bg-green-900/20 px-2 py-0.5 rounded border border-green-500/20 mb-1.5">
                    <i className="fas fa-chart-line mr-1 text-xs"></i>
                    ${(() => {
                      // Базовый пассивный доход
                      let income = realPassiveIncome || 0;
                      
                      if (income <= 0) return '0';
                      
                      // 1. Бонус от уровня (5% за уровень)
                      const levelMultiplier = 1 + (gameState.level - 1) * 0.05;
                      income *= levelMultiplier;
                      
                      // 2. Бонус от быстрого кликания
                      const clickMultiplier = 1 + Math.min(clicksPerMinute / 100, 2);
                      income *= clickMultiplier;
                      
                      // 3. Бонус от активных бустеров
                      const now = Date.now();
                      let boosterMultiplier = 1;
                      Object.entries(gameState.activeBoosters || {}).forEach(([boosterId, booster]) => {
                        if (booster.endTime > now) {
                          boosterMultiplier *= booster.multiplier;
                        }
                      });
                      income *= boosterMultiplier;
                      
                      // 4. Бонус от достижений (1% за достижение)
                      const achievementMultiplier = 1 + (gameState.achievements?.length || 0) * 0.01;
                      income *= achievementMultiplier;
                      
                      // 5. Бонус от количества бизнесов (0.5% за бизнес)
                      const ownedBusinesses = Object.values(gameState.businesses || {}).filter(b => b.owned).length;
                      const businessMultiplier = 1 + ownedBusinesses * 0.005;
                      income *= businessMultiplier;
                      
                      return formatNumber(income);
                    })()} /sec
                    {(() => {
                      const baseIncome = realPassiveIncome || 0;
                      if (baseIncome <= 0) return null;
                      
                      // Рассчитываем общий множитель
                      const levelMultiplier = 1 + (gameState.level - 1) * 0.05;
                      const clickMultiplier = 1 + Math.min(clicksPerMinute / 100, 2);
                      
                      const now = Date.now();
                      let boosterMultiplier = 1;
                      Object.entries(gameState.activeBoosters || {}).forEach(([boosterId, booster]) => {
                        if (booster.endTime > now) {
                          boosterMultiplier *= booster.multiplier;
                        }
                      });
                      
                      const achievementMultiplier = 1 + (gameState.achievements?.length || 0) * 0.01;
                      const ownedBusinesses = Object.values(gameState.businesses || {}).filter(b => b.owned).length;
                      const businessMultiplier = 1 + ownedBusinesses * 0.005;
                      
                      const totalMultiplier = levelMultiplier * clickMultiplier * boosterMultiplier * achievementMultiplier * businessMultiplier;
                      const totalBonus = (totalMultiplier - 1) * 100;
                      
                      return totalBonus > 0 && (
                        <span className={`ml-1 text-xs ${
                          boosterMultiplier > 1 ? 'text-purple-400 animate-pulse' :
                          clicksPerMinute >= 300 ? 'text-red-400 animate-pulse' :
                          clicksPerMinute >= 180 ? 'text-yellow-400' :
                          totalBonus > 50 ? 'text-cyan-400' :
                          'text-green-400'
                        }`}>
                          +{Math.round(totalBonus)}%
                        </span>
                      );
                    })()}
                  </div>
                  
                  {/* Retro Click Rate Animation */}
                  <div className={`bg-black/40 rounded border px-2 py-1 transition-all duration-300 ${
                    clicksPerMinute >= 400 ? 'border-purple-600/80 bg-purple-900/40 animate-pulse' :
                    clicksPerMinute >= 280 ? 'border-orange-600/70 bg-orange-900/30' :
                    clicksPerMinute >= 180 ? 'border-red-600/60 bg-red-900/25' :
                    clicksPerMinute >= 120 ? 'border-red-500/50 bg-red-900/20' :
                    'border-green-500/30'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className={`text-xs font-mono tracking-wider ${
                        clicksPerMinute >= 400 ? 'text-purple-300 animate-bounce' :
                        clicksPerMinute >= 280 ? 'text-orange-300 animate-bounce' :
                        clicksPerMinute >= 180 ? 'text-red-400 animate-bounce' :
                        clicksPerMinute >= 120 ? 'text-red-400' :
                        'text-green-400'
                      }`}>
                        {clicksPerMinute >= 400 ? 'LEGENDARY' :
                         clicksPerMinute >= 280 ? 'INSANE' :
                         clicksPerMinute >= 180 ? 'CRITICAL' :
                         clicksPerMinute >= 120 ? 'HIGH SPEED' :
                         'CLICK RATE'}
                      </div>
                      
                      <div className="flex items-center gap-0.5">
                        {/* Пиксельные блоки с цветовой индикацией */}
                        {[...Array(9)].map((_, i) => {
                          const activeBlocks = Math.min(9, Math.floor(clicksPerMinute / 45));
                          const isActive = i < activeBlocks;
                          
                          let colorClass = 'bg-gray-700';
                          if (isActive) {
                            if (clicksPerMinute >= 400) {
                              colorClass = 'bg-purple-500 animate-pulse shadow-purple-500/80 shadow-lg';
                            } else if (clicksPerMinute >= 280) {
                              colorClass = 'bg-orange-500 animate-pulse shadow-orange-500/70 shadow-md';
                            } else if (clicksPerMinute >= 180) {
                              colorClass = 'bg-red-600 animate-pulse shadow-red-600/60 shadow-md';
                            } else if (clicksPerMinute >= 120) {
                              colorClass = 'bg-red-500 animate-pulse shadow-red-500/50 shadow-sm';
                            } else {
                              colorClass = 'bg-green-400 animate-pulse';
                            }
                          }
                          
                          return (
                            <div
                              key={i}
                              className={`w-1 h-3 transition-all duration-200 ${colorClass}`}
                              style={{
                                animationDelay: `${i * 20}ms`,
                                animationDuration: clicksPerMinute >= 400 ? '0.1s' :
                                                 clicksPerMinute >= 280 ? '0.15s' :
                                                 clicksPerMinute >= 180 ? '0.2s' : 
                                                 clicksPerMinute >= 120 ? '0.4s' : '1s'
                              }}
                            ></div>
                          );
                        })}
                      </div>
                      
                      <div className={`text-xs font-mono tracking-wider transition-all duration-300 ${
                        clicksPerMinute >= 400 ? 'text-purple-300 animate-pulse transform scale-125' :
                        clicksPerMinute >= 280 ? 'text-orange-300 animate-pulse transform scale-115' :
                        clicksPerMinute >= 180 ? 'text-red-300 animate-pulse transform scale-110' :
                        clicksPerMinute >= 120 ? 'text-red-300 animate-pulse' :
                        clicksPerMinute > 0 ? 'text-green-300 animate-pulse' :
                        'text-green-300'
                      }`}>
                        <span className={clicksPerMinute > 0 ? 'animate-bounce' : ''}>{clicksPerMinute}</span>
                        {clicksPerMinute >= 400 && <span className="ml-1 text-purple-400 animate-ping">⚡💎</span>}
                        {clicksPerMinute >= 280 && clicksPerMinute < 400 && <span className="ml-1 text-orange-400 animate-ping">🚀🔥</span>}
                        {clicksPerMinute >= 180 && clicksPerMinute < 280 && <span className="ml-1 text-red-600 animate-ping">🔥🔥</span>}
                        {clicksPerMinute >= 120 && clicksPerMinute < 180 && <span className="ml-1 text-red-500 animate-pulse">🔥</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level & XP Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-2 py-0.5 rounded-md text-xs font-bold shadow-md">
                      LVL {gameState.level}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatNumber(gameState.xp || 0)} / {formatNumber(gameState.maxXp || 0)} XP
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 w-16 mx-2">
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${xpProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-yellow-400 font-semibold bg-yellow-900/20 px-2 py-0.5 rounded border border-yellow-500/20">
                      ${formatNumber(gameState.clickValue)} / click
                    </div>
                  </div>
                </div>


              </div>
            </>
          )}
          
          {/* Subtle Premium Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
        </div>
      </div>
      
      {/* Ambient Light Effect - Reduced when collapsed */}
      <div className={`absolute -inset-2 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 rounded-3xl blur-xl animate-pulse pointer-events-none transition-opacity duration-500 ${
        isCollapsed ? 'opacity-20' : 'opacity-50'
      }`}></div>
      
      {/* Transaction History Modal */}
      <TransactionHistory 
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        transactions={displayTransactions}
      />
    </header>
  );
}
