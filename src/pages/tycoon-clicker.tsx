import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useGameState } from "@/hooks/useGameState";
import { useAdRewards } from "@/hooks/useAdRewards";
import { StatsHeader } from "@/components/StatsHeader";
import { ClickButton } from "@/components/ClickButton";
import { InvestmentCard } from "@/components/InvestmentCard";
import { NavigationBar } from "@/components/NavigationBar";
import { UnifiedBoosterStore } from "@/components/UnifiedBoosterStore";
import { AdMobBanner } from "@/components/AdMobBanner";
import { AdBanner } from "@/components/AdBanner";
import { ProductionAdBanner } from "@/components/ProductionAdBanner";
import { adjustService } from "@/lib/adjust";
import { adMobService } from "@/lib/admob";
import { appsFlyerService } from "@/lib/appsflyer";
import { appMetricaService } from "@/lib/appmetrica";
import { trackEvent, trackInvestment, trackPurchase, trackLevelUp } from "@/lib/analytics";
import { SimpleTradingSection } from "@/components/sections/SimpleTradingSection";
import { InvestmentsSection } from "@/components/sections/InvestmentsSection";
import { BusinessSection } from "@/components/sections/BusinessSection";
import { CasinoSection } from "@/components/sections/CasinoSection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/gameData";
import { useTranslation, getLanguageFlag, getLanguageName, type Language } from "@/lib/i18n";
import { useTransactionHistory } from "@/components/TransactionHistory";
import { useNotifications } from "@/components/NotificationSystem";
import { SettingsModal } from "@/components/SettingsModalNew";
import { ConsentManager } from "@/components/ConsentManager";
import { FirebaseGameService } from "@/services/firebase";
import { useAuth } from "@/hooks/useAuth";
import { FirebaseAuth } from "@/components/FirebaseAuth";
import { AchievementCelebration } from "@/components/AchievementCelebration";
import { LevelUpCelebration } from "@/components/LevelUpCelebration";
import { inAppPurchaseService } from "@/services/InAppPurchaseService";
import { trackAllAnalytics, AnalyticsEvents } from "@/lib/analytics-universal";

import { ACHIEVEMENTS, getCompletedAchievements, getNextAchievement } from "@/data/achievements";

import { Volume2, Vibrate, RotateCcw, Globe, Play, Cloud, Shield, Settings } from "lucide-react";
import { vibrationService } from "@/lib/vibration";
import { useLocation } from "wouter";

export default function TycoonClicker() {
  const { 
    gameState, 
    setGameState,
    handleClick, 
    buyInvestment, 
    sellInvestment, 
    quickBuyAsset, 
    quickSellAsset, 
    activateBooster, 
    buyBusiness, 
    upgradeBusiness, 
    sellBusiness,
    portfolioValue, 
    checkPremiumStatus,
    purchasePremium,
    ASSETS, 
    ACHIEVEMENTS 
  } = useGameState();
  const { t, language } = useTranslation();
  const { transactions, addTransaction } = useTransactionHistory();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const adRewards = useAdRewards();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(() => {
    const savedPremiumType = localStorage.getItem('premium-type');
    const testModeActive = localStorage.getItem('premium-test-mode') === 'enabled';
    return (savedPremiumType === 'lifetime' || savedPremiumType === 'weekly') && !testModeActive;
  });

  // Achievement system state
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  const [completedAchievements, setCompletedAchievements] = useState<string[]>([]);
  
  // Level up celebration state
  const [levelUpData, setLevelUpData] = useState<{level: number; bonus: number; newClickValue: number} | null>(null);
  // Показываем LevelUpCelebration только один раз для каждого уровня
  const lastCelebratedLevelRef = useRef<number | null>(null);

  // Initialize premium status from localStorage
  useEffect(() => {
    const savedPremiumStatus = localStorage.getItem('premium-status');
    const savedPremiumType = localStorage.getItem('premium-type') as 'weekly' | 'lifetime' | null;
    
    if (savedPremiumStatus === 'true' && savedPremiumType) {
      // Restore premium status in game state
      setGameState(prev => ({
        ...prev,
        isPremium: true,
        premiumType: savedPremiumType,
        premiumExpiry: savedPremiumType === 'weekly' ? Date.now() + (7 * 24 * 60 * 60 * 1000) : undefined
      }));
      console.log(`🔄 Premium ${savedPremiumType} status restored from localStorage`);
    }
  }, [setGameState]);

  // Listen for premium status changes
  useEffect(() => {
    const handlePremiumChange = () => {
      const savedPremiumType = localStorage.getItem('premium-type');
      const testModeActive = localStorage.getItem('premium-test-mode') === 'enabled';
      const newPremiumStatus = (savedPremiumType === 'lifetime' || savedPremiumType === 'weekly') && !testModeActive;
      console.log('🔍 Ad Banner Check:', { savedPremiumType, testModeActive, newPremiumStatus });
      setIsPremium(newPremiumStatus);
    };

    // Проверяем статус сразу
    handlePremiumChange();

    window.addEventListener('premiumStatusChanged', handlePremiumChange);
    
    return () => {
      window.removeEventListener('premiumStatusChanged', handlePremiumChange);
    };
  }, []);

  // Загружаем список завершённых ачивок из localStorage при первом запуске
  useEffect(() => {
    const saved = localStorage.getItem('completedAchievements');
    if (saved) {
      setCompletedAchievements(JSON.parse(saved));
    }
  }, []);

  // Track achievements (проверка новых достижений)
  useEffect(() => {
    const checkNewAchievements = () => {
      // Достижения активируются только с уровня 2
      if (gameState.level < 2) {
        console.log('🎊 Achievement система отключена для игрока уровня 1: упрощенный режим');
        return;
      }

      const newCompleted = getCompletedAchievements();
      const newAchievementIds = newCompleted.map(a => a.id);
      // Find newly completed achievements
      const freshAchievements = newCompleted.filter(achievement => 
        !completedAchievements.includes(achievement.id)
      );
      if (freshAchievements.length > 0) {
        // Show the first new achievement
        const latestAchievement = freshAchievements[0];
        setCurrentAchievement(latestAchievement);
        // Add achievement reward to balance
        setGameState(prev => ({
          ...prev,
          balance: prev.balance + latestAchievement.reward
        }));
        // Update completed achievements list
        setCompletedAchievements(newAchievementIds);
        // Сохраняем в localStorage, чтобы не показывать повторно
        localStorage.setItem('completedAchievements', JSON.stringify(newAchievementIds));
        console.log(`🏆 New Achievement: ${latestAchievement.name} - $${latestAchievement.reward} reward!`);
      }
    };
    checkNewAchievements();
  }, [gameState.balance, gameState.totalClicks, gameState.level, gameState.passiveIncome, completedAchievements]);

  // Handle achievement celebration completion
  const handleAchievementComplete = () => {
    setCurrentAchievement(null);
    // После показа — сбрасываем currentAchievement, чтобы не повторять при следующем рендере
  };

  // Handle level up celebration completion
  const handleLevelUpComplete = () => {
    setLevelUpData(null);
  };

  // Track level changes for celebration
  useEffect(() => {
    if (
      gameState.level > 1 &&
      gameState.level > (lastCelebratedLevelRef.current || 1)
    ) {
      // Calculate level up bonus (same logic as в useGameState)
      const levelUpBonus = 50 * Math.pow(1.5, gameState.level - 1);
      setLevelUpData({
        level: gameState.level,
        bonus: levelUpBonus,
        newClickValue: gameState.clickValue
      });
      lastCelebratedLevelRef.current = gameState.level;
    }
  }, [gameState.level, gameState.clickValue]);

  // Функция для изменения навигации с автоматическим закрытием настроек
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Функция для разворачивания хедера и перехода на главную
  const handleExpandHome = () => {
    setActiveSection('home');
    if (settingsOpen) {
      setSettingsOpen(false);
    }
  };

  
  // Настройки звука и вибрации
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('tycoon-sound') !== 'false';
  });
  const [vibrateEnabled, setVibrateEnabled] = useState(() => {
    return vibrationService.isVibrationEnabled();
  });

  // Consent management
  const handleConsentUpdate = (consents: any) => {
    adjustService.setEnabled(consents.analytics);
    adMobService.setConsentStatus(consents.advertising);
    console.log('Privacy settings updated:', consents);
  };

  // Portfolio calculation functions
  const getPortfolioValue = () => portfolioValue;
  
  const getBusinessValue = () => {
    return Object.entries(gameState.businesses).reduce((total, [businessId, business]) => {
      if (business?.owned) {
        return total + 50000; // Средняя стоимость бизнеса
      }
      return total;
    }, 0);
  };
  
  const getTotalNetWorth = () => {
    return gameState.balance + portfolioValue + getBusinessValue();
  };

  // Enhanced purchase logging for investments
  const handleQuickBuyAssetLogged = (assetId: string) => {
    const result = quickBuyAsset(assetId, 1);
    if (result !== undefined) {
      console.log(`💼 Купил акцию: ${assetId}`);
      vibrationService.vibrateSuccess();
    }
    return result;
  };

  // Business functions with transaction logging
  const handleBuyBusiness = (businessId: string) => {
    import('@/data/businesses').then(({ getBusinessById }) => {
      const business = getBusinessById(businessId);
      if (business && gameState.balance >= business.basePrice) {
        buyBusiness(businessId);
        
        // Записываем транзакцию в историю
        addTransaction({
          type: 'business',
          amount: -business.basePrice,
          description: `Купил бизнес ${business.name}`,
          source: 'business_purchase',
          details: {
            businessId,
            businessName: business.name,
            action: 'buy'
          }
        });
      }
    });
  };
  
  const handleUpgradeBusiness = (businessId: string, upgradeId: string) => {
    import('@/data/businesses').then(({ getBusinessById }) => {
      const business = getBusinessById(businessId);
      if (business) {
        const upgrade = business.upgrades.find(u => u.id === upgradeId);
        if (upgrade && gameState.balance >= upgrade.cost) {
          upgradeBusiness(businessId, upgradeId);
          
          // Записываем транзакцию в историю
          addTransaction({
            type: 'business',
            amount: -upgrade.cost,
            description: `Улучшение: ${business.name}`,
            source: 'business_upgrade',
            details: {
              businessId,
              businessName: business.name,
              upgradeId,
              upgradeName: upgrade.name,
              action: 'upgrade'
            }
          });
        }
      }
    });
  };
  
  const handleSellBusiness = (businessId: string) => {
    import('@/data/businesses').then(({ getBusinessById }) => {
      const business = getBusinessById(businessId);
      if (business) {
        const sellPrice = Math.floor(business.basePrice * 0.7);
        sellBusiness(businessId);
        
        // Записываем транзакцию в историю
        addTransaction({
          type: 'business',
          amount: sellPrice,
          description: `Продал бизнес ${business.name}`,
          source: 'business_sale',
          details: {
            businessId,
            businessName: business.name,
            sellPrice,
            action: 'sell'
          }
        });
      }
    });
  };
  




  // Полноэкранная видео реклама для обычных пользователей
  const showFullVideoAd = async (rewardId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Создаем полноэкранный блок с видео рекламой
      const adOverlay = document.createElement('div');
      adOverlay.className = 'fixed inset-0 bg-black z-[9999] flex items-center justify-center';
      adOverlay.style.zIndex = '10000';
      
      let adDuration = 30; // 30 секунд полная реклама
      let timeLeft = adDuration;
      
      adOverlay.innerHTML = `
        <div class="relative w-full h-full bg-black flex flex-col items-center justify-center">
          <!-- Fake video placeholder -->
          <div class="w-full h-full bg-gradient-to-br from-red-900 to-purple-900 flex items-center justify-center relative">
            <div class="text-center text-white">
              <div class="text-6xl mb-4">📺</div>
              <div class="text-2xl font-bold mb-2">Video Advertisement</div>
              <div class="text-lg opacity-75">Rewarded Ad for ${rewardId}</div>
              <div class="mt-8 text-4xl font-mono" id="ad-timer">${timeLeft}s</div>
            </div>
            
            <!-- Прогресс бар -->
            <div class="absolute bottom-0 left-0 right-0 h-2 bg-gray-800">
              <div class="h-full bg-red-500 transition-all duration-1000" id="ad-progress" style="width: 0%"></div>
            </div>
            
            <!-- Кнопка закрытия (появляется в конце) -->
            <button 
              id="close-ad-btn" 
              class="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded font-bold opacity-30 cursor-not-allowed"
              style="display: none;"
            >
              ✕ Close
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(adOverlay);
      
      const timer = setInterval(() => {
        timeLeft--;
        const timerElement = document.getElementById('ad-timer');
        const progressElement = document.getElementById('ad-progress');
        const closeBtn = document.getElementById('close-ad-btn');
        
        if (timerElement) {
          timerElement.textContent = `${timeLeft}s`;
        }
        
        if (progressElement) {
          const progress = ((adDuration - timeLeft) / adDuration) * 100;
          progressElement.style.width = `${progress}%`;
        }
        
        // Показываем кнопку закрытия только в последние 5 секунд
        if (timeLeft <= 5 && closeBtn) {
          closeBtn.style.display = 'block';
          closeBtn.className = 'absolute top-4 right-4 bg-white text-black px-4 py-2 rounded font-bold hover:bg-gray-200 cursor-pointer';
          closeBtn.onclick = () => {
            clearInterval(timer);
            document.body.removeChild(adOverlay);
            resolve();
          };
        }
        
        if (timeLeft <= 0) {
          clearInterval(timer);
          document.body.removeChild(adOverlay);
          resolve();
        }
      }, 1000);
      
      // Предотвращаем закрытие по ESC или клику вне рекламы
      const preventClose = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      document.addEventListener('keydown', preventClose);
      
      // Убираем обработчик после закрытия рекламы
      const originalResolve = resolve;
      resolve = () => {
        document.removeEventListener('keydown', preventClose);
        originalResolve();
      };
    });
  };

  // Ad Rewards System with premium/regular user differentiation
  const handleWatchAd = async (rewardId: string) => {
    // Отслеживаем начало просмотра рекламы в Adjust
    adjustService.trackAdWatched('rewarded', rewardId);
    
    try {
      // Проверяем тестовый режим - если премиум отключен для тестирования
      const testModeDisabled = localStorage.getItem('premium-test-mode') === 'disabled';
      const isPremiumUser = !testModeDisabled && (gameState.isPremium || gameState.premiumType === 'lifetime' || gameState.premiumType === 'weekly');
      
      if (isPremiumUser) {
        // Премиум пользователи могут пропустить рекламу
        console.log('💎 Premium user: Skipping ad for', rewardId);
        await new Promise(resolve => setTimeout(resolve, 500)); // Быстрая активация
      } else {
        // Обычные пользователи смотрят полную непропускаемую рекламу
        console.log('🎬 Regular user: Showing full ad for', rewardId);
        await showFullVideoAd(rewardId);
      }
      
      const adResult = { success: true, premium: isPremiumUser };
      
      if (adResult.success) {
        // Track ad revenue in both analytics platforms
        const adRevenue = 0.25; // Typical rewarded ad revenue
        appsFlyerService.trackAdRevenue('rewarded', adRevenue);
        appMetricaService.trackAdRevenue('rewarded', adRevenue);
        
        // Прямая активация наград без внешних зависимостей
        let rewardApplied = false;
        let rewardMessage = '';
        
        if (rewardId === 'mega_multiplier') {
          activateBooster('mega_income');
          rewardMessage = 'Mega Multiplier: x5 income for 2 minutes!';
          rewardApplied = true;
        } else if (rewardId === 'golden_touch') {
          activateBooster('golden_click');
          rewardMessage = 'Golden Touch: x10 click value for 2 minutes!';
          rewardApplied = true;
        } else if (rewardId === 'auto_clicker') {
          activateBooster('auto_click');
          rewardMessage = 'Auto Clicker activated for 60 seconds!';
          rewardApplied = true;
        } else if (rewardId === 'money_rain') {
          const bonusMoney = 10000;
          setGameState(prev => ({
            ...prev,
            balance: prev.balance + bonusMoney
          }));
          rewardMessage = `Money Rain: +$${bonusMoney.toLocaleString()}!`;
          rewardApplied = true;
        } else if (rewardId === 'income_boost') {
          activateBooster('income_boost');
          rewardMessage = 'Income Boost: x3 passive income for 5 minutes!';
          rewardApplied = true;
        } else if (rewardId === 'time_warp') {
          activateBooster('time_speed');
          rewardMessage = 'Time Warp: x2 passive income speed for 2 minutes!';
          rewardApplied = true;
        } else if (rewardId === 'reset_mega') {
          setGameState(prev => ({
            ...prev,
            rewardCooldowns: {
              ...prev.rewardCooldowns,
              mega_multiplier: 0
            }
          }));
          rewardMessage = 'Mega Multiplier cooldown reset!';
          rewardApplied = true;
        } else if (rewardId === 'reset_golden') {
          setGameState(prev => ({
            ...prev,
            rewardCooldowns: {
              ...prev.rewardCooldowns,
              golden_touch: 0
            }
          }));
          rewardMessage = 'Golden Touch cooldown reset!';
          rewardApplied = true;
        } else if (rewardId === 'reset_time') {
          setGameState(prev => ({
            ...prev,
            rewardCooldowns: {
              ...prev.rewardCooldowns,
              time_warp: 0
            }
          }));
          rewardMessage = 'Time Warp cooldown reset!';
          rewardApplied = true;
        } else if (rewardId === 'reset_all') {
          setGameState(prev => ({
            ...prev,
            rewardCooldowns: {}
          }));
          rewardMessage = 'All reward cooldowns have been reset!';
          rewardApplied = true;
        } else if (rewardId === 'booster_reset') {
          // Сброс всех активных бустеров и их кулдаунов
          setGameState(prev => ({
            ...prev,
            activeBoosters: {},
            // Сбрасываем кулдауны всех бустеров
            rewardCooldowns: {
              ...prev.rewardCooldowns,
              mega_multiplier: 0,
              golden_touch: 0,
              time_warp: 0
            }
          }));
          
          // Очищаем локальное хранилище бустеров
          localStorage.removeItem('tycoon-boosters');
          
          rewardMessage = 'All active boosters cancelled and cooldowns reset!';
          rewardApplied = true;
        } else if (rewardId === 'undo_action') {
          // Отмена последнего действия - возврат 50% последней покупки
          if (gameState.balance > 100) {
            const refundAmount = Math.floor(gameState.balance * 0.1); // 10% от текущего баланса как "возврат"
            setGameState(prev => ({
              ...prev,
              balance: prev.balance + refundAmount
            }));
            rewardMessage = `Refunded $${refundAmount.toLocaleString()} from recent actions`;
            rewardApplied = true;
          } else {
            rewardMessage = 'No significant actions to undo';
            rewardApplied = true;
          }
        } else if (rewardId === 'reset_progress_ad') {
          // Сброс всего прогресса игры
          const confirmed = window.confirm('Are you sure you want to reset all progress? This action cannot be undone!');
          if (confirmed) {
            setGameState({
              balance: 0,
              xp: 0,
              level: 1,
              maxXp: 1000,
              clickValue: 1,
              passiveIncome: 0,
              totalClicks: 0,
              investments: {},
              achievements: [],
              rewardCooldowns: {},
              activeBoosters: {},
              businesses: {}
            });
            rewardMessage = 'Game progress has been reset!';
            rewardApplied = true;
          } else {
            rewardMessage = 'Progress reset cancelled';
            rewardApplied = true;
          }
        }

        if (rewardApplied) {
          // Устанавливаем кулдаун для награды (для всех пользователей, кроме сброса кулдауна)
          if (!rewardId.startsWith('reset_')) {
            setGameState(prev => ({
              ...prev,
              rewardCooldowns: {
                ...prev.rewardCooldowns,
                [rewardId]: Date.now()
              }
            }));
            console.log('⏰ Cooldown applied for', rewardId);
          }
          
          console.log(`✅ Reward ${rewardId} activated successfully`);
          
          addNotification({
            type: 'success',
            title: 'Reward Received!',
            message: rewardMessage,
            duration: 4000
          });
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Реклама недоступна',
          message: 'Попробуйте позже',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Ad watch error:', error);
      addNotification({
        type: 'error',
        title: 'Ошибка показа рекламы',
        message: 'Проверьте подключение к интернету',
        duration: 3000
      });
    }
  };

  // Система покупок (монетизация)
  const handlePurchase = async (purchaseType: string, value?: number) => {
    console.log('🛒 Purchase:', purchaseType, 'value:', value);
    
    // Специальная обработка для booster_reset
    if (purchaseType === 'booster_reset') {
      console.log('🔄 Processing booster_reset - special handler');
      // Сброс всех активных бустеров и их кулдаунов
      setGameState(prev => ({
        ...prev,
        activeBoosters: {},
        // Сбрасываем кулдауны всех бустеров, но устанавливаем кулдаун для самого booster_reset
        rewardCooldowns: {
          ...prev.rewardCooldowns,
          mega_multiplier: 0,
          golden_touch: 0,
          time_warp: 0,
          auto_clicker: 0,
          money_rain: 0,
          income_boost: 0,
          undo_action: 0,
          booster_reset: Date.now() // Устанавливаем кулдаун на 10 минут для booster_reset
        }
      }));
      
      // Очищаем локальное хранилище бустеров
      localStorage.removeItem('tycoon-boosters');
      
      addNotification({
        type: 'success',
        title: 'Boosters Reset!',
        message: 'All active boosters cancelled and cooldowns reset!',
        duration: 4000
      });

      addTransaction({
        type: 'investment',
        amount: 0,
        description: 'Reset all boosters and cooldowns',
        source: 'premium_reward'
      });
      
      console.log('✅ Booster reset completed successfully');
      return; // Выходим из функции
    }

    // Валютные пакеты
    if (purchaseType.startsWith('currency_')) {
      if (value) {
        setGameState(prev => ({
          ...prev,
          balance: prev.balance + value
        }));
        
        addNotification({
          type: 'success',
          title: '💰 Purchase successful!',
          message: `Received $${formatNumber(value)}`,
          duration: 5000
        });

        addTransaction({
          type: 'investment',
          amount: value,
          description: `Currency purchase: $${formatNumber(value)}`,
          source: 'store_purchase'
        });
      }
    }

    // Бустеры
    else if (purchaseType.startsWith('booster_')) {
      const now = Date.now();
      let boosterName = '';
      let duration = value || 3600; // 1 час по умолчанию
      
      if (purchaseType === 'booster_click_2x') {
        boosterName = 'Двойной клик';
        activateBooster('click_multiplier');
      } else if (purchaseType === 'booster_income_3x') {
        boosterName = 'Тройной доход';
        duration = 7200; // 2 часа
        activateBooster('income_multiplier');
      } else if (purchaseType === 'booster_mega') {
        boosterName = 'Мега-бустер';
        duration = 1800; // 30 минут
        activateBooster('mega_multiplier');
      }

      addNotification({
        type: 'success',
        title: '⚡ Бустер активирован!',
        message: `${boosterName} на ${Math.floor(duration/60)} минут`,
        duration: 5000
      });

      addTransaction({
        type: 'investment',
        amount: 0,
        description: `Активирован бустер: ${boosterName}`,
        source: 'store_purchase'
      });
    }

    // Премиум покупки
    else if (purchaseType === 'remove_ads' || purchaseType === 'premium_full' || purchaseType === 'premium_weekly' || purchaseType === 'premium_lifetime') {
      let message = '';
      let premiumType: 'weekly' | 'lifetime' = 'lifetime';
      let expiry: number | 'lifetime' = 'lifetime';
      if (purchaseType === 'premium_weekly') {
        message = 'Premium activated for 7 days! Ads removed, exclusive features unlocked!';
        premiumType = 'weekly';
        // Покупка через IAP сервис
        const result = await inAppPurchaseService.purchasePremium('weekly');
        expiry = result.expiry || (Date.now() + 7 * 24 * 60 * 60 * 1000);
      } else {
        message = 'Premium activated FOREVER! All ads removed, premium dashboard unlocked!';
        premiumType = 'lifetime';
        await inAppPurchaseService.purchasePremium('lifetime');
        expiry = 'lifetime';
      }
      
      // Обновляем локальное состояние
      setIsPremium(true);
      localStorage.setItem('premium-status', 'true');
      localStorage.setItem('premium-type', premiumType);
      
      // Сохраняем покупку в Firebase (облачное хранилище)
      if (user) {
        const purchaseData = {
          type: premiumType,
          transactionId: `web_${Date.now()}_${user.uid}`,
          purchaseDate: new Date().toISOString(),
          platform: 'web' as const,
          price: premiumType === 'weekly' ? 4.99 : 14.99,
          currency: 'USD'
        };
        
        FirebaseGameService.savePurchase(user.uid, purchaseData).catch(error => {
          console.error('Failed to save purchase to cloud:', error);
        });
        
        localStorage.setItem('premium-purchase-date', purchaseData.purchaseDate);
        localStorage.setItem('premium-transaction-id', purchaseData.transactionId);
        console.log(`☁️ Premium ${premiumType} purchase saved to cloud`);
      }
      
      // Форсируем обновление состояния игры
      setGameState(prev => ({
        ...prev,
        isPremium: true,
        premiumType: premiumType,
        premiumExpiry: premiumType === 'weekly' ? Date.now() + (7 * 24 * 60 * 60 * 1000) : undefined
      }));
      
      console.log(`✅ Premium ${premiumType} successfully activated!`);
      
      addNotification({
        type: 'success',
        title: '👑 Premium Activated!',
        message: message,
        duration: 8000
      });

      addTransaction({
        type: 'investment',
        amount: 0,
        description: purchaseType === 'premium_weekly' ? 'Weekly Premium ($4.99)' : 
                    purchaseType === 'premium_lifetime' ? 'Lifetime Premium ($14.99)' :
                    purchaseType === 'premium_full' ? 'Premium Package' : 'Remove Ads',
        source: 'store_purchase'
      });
      
      // Принудительно обновляем компоненты рекламы
      window.dispatchEvent(new CustomEvent('premiumStatusChanged'));
      
      console.log('🎉 Premium status activated - ads should now be hidden!');
    }



    // Обработка наград за просмотр рекламы (для премиум пользователей)
    else if (['mega_multiplier', 'golden_touch', 'auto_clicker', 'money_rain', 'income_boost', 'time_warp', 'undo_action', 'reset_progress_ad', 'booster_reset'].includes(purchaseType)) {
      let rewardApplied = false;
      let rewardMessage = '';
      
      if (purchaseType === 'mega_multiplier') {
        activateBooster('mega_income');
        rewardMessage = 'Mega Multiplier: x5 income for 2 minutes!';
        rewardApplied = true;
      } else if (purchaseType === 'golden_touch') {
        activateBooster('golden_click');
        rewardMessage = 'Golden Touch: x10 click value for 2 minutes!';
        rewardApplied = true;
      } else if (purchaseType === 'auto_clicker') {
        activateBooster('auto_click');
        rewardMessage = 'Auto Clicker activated for 60 seconds!';
        rewardApplied = true;
      } else if (purchaseType === 'money_rain') {
        const bonusMoney = 10000;
        setGameState(prev => ({
          ...prev,
          balance: prev.balance + bonusMoney
        }));
        rewardMessage = `Money Rain: +$${bonusMoney.toLocaleString()}!`;
        rewardApplied = true;
      } else if (purchaseType === 'income_boost') {
        activateBooster('income_boost');
        rewardMessage = 'Income Boost: x3 passive income for 5 minutes!';
        rewardApplied = true;
      } else if (purchaseType === 'time_warp') {
        activateBooster('time_speed');
        rewardMessage = 'Time Warp: x2 passive income speed for 2 minutes!';
        rewardApplied = true;
      } else if (purchaseType === 'undo_action') {
        if (gameState.balance > 100) {
          const refundAmount = Math.floor(gameState.balance * 0.1);
          setGameState(prev => ({
            ...prev,
            balance: prev.balance + refundAmount
          }));
          rewardMessage = `Refunded $${refundAmount.toLocaleString()} from recent actions`;
          rewardApplied = true;
        } else {
          rewardMessage = 'No significant actions to undo';
          rewardApplied = true;
        }
      } else if (purchaseType === 'reset_progress_ad') {
        // Для сброса прогресса требуется подтверждение
        if (confirm('Are you sure you want to reset your game progress? This action cannot be undone!')) {
          setGameState({
            balance: 0,
            clickValue: 1,
            level: 1,
            experience: 0,
            experienceToNext: 100,
            achievements: [],
            activeBoosters: {},
            rewardCooldowns: {},
            investments: {},
            isPremium: gameState.isPremium,
            premiumType: gameState.premiumType,
            premiumExpiry: gameState.premiumExpiry
          });
          rewardMessage = 'Game progress has been reset!';
          rewardApplied = true;
        } else {
          rewardMessage = 'Progress reset cancelled';
          rewardApplied = true;
        }
      } else if (purchaseType === 'booster_reset') {
        console.log('🔄 Processing booster_reset in handlePurchase');
        // Сброс всех активных бустеров и их кулдаунов
        setGameState(prev => ({
          ...prev,
          activeBoosters: {},
          // Сбрасываем кулдауны всех бустеров
          rewardCooldowns: {
            ...prev.rewardCooldowns,
            mega_multiplier: 0,
            golden_touch: 0,
            time_warp: 0,
            auto_clicker: 0,
            money_rain: 0,
            income_boost: 0,
            undo_action: 0
          }
        }));
        
        // Очищаем локальное хранилище бустеров
        localStorage.removeItem('tycoon-boosters');
        
        rewardMessage = 'All active boosters cancelled and cooldowns reset!';
        rewardApplied = true;
        console.log('✅ Booster reset completed successfully');
      } else if (purchaseType === 'restore_purchases') {
        // Восстановление покупок из облачного хранилища
        if (user) {
          try {
            const restoreResult = await FirebaseGameService.restorePurchases(user.uid);
            if (restoreResult.success) {
              setIsPremium(true);
              setGameState(prev => ({
                ...prev,
                isPremium: true,
                premiumType: restoreResult.type,
                premiumExpiry: restoreResult.type === 'weekly' ? Date.now() + (7 * 24 * 60 * 60 * 1000) : undefined
              }));
              
              rewardMessage = `Premium ${restoreResult.type} status restored from cloud!`;
              rewardApplied = true;
              
              // Перезагружаем страницу для полного применения изменений
              setTimeout(() => window.location.reload(), 2000);
            } else {
              rewardMessage = restoreResult.message || 'No purchases found to restore';
              rewardApplied = true;
            }
          } catch (error) {
            console.error('❌ Failed to restore purchases:', error);
            rewardMessage = 'Failed to connect to cloud storage. Please try again later.';
            rewardApplied = true;
          }
        } else {
          rewardMessage = 'Please sign in to restore purchases from cloud';
          rewardApplied = true;
        }
      }

      if (rewardApplied) {
        // Устанавливаем кулдаун для награды (для всех пользователей, кроме сброса кулдауна)
        if (!purchaseType.startsWith('reset_')) {
          setGameState(prev => ({
            ...prev,
            rewardCooldowns: {
              ...prev.rewardCooldowns,
              [purchaseType]: Date.now()
            }
          }));
          console.log('⏰ Cooldown applied for', purchaseType);
        }
        
        console.log(`✅ Premium reward ${purchaseType} activated successfully`);
        
        addNotification({
          type: 'success',
          title: 'Premium Reward!',
          message: rewardMessage,
          duration: 4000
        });

        addTransaction({
          type: 'investment',
          amount: 0,
          description: `Premium activation: ${rewardMessage}`,
          source: 'premium_reward'
        });
      }
    }
  };

  // Casino functions
  const handleUpdateBalance = (newBalance: number) => {
    // Обновляем баланс в состоянии игры
    setGameState((prev: any) => {
      const newState = { ...prev, balance: newBalance };
      
      // Force save balance changes from casino
      setTimeout(() => {
        localStorage.setItem('tycoon-clicker-save', JSON.stringify(newState));
        console.log('✅ Casino balance saved forcefully:', newBalance);
      }, 50);
      
      return newState;
    });
    console.log('Balance updated to:', newBalance);
  };
  
  // Trading functions - special logic for trading section
  const handleBuyAsset = (assetId: string, quantity: number = 1) => {
    console.log('Asset purchase:', assetId, 'quantity:', quantity);
    
    // Determine price for each asset
    let price = 0;
    // Main assets
    if (assetId === 'apple') {
      price = 195; // Apple base price
    } else if (assetId === 'tesla') {
      price = 248; // Tesla base price  
    } else if (assetId === 'btc-separate') {
      price = 67500; // Bitcoin base price
    } else if (assetId === 'eth-separate') {
      price = 3450; // Ethereum base price
    } 
    // Акции
    else if (assetId === 'msft') {
      price = 420; // Microsoft base price
    } else if (assetId === 'googl') {
      price = 165; // Google base price
    } else if (assetId === 'amzn') {
      price = 180; // Amazon base price
    } else if (assetId === 'nvda') {
      price = 875; // Nvidia base price
    } else if (assetId === 'jpm') {
      price = 190; // JP Morgan base price
    } else if (assetId === 'brk') {
      price = 545000; // Berkshire base price
    } else if (assetId === 'ko') {
      price = 68; // Coca-Cola base price
    } else if (assetId === 'pg') {
      price = 156; // P&G base price
    } else if (assetId === 'jnj') {
      price = 155; // Johnson & Johnson base price
    }
    // Commodities
    else if (assetId === 'oil') {
      price = 73; // Oil base price
    } else if (assetId === 'gold') {
      price = 2045; // Gold base price
    } else if (assetId === 'silver') {
      price = 26; // Silver base price
    } else if (assetId === 'platinum') {
      price = 950; // Platinum base price
    } else if (assetId === 'uranium') {
      price = 2500000; // Uranium base price
    }
    
    // Используем quickBuyAsset для корректного обновления состояния
    if (price > 0 && gameState.balance >= price) {
      quickBuyAsset(assetId, price);
      
      // Добавляем транзакцию в историю
      const assetNames: Record<string, string> = {
        'apple': 'Tiple Technologies',
        'tesla': 'Desla Motors',
        'btc-separate': 'Bitcoin',
        'eth-separate': 'Ethereum',
        'ko': 'Coca-Cola',
        'pg': 'Procter & Gamble',
        'jnj': 'Johnson & Johnson',
        'oil': 'Crude Oil',
        'gold': 'Gold',
        'silver': 'Silver',
        'platinum': 'Platinum',
        'uranium': 'Uranium'
      };
      
      addTransaction({
        type: 'investment',
        amount: -price,
        description: `Bought stock ${assetNames[assetId] || assetId}`,
        source: 'Trading'
      });
      
      // Track investment in Vercel Analytics
      trackInvestment(assetId, price);
      
      console.log('✅ Purchase successful:', assetId, 'price:', price);
    } else {
      console.log('❌ Insufficient funds for purchase:', assetId, 'need:', price, 'have:', gameState.balance);
    }
  };

  const handleSellAsset = (assetId: string, quantity: number = 1) => {
    console.log('handleSellAsset вызвана с:', assetId, quantity);
    
    // Определяем цену для каждого актива (текущая рыночная цена)
    let price = 0;
    // Основные активы
    if (assetId === 'apple') {
      price = 195; // Apple price
    } else if (assetId === 'tesla') {
      price = 248; // Tesla price
    } else if (assetId === 'btc-separate') {
      price = 67500; // Bitcoin price
    } else if (assetId === 'eth-separate') {
      price = 3450; // Ethereum price
    } 
    // Акции
    else if (assetId === 'msft') {
      price = 420; // Microsoft price
    } else if (assetId === 'googl') {
      price = 165; // Google price
    } else if (assetId === 'amzn') {
      price = 180; // Amazon price
    } else if (assetId === 'nvda') {
      price = 875; // Nvidia price
    } else if (assetId === 'jpm') {
      price = 190; // JP Morgan price
    } else if (assetId === 'brk') {
      price = 545000; // Berkshire price
    } else if (assetId === 'ko') {
      price = 68; // Coca-Cola price
    } else if (assetId === 'pg') {
      price = 156; // P&G price
    } else if (assetId === 'jnj') {
      price = 155; // Johnson & Johnson price
    }
    // Commodities
    else if (assetId === 'oil') {
      price = 73; // Oil price
    } else if (assetId === 'gold') {
      price = 2045; // Gold price
    } else if (assetId === 'silver') {
      price = 26; // Silver price
    } else if (assetId === 'platinum') {
      price = 950; // Platinum price
    } else if (assetId === 'uranium') {
      price = 2500000; // Uranium price
    }
    
    // Используем quickSellAsset для корректного обновления состояния
    const currentQuantity = gameState.investments[assetId] || 0;
    
    // Проверяем, есть ли у игрока активы для продажи
    if (currentQuantity > 0 && price > 0) {
      quickSellAsset(assetId, price);
      
      // Добавляем транзакцию в историю
      const assetNames: Record<string, string> = {
        'apple': 'Tiple Technologies',
        'tesla': 'Desla Motors',
        'btc-separate': 'Bitcoin',
        'eth-separate': 'Ethereum',
        'ko': 'Coca-Cola',
        'pg': 'Procter & Gamble',
        'jnj': 'Johnson & Johnson',
        'oil': 'Crude Oil',
        'gold': 'Gold',
        'silver': 'Silver',
        'platinum': 'Platinum',
        'uranium': 'Uranium'
      };
      
      addTransaction({
        type: 'investment',
        amount: price,
        description: `Sold stock ${assetNames[assetId] || assetId}`,
        source: 'Trading'
      });
      
      console.log('✅ Sale successful:', assetId, 'price:', price);
    } else {
      console.log('❌ Insufficient assets for sale:', assetId, 'have:', currentQuantity, 'need:', quantity);
    }
  };

  const getAssetsByCategory = (category: string) => {
    return ASSETS.filter(asset => asset.category === category);
  };

  const getCompletedAchievements = () => {
    return ACHIEVEMENTS.filter(achievement => gameState.achievements.includes(achievement.id));
  };

  const getPendingAchievements = () => {
    return ACHIEVEMENTS.filter(achievement => !gameState.achievements.includes(achievement.id));
  };

  const renderHomeSection = () => (
    <div className="space-y-6">
      <ClickButton onClick={handleClick} clickValue={gameState.clickValue} />
      
      {/* Unified Booster Store with Three Tabs */}
      <UnifiedBoosterStore 
        gameState={gameState} 
        onWatchAd={handleWatchAd}
        onPurchase={handlePurchase}
        isPremium={(() => {
          const testModeDisabled = localStorage.getItem('premium-test-mode') === 'disabled';
          const savedPremiumStatus = localStorage.getItem('premium-status');
          return !testModeDisabled && (isPremium || gameState.isPremium || gameState.premiumType === 'lifetime' || gameState.premiumType === 'weekly' || savedPremiumStatus === 'lifetime');
        })()}
      />



      {/* Recent Achievements */}
      <Card className="glass-card border-white/10 p-4">
        <h3 className="text-xl font-bold mb-4">{t('recentAchievements')}</h3>
        <div className="space-y-3">
          {getCompletedAchievements().slice(-3).map(achievement => (
            <div key={achievement.id} className="flex items-center gap-3 p-3 glass-card rounded-lg border-2 border-[hsl(var(--tropico-gold))]">
              <i className={`${achievement.icon} text-[hsl(var(--tropico-gold))] text-xl`}></i>
              <div>
                <div className="font-medium text-[hsl(var(--tropico-gold))]">{achievement.name}</div>
                <div className="text-sm text-gray-400">{achievement.description}</div>
              </div>
              <Badge className="ml-auto gold-gradient text-black">{t('completed')}!</Badge>
            </div>
          ))}
          {getCompletedAchievements().length === 0 && (
            <div className="text-center text-gray-400 py-4">
              Пока нет выполненных достижений
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderInvestmentSection = (category: string) => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <i className={`${ASSETS.find(a => a.category === category)?.icon || 'fas fa-chart-line'} text-[hsl(var(--tropico-teal))] mr-3`}></i>
        {category === 'crypto' && 'Cryptocurrency'}
        {category === 'stocks' && 'Stock Market'}
        {category === 'realestate' && 'Real Estate'}
        {category === 'cars' && 'Luxury Cars'}
        {category === 'yachts' && 'Yachts & Jets'}
        {category === 'art' && 'Art & Collectibles'}
        {category === 'business' && 'Business Empire'}
        {category === 'space' && 'Space Technology'}
      </h2>
      
      {getAssetsByCategory(category).map(asset => {
        const quantity = gameState.investments[asset.id] || 0;
        const price = Math.floor(asset.basePrice * Math.pow(asset.multiplier, quantity));
        const canAfford = gameState.balance >= price;
        
        return (
          <InvestmentCard
            key={asset.id}
            asset={asset}
            quantity={quantity}
            onBuy={buyInvestment}
            canAfford={canAfford}
          />
        );
      })}
    </div>
  );

  const renderPortfolioSection = () => {
    return (
      <PortfolioSection
        gameState={gameState}
        getCompletedAchievements={getCompletedAchievements}
        ACHIEVEMENTS={ACHIEVEMENTS}
        getPortfolioValue={getPortfolioValue}
        getBusinessValue={getBusinessValue}
        getTotalNetWorth={getTotalNetWorth}
      />
    );
  };
  const renderAchievementsSection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Достижения</h2>
      
      {/* Completed Achievements */}
      {getCompletedAchievements().map(achievement => (
        <Card key={achievement.id} className="glass-card border-2 border-[hsl(var(--tropico-gold))] p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
              <i className={`${achievement.icon} text-white text-xl`}></i>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-[hsl(var(--tropico-gold))]">{achievement.name}</h3>
              <p className="text-gray-400 text-sm">{achievement.description}</p>
              <div className="text-[hsl(var(--tropico-gold))] font-bold mt-2">{t('completed')}!</div>
            </div>
            <div className="text-[hsl(var(--tropico-gold))]">
              <i className="fas fa-check-circle text-2xl"></i>
            </div>
          </div>
        </Card>
      ))}
      
      {/* Pending Achievements */}
      {getPendingAchievements().map(achievement => {
        let progress = 0;
        let current = 0;
        
        switch (achievement.type) {
          case 'balance':
            current = gameState.balance;
            progress = Math.min((current / achievement.requirement) * 100, 100);
            break;
          case 'clicks':
            current = gameState.totalClicks;
            progress = Math.min((current / achievement.requirement) * 100, 100);
            break;
        }
        
        return (
          <Card key={achievement.id} className="glass-card border-white/10 p-4 opacity-75">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                <i className={`${achievement.icon} text-white text-xl`}></i>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{achievement.name}</h3>
                <p className="text-gray-400 text-sm">{achievement.description}</p>
                <Progress value={progress} className="h-2 mt-2" />
                <div className="text-xs text-gray-500 mt-1">
                  {formatNumber(current)} / {formatNumber(achievement.requirement)}
                </div>
              </div>
              <div className="text-gray-400">
                <div className="text-sm">Reward:</div>
                <div className="font-bold">${formatNumber(achievement.reward)}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderSettingsSection = () => {
    const handleSoundToggle = () => {
      const newValue = !soundEnabled;
      setSoundEnabled(newValue);
      localStorage.setItem('tycoon-sound', newValue.toString());
    };

    const handleVibrateToggle = () => {
      const newValue = !vibrateEnabled;
      setVibrateEnabled(newValue);
      vibrationService.setEnabled(newValue);
      
      // Тестовая вибрация при включении
      if (newValue) {
        vibrationService.testVibration();
      }
    };

    const handleResetProgress = () => {
      if (confirm('Are you sure you want to reset all progress? This action cannot be undone!')) {
        localStorage.removeItem('tycoon-clicker-save');
        window.location.reload();
      }
    };

    const handleLanguageChange = (newLanguage: Language) => {
      setCurrentLanguage(newLanguage);
      localStorage.setItem('wealth-tycoon-language', newLanguage);
    };

    return (
      <div className="space-y-6">
        <Card className="glass-card border-white/10 p-6">
          <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--tropico-gold))]">
            {t('settings')}
          </h2>

          {/* Language Settings */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-[hsl(var(--tropico-teal))]" />
              <h3 className="font-semibold text-lg">Language</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(languageNames).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang as Language)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    language === lang
                      ? 'bg-gradient-to-r from-[hsl(var(--tropico-teal))] to-[hsl(var(--tropico-cyan))] text-white'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{getLanguageFlag(lang)}</span>
                  <span className="font-medium">{getLanguageName(lang)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Settings */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4">Sound & Vibration</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSoundToggle}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg transition-all ${
                  soundEnabled
                    ? 'bg-gray-500/30 text-gray-300'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                <Volume2 className="w-5 h-5" />
                <span>Звук</span>
              </button>
              
              <button
                onClick={handleVibrateToggle}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg transition-all ${
                  vibrateEnabled
                    ? 'bg-gray-500/30 text-gray-300'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                <Vibrate className="w-5 h-5" />
                <span>Вибрация</span>
              </button>
            </div>
          </div>

          {/* Облачное сохранение */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="w-5 h-5 text-[hsl(var(--tropico-cyan))]" />
              <h3 className="font-semibold text-lg">Облачное сохранение</h3>
            </div>
            <div className="space-y-3">
              <FirebaseAuth 
                gameState={gameState} 
                onGameStateLoad={(loadedState) => {
                  setGameState(loadedState);
                  console.log('Игровое состояние загружено из Firebase');
                }}
                onGameStateSave={() => {
                  console.log('Игровое состояние сохранено в Firebase');
                }}
              />
            </div>
          </div>

          {/* Конфиденциальность */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[hsl(var(--tropico-gold))]" />
              <h3 className="font-semibold text-lg">Конфиденциальность</h3>
            </div>
            <button
              onClick={() => setIsConsentManagerOpen(true)}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Управление настройками конфиденциальности</span>
            </button>
          </div>

          {/* Кнопка сброса */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleResetProgress}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-lg transition-all bg-gray-600/20 text-gray-400 hover:bg-gray-600/30"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="font-semibold">Сброс прогресса</span>
            </button>
          </div>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return renderHomeSection();
      case 'trading':
        return (
          <SimpleTradingSection 
            gameState={gameState} 
            onBuyAsset={handleBuyAsset}
            onSellAsset={handleSellAsset}
          />
        );
      case 'business':
        return (
          <BusinessSection 
            gameState={gameState} 
            onBuyBusiness={handleBuyBusiness}
            onUpgradeBusiness={handleUpgradeBusiness}
            onSellBusiness={handleSellBusiness}
          />
        );
      case 'casino':
        return (
          <CasinoSection 
            gameState={gameState} 
            onUpdateBalance={handleUpdateBalance}
            onRecordTransaction={addTransaction}
          />
        );
      case 'portfolio':
        return renderPortfolioSection();
      case 'settings':
        return renderSettingsSection();
      default:
        return renderHomeSection();
    }
  };

  // Расчет реального пассивного дохода - используем ту же логику что и в useGameState
  const calculateRealPassiveIncome = () => {
    let total = 0;
    
    // 1. Доход от кликов (потенциальный доход в секунду от кликов)
    // Предполагаем средний темп кликов игрока и умножаем на значение клика
    const averageClicksPerSecond = 2; // Средний игрок делает 2 клика в секунду
    const clickIncome = gameState.clickValue * averageClicksPerSecond;
    total += clickIncome;
    
    // 2. Доход от классических инвестиций
    ASSETS.forEach(asset => {
      const quantity = gameState.investments[asset.id] || 0;
      total += (asset.baseIncome * quantity);
    });
    
    // 3. Доход от торговых акций (Apple, Tesla)
    const appleShares = gameState.investments['apple'] || 0;
    const teslaShares = gameState.investments['tesla'] || 0;
    
    const appleIncome = appleShares * 0.5;  // $0.50 за акцию Apple
    const teslaIncome = teslaShares * 0.75; // $0.75 за акцию Tesla
    
    total += appleIncome + teslaIncome;
    
    // Доход от бизнесов - синхронный расчёт (та же логика что в useGameState)
    if (gameState.businesses && Object.keys(gameState.businesses).length > 0) {
      Object.entries(gameState.businesses).forEach(([businessId, businessData]) => {
        if (businessData.owned) {
          let baseIncome = 0;
          
          // Определяем базовый доход для каждого бизнеса
          if (businessId === 'convenience_store') {
            baseIncome = 1000 * 15; // $15,000/день
          } else if (businessId === 'coffee_shop') {
            baseIncome = 5000 * 18; // $90,000/день
          } else if (businessId === 'restaurant') {
            baseIncome = 15000 * 20; // $300,000/день
          }
          
          // Применяем улучшения
          let multiplier = 1.0;
          businessData.upgrades.forEach(upgradeId => {
            if (upgradeId.includes('upgrade_1')) multiplier *= 1.5;
            else if (upgradeId.includes('upgrade_2')) multiplier *= 2.0;
            else if (upgradeId.includes('upgrade_3')) multiplier *= 3.0;
          });
          
          // Преобразуем дневной доход в доход в секунду
          const dailyIncome = baseIncome * multiplier;
          const secondlyIncome = dailyIncome / 86400;
          total += secondlyIncome;
        }
      });
    }
    return total;
  };

  // Если настройки открыты, показываем только их
  if (settingsOpen) {
    return createPortal(
      <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <SettingsModal 
          isOpen={settingsOpen} 
          onClose={() => setSettingsOpen(false)}
        />
      </div>,
      document.body
    );
  }

  return (
    <div className="min-h-screen pb-[180px] md:pb-[200px] lg:pb-[220px] relative">
      <div className={settingsOpen ? 'hidden' : ''}>
        
        <div className="relative">
          <StatsHeader 
            gameState={gameState} 
            realPassiveIncome={Math.round(calculateRealPassiveIncome() * 10) / 10} 
            onSettingsClick={() => setSettingsOpen(true)}
            isCollapsed={activeSection !== 'home'}
            transactions={transactions}
            onExpandHome={handleExpandHome}
          />
        </div>
        

        
        <main className="px-4 py-6">
          {renderContent()}
        </main>
        
        {/* Межстраничная реклама при смене уровня */}
        {!gameState.isPremium && (
          <AdMobBanner 
            adType="interstitial"
            trigger={gameState.level.toString()}
          />
        )}
      </div>

      {/* Ultra-Premium AdMob System - Maximum Safety Margins */}
      {(
        (!isPremium && !gameState.isPremium) ||
        (isPremium || gameState.isPremium)
      ) && (
        <div className="fixed bottom-0 left-0 right-0 z-[40] bg-gradient-to-r from-slate-900 to-slate-800 border-t border-purple-500/30 shadow-2xl">
          {/* Top safety buffer */}
          <div className="h-[30px] md:h-[40px] lg:h-[50px] bg-gradient-to-b from-transparent via-slate-900/10 to-slate-900/20" />
          {/* Main Ad Container - Enhanced Size (всегда резервируем место) */}
          <div className="h-[70px] md:h-[80px] lg:h-[90px] flex items-center justify-center">
            {(!isPremium && !gameState.isPremium) ? (
              import.meta.env.PROD ? (
                <ins
                  className="adsbygoogle"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '70px',
                    maxHeight: '90px',
                    backgroundColor: 'transparent',
                    minHeight: '50px'
                  }}
                  data-ad-client={import.meta.env.VITE_ADMOB_APP_ID}
                  data-ad-slot={import.meta.env.VITE_ADMOB_BANNER_ID}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                  data-ad-layout-key="-fb+5w+4e-db+86"
                  ref={(el) => {
                    if (el && !(el as any)._adsInitialized) {
                      (el as any)._adsInitialized = true;
                      setTimeout(() => {
                        try {
                          if ((window as any).adsbygoogle && import.meta.env.VITE_ADMOB_APP_ID) {
                            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                          }
                        } catch (error) {
                          console.log('Ultra-Premium AdMob system ready for deployment');
                        }
                      }, 300);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse"></div>
                    <span className="opacity-70 font-medium">Ultra-Premium AdMob Ready</span>
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )
            ) : null}
          </div>
          {/* Навигация */}
          <NavigationBar 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            isPremium={isPremium}
          />
          {/* Bottom safety buffer */}
          <div className="h-[20px] md:h-[30px] lg:h-[40px] bg-gradient-to-t from-transparent via-slate-900/10 to-slate-900/20" />
        </div>
      )}

      {/* Consent Manager */}
      <ConsentManager
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
        onConsentUpdate={handleConsentUpdate}
      />

      {/* Модальное окно GDPR согласий */}
      <ConsentManager 
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
        onConsentUpdate={(consents) => {
          adjustService.setEnabled(consents.analytics);
          adMobService.setConsentStatus(consents.advertising);
          console.log('Privacy settings updated:', consents);
        }}
      />

      {/* Фиксированный баннер внизу экрана - скрыт для премиум пользователей */}
      {!isPremium && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 to-slate-900 border-t border-gray-400/30">
          <div className="h-[60px] flex items-center justify-center text-white text-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Advertisement Space</span>
              <div className="px-2 py-1 bg-white/10 rounded text-xs">AdSense</div>
            </div>
          </div>
          
          {/* Скрытый AdSense для будущего использования */}
          <ins 
            className="adsbygoogle"
            style={{ display: 'none' }}
            data-ad-client="ca-pub-4328087894770041"
            data-ad-slot="5243095999"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      )}

      {/* Achievement Celebration Overlay */}
      <AchievementCelebration 
        achievement={currentAchievement} 
        onComplete={handleAchievementComplete}
        playerLevel={gameState.level}
      />

      {/* Level Up Celebration Overlay */}
      <LevelUpCelebration 
        level={levelUpData?.level || null}
        bonus={levelUpData?.bonus || 0}
        newClickValue={levelUpData?.newClickValue || 0}
        onComplete={handleLevelUpComplete}
        playerLevel={gameState.level}
      />

    </div>
  );
}
