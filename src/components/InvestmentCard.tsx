import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AssetData, calculatePrice, calculateIncome, formatNumber } from "@/lib/gameData";

interface InvestmentCardProps {
  asset: AssetData;
  quantity: number;
  onBuy: (assetId: string) => void;
  canAfford: boolean;
}

export function InvestmentCard({ asset, quantity, onBuy, canAfford }: InvestmentCardProps) {
  const price = calculatePrice(asset.basePrice, quantity, asset.multiplier);
  const income = calculateIncome(asset.baseIncome, quantity);
  const progress = quantity > 0 ? Math.min((quantity / 10) * 100, 100) : 0;

  const getIconColor = (category: string) => {
    switch (category) {
      case 'crypto':
        return 'from-orange-500 to-yellow-600';
      case 'stocks':
        return 'from-blue-500 to-purple-600';
      case 'realestate':
        return 'from-green-500 to-emerald-600';
      case 'cars':
        return 'from-red-500 to-orange-600';
      case 'yachts':
        return 'from-cyan-500 to-blue-600';
      case 'art':
        return 'from-purple-500 to-pink-600';
      case 'business':
        return 'from-gray-600 to-gray-800';
      case 'space':
        return 'from-indigo-500 to-purple-700';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Card 
      className={`glass-card border-white/10 p-4 hover:border-[hsl(var(--tropico-teal))]/50 transition-all cursor-pointer ${
        !canAfford ? 'opacity-50' : ''
      }`}
      onClick={() => canAfford && onBuy(asset.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${getIconColor(asset.category)} rounded-xl flex items-center justify-center`}>
            <i className={`${asset.icon} text-white text-xl`}></i>
          </div>
          <div>
            <h3 className="font-bold text-lg">{asset.name}</h3>
            <p className="text-gray-300 text-sm">+${formatNumber(asset.baseIncome)}/sec</p>
            <p className="text-gray-400 text-xs">{asset.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold ${canAfford ? 'text-[hsl(var(--tropico-teal))]' : 'text-red-400'}`}>
            ${formatNumber(price)}
          </div>
          <div className="text-xs text-gray-400">Владение: {quantity}</div>
          {income > 0 && (
            <div className="text-xs text-green-400">+${formatNumber(income)}/sec</div>
          )}
        </div>
      </div>
      
      {quantity > 0 && (
        <div className="mt-3">
          <Progress value={progress} className="h-1" />
        </div>
      )}
    </Card>
  );
}
