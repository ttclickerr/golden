import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Clock, Zap, DollarSign } from "lucide-react";
import { formatNumber } from "@/lib/gameData";
import { useTranslation } from "@/lib/i18n";
import { adManager } from "@/lib/adSystem";
import { useNotifications } from "@/components/NotificationSystem";

// Типы для Google AdSense
// Types defined in admob.ts

interface BoostersPanelProps {
  gameState: any;
  onBoosterActivate: (boosterId: string) => void;
}

interface Booster {
  id: string;
  name: string;
  description: string;
  duration: number; // в секундах
  multiplier: number;
  icon: any;
  color: string;
  rewardType: 'click' | 'income' | 'money';
  baseReward: number;
}

const getBoostersData = (t: any): Booster[] => [
  {
    id: 'auto_clicker',
    name: 'Auto Clicker',
    description: 'Auto Clicker for 60 sec',
    duration: 60,
    multiplier: 1,
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    rewardType: 'income',
    baseReward: 0
  },
  {
    id: 'money_rain',
    name: '$10.0K',
    description: '$10K Money Rain',
    duration: 0,
    multiplier: 1,
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    rewardType: 'money',
    baseReward: 10000
  },
  {
    id: 'mega_multiplier',
    name: 'Mega Multiplier 5x',
    description: '5x income for 45 sec',
    duration: 45,
    multiplier: 5,
    icon: Zap,
    color: 'from-red-500 to-pink-500',
    rewardType: 'income',
    baseReward: 0
  }
];

