// Common type definitions for use across the application
import { GameState as GameStateFromTypes } from './gameTypes';
import { GameState as GameStateFromHooks } from '../hooks/useGameState';

// Extended GameState that combines both definitions
export interface ExtendedGameState extends Partial<GameStateFromTypes>, Partial<GameStateFromHooks> {
  balance: number;
  level: number;
  xp: number;
  maxXp: number;
  clickValue: number;
  passiveIncome: number;
  totalClicks: number;
  investments: Record<string, number>;
  investmentPurchases: Record<string, { totalShares: number; totalCost: number }>;
  businesses: Record<string, { 
    owned: boolean;
    purchaseDate: number;
    upgrades: string[];
    quantity?: number;
  }>;
  isPremium: boolean;
  premiumType?: 'weekly' | 'lifetime';
  achievements: string[];
}
