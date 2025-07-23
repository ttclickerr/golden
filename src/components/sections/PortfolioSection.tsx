import { LeaderboardSection } from "@/components/LeaderboardSection";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BUSINESSES } from "@/data/businesses";
import { getLocalizedAchievement, mapAchievementCategory } from '@/lib/achievement-localization';
import { assetIdMapping } from "@/lib/assetIdMapping";
import { assetNames } from "@/lib/assetNames";
import { ASSETS, formatNumber } from "@/lib/gameData";
import { useTranslation } from "@/lib/i18n";
import { BarChart3 as BarChart3Icon, PieChart as PieChartIcon, TrendingDown as TrendingDownIcon, TrendingUp as TrendingUpIcon } from "lucide-react";

const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

interface Investments {
  [assetId: string]: number;
}

interface BusinessState {
  owned?: boolean;
  purchaseDate?: number;
  upgrades?: string[];
  quantity?: number;
}

interface Businesses {
  [businessId: string]: BusinessState;
}

interface GameState {
  balance: number;
  level: number;
  xp: number;
  maxXp: number;
  clickValue: number;
  passiveIncome: number;
  totalClicks: number;
  investments: Investments;
  businesses: Businesses;
  // ...other fields
}

interface PortfolioSectionProps {
  gameState: GameState;
  getCompletedAchievements: () => any[];
  ACHIEVEMENTS: any[];
  getPortfolioValue: () => number;
  getBusinessValue: () => number;
  getTotalNetWorth: () => number;
  onQuickBuyAsset?: (assetId: string) => any;
  onQuickSellAsset?: (assetId: string) => any;
}

