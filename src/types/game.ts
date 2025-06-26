export interface Upgrade {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  tier: number;
  effect: {
    type: 'click_multiplier' | 'passive_income_multiplier' | 'building_multiplier';
    value: number;
    targetBuildingId?: string;
  };
  purchasedAt?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'clicks' | 'currency' | 'buildings' | 'upgrades' | 'playtime';
  target: number;
  reward: number;
  icon: string;
  unlockedAt?: number;
  progress: number;
}

export interface Building {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  baseIncomePerSecond: number;
  count: number;
  tier: number;
  purchasedAt?: number;
  lastPurchasedAt?: number;
}

export interface RealEstate {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  income: number;
  incomePerHour: number;
  appreciation: number;
  maintenanceCost: number;
  owned: boolean;
  purchasedAt?: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  category: 'level' | 'building' | 'stock' | 'crypto' | 'vehicle' | 'yacht';
  target: number;
  reward: number;
  completed: boolean;
  progress: number;
}

export interface Tutorial {
  id: string;
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface GameState {
  currentCurrency: number;
  totalCurrency: number;
  manualClicks: number;
  clickValue: number;
  passiveIncome: number;
  lastSavedAt: number;
  buildings: Building[];
  upgrades: Upgrade[];
  realEstate: RealEstate[];
  level: number;
  xp: number;
  xpRequired: number;
  activeGameTime: number;
  achievements: Achievement[];
  quests: Quest[];
  tutorial: Tutorial[];
  tutorialCompleted: boolean;
  boosterName?: string;
  totalClicks: number;
  investmentPurchases: Record<string, { totalShares: number; totalCost: number }>;
  businesses: Record<string, { owned: boolean; purchaseDate: number; upgrades: string[] }>;
}
