export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  level: number;
  category: 'wealth' | 'clicks' | 'business' | 'investments' | 'special';
  requirement: {
    type: 'balance' | 'totalClicks' | 'businessCount' | 'investmentValue' | 'passiveIncome' | 'level' | 'custom';
    value: number;
    customCheck?: (gameState: any) => boolean;
  };
}

// Генерируем 999 достижений различных категорий
export const ACHIEVEMENTS: Achievement[] = [
  // Wealth Achievements (1-200)
  ...Array.from({ length: 200 }, (_, i) => {
    const level = i + 1;
    const baseReward = Math.pow(10, Math.floor(level / 20) + 2);
    const requirement = Math.pow(10, Math.floor(level / 15) + 3);
    
    return {
      id: `wealth_${level}`,
      name: `Wealth Level ${level}`,
      description: `Accumulate $${requirement.toLocaleString()} in total wealth`,
      icon: level <= 50 ? 'fas fa-coins' : level <= 100 ? 'fas fa-gem' : level <= 150 ? 'fas fa-crown' : 'fas fa-trophy',
      reward: baseReward * level,
      level,
      category: 'wealth' as const,
      requirement: {
        type: 'balance',
        value: requirement
      }
    };
  }),

  // Click Achievements (201-350)
  ...Array.from({ length: 150 }, (_, i) => {
    const level = i + 201;
    const baseReward = Math.pow(10, Math.floor((level - 200) / 15) + 2);
    const requirement = Math.pow(10, Math.floor((level - 200) / 12) + 2);
    
    return {
      id: `clicks_${level}`,
      name: `Click Master ${level - 200}`,
      description: `Make ${requirement.toLocaleString()} total clicks`,
      icon: (level - 200) <= 30 ? 'fas fa-hand-pointer' : (level - 200) <= 75 ? 'fas fa-mouse' : (level - 200) <= 120 ? 'fas fa-bolt' : 'fas fa-fire',
      reward: baseReward * (level - 200),
      level,
      category: 'clicks' as const,
      requirement: {
        type: 'totalClicks',
        value: requirement
      }
    };
  }),

  // Business Achievements (351-500)
  ...Array.from({ length: 150 }, (_, i) => {
    const level = i + 351;
    const baseReward = Math.pow(10, Math.floor((level - 350) / 18) + 3);
    const requirement = Math.min((level - 350) * 2, 100);
    
    return {
      id: `business_${level}`,
      name: `Business Tycoon ${level - 350}`,
      description: `Own ${requirement} businesses`,
      icon: (level - 350) <= 25 ? 'fas fa-store' : (level - 350) <= 50 ? 'fas fa-building' : (level - 350) <= 100 ? 'fas fa-city' : 'fas fa-globe',
      reward: baseReward * (level - 350),
      level,
      category: 'business' as const,
      requirement: {
        type: 'businessCount',
        value: requirement
      }
    };
  }),

  // Investment Achievements (501-700)
  ...Array.from({ length: 200 }, (_, i) => {
    const level = i + 501;
    const baseReward = Math.pow(10, Math.floor((level - 500) / 20) + 3);
    const requirement = Math.pow(10, Math.floor((level - 500) / 15) + 4);
    
    return {
      id: `investment_${level}`,
      name: `Investment Guru ${level - 500}`,
      description: `Have $${requirement.toLocaleString()} in investment portfolio`,
      icon: (level - 500) <= 40 ? 'fas fa-chart-line' : (level - 500) <= 80 ? 'fas fa-chart-area' : (level - 500) <= 150 ? 'fas fa-analytics' : 'fas fa-rocket',
      reward: baseReward * (level - 500),
      level,
      category: 'investments' as const,
      requirement: {
        type: 'investmentValue',
        value: requirement
      }
    };
  }),

  // Passive Income Achievements (701-850)
  ...Array.from({ length: 150 }, (_, i) => {
    const level = i + 701;
    const baseReward = Math.pow(10, Math.floor((level - 700) / 15) + 4);
    const requirement = Math.pow(10, Math.floor((level - 700) / 12) + 1);
    
    return {
      id: `passive_${level}`,
      name: `Passive Income ${level - 700}`,
      description: `Earn $${requirement.toLocaleString()}/sec passive income`,
      icon: (level - 700) <= 30 ? 'fas fa-money-bill-wave' : (level - 700) <= 75 ? 'fas fa-piggy-bank' : (level - 700) <= 120 ? 'fas fa-vault' : 'fas fa-bank',
      reward: baseReward * (level - 700),
      level,
      category: 'investments' as const,
      requirement: {
        type: 'passiveIncome',
        value: requirement
      }
    };
  }),

  // Special & Milestone Achievements (851-999)
  ...Array.from({ length: 149 }, (_, i) => {
    const level = i + 851;
    const baseReward = Math.pow(10, Math.floor((level - 850) / 10) + 5);
    const playerLevel = Math.min((level - 850) * 5, 999);
    
    return {
      id: `special_${level}`,
      name: `Legend ${level - 850}`,
      description: `Reach player level ${playerLevel}`,
      icon: (level - 850) <= 30 ? 'fas fa-star' : (level - 850) <= 75 ? 'fas fa-medal' : (level - 850) <= 120 ? 'fas fa-award' : 'fas fa-infinity',
      reward: baseReward * (level - 850),
      level,
      category: 'special' as const,
      requirement: {
        type: 'level',
        value: playerLevel
      }
    };
  })
];

// Функции для работы с достижениями
export const getCompletedAchievements = (gameState: any): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => {
    switch (achievement.requirement.type) {
      case 'balance':
        return gameState.balance >= achievement.requirement.value;
      case 'totalClicks':
        return gameState.totalClicks >= achievement.requirement.value;
      case 'businessCount':
        return Object.values(gameState.businesses).filter((b: any) => b?.owned).length >= achievement.requirement.value;
      case 'investmentValue':
        const totalInvestmentValue = Object.entries(gameState.investments).reduce((total, [_, quantity]) => {
          return total + (quantity as number) * 1000; // базовая цена актива
        }, 0);
        return totalInvestmentValue >= achievement.requirement.value;
      case 'passiveIncome':
        return gameState.passiveIncome >= achievement.requirement.value;
      case 'level':
        return gameState.level >= achievement.requirement.value;
      case 'custom':
        return achievement.requirement.customCheck?.(gameState) || false;
      default:
        return false;
    }
  });
};

export const getNextAchievement = (gameState: any): Achievement | null => {
  const completed = getCompletedAchievements(gameState);
  const remaining = ACHIEVEMENTS.filter(a => !completed.find(c => c.id === a.id));
  
  // Возвращаем ближайшее достижение
  return remaining.sort((a, b) => a.level - b.level)[0] || null;
};

export const getAchievementProgress = (achievement: Achievement, gameState: any): number => {
  let current = 0;
  
  switch (achievement.requirement.type) {
    case 'balance':
      current = gameState.balance;
      break;
    case 'totalClicks':
      current = gameState.totalClicks;
      break;
    case 'businessCount':
      current = Object.values(gameState.businesses).filter((b: any) => b?.owned).length;
      break;
    case 'investmentValue':
      current = Object.entries(gameState.investments).reduce((total, [_, quantity]) => {
        return total + (quantity as number) * 1000;
      }, 0);
      break;
    case 'passiveIncome':
      current = gameState.passiveIncome;
      break;
    case 'level':
      current = gameState.level;
      break;
  }
  
  return Math.min((current / achievement.requirement.value) * 100, 100);
};