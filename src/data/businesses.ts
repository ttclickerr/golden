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
    requiredLevel: 1,
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
    requiredLevel: 1,
    upgrades: createUpgrades('restaurant', 15000)
  },
  {
    id: 'bakery',
    name: 'Bakery',
    description: 'Fresh bread and pastries daily.',
    basePrice: 8000,
    baseIncome: 0.17,
    icon: '🥖',
    category: 'retail',
    requiredLevel: 1,
    upgrades: createUpgrades('bakery', 8000)
  },
  {
    id: 'clothing_store',
    name: 'Clothing Store',
    description: 'Trendy fashion boutique.',
    basePrice: 12000,
    baseIncome: 0.19,
    icon: '👕',
    category: 'retail',
    requiredLevel: 1,
    upgrades: createUpgrades('clothing_store', 12000)
  },
  
  // REALESTATE
  {
    id: 'apartment_building',
    name: 'Apartment Building',
    description: 'A modern residential building with multiple units.',
    basePrice: 50000,
    baseIncome: 0.25,
    icon: '🏢',
    category: 'realestate',
    requiredLevel: 1,
    upgrades: createUpgrades('apartment_building', 50000)
  },
  {
    id: 'office_complex',
    name: 'Office Complex',
    description: 'A prestigious office building in the business district.',
    basePrice: 150000,
    baseIncome: 0.30,
    icon: '🏬',
    category: 'realestate',
    requiredLevel: 1,
    upgrades: createUpgrades('office_complex', 150000)
  },
  {
    id: 'shopping_mall',
    name: 'Shopping Mall',
    description: 'Large retail complex with multiple stores.',
    basePrice: 300000,
    baseIncome: 0.35,
    icon: '🏪',
    category: 'realestate',
    requiredLevel: 1,
    upgrades: createUpgrades('shopping_mall', 300000)
  },
  {
    id: 'hotel',
    name: 'Luxury Hotel',
    description: 'Five-star hotel in the city center.',
    basePrice: 500000,
    baseIncome: 0.40,
    icon: '🏨',
    category: 'realestate',
    requiredLevel: 1,
    upgrades: createUpgrades('hotel', 500000)
  },
  {
    id: 'warehouse',
    name: 'Storage Warehouse',
    description: 'Commercial storage and distribution center.',
    basePrice: 100000,
    baseIncome: 0.28,
    icon: '🏭',
    category: 'realestate',
    requiredLevel: 1,
    upgrades: createUpgrades('warehouse', 100000)
  },
  
  // SERVICES
  {
    id: 'car_wash',
    name: 'Car Wash',
    description: 'An automated car wash service.',
    basePrice: 25000,
    baseIncome: 0.22,
    icon: '🚗',
    category: 'services',
    requiredLevel: 1,
    upgrades: createUpgrades('car_wash', 25000)
  },
  {
    id: 'gym',
    name: 'Fitness Center',
    description: 'A modern gym with premium equipment.',
    basePrice: 75000,
    baseIncome: 0.28,
    icon: '💪',
    category: 'services',
    requiredLevel: 1,
    upgrades: createUpgrades('gym', 75000)
  },
  {
    id: 'medical_clinic',
    name: 'Medical Clinic',
    description: 'Private healthcare facility.',
    basePrice: 120000,
    baseIncome: 0.33,
    icon: '🏥',
    category: 'services',
    requiredLevel: 1,
    upgrades: createUpgrades('medical_clinic', 120000)
  },
  {
    id: 'law_firm',
    name: 'Law Firm',
    description: 'Corporate legal services.',
    basePrice: 90000,
    baseIncome: 0.31,
    icon: '⚖️',
    category: 'services',
    requiredLevel: 1,
    upgrades: createUpgrades('law_firm', 90000)
  },
  {
    id: 'beauty_salon',
    name: 'Beauty Salon',
    description: 'High-end beauty and spa services.',
    basePrice: 35000,
    baseIncome: 0.26,
    icon: '💅',
    category: 'services',
    requiredLevel: 1,
    upgrades: createUpgrades('beauty_salon', 35000)
  },
  {
    id: 'thai_spa',
    name: 'Thai SPA',
    description: 'Premium Thai massage and wellness center.',
    basePrice: 1000000, // 1 млн
    baseIncome: 0.32,
    icon: '💆',
    category: 'services',
    requiredLevel: 1,
    upgrades: createUpgrades('thai_spa', 1000000)
  },
  
  // TECHNOLOGY
  {
    id: 'data_center',
    name: 'Data Center',
    description: 'High-tech server hosting facility.',
    basePrice: 200000,
    baseIncome: 0.35,
    icon: '🖥️',
    category: 'technology',
    requiredLevel: 1,
    upgrades: createUpgrades('data_center', 200000)
  },
  {
    id: 'software_company',
    name: 'Software Company',
    description: 'Develops mobile apps and web platforms.',
    basePrice: 100000,
    baseIncome: 0.32,
    icon: '💻',
    category: 'technology',
    requiredLevel: 1,
    upgrades: createUpgrades('software_company', 100000)
  },
  {
    id: 'gaming_studio',
    name: 'Gaming Studio',
    description: 'Video game development company.',
    basePrice: 150000,
    baseIncome: 0.36,
    icon: '🎮',
    category: 'technology',
    requiredLevel: 1,
    upgrades: createUpgrades('gaming_studio', 150000)
  },
  {
    id: 'ai_research',
    name: 'AI Research Lab',
    description: 'Artificial intelligence and machine learning.',
    basePrice: 350000,
    baseIncome: 0.42,
    icon: '🤖',
    category: 'technology',
    requiredLevel: 1,
    upgrades: createUpgrades('ai_research', 350000)
  },
  {
    id: 'cryptocurrency_mine',
    name: 'Crypto Mining Farm',
    description: 'Bitcoin and cryptocurrency mining operation.',
    basePrice: 2000000, // 2 млн
    baseIncome: 0.38,
    icon: '₿',
    category: 'technology',
    requiredLevel: 1,
    upgrades: createUpgrades('cryptocurrency_mine', 2000000)
  },
  
  // MANUFACTURING
  {
    id: 'factory',
    name: 'Manufacturing Plant',
    description: 'Produces consumer electronics.',
    basePrice: 300000,
    baseIncome: 0.40,
    icon: '🏭',
    category: 'manufacturing',
    requiredLevel: 1,
    upgrades: createUpgrades('factory', 300000)
  },
  {
    id: 'textile_factory',
    name: 'Textile Factory',
    description: 'Clothing and fabric manufacturing.',
    basePrice: 180000,
    baseIncome: 0.34,
    icon: '🧵',
    category: 'manufacturing',
    requiredLevel: 1,
    upgrades: createUpgrades('textile_factory', 180000)
  },
  {
    id: 'food_processing',
    name: 'Food Processing Plant',
    description: 'Packaged food production facility.',
    basePrice: 220000,
    baseIncome: 0.36,
    icon: '🥫',
    category: 'manufacturing',
    requiredLevel: 1,
    upgrades: createUpgrades('food_processing', 220000)
  },
  {
    id: 'pharmaceutical',
    name: 'Pharmaceutical Lab',
    description: 'Medical drug manufacturing.',
    basePrice: 400000,
    baseIncome: 0.45,
    icon: '💊',
    category: 'manufacturing',
    requiredLevel: 1,
    upgrades: createUpgrades('pharmaceutical', 400000)
  },
  {
    id: 'car_factory',
    name: 'Automotive Plant',
    description: 'Car assembly and manufacturing.',
    basePrice: 800000,
    baseIncome: 0.50,
    icon: '🚗',
    category: 'manufacturing',
    requiredLevel: 1,
    upgrades: createUpgrades('car_factory', 800000)
  },
  
  // LOGISTICS
  {
    id: 'shipping_company',
    name: 'Shipping Company',
    description: 'International freight and logistics.',
    basePrice: 250000,
    baseIncome: 0.38,
    icon: '🚢',
    category: 'logistics',
    requiredLevel: 1,
    upgrades: createUpgrades('shipping_company', 250000)
  },
  {
    id: 'trucking_company',
    name: 'Trucking Company',
    description: 'Ground transportation and delivery.',
    basePrice: 120000,
    baseIncome: 0.32,
    icon: '🚛',
    category: 'logistics',
    requiredLevel: 1,
    upgrades: createUpgrades('trucking_company', 120000)
  },
  {
    id: 'airline',
    name: 'Regional Airline',
    description: 'Commercial passenger flights.',
    basePrice: 800000,
    baseIncome: 0.48,
    icon: '✈️',
    category: 'logistics',
    requiredLevel: 1,
    upgrades: createUpgrades('airline', 800000)
  },
  {
    id: 'port_terminal',
    name: 'Port Terminal',
    description: 'Container shipping operations.',
    basePrice: 600000,
    baseIncome: 0.45,
    icon: '🚢',
    category: 'logistics',
    requiredLevel: 1,
    upgrades: createUpgrades('port_terminal', 600000)
  },
  {
    id: 'courier_service',
    name: 'Express Courier',
    description: 'Fast package delivery service.',
    basePrice: 80000,
    baseIncome: 0.30,
    icon: '📦',
    category: 'logistics',
    requiredLevel: 1,
    upgrades: createUpgrades('courier_service', 80000)
  },
  
  // ENERGY
  {
    id: 'solar_farm',
    name: 'Solar Farm',
    description: 'Renewable energy generation facility.',
    basePrice: 500000,
    baseIncome: 0.45,
    icon: '☀️',
    category: 'energy',
    requiredLevel: 1,
    upgrades: createUpgrades('solar_farm', 500000)
  },
  {
    id: 'wind_farm',
    name: 'Wind Farm',
    description: 'Wind turbine energy generation.',
    basePrice: 400000,
    baseIncome: 0.43,
    icon: '💨',
    category: 'energy',
    requiredLevel: 1,
    upgrades: createUpgrades('wind_farm', 400000)
  },
  {
    id: 'oil_refinery',
    name: 'Oil Refinery',
    description: 'Petroleum processing facility.',
    basePrice: 1000000,
    baseIncome: 0.55,
    icon: '🛢️',
    category: 'energy',
    requiredLevel: 1,
    upgrades: createUpgrades('oil_refinery', 1000000)
  },
  {
    id: 'nuclear_plant',
    name: 'Nuclear Power Plant',
    description: 'Nuclear energy generation.',
    basePrice: 400000000, // 400 млн
    baseIncome: 0.65,
    icon: '☢️',
    category: 'energy',
    requiredLevel: 1,
    upgrades: createUpgrades('nuclear_plant', 400000000)
  },
  {
    id: 'hydroelectric',
    name: 'Hydroelectric Dam',
    description: 'Water-powered energy generation.',
    basePrice: 800000,
    baseIncome: 0.50,
    icon: '🌊',
    category: 'energy',
    requiredLevel: 1,
    upgrades: createUpgrades('hydroelectric', 800000)
  },
  
  // LUXURY
  {
    id: 'yacht_club',
    name: 'Yacht Club',
    description: 'Exclusive marina and yacht services.',
    basePrice: 1000000,
    baseIncome: 0.50,
    icon: '🛥️',
    category: 'luxury',
    requiredLevel: 1,
    upgrades: createUpgrades('yacht_club', 1000000)
  },
  {
    id: 'diamond_mine',
    name: 'Diamond Mine',
    description: 'Precious gem extraction operation.',
    basePrice: 2000000,
    baseIncome: 0.60,
    icon: '💎',
    category: 'luxury',
    requiredLevel: 1,
    upgrades: createUpgrades('diamond_mine', 2000000)
  },
  {
    id: 'art_gallery',
    name: 'Art Gallery',
    description: 'High-end art sales and exhibitions.',
    basePrice: 800000,
    baseIncome: 0.52,
    icon: '🎨',
    category: 'luxury',
    requiredLevel: 1,
    upgrades: createUpgrades('art_gallery', 800000)
  },
  {
    id: 'private_jet',
    name: 'Private Jet Service',
    description: 'Luxury aviation for VIP clients.',
    basePrice: 3000000,
    baseIncome: 0.70,
    icon: '🛩️',
    category: 'luxury',
    requiredLevel: 1,
    upgrades: createUpgrades('private_jet', 3000000)
  },
  {
    id: 'luxury_resort',
    name: 'Luxury Resort',
    description: 'Exclusive tropical vacation destination.',
    basePrice: 50000000, // 50 млн
    baseIncome: 0.80,
    icon: '🏝️',
    category: 'luxury',
    requiredLevel: 1,
    upgrades: createUpgrades('luxury_resort', 50000000)
  },
  
  // SPACE
  {
    id: 'satellite_company',
    name: 'Satellite Network',
    description: 'Space-based communication systems.',
    basePrice: 2000000,
    baseIncome: 0.60,
    icon: '🛰️',
    category: 'space',
    requiredLevel: 1,
    upgrades: createUpgrades('satellite_company', 2000000)
  },
  {
    id: 'space_tourism',
    name: 'Space Tourism',
    description: 'Commercial flights for tourists to low Earth orbit.',
    basePrice: 50000000, // 50 млн
    baseIncome: 0.75,
    icon: '🚀',
    category: 'space',
    requiredLevel: 1,
    upgrades: createUpgrades('space_tourism', 50000000)
  },
  {
    id: 'asteroid_mining',
    name: 'Asteroid Mining',
    description: 'Extraction of rare minerals from asteroids.',
    basePrice: 250000000, // 250 млн
    baseIncome: 1.2,
    icon: '🪐',
    category: 'space',
    requiredLevel: 1,
    upgrades: createUpgrades('asteroid_mining', 250000000)
  },

  // UNDERGROUND
  {
    id: 'casino_underground',
    name: 'Underground Casino',
    description: 'High-stakes gambling operation.',
    basePrice: 25000000, // 25 млн
    baseIncome: 0.55,
    icon: '🎰',
    category: 'underground',
    requiredLevel: 1,
    upgrades: createUpgrades('casino_underground', 25000000)
  },
  {
    id: 'coconut_factory',
    name: 'Coconut Factory',
    description: 'Secret coconut processing for the black market.',
    basePrice: 100000000, // 100 млн
    baseIncome: 0.48,
    icon: '❄️',
    category: 'underground',
    requiredLevel: 1,
    upgrades: createUpgrades('coconut_factory', 100000000)
  },
  {
    id: 'crypto_mixer',
    name: 'Crypto Mixer',
    description: 'Anonymous crypto laundering service.',
    basePrice: 500000000, // 500 млн
    baseIncome: 0.52,
    icon: '🌀',
    category: 'underground',
    requiredLevel: 1,
    upgrades: createUpgrades('crypto_mixer', 500000000)
  },
  {
    id: 'black_market_arms',
    name: 'Black Market Arms',
    description: 'Illegal arms trading operation.',
    basePrice: 1000000000, // 1 млрд
    baseIncome: 0.60,
    icon: '🔫',
    category: 'underground',
    requiredLevel: 1,
    upgrades: createUpgrades('black_market_arms', 1000000000)
  }
];

