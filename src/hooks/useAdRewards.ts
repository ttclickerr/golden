import { useState, useCallback, useEffect } from 'react';

interface AdReward {
  id: string;
  name: string;
  expiresAt?: number;
  multiplier?: number;
  duration?: number;
}

interface AdRewardState {
  activeRewards: AdReward[];
  cooldowns: Record<string, number>;
  canUseReward: (rewardId: string) => boolean;
}

export function useAdRewards() {
  const [adRewardState, setAdRewardState] = useState<AdRewardState>({
    activeRewards: [],
    cooldowns: {},
    canUseReward: () => true
  });

  // Проверяем активные награды и убираем истекшие
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setAdRewardState(prev => ({
        ...prev,
        activeRewards: prev.activeRewards.filter(reward => 
          !reward.expiresAt || reward.expiresAt > now
        ),
        cooldowns: Object.fromEntries(
          Object.entries(prev.cooldowns).filter(([_, expiry]) => expiry > now)
        )
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activateAdReward = useCallback((rewardId: string) => {
    const now = Date.now();
    
    switch (rewardId) {
      case 'click_multiplier':
        setAdRewardState(prev => ({
          ...prev,
          activeRewards: [...prev.activeRewards.filter(r => r.id !== rewardId), {
            id: rewardId,
            name: 'Клик Бустер',
            expiresAt: now + (5 * 60 * 1000), // 5 минут
            multiplier: 3
          }],
          cooldowns: { ...prev.cooldowns, [rewardId]: now + (30 * 60 * 1000) } // 30 мин кулдаун
        }));
        return { success: true, message: 'Клик бустер активирован! +200% к доходу от кликов на 5 минут' };

      case 'income_multiplier':
        setAdRewardState(prev => ({
          ...prev,
          activeRewards: [...prev.activeRewards.filter(r => r.id !== rewardId), {
            id: rewardId,
            name: 'Доходный Бустер',
            expiresAt: now + (10 * 60 * 1000), // 10 минут
            multiplier: 2
          }],
          cooldowns: { ...prev.cooldowns, [rewardId]: now + (45 * 60 * 1000) } // 45 мин кулдаун
        }));
        return { success: true, message: 'Доходный бустер активирован! +100% к пассивному доходу на 10 минут' };

      case 'business_boost':
        setAdRewardState(prev => ({
          ...prev,
          activeRewards: [...prev.activeRewards.filter(r => r.id !== rewardId), {
            id: rewardId,
            name: 'Бизнес Ускорение',
            expiresAt: now + (15 * 60 * 1000), // 15 минут
            multiplier: 2.5
          }],
          cooldowns: { ...prev.cooldowns, [rewardId]: now + (120 * 60 * 1000) } // 120 мин кулдаун
        }));
        return { success: true, message: 'Бизнес ускорение активировано! +150% к доходу бизнесов на 15 минут' };

      case 'double_casino':
        setAdRewardState(prev => ({
          ...prev,
          activeRewards: [...prev.activeRewards.filter(r => r.id !== rewardId), {
            id: rewardId,
            name: 'Двойной Выигрыш',
            expiresAt: now + (20 * 60 * 1000), // 20 минут
            multiplier: 2
          }],
          cooldowns: { ...prev.cooldowns, [rewardId]: now + (180 * 60 * 1000) } // 180 мин кулдаун
        }));
        return { success: true, message: 'Двойные выигрыши в казино активированы на 20 минут!' };

      case 'free_trades':
        setAdRewardState(prev => ({
          ...prev,
          activeRewards: [...prev.activeRewards.filter(r => r.id !== rewardId), {
            id: rewardId,
            name: 'Бесплатные Сделки',
            expiresAt: now + (60 * 60 * 1000), // 1 час или 5 сделок
            multiplier: 5 // количество бесплатных сделок
          }],
          cooldowns: { ...prev.cooldowns, [rewardId]: now + (90 * 60 * 1000) } // 90 мин кулдаун
        }));
        return { success: true, message: 'Следующие 5 сделок с акциями будут без комиссии!' };

      case 'discount_upgrades':
        setAdRewardState(prev => ({
          ...prev,
          activeRewards: [...prev.activeRewards.filter(r => r.id !== rewardId), {
            id: rewardId,
            name: 'Скидка на Улучшения',
            expiresAt: now + (60 * 60 * 1000), // 1 час
            multiplier: 0.5 // 50% скидка
          }],
          cooldowns: { ...prev.cooldowns, [rewardId]: now + (240 * 60 * 1000) } // 240 мин кулдаун
        }));
        return { success: true, message: 'Скидка 50% на все улучшения бизнесов активирована на 1 час!' };

      case 'market_insight':
        setAdRewardState(prev => ({
          ...prev,
          activeRewards: [...prev.activeRewards.filter(r => r.id !== rewardId), {
            id: rewardId,
            name: 'Рыночная Аналитика',
            expiresAt: now + (2 * 60 * 1000), // 2 минуты
            multiplier: 1
          }],
          cooldowns: { ...prev.cooldowns, [rewardId]: now + (180 * 60 * 1000) } // 180 мин кулдаун
        }));
        return { success: true, message: 'Рыночная аналитика активирована! Видите будущие цены акций на 2 минуты' };

      case 'lucky_spin':
        setAdRewardState(prev => ({
          ...prev,
          activeRewards: [...prev.activeRewards.filter(r => r.id !== rewardId), {
            id: rewardId,
            name: 'Удачное Вращение',
            expiresAt: now + (5 * 60 * 1000), // 5 минут на использование
            multiplier: 1
          }],
          cooldowns: { ...prev.cooldowns, [rewardId]: now + (300 * 60 * 1000) } // 300 мин кулдаун
        }));
        return { success: true, message: 'Удачное вращение готово! Следующая игра в казино будет выигрышной!' };

      default:
        return { success: false, message: 'Неизвестная награда' };
    }
  }, []);

  const hasActiveReward = useCallback((rewardId: string): boolean => {
    return adRewardState.activeRewards.some(reward => reward.id === rewardId);
  }, [adRewardState.activeRewards]);

  const getRewardMultiplier = useCallback((rewardId: string): number => {
    const reward = adRewardState.activeRewards.find(r => r.id === rewardId);
    return reward?.multiplier || 1;
  }, [adRewardState.activeRewards]);

  const isOnCooldown = useCallback((rewardId: string): boolean => {
    const cooldownEnd = adRewardState.cooldowns[rewardId];
    return cooldownEnd ? Date.now() < cooldownEnd : false;
  }, [adRewardState.cooldowns]);

  const getCooldownTime = useCallback((rewardId: string): number => {
    const cooldownEnd = adRewardState.cooldowns[rewardId];
    if (!cooldownEnd) return 0;
    return Math.max(0, cooldownEnd - Date.now());
  }, [adRewardState.cooldowns]);

  const consumeReward = useCallback((rewardId: string) => {
    if (rewardId === 'free_trades') {
      setAdRewardState(prev => ({
        ...prev,
        activeRewards: prev.activeRewards.map(reward => 
          reward.id === rewardId 
            ? { ...reward, multiplier: Math.max(0, (reward.multiplier || 0) - 1) }
            : reward
        ).filter(reward => reward.id !== rewardId || (reward.multiplier || 0) > 0)
      }));
    } else if (rewardId === 'lucky_spin' || rewardId === 'undo_action') {
      // Одноразовые награды удаляются после использования
      setAdRewardState(prev => ({
        ...prev,
        activeRewards: prev.activeRewards.filter(reward => reward.id !== rewardId)
      }));
    }
  }, []);

  // Специальные методы для разных типов наград
  const getClickMultiplier = useCallback((): number => {
    return getRewardMultiplier('click_multiplier');
  }, [getRewardMultiplier]);

  const getIncomeMultiplier = useCallback((): number => {
    return getRewardMultiplier('income_multiplier');
  }, [getRewardMultiplier]);

  const getBusinessMultiplier = useCallback((): number => {
    return getRewardMultiplier('business_boost');
  }, [getRewardMultiplier]);

  const getCasinoMultiplier = useCallback((): number => {
    return getRewardMultiplier('double_casino');
  }, [getRewardMultiplier]);

  const hasLuckySpin = useCallback((): boolean => {
    return hasActiveReward('lucky_spin');
  }, [hasActiveReward]);

  const hasFreeTradesLeft = useCallback((): boolean => {
    return hasActiveReward('free_trades') && getRewardMultiplier('free_trades') > 0;
  }, [hasActiveReward, getRewardMultiplier]);

  const getUpgradeDiscount = useCallback((): number => {
    return hasActiveReward('discount_upgrades') ? getRewardMultiplier('discount_upgrades') : 1;
  }, [hasActiveReward, getRewardMultiplier]);

  const hasMarketInsight = useCallback((): boolean => {
    return hasActiveReward('market_insight');
  }, [hasActiveReward]);

  return {
    activeRewards: adRewardState.activeRewards,
    activateAdReward,
    hasActiveReward,
    getRewardMultiplier,
    isOnCooldown,
    getCooldownTime,
    consumeReward,
    
    // Специализированные методы
    getClickMultiplier,
    getIncomeMultiplier,
    getBusinessMultiplier,
    getCasinoMultiplier,
    hasLuckySpin,
    hasFreeTradesLeft,
    getUpgradeDiscount,
    hasMarketInsight
  };
}