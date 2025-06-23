import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SimpleChartProps {
  assetName: string;
  currentPrice: number;
  assetType: 'crypto' | 'stock' | 'commodity';
  className?: string;
}

interface PricePoint {
  time: string;
  price: number;
}

export function SimpleChart({ assetName, currentPrice, assetType, className = "" }: SimpleChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');

  // Генерация исторических данных
  useEffect(() => {
    const generateData = () => {
      const points = timeframe === '1h' ? 12 : timeframe === '24h' ? 24 : 7;
      const data: PricePoint[] = [];
      let price = currentPrice;
      
      const volatility = assetType === 'crypto' ? 0.03 : 0.015;
      
      for (let i = points; i >= 0; i--) {
        const change = (Math.random() - 0.5) * volatility;
        price = price * (1 + change);
        
        const now = new Date();
        let timeStr = '';
        if (timeframe === '1h') {
          now.setMinutes(now.getMinutes() - i * 5);
          timeStr = now.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
        } else if (timeframe === '24h') {
          now.setHours(now.getHours() - i);
          timeStr = now.toLocaleTimeString('ru', { hour: '2-digit' });
        } else {
          now.setDate(now.getDate() - i);
          timeStr = now.toLocaleDateString('ru', { month: 'short', day: 'numeric' });
        }
        
        data.push({ time: timeStr, price });
      }
      
      setPriceHistory(data);
    };

    generateData();
  }, [timeframe, currentPrice, assetType]);

  const calculateChange = () => {
    if (priceHistory.length < 2) return { percent: 0, isPositive: true };
    
    const first = priceHistory[0].price;
    const last = priceHistory[priceHistory.length - 1].price;
    const percent = ((last - first) / first) * 100;
    
    return { percent: Math.abs(percent), isPositive: percent >= 0 };
  };

  const { percent, isPositive } = calculateChange();

  // Создание SVG пути для графика
  const createPath = () => {
    if (priceHistory.length < 2) return '';
    
    const maxPrice = Math.max(...priceHistory.map(p => p.price));
    const minPrice = Math.min(...priceHistory.map(p => p.price));
    const priceRange = maxPrice - minPrice || 1;
    
    const width = 280;
    const height = 120;
    
    const points = priceHistory.map((point, index) => {
      const x = (index / (priceHistory.length - 1)) * width;
      const y = height - ((point.price - minPrice) / priceRange) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className={`glass-card border-white/10 p-4 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{assetName}</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {formatPrice(priceHistory[priceHistory.length - 1]?.price || currentPrice)}
            </span>
            <Badge className={`${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {isPositive ? '+' : '-'}{percent.toFixed(2)}%
            </Badge>
          </div>
        </div>
        
        {/* Таймфреймы */}
        <div className="flex gap-1">
          {['1h', '24h', '7d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf as any)}
              className={`px-2 py-1 text-xs rounded ${
                timeframe === tf 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG График */}
      <div className="relative h-32 mb-4">
        <svg width="100%" height="120" className="absolute inset-0">
          <defs>
            <linearGradient id={`gradient-${assetName}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {priceHistory.length > 1 && (
            <>
              {/* Область под графиком */}
              <path
                d={`${createPath()} L 280,120 L 0,120 Z`}
                fill={`url(#gradient-${assetName})`}
              />
              
              {/* Линия графика */}
              <path
                d={createPath()}
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth="2"
                fill="none"
                className="drop-shadow-sm"
              />
              
              {/* Точки на графике */}
              {priceHistory.map((point, index) => {
                const maxPrice = Math.max(...priceHistory.map(p => p.price));
                const minPrice = Math.min(...priceHistory.map(p => p.price));
                const priceRange = maxPrice - minPrice || 1;
                const x = (index / (priceHistory.length - 1)) * 280;
                const y = 120 - ((point.price - minPrice) / priceRange) * 120;
                
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2"
                    fill={isPositive ? "#10b981" : "#ef4444"}
                    className="opacity-60"
                  />
                );
              })}
            </>
          )}
        </svg>
      </div>
    </div>
  );
}