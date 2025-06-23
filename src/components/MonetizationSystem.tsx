import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, Zap, Coins, Gift, Star, Sparkles } from 'lucide-react';

interface MonetizationSystemProps {
  gameState: any;
  onPurchase: (type: string, amount?: number) => void;
  isPremium: boolean;
}

interface PurchaseOption {
  id: string;
  name: string;
  description: string;
  price: string;
  value: number;
  bonus?: string;
  icon: React.ReactNode;
  gradient: string;
  popular?: boolean;
}

export function MonetizationSystem({ gameState, onPurchase, isPremium }: MonetizationSystemProps) {
  const [showStore, setShowStore] = useState(false);
  const [activeTab, setActiveTab] = useState<'currency' | 'boosters' | 'premium'>('currency');

  // Пакеты валюты
  const currencyPackages: PurchaseOption[] = [
    {
      id: 'currency_small',
      name: 'Starter Capital',
      description: '$50,000 game money',
      price: '$0.99',
      value: 50000,
      icon: <Coins className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      id: 'currency_medium',
      name: 'Investment Package',
      description: '$250,000 + 10% bonus',
      price: '$4.99',
      value: 275000,
      bonus: '+10% bonus',
      icon: <Coins className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-600',
      popular: true
    },
    {
      id: 'currency_large',
      name: 'Tycoon Package',
      description: '$1,000,000 + 20% bonus',
      price: '$19.99',
      value: 1200000,
      bonus: '+20% bonus',
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      id: 'currency_mega',
      name: 'Миллиардерский пакет',
      description: '$5,000,000 + 30% бонус',
      price: '$49.99',
      value: 6500000,
      bonus: '+30% бонус',
      icon: <Sparkles className="w-6 h-6" />,
      gradient: 'from-yellow-500 to-orange-600'
    }
  ];

  // Бустеры
  const boosterPackages: PurchaseOption[] = [
    {
      id: 'booster_click_2x',
      name: 'Двойной клик',
      description: '2x доход с кликов на 1 час',
      price: '$1.99',
      value: 3600,
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'booster_income_3x',
      name: 'Тройной доход',
      description: '3x пассивный доход на 2 часа',
      price: '$2.99',
      value: 7200,
      icon: <Star className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-600',
      popular: true
    },
    {
      id: 'booster_mega',
      name: 'Мега-бустер',
      description: '5x всех доходов на 30 минут',
      price: '$4.99',
      value: 1800,
      icon: <Sparkles className="w-6 h-6" />,
      gradient: 'from-yellow-500 to-red-600'
    }
  ];

  // Премиум опции
  const premiumOptions: PurchaseOption[] = [
    {
      id: 'remove_ads',
      name: 'Убрать рекламу',
      description: 'Навсегда убрать всю рекламу',
      price: '$2.99',
      value: 1,
      icon: <Gift className="w-6 h-6" />,
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: 'premium_full',
      name: 'Премиум пакет',
      description: 'Без рекламы + эксклюзивные инвестиции + бонусы',
      price: '$9.99',
      value: 1,
      bonus: 'Полный доступ',
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-purple-500 to-yellow-600',
      popular: true
    }
  ];

  const handlePurchase = (option: PurchaseOption) => {
    // В реальном приложении здесь будет Google Play Billing
    console.log('🛒 Покупка:', option);
    onPurchase(option.id, option.value);
    setShowStore(false);
  };

  const getCurrentPackages = () => {
    switch (activeTab) {
      case 'currency': return currencyPackages;
      case 'boosters': return boosterPackages;
      case 'premium': return premiumOptions;
      default: return currencyPackages;
    }
  };

  return (
    <>
      {/* Кнопка открытия магазина */}
      <Button
        onClick={() => setShowStore(true)}
        className="bg-gradient-to-r from-purple-500 via-violet-600 to-cyan-500 hover:from-purple-600 hover:via-violet-700 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105"
      >
        <Crown className="w-5 h-5 mr-2" />
        STORE
      </Button>

      {/* Модальное окно магазина */}
      <Dialog open={showStore} onOpenChange={setShowStore}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20 border border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              PREMIUM CONTENT STORE
            </DialogTitle>
          </DialogHeader>

          {/* Вкладки */}
          <div className="flex space-x-2 mb-6">
            {[
              { id: 'currency', name: 'Currency', icon: Coins },
              { id: 'boosters', name: 'Boosters', icon: Zap },
              { id: 'premium', name: 'Premium', icon: Crown }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Сетка товаров */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
            {getCurrentPackages().map((option) => (
              <div
                key={option.id}
                className="relative p-4 rounded-xl bg-gray-800/50 border border-gray-600/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02]"
              >
                {option.popular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-lg">
                    POPULAR
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {option.icon}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{option.name}</h3>
                    <p className="text-gray-300 text-sm mb-2">{option.description}</p>
                    {option.bonus && (
                      <div className="inline-block bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-lg mb-2">
                        {option.bonus}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {option.price}
                      </span>
                      <Button
                        onClick={() => handlePurchase(option)}
                        className={`bg-gradient-to-r ${option.gradient} hover:opacity-90 text-white font-bold px-6 py-2 rounded-xl shadow-lg transition-all duration-300 hover:scale-105`}
                      >
                        BUY
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isPremium && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/30">
              <p className="text-center text-purple-300 text-sm">
                💎 Покупки поддерживают разработку игры и дают вам преимущество!
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}