export function BoostersPanel({ gameState, onBoosterActivate }: BoostersPanelProps) {
  const { t } = useTranslation();
  const [activeBoosters, setActiveBoosters] = useState<Record<string, { endTime: number; startTime: number }>>({});
  const [adCooldowns, setAdCooldowns] = useState<Record<string, number>>({});

  // Загрузка состояния бустеров из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tycoon-boosters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveBoosters(parsed.active || {});
        setAdCooldowns(parsed.cooldowns || {});
      } catch (error) {
        console.error('Failed to load boosters state:', error);
      }
    }
  }, []);

  // Сохранение состояния бустеров
  useEffect(() => {
    const state = {
      active: activeBoosters,
      cooldowns: adCooldowns
    };
    localStorage.setItem('tycoon-boosters', JSON.stringify(state));
  }, [activeBoosters, adCooldowns]);

  // Обновление таймеров
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Удаляем истекшие бустеры
      setActiveBoosters(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(boosterId => {
          if (updated[boosterId].endTime <= now) {
            delete updated[boosterId];
          }
        });
        return updated;
      });

      // Обновляем кулдауны рекламы
      setAdCooldowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(boosterId => {
          if (updated[boosterId] <= now) {
            delete updated[boosterId];
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleWatchAd = async (booster: Booster) => {
    const now = Date.now();
    
    // Проверяем кулдаун
    if (adCooldowns[booster.id] && adCooldowns[booster.id] > now) {
      return;
    }

    try {
      console.log(`Показ рекламы для бустера: ${booster.name}`);
      
      // Показываем полноэкранную рекламу AdSense
      await showFullscreenAd(booster.name);
      
      // Активируем бустер после просмотра рекламы
      if (booster.duration > 0) {
        setActiveBoosters(prev => ({
          ...prev,
          [booster.id]: {
            startTime: now,
            endTime: now + (booster.duration * 1000)
          }
        }));
      }

      // Устанавливаем кулдаун на рекламу (5 минут)
      setAdCooldowns(prev => ({
        ...prev,
        [booster.id]: now + (5 * 60 * 1000)
      }));

      // Вызываем коллбек для активации бустера
      onBoosterActivate(booster.id);

      // Отслеживание события
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'ad_watched', {
          event_category: 'monetization',
          event_label: booster.id,
          value: 1
        });
      }

    } catch (error) {
      console.error('Ошибка при показе рекламы:', error);
    }
  };

  // Функция для показа полноэкранной рекламы
  const showFullscreenAd = (boosterName: string): Promise<void> => {
    return new Promise((resolve) => {
      if (window.adsbygoogle) {
        console.log('Запуск AdSense рекламы для бустера...');
        
        // Создаем полноэкранное модальное окно с рекламой
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        `;
        
        const adContainer = document.createElement('div');
        adContainer.style.cssText = `
          background: rgba(255, 255, 255, 0.95);
          padding: 40px;
          border-radius: 20px;
          width: 90vw;
          height: 80vh;
          max-width: 800px;
          max-height: 600px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
        `;
        
        adContainer.innerHTML = `
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1a1a2e; font-size: 24px; margin: 0 0 10px 0; font-weight: bold;">
              🚀 Booster Activation: ${boosterName}
            </h2>
            <p style="color: #666; margin: 0; font-size: 16px;">
              Watch an ad to activate the booster!
            </p>
          </div>
          
          <div style="flex: 1; display: flex; align-items: center; justify-content: center; width: 100%;">
            <ins class="adsbygoogle"
                 style="display:block;width:100%;max-width:728px;height:300px"
                 data-ad-client="ca-pub-3940256099942544"
                 data-ad-slot="1033173712"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          </div>
          
          <div style="margin-top: 30px; text-align: center; width: 100%;">
            <div style="color: #667eea; font-size: 16px; font-weight: bold; margin-bottom: 10px;">
              🎬 Playing advertisement...
            </div>
            <div style="color: #888; font-size: 14px;">
              Auto-closing in <span id="countdown">5</span> seconds
            </div>
          </div>
        `;
        
        modal.className = 'modal';
        modal.appendChild(adContainer);
        document.body.appendChild(modal);
        
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (adError) {
          console.log('AdSense временно недоступен');
        }
        
        // Добавляем обратный отсчет
        let countdown = 5;
        const countdownElement = modal.querySelector('#countdown');
        const countdownInterval = setInterval(() => {
          countdown--;
          if (countdownElement) {
            countdownElement.textContent = countdown.toString();
          }
          
          if (countdown <= 0) {
            clearInterval(countdownInterval);
            if (document.body.contains(modal)) {
              document.body.removeChild(modal);
            }
            resolve();
          }
        }, 1000);
      } else {
        // Fallback без рекламы
        setTimeout(resolve, 1000);
      }
    });
  };

  const getRemainingTime = (boosterId: string): number => {
    const active = activeBoosters[boosterId];
    if (!active) return 0;
    return Math.max(0, active.endTime - Date.now());
  };

  const getCooldownTime = (boosterId: string): number => {
    const cooldown = adCooldowns[boosterId];
    if (!cooldown) return 0;
    return Math.max(0, cooldown - Date.now());
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBoosterReward = (booster: Booster): string => {
    switch (booster.rewardType) {
      case 'click':
        return `$${formatNumber(booster.baseReward * gameState.level)}`;
      case 'money':
        return `$${formatNumber(booster.baseReward * gameState.level)}`;
      default:
        return booster.name;
    }
  };

  const boosters = getBoostersData(t);

  // Game ad placeholder card
  const showGameAd = () => {
    // Game ad logic or redirect will be implemented here
    console.log("Game ad display");
  };

  return (
    <div className="space-y-3">
      
      {boosters.map(booster => {
        const IconComponent = booster.icon;
        const isActive = !!activeBoosters[booster.id];
        const remainingTime = getRemainingTime(booster.id);
        const cooldownTime = getCooldownTime(booster.id);
        const canWatch = !isActive && cooldownTime === 0;
        const progress = isActive ? (remainingTime / (booster.duration * 1000)) * 100 : 0;
        
        return (
          <Card 
            key={booster.id}
            className={`glass-card border-white/10 p-4 ${
              isActive ? 'booster-active' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${booster.color} rounded-xl flex items-center justify-center`}>
                  <IconComponent className="text-white w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{booster.name}</h3>
                    {isActive && (
                      <Badge className="bg-green-600 text-white text-xs font-semibold py-0.5 px-2">
                        ACTIVE
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{booster.description}</p>
                  
                  {isActive && (
                    <p className="text-green-400 text-xs mt-1">
                      Time Left: {formatTime(remainingTime)}
                    </p>
                  )}
                  
                  {cooldownTime > 0 && (
                    <p className="text-amber-400 text-xs mt-1">
                      Available in: {formatTime(cooldownTime)}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                size="sm"
                disabled={!canWatch}
                onClick={() => handleWatchAd(booster)}
                className={`${
                  canWatch 
                    ? `bg-indigo-600 hover:bg-indigo-700` 
                    : 'bg-gray-700/50'
                } text-white border-0 rounded-md px-3 h-9`}
              >
                <Play className="w-4 h-4 mr-1" />
                <span className="text-xs">Watch Ad</span>
              </Button>
            </div>
            
            {isActive && (
              <div className="mt-3">
                <div className="w-full bg-gray-800/70 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="progress-bar-booster h-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </Card>
        );
      })}
      
      {/* Статистика */}
      <Card className="glass-card border-white/10 p-4 mt-4">
        <h2 className="text-white text-lg font-bold mb-3 text-center">Statistics</h2>
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-teal-400 text-xl font-bold">41</p>
            <p className="text-xs text-gray-400">Total Clicks</p>
          </div>
          <div className="text-center">
            <p className="text-amber-400 text-xl font-bold">$217</p>
            <p className="text-xs text-gray-400">Portfolio Value</p>
          </div>
        </div>
      </Card>
      
      {/* Advertisement placeholder */}
      <Card className="glass-card border-white/10 p-3 mt-3 bg-blue-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Super Game!</h3>
              <p className="text-gray-300 text-xs">Download now and get bonus!</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={showGameAd}
            className="bg-green-500 hover:bg-green-600 text-white border-0 px-3 h-8 rounded"
          >
PLAY
          </Button>
        </div>
      </Card>
    </div>
  );
}