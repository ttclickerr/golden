import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, RefreshCw } from 'lucide-react';

interface PremiumStoreProps {
  onPurchase?: (type: string) => void;
  isPremium?: boolean;
}

export function PremiumStore({ onPurchase, isPremium = false }: PremiumStoreProps) {
  
  const premiumFeatures = [
    {
      id: 'remove_ads',
      name: 'Remove Ads',
      description: 'Enjoy ad-free experience forever',
      price: '$9.99',
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-orange-500 to-red-600',
      popular: false
    }
  ];

  const boosters = [
    {
      id: 'reset_cooldowns',
      name: 'Reset Cooldowns',
      description: 'Reset all reward cooldowns instantly',
      price: '$1.99',
      icon: <RefreshCw className="w-6 h-6" />,
      gradient: 'from-cyan-500 to-blue-600',
      popular: false
    }
  ];

  const handlePurchase = (itemId: string) => {
    if (onPurchase) {
      onPurchase(itemId);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Premium Features Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          PREMIUM FEATURES
        </h3>
        
        {premiumFeatures.map(item => (
          <Card key={item.id} className="glass-card border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    {item.popular && (
                      <Badge className="bg-purple-600 text-white text-xs">
                        Most Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                </div>
              </div>
              
              <Button
                onClick={() => handlePurchase(item.id)}
                disabled={isPremium && item.id === 'remove_ads'}
                className={`${
                  isPremium && item.id === 'remove_ads'
                    ? 'bg-green-600 text-white' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                } border-0 rounded-lg px-4 py-2 font-semibold text-sm min-w-[80px]`}
              >
                {isPremium && item.id === 'remove_ads' ? 'Owned' : item.price}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Boosters Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          BOOSTERS
        </h3>
        
        {boosters.map(item => (
          <Card key={item.id} className="glass-card border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    {item.popular && (
                      <Badge className="bg-purple-600 text-white text-xs">
                        Most Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                </div>
              </div>
              
              <Button
                onClick={() => handlePurchase(item.id)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white border-0 rounded-lg px-4 py-2 font-semibold text-sm min-w-[80px]"
              >
                {item.price}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}