import { useState } from "react";
import { Zap, Crown, ShoppingCart } from "lucide-react";
import { BoostersPanel } from "./BoostersPanel";
import { AdRewardSystem } from "./AdRewardSystem";
import { MonetizationSystem } from "./MonetizationSystem";

interface BoosterRewardToggleProps {
  gameState: any;
  onBoosterActivate: (boosterId: string) => void;
  onWatchAd: (rewardType: string) => void;
  onPurchase?: (type: string, amount?: number) => void;
  isPremium?: boolean;
}

export function BoosterRewardToggle({ gameState, onBoosterActivate, onWatchAd, onPurchase, isPremium = false }: BoosterRewardToggleProps) {
  const [activeTab, setActiveTab] = useState<'boosters' | 'rewards' | 'store'>('boosters');

  return (
    <div className="space-y-3">
      {/* Premium Toggle Buttons */}
      <div className="flex gap-1 p-1 bg-gray-900/50 rounded-xl border border-purple-500/20">
        <button
          onClick={() => setActiveTab('boosters')}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs transition-all duration-300 flex-1 ${
            activeTab === 'boosters'
              ? 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white border border-blue-500/50 shadow-lg shadow-blue-500/20'
              : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 hover:from-gray-700 hover:to-gray-600 border border-gray-600/30'
          }`}
        >
          <div className={`absolute inset-0 rounded-lg blur-sm ${
            activeTab === 'boosters' ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20' : ''
          }`}></div>
          <Zap className={`w-4 h-4 relative z-10 ${activeTab === 'boosters' ? 'text-blue-300' : 'text-gray-400'}`} />
          <span className="relative z-10 tracking-wide">BOOSTERS</span>
        </button>
        
        <button
          onClick={() => setActiveTab('rewards')}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs transition-all duration-300 flex-1 ${
            activeTab === 'rewards'
              ? 'bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white border border-purple-500/50 shadow-lg shadow-purple-500/20'
              : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 hover:from-gray-700 hover:to-gray-600 border border-gray-600/30'
          }`}
        >
          <div className={`absolute inset-0 rounded-lg blur-sm ${
            activeTab === 'rewards' ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20' : ''
          }`}></div>
          <Crown className={`w-4 h-4 relative z-10 ${activeTab === 'rewards' ? 'text-yellow-400' : 'text-gray-400'}`} />
          <span className="relative z-10 tracking-wide">REWARDS</span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs transition-all duration-300 flex-1 ${
            activeTab === 'store'
              ? 'bg-gradient-to-r from-green-900 via-emerald-800 to-green-900 text-white border border-green-500/50 shadow-lg shadow-green-500/20'
              : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 hover:from-gray-700 hover:to-gray-600 border border-gray-600/30'
          }`}
        >
          <div className={`absolute inset-0 rounded-lg blur-sm ${
            activeTab === 'store' ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20' : ''
          }`}></div>
          <ShoppingCart className={`w-4 h-4 relative z-10 ${activeTab === 'store' ? 'text-green-300' : 'text-gray-400'}`} />
          <span className="relative z-10 tracking-wide">STORE</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'boosters' && (
        <BoostersPanel 
          gameState={gameState} 
          onBoosterActivate={onBoosterActivate}
        />
      )}
      
      {activeTab === 'rewards' && (
        <AdRewardSystem
          isOpen={true}
          onClose={() => setActiveTab('boosters')}
          onWatchAd={onWatchAd}
          gameState={gameState}
        />
      )}
      
      {activeTab === 'store' && onPurchase && (
        <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-white mb-2">💎 PREMIUM STORE</h3>
            <p className="text-gray-300 text-sm">Buy currency, boosters and premium features!</p>
          </div>
          
          <MonetizationSystem 
            gameState={gameState}
            onPurchase={onPurchase}
            isPremium={isPremium}
          />
        </div>
      )}
    </div>
  );
}