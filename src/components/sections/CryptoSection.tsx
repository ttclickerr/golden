import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TradingChart } from "@/components/TradingChart";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { AssetData, calculatePrice, formatNumber } from "@/lib/gameData";
import { GameState } from "@/hooks/useGameState";

interface CryptoSectionProps {
  assets: AssetData[];
  gameState: GameState;
  onBuy: (assetId: string) => void;
}

export function CryptoSection({ assets, gameState, onBuy }: CryptoSectionProps) {
  const cryptoAssets = assets.filter(asset => asset.category === 'crypto');
  
  // Симуляция волатильности криптовалют
  const getMarketTrend = (assetId: string) => {
    const seed = assetId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const trend = Math.sin(Date.now() / 10000 + seed) * 20;
    return trend;
  };

  const getMarketStatus = (trend: number) => {
    if (trend > 5) return { status: 'bull', color: 'text-green-400', icon: TrendingUp };
    if (trend < -5) return { status: 'bear', color: 'text-red-400', icon: TrendingDown };
    return { status: 'stable', color: 'text-yellow-400', icon: Activity };
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
          🪙 Криптобиржа
        </h2>
        <p className="text-gray-400 mt-2">Торгуйте цифровыми валютами</p>
      </div>

      {/* Общий рыночный индикатор */}
      <Card className="glass-card border border-orange-500/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-orange-400">Крипторынок</div>
            <div className="text-sm text-gray-400">Общая капитализация</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">+12.4%</div>
            <div className="text-sm text-gray-400">24h изменение</div>
          </div>
        </div>
      </Card>

      {/* Графики топ криптовалют */}
      <div className="space-y-4">
        {cryptoAssets.slice(0, 2).map(asset => (
          <TradingChart
            key={`chart-${asset.id}`}
            assetName={asset.name}
            currentPrice={asset.basePrice}
            assetType="crypto"
          />
        ))}
      </div>

      {/* Список криптовалют */}
      <div className="space-y-3">
        {cryptoAssets.map(asset => {
          const quantity = gameState.investments[asset.id] || 0;
          const price = calculatePrice(asset.basePrice, quantity, asset.multiplier);
          const canAfford = gameState.balance >= price;
          const trend = getMarketTrend(asset.id);
          const marketStatus = getMarketStatus(trend);
          const IconComponent = marketStatus.icon;
          
          return (
            <Card 
              key={asset.id}
              className={`glass-card border border-orange-500/20 p-4 hover:border-orange-500/50 transition-all cursor-pointer ${
                !canAfford ? 'opacity-50' : ''
              }`}
              onClick={() => canAfford && onBuy(asset.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    <i className={`${asset.icon} text-white text-xl`}></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{asset.name}</h3>
                      <IconComponent className={`w-4 h-4 ${marketStatus.color}`} />
                      <Badge className={`${
                        trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm">
                      +${formatNumber(asset.baseIncome)}/сек • Владение: {quantity}
                    </p>
                    <p className="text-gray-400 text-xs">{asset.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-xl ${canAfford ? 'text-orange-400' : 'text-red-400'}`}>
                    ${formatNumber(price)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Рынок: {marketStatus.status === 'bull' ? 'Бычий' : marketStatus.status === 'bear' ? 'Медвежий' : 'Стабильный'}
                  </div>
                  {quantity > 0 && (
                    <div className="text-xs text-green-400">
                      Доход: +${formatNumber(asset.baseIncome * quantity)}/сек
                    </div>
                  )}
                </div>
              </div>
              
              {quantity > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Прогресс инвестиций</span>
                    <span>{quantity}/10</span>
                  </div>
                  <Progress value={Math.min((quantity / 10) * 100, 100)} className="h-2" />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Подсказка */}
      <Card className="glass-card border-amber-500/30 p-4 bg-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
            <i className="fas fa-lightbulb text-black text-sm"></i>
          </div>
          <div>
            <div className="font-bold text-amber-400">Совет:</div>
            <div className="text-sm text-gray-300">
              Криптовалюты очень волатильны - покупайте на спадах, продавайте на пиках!
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}