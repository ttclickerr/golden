import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Gift, 
  Zap, 
  RotateCcw, 
  TrendingUp, 
  Building2, 
  Dices,
  Clock,
  Star,
  Crown
} from 'lucide-react';
import { trackAnalyticsEvent } from '../lib/trackAnalyticsEvent';
import { runEcpmAuction, getEcpmBids } from '../lib/ecpmAuction';
import { RewardedAdsService, RewardedAdProvider } from '../services/RewardedAdsService';

interface AdRewardSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchAd: (rewardType: string) => void;
  gameState: any;
}

interface AdReward {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  cooldown: number; // минуты
  benefit: string;
  color: string;
  category: 'gameplay' | 'trading' | 'business' | 'casino';
}

const AD_REWARDS: AdReward[] = [
  
  // Gameplay
  {
    id: 'undo_action',
    name: 'Undo Action',
    description: 'Undoes the last action (purchase, sale)',
    icon: <RotateCcw className="w-5 h-5" />,
    cooldown: 3,
    benefit: 'Undo last action',
    color: 'from-blue-500 to-cyan-600',
    category: 'gameplay'
  },
  {
    id: 'instant_cash',
    name: 'Instant Cash',
    description: 'Receive amount equal to 30 minutes of passive income',
    icon: <Gift className="w-5 h-5" />,
    cooldown: 15,
    benefit: '30 min passive income',
    color: 'from-purple-500 to-pink-600',
    category: 'gameplay'
  },
  
  // Trading
  {
    id: 'free_trades',
    name: 'Free Trades',
    description: 'Next 5 stock purchases without commission',
    icon: <TrendingUp className="w-5 h-5" />,
    cooldown: 12,
    benefit: '5 trades without fees',
    color: 'from-indigo-500 to-purple-600',
    category: 'trading'
  },
  {
    id: 'market_insight',
    name: 'Market Insight',
    description: 'Shows future stock prices for 2 minutes',
    icon: <Star className="w-5 h-5" />,
    cooldown: 20,
    benefit: 'Price prediction for 2 min',
    color: 'from-amber-500 to-yellow-600',
    category: 'trading'
  },
  
  // Business
  {
    id: 'business_boost',
    name: 'Business Boost',
    description: 'All businesses generate 2.5x income for 15 minutes',
    icon: <Building2 className="w-5 h-5" />,
    cooldown: 10,
    benefit: '2.5x business income for 15 min',
    color: 'from-teal-500 to-green-600',
    category: 'business'
  },
  {
    id: 'discount_upgrades',
    name: 'Upgrade Discount',
    description: '50% discount on all business upgrades for 1 hour',
    icon: <Building2 className="w-5 h-5" />,
    cooldown: 25,
    benefit: '-50% upgrade prices for 1 hour',
    color: 'from-rose-500 to-red-600',
    category: 'business'
  },
  
  // Casino
  {
    id: 'lucky_spin',
    name: 'Lucky Spin',
    description: 'Guaranteed win in the next casino game',
    icon: <Dices className="w-5 h-5" />,
    cooldown: 30,
    benefit: 'Guaranteed win',
    color: 'from-violet-500 to-purple-600',
    category: 'casino'
  },
  {
    id: 'double_casino',
    name: 'Double Winnings',
    description: 'Doubles casino winnings for 20 minutes',
    icon: <Dices className="w-5 h-5" />,
    cooldown: 18,
    benefit: '2x casino winnings for 20 min',
    color: 'from-fuchsia-500 to-pink-600',
    category: 'casino'
  }
];

