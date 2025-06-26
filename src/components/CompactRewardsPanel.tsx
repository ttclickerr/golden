import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Gift, Clock, RefreshCw, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { RewardedAdsService, RewardedAdProvider } from '../services/RewardedAdsService';
import { runEcpmAuction } from '../lib/ecpmAuction';
import { trackAnalyticsEvent } from '../lib/trackAnalyticsEvent';
import { useAuth } from '@/hooks/useAuth';

interface CompactRewardsPanelProps {
  gameState: any;
  onWatchAd: (rewardType: string) => void;
  onPurchase?: (type: string) => void;
  isPremium?: boolean;
}

interface AdReward {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  cooldown: number; // минуты
  benefit: string;
  color: string;
  lastUsed?: number;
}

export function CompactRewardsPanel({ gameState, onWatchAd, onPurchase, isPremium = false }: CompactRewardsPanelProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Оптимизированные награды - только самые важные (выбор без выбора)
  const rewards: AdReward[] = [
    {
      id: 'double_income',
      name: 'Income Boost',
      description: '2x passive income for 15 minutes',
      icon: <Zap className="w-4 h-4" />,
      cooldown: 30,
      benefit: '+100% income',
      color: 'from-blue-500 to-cyan-600',
      lastUsed: gameState.lastAdRewards?.double_income || 0
    },
    {
      id: 'mega_click',
      name: 'Click Power',
      description: '5x click value for 10 minutes',
      icon: <Gift className="w-4 h-4" />,
      cooldown: 25,
      benefit: '+400% clicks',
      color: 'from-purple-500 to-pink-600',
      lastUsed: gameState.lastAdRewards?.mega_click || 0
    },
    {
      id: 'instant_money',
      name: 'Cash Reward',
      description: 'Get 10 minutes of passive income instantly',
      icon: <RefreshCw className="w-4 h-4" />,
      cooldown: 20,
      benefit: 'Instant cash',
      color: 'from-green-500 to-emerald-600',
      lastUsed: gameState.lastAdRewards?.instant_money || 0
    },
    {
      id: 'undo_action',
      name: 'Undo Action',
      description: 'Undo your last action and get 10% refund',
      icon: <RotateCcw className="w-4 h-4" />,
      cooldown: 5,
      benefit: 'Undo',
      color: 'from-blue-500 to-cyan-600',
      lastUsed: gameState.lastAdRewards?.undo_action || 0
    },
    {
      id: 'reset_progress_ad',
      name: 'Reset Progress',
      description: 'Start fresh with a new game - watch ad to confirm',
      icon: <RotateCcw className="w-4 h-4" />,
      cooldown: 10,
      benefit: 'Fresh Start',
      color: 'from-red-500 to-pink-600',
      lastUsed: gameState.lastAdRewards?.reset_progress_ad || 0
    }
  ];

  const isOnCooldown = (reward: AdReward): boolean => {
    if (!reward.lastUsed) return false;
    const timePassed = Date.now() - reward.lastUsed;
    return timePassed < (reward.cooldown * 60 * 1000);
  };

  const getCooldownTimeLeft = (reward: AdReward): string => {
    if (!reward.lastUsed) return '';
    const timePassed = Date.now() - reward.lastUsed;
    const timeLeft = (reward.cooldown * 60 * 1000) - timePassed;
    if (timeLeft <= 0) return '';
    
    const minutes = Math.ceil(timeLeft / (60 * 1000));
    return `${minutes}m`;
  };

  // Автоматическая активация реварда: сразу после просмотра рекламы награда выдается без лишних окон
  const handleWatchAd = async (reward: AdReward) => {
    if (isOnCooldown(reward)) return;
    const winner = runEcpmAuction();
    const userId = user?.uid || 'anonymous';
    trackAnalyticsEvent({ event: 'rewarded_shown', adType: 'rewarded', provider: winner, userId, rewardId: reward.id });
    let adWatched = false;
    if (winner === 'admob') {
      adWatched = await RewardedAdsService.showRewardedAd(RewardedAdProvider.AdMob);
    } else if (winner === 'ironsource') {
      adWatched = await RewardedAdsService.showRewardedAd(RewardedAdProvider.IronSource);
    }
    if (adWatched) {
      // Автоматически выдаем ревард, не показывая дополнительных окон
      onWatchAd(reward.id);
      trackAnalyticsEvent({ event: 'rewarded_completed', adType: 'rewarded', provider: winner, userId, rewardId: reward.id });
    } else {
      trackAnalyticsEvent({ event: 'rewarded_failed', adType: 'rewarded', provider: winner, userId, rewardId: reward.id });
    }
  };

  const handleResetCooldowns = () => {
    if (onPurchase) {
      onPurchase('cooldown_reset');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{t('rewards')}</h3>
        {!isPremium && (
          <Button
            onClick={handleResetCooldowns}
            size="sm"
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:opacity-90 text-white text-xs px-3 py-1"
          >
            Reset Cooldowns $1.99
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {rewards.map((reward) => {
          const onCooldown = isOnCooldown(reward);
          const timeLeft = getCooldownTimeLeft(reward);
          
          return (
            <div
              key={reward.id}
              className={`relative p-3 rounded-lg border transition-all duration-200 ${
                onCooldown
                  ? 'bg-gray-800/50 border-gray-600/30 opacity-60'
                  : 'bg-gradient-to-r border-purple-500/30 hover:border-purple-400/50 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${reward.color} flex items-center justify-center text-white shadow-lg`}>
                  {reward.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white text-sm">{reward.name}</h4>
                    <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                      {reward.benefit}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-xs">{reward.description}</p>
                </div>
                
                <div className="text-right">
                  {onCooldown ? (
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-medium">{timeLeft}</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleWatchAd(reward)}
                      size="sm"
                      className={`bg-gradient-to-r ${reward.color} hover:opacity-90 text-white text-xs px-4 py-2 shadow-lg`}
                    >
                      Get
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {isPremium && (
        <div className="mt-3 text-center">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            Premium - No Ads Required
          </Badge>
        </div>
      )}
    </Card>
  );
}