export function PortfolioSection({ gameState, getCompletedAchievements, ACHIEVEMENTS, getPortfolioValue, getBusinessValue, getTotalNetWorth, onQuickBuyAsset, onQuickSellAsset }: PortfolioSectionProps) {
  const { t, language } = useTranslation();
  const portfolioValue = getPortfolioValue();
  // Расчет статистики по разделам
  const tradingAssets = Object.entries(gameState.investments).filter(([assetId]) => {
    const mappedId = assetIdMapping[assetId] || assetId;
    // Показываем актив, если он есть в assetNames по любому id
    return assetNames[assetId] || assetNames[mappedId];
  });

  console.log('🚀 Tesla Debug - Portfolio filtering:', {
    allInvestments: Object.keys(gameState.investments),
    assetNamesKeys: Object.keys(assetNames),
    tradingAssets: tradingAssets.map(([id, qty]) => ({ id, qty }))
  });

  // Отладочная информация для исследования проблемы с Tesla
  console.log('🔍 Debug Portfolio:', {
    investments: gameState.investments,
    assetNamesKeys: Object.keys(assetNames),
    tradingAssets,
    hasAssetNames: !!assetNames
  });

  const businessCount = Object.keys(gameState.businesses).filter(businessId =>
    Number(gameState.businesses[businessId]?.quantity) > 0
  ).length;

  const totalBusinessValue = Object.entries(gameState.businesses).reduce((total, [businessId, business]) => {
    if (business?.owned) {
      return total + 50000; // Средняя стоимость бизнеса
    }
    return total;
  }, 0);

  // Исправленный расчёт tradingValue
  const tradingValue = tradingAssets.reduce((total, [assetId, quantity]) => {
    const q = Number(quantity);
    const mappedId = assetIdMapping[assetId] || assetId;
    const asset = ASSETS.find(a => a.id === mappedId);
    return total + (asset ? asset.basePrice * q : 0);
  }, 0);

  const classicInvestments = Object.entries(gameState.investments).filter(([assetId]) => {
    const mappedId = assetIdMapping[assetId] || assetId;
    return !Object.keys(assetNames).includes(assetId) && !Object.keys(assetNames).includes(mappedId);
  });

  const classicValue = classicInvestments.reduce((total, [assetId, quantity]) => {
    const mappedId = assetIdMapping[assetId] || assetId;
    const asset = ASSETS.find(a => a.id === mappedId);
    return total + (asset ? asset.basePrice * quantity : 0);
  }, 0);

  // Calculate daily income from businesses
  const getDailyBusinessIncome = () => {
    return Object.entries(gameState.businesses || {}).reduce((total, [businessId, data]: [string, any]) => {
      const business = BUSINESSES.find(b => b.id === businessId);
      if (!business) return total;

      const baseIncome = business.basePrice * (business.baseIncome / 100);
      return total + baseIncome * data.quantity;
    }, 0);
  };

  // Get asset allocation
  const getAssetAllocation = () => {
    const portfolioValue = getPortfolioValue();
    const businessValue = getBusinessValue();
    const cashValue = gameState.balance;
    const totalValue = getTotalNetWorth();

    if (totalValue === 0) return { cash: 0, investments: 0, businesses: 0 };

    return {
      cash: (cashValue / totalValue) * 100,
      investments: (portfolioValue / totalValue) * 100,
      businesses: (businessValue / totalValue) * 100
    };
  };

  // Исправленный getTopInvestments
  const getTopInvestments = () => {
    return Object.entries(gameState.investments || {})
      .map(([assetId, quantity]) => {
        const q = Number(quantity);
        const mappedId = assetIdMapping[assetId] || assetId;
        const asset = ASSETS.find(a => a.id === mappedId);
        if (!asset) return null;
        const value = asset.basePrice * q;
        const change = 0; // Нет динамики, только basePrice
        return {
          name: asset.name,
          quantity: q,
          value,
          change,
          icon: asset.icon
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.value || 0) - (a?.value || 0))
      .slice(0, 5);
  };

  // Get top businesses
  const getTopBusinesses = () => {
    return Object.entries(gameState.businesses || {})
      .map(([businessId, data]: [string, any]) => {
        const business = BUSINESSES.find(b => b.id === businessId);
        if (!business || data.quantity === 0) return null;

        const value = business.basePrice * data.quantity;
        const dailyIncome = business.basePrice * (business.baseIncome / 100) * data.quantity;

        return {
          name: business.name,
          quantity: data.quantity,
          value,
          dailyIncome,
          icon: business.icon
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.value || 0) - (a?.value || 0))
      .slice(0, 5);
  };

  const businessValue = getBusinessValue();
  const totalNetWorth = getTotalNetWorth();
  const dailyIncome = getDailyBusinessIncome();
  const allocation = getAssetAllocation();
  const topInvestments = getTopInvestments();
  const topBusinesses = getTopBusinesses();

  return (
    <div>
      <div style={{color: 'red', fontWeight: 'bold'}}>DEBUG: {language}</div>
      <div className="space-y-6 pb-20">
        {/* Leaderboard Section */}
        <LeaderboardSection
          currentLevel={gameState.level}
          currentBalance={gameState.balance}
          passiveIncome={gameState.passiveIncome}
        />
        {/* Portfolio Overview */}
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 p-4">
          <h2 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-600 pb-2">💼 {t('portfolioOverview')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400">{t('totalNetWorth')}</div>
              <div className="text-xl font-bold">${formatNumber(totalNetWorth)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">{t('dailyIncome')}</div>
              <div className="text-xl font-bold text-gray-300">${formatNumber(dailyIncome)}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">{t('cash')}</div>
              <div className="text-sm font-bold">${formatNumber(gameState.balance)}</div>
              <div className="text-xs text-gray-400">{allocation.cash.toFixed(1)}%</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">{t('portfolioValueTitle')}</div>
              <div className="text-sm font-bold">${formatNumber(portfolioValue)}</div>
              <div className="text-xs text-gray-400">{allocation.investments.toFixed(1)}%</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">{t('businesses')}</div>
              <div className="text-sm font-bold">${formatNumber(businessValue)}</div>
              <div className="text-xs text-gray-400">{allocation.businesses.toFixed(1)}%</div>
            </div>
          </div>
        </Card>
        {/* Asset Allocation Chart */}
        <Card className="bg-slate-700/30 backdrop-blur-sm border border-slate-600/30 p-4">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-600">
            <h4 className="font-semibold text-gray-300 flex items-center">
              <PieChartIcon className="w-4 h-4 mr-2" />
              {t('assetAllocation')}
            </h4>
            <div className="text-sm text-gray-400">{t('distribution')}</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-slate-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-300">{t('cash')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{allocation.cash.toFixed(1)}%</span>
                <div className="w-16 h-2 bg-slate-700 rounded-full">
                  <div
                    className="h-2 bg-slate-500 rounded-full transition-all duration-300"
                    style={{ width: `${allocation.cash}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-slate-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-300">{t('portfolioValueTitle')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{allocation.investments.toFixed(1)}%</span>
                <div className="w-16 h-2 bg-slate-700 rounded-full">
                  <div
                    className="h-2 bg-slate-500 rounded-full transition-all duration-300"
                    style={{ width: `${allocation.investments}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-slate-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-300">{t('businesses')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{allocation.businesses.toFixed(1)}%</span>
                <div className="w-16 h-2 bg-slate-700 rounded-full">
                  <div
                    className="h-2 bg-slate-500 rounded-full transition-all duration-300"
                    style={{ width: `${allocation.businesses}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        {/* Top Holdings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Investments */}
          <Card className="bg-slate-700/30 backdrop-blur-sm border border-slate-600/30 p-4">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-600">
              <div>
                <h3 className="text-md font-bold mb-2 text-gray-300">{t('portfolioValueTitle')}</h3>
                <div className="text-sm font-bold">${formatNumber(portfolioValue)}</div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-300 flex items-center">
                  <TrendingUpIcon className="w-4 h-4 mr-2" />
                  {t('topInvestments')}
                </h4>
                <div className="text-sm text-gray-400">{topInvestments.length} {t('assets')}</div>
              </div>
            </div>

            <div className="space-y-3">
              {topInvestments.length > 0 ? (
                topInvestments.map((investment, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700/20 rounded-lg p-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{investment?.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{investment?.name}</div>
                        <div className="text-xs text-gray-400">{investment?.quantity} shares</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">${formatNumber(investment?.value || 0)}</div>
                      <div className={`text-xs flex items-center ${(investment?.change || 0) >= 0 ? 'text-gray-400' : 'text-gray-400'
                        }`}>
                        {(investment?.change || 0) >= 0 ?
                          <TrendingUpIcon className="w-3 h-3 mr-1" /> :
                          <TrendingDownIcon className="w-3 h-3 mr-1" />
                        }
                        {formatPercentage(Math.abs(investment?.change || 0))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">
                  {t('noInvestmentsYet')}
                </div>
              )}
            </div>
          </Card>
          {/* Top Businesses */}
          <Card className="bg-slate-700/30 backdrop-blur-sm border border-slate-600/30 p-4">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-600">
              <h4 className="font-semibold text-gray-300 flex items-center">
                <BarChart3Icon className="w-4 h-4 mr-2" />
                {t('topBusinesses')}
              </h4>
              <div className="text-sm text-gray-400">{topBusinesses.length} {t('businesses')}</div>
            </div>

            <div className="space-y-3">
              {topBusinesses.length > 0 ? (
                topBusinesses.map((business, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700/20 rounded-lg p-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{business?.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{business?.name}</div>
                        <div className="text-xs text-gray-400">{business?.quantity}x owned</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">${formatNumber(business?.value || 0)}</div>
                      <div className="text-xs text-gray-400">
                        +${formatNumber(business?.dailyIncome || 0)}/day
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">
                  {t('noBusinessesYet')}
                </div>
              )}
            </div>
          </Card>
        </div>
        {/* Performance Summary */}
        <Card className="bg-slate-700/30 backdrop-blur-sm border border-slate-600/30 p-4">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-600">
            <h4 className="font-semibold text-gray-300">💎 {t('performanceSummary')}</h4>
            <div className="text-sm text-gray-400">{t('currentSession')}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/20 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">{t('totalClicks')}</div>
              <div className="text-lg font-bold text-white">{formatNumber(gameState.totalClicks)}</div>
            </div>
            <div className="bg-slate-700/20 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">{t('level')}</div>
              <div className="text-lg font-bold text-gray-300">{t('levelShort')} {gameState.level}</div>
            </div>
          </div>

          <div className="mt-3 bg-slate-700/20 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-2">{t('wealthGrowthRate')}</div>
            <div className="text-sm text-gray-400">
              {t('basedOnDailyIncome').replace('${value}', formatNumber(dailyIncome * 365))}
            </div>
          </div>
        </Card>
        {/* Detailed Performance Analytics */}
        <Card className="bg-slate-800/80 border-slate-700/50 p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-600 pb-2">📊 {t('performanceAnalytics')}</h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="text-xs text-gray-400 font-semibold mb-1">{t('totalClicksLabel')}</div>
              <div className="text-xl font-bold text-white">{formatNumber(gameState.totalClicks)}</div>
              <div className="text-xs text-gray-400 mt-1">{t('allTime')}</div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="text-xs text-gray-400 font-semibold mb-1">{t('clickValue')}</div>
              <div className="text-xl font-bold text-white">${formatNumber(gameState.clickValue)}</div>
              <div className="text-xs text-gray-400 mt-1">{t('perClick')}</div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="text-xs text-gray-400 font-semibold mb-1">{t('currentLevel')}</div>
              <div className="text-xl font-bold text-white">{t('levelShort')} {gameState.level}</div>
              <div className="text-xs text-gray-400 mt-1">{gameState.xp}/{gameState.maxXp} XP</div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="text-xs text-gray-400 font-semibold mb-1">{t('passiveIncome')}</div>
              <div className="text-xl font-bold text-white">${formatNumber(gameState.passiveIncome * 86400)}</div>
              <div className="text-xs text-gray-400 mt-1">{t('perDay')}</div>
            </div>
          </div>

          {/* ROI and Growth Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="text-xs text-gray-400 font-semibold mb-2">ROI METRICS</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Annual ROI</span>
                  <span className="text-white">{(() => {
                    if (portfolioValue <= 0) return '0.0';
                    const annualIncome = gameState.passiveIncome * 31536000;
                    const roi = (annualIncome / portfolioValue) * 100;
                    return roi > 999 ? '999.9' : roi.toFixed(1);
                  })()}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">{t('portfolioMonthlyIncomeLabel')}</span>
                  <span className="text-white">${formatNumber(gameState.passiveIncome * 2592000)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="text-xs text-gray-400 font-semibold mb-2">{t('portfolioPortfolioMetrics')}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">{t('portfolioActiveInvestments')}</span>
                  <span className="text-white">{Object.keys(gameState.investments).length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">{t('portfolioBusinessVentures')}</span>
                  <span className="text-white">{Object.keys(gameState.businesses).filter(id => gameState.businesses[id]?.owned).length}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="text-xs text-gray-400 font-semibold mb-2">{t('portfolioEfficiencyLabel')}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">{t('portfolioAvgInvestmentSize')}</span>
                  <span className="text-white">${formatNumber(portfolioValue / Math.max(Object.keys(gameState.investments).length, 1))}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">{t('portfolioDiversificationLabel')}</span>
                  <span className="text-white">{Math.min(Object.keys(gameState.investments).length * 10, 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        {/* Detailed Asset Breakdown */}
        <Card className="bg-slate-800/80 border-slate-700/50 p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-600 pb-2">📈 {t('detailedAssetAnalysis')}</h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trading Assets */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-600">
                <h4 className="font-semibold text-gray-300">📊 {t('tradingPortfolio')}</h4>
                <div className="text-xs text-gray-400">{tradingAssets.length} {t('positions')}</div>
              </div>

              <div className="text-xl font-bold text-white mb-2">${formatNumber(tradingValue)}</div>
              <div className="text-xs text-gray-400 mb-4">
                {((tradingValue / (portfolioValue + totalBusinessValue)) * 100 || 0).toFixed(1)}% {t('ofHoldings')}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tradingAssets.map(([assetId, quantity]) => {
                  const mappedId = assetIdMapping[assetId] || assetId;
                  const asset = ASSETS.find(a => a.id === mappedId);
                  const value = asset ? asset.basePrice * quantity : 0;
                  // Имя берём из assetNames по основному или mapped id
                  const displayName = assetNames[assetId] || assetNames[mappedId] || assetId.replace('-separate', '').replace('_', ' ');
                  return (
                    <div key={assetId} className="flex justify-between items-center py-1 border-b border-gray-600/50">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                        <span className="text-xs text-gray-300 capitalize">{displayName}</span>
                        <span className="text-xs text-gray-500">×{quantity}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-xs text-white font-bold">${formatNumber(value)}</div>
                          <div className="text-xs text-gray-400">{((value / tradingValue) * 100 || 0).toFixed(1)}%</div>
                        </div>
                        {onQuickSellAsset && onQuickBuyAsset && (
                          <div className="flex items-center space-x-1 ml-1">
                            <button
                              onClick={() => onQuickSellAsset(assetId)}
                              disabled={quantity <= 0}
                              className="w-5 h-5 flex items-center justify-center bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              -
                            </button>
                            <button
                              onClick={() => onQuickBuyAsset(assetId)}
                              className="w-5 h-5 flex items-center justify-center bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {tradingAssets.length === 0 && (
                  <div className="text-center text-gray-500 py-4 text-xs">
                    {t('noTradingPositionsYet')}
                  </div>
                )}
              </div>
            </div>

            {/* Business Empire */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-600">
                <h4 className="font-semibold text-gray-300">🏢 {t('businessEmpire')}</h4>
                <div className="text-xs text-gray-400">{businessCount} {t('ventures')}</div>
              </div>

              <div className="text-xl font-bold text-white mb-2">${formatNumber(totalBusinessValue)}</div>
              <div className="text-xs text-gray-400 mb-4">
                {((totalBusinessValue / (portfolioValue + totalBusinessValue)) * 100 || 0).toFixed(1)}% {t('ofHoldings')}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(gameState.businesses).filter(([_, business]) => business?.owned).map(([businessId, business]) => (
                  <div key={businessId} className="flex justify-between items-center py-1 border-b border-gray-600/50">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      <span className="text-xs text-gray-300 capitalize">{businessId.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white font-bold">$50,000</div>
                      <div className="text-xs text-gray-400">{t('owned')}</div>
                    </div>
                  </div>
                ))}

                {businessCount === 0 && (
                  <div className="text-center text-gray-500 py-4 text-xs">
                    {t('noBusinessesOwnedYet')}
                  </div>
                )}
              </div>
            </div>

            {/* Classic Investments */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-600">
                <h4 className="font-semibold text-gray-300">💎 {t('classicAssets')}</h4>
                <div className="text-xs text-gray-400">{classicInvestments.length} {t('assets')}</div>
              </div>

              <div className="text-xl font-bold text-white mb-2">${formatNumber(classicValue)}</div>
              <div className="text-xs text-gray-400 mb-4">
                {((classicValue / (portfolioValue + totalBusinessValue)) * 100 || 0).toFixed(1)}% {t('ofHoldings')}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {classicInvestments.map(([assetId, quantity]) => {
                  const asset = ASSETS.find(a => a.id === assetId);
                  const value = asset ? asset.basePrice * quantity : 0;

                  return (
                    <div key={assetId} className="flex justify-between items-center py-1 border-b border-gray-600/50">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                        <span className="text-xs text-gray-300">{asset?.name || assetId}</span>
                        <span className="text-xs text-gray-500">×{quantity}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-xs text-white font-bold">${formatNumber(value)}</div>
                          <div className="text-xs text-gray-400">{((value / classicValue) * 100 || 0).toFixed(1)}%</div>
                        </div>
                        {onQuickSellAsset && onQuickBuyAsset && (
                          <div className="flex items-center space-x-1 ml-1">
                            <button
                              onClick={() => onQuickSellAsset(assetId)}
                              disabled={quantity <= 0}
                              className="w-5 h-5 flex items-center justify-center bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              -
                            </button>
                            <button
                              onClick={() => onQuickBuyAsset(assetId)}
                              className="w-5 h-5 flex items-center justify-center bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {classicInvestments.length === 0 && (
                  <div className="text-center text-gray-500 py-4 text-xs">
                    {t('noClassicInvestmentsYet')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
        {/* Achievement Progress */}
        <Card className="bg-slate-800/80 border-slate-700/50 p-4">
          <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-600 pb-2">
            🏆 {t('achievementProgress')}
          </h3>

          {/* Achievement Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30 text-center">
              <div className="text-xs text-gray-400 font-semibold mb-1">{t('completedLabel')}</div>
              <div className="text-xl font-bold text-white">{getCompletedAchievements().length}</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30 text-center">
              <div className="text-xs text-gray-400 font-semibold mb-1">{t('totalLabel') || 'TOTAL'}</div>
              <div className="text-xl font-bold text-white">{ACHIEVEMENTS.length}</div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">{t('recentAchievements')}:</h4>
            {getCompletedAchievements().slice(-5).map(achievement => {
              const category = mapAchievementCategory(achievement.category);
              const n = achievement.level;
              const value = achievement.requirement?.value;
              const localized = getLocalizedAchievement(language, category, { n, value });
              return (
                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-slate-700/20 rounded border border-slate-600/30">
                  <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                    <i className={`${achievement.icon} text-white text-xs`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{localized.name}</div>
                    <div className="text-xs text-gray-400">+${formatNumber(achievement.reward)} earned</div>
                  </div>
                  <div className="text-slate-400">
                    <i className="fas fa-check text-xs"></i>
                  </div>
                </div>
              );
            })}
            {getCompletedAchievements().length === 0 && (
              <div className="text-center text-gray-500 py-3 text-sm">
                {t('noAchievementsYet')}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{t('overallProgress')}</span>
              <span>{Math.round((getCompletedAchievements().length / ACHIEVEMENTS.length) * 100)}%</span>
            </div>
            <Progress
              value={(getCompletedAchievements().length / ACHIEVEMENTS.length) * 100}
              className="h-1 bg-slate-700"
            />
          </div>
        </Card>
        {/* Portfolio Risk Analysis */}
        <Card className="bg-slate-800/80 border-slate-700/50 p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-600 pb-2">⚡ {t('riskStrategyAnalysis')}</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Metrics */}
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">{t('riskProfile')}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{t('portfolioRiskLevel')}</span>
                    <span className="text-white text-sm">{t('moderate')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{t('diversificationScore')}</span>
                    <span className="text-white text-sm">{Math.min(Object.keys(gameState.investments).length * 10, 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{t('liquidityRatio')}</span>
                    <span className="text-white text-sm">{((gameState.balance / totalNetWorth) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Strategy Recommendations */}
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">{t('strategyInsights')}</h4>
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">• {t('expandBusinessPortfolio')}</div>
                  <div className="text-xs text-gray-400">• {t('diversifyAssets')}</div>
                  <div className="text-xs text-gray-400">• {t('monitorPassiveIncome')}</div>
                  <div className="text-xs text-gray-400">• {t('balanceRiskReward')}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        {/* Advanced Statistics Dashboard */}
        <Card className="bg-slate-800/80 border-slate-700/50 p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-600 pb-2">📊 {t('advancedStatisticsDashboard')}</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Financial Metrics */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 border-b border-gray-600 pb-1">💰 {t('financialMetrics')}</h4>
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('cashOnHand')}</span>
                      <span className="text-white font-bold">${formatNumber(gameState.balance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('portfolioValueTitle')}</span>
                      <span className="text-white font-bold">${formatNumber(portfolioValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('businessValue')}</span>
                      <span className="text-white font-bold">${formatNumber(totalBusinessValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('totalNetWorth')}</span>
                      <span className="text-green-400 font-bold">${formatNumber(totalNetWorth)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('hourlyIncome')}</span>
                      <span className="text-white font-bold">${formatNumber(gameState.passiveIncome * 3600)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('weeklyIncome')}</span>
                      <span className="text-white font-bold">${formatNumber(gameState.passiveIncome * 604800)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('monthlyIncome')}</span>
                      <span className="text-white font-bold">${formatNumber(gameState.passiveIncome * 2592000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('annualIncome')}</span>
                      <span className="text-purple-400 font-bold">${formatNumber(gameState.passiveIncome * 31536000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 border-b border-gray-600 pb-1">⚡ {t('performanceMetrics')}</h4>
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('incomeEfficiency')}</span>
                    <span className="text-white font-bold">{(gameState.passiveIncome / Math.max(totalNetWorth, 1) * 100).toFixed(3)}%/sec</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('clickEfficiency')}</span>
                    <span className="text-white font-bold">${(gameState.clickValue * 100).toFixed(2)}/100 clicks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('businessROI')}</span>
                    <span className="text-white font-bold">{totalBusinessValue > 0 ? ((gameState.passiveIncome * 31536000 / totalBusinessValue) * 100).toFixed(1) : '0'}%/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('growthRate')}</span>
                    <span className="text-white font-bold">+{(gameState.passiveIncome * 86400 / Math.max(gameState.balance, 1) * 100).toFixed(2)}%/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('wealthMultiplier')}</span>
                    <span className="text-white font-bold">{(totalNetWorth / Math.max(gameState.totalClicks * gameState.clickValue, 1)).toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gaming Statistics */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 border-b border-gray-600 pb-1">🎮 {t('gamingStatistics')}</h4>
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('totalClicks')}</span>
                    <span className="text-white font-bold">{formatNumber(gameState.totalClicks)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('currentLevel')}</span>
                    <span className="text-cyan-400 font-bold">{t('levelShort')} {gameState.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('experiencePoints')}</span>
                    <span className="text-white font-bold">{gameState.xp}/{gameState.maxXp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('achievements')}</span>
                    <span className="text-yellow-400 font-bold">{getCompletedAchievements().length}/{ACHIEVEMENTS.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('progress')}</span>
                    <span className="text-white font-bold">{((getCompletedAchievements().length / ACHIEVEMENTS.length) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Detailed Financial Breakdown */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <h5 className="text-sm font-semibold text-gray-300 mb-3">💎 {t('assetDistribution')}</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{t('cashHoldings')}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-slate-600 rounded-full h-1">
                      <div
                        className="bg-green-400 h-1 rounded-full"
                        style={{ width: `${(gameState.balance / totalNetWorth) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-white font-bold">{((gameState.balance / totalNetWorth) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{t('investments')}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-slate-600 rounded-full h-1">
                      <div
                        className="bg-blue-400 h-1 rounded-full"
                        style={{ width: `${(portfolioValue / totalNetWorth) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-white font-bold">{((portfolioValue / totalNetWorth) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{t('businesses')}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-slate-600 rounded-full h-1">
                      <div
                        className="bg-purple-400 h-1 rounded-full"
                        style={{ width: `${(totalBusinessValue / totalNetWorth) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-white font-bold">{((totalBusinessValue / totalNetWorth) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <h5 className="text-sm font-semibold text-gray-300 mb-3">📈 {t('growthProjections')}</h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('nextHour')}</span>
                  <span className="text-white font-bold">+${formatNumber(gameState.passiveIncome * 3600)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('nextDay')}</span>
                  <span className="text-white font-bold">+${formatNumber(gameState.passiveIncome * 86400)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('nextWeek')}</span>
                  <span className="text-green-400 font-bold">+${formatNumber(gameState.passiveIncome * 604800)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('nextMonth')}</span>
                  <span className="text-purple-400 font-bold">+${formatNumber(gameState.passiveIncome * 2592000)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-600 pt-2">
                  <span className="text-gray-300 font-semibold">{t('projectedWorth')}</span>
                  <span className="text-cyan-400 font-bold">${formatNumber(totalNetWorth + (gameState.passiveIncome * 2592000))}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}