// Централизованный массив активов для трейдинга
// Вынесен для устранения циклических импортов
export interface TradingAsset {
  id: string;
  name: string;
  symbol: string;
  basePrice: number;
  type: 'crypto' | 'stock' | 'commodity';
  icon: string;
  volatility: number;
  yearlyGrowthRate: number;
  requiredLevel: number;
}

export const TRADING_ASSETS: TradingAsset[] = [
  {
    id: 'ko',
    name: 'Coca-Kola',
    symbol: 'KOLA',
    basePrice: 62,
    type: 'stock',
    icon: '🥤',
    volatility: 0.015,
    yearlyGrowthRate: 2,
    requiredLevel: 1
  },
  {
    id: 'oil',
    name: 'Crude Oil',
    symbol: 'OIL',
    basePrice: 73,
    type: 'commodity',
    icon: '🛢️',
    volatility: 0.045,
    yearlyGrowthRate: 2,
    requiredLevel: 1
  },
  {
    id: 'jnj',
    name: 'Johnson & Johnsen',
    symbol: 'JNSN',
    basePrice: 155,
    type: 'stock',
    icon: '💊',
    volatility: 0.016,
    yearlyGrowthRate: 2,
    requiredLevel: 1
  },
  {
    id: 'pg',
    name: 'Procter & Gambie',
    symbol: 'PRGB',
    basePrice: 156,
    type: 'stock',
    icon: '🧴',
    volatility: 0.014,
    yearlyGrowthRate: 2,
    requiredLevel: 1
  },
  {
    id: 'googl',
    name: 'Foogle Inc',
    symbol: 'FOGL',
    basePrice: 165,
    type: 'stock',
    icon: '🔍',
    volatility: 0.028,
    yearlyGrowthRate: 4,
    requiredLevel: 1
  },
  {
    id: 'amzn',
    name: 'Amazom LLC',
    symbol: 'AMZM',
    basePrice: 178,
    type: 'stock',
    icon: '📦',
    volatility: 0.032,
    yearlyGrowthRate: 3,
    requiredLevel: 1
  },
  {
    id: 'aapl',
    name: 'Tiple Technologies',
    symbol: 'AAPL',
    basePrice: 195,
    type: 'stock',
    icon: '🍎',
    volatility: 0.025,
    yearlyGrowthRate: 4,
    requiredLevel: 1
  },
  {
    id: 'jpm',
    name: 'KP Morgan Bank',
    symbol: 'KPM',
    basePrice: 215,
    type: 'stock',
    icon: '🏦',
    volatility: 0.035,
    yearlyGrowthRate: 3,
    requiredLevel: 1
  },
  {
    id: 'tsla',
    name: 'Desla Motors',
    symbol: 'TSLA',
    basePrice: 248,
    type: 'stock',
    icon: '⚡',
    volatility: 0.035,
    yearlyGrowthRate: 4,
    requiredLevel: 1
  },
  {
    id: 'silver',
    name: 'Silver',
    symbol: 'SILVER',
    basePrice: 400,
    type: 'commodity',
    icon: '🥈',
    volatility: 0.035,
    yearlyGrowthRate: 2,
    requiredLevel: 1
  },
  {
    id: 'msft',
    name: 'Microsys Corp',
    symbol: 'MSFT',
    basePrice: 420,
    type: 'stock',
    icon: '🖥️',
    volatility: 0.022,
    yearlyGrowthRate: 4,
    requiredLevel: 1
  },
  {
    id: 'nvda',
    name: 'Mvidia Corp',
    symbol: 'NVDA',
    basePrice: 875,
    type: 'stock',
    icon: '🎮',
    volatility: 0.055,
    yearlyGrowthRate: 7,
    requiredLevel: 1
  },
  {
    id: 'platinum',
    name: 'Platinum',
    symbol: 'PLAT',
    basePrice: 950,
    type: 'commodity',
    icon: '⚪',
    volatility: 0.042,
    yearlyGrowthRate: 1,
    requiredLevel: 1
  },
  {
    id: 'gold',
    name: 'Gold',
    symbol: 'GOLD',
    basePrice: 2045,
    type: 'commodity',
    icon: '🥇',
    volatility: 0.020,
    yearlyGrowthRate: 1,
    requiredLevel: 1
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    basePrice: 3450,
    type: 'crypto',
    icon: '⟠',
    volatility: 0.045,
    yearlyGrowthRate: 5,
    requiredLevel: 1
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    basePrice: 67500,
    type: 'crypto',
    icon: '₿',
    volatility: 0.05,
    yearlyGrowthRate: 5,
    requiredLevel: 1
  },
  {
    id: 'brk',
    name: 'Berkshite Holdings',
    symbol: 'BRK',
    basePrice: 545000,
    type: 'stock',
    icon: '💎',
    volatility: 0.018,
    yearlyGrowthRate: 3,
    requiredLevel: 5
  },
  {
    id: 'uranium',
    name: 'Uranium',
    symbol: 'URAN',
    basePrice: 250000000,
    type: 'commodity',
    icon: '☢️',
    volatility: 0.065,
    yearlyGrowthRate: 8,
    requiredLevel: 1
  },
  {
    id: 'magdoladns',
    name: 'Magdoladns',
    symbol: 'MGD',
    basePrice: 95,
    type: 'stock',
    icon: '🍔',
    volatility: 0.022,
    yearlyGrowthRate: 3,
    requiredLevel: 1
  },
  {
    id: 'burger_queen',
    name: 'Burger Queen',
    symbol: 'BQ',
    basePrice: 95,
    type: 'stock',
    icon: '👑',
    volatility: 0.021,
    yearlyGrowthRate: 2,
    requiredLevel: 1
  },
  {
    id: 'biocat',
    name: 'BIOCAT',
    symbol: 'BIO',
    basePrice: 95,
    type: 'stock',
    icon: '🧬',
    volatility: 0.023,
    yearlyGrowthRate: 3,
    requiredLevel: 1
  },
  {
    id: 'krc',
    name: 'Fried Chickens',
    symbol: 'KRC',
    basePrice: 33,
    type: 'stock',
    icon: '🐔',
    volatility: 0.018,
    yearlyGrowthRate: 2,
    requiredLevel: 1
  },
  {
    id: 'chtz',
    name: 'Chelyabinsk Tractor Plant',
    symbol: 'CHTZ',
    basePrice: 120,
    type: 'stock',
    icon: '🚜',
    volatility: 0.022,
    yearlyGrowthRate: 2,
    requiredLevel: 1
  }
];
