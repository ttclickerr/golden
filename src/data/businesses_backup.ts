export interface BusinessUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number; // Множитель к базовому доходу
  icon: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  basePrice: number; // Начальная стоимость бизнеса
  baseIncome: number; // Базовый доход в день (%)
  icon: string;
  category: BusinessCategory;
  requiredLevel: number;
  upgrades: BusinessUpgrade[];
}

export type BusinessCategory = 
  | 'retail' 
  | 'realestate' 
  | 'services' 
  | 'technology' 
  | 'manufacturing' 
  | 'logistics' 
  | 'energy' 
  | 'defense'
  | 'luxury'
  | 'space'
  | 'underground';

// Создание улучшений с масштабируемыми ценами
const createUpgrades = (businessId: string, basePrice: number): BusinessUpgrade[] => [
  {
    id: `${businessId}_upgrade_1`,
    name: "Basic Improvements", 
    description: "Enhance efficiency with basic improvements",
    cost: Math.round(basePrice * 0.5), // 50% от цены бизнеса
    multiplier: 1.5,
    icon: "🔧"
  },
  {
    id: `${businessId}_upgrade_2`,
    name: "Advanced Technology",
    description: "Implement cutting-edge technology", 
    cost: Math.round(basePrice * 1.5), // 150% от цены бизнеса
    multiplier: 2.0,
    icon: "🔬"
  },
  {
    id: `${businessId}_upgrade_3`,
    name: "Full Automation",
    description: "Fully automate operations for maximum efficiency",
    cost: Math.round(basePrice * 3.0), // 300% от цены бизнеса
    multiplier: 3.0,
    icon: "🤖"
  }
];

export const BUSINESSES: Business[] = [
  // RETAIL
  {
    id: 'convenience_store',
    name: 'Corner Store',
    description: 'A small convenience store in a busy neighborhood.',
    basePrice: 1000,
    baseIncome: 0.15,
    icon: '🏪',
    category: 'retail',
    requiredLevel: 1,
    upgrades: createUpgrades('convenience_store', 1000)
  },
  {
    id: 'coffee_shop', 
    name: 'Coffee Shop',
    description: 'A cozy café serving premium coffee and snacks.',
    basePrice: 5000,
    baseIncome: 0.18,
    icon: '☕',
    category: 'retail',
    requiredLevel: 2,
    upgrades: createUpgrades('coffee_shop', 5000)
  },
  {
    id: 'restaurant',
    name: 'Restaurant', 
    description: 'A popular restaurant with a unique menu.',
    basePrice: 15000,
    baseIncome: 0.20,
    icon: '🍽️',
    category: 'retail',
    requiredLevel: 3,
    upgrades: createUpgrades('restaurant', 15000)
  }
];

export function getBusinessById(id: string): Business | undefined {
  return BUSINESSES.find(business => business.id === id);
}

export function getBusinessesByCategory(category: BusinessCategory): Business[] {
  return BUSINESSES.filter(business => business.category === category);
}

export function getBusinessCategories(): BusinessCategory[] {
  return ['retail', 'realestate', 'services', 'technology', 'manufacturing', 'logistics', 'energy', 'defense', 'luxury', 'space', 'underground'];
}

export function calculateBusinessIncome(business: Business, upgradeIds: string[]): number {
  let income = business.baseIncome;
  
  for (const upgradeId of upgradeIds) {
    const upgrade = business.upgrades.find(u => u.id === upgradeId);
    if (upgrade) {
      income *= upgrade.multiplier;
    }
  }
  
  return income;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}