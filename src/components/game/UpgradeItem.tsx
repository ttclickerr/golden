import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameState } from '@/lib/stores/useGameState';
import { calculateUpgradePrice } from '@/data/upgrades';
import { Upgrade } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Zap, Loader2, Play, Clock } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { applovinService } from '@/services/ApplovinService';
import { toast } from 'sonner';

interface UpgradeItemProps {
  upgrade: Upgrade;
  purchased: boolean;
}

const UpgradeItem = ({ upgrade, purchased }: UpgradeItemProps) => {
  const { t } = useTranslation();
  const { currentCurrency, buyUpgrade } = useGameState();
  const [cooldown, setCooldown] = useState(0);
  const [adRequired, setAdRequired] = useState(true); // Всегда требуем рекламу для улучшений
  
  const price = calculateUpgradePrice(upgrade);
  const canAfford = currentCurrency >= price;
  
  // Управление кулдауном
  useEffect(() => {
    if (cooldown <= 0) return;
    
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [cooldown]);
  
  // Обработчик покупки улучшения
  const handleBuyUpgrade = async () => {
    if (!canAfford) return;
    
    // Если на кулдауне, не даем купить
    if (cooldown > 0) {
      toast.error(`Подождите ${cooldown} сек перед покупкой улучшения`);
      return;
    }
    
    // Для улучшений всегда требуем просмотр рекламы
    toast.info("Для покупки улучшения необходимо посмотреть рекламу");
    const watched = await applovinService.showRewardedAd();
    
    if (!watched) {
      toast.error("Вы должны посмотреть рекламу для покупки улучшения");
      return;
    }
    
    // Покупаем улучшение
    buyUpgrade(upgrade.id);
    
    // Устанавливаем кулдаун в 60 секунд - для улучшений больший таймаут
    setCooldown(60);
  };
  
  // Format the effect description
  const getEffectDescription = (upgrade: Upgrade) => {
    const { type, value } = upgrade.effect;
    
    if (type === 'click_multiplier') {
      return t('upgrades.effectClickMultiplier', { value: `×${value}` });
    } else if (type === 'passive_income_multiplier') {
      return t('upgrades.effectPassiveMultiplier', { value: `×${value}` });
    }
    
    return '';
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 bg-[rgba(0,0,0,0.3)] border-[#4cc3a5]/30 text-white",
      purchased ? "border-[#4cc3a5] bg-[rgba(76,195,165,0.1)]" : "",
      !purchased && canAfford ? "border-[#4cc3a5]/40" : "",
      !purchased && !canAfford ? "opacity-70" : ""
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="font-semibold">{upgrade.name}</h3>
              {purchased && (
                <span className="ml-2 inline-flex items-center rounded-full bg-[rgba(76,195,165,0.2)] px-2 py-0.5 text-xs font-medium text-white">
                  <Check className="mr-1 h-3 w-3" />
                  {t('upgrades.owned')}
                </span>
              )}
            </div>
            <p className="text-sm text-white/70 mt-1">{upgrade.description}</p>
            <div className="flex items-center text-xs mt-1 text-[#4cc3a5]">
              <Zap className="h-3 w-3 mr-1" />
              <span>{getEffectDescription(upgrade)}</span>
            </div>
          </div>
          
          {!purchased && (
            <div className="ml-2 flex flex-col items-end">
              <Button
                variant={canAfford ? "default" : "outline"}
                size="sm"
                onClick={handleBuyUpgrade}
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
                ) : (
                  <div className="flex items-center">
                    <Play className="h-3 w-3 mr-1" />
                    <span>${formatNumber(price)}</span>
                  </div>
                )}
              </Button>
              
              {!purchased && (
                <div className="flex items-center text-xs text-white/60 mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Требуется реклама</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradeItem;
