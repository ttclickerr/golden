import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { useAuth } from '../hooks/useAuth';
import { RewardedAd } from './RewardedAd';
import { RewardedAdsService, RewardedAdProvider } from '../services/RewardedAdsService';
import { 
  Zap, 
  Gift, 
  ShoppingCart, 
  Clock, 
  Crown, 
  RefreshCw,
  Star,
  Coins,
  Download,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Calendar
} from 'lucide-react';
import { runEcpmAuction } from '../lib/ecpmAuction';

interface UnifiedBoosterStoreProps {
  gameState: any;
  onWatchAd: (rewardType: string) => void;
  onPurchase?: (type: string, amount?: number) => void;
  isPremium?: boolean;
}

interface AdReward {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  cooldown: number;
  benefit: string;
  color: string;
  lastUsed?: number;
}

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  category: 'premium' | 'boosters';
  popular?: boolean;
  type: 'one-time' | 'consumable' | 'subscription';
}

export function UnifiedBoosterStore({ gameState, onWatchAd, onPurchase, isPremium = false }: UnifiedBoosterStoreProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('store');
  const { user } = useAuth();

  // Единая функция проверки премиум статуса
  const getActualPremiumStatus = () => {
    const savedPremiumStatus = localStorage.getItem('premium-status');
    const savedPremiumType = localStorage.getItem('premium-type');
    const testModeActive = localStorage.getItem('premium-test-mode') === 'enabled';
    return (isPremium || savedPremiumStatus === 'true' || savedPremiumType === 'lifetime' || savedPremiumType === 'weekly') && !testModeActive;
  };

  const actualPremiumStatus = getActualPremiumStatus();
  
  // Добавляем слушатель изменений localStorage и пользовательских событий
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    const handlePremiumStatusChange = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('premiumStatusChanged', handlePremiumStatusChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('premiumStatusChanged', handlePremiumStatusChange);
    };
  }, []);
  const [premiumTimeLeft, setPremiumTimeLeft] = useState<string>('');
  const [premiumProgress, setPremiumProgress] = useState<number>(0);
  
  // Функция для получения времени окончания подписки
  const getPremiumExpiry = (): number | null => {
    const expiryStr = localStorage.getItem('premium-expiry');
    if (!expiryStr || expiryStr === 'lifetime') return null;
    return parseInt(expiryStr);
  };
  
  // Функция для форматирования оставшегося времени
  const formatTimeLeft = (milliseconds: number): string => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  // Обновление таймера каждую секунду
  useEffect(() => {
    const updateTimer = () => {
      const expiry = getPremiumExpiry();
      if (expiry) {
        const now = Date.now();
        const timeLeft = expiry - now;
        
        if (timeLeft > 0) {
          setPremiumTimeLeft(formatTimeLeft(timeLeft));
          // Прогресс от 0 до 100% (7 дней = 100%)
          const totalTime = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах
          const progress = Math.max(0, (timeLeft / totalTime) * 100);
          setPremiumProgress(progress);
        } else {
          setPremiumTimeLeft('Expired');
          setPremiumProgress(0);
          // Подписка истекла, убираем премиум статус
          localStorage.removeItem('premium-status');
          localStorage.removeItem('premium-expiry');
        }
      } else {
        setPremiumTimeLeft('');
        setPremiumProgress(0);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [isPremium]);

  // Все бустеры в единой стилистике
  const boosters: AdReward[] = [
    {
      id: 'mega_multiplier',
      name: 'Mega Multiplier',
      description: 'x5 income multiplier for 2 minutes',
      icon: <Star className="w-5 h-5" />,
      cooldown: 3, // 3 минуты
      benefit: 'x5 Income',
      color: 'from-purple-500 to-pink-600',
      lastUsed: gameState.rewardCooldowns?.mega_multiplier || 0
    },
    {
      id: 'golden_touch',
      name: 'Golden Touch',
      description: 'x10 click value for 2 minutes',
      icon: <Crown className="w-5 h-5" />,
      cooldown: 3, // 3 минуты
      benefit: 'x10 Click',
      color: 'from-yellow-500 to-orange-600',
      lastUsed: gameState.rewardCooldowns?.golden_touch || 0
    },
    {
      id: 'time_warp',
      name: 'Time Warp',
      description: 'x2 passive income speed for 2 minutes',
      icon: <Clock className="w-5 h-5" />,
      cooldown: 3, // 3 минуты
      benefit: 'x2 Speed',
      color: 'from-cyan-500 to-blue-600',
      lastUsed: gameState.rewardCooldowns?.time_warp || 0
    },
    {
      id: 'booster_reset',
      name: 'Reset All Boosters',
      description: 'Cancel all active boosters instantly',
      icon: <RefreshCw className="w-5 h-5" />,
      cooldown: 3, // 3 минуты
      benefit: 'Reset Boosters',
      color: 'from-red-500 to-rose-600',
      lastUsed: gameState.rewardCooldowns?.booster_reset || 0
    }
  ];

  // Специальные награды (только отмена хода и сброс прогресса)
  const resetRewards: AdReward[] = [
    {
      id: 'undo_action',
      name: 'Undo Action',
      description: 'Undo your last action and get 10% refund',
      icon: <RotateCcw className="w-5 h-5" />,
      cooldown: 5,
      benefit: 'Undo',
      color: 'from-blue-500 to-cyan-600',
      lastUsed: gameState.rewardCooldowns?.undo_action || 0
    },
    {
      id: 'reset_progress_ad',
      name: 'Reset Progress',
      description: 'Start fresh with a new game - watch ad to confirm',
      icon: <RotateCcw className="w-5 h-5" />,
      cooldown: 10,
      benefit: 'Fresh Start',
      color: 'from-red-500 to-pink-600',
      lastUsed: gameState.rewardCooldowns?.reset_progress_ad || 0
    }
  ];

  // Товары магазина (премиум подписки) - всегда показываем опции
  const storeItems: StoreItem[] = [
    {
      id: 'premium_weekly',
      name: 'Premium Weekly',
      description: 'Remove ads for 7 days',
      price: '$4.99',
      value: 1,
      icon: <Calendar className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-600',
      category: 'premium',
      popular: false,
      type: 'subscription'
    },
    {
      id: 'premium_lifetime',
      name: 'Premium Forever',
      description: 'Remove ads permanently - best value!',
      price: '$14.99',
      value: 1,
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-orange-500 to-red-600',
      category: 'premium',
      popular: true,
      type: 'one-time'
    }
  ];

  const isOnCooldown = (reward: AdReward): boolean => {
    const now = Date.now();
    const lastUsed = reward.lastUsed || 0;
    const cooldownTime = reward.cooldown * 60 * 1000;
    return (now - lastUsed) < cooldownTime;
  };

  const getCooldownTimeLeft = (reward: AdReward): string => {
    const now = Date.now();
    const lastUsed = reward.lastUsed || 0;
    const cooldownTime = reward.cooldown * 60 * 1000;
    const timeLeft = Math.max(0, cooldownTime - (now - lastUsed));
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getCooldownProgress = (reward: AdReward): number => {
    const now = Date.now();
    const lastUsed = reward.lastUsed || 0;
    const cooldownTime = reward.cooldown * 60 * 1000;
    const timeElapsed = now - lastUsed;
    if (timeElapsed >= cooldownTime) return 0;
    return ((cooldownTime - timeElapsed) / cooldownTime) * 100;
  };

  // --- Блок инициализации идентификаторов и параметров пользователя ---
  function getOrCreateUserId() {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = 'u_' + Math.random().toString(36).slice(2) + Date.now();
      localStorage.setItem('user_id', userId);
    }
    // Прокидываем user_id в window для SDK
    if (typeof window !== 'undefined') {
      (window as any).user_id = userId;
    }
    return userId;
  }
  function getOrCreateInstallTime() {
    let installTime = localStorage.getItem('install_time');
    if (!installTime) {
      installTime = Date.now().toString();
      localStorage.setItem('install_time', installTime);
    }
    if (typeof window !== 'undefined') {
      (window as any).install_time = installTime;
    }
    return installTime;
  }
  function createSessionId() {
    const sessionId = 's_' + Math.random().toString(36).slice(2) + Date.now();
    sessionStorage.setItem('session_id', sessionId);
    if (typeof window !== 'undefined') {
      (window as any).session_id = sessionId;
    }
    return sessionId;
  }
  function getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) sessionId = createSessionId();
    if (typeof window !== 'undefined') {
      (window as any).session_id = sessionId;
    }
    return sessionId;
  }
  function getAppVersion() {
    // Можно подтянуть из build-info.json или package.json
    try {
      // Попытка получить из window.BUILD_INFO, если есть
      if (typeof window !== 'undefined' && (window as any).BUILD_INFO?.version) {
        return (window as any).BUILD_INFO.version;
      }
    } catch {}
    return '1.0.0';
  }
  function getPlatform() {
    if (typeof window !== 'undefined') {
      if (/android/i.test(navigator.userAgent)) return 'android';
      if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return 'ios';
      if (/win/i.test(navigator.userAgent)) return 'windows';
      if (/mac/i.test(navigator.userAgent)) return 'macos';
      if (/linux/i.test(navigator.userAgent)) return 'linux';
      return 'web';
    }
    return 'unknown';
  }
  function getSource() {
    // Попытка получить utm_source/utm_campaign из localStorage или window.SDK
    let source = localStorage.getItem('utm_source') || '';
    let campaign = localStorage.getItem('utm_campaign') || '';
    if (typeof window !== 'undefined') {
      if ((window as any).appsFlyerSDK && (window as any).appsFlyerSDK.getAttributionData) {
        const data = (window as any).appsFlyerSDK.getAttributionData();
        if (data && data.media_source) source = data.media_source;
        if (data && data.campaign) campaign = data.campaign;
      }
      if ((window as any).AppMetrica && (window as any).AppMetrica.getAttribution) {
        const data = (window as any).AppMetrica.getAttribution();
        if (data && data.source) source = data.source;
        if (data && data.campaign) campaign = data.campaign;
      }
    }
    return { source, campaign };
  }

  // Универсальная функция для отправки любого события аналитики через SDK AppsFlyer и AppMetrica
  function trackAnalyticsEvent(event: string, params: Record<string, any> = {}) {
    const user_id = getOrCreateUserId();
    const install_time = getOrCreateInstallTime();
    const session_id = getSessionId();
    const app_version = getAppVersion();
    const platform = getPlatform();
    const { source, campaign } = getSource();
    const event_timestamp = Date.now();
    const fullParams = {
      ...params,
      user_id,
      install_time,
      session_id,
      app_version,
      platform,
      source,
      campaign,
      event_timestamp
    };
    // Google Analytics (gtag)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, fullParams);
    }
    // AppMetrica SDK
    if (typeof window !== 'undefined' && (window as any).AppMetrica) {
      (window as any).AppMetrica.reportEvent(event, fullParams);
    } else if (typeof window !== 'undefined' && (window as any).appMetrica) {
      (window as any).appMetrica.reportEvent(event, fullParams);
    }
    // AppsFlyer SDK
    if (typeof window !== 'undefined' && (window as any).appsFlyerSDK) {
      (window as any).appsFlyerSDK.logEvent(event, fullParams);
    } else if (typeof window !== 'undefined' && (window as any).appsFlyer) {
      (window as any).appsFlyer.logEvent(event, fullParams);
    }
  }

  // Универсальная функция для показа уведомления об активации бустера
  function showBoosterActivatedNotification(name: string) {
    // Удаляем старое уведомление, если оно есть
    const prev = document.getElementById('booster-activated-notification');
    if (prev) prev.remove();
    const notify = document.createElement('div');
    notify.id = 'booster-activated-notification';
    notify.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-fade-in';
    notify.innerHTML = `<div class='w-4 h-4 bg-green-400 rounded-full'></div><span>Бустер активирован: <b>${name}</b></span>`;
    document.body.appendChild(notify);
    setTimeout(() => {
      if (notify.parentNode) notify.parentNode.removeChild(notify);
    }, 2500);
  }

  // Универсальная функция для отправки аналитики активации бустера
  function trackBoosterAnalytics(boosterId: string, boosterName: string) {
    trackAnalyticsEvent('booster_activated', {
      event_category: 'booster',
      event_label: boosterId,
      value: 1,
      booster_name: boosterName
    });
  }

  // Универсальная функция для активации бустера или реварда (undo_action, reset_progress_ad)
  const handleWatchAd = async (reward: AdReward) => {
    if (isOnCooldown(reward)) return;
    if (actualPremiumStatus) {
      if (onPurchase) {
        onPurchase(reward.id, 1);
        showBoosterActivatedNotification(reward.name);
        trackBoosterAnalytics(reward.id, reward.name);
        trackAnalyticsEvent('booster_purchase', { booster_id: reward.id, booster_name: reward.name });
      }
    } else {
      // Логируем показ рекламы (до просмотра)
      const userId = localStorage.getItem('user_id') || 'anonymous';
      trackAnalyticsEvent('rewarded_shown', { adType: 'rewarded', provider: 'ecpm_auction', userId, rewardId: reward.id });
      // eCPM-аукцион между AdMob и IronSource
      const winner = runEcpmAuction();
      let adWatched = false;
      if (winner === 'admob') {
        adWatched = await RewardedAdsService.showRewardedAd(RewardedAdProvider.AdMob);
      } else if (winner === 'ironsource') {
        adWatched = await RewardedAdsService.showRewardedAd(RewardedAdProvider.IronSource);
      }
      if (adWatched) {
        onWatchAd(reward.id);
        showBoosterActivatedNotification(reward.name);
        trackBoosterAnalytics(reward.id, reward.name);
        trackAnalyticsEvent('booster_ad_watched', { booster_id: reward.id, booster_name: reward.name });
        // Логируем успешную выдачу награды
        trackAnalyticsEvent('rewarded_completed', { adType: 'rewarded', provider: winner, userId, rewardId: reward.id });
      } else {
        trackAnalyticsEvent('rewarded_failed', { adType: 'rewarded', provider: winner, userId, rewardId: reward.id });
      }
    }
  };

  // Все пользователи имеют кулдауны, но премиум могут пропустить рекламу
  const getEffectiveCooldown = (reward: AdReward): number => {
    return getCooldownProgress(reward);
  };

  const isEffectivelyOnCooldown = (reward: AdReward): boolean => {
    return isOnCooldown(reward);
  };

  const handlePurchase = (item: StoreItem) => {
    if (item.id === 'reset_progress_ad') {
      // Для сброса прогресса показываем рекламу
      onWatchAd('reset_progress_ad');
      trackAnalyticsEvent('reset_progress_ad', { item_id: item.id, item_name: item.name });

    } else if (item.id === 'restore_premium') {
      // Восстанавливаем премиум статус после тестирования
      localStorage.removeItem('premium-test-mode');
      localStorage.setItem('premium-status', 'lifetime');
      window.location.reload();
      trackAnalyticsEvent('restore_premium', { item_id: item.id, item_name: item.name });
    } else if (onPurchase) {
      // Симуляция процесса покупки
      console.log(`🛒 Initiating purchase for ${item.name} (${item.price})`);
      
      // Показываем сообщение о начале покупки
      const purchaseNotification = document.createElement('div');
      purchaseNotification.className = 'fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50';
      purchaseNotification.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>Processing ${item.name}...</span>
        </div>
      `;
      document.body.appendChild(purchaseNotification);
      
      // Симуляция задержки обработки покупки
      setTimeout(() => {
        document.body.removeChild(purchaseNotification);
        onPurchase(item.id, item.value);
        trackAnalyticsEvent('store_purchase', { item_id: item.id, item_name: item.name, price: item.price });
        // Если это платёжный товар — отправить событие оплаты
        if (item.category === 'premium' || item.category === 'boosters') {
          const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
          if (!isNaN(price)) {
            trackPaymentEvent(item.category, price, 'USD');
          }
        }
        
        // Принудительно обновляем компонент после покупки премиум статуса
        if (item.id === 'premium_lifetime' || item.id === 'premium_weekly') {
          // Небольшая задержка для показа уведомления об успешной покупке
          setTimeout(() => {
            // Принудительно обновляем интерфейс
            setRefreshTrigger(prev => prev + 1);
            console.log('✅ Premium purchase completed - interface updated');
          }, 500);
        }
      }, 2000);
    }
  };

  const handleRestorePurchases = async () => {
    console.log('🔄 Starting purchase restoration...');
    
    const restoreNotification = document.createElement('div');
    restoreNotification.className = 'fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50';
    restoreNotification.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
        <span>Checking account data...</span>
      </div>
    `;
    document.body.appendChild(restoreNotification);
    
    try {
      // Use the new purchase restoration service
      const { purchaseRestorationService } = await import('../lib/purchase-restoration');
      const result = await purchaseRestorationService.restorePurchases();
      
      document.body.removeChild(restoreNotification);
      
      if (result.success && result.premiumStatus.hasLifetime) {
        const successNotification = document.createElement('div');
        successNotification.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50';
        successNotification.innerHTML = `
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-green-400 rounded-full"></div>
            <span>${result.message}</span>
          </div>
        `;
        document.body.appendChild(successNotification);
        
        setTimeout(() => {
          document.body.removeChild(successNotification);
        }, 3000);
        
        if (onPurchase) {
          onPurchase('restore_purchases');
        }
      } else {
        const warningNotification = document.createElement('div');
        warningNotification.className = 'fixed top-4 right-4 bg-orange-600 text-white p-4 rounded-lg shadow-lg z-50';
        warningNotification.innerHTML = `
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-orange-400 rounded-full"></div>
            <span>${result.message}</span>
          </div>
        `;
        document.body.appendChild(warningNotification);
        
        setTimeout(() => {
          document.body.removeChild(warningNotification);
        }, 3000);
      }
    } catch (error) {
      document.body.removeChild(restoreNotification);
      
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50';
      errorNotification.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 bg-red-400 rounded-full"></div>
          <span>Failed to restore purchases</span>
        </div>
      `;
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        document.body.removeChild(errorNotification);
      }, 3000);
      
      console.error('Purchase restoration failed:', error);
    }
  };

  const handleDemoMode = () => {
    console.log('🎮 Activating demo mode...');
    
    const demoNotification = document.createElement('div');
    demoNotification.className = 'fixed top-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg z-50';
    demoNotification.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="animate-pulse w-4 h-4 bg-yellow-400 rounded-full"></div>
        <span>Activating demo mode...</span>
      </div>
    `;
    document.body.appendChild(demoNotification);
    
    setTimeout(() => {
      document.body.removeChild(demoNotification);
      
      if (onPurchase) {
        onPurchase('premium_lifetime');
      }
    }, 1500);
  };

  // Отправка событий жизненного цикла и активности игрока
  function trackLifecycleEvents() {
    // Событие старта сессии
    trackAnalyticsEvent('session_start', { timestamp: Date.now() });
    // Событие входа в магазин бустеров
    trackAnalyticsEvent('booster_store_open', { timestamp: Date.now() });
    // Событие выхода из магазина
    window.addEventListener('beforeunload', () => {
      trackAnalyticsEvent('session_end', { timestamp: Date.now() });
      trackAnalyticsEvent('booster_store_close', { timestamp: Date.now() });
    });
  }

  // Отправка событий времени игры
  function trackPlayTime() {
    let playStart = Date.now();
    setInterval(() => {
      const now = Date.now();
      const minutes = Math.floor((now - playStart) / 60000);
      if (minutes > 0) {
        trackAnalyticsEvent('play_time', { minutes });
        playStart = now;
      }
    }, 60000); // Каждую минуту
  }

  // Отправка событий платежей
  function trackPaymentEvent(type: string, amount: number, currency: string = 'USD') {
    trackAnalyticsEvent('payment', { type, amount, currency, timestamp: Date.now() });
  }

  // Отправка событий достижений и уровня игрока
  function trackAchievementEvent(achievementId: string, achievementName: string) {
    trackAnalyticsEvent('achievement_unlocked', {
      achievement_id: achievementId,
      achievement_name: achievementName,
      timestamp: Date.now()
    });
  }

  function trackLevelUpEvent(level: number) {
    trackAnalyticsEvent('level_up', {
      level,
      timestamp: Date.now()
    });
  }

  // Автоматическая отправка событий для ключевых уровней
  function trackMilestoneLevels(level: number) {
    const milestones = [5, 10, 25, 50, 99];
    if (milestones.includes(level)) {
      trackAnalyticsEvent('milestone_level', {
        level,
        timestamp: Date.now()
      });
    }
  }

  // Пример использования:
  // trackAchievementEvent('first_click', 'Первый клик');
  // trackLevelUpEvent(5);
  // trackMilestoneLevels(level);

  // Вызовем трекинг жизненного цикла и времени игры при монтировании компонента
  useEffect(() => {
    trackLifecycleEvents();
    trackPlayTime();
  }, []);

  // Вкладка бустеров с кулдауном
  const renderBoostersTab = () => (
    <div className="space-y-3">
      {boosters.map((reward) => {
        const onCooldown = isEffectivelyOnCooldown(reward);
        const timeLeft = getCooldownTimeLeft(reward);
        return (
          <div
            key={`booster-${reward.id}`}
            className={`relative p-3 rounded-lg border transition-all duration-200 ${
              onCooldown
                ? 'bg-gray-800/50 border-gray-600/30 opacity-60'
                : 'bg-gradient-to-r border-purple-500/30 hover:border-purple-400/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${reward.color} flex items-center justify-center text-white shadow-lg`}>
                {reward.icon}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-white text-sm truncate">{reward.name}</h4>
                  <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300 shrink-0">
                    {reward.benefit}
                  </Badge>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{reward.description}</p>
              </div>
              <div className="text-right min-w-[90px] flex flex-col items-end gap-1">
                {onCooldown ? (
                  <div className="relative">
                    <div className="text-orange-400 text-xs font-medium mb-1">{timeLeft}</div>
                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${getEffectiveCooldown(reward)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  !actualPremiumStatus ? (
                    <Button
                      onClick={() => handleWatchAd(reward)}
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 via-yellow-400 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white border-0 text-xs px-4 py-1 h-8 font-bold shadow-lg animate-pulse"
                    >
                      BOOST!
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleWatchAd(reward)}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 text-xs px-4 py-1 h-8 font-bold"
                    >
                      Activate
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Вкладка наград для сброса кулдаунов (Rewards) — теперь использует handleWatchAd и единый UI
  const renderRewardsTab = () => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        COOLDOWN RESET REWARDS
      </h3>
      <div className="space-y-2">
        {resetRewards.map((reward) => {
          const onCooldown = isEffectivelyOnCooldown(reward);
          const timeLeft = getCooldownTimeLeft(reward);
          return (
            <div
              key={`reset-${reward.id}`}
              className={`relative p-3 rounded-lg border transition-all duration-200 ${
                onCooldown
                  ? 'bg-gray-800/50 border-gray-600/30 opacity-60'
                  : 'bg-gradient-to-r border-orange-500/30 hover:border-orange-400/50 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${reward.color} flex items-center justify-center text-white shadow-lg`}>
                  {reward.icon}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white text-sm truncate">{reward.name}</h4>
                    <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-300 shrink-0">
                      {reward.benefit}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{reward.description}</p>
                </div>
                <div className="text-right">
                  {onCooldown ? (
                    <div className="relative">
                      <div className="text-orange-400 text-xs font-medium mb-1">
                        {timeLeft}
                      </div>
                      <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000 ease-linear"
                          style={{ width: `${getCooldownProgress(reward)}%` }}
                        />
                      </div>
                    </div>
                  ) : actualPremiumStatus ? (
                    <Button
                      onClick={() => handleWatchAd(reward)}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 text-xs px-3 py-1 h-7"
                    >
                      Free
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleWatchAd(reward)}
                      size="sm"
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 text-xs px-3 py-1 h-7 animate-pulse"
                    >
                      Get
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Вкладка магазина
  const renderStoreTab = () => (
    <div className="space-y-6">
      {/* Premium Features */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-600 pb-2 mb-4">
          PREMIUM FEATURES
        </h3>
        
        {storeItems.filter(item => {
          // Проверяем статус пользователя
          const savedPremiumType = localStorage.getItem('premium-type');
          const actualPremiumStatus = getActualPremiumStatus();
          
          // "Restore Purchases" показывается только для неавторизованных пользователей
          if (item.id === 'restore_purchases' && user) {
            return false;
          }
          
          // Убираем "Restore Premium" полностью
          if (item.id === 'restore_premium') {
            return false;
          }
          
          // "Premium Weekly" скрываем если уже куплен "Premium Forever"
          if (item.id === 'premium_weekly' && savedPremiumType === 'lifetime') {
            return false;
          }
          
          return item.category === 'premium';
        }).map(item => (
          <Card key={`store-${item.id}`} className="glass-card border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
                    {item.popular && (
                      <Badge className="bg-purple-600 text-white text-[10px] px-1 py-0 h-4 rounded shrink-0">
                        TOP
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                </div>
              </div>
              
              <div className="space-y-1 text-right min-w-[70px]">
                <div className="text-sm font-bold text-white">
                  {item.price}
                </div>
                {(() => {
                  // Проверяем конкретную покупку с учетом localStorage
                  const savedPremiumStatus = localStorage.getItem('premium-status');
                  const savedPremiumType = localStorage.getItem('premium-type');
                  const testModeDisabled = localStorage.getItem('premium-test-mode') === 'disabled';
                  // testModeDisabled = true означает что тестовый режим ОТКЛЮЧЕН (премиум активен)
                  // testModeDisabled = false или null означает что тестовый режим включен (премиум неактивен)
                  const testModeActive = localStorage.getItem('premium-test-mode') === 'enabled';
                  const actualPremiumStatus = (isPremium || savedPremiumStatus === 'true' || savedPremiumType === 'lifetime' || savedPremiumType === 'weekly') && !testModeActive;
                  
                  const isItemActive = 
                    (item.id === 'premium_lifetime' && actualPremiumStatus && (savedPremiumType === 'lifetime' || !savedPremiumType)) ||
                    (item.id === 'premium_weekly' && actualPremiumStatus && savedPremiumType === 'weekly') ||
                    (item.id === 'restore_premium' && testModeDisabled);
                  

                  
                  if (isItemActive) {
                    return (
                      <div className="bg-green-600 text-white rounded-lg px-2 py-1 font-semibold text-xs w-full h-6 flex items-center justify-center">
                        ✓ Active
                      </div>
                    );
                  } else {
                    return (
                      <Button
                        onClick={() => handlePurchase(item)}
                        className="bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-lg px-2 py-1 font-semibold text-xs w-full h-6"
                      >
                        {item.id === 'restore_premium' ? 'Restore' : item.id === 'restore_purchases' ? 'Restore Purchases' : 'Buy'}
                      </Button>
                    );
                  }
                })()}
                
                {/* Счетчик времени для недельной подписки */}
                {isPremium && item.id === 'premium_weekly' && premiumTimeLeft && (
                  <div className="text-center space-y-1">
                    <div className="text-xs text-yellow-400 font-semibold">
                      Time left: {premiumTimeLeft}
                    </div>
                    <Progress 
                      value={premiumProgress} 
                      className="h-1 w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>



    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/30 p-3">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-purple-500/30">
          <TabsTrigger 
            value="boosters" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-300"
          >
            <Zap className="w-4 h-4 mr-2" />
            Boosters
          </TabsTrigger>
          <TabsTrigger 
            value="rewards" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-300"
          >
            <Gift className="w-4 h-4 mr-2" />
            Rewards
          </TabsTrigger>
          <TabsTrigger 
            value="store" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-300"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Store
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="boosters" className="mt-4">
          {renderBoostersTab()}
        </TabsContent>
        
        <TabsContent value="rewards" className="mt-4">
          {renderRewardsTab()}
        </TabsContent>
        
        <TabsContent value="store" className="mt-4">
          {renderStoreTab()}
        </TabsContent>
      </Tabs>
    </Card>
  );
}