export function getBusinessById(id: string): Business | undefined {
  return BUSINESSES.find(business => business.id === id);
}

export function getBusinessesByCategory(category: BusinessCategory): Business[] {
  return BUSINESSES.filter(business => business.category === category);
}

export function getBusinessCategories(): BusinessCategory[] {
  return ['retail', 'realestate', 'services', 'technology', 'manufacturing', 'logistics', 'energy', 'luxury', 'space', 'underground'];
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

// Calculate business price based on quantity owned (price increases with each purchase)
export function calculateBusinessPrice(business: Business, currentQuantity: number, activeUpgrades: string[] = []): number {
  // Base price with quantity multiplier (price increases by 15% for each additional business)
  const quantityMultiplier = Math.pow(1.15, currentQuantity);
  let basePrice = business.basePrice * quantityMultiplier;
  
  // Add cost of active upgrades - new business should include all purchased upgrades
  const upgradesCost = business.upgrades.reduce((total, upgrade) => {
    if (activeUpgrades.includes(upgrade.id)) {
      return total + upgrade.cost;
    }
    return total;
  }, 0);
  
  return Math.floor(basePrice + upgradesCost);
}

// Calculate upgrade price based on business quantity owned
export function calculateUpgradePrice(upgrade: BusinessUpgrade, businessQuantity: number): number {
  // Upgrade price increases by 100% for each additional business owned (linear)
  const multiplier = 1 + businessQuantity;
  return Math.floor(upgrade.cost * multiplier);
}