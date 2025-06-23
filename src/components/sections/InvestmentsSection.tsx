import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber, calculatePrice, ASSETS, INVESTMENT_CATEGORIES } from "@/lib/gameData";
import { Building, Car, Ship, Palette, Rocket, Store, Crown, Home, Coins } from "lucide-react";

interface InvestmentsSectionProps {
  gameState: any;
  onBuyAsset: (assetId: string) => void;
}

export function InvestmentsSection({ gameState, onBuyAsset }: InvestmentsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('realestate');

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'realestate': return Home;
      case 'cars': return Car;
      case 'yachts': return Ship;
      case 'art': return Palette;
      case 'space': return Rocket;
      case 'business': return Store;
      case 'crypto': return Coins;
      default: return Crown;
    }
  };

  const getRarityByPrice = (price: number): 'common' | 'rare' | 'epic' | 'legendary' => {
    if (price < 100000) return 'common';
    if (price < 1000000) return 'rare';
    if (price < 10000000) return 'epic';
    return 'legendary';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-300';
      case 'rare': return 'bg-blue-500/20 text-blue-300';
      case 'epic': return 'bg-purple-500/20 text-purple-300';
      case 'legendary': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getAssetsByCategory = (category: string) => {
    return ASSETS.filter(asset => asset.category === category);
  };

  const canAfford = (price: number) => {
    return gameState.balance >= price;
  };

  const getOwnedQuantity = (assetId: string) => {
    return gameState.investments[assetId] || 0;
  };

  return (
    <div className="space-y-6 pb-20">
      <Card className="glass-card border-white/10 p-4">
        <h2 className="text-xl font-bold mb-4 text-center">Инвестиции</h2>
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-1 bg-black/20 p-1">
            {INVESTMENT_CATEGORIES.map((category) => {
              const Icon = getIconForCategory(category.id);
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex flex-col items-center p-2 text-xs"
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="hidden sm:block">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {INVESTMENT_CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAssetsByCategory(category.id).map((asset) => {
                  const Icon = getIconForCategory(asset.category);
                  const rarity = getRarityByPrice(asset.basePrice);
                  const owned = getOwnedQuantity(asset.id);
                  const currentPrice = calculatePrice(asset.basePrice, owned, asset.multiplier);
                  const canBuy = canAfford(currentPrice);
                  const roi = (asset.baseIncome * 12 / asset.basePrice * 100);

                  return (
                    <Card key={asset.id} className={`glass-card border-white/10 p-4 hover:border-white/20 transition-all duration-300 ${!canBuy ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600/30 to-purple-600/30 flex items-center justify-center shadow-lg">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold">{asset.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">{asset.description}</p>
                          </div>
                        </div>
                        <Badge className={`${getRarityColor(rarity)} ml-2 rounded-md`}>
                          {rarity}
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Цена:</span>
                          <span className="font-bold text-white">${formatNumber(currentPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Доход/мес:</span>
                          <span className="text-green-400 font-medium">${formatNumber(asset.baseIncome * 30)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">ROI:</span>
                          <span className="text-blue-400 font-medium">{roi.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Владеете:</span>
                          <span className="font-medium text-white">{formatNumber(owned)}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => onBuyAsset(asset.id)}
                          disabled={!canBuy}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 shadow-lg disabled:from-gray-600 disabled:to-gray-700"
                        >
                          {canBuy ? `Buy` : 'Insufficient funds'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}