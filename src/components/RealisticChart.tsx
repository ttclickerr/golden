import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { generateHistoricalData, MARKET_ASSETS, formatPrice, calculatePriceChange, type MarketAsset, type PricePoint } from '@/lib/marketData';

interface RealisticChartProps {
  assetId: string;
  currentPrice: number;
  className?: string;
  period?: '1h' | '24h' | '7d' | '1m' | '3m';
}

export function RealisticChart({ assetId, currentPrice, className = "", period = '3m' }: RealisticChartProps) {
  const asset = useMemo(() => 
    MARKET_ASSETS.find(a => a.id === assetId) || MARKET_ASSETS[0], 
    [assetId]
  );

  const chartData = useMemo(() => {
    let daysBack = 90; // 3 месяца по умолчанию
    
    switch (period) {
      case '1h':
        daysBack = 1/24;
        break;
      case '24h':
        daysBack = 1;
        break;
      case '7d':
        daysBack = 7;
        break;
      case '1m':
        daysBack = 30;
        break;
      case '3m':
        daysBack = 90;
        break;
    }

    const historicalData = generateHistoricalData(asset, daysBack);
    
    // Добавляем текущую цену как последнюю точку
    const now = new Date();
    historicalData.push({
      time: now.toISOString().split('T')[0],
      price: currentPrice,
      volume: asset.baseVolume
    });

    return historicalData;
  }, [asset, currentPrice, period]);

  const priceChange = useMemo(() => {
    if (chartData.length < 2) return { absolute: 0, percentage: 0, isPositive: true };
    
    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    
    return calculatePriceChange(lastPrice, firstPrice);
  }, [chartData]);

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    
    switch (period) {
      case '1h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '24h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '7d':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case '1m':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '3m':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as PricePoint;
      const date = new Date(label);
      
      return (
        <div className="bg-gray-900/95 border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-xs mb-1">
            {date.toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-white font-semibold">
            ${formatPrice(data.price)}
          </p>
          {data.volume && (
            <p className="text-gray-400 text-xs mt-1">
              Volume: {(data.volume / 1000000).toFixed(1)}M
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Определяем цвет линии на основе изменения цены
  const lineColor = priceChange.isPositive ? '#10B981' : '#EF4444';
  const gradientId = `gradient-${assetId}-${period}`;

  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 ${className}`}>
      {/* Заголовок с ценой и изменением */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{asset.name}</h3>
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-white">
              ${formatPrice(currentPrice)}
            </span>
            <div className={`flex items-center px-2 py-1 rounded-md text-sm font-medium ${
              priceChange.isPositive 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              <span>
                {priceChange.isPositive ? '+' : ''}
                ${formatPrice(Math.abs(priceChange.absolute))} 
                ({priceChange.isPositive ? '+' : ''}{priceChange.percentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        
        {/* Период */}
        <div className="text-xs text-gray-400 uppercase tracking-wide">
          {period === '3m' ? '3 MONTHS' : period.toUpperCase()}
        </div>
      </div>

      {/* График */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickFormatter={formatXAxisLabel}
              interval="preserveStartEnd"
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickFormatter={(value) => `$${formatPrice(value)}`}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Line
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              fill={`url(#${gradientId})`}
              activeDot={{ 
                r: 4, 
                stroke: lineColor, 
                strokeWidth: 2, 
                fill: '#1F2937' 
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Статистика роста */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-400">Daily Growth</div>
            <div className="text-sm font-semibold text-green-400">
              +{((Math.pow(1 + asset.yearlyGrowthRate, 1/365) - 1) * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Yearly Target</div>
            <div className="text-sm font-semibold text-purple-400">
              +{(asset.yearlyGrowthRate * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Volatility</div>
            <div className="text-sm font-semibold text-blue-400">
              {(asset.volatility * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}