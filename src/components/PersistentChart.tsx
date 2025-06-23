import { useState, useEffect, useRef } from "react";

interface PersistentChartProps {
  assetName: string;
  assetId: string;
  currentPrice: number;
  assetType: 'crypto' | 'stock' | 'commodity';
  className?: string;
}

interface PricePoint {
  time: number;
  price: number;
}

// Глобальное хранилище данных графиков
const chartDataStore = new Map<string, PricePoint[]>();

export function PersistentChart({ assetName, assetId, currentPrice, assetType, className = "" }: PersistentChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPriceRef = useRef(currentPrice);

  // Инициализация данных графика
  useEffect(() => {
    const storageKey = `chart_${assetId}`;
    
    if (!chartDataStore.has(storageKey)) {
      // Создаем начальные исторические данные
      const initialData: PricePoint[] = [];
      let price = currentPrice;
      const volatility = assetType === 'crypto' ? 0.02 : assetType === 'stock' ? 0.015 : 0.01;
      
      // Генерируем 30 точек истории (последние 30 минут)
      for (let i = 30; i >= 0; i--) {
        const change = (Math.random() - 0.5) * volatility;
        price = Math.max(price * (1 + change), 0.01);
        
        initialData.push({
          time: Date.now() - (i * 60000), // каждая минута
          price: price
        });
      }
      
      chartDataStore.set(storageKey, initialData);
    }
    
    setPriceHistory([...chartDataStore.get(storageKey)!]);
    
    // Запускаем обновление каждые 3 секунды
    intervalRef.current = setInterval(() => {
      const currentData = chartDataStore.get(storageKey) || [];
      const volatility = assetType === 'crypto' ? 0.008 : assetType === 'stock' ? 0.005 : 0.003;
      
      // Плавное изменение цены
      const lastPrice = lastPriceRef.current;
      const change = (Math.random() - 0.5) * volatility;
      const newPrice = Math.max(lastPrice * (1 + change), 0.01);
      
      const newPoint: PricePoint = {
        time: Date.now(),
        price: newPrice
      };
      
      // Добавляем новую точку и удаляем старые (оставляем последние 30)
      const updatedData = [...currentData, newPoint].slice(-30);
      chartDataStore.set(storageKey, updatedData);
      setPriceHistory([...updatedData]);
      
      lastPriceRef.current = newPrice;
    }, 3000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [assetId, assetType]);

  // Обновляем последнюю цену при изменении currentPrice
  useEffect(() => {
    lastPriceRef.current = currentPrice;
  }, [currentPrice]);

  if (priceHistory.length === 0) {
    return <div className={`${className} flex items-center justify-center text-gray-400`}>Loading chart...</div>;
  }

  const minPrice = Math.min(...priceHistory.map(p => p.price));
  const maxPrice = Math.max(...priceHistory.map(p => p.price));
  const priceRange = maxPrice - minPrice || 1;

  // Создаем SVG линию
  const svgPoints = priceHistory.map((point, index) => {
    const x = (index / (priceHistory.length - 1)) * 100;
    const y = 100 - ((point.price - minPrice) / priceRange) * 100;
    return `${x},${y}`;
  }).join(' ');

  const lastPoint = priceHistory[priceHistory.length - 1];
  const firstPoint = priceHistory[0];
  const priceChange = ((lastPoint.price - firstPoint.price) / firstPoint.price) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className={`${className} relative`}>
      {/* Мини-информация о цене */}
      <div className="absolute top-2 left-2 z-10">
        <div className="text-sm font-bold text-white">{assetName}</div>
        <div className="text-lg font-bold text-white">${lastPoint.price.toFixed(2)}</div>
        <div className={`text-sm font-bold flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          <span className="mr-1">{isPositive ? '↗' : '↘'}</span>
          {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
        </div>
      </div>

      {/* Кнопки периодов */}
      <div className="absolute top-2 right-2 z-10 flex space-x-1">
        <button className="px-2 py-1 text-xs bg-white/10 rounded text-gray-400">1h</button>
        <button className="px-2 py-1 text-xs bg-blue-500 rounded text-white font-bold">24h</button>
        <button className="px-2 py-1 text-xs bg-white/10 rounded text-gray-400">7d</button>
      </div>

      {/* График */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Фоновая сетка */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        
        {/* Градиент под линией */}
        <defs>
          <linearGradient id={`gradient-${assetId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* Заливка под графиком */}
        <polygon
          points={`0,100 ${svgPoints} 100,100`}
          fill={`url(#gradient-${assetId})`}
        />
        
        {/* Основная линия графика */}
        <polyline
          points={svgPoints}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Точки на графике */}
        {priceHistory.map((point, index) => {
          const x = (index / (priceHistory.length - 1)) * 100;
          const y = 100 - ((point.price - minPrice) / priceRange) * 100;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1"
              fill={isPositive ? "#10b981" : "#ef4444"}
              className="opacity-60"
            />
          );
        })}
        
        {/* Последняя точка - выделенная */}
        <circle
          cx={(priceHistory.length - 1) / (priceHistory.length - 1) * 100}
          cy={100 - ((lastPoint.price - minPrice) / priceRange) * 100}
          r="2"
          fill={isPositive ? "#10b981" : "#ef4444"}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}