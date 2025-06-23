import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameState } from '@/lib/stores/useGameState';
import { calculateBuildingPrice } from '@/data/buildings';
import { Building } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, TrendingUp, Loader2, Play } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { applovinService } from '@/services/ApplovinService';
import { toast } from 'sonner';

interface BuildingItemProps {
  building: Building;
}

const BuildingItem = ({ building }: BuildingItemProps) => {
  const { t } = useTranslation();
  const { currentCurrency, buyBuilding, buildingPurchases = 0 } = useGameState();
  const [cooldown, setCooldown] = useState(0);
  const [isAdRequired, setIsAdRequired] = useState(false);
  
  const price = calculateBuildingPrice(building, building.count);
  const canAfford = currentCurrency >= price;
  
  // Calculate total income
  const totalIncome = building.count * building.baseIncomePerSecond;
  
  // Проверяем, нужно ли показывать рекламу
  useEffect(() => {
    // После каждых 3 покупок требуется реклама
    const freePurchasesLeft = 3 - (buildingPurchases % 3);
    setIsAdRequired(freePurchasesLeft === 0);
  }, [buildingPurchases]);
  
  // Управление кулдауном
  useEffect(() => {
    if (cooldown <= 0) return;
    
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [cooldown]);
  
  // Функция покупки здания
  const handleBuyBuilding = async () => {
    if (!canAfford) return;
    
    // Если на кулдауне, не даем купить
    if (cooldown > 0) {
      toast.error(`Подождите еще ${cooldown} сек перед следующей покупкой`);
      return;
    }
    
    // Если требуется реклама
    if (isAdRequired) {
      toast.info("Для продолжения покупок требуется посмотреть рекламу");
      const watched = await applovinService.showRewardedAd();
      
      if (!watched) {
        toast.error("Вы должны посмотреть рекламу, чтобы продолжить покупки");
        return;
      }
    }
    
    // Покупаем здание
    buyBuilding(building.id);
    
    // Устанавливаем кулдаун в 30 секунд
    setCooldown(30);
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 bg-[rgba(0,0,0,0.3)] border-[#4cc3a5]/30 text-white",
      building.count > 0 ? "border-[#4cc3a5] bg-[rgba(76,195,165,0.1)]" : "",
      building.count === 0 && canAfford ? "border-[#4cc3a5]/40" : "",
      !canAfford ? "opacity-80" : ""
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <Building2 className="mr-2 h-4 w-4 text-[#4cc3a5]" />
              <h3 className="font-semibold">{building.name}</h3>
              {building.count > 0 && (
                <span className="ml-2 bg-[rgba(76,195,165,0.2)] text-white px-2 py-0.5 rounded-full text-xs">
                  {building.count}
                </span>
              )}
            </div>
            <p className="text-sm text-white/70 mt-1">{building.description}</p>
            
            {building.count > 0 && (
              <div className="flex items-center text-xs mt-1 text-[#4cc3a5]">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>{formatNumber(totalIncome)}/s</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end">
            <Button
              variant={canAfford ? "default" : "outline"}
              size="sm"
              onClick={handleBuyBuilding}
              disabled={!canAfford}
              className={cn(
                "relative transition-all duration-200 bg-gradient-to-br from-[#4cc3a5] to-[#3a81d6] text-white border-0",
                !canAfford && "bg-none bg-[rgba(0,0,0,0.3)] border border-white/10 text-white/50",
                cooldown > 0 && "cursor-not-allowed opacity-70"
              )}
            >
              {cooldown > 0 ? (
                <div className="flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  <span>{cooldown}s</span>
                </div>
              ) : isAdRequired ? (
                <div className="flex items-center">
                  <Play className="h-3 w-3 mr-1" />
                  <span>${formatNumber(price)}</span>
                </div>
              ) : (
                <span>${formatNumber(price)}</span>
              )}
            </Button>
            
            <div className="text-xs text-white/70 mt-1">
              +${formatNumber(building.baseIncomePerSecond)}/s
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingItem;
