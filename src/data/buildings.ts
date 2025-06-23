import { Building } from '../types/game';

// Define all buildings
const buildings: Building[] = [
  // Tier 1
  {
    id: 'lemonade_stand',
    name: 'Lemonade Stand',
    description: 'Sell refreshing lemonade for a small profit.',
    basePrice: 10,
    baseIncomePerSecond: 0.1,
    count: 0,
    tier: 1,
  },
  {
    id: 'newspaper_delivery',
    name: 'Newspaper Route',
    description: 'Deliver newspapers in the neighborhood.',
    basePrice: 100,
    baseIncomePerSecond: 1,
    count: 0,
    tier: 1,
  },
  
  // Tier 2
  {
    id: 'coffee_shop',
    name: 'Coffee Shop',
    description: 'Serve coffee to busy professionals.',
    basePrice: 1000,
    baseIncomePerSecond: 10,
    count: 0,
    tier: 2,
  },
  {
    id: 'pizza_restaurant',
    name: 'Pizza Restaurant',
    description: 'Everyone loves pizza!',
    basePrice: 5000,
    baseIncomePerSecond: 50,
    count: 0,
    tier: 2,
  },
  
  // Tier 3
  {
    id: 'grocery_store',
    name: 'Grocery Store',
    description: 'A local grocery store with fresh produce.',
    basePrice: 25000,
    baseIncomePerSecond: 250,
    count: 0,
    tier: 3,
  },
  {
    id: 'car_dealership',
    name: 'Car Dealership',
    description: 'Sell cars with a good commission.',
    basePrice: 100000,
    baseIncomePerSecond: 1000,
    count: 0,
    tier: 3,
  },
  
  // Tier 4
  {
    id: 'shopping_mall',
    name: 'Shopping Mall',
    description: 'A large shopping center with multiple stores.',
    basePrice: 500000,
    baseIncomePerSecond: 5000,
    count: 0,
    tier: 4,
  },
  {
    id: 'tech_startup',
    name: 'Tech Startup',
    description: 'A promising technology startup with innovative ideas.',
    basePrice: 2000000,
    baseIncomePerSecond: 20000,
    count: 0,
    tier: 4,
  },
  
  // Tier 5
  {
    id: 'bank',
    name: 'Bank',
    description: 'A financial institution providing loans and services.',
    basePrice: 10000000,
    baseIncomePerSecond: 100000,
    count: 0,
    tier: 5,
  },
  {
    id: 'oil_company',
    name: 'Oil Company',
    description: 'Extract and refine oil for massive profits.',
    basePrice: 50000000,
    baseIncomePerSecond: 500000,
    count: 0,
    tier: 5,
  },
];

// Utility functions
export function getAllBuildings(): Building[] {
  return buildings;
}

export function getBuildingById(id: string): Building | undefined {
  return buildings.find(building => building.id === id);
}

export function calculateBuildingPrice(building: Building, currentCount: number): number {
  // Apply an exponential cost increase based on the number already owned
  return Math.floor(building.basePrice * Math.pow(1.15, currentCount));
}
