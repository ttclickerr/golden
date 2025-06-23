import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Coins, Gift, Star, Sparkles, Clock, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface StoreSectionProps {
  gameState: any;
  onPurchase: (type: string, amount?: number) => void;
  isPremium: boolean;
}

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  category: 'currency' | 'boosters' | 'premium';
  popular?: boolean;
  type: 'one-time' | 'consumable';
}

export function StoreSection({ gameState, onPurchase, isPremium }: StoreSectionProps) {
  const { t } = useTranslation();

  const storeItems: StoreItem[] = [
    // Premium Features (выбор без выбора)
    {
      id: 'remove_ads',
      name: t('removeAds'),
      description: 'Remove all advertisements forever + exclusive features',
      price: '$9.99',
      value: 1,
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-600',
      category: 'premium',
      type: 'one-time',
      popular: true
    },
    
    // Currency Packages
    {
      id: 'currency_starter',
      name: 'Starter Capital',
      description: '$100K game money',
      price: '$0.99',
      value: 100000,
      icon: <Coins className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-600',
      category: 'currency',
      type: 'consumable'
    },
    {
      id: 'currency_growth',
      name: 'Growth Package',
      description: '$500K + 20% bonus',
      price: '$4.99',
      value: 600000,
      icon: <Coins className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-600',
      category: 'currency',
      type: 'consumable'
    },
    {
      id: 'currency_empire',
      name: 'Empire Package',
      description: '$2M + 50% bonus',
      price: '$19.99',
      value: 3000000,
      icon: <Sparkles className="w-6 h-6" />,
      gradient: 'from-yellow-500 to-orange-600',
      category: 'currency',
      type: 'consumable'
    },
    
    // Premium Boosters
    {
      id: 'booster_mega_click',
      name: 'Mega Click Booster',
      description: '10x click power for 30 minutes',
      price: '$2.99',
      value: 1,
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-red-500 to-pink-600',
      category: 'boosters',
      type: 'consumable'
    },
    {
      id: 'booster_income_rush',
      name: 'Income Rush',
      description: '5x passive income for 1 hour',
      price: '$3.99',
      value: 1,
      icon: <Star className="w-6 h-6" />,
      gradient: 'from-indigo-500 to-purple-600',
      category: 'boosters',
      type: 'consumable'
    },
    {
      id: 'booster_cooldown_reset',
      name: t('cooldownReset'),
      description: 'Reset all reward cooldowns instantly',
      price: '$1.99',
      value: 1,
      icon: <RefreshCw className="w-6 h-6" />,
      gradient: 'from-teal-500 to-cyan-600',
      category: 'boosters',
      type: 'consumable'
    }
  ];

  const handlePurchase = (item: StoreItem) => {
    onPurchase(item.id, item.value);
  };

  const renderStoreItem = (item: StoreItem) => (
    <Card 
      key={item.id}
      className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 overflow-hidden group"
    >
      {item.popular && (
        <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          POPULAR
        </Badge>
      )}
      
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg`}>
            {item.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
            <p className="text-gray-300 text-xs leading-relaxed">{item.description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white">{item.price}</div>
          <Button
            onClick={() => handlePurchase(item)}
            disabled={isPremium && item.id === 'remove_ads'}
            className={`bg-gradient-to-r ${item.gradient} hover:opacity-90 text-white px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50`}
          >
            {isPremium && item.id === 'remove_ads' ? 'OWNED' : 'BUY'}
          </Button>
        </div>
      </div>
    </Card>
  );

  const premiumItems = storeItems.filter(item => item.category === 'premium');
  const currencyItems = storeItems.filter(item => item.category === 'currency');
  const boosterItems = storeItems.filter(item => item.category === 'boosters');

  return (
    <div className="space-y-6 p-4">
      {/* Premium Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">{t('premiumFeatures')}</h2>
        </div>
        <div className="grid gap-3">
          {premiumItems.map(renderStoreItem)}
        </div>
      </div>

      {/* Currency Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-bold text-white">{t('currency')}</h2>
        </div>
        <div className="grid gap-3">
          {currencyItems.map(renderStoreItem)}
        </div>
      </div>

      {/* Boosters Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Premium Boosters</h2>
        </div>
        <div className="grid gap-3">
          {boosterItems.map(renderStoreItem)}
        </div>
      </div>
    </div>
  );
}