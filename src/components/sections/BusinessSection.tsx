import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleChart } from "@/components/SimpleChart";
import { PersistentChart } from "@/components/PersistentChart";
import { TrendingUp, TrendingDown, Clock, ArrowUpCircle, Info, DollarSign } from "lucide-react";
import { formatNumber } from "@/lib/gameData";
import { 
  BUSINESSES, 
  Business, 
  BusinessUpgrade, 
  BusinessCategory,
  getBusinessById,
  getBusinessesByCategory, 
  getBusinessCategories,
  calculateBusinessIncome,
  calculateBusinessPrice,
  calculateUpgradePrice,
  formatPercentage
} from "@/data/businesses";

interface BusinessSectionProps {
  gameState: any;
  onBuyBusiness: (businessId: string) => void;
  onUpgradeBusiness: (businessId: string, upgradeId: string) => void;
  onSellBusiness: (businessId: string) => void;
}

export function BusinessSection({ 
  gameState, 
  onBuyBusiness, 
  onUpgradeBusiness,
  onSellBusiness 
}: BusinessSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory>(getBusinessCategories()[0]);
  const [businessModalOpen, setBusinessModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [sellConfirmOpen, setSellConfirmOpen] = useState(false);
  const [businessToSell, setBusinessToSell] = useState<Business | null>(null);
  
  // Helper function to check if the user owns a business
  const ownsBusiness = (businessId: string): boolean => {
    return (gameState.businesses?.[businessId]?.quantity || 0) > 0;
  };
  
  // Helper function to get business quantity
  const getBusinessQuantity = (businessId: string): number => {
    return gameState.businesses?.[businessId]?.quantity || 0;
  };
  
  // Helper function to check if the user can afford a business
  const canAffordBusiness = (business: Business): boolean => {
    const currentQuantity = getBusinessQuantity(business.id);
    const activeUpgrades = gameState.businesses?.[business.id]?.upgrades || [];
    const price = calculateBusinessPrice(business, currentQuantity, activeUpgrades);
    return gameState.balance >= price;
  };
  
  // Helper function to check if an upgrade is purchased
  const hasUpgrade = (businessId: string, upgradeId: string): boolean => {
    return gameState.businesses?.[businessId]?.upgrades?.includes(upgradeId) || false;
  };

  // Calculate sell price (70% of original price)
  const getSellPrice = (business: Business): number => {
    return Math.floor(business.basePrice * 0.7);
  };

  // Handle sell confirmation
  const handleSellClick = (business: Business) => {
    setBusinessToSell(business);
    setSellConfirmOpen(true);
  };

  // Confirm sale
  const confirmSell = () => {
    if (businessToSell) {
      onSellBusiness(businessToSell.id);
      setSellConfirmOpen(false);
      setBusinessToSell(null);
    }
  };

  // Cancel sale
  const cancelSell = () => {
    setSellConfirmOpen(false);
    setBusinessToSell(null);
  };
  
  // Helper function to check if the user can afford an upgrade
  const canAffordUpgrade = (upgrade: BusinessUpgrade, businessId: string): boolean => {
    const businessQuantity = getBusinessQuantity(businessId);
    const price = calculateUpgradePrice(upgrade, businessQuantity);
    return gameState.balance >= price;
  };
  
  // Handle business modal open
  const openBusinessModal = (business: Business) => {
    console.log('Opening business modal for:', business.name);
    setSelectedBusiness(business);
    setBusinessModalOpen(true);
    console.log('Modal state set to true');
  };
  
  // Format business income
  const formatBusinessIncome = (business: Business): string => {
    const owned = ownsBusiness(business.id);
    if (!owned) return formatPercentage(business.baseIncome);
    
    const upgrades = gameState.businesses[business.id]?.upgrades || [];
    return formatPercentage(calculateBusinessIncome(business, upgrades));
  };
  
  // Calculate ROI
  const calculateROI = (business: Business): number => {
    const dailyReturn = business.baseIncome / 100;
    return Math.round(1 / dailyReturn);
  };

  const categories = getBusinessCategories();

  // Calculate total business value and daily income
  const getTotalBusinessValue = (): number => {
    let total = 0;
    Object.entries(gameState.businesses || {}).forEach(([businessId, data]: [string, any]) => {
      const business = getBusinessById(businessId);
      if (business && data.quantity > 0) {
        total += business.basePrice * data.quantity;
      }
    });
    return total;
  };

  const getTotalDailyIncome = (): number => {
    let total = 0;
    Object.entries(gameState.businesses || {}).forEach(([businessId, data]: [string, any]) => {
      const business = getBusinessById(businessId);
      if (business && data.quantity > 0) {
        const upgrades = data.upgrades || [];
        const dailyRate = calculateBusinessIncome(business, upgrades) / 100;
        total += dailyRate * data.quantity;
      }
    });
    return total;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Business Overview - Ultra Compact */}
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 p-2 mx-0">
        <h2 className="text-xs font-bold mb-2 text-amber-400 border-b border-gray-600 pb-1">Business Overview</h2>
        
        {/* Compact Stats */}
        <div className="grid grid-cols-3 gap-2 mb-2 text-center">
          <div className="bg-slate-700/30 rounded p-1">
            <div className="text-xs text-gray-400">Value</div>
            <div className="text-sm font-bold">${formatNumber(getTotalBusinessValue())}</div>
          </div>
          <div className="bg-slate-700/30 rounded p-1">
            <div className="text-xs text-gray-400">Income</div>
            <div className="text-sm font-bold text-green-400">{formatPercentage(getTotalDailyIncome() * 100)}</div>
          </div>
          <div className="bg-slate-700/30 rounded p-1">
            <div className="text-xs text-gray-400">Active</div>
            <div className="text-sm font-bold text-blue-400">{Object.keys(gameState.businesses || {}).length}</div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-gray-400">Active Businesses</div>
          {(() => {
              const ownedBusinesses = Object.entries(gameState.businesses || {})
                .filter(([_, data]: [string, any]) => data.quantity > 0)
                .map(([businessId, data]: [string, any]) => {
                  const business = getBusinessById(businessId);
                  if (!business) return null;
                  
                  const upgrades = data.upgrades || [];
                  const dailyRate = calculateBusinessIncome(business, upgrades) / 100;
                  
                  return {
                    business,
                    quantity: data.quantity,
                    dailyRate,
                    value: business.basePrice * data.quantity
                  };
                })
                .filter(Boolean);

              if (ownedBusinesses.length === 0) {
                return (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No businesses owned yet
                  </div>
                );
              }

              return ownedBusinesses.map((item: any, index) => (
                <div key={item.business.id} className="bg-slate-800/50 rounded-lg p-1.5 space-y-1">
                  {/* Business Info Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm">{item.business.icon}</span>
                      <div>
                        <div className="text-xs font-medium text-white">
                          {item.business.name} {item.quantity > 1 && `(${item.quantity}x)`}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatPercentage(item.dailyRate * 100)}/day each
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="text-right mr-1">
                        <div className="text-white text-xs">${formatNumber(item.value)}</div>
                        <div className="text-green-400 text-xs">
                          +{formatPercentage(item.dailyRate * item.quantity * 100)}/day
                        </div>
                      </div>
                      {/* Quick Buy/Sell Buttons - Compact for mobile */}
                      <div className="flex items-center space-x-0.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSellBusiness(item.business.id);
                          }}
                          disabled={item.quantity === 0}
                          className={`${
                            item.quantity > 0
                              ? 'bg-red-600/80 hover:bg-red-600'
                              : 'bg-gray-600/50 cursor-not-allowed'
                          } text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all`}
                        >
                          -
                        </button>
                        <div className="bg-gray-700/50 px-3 py-1 rounded text-white text-sm font-medium min-w-[40px] text-center">
                          {item.quantity}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBuyBusiness(item.business.id);
                          }}
                          disabled={!canAffordBusiness(item.business)}
                          className={`${
                            canAffordBusiness(item.business)
                              ? 'bg-green-600/80 hover:bg-green-600'
                              : 'bg-gray-600/50 cursor-not-allowed'
                          } text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Upgrades Row */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">Quick Upgrades:</div>
                    <div className="flex space-x-1">
                      {item.business.upgrades.map((upgrade: any, upgradeIndex: number) => {
                        const isPurchased = hasUpgrade(item.business.id, upgrade.id);
                        const canAfford = canAffordUpgrade(upgrade, item.business.id) && !isPurchased;
                        const price = calculateUpgradePrice(upgrade, item.quantity);
                        
                        return (
                          <button
                            key={upgrade.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isPurchased) {
                                onUpgradeBusiness(item.business.id, upgrade.id);
                              }
                            }}
                            disabled={!canAfford && !isPurchased}
                            className={`${
                              isPurchased
                                ? 'bg-green-600 text-white'
                                : canAfford 
                                  ? 'bg-orange-600/80 hover:bg-orange-600' 
                                  : 'bg-gray-600/50 cursor-not-allowed'
                            } text-white px-1 py-0.5 rounded text-xs font-bold transition-all min-w-[28px] flex items-center justify-center`}
                          >
                            {isPurchased ? (
                              <span>✓</span>
                            ) : (
                              <span>${(price / 1000).toFixed(0)}K</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ));
            })()}
        </div>
      </Card>

      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as BusinessCategory)}>
        {/* Category Navigation */}
        <div className="mb-4">
          <div className="grid grid-cols-5 gap-1 bg-gradient-to-t from-slate-900/95 to-slate-800/90 p-2 rounded-lg border border-slate-700/50">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button 
                  key={category} 
                  onClick={() => setSelectedCategory(category)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 relative ${
                    isActive 
                      ? 'transform scale-105' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1 transition-all duration-300 relative ${
                    isActive 
                      ? 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 shadow-lg shadow-amber-500/20' 
                      : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/30 hover:border-slate-600/50'
                  }`}>
                    <span className={`text-lg transition-all duration-300 ${
                      isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-300'
                    }`}>
                      {category === 'retail' && '🏪'}
                      {category === 'realestate' && '🏢'}
                      {category === 'services' && '🔧'}
                      {category === 'technology' && '💻'}
                      {category === 'manufacturing' && '🏭'}
                      {category === 'logistics' && '🚚'}
                      {category === 'energy' && '⚡'}
                      {category === 'luxury' && '💎'}
                      {category === 'space' && '🚀'}
                      {category === 'underground' && '💀'}
                    </span>
                    {isActive && (
                      <div className="absolute inset-0 rounded-lg bg-amber-500/10 animate-pulse"></div>
                    )}
                  </div>
                  <span className={`text-[9px] font-medium transition-all duration-300 leading-tight text-center ${
                    isActive 
                      ? 'text-white' 
                      : 'text-white/70'
                  }`}>
                    {category === 'realestate' ? 'Real Estate' : 
                     category === 'underground' ? 'Black Market' :
                     category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Business Cards */}
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-1 gap-3">
              {getBusinessesByCategory(category)
                .map((business) => {
                  const owned = ownsBusiness(business.id);
                  const canAfford = canAffordBusiness(business);

                  return (
                    <Card 
                      key={business.id} 
                      className={`
                        relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-[1.01]
                        bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm
                        border-2 hover:shadow-[0_8px_32px_rgba(139,92,246,0.3)]
                        ${owned ? 'border-emerald-500/50 shadow-[0_8px_32px_rgba(16,185,129,0.2)]' : 
                          canAfford ? 'border-purple-500/40 hover:border-purple-400/60' : 
                          'border-gray-600/30 hover:border-gray-500/40'}
                      `}
                      onClick={() => openBusinessModal(business)}
                    >
                      <div className="p-4">
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{business.icon}</div>
                            <div>
                              <h3 className="font-bold text-white text-base">{business.name}</h3>
                              {owned && (
                                <div className="bg-purple-600 text-white px-2 py-1 text-xs mt-1 rounded">
                                  Owned {getBusinessQuantity(business.id)}x
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSellBusiness(business.id);
                              }}
                              disabled={!owned}
                              className={`${
                                owned
                                  ? 'bg-red-600/80 hover:bg-red-600'
                                  : 'bg-gray-600/50 cursor-not-allowed'
                              } text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all`}
                            >
                              -
                            </button>
                            <div className="bg-gray-700/50 px-2 py-1 rounded text-white text-xs font-medium min-w-[30px] text-center">
                              {getBusinessQuantity(business.id)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onBuyBusiness(business.id);
                              }}
                              disabled={!canAfford}
                              className={`${
                                canAfford 
                                  ? 'bg-emerald-600/80 hover:bg-emerald-700' 
                                  : 'bg-gray-600/50 cursor-not-allowed'
                              } text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        {/* Business Info */}
                        <div className="text-sm text-gray-300 mb-3">
                          {business.description}
                        </div>
                          
                        {/* Not enough money indicator */}
                        {!canAfford && !owned && (
                          <div className="text-center">
                            <div className="text-xs text-red-400 font-medium">
                              Need ${(() => {
                                const currentQuantity = getBusinessQuantity(business.id);
                                const activeUpgrades = gameState.businesses?.[business.id]?.upgrades || [];
                                const price = calculateBusinessPrice(business, currentQuantity, activeUpgrades);
                                return ((price - gameState.balance) / 1000).toFixed(0);
                              })()}K more
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="relative z-10 space-y-2 px-3 pb-3">
                        <div className="flex justify-between items-center p-2 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-lg border border-purple-500/20">
                          <span className="text-xs font-medium text-purple-300">Price:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                              ${(() => {
                                const currentQuantity = getBusinessQuantity(business.id);
                                const activeUpgrades = gameState.businesses?.[business.id]?.upgrades || [];
                                return calculateBusinessPrice(business, currentQuantity, activeUpgrades).toLocaleString();
                              })()}
                            </span>
                            {owned && (
                              <Badge className="bg-purple-600 text-white px-2 py-0.5 text-xs">
                                {getBusinessQuantity(business.id)}x
                              </Badge>
                            )}
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                onBuyBusiness(business.id);
                              }}
                              disabled={!canAfford}
                              className={`${
                                canAfford 
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40' 
                                  : 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed'
                              } text-white font-bold h-6 px-2 text-xs transition-all duration-300 transform hover:scale-105`}
                              size="sm"
                            >
                              {owned ? 'BUY MORE' : 'BUY'}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center py-1">
                          <span className="text-xs text-gray-400">Daily Income:</span>
                          <span className="text-xs font-bold text-green-400">
                            {owned 
                              ? formatBusinessIncome(business)
                              : "Buy to unlock"
                            }
                          </span>
                        </div>
                        
                        {/* Quick Upgrades - Always visible for planning */}
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <div className="text-xs text-gray-400 mb-1.5">
                            {owned ? "Quick Upgrades:" : "Available Upgrades:"}
                          </div>
                          <div className="grid grid-cols-1 gap-1.5">
                            {business.upgrades.map((upgrade, index) => {
                              const isPurchased = hasUpgrade(business.id, upgrade.id);
                              const canAfford = canAffordUpgrade(upgrade, business.id) && !isPurchased;
                              
                              return (
                                <div key={upgrade.id} className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <div className="text-lg">{upgrade.icon}</div>
                                      <div>
                                        <div className="text-xs font-semibold text-white">
                                          {upgrade.name}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          +{((upgrade.multiplier - 1) * 100).toFixed(0)}% income
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (owned) {
                                        onUpgradeBusiness(business.id, upgrade.id);
                                      }
                                    }}
                                    disabled={!canAfford && !isPurchased}
                                    className={`${
                                      isPurchased
                                        ? 'bg-green-600 text-white'
                                        : canAfford 
                                          ? 'bg-gradient-to-br from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700' 
                                          : 'bg-gray-700 cursor-not-allowed'
                                    } text-white font-bold h-8 px-3 text-xs`}
                                    size="sm"
                                  >
                                    {isPurchased ? (
                                      <span className="text-xs">✓ OWNED</span>
                                    ) : (
                                      <span className="text-xs">${calculateUpgradePrice(upgrade, getBusinessQuantity(business.id)).toLocaleString()}</span>
                                    )}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Upgrade Info */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex space-x-1">
                              {business.upgrades.map((upgrade, index) => (
                                <div 
                                  key={upgrade.id}
                                  className={`w-2 h-2 rounded-full ${
                                    hasUpgrade(business.id, upgrade.id)
                                      ? 'bg-green-400' 
                                      : 'bg-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-xs text-gray-400">
                              {business.upgrades.filter(u => hasUpgrade(business.id, u.id)).length}/3 upgrades
                            </div>
                          </div>
                        </div>

                        {/* Upgrade Preview */}
                        {!owned && (
                          <div className="mt-2 text-xs text-blue-400">
                            💡 Max potential: {formatPercentage(
                              business.baseIncome * 
                              business.upgrades.reduce((acc, u) => acc * u.multiplier, 1)
                            )}/day
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Business Detail Modal - Custom Implementation */}
      {businessModalOpen && selectedBusiness && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm">
          <div className="max-w-3xl w-full max-h-[95vh] overflow-y-auto glass-card border border-white/20 rounded-lg shadow-2xl">
            {/* Header */}
            <div className="border-b border-white/10 pb-3 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{selectedBusiness.icon}</div>
                  <div>
                    <div className="text-xl font-bold text-white">{selectedBusiness.name}</div>
                    <div className="text-sm text-purple-400 capitalize">{selectedBusiness.category}</div>
                  </div>
                </div>
                <button
                  onClick={() => setBusinessModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
              {/* Business Description */}
              <div className="text-sm text-gray-300 bg-white/5 rounded-lg p-3">
                {selectedBusiness.description}
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-3 p-3">
              {/* Business Performance Chart */}
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <PersistentChart 
                  assetName={selectedBusiness.name}
                  assetId={selectedBusiness.id}
                  currentPrice={selectedBusiness.basePrice}
                  assetType="commodity"
                  className="h-32"
                />
              </div>
              
              {/* Business Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="glass-card border-white/10 p-3">
                  <div className="text-xs text-gray-400 mb-1">Purchase Price</div>
                  <div className="font-bold text-lg text-blue-400">
                    ${selectedBusiness.basePrice.toLocaleString()}
                  </div>
                </div>
                <div className="glass-card border-white/10 p-3">
                  <div className="text-xs text-gray-400 mb-1">Daily Return</div>
                  <div className="font-bold text-lg text-green-400">
                    {formatBusinessIncome(selectedBusiness)}
                  </div>
                </div>
                <div className="glass-card border-white/10 p-3">
                  <div className="text-xs text-gray-400 mb-1">ROI Period</div>
                  <div className="font-bold text-lg text-purple-400">
                    {calculateROI(selectedBusiness)} days
                  </div>
                </div>
                <div className="glass-card border-white/10 p-3">
                  <div className="text-xs text-gray-400 mb-1">
                    {ownsBusiness(selectedBusiness.id) ? 'Owned' : 'Required Level'}
                  </div>
                  <div className="font-bold text-lg text-yellow-400">
                    {ownsBusiness(selectedBusiness.id) 
                      ? `${getBusinessQuantity(selectedBusiness.id)}x` 
                      : `LVL ${selectedBusiness.requiredLevel}`
                    }
                  </div>
                </div>
              </div>
              
              {/* Upgrades Section */}
              {ownsBusiness(selectedBusiness.id) ? (
                <div className="space-y-2">
                  <h3 className="font-bold text-sm flex items-center">
                    <ArrowUpCircle className="w-4 h-4 mr-1 text-orange-400" />
                    Business Upgrades
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedBusiness.upgrades.map((upgrade, index) => {
                      const isPurchased = hasUpgrade(selectedBusiness.id, upgrade.id);
                      const canAfford = canAffordUpgrade(upgrade, selectedBusiness.id) && !isPurchased;
                      
                      return (
                        <Card 
                          key={upgrade.id} 
                          className={`glass-card border-white/10 p-2 transition-all ${
                            isPurchased 
                              ? 'border-green-500/50 bg-green-900/20' 
                              : canAfford 
                                ? 'border-orange-500/30 hover:border-orange-500/50' 
                                : 'border-gray-600/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`text-lg p-1 rounded-lg ${
                                isPurchased 
                                  ? 'bg-green-500/20' 
                                  : canAfford 
                                    ? 'bg-orange-500/20' 
                                    : 'bg-gray-600/20'
                              }`}>
                                {upgrade.icon}
                              </div>
                              <div>
                                <div className="font-bold text-sm">{upgrade.name}</div>
                                <div className="text-xs text-gray-400 line-clamp-1">{upgrade.description}</div>
                                <div className="text-xs text-green-400">
                                  +{((upgrade.multiplier - 1) * 100).toFixed(0)}% income boost
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-1">
                              {isPurchased ? (
                                <Badge className="bg-green-600 text-white px-2 py-0.5 text-xs">
                                  ✓ OWNED
                                </Badge>
                              ) : (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpgradeBusiness(selectedBusiness.id, upgrade.id);
                                  }}
                                  disabled={!canAfford}
                                  className={`${
                                    canAfford 
                                      ? 'bg-gradient-to-br from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 shadow-lg' 
                                      : 'bg-gray-700 cursor-not-allowed'
                                  } text-white font-bold px-2 py-1 min-w-[80px] text-xs`}
                                  size="sm"
                                >
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  {formatNumber(calculateUpgradePrice(upgrade, getBusinessQuantity(selectedBusiness.id)))}
                                </Button>
                              )}
                              
                              {/* Cost per percentage boost */}
                              <div className="text-[10px] text-gray-400 text-right">
                                {formatNumber(Math.round(calculateUpgradePrice(upgrade, getBusinessQuantity(selectedBusiness.id)) / ((upgrade.multiplier - 1) * 100)))} per 1%
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {/* Upgrade Progress Bar */}
                  <div className="mt-4 p-3 glass-card border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Upgrade Progress</span>
                      <span className="text-sm font-semibold">
                        {selectedBusiness.upgrades.filter(u => hasUpgrade(selectedBusiness.id, u.id)).length}/3
                      </span>
                    </div>
                    <Progress 
                      value={(selectedBusiness.upgrades.filter(u => hasUpgrade(selectedBusiness.id, u.id)).length / 3) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Business Information</h3>
                  <div className="glass-card border-white/10 p-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-2">Purchase this business to unlock upgrades</div>
                      <Button
                        onClick={() => {
                          onBuyBusiness(selectedBusiness.id);
                          setBusinessModalOpen(false);
                        }}
                        disabled={!canAffordBusiness(selectedBusiness)}
                        className={`${
                          canAffordBusiness(selectedBusiness)
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                            : 'bg-gray-700 cursor-not-allowed'
                        } text-white font-bold px-6 py-3`}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Buy for ${selectedBusiness.basePrice.toLocaleString()}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Sell Confirmation Modal */}
      {sellConfirmOpen && businessToSell && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm">
          <div className="max-w-sm w-full glass-card border border-white/20 rounded-lg shadow-2xl p-4">
            <div className="text-center space-y-3">
              <div className="text-2xl">{businessToSell.icon}</div>
              <div>
                <h3 className="font-bold text-lg text-white">Sell {businessToSell.name}?</h3>
                <p className="text-sm text-gray-400 mt-1">You will receive 70% of the original price</p>
              </div>
              
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="text-xs text-gray-400">Original Price:</div>
                <div className="text-sm font-bold text-gray-300">${businessToSell.basePrice.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-1">You'll get:</div>
                <div className="text-lg font-bold text-green-400">${getSellPrice(businessToSell).toLocaleString()}</div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={cancelSell}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmSell}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  Sell
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}