import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface TradingChartProps {
  assetName: string;
  currentPrice: number;
  assetType: 'crypto' | 'stock';
  className?: string;
}

interface PricePoint {
  time: string;
  price: number;
  volume?: number;
}

export function TradingChart({ assetName, currentPrice, assetType, className = "" }: TradingChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');

  // Генерация реалистичных данных
  useEffect(() => {
    const generatePriceData = () => {
      const points = timeframe === '1h' ? 60 : timeframe === '24h' ? 24 : 7;
      const data: PricePoint[] = [];
      let basePrice = currentPrice;
      
      // Волатильность зависит от типа актива
      const volatility = assetType === 'crypto' ? 0.05 : 0.02; // Крипто более волатильно
      
      for (let i = points; i >= 0; i--) {
        // Случайное изменение цены
        const change = (Math.random() - 0.5) * volatility;
        basePrice = basePrice * (1 + change);
        
        // Время
        const now = new Date();
        let timeStr = '';
        if (timeframe === '1h') {
          now.setMinutes(now.getMinutes() - i);
          timeStr = now.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
        } else if (timeframe === '24h') {
          now.setHours(now.getHours() - i);
          timeStr = now.toLocaleTimeString('ru', { hour: '2-digit' });
        } else {
          now.setDate(now.getDate() - i);
          timeStr = now.toLocaleDateString('ru', { month: 'short', day: 'numeric' });
        }
        
        data.push({
          time: timeStr,
          price: basePrice,
          volume: Math.random() * 1000000
        });
      }
      
      return data;
    };

    setPriceHistory(generatePriceData());
    
    // Обновление данных каждые 5 секунд для имитации реального времени
    const interval = setInterval(() => {
      setPriceHistory(prev => {
        const newData = [...prev];
        newData.shift(); // Удаляем первый элемент
        
        // Добавляем новую точку
        const lastPrice = newData[newData.length - 1]?.price || currentPrice;
        const volatility = assetType === 'crypto' ? 0.02 : 0.01;
        const change = (Math.random() - 0.5) * volatility;
        const newPrice = lastPrice * (1 + change);
        
        const now = new Date();
        let timeStr = '';
        if (timeframe === '1h') {
          timeStr = now.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
        } else if (timeframe === '24h') {
          timeStr = now.toLocaleTimeString('ru', { hour: '2-digit' });
        } else {
          timeStr = now.toLocaleDateString('ru', { month: 'short', day: 'numeric' });
        }
        
        newData.push({
          time: timeStr,
          price: newPrice,
          volume: Math.random() * 1000000
        });
        
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [timeframe, currentPrice, assetType]);

  const calculateChange = () => {
    if (priceHistory.length < 2) return { percent: 0, isPositive: true };
    
    const first = priceHistory[0].price;
    const last = priceHistory[priceHistory.length - 1].price;
    const percent = ((last - first) / first) * 100;
    
    return { percent: Math.abs(percent), isPositive: percent >= 0 };
  };

  const { percent, isPositive } = calculateChange();

  const maxPrice = Math.max(...priceHistory.map(p => p.price));
  const minPrice = Math.min(...priceHistory.map(p => p.price));
  const priceRange = maxPrice - minPrice;

  const formatPrice = (price: number) => {
    if (assetType === 'crypto') {
      return price > 1000 ? `$${price.toFixed(0)}` : `$${price.toFixed(2)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume > 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume > 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  return (
    <Card className={`glass-card border-white/10 p-4 ${className}`}>
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
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* График */}
      <div className="relative h-32 mb-4">
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Сетка */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Линия цены */}
          {priceHistory.length > 1 && (
            <polyline
              fill="none"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth="2"
              points={priceHistory.map((point, index) => {
                const x = (index / (priceHistory.length - 1)) * 100;
                const y = ((maxPrice - point.price) / priceRange) * 100;
                return `${x}%,${y}%`;
              }).join(' ')}
            />
          )}
          
          {/* Градиент под линией */}
          {priceHistory.length > 1 && (
            <defs>
              <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3"/>
                <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0"/>
              </linearGradient>
            </defs>
          )}
          
          {priceHistory.length > 1 && (
            <polygon
              fill="url(#priceGradient)"
              points={
                priceHistory.map((point, index) => {
                  const x = (index / (priceHistory.length - 1)) * 100;
                  const y = ((maxPrice - point.price) / priceRange) * 100;
                  return `${x}%,${y}%`;
                }).join(' ') + ` 100%,100% 0%,100%`
              }
            />
          )}
        </svg>
      </div>

      {/* Дополнительная информация */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gray-400">Макс</div>
          <div className="font-bold text-green-400">{formatPrice(maxPrice)}</div>
        </div>
        <div>
          <div className="text-gray-400">Мин</div>
          <div className="font-bold text-red-400">{formatPrice(minPrice)}</div>
        </div>
        <div>
          <div className="text-gray-400">Объем</div>
          <div className="font-bold text-blue-400">
            {formatVolume(priceHistory[priceHistory.length - 1]?.volume || 0)}
          </div>
        </div>
      </div>

      {/* Индикатор обновления */}
      <div className="flex items-center justify-center mt-2">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <BarChart3 className="w-3 h-3 animate-pulse" />
          <span>Обновление в реальном времени</span>
        </div>
      </div>
    </Card>
  );
}