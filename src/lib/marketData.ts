// Реалистичные рыночные данные и симуляция
export interface PricePoint {
  time: string;
  price: number;
  volume?: number;
}

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  yearlyGrowthRate: number; // 4.0 = 400% в год
  volatility: number; // 0.02 = 2% дневной волатильности
  baseVolume: number;
}

// Основные торговые активы с реалистичными параметрами
export const MARKET_ASSETS: MarketAsset[] = [
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 201.15,
    yearlyGrowthRate: 4.0, // 400% в год
    volatility: 0.025,
    baseVolume: 50000000
  },
  {
    id: 'tsla',
    symbol: 'TSLA', 
    name: 'Tesla Inc.',
    currentPrice: 248.50,
    yearlyGrowthRate: 3.5, // 350% в год
    volatility: 0.035,
    baseVolume: 25000000
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    currentPrice: 43250,
    yearlyGrowthRate: 5.0, // 500% в год
    volatility: 0.05,
    baseVolume: 15000
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    currentPrice: 2650,
    yearlyGrowthRate: 4.5, // 450% в год
    volatility: 0.045,
    baseVolume: 200000
  }
];

// Генерация исторических данных за последние 3 месяца
export function generateHistoricalData(asset: MarketAsset, daysBack: number = 90): PricePoint[] {
  const data: PricePoint[] = [];
  const now = new Date();
  
  // Начинаем с цены 3 месяца назад (обратный расчет)
  const dailyGrowthRate = Math.pow(1 + asset.yearlyGrowthRate, 1/365) - 1;
  const startPrice = asset.currentPrice / Math.pow(1 + dailyGrowthRate, daysBack);
  
  for (let i = daysBack; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Базовый рост
    const daysFromStart = daysBack - i;
    const trendPrice = startPrice * Math.pow(1 + dailyGrowthRate, daysFromStart);
    
    // Добавляем волатильность (случайные колебания)
    const volatilityFactor = 1 + (Math.random() - 0.5) * asset.volatility * 2;
    const finalPrice = trendPrice * volatilityFactor;
    
    // Генерируем объем торгов
    const baseVolume = asset.baseVolume;
    const volumeVariation = 0.3; // ±30% от базового объема
    const volume = Math.floor(baseVolume * (1 + (Math.random() - 0.5) * volumeVariation));
    
    data.push({
      time: date.toISOString().split('T')[0], // YYYY-MM-DD
      price: Math.round(finalPrice * 100) / 100,
      volume: volume
    });
  }
  
  return data;
}

// Симуляция изменения цены в реальном времени
export function simulateRealTimePriceChange(
  currentPrice: number, 
  asset: MarketAsset,
  timeIntervalMinutes: number = 1
): number {
  // Дневной рост, пересчитанный на минуты
  const dailyGrowthRate = Math.pow(1 + asset.yearlyGrowthRate, 1/365) - 1;
  const minuteGrowthRate = dailyGrowthRate / (24 * 60);
  
  // Базовый тренд роста
  const trendPrice = currentPrice * (1 + minuteGrowthRate * timeIntervalMinutes);
  
  // Краткосрочная волатильность (меньше чем дневная)
  const shortTermVolatility = asset.volatility * Math.sqrt(timeIntervalMinutes / (24 * 60));
  const volatilityFactor = 1 + (Math.random() - 0.5) * shortTermVolatility * 2;
  
  return Math.round(trendPrice * volatilityFactor * 100) / 100;
}

// Расчет цены покупки/продажи со спредом
export function getBuyPrice(currentPrice: number, spread: number = 0.005): number {
  return Math.round(currentPrice * (1 + spread) * 100) / 100;
}

export function getSellPrice(currentPrice: number, spread: number = 0.005): number {
  return Math.round(currentPrice * (1 - spread) * 100) / 100;
}

// Форматирование чисел для UI
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }
  return price.toFixed(2);
}

export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return (volume / 1000000).toFixed(1) + 'M';
  } else if (volume >= 1000) {
    return (volume / 1000).toFixed(1) + 'K';
  }
  return volume.toString();
}

// Расчет изменения цены в процентах
export function calculatePriceChange(currentPrice: number, previousPrice: number): {
  absolute: number;
  percentage: number;
  isPositive: boolean;
} {
  const absolute = currentPrice - previousPrice;
  const percentage = (absolute / previousPrice) * 100;
  
  return {
    absolute: Math.round(absolute * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
    isPositive: absolute >= 0
  };
}