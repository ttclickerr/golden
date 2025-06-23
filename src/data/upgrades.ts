import { Upgrade } from '../types/game';

// Define all upgrades
const upgrades: Upgrade[] = [
  // Tier 1 - Basic click upgrades
  {
    id: 'stronger_clicks_1',
    name: 'Stronger Fingers',
    description: 'Your clicks are twice as effective.',
    basePrice: 50,
    tier: 1,
    effect: {
      type: 'click_multiplier',
      value: 2,
    },
  },
  {
    id: 'stronger_clicks_2',
    name: 'Iron Fingers',
    description: 'Your clicks are 3x more effective.',
    basePrice: 500,
    tier: 1,
    effect: {
      type: 'click_multiplier',
      value: 3,
    },
  },
  {
    id: 'stronger_clicks_3',
    name: 'Steel Fingers',
    description: 'Your clicks are 4x more effective.',
    basePrice: 5000,
    tier: 2,
    effect: {
      type: 'click_multiplier',
      value: 4,
    },
  },
  
  // Tier 2 - Passive income upgrades
  {
    id: 'passive_boost_1',
    name: 'Business School',
    description: 'Your passive income is 50% more effective.',
    basePrice: 1000,
    tier: 2,
    effect: {
      type: 'passive_income_multiplier',
      value: 1.5,
    },
  },
  {
    id: 'passive_boost_2',
    name: 'MBA Degree',
    description: 'Your passive income is twice as effective.',
    basePrice: 10000,
    tier: 3,
    effect: {
      type: 'passive_income_multiplier',
      value: 2,
    },
  },
  {
    id: 'passive_boost_3',
    name: 'Business Genius',
    description: 'Your passive income is 3x more effective.',
    basePrice: 100000,
    tier: 4,
    effect: {
      type: 'passive_income_multiplier',
      value: 3,
    },
  },
  
  // Tier 3 - Advanced click upgrades
  {
    id: 'gold_fingers',
    name: 'Gold Fingers',
    description: 'Your clicks are 10x more effective.',
    basePrice: 50000,
    tier: 3,
    effect: {
      type: 'click_multiplier',
      value: 10,
    },
  },
  {
    id: 'diamond_fingers',
    name: 'Diamond Fingers',
    description: 'Your clicks are 50x more effective.',
    basePrice: 500000,
    tier: 4,
    effect: {
      type: 'click_multiplier',
      value: 50,
    },
  },
  
  // Tier 4 - Advanced passive upgrades
  {
    id: 'economic_genius',
    name: 'Economic Genius',
    description: 'Your passive income is 5x more effective.',
    basePrice: 1000000,
    tier: 5,
    effect: {
      type: 'passive_income_multiplier',
      value: 5,
    },
  },
  {
    id: 'business_empire',
    name: 'Business Empire',
    description: 'Your passive income is 10x more effective.',
    basePrice: 10000000,
    tier: 6,
    effect: {
      type: 'passive_income_multiplier',
      value: 10,
    },
  },
];

// Utility functions
export function getAllUpgrades(): Upgrade[] {
  return upgrades;
}

export function getUpgradeById(id: string): Upgrade | undefined {
  return upgrades.find(upgrade => upgrade.id === id);
}

export function calculateUpgradePrice(upgrade: Upgrade): number {
  return upgrade.basePrice;
}
