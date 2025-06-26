import { useState, useEffect, useCallback } from 'react';
import { ASSETS, ACHIEVEMENTS, formatNumber, calculatePrice, calculateIncome } from '@/lib/gameData';
import { assetNames } from "@/lib/assetNames";

export interface GameState {
  balance: number;
  level: number;
  xp: number;
  maxXp: number;
  clickValue: number;
  passiveIncome: number;
  totalClicks: number;
  investments: Record<string, number>;
  investmentPurchases: Record<string, { totalShares: number; totalCost: number }>; // Для отслеживания средней цены
  businesses: Record<string, { 
    owned: boolean;
    purchaseDate: number;
    upgrades: string[];
    quantity?: number;
  }>;
  achievements: string[];
  activeBoosters: Record<string, { endTime: number; multiplier: number }>;
  rewardCooldowns: Record<string, number>;
  isPremium: boolean;
  premiumType?: 'weekly' | 'lifetime'; // Тип премиум подписки
  premiumExpiry?: number; // Время истечения недельной подписки (только для weekly)
  boosterName?: string;
}

export const INITIAL_STATE: GameState = {
  balance: 99, // Стартовый капитал - $99
  level: 1,
  xp: 0,
  maxXp: 100, // Меньше опыта нужно для первого уровня
  clickValue: 2.5, // Стартовое значение - $2.5 за клик
  passiveIncome: 0,
  totalClicks: 0,
  investments: {},
  investmentPurchases: {},
  businesses: {},
  achievements: [],
  activeBoosters: {},
  rewardCooldowns: {},
  isPremium: false
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  // Calculate total passive income
  const calculatePassiveIncome = useCallback((investments: Record<string, number>, businesses?: GameState['businesses'], level?: number): number => {
    let total = 0;
    
    // Множитель дохода на основе уровня (до 100 уровней)
    const levelMultiplier = 1 + ((level || 1) - 1) * 0.05; // +5% за каждый уровень
    
    // Доход от классических инвестиций
    total += ASSETS.reduce((sum, asset) => {
      const quantity = investments[asset.id] || 0;
      return sum + calculateIncome(asset.baseIncome, quantity);
    }, 0);
    
    // Доход от торговых активов - все новые акции, криптовалюты и сырьевые товары
    const tradingIncomes = [
      // Основные активы
      { key: 'apple', rate: 0.5, name: 'Apple' },
      { key: 'tesla', rate: 0.75, name: 'Tesla' },
      { key: 'btc-separate', rate: 15.0, name: 'Bitcoin' },
      { key: 'eth-separate', rate: 8.0, name: 'Ethereum' },
      
      // Новые акции
      { key: 'msft', rate: 1.2, name: 'Microsoft' },
      { key: 'googl', rate: 0.9, name: 'Google' },
      { key: 'amzn', rate: 0.8, name: 'Amazon' },
      { key: 'nvda', rate: 2.5, name: 'Nvidia' },
      { key: 'jpm', rate: 0.6, name: 'JPMorgan' },
      { key: 'brk', rate: 15.0, name: 'Berkshire' },
      { key: 'ko', rate: 0.3, name: 'Coca-Cola' },
      { key: 'pg', rate: 0.4, name: 'P&G' },
      { key: 'jnj', rate: 0.5, name: 'J&J' },
      { key: 'pfz', rate: 0.2, name: 'Pfizer' },
      
      // Сырьевые товары
      { key: 'oil', rate: 0.3, name: 'Oil' },
      { key: 'gold', rate: 1.0, name: 'Gold' },
      { key: 'silver', rate: 0.1, name: 'Silver' },
      { key: 'platinum', rate: 0.8, name: 'Platinum' },
      { key: 'uranium', rate: 1.5, name: 'Uranium' }
    ];
    
    let tradingIncome = 0;
    const incomeDetails: string[] = [];
    
    tradingIncomes.forEach(({ key, rate, name }) => {
      const shares = investments[key] || 0;
      const income = shares * rate;
      if (shares > 0) {
        tradingIncome += income;
        // Округляем доход до 2 знаков для консоли
        incomeDetails.push(`${name} ${shares} × $${rate} = $${income.toFixed(2)}`);
      }
    });
    
    // Доход от бизнесов - синхронный расчёт
    let businessIncome = 0;
    if (businesses && Object.keys(businesses).length > 0) {
      Object.entries(businesses).forEach(([businessId, businessData]) => {
        const quantity = businessData.quantity || 0;
        if (quantity > 0) {
          // Расчёт напрямую без импорта для синхронности
          let baseIncome = 0;
          let businessName = '';
          
          // Определяем базовый доход для каждого бизнеса (увеличены в 100 раз для баланса)
          if (businessId === 'convenience_store') {
            baseIncome = 1000 * 15; // $1000 * 1500% = $15,000/день
            businessName = 'Corner Store';
          } else if (businessId === 'coffee_shop') {
            baseIncome = 5000 * 18; // $5000 * 1800% = $90,000/день
            businessName = 'Coffee Shop';
          } else if (businessId === 'restaurant') {
            baseIncome = 15000 * 20; // $15000 * 2000% = $300,000/день
            businessName = 'Restaurant';
          } else if (businessId === 'clothing_store') {
            baseIncome = 48000 * 17; // $48000 * 1700% = $816,000/день  
            businessName = 'Clothing Store';
          } else if (businessId === 'casino_underground') {
            baseIncome = 1500000 * 55; // $1.5M * 5500% = $82,500,000/день
            businessName = 'Underground Casino';
          }
          
          // Применяем улучшения
          let multiplier = 1.0;
          businessData.upgrades.forEach(upgradeId => {
            if (upgradeId.includes('upgrade_1')) multiplier *= 1.5;
            else if (upgradeId.includes('upgrade_2')) multiplier *= 2.0;
            else if (upgradeId.includes('upgrade_3')) multiplier *= 3.0;
          });
          
          // Преобразуем дневной доход в доход в секунду (делим на 86400 секунд в дне)
          const dailyIncome = baseIncome * multiplier * quantity; // Умножаем на количество
          const secondlyIncome = dailyIncome / 86400;
          businessIncome += secondlyIncome;
          
          // Добавляем информацию о доходе от бизнеса
          if (quantity > 1) {
            incomeDetails.push(`${businessName} ${quantity}x $${(dailyIncome/quantity).toFixed(0)}/day`);
          } else {
            incomeDetails.push(`${businessName} $${dailyIncome.toFixed(0)}/day`);
          }
        }
      });
    }
    
    total += tradingIncome + businessIncome;
    
    // Применяем множитель уровня к общему доходу
    total *= levelMultiplier;

    // Оптимизация: логировать только при изменении дохода
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (!w._lastPassiveIncomeLog || w._lastPassiveIncomeValue !== total) {
        console.log(`💰 Passive Income: ${incomeDetails.join(', ')} | Total: $${total.toFixed(2)}/sec (LVL ${level || 1} +${((levelMultiplier - 1) * 100).toFixed(0)}%)`);
        w._lastPassiveIncomeLog = Date.now();
        w._lastPassiveIncomeValue = total;
      }
    }

    return total;
  }, []);

  // Load game state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tycoon-clicker-save');
    console.log('🔄 Loading game state:', saved ? 'save found' : 'no save found');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('✅ Successfully loaded state:', { balance: parsed.balance, investments: parsed.investments });
        
        // Убеждаемся что баланс не меньше $99
        const correctedBalance = Math.max(99, parsed.balance || 99);
        
        // Принудительно пересчитываем пассивный доход при загрузке
        const correctedPassiveIncome = calculatePassiveIncome(parsed.investments || {}, parsed.businesses || {}, parsed.level || 1);
        setGameState(prev => ({ 
          ...prev, 
          ...parsed, 
          balance: correctedBalance,
          passiveIncome: correctedPassiveIncome,
          totalClicks: prev.totalClicks || 0,
          investmentPurchases: prev.investmentPurchases || {},
          businesses: prev.businesses || {}
        }));
      } catch (error) {
        console.error('❌ Ошибка загрузки игрового состояния:', error);
      }
    }
  }, [calculatePassiveIncome]);

  // Save game state to localStorage and Firebase
  const saveGameState = useCallback(async (state: GameState) => {
    console.log('Сохранение игрового состояния:', {
      balance: Number(state.balance.toFixed(1)),
      investments: { ...state.investments },
      businesses: { ...state.businesses },
      activeBoosters: { ...state.activeBoosters },
      rewardCooldowns: { ...state.rewardCooldowns },
      level: state.level,
      xp: state.xp,
      maxXp: state.maxXp,
      clickValue: state.clickValue,
      passiveIncome: state.passiveIncome,
      totalClicks: state.totalClicks,
      achievements: state.achievements,
      isPremium: state.isPremium,
      premiumType: state.premiumType,
      premiumExpiry: state.premiumExpiry
    });
    localStorage.setItem('tycoon-clicker-save', JSON.stringify(state));
    
    // Синхронизация с Firebase для авторизованных пользователей
    try {
      const { FirebaseGameService } = await import('@/services/firebase');
      const { useAuth } = await import('@/hooks/useAuth');
      
      // Получаем текущего пользователя
      const auth = await import('firebase/auth');
      const currentUser = auth.getAuth().currentUser;
      
      if (currentUser) {
        await FirebaseGameService.saveGameState(currentUser.uid, state);
        console.log('☁️ Game state synced to cloud');
      }
    } catch (error) {
      // Игнорируем ошибки синхронизации с облаком
      console.log('☁️ Cloud sync skipped (offline or error)');
    }
  }, []);

  // Auto-save every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await saveGameState(gameState);
    }, 5000);
    return () => clearInterval(interval);
  }, [gameState, saveGameState]);

  // Упрощенная система - пассивный доход добавляется при кликах
  // Это проще и стабильнее чем автоматические таймеры

  // Calculate click multiplier from active boosters
  const getClickMultiplier = useCallback((activeBoosters: Record<string, { endTime: number; multiplier: number }>) => {
    let multiplier = 1;
    const now = Date.now();
    
    Object.values(activeBoosters).forEach(booster => {
      if (booster.endTime > now) {
        multiplier *= booster.multiplier;
      }
    });
    
    return multiplier;
  }, []);

  // Handle click
  const handleClick = useCallback(() => {
    setGameState(prev => {
      // На ранних уровнях быстрее получаем опыт, на высоких - медленнее
      const xpGain = Math.max(1, Math.min(3, 4 - Math.floor(prev.level / 5)));
      const newXp = prev.xp + xpGain;
      const newTotalClicks = prev.totalClicks + 1;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      let newClickValue = prev.clickValue;
      let levelUpBonus = 0;
      
      // Apply booster multiplier
      const clickMultiplier = getClickMultiplier(prev.activeBoosters);
      let newBalance = prev.balance + (prev.clickValue * clickMultiplier);

      // Check for level up
      if (newXp >= prev.maxXp) {
        newLevel = prev.level + 1;
        
        // Уровни становятся сложнее с ростом уровня (нелинейно)
        const levelFactor = 1.2 + (0.05 * Math.min(10, newLevel - 1));
        newMaxXp = Math.floor(prev.maxXp * levelFactor);
        
        // Увеличиваем бонус от клика более щедро - каждый уровень даёт хороший прирост
        const clickGrowthFactor = 1.5 + (0.1 * Math.min(10, newLevel - 1)); // Начинаем с 1.5x и растёт
        newClickValue = Math.round(prev.clickValue * clickGrowthFactor * 10) / 10; // Округляем до 1 знака
        
        // Бонус за уровень - деньги
        levelUpBonus = 50 * Math.pow(1.5, newLevel - 1);
        
        // Показываем сообщение о новом уровне
        console.log(`🎉 Level ${newLevel} reached! Bonus: $${formatNumber(levelUpBonus)}, New click: $${newClickValue}`);
        
        // Track level up in both analytics platforms
        if (typeof window !== 'undefined') {
          import('@/lib/appsflyer').then(({ appsFlyerService }) => {
            appsFlyerService.trackLevelUp(newLevel);
          });
          import('@/lib/appmetrica').then(({ appMetricaService }) => {
            appMetricaService.trackLevelUp(newLevel);
          });
        }
      }

      // Пересчитываем пассивный доход с новым уровнем
      const newPassiveIncome = calculatePassiveIncome(prev.investments, prev.businesses, newLevel);

      const newState = {
        ...prev,
        balance: newBalance + levelUpBonus,
        level: newLevel,
        xp: newXp >= prev.maxXp ? 0 : newXp,
        maxXp: newMaxXp,
        clickValue: newClickValue,
        totalClicks: newTotalClicks,
        passiveIncome: newPassiveIncome
      };

      return newState;
    });
  }, [getClickMultiplier]);

  // Buy investment
  const buyInvestment = useCallback((assetId: string) => {
    const asset = ASSETS.find(a => a.id === assetId);
    if (!asset) return false;

    setGameState(prev => {
      const currentQuantity = prev.investments[assetId] || 0;
      const price = calculatePrice(asset.basePrice, currentQuantity, asset.multiplier);
      
      if (prev.balance < price) return prev;

      const newInvestments = {
        ...prev.investments,
        [assetId]: currentQuantity + 1
      };

      const newPassiveIncome = calculatePassiveIncome(newInvestments, prev.businesses, prev.level);

      // Log investment purchase
      console.log(`📈 Bought stock: ${asset.name} for $${price.toFixed(2)}`);
      
      // Track investment purchase in both analytics platforms
      if (typeof window !== 'undefined') {
        import('@/lib/appsflyer').then(({ appsFlyerService }) => {
          appsFlyerService.trackInvestment(asset.name, price);
        });
        import('@/lib/appmetrica').then(({ appMetricaService }) => {
          appMetricaService.trackInvestment(asset.name, price);
        });
      }
      
      // Add to transaction history in localStorage (только если не было недавнего сброса)
      const resetFlag = localStorage.getItem('game-reset');
      if (resetFlag !== 'true') {
        const transaction = {
          id: `inv-${assetId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'investment',
          amount: -price, // Покупка - это расход
          description: `Bought ${asset.name} stock`,
          timestamp: new Date(),
          source: 'Trading'
        };
        
        console.log('🔍 Saving transaction:', {
          assetName: asset.name,
          calculatedPrice: price,
          transactionAmount: transaction.amount,
          currentQuantity
        });
        
        const existingTransactions = JSON.parse(localStorage.getItem('game-transactions') || '[]');
        existingTransactions.unshift(transaction);
        localStorage.setItem('game-transactions', JSON.stringify(existingTransactions.slice(0, 50)));
      }

      return {
        ...prev,
        balance: prev.balance - price,
        investments: newInvestments,
        passiveIncome: newPassiveIncome
      };
    });

    return true;
  }, [calculatePassiveIncome]);

  // Sell investment
  const sellInvestment = useCallback((assetId: string) => {
    const asset = ASSETS.find(a => a.id === assetId);
    if (!asset) return false;

    setGameState(prev => {
      const currentQuantity = prev.investments[assetId] || 0;
      if (currentQuantity <= 0) return prev;

      // Sell at 95% of current price (with spread)
      const sellPrice = asset.basePrice * 0.95;
      
      const newInvestments = {
        ...prev.investments,
        [assetId]: currentQuantity - 1
      };

      const newPassiveIncome = calculatePassiveIncome(newInvestments, prev.businesses, prev.level);

      // Add to transaction history (только если не было недавнего сброса)
      const resetFlag = localStorage.getItem('game-reset');
      if (resetFlag !== 'true') {
        const transaction = {
          id: `sell-${assetId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'investment',
          amount: sellPrice, // Продажа - это доход
          description: `Продал акцию ${asset.name}`,
          timestamp: new Date(),
          source: 'Trading'
        };
        
        const existingTransactions = JSON.parse(localStorage.getItem('game-transactions') || '[]');
        existingTransactions.unshift(transaction);
        localStorage.setItem('game-transactions', JSON.stringify(existingTransactions.slice(0, 50)));
      }

      return {
        ...prev,
        balance: prev.balance + sellPrice,
        investments: newInvestments,
        passiveIncome: newPassiveIncome
      };
    });

    return true;
  }, [calculatePassiveIncome]);

  // Check achievements
  const checkAchievements = useCallback(() => {
    setGameState(prev => {
      const newAchievements = [...prev.achievements];
      let bonusBalance = 0;

      ACHIEVEMENTS.forEach(achievement => {
        if (newAchievements.includes(achievement.id)) return;

        let achieved = false;
        switch (achievement.type) {
          case 'balance':
            achieved = prev.balance >= achievement.requirement;
            break;
          case 'clicks':
            achieved = prev.totalClicks >= achievement.requirement;
            break;
        }

        if (achieved) {
          newAchievements.push(achievement.id);
          bonusBalance += achievement.reward;
        }
      });

      if (bonusBalance > 0) {
        return {
          ...prev,
          achievements: newAchievements,
          balance: prev.balance + bonusBalance
        };
      }

      return { ...prev, achievements: newAchievements };
    });
  }, []);

  // Passive income generation - исправленная версия
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        // Пересчитываем текущий пассивный доход в реальном времени
        const currentPassiveIncome = calculatePassiveIncome(prev.investments, prev.businesses, prev.level);
        
        if (currentPassiveIncome > 0) {
          return {
            ...prev,
            balance: prev.balance + currentPassiveIncome, // Прибавляем доход за секунду
            passiveIncome: currentPassiveIncome // Обновляем значение для отображения
          };
        }
        return prev;
      });
    }, 1000); // Обновляем каждую секунду

    return () => clearInterval(interval);
  }, [calculatePassiveIncome]);

  // Check achievements on state change
  useEffect(() => {
    checkAchievements();
  }, [gameState.balance, gameState.totalClicks, checkAchievements]);

  // Calculate portfolio value - включает торговые активы и классические инвестиции
  const portfolioValue = Object.entries(gameState.investments).reduce((total, [assetId, quantity]) => {
    // Цены для торговых активов
    const tradingPrices: Record<string, number> = {
      'apple': 195, 'tesla': 248, 'btc-separate': 67500, 'eth-separate': 3450,
      'ko': 68, 'oil': 73, 'gold': 2045, 'silver': 26, 'platinum': 950, 'uranium': 2500000
    };
    
    // Если это торговый актив, используем рыночную цену
    if (tradingPrices[assetId]) {
      return total + (tradingPrices[assetId] * quantity);
    }
    
    // Для классических инвестиций используем базовую цену
    const asset = ASSETS.find(a => a.id === assetId);
    if (asset) {
      return total + (asset.basePrice * quantity);
    }
    
    return total;
  }, 0);

  // Activate booster
  const activateBooster = useCallback((boosterId: string) => {
    console.log('⚡ Activating booster:', boosterId);
    
    setGameState(prev => {
      const now = Date.now();
      let newState = { ...prev };
      let boosterName = '';
      let duration = 120; // 2 minutes default

      if (boosterId === 'click_boost' || boosterId === 'mega_click') {
        // 5x клик на 2 минуты
        newState.activeBoosters = {
          ...prev.activeBoosters,
          [boosterId]: { endTime: now + 120000, multiplier: 5 }
        };
        boosterName = '5x Click Multiplier';
      } else if (boosterId === 'income_boost' || boosterId === 'double_income') {
        // 3x доход на 5 минут
        duration = 300;
        newState.activeBoosters = {
          ...prev.activeBoosters,
          [boosterId]: { endTime: now + 300000, multiplier: 3 }
        };
        boosterName = '3x Income Boost';
      } else if (boosterId === 'mega_income' || boosterId === 'mega_multiplier') {
        // x5 доход на 2 минуты
        newState.activeBoosters = {
          ...prev.activeBoosters,
          [boosterId]: { endTime: now + 120000, multiplier: 5 }
        };
        boosterName = '5x Mega Multiplier';
      } else if (boosterId === 'golden_click' || boosterId === 'golden_touch') {
        // x10 клик на 2 минуты
        newState.activeBoosters = {
          ...prev.activeBoosters,
          [boosterId]: { endTime: now + 120000, multiplier: 10 }
        };
        boosterName = '10x Golden Touch';
      } else if (boosterId === 'time_speed' || boosterId === 'time_warp') {
        // x2 скорость пассивного дохода на 2 минуты
        newState.activeBoosters = {
          ...prev.activeBoosters,
          [boosterId]: { endTime: now + 120000, multiplier: 2 }
        };
        boosterName = '2x Time Warp';
      } else if (boosterId === 'auto_click' || boosterId === 'auto_clicker') {
        // Автокликер на 60 секунд
        duration = 60;
        newState.activeBoosters = {
          ...prev.activeBoosters,
          [boosterId]: { endTime: now + 60000, multiplier: 1 }
        };
        boosterName = 'Auto Clicker';
      } else if (boosterId === 'money_rain') {
        // Мгновенный бонус денег
        const bonus = 10000;
        newState.balance = prev.balance + bonus;
        boosterName = `Money Rain (+$${bonus.toLocaleString()})`;
        duration = 0; // Instant effect
        console.log('💰 Money Rain activated! Bonus:', bonus);
      }

      // Логируем активацию бустера
      if (boosterName) {
        console.log(`✅ Booster activated: ${boosterName} for ${duration}s`);
        
        // Сохраняем состояние локально
        setTimeout(() => {
          localStorage.setItem('tycoon-boosters', JSON.stringify(newState.activeBoosters));
        }, 100);
      }

      return newState;
    });
  }, []);

  // Reset progress
  const resetProgress = useCallback(() => {
    setGameState(INITIAL_STATE);
    localStorage.removeItem('tycoon-game-state');
  }, []);

  // Auto-clicker effect
  useEffect(() => {
    const autoClicker = gameState.activeBoosters['auto_clicker'];
    if (autoClicker && autoClicker.endTime > Date.now()) {
      const interval = setInterval(() => {
        handleClick();
      }, 500); // Клик каждые 0.5 секунды

      return () => clearInterval(interval);
    }
  }, [gameState.activeBoosters, handleClick]);
  
  // Business functions
  const buyBusiness = useCallback((businessId: string) => {
    import('@/data/businesses').then(({ getBusinessById }) => {
      const business = getBusinessById(businessId);
      if (!business) return false;
      
      setGameState(prev => {
        // Check if can afford
        if (prev.balance < business.basePrice) return prev;
        
        // Check level requirement
        if (prev.level < business.requiredLevel) return prev;
        
        const currentQuantity = prev.businesses?.[businessId]?.quantity || 0;
        
        // Логируем транзакцию (больше НЕ сохраняем в localStorage)
        console.log('✅ Покупка бизнеса:', `${business.name} за $${business.basePrice}`);

        // Purchase business
        const newState = {
          ...prev,
          balance: prev.balance - business.basePrice,
          businesses: {
            ...prev.businesses,
            [businessId]: {
              quantity: currentQuantity + 1,
              owned: true, // Для обратной совместимости
              purchaseDate: prev.businesses?.[businessId]?.purchaseDate || Date.now(),
              upgrades: prev.businesses?.[businessId]?.upgrades || []
            }
          }
        };

        // Принудительно сохраняем бизнес-покупки
        setTimeout(() => {
          localStorage.setItem('tycoon-clicker-save', JSON.stringify(newState));
          console.log('✅ Бизнес сохранен принудительно:', businessId);
        }, 100);

        return newState;
      });
      
      return true;
    });
  }, []);
  
  const upgradeBusiness = useCallback((businessId: string, upgradeId: string) => {
    import('@/data/businesses').then(({ getBusinessById }) => {
      const business = getBusinessById(businessId);
      if (!business) return false;
      
      const upgrade = business.upgrades.find(u => u.id === upgradeId);
      if (!upgrade) return false;
      
      setGameState(prev => {
        // Check if business is owned
        const quantity = prev.businesses?.[businessId]?.quantity || 0;
        if (quantity === 0) return prev;
        
        // Check if upgrade already purchased
        if (prev.businesses[businessId].upgrades.includes(upgradeId)) return prev;
        
        // Check if can afford
        if (prev.balance < upgrade.cost) return prev;
        
        // Логируем транзакцию (больше НЕ сохраняем в localStorage)
        console.log('✅ Улучшение бизнеса:', `${business.name}: ${upgrade.name} за $${upgrade.cost}`);
        
        // Purchase upgrade
        const newState = {
          ...prev,
          balance: prev.balance - upgrade.cost,
          businesses: {
            ...prev.businesses,
            [businessId]: {
              ...prev.businesses[businessId],
              upgrades: [...prev.businesses[businessId].upgrades, upgradeId]
            }
          }
        };

        // Принудительно сохраняем улучшения
        setTimeout(() => {
          localStorage.setItem('tycoon-clicker-save', JSON.stringify(newState));
          console.log('✅ Улучшение сохранено принудительно:', upgradeId);
        }, 100);

        return newState;
      });
      
      return true;
    });
  }, []);

  const sellBusiness = useCallback((businessId: string) => {
    import('@/data/businesses').then(({ getBusinessById }) => {
      const business = getBusinessById(businessId);
      if (!business) return false;
      
      setGameState(prev => {
        const currentQuantity = prev.businesses?.[businessId]?.quantity || 0;
        // Check if business is owned
        if (currentQuantity === 0) return prev;
        
        // Calculate sell price (70% of original price)
        const sellPrice = Math.floor(business.basePrice * 0.7);
        
        // Логируем транзакцию (больше НЕ сохраняем в localStorage)
        console.log('✅ Продажа бизнеса:', `${business.name} за $${sellPrice} (70% возврат)`);
        
        // Update business quantity
        const updatedBusinesses = { ...prev.businesses };
        if (currentQuantity === 1) {
          // Remove business completely if it's the last one
          delete updatedBusinesses[businessId];
        } else {
          // Decrease quantity by 1
          updatedBusinesses[businessId] = {
            ...updatedBusinesses[businessId],
            quantity: currentQuantity - 1,
            owned: currentQuantity - 1 > 0 // Update owned status
          };
        }
        
        const newState = {
          ...prev,
          balance: prev.balance + sellPrice,
          businesses: updatedBusinesses
        };

        // Принудительно сохраняем продажу бизнеса
        setTimeout(() => {
          localStorage.setItem('tycoon-clicker-save', JSON.stringify(newState));
          console.log('✅ Продажа бизнеса сохранена принудительно:', businessId);
        }, 100);

        return newState;
      });
      
      return true;
    });
  }, []);

  // Быстрая покупка для торгового раздела
  const quickBuyAsset = useCallback((assetId: string, price: number) => {
    setGameState(prev => {
      if (prev.balance >= price) {
        const currentQuantity = prev.investments[assetId] || 0;
        
        // Получаем название актива
        const getAssetName = (id: string): string => {
          return assetNames[id] || id;
        };
        
        // Логируем транзакцию (больше НЕ сохраняем в localStorage)
        console.log('✅ Транзакция покупки:', `Купил акцию ${getAssetName(assetId)} за $${price}`);
        
        // Обновляем историю покупок для правильного расчета процентов
        const newPurchases = {
          ...prev.investmentPurchases,
          [assetId]: {
            totalShares: (prev.investmentPurchases?.[assetId]?.totalShares || 0) + 1,
            totalCost: (prev.investmentPurchases?.[assetId]?.totalCost || 0) + price
          }
        };
        
        const newInvestments = {
          ...prev.investments,
          [assetId]: currentQuantity + 1
        };
        
        const newState = {
          ...prev,
          balance: prev.balance - price,
          investments: newInvestments,
          investmentPurchases: newPurchases,
          passiveIncome: calculatePassiveIncome(newInvestments, prev.businesses, prev.level)
        };
        
        console.log('💾 Обновленные инвестиции:', newInvestments);
        console.log('💾 Принудительное сохранение после покупки');
        
        // Принудительно сохраняем состояние сразу после покупки
        setTimeout(() => {
          localStorage.setItem('tycoon-clicker-save', JSON.stringify(newState));
          console.log('✅ Состояние сохранено принудительно:', { investments: newState.investments });
        }, 100);
        
        return newState;
      }
      return prev;
    });
  }, [calculatePassiveIncome]);

  const quickSellAsset = useCallback((assetId: string, price: number) => {
    setGameState(prev => {
      const currentQuantity = prev.investments[assetId] || 0;
      if (currentQuantity > 0) {
        // Определяем название актива для торговых активов
        let assetName = assetId;
        if (assetId === 'ko') assetName = 'Coca-Cola';
        else if (assetId === 'apple') assetName = 'Tiple Technologies';
        else if (assetId === 'tesla') assetName = 'Desla Motors';
        else if (assetId === 'btc-separate') assetName = 'Bitcoin';
        else if (assetId === 'eth-separate') assetName = 'Ethereum';
        else if (assetId === 'msft') assetName = 'Microsys Corp';
        else if (assetId === 'googl') assetName = 'Foogle Inc';
        else if (assetId === 'amzn') assetName = 'Amazom LLC';
        else if (assetId === 'nvda') assetName = 'Mvidia Corp';
        else if (assetId === 'jpm') assetName = 'KP Morgan Bank';
        else if (assetId === 'brk') assetName = 'Berkshite Holdings';
        else if (assetId === 'pg') assetName = 'Procter & Gambie';
        else if (assetId === 'jnj') assetName = 'Johnson & Johnsen';
        else if (assetId === 'oil') assetName = 'Crude Oil';
        else if (assetId === 'gold') assetName = 'Gold';
        else if (assetId === 'silver') assetName = 'Silver';
        else if (assetId === 'platinum') assetName = 'Platinum';
        else if (assetId === 'uranium') assetName = 'Uranium';
        
        // Логируем транзакцию (больше НЕ сохраняем в localStorage)
        console.log('✅ Транзакция продажи:', `Продал акцию ${assetName} за $${price}`);
        
        return {
          ...prev,
          balance: prev.balance + price,
          investments: {
            ...prev.investments,
            [assetId]: currentQuantity - 1
          }
        };
      }
      return prev;
    });
  }, []);

  // Функция для обновления состояния игры
  const updateGameState = useCallback((newState: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...newState }));
  }, []);

  // Check if premium is still valid
  const checkPremiumStatus = useCallback(() => {
    const now = Date.now();
    if (gameState.premiumType === 'lifetime') {
      return true; // Lifetime premium never expires
    }
    if (gameState.premiumType === 'weekly' && gameState.premiumExpiry) {
      return gameState.premiumExpiry > now;
    }
    return false;
  }, [gameState.premiumType, gameState.premiumExpiry]);

  // Purchase premium (weekly subscription $5 or lifetime $14.99)
  const purchasePremium = useCallback((type: 'weekly' | 'lifetime') => {
    setGameState(prev => {
      const now = Date.now();
      let premiumExpiry: number | undefined;
      
      if (type === 'weekly') {
        premiumExpiry = now + (7 * 24 * 60 * 60 * 1000); // 7 days from now
      }
      // For lifetime, no expiry needed
      
      console.log(`💎 Premium ${type} activated!`);
      
      return {
        ...prev,
        isPremium: true,
        premiumType: type,
        premiumExpiry
      };
    });
  }, []);

  return {
    gameState,
    setGameState,
    updateGameState,
    handleClick,
    buyInvestment,
    sellInvestment,
    quickBuyAsset,
    quickSellAsset,
    activateBooster,
    buyBusiness,
    upgradeBusiness,
    sellBusiness,
    resetProgress,
    portfolioValue,
    formatNumber,
    calculatePrice,
    calculateIncome,
    checkPremiumStatus,
    purchasePremium,
    ASSETS,
    ACHIEVEMENTS
  };
}
