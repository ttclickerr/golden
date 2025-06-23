import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Home, Building, MapPin, TrendingUp } from "lucide-react";
import { AssetData, calculatePrice, formatNumber } from "@/lib/gameData";
import { GameState } from "@/hooks/useGameState";

interface RealEstateSectionProps {
  assets: AssetData[];
  gameState: GameState;
  onBuy: (assetId: string) => void;
}

export function RealEstateSection({ assets, gameState, onBuy }: RealEstateSectionProps) {
  const realEstateAssets = assets.filter(asset => asset.category === 'realestate');
  
  const getPropertyType = (assetId: string) => {
    if (assetId.includes('apartment')) return { icon: Home, type: 'Жилая', color: 'text-blue-400' };
    if (assetId.includes('house')) return { icon: Home, type: 'Частная', color: 'text-green-400' };
    if (assetId.includes('skyscraper')) return { icon: Building, type: 'Коммерческая', color: 'text-purple-400' };
    if (assetId.includes('island')) return { icon: MapPin, type: 'Элитная', color: 'text-yellow-400' };
    return { icon: Building, type: 'Смешанная', color: 'text-gray-400' };
  };

  const getAppreciationRate = (assetId: string) => {
    const baseRate = 8; // 8% базовая оценка
    const bonus = (gameState.investments[assetId] || 0) * 0.5; // Бонус за количество
    return baseRate + bonus;
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          🏡 Агентство недвижимости
        </h2>
        <p className="text-gray-400 mt-2">Инвестируйте в недвижимость</p>
      </div>

      {/* Рыночная информация */}
      <Card className="glass-card border border-green-500/30 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-green-400">+15.2%</div>
            <div className="text-xs text-gray-400">Рост цен</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-400">2.1%</div>
            <div className="text-xs text-gray-400">Ставка ипотеки</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">
              {Object.values(gameState.investments).reduce((sum, qty) => sum + qty, 0)}
            </div>
            <div className="text-xs text-gray-400">Ваши объекты</div>
          </div>
        </div>
      </Card>

      {/* Список недвижимости */}
      <div className="space-y-3">
        {realEstateAssets.map(asset => {
          const quantity = gameState.investments[asset.id] || 0;
          const price = calculatePrice(asset.basePrice, quantity, asset.multiplier);
          const canAfford = gameState.balance >= price;
          const propertyInfo = getPropertyType(asset.id);
          const IconComponent = propertyInfo.icon;
          const appreciationRate = getAppreciationRate(asset.id);
          
          return (
            <Card 
              key={asset.id}
              className={`glass-card border border-green-500/20 p-4 hover:border-green-500/50 transition-all cursor-pointer ${
                !canAfford ? 'opacity-50' : ''
              }`}
              onClick={() => canAfford && onBuy(asset.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <IconComponent className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{asset.name}</h3>
                      <Badge className={`bg-green-500/20 ${propertyInfo.color}`}>
                        {propertyInfo.type}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        +{appreciationRate.toFixed(1)}%/год
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Доход: +${formatNumber(asset.baseIncome)}/сек • Владение: {quantity}
                    </p>
                    <p className="text-gray-400 text-xs">{asset.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-xl ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                    ${formatNumber(price)}
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Растет в цене
                  </div>
                  {quantity > 0 && (
                    <div className="text-xs text-green-400">
                      Общий доход: +${formatNumber(asset.baseIncome * quantity)}/сек
                    </div>
                  )}
                </div>
              </div>
              
              {quantity > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Портфель недвижимости</span>
                    <span>{quantity} объектов</span>
                  </div>
                  <Progress value={Math.min((quantity / 5) * 100, 100)} className="h-2" />
                  <div className="text-xs text-blue-400 mt-1">
                    Стоимость растет на {appreciationRate.toFixed(1)}% в год
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Информация о рынке */}
      <Card className="glass-card border-emerald-500/30 p-4 bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <Building className="text-black w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-emerald-400">Рынок недвижимости:</div>
            <div className="text-sm text-gray-300">
              Стабильные доходы + рост стоимости. Чем больше объектов - тем выше доходность!
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}