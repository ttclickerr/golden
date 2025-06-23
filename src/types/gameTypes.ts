export interface GameState {
  userId: string;
  balance: number;
  level: number;
  experience: number;
  prestige: number;
  lastUpdated: string;
}

export interface Investment {
  id: string;
  assetId: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  level: number;
  balance: number;
  totalWorth: number;
  country: string;
  isPremium: boolean;
}

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  isPremium: boolean;
  customNickname?: string;
  country: string;
  createdAt: string;
  lastUpdated: string;
}