export function AdRewardSystem({ isOpen, onClose, onWatchAd, gameState }: AdRewardSystemProps) {
  const [adCooldowns, setAdCooldowns] = useState<Record<string, number>>({});

  const isOnCooldown = (rewardId: string): boolean => {
    const cooldownEnd = adCooldowns[rewardId];
    return cooldownEnd ? Date.now() < cooldownEnd : false;
  };

  const getCooldownProgress = (rewardId: string): number => {
    const cooldownEnd = adCooldowns[rewardId];
    if (!cooldownEnd) return 100;
    
    const now = Date.now();
    const reward = AD_REWARDS.find(r => r.id === rewardId);
    if (!reward) return 100;
    
    const cooldownStart = cooldownEnd - (reward.cooldown * 60 * 1000);
    const progress = ((now - cooldownStart) / (reward.cooldown * 60 * 1000)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getRemainingTime = (rewardId: string): string => {
    const cooldownEnd = adCooldowns[rewardId];
    if (!cooldownEnd) return '';
    
    const remaining = cooldownEnd - Date.now();
    if (remaining <= 0) return '';
    
    const minutes = Math.ceil(remaining / (60 * 1000));
    return `${minutes} мин`;
  };

  const handleWatchAd = async (reward: AdReward) => {
    // eCPM-аукцион между AdMob и IronSource
    const winner = runEcpmAuction();
    console.log(`[AdRewardSystem] eCPM аукцион: победитель — ${winner}`);

    // Логируем показ рекламы (до просмотра)
    const userId = localStorage.getItem('user_id') || 'anonymous';
    trackAnalyticsEvent({ event: 'rewarded_shown', adType: 'rewarded', provider: winner, userId, rewardId: reward.id });

    // Показываем реальную рекламу через сервис
    let adWatched = false;
    if (winner === 'admob') {
      adWatched = await RewardedAdsService.showRewardedAd(RewardedAdProvider.AdMob);
    } else if (winner === 'ironsource') {
      adWatched = await RewardedAdsService.showRewardedAd(RewardedAdProvider.IronSource);
    }

    if (adWatched) {
      // Устанавливаем кулдаун
      const cooldownEnd = Date.now() + (reward.cooldown * 60 * 1000);
      setAdCooldowns(prev => ({ ...prev, [reward.id]: cooldownEnd }));

      // Активируем награду (теперь с флагом успеха)
      onWatchAd(`${reward.id}:${winner}`);

      // Логируем успешную выдачу награды
      trackAnalyticsEvent({ event: 'rewarded_completed', adType: 'rewarded', provider: winner, userId, rewardId: reward.id });

      // Показываем уведомление
      console.log(`✅ Получена награда: ${reward.benefit} (provider: ${winner})`);
    } else {
      // Если просмотр не был завершён, можно залогировать failure
      trackAnalyticsEvent({ event: 'rewarded_failed', adType: 'rewarded', provider: winner, userId, rewardId: reward.id });
      console.log('❌ Реклама не просмотрена до конца, награда не выдана');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          Premium Rewards
        </h3>
      </div>

      {/* Показываем eCPM аукцион и победителя */}
      <div className="mb-2 text-xs text-center text-gray-400">
        {(() => {
          const bids = getEcpmBids();
          const winner = runEcpmAuction();
          return (
            <span>
              <b>Аукцион eCPM:</b> AdMob: <span style={{color:'#facc15'}}>${bids.find(b=>b.sdk==='admob')?.ecpm.toFixed(2)}</span>, IronSource: <span style={{color:'#38bdf8'}}>${bids.find(b=>b.sdk==='ironsource')?.ecpm.toFixed(2)}</span> — <b>Победитель:</b> <span style={{color:winner==='admob'?'#facc15':'#38bdf8'}}>{winner.toUpperCase()}</span>
            </span>
          );
        })()}
      </div>

      {/* Rewards Grid - Compact inline display */}
      <div className="grid grid-cols-2 gap-2">
        {AD_REWARDS.map(reward => {
          const onCooldown = isOnCooldown(reward.id);
          const progress = getCooldownProgress(reward.id);
          const remainingTime = getRemainingTime(reward.id);
          const bids = getEcpmBids();
          const winner = runEcpmAuction();
          return (
            <Card 
              key={reward.id}
              className={`glass-card border-white/10 p-2 transition-all ${
                onCooldown ? 'opacity-60' : 'hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className={`p-1 rounded bg-gradient-to-br ${reward.color} text-white`}>
                  {reward.icon}
                </div>
                <Badge variant="outline" className="text-xs border-gray-600 text-gray-400 h-4">
                  {reward.cooldown}m
                </Badge>
              </div>
              <h3 className="font-semibold text-white text-xs mb-1">{reward.name}</h3>
              <p className="text-xs text-gray-400 mb-2 leading-tight">{reward.benefit}</p>
              {/* Показываем победителя аукциона для каждой награды */}
              <div className="text-[10px] text-center mb-1">
                <span>
                  <b>eCPM:</b> AdMob: <span style={{color:'#facc15'}}>${bids.find(b=>b.sdk==='admob')?.ecpm.toFixed(2)}</span>, IronSource: <span style={{color:'#38bdf8'}}>${bids.find(b=>b.sdk==='ironsource')?.ecpm.toFixed(2)}</span> — <b>Победитель:</b> <span style={{color:winner==='admob'?'#facc15':'#38bdf8'}}>{winner.toUpperCase()}</span>
                </span>
              </div>
              {onCooldown ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Cooldown</span>
                    <span className="text-orange-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {remainingTime}
                    </span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              ) : (
                <Button 
                  onClick={() => handleWatchAd(reward)}
                  className={`w-full bg-gradient-to-r ${reward.color} hover:opacity-90 text-white font-semibold h-6 text-xs`}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Watch (30s)
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}