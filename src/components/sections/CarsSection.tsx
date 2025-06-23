import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Car, Zap, Crown, Star } from "lucide-react";
import { AssetData, calculatePrice, formatNumber } from "@/lib/gameData";
import { GameState } from "@/hooks/useGameState";

interface CarsSectionProps {
  assets: AssetData[];
  gameState: GameState;
  onBuy: (assetId: string) => void;
}

export function CarsSection({ assets, gameState, onBuy }: CarsSectionProps) {
  const carAssets = assets.filter(asset => asset.category === 'cars');
  
  const getCarTier = (assetId: string) => {
    if (assetId.includes('bugatti')) return { tier: 'Гиперкар', icon: Crown, color: 'text-purple-400', rarity: 'legendary' };
    if (assetId.includes('mclaren')) return { tier: 'Суперкар', icon: Star, color: 'text-yellow-400', rarity: 'epic' };
    if (assetId.includes('lamborghini') || assetId.includes('ferrari')) return { tier: 'Спорткар', icon: Zap, color: 'text-orange-400', rarity: 'rare' };
    return { tier: 'Люкс', icon: Car, color: 'text-blue-400', rarity: 'common' };
  };

  const getCarPerformance = (asset: AssetData) => {
    const baseSpeed = Math.floor((asset.basePrice / 10000) + 200);
    const horsePower = Math.floor((asset.basePrice / 1000) + 400);
    return { speed: Math.min(baseSpeed, 500), horsePower: Math.min(horsePower, 1500) };
  };

  const getPrestigeBonus = (assetId: string) => {
    const quantity = gameState.investments[assetId] || 0;
    return quantity * 5; // 5% престижа за каждую машину
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-purple-500/50 bg-purple-500/5';
      case 'epic': return 'border-yellow-500/50 bg-yellow-500/5';
      case 'rare': return 'border-orange-500/50 bg-orange-500/5';
      default: return 'border-blue-500/50 bg-blue-500/5';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
          🏎️ Автосалон премиум-класса
        </h2>
        <p className="text-gray-400 mt-2">Коллекционируйте роскошные автомобили</p>
      </div>

      {/* Статистика коллекции */}
      <Card className="glass-card border border-red-500/30 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-red-400">
              {Object.entries(gameState.investments)
                .filter(([id]) => carAssets.some(car => car.id === id))
                .reduce((sum, [, qty]) => sum + qty, 0)}
            </div>
            <div className="text-xs text-gray-400">Автомобилей</div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-400">
              {Object.entries(gameState.investments)
                .filter(([id]) => carAssets.some(car => car.id === id))
                .reduce((sum, [id, qty]) => sum + getPrestigeBonus(id), 0)}%
            </div>
            <div className="text-xs text-gray-400">Престиж</div>
          </div>
          <div>
            <div className="text-xl font-bold text-yellow-400">VIP</div>
            <div className="text-xs text-gray-400">Статус клиента</div>
          </div>
        </div>
      </Card>

      {/* Список автомобилей */}
      <div className="space-y-3">
        {carAssets.map(asset => {
          const quantity = gameState.investments[asset.id] || 0;
          const price = calculatePrice(asset.basePrice, quantity, asset.multiplier);
          const canAfford = gameState.balance >= price;
          const carTier = getCarTier(asset.id);
          const performance = getCarPerformance(asset);
          const prestigeBonus = getPrestigeBonus(asset.id);
          const IconComponent = carTier.icon;
          
          return (
            <Card 
              key={asset.id}
              className={`glass-card border p-4 hover:border-red-500/50 transition-all cursor-pointer ${
                !canAfford ? 'opacity-50' : ''
              } ${getRarityColor(carTier.rarity)}`}
              onClick={() => canAfford && onBuy(asset.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <IconComponent className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{asset.name}</h3>
                      <Badge className={`${carTier.color} bg-black/30`}>
                        {carTier.tier}
                      </Badge>
                      {quantity > 0 && (
                        <Badge className="bg-purple-500/20 text-purple-400">
                          +{prestigeBonus}% престиж
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span>⚡ {performance.horsePower} л.с.</span>
                      <span>🏁 {performance.speed} км/ч</span>
                      <span>💰 +${formatNumber(asset.baseIncome)}/сек</span>
                    </div>
                    <p className="text-gray-400 text-xs">{asset.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-xl ${canAfford ? 'text-red-400' : 'text-red-600'}`}>
                    ${formatNumber(price)}
                  </div>
                  <div className="text-sm text-gray-400">
                    В гараже: {quantity}
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
                    <span>Коллекция {asset.name}</span>
                    <span>{quantity}/3 шт</span>
                  </div>
                  <Progress value={Math.min((quantity / 3) * 100, 100)} className="h-2" />
                  {quantity >= 3 && (
                    <div className="text-xs text-purple-400 mt-1">
                      ✨ Бонус коллекционера: +50% доходность!
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Бонусы VIP клиента */}
      <Card className="glass-card border-amber-500/30 p-4 bg-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
            <Crown className="text-black w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-amber-400">VIP Программа:</div>
            <div className="text-sm text-gray-300">
              Коллекционируйте одинаковые модели для получения бонусов! 3+ одинаковых авто = +50% доходность.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}