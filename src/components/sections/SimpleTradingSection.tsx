import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SimpleChart } from "@/components/SimpleChart";
import { PersistentChart } from "@/components/PersistentChart";
import { formatNumber } from "@/lib/gameData";
import { TrendingUp, TrendingDown, Zap, X } from "lucide-react";
import { assetNames } from "@/lib/assetNames";
import { TRADING_ASSETS } from "@/lib/tradingAssets";

interface SimpleTradingSectionProps {
  gameState: any;
  onBuyAsset: (assetId: string, quantity: number) => void;
  onSellAsset: (assetId: string, quantity: number) => void;
  prices: Record<string, number>;
  setPrices: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  priceChanges: Record<string, number>;
}

import type { TradingAsset } from "@/lib/tradingAssets";

// Функция для красивого форматирования чисел с пробелами
const formatPrice = (price: number): string => {
  return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export function SimpleTradingSection({ gameState, onBuyAsset, onSellAsset, prices, setPrices, priceChanges }: SimpleTradingSectionProps) {
  // Фильтруем активы по уровню игрока
  const availableAssets = TRADING_ASSETS.filter(asset => asset.requiredLevel <= gameState.level);
  // console.log('🎮 Уровень игрока:', gameState.level, 'Доступно активов:', availableAssets.length);
  const [selectedAsset, setSelectedAsset] = useState<TradingAsset>(availableAssets.find(asset => asset.id === 'aapl') || availableAssets[0]);
  // const [prices, setPrices] = useState<Record<string, number>>(() => {
  //   const initialPrices: Record<string, number> = {};
  //   TRADING_ASSETS.forEach(asset => {
  //     initialPrices[asset.id] = asset.basePrice;
  //   });
  //   return initialPrices;
  // });

  // const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [modalAsset, setModalAsset] = useState<TradingAsset | null>(null);

  // Realistic price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const newPrices = { ...prev };
        const newChanges: Record<string, number> = {};

        TRADING_ASSETS.forEach(asset => {
          const currentPrice = prev[asset.id];
          
          // Дневной рост 400% в год = 1.0041 ежедневно
          const dailyGrowthRate = Math.pow(1 + asset.yearlyGrowthRate, 1/365) - 1;
          const baseGrowth = dailyGrowthRate / (24 * 60 / 3); // На 3 минуты
          
          // Увеличенная волатильность для большего риска и динамики
          const enhancedVolatility = asset.volatility * 3; // В 3 раза больше волатильности
          const volatilityChange = (Math.random() - 0.5) * enhancedVolatility;
          
          // Случайные новостные события (5% шанс каждые 3 секунды)
          const newsEventChance = Math.random();
          let newsImpact = 0;
          if (newsEventChance < 0.05) {
            // Большие скачки от "новостей" - от -15% до +20%
            newsImpact = (Math.random() - 0.3) * 0.35;
          }
          
          // Общее изменение цены
          const totalChange = baseGrowth + volatilityChange + newsImpact;
          const newPrice = currentPrice * (1 + totalChange);
          
          // Более широкий диапазон цен для большего риска
          const minPrice = asset.basePrice * 0.3; // Может упасть до 30% от базы
          const maxPrice = asset.basePrice * 10.0; // Может вырасти в 10 раз
          
          newPrices[asset.id] = Math.max(minPrice, Math.min(maxPrice, Math.round(newPrice * 100) / 100));
          newChanges[asset.id] = ((newPrices[asset.id] - currentPrice) / currentPrice) * 100;
        });

        // setPriceChanges(newChanges);
        return newPrices;
      });
    }, 1500); // Update every 1.5 seconds для большей динамики

    return () => clearInterval(interval);
  }, []);

  const getCurrentPrice = (assetId: string): number => {
    return prices[assetId] || 0;
  };

  const getBuyPrice = (assetId: string): number => {
    const basePrice = getCurrentPrice(assetId);
    // Одинаковая цена для покупки и продажи
    return basePrice;
  };

  const getSellPrice = (assetId: string): number => {
    const basePrice = getCurrentPrice(assetId);
    // Одинаковая цена для покупки и продажи
    return basePrice;
  };

  const getPriceChange = (assetId: string): number => {
    return priceChanges[assetId] || 0;
  };

  const getAssetQuantity = (assetId: string): number => {
    const gameAssetId = getGameAssetId(assetId);
    return gameState.investments[gameAssetId] || 0;
  };

  const canAfford = (asset: TradingAsset): boolean => {
    return gameState.balance >= getBuyPrice(asset.id);
  };

  const canSell = (asset: TradingAsset): boolean => {
    return getAssetQuantity(asset.id) > 0;
  };

  // Соответствие торговых активов и игровых активов
  const getGameAssetId = (tradingAssetId: string): string => {
    const mapping: Record<string, string> = {
      // Основные активы
      'aapl': 'apple',
      'tsla': 'tesla', 
      'btc': 'btc-separate',
      'eth': 'eth-separate',
      
      // Новые активы - ID торгового актива совпадает с ID в investments
      'msft': 'msft',
      'googl': 'googl',
      'amzn': 'amzn',
      'nvda': 'nvda',
      'jpm': 'jpm',
      'brk': 'brk',
      'ko': 'ko',
      'pg': 'pg',
      'jnj': 'jnj',
      'pfz': 'pfz',
      'oil': 'oil',
      'gold': 'gold',
      'silver': 'silver',
      'platinum': 'platinum',
      'uranium': 'uranium',
      'magdoladns': 'magdoladns',
      'burger_queen': 'burger_queen',
      'biocat': 'biocat',
      'krc': 'krc',
      'chtz': 'chtz'
    };
    return mapping[tradingAssetId] || tradingAssetId;
  };

  const handleQuickBuy = (asset: TradingAsset) => {
    const gameAssetId = getGameAssetId(asset.id);
    // Используем стандартную функцию покупки
    onBuyAsset(gameAssetId, 1);
  };

  const handleQuickSell = (asset: TradingAsset) => {
    const gameAssetId = getGameAssetId(asset.id);
    // Используем стандартную функцию продажи
    onSellAsset(gameAssetId, 1);
  };

  const openChartModal = (asset: TradingAsset) => {
    setModalAsset(asset);
    setChartModalOpen(true);
  };

  const getTotalPortfolioValue = (): number => {
    let total = 0;
    
    // Проходим по всем инвестициям игрока
    Object.entries(gameState.investments).forEach(([assetId, quantity]) => {
      const qty = Number(quantity);
      if (qty > 0) {
        // Базовые цены для торговых активов
        const assetPrices: Record<string, number> = {
          'apple': getCurrentPrice('aapl'),
          'tesla': getCurrentPrice('tsla'), 
          'btc-separate': getCurrentPrice('btc'),
          'eth-separate': getCurrentPrice('eth'),
          'ko': getCurrentPrice('ko'),
          'oil': getCurrentPrice('oil'),
          'gold': getCurrentPrice('gold'),
          'silver': getCurrentPrice('silver'),
          'platinum': getCurrentPrice('platinum'),
          'uranium': getCurrentPrice('uranium')
        };
        if (assetPrices[assetId]) {
          total += qty * assetPrices[assetId];
        } else {
          if (assetId === 'ko') total += qty * 68;
          else if (assetId === 'oil') total += qty * 73;
        }
      }
    });
    
    return total;
  };

  const getTotalGainLoss = (): { amount: number; percentage: number; isPositive: boolean } => {
    const currentValue = getTotalPortfolioValue();
    
    // Считаем реальную стоимость покупок на основе данных из investmentPurchases
    let totalCost = 0;
    
    // Обходим все возможные активы
    const allPurchaseKeys = Object.keys(gameState.investmentPurchases || {});
    allPurchaseKeys.forEach(key => {
      const purchaseInfo = gameState.investmentPurchases?.[key];
      if (purchaseInfo && purchaseInfo.totalShares > 0) {
        totalCost += purchaseInfo.totalCost;
      }
    });
    
    // Если нет данных о покупках или портфель пуст, генерируем реалистичные данные
    if (totalCost === 0 || currentValue === 0) {
      // Генерируем синтетические данные, основанные на времени
      const now = Date.now();
      const dayOfMonth = new Date().getDate();
      const hourOfDay = new Date().getHours();
      
      // Различные частоты для большей реалистичности
      const cyclicalComponent = Math.sin(now / 180000) * 3; // 3-х часовая волна
      const dailyComponent = Math.sin((dayOfMonth + hourOfDay/24) * Math.PI / 15) * 2; // месячная волна
      
      // Сдвиг до 2% в любую сторону
      const randomComponent = (((now % 1000) / 1000) * 4) - 2; 
      
      // Комбинируем компоненты для получения процента
      const syntheticPercentage = cyclicalComponent + dailyComponent + randomComponent;
      const isPositive = syntheticPercentage >= 0;
      
      // Рассчитываем синтетический P&L для показа
      let syntheticAmount = 0;
      if (currentValue > 0) {
        // Если есть активы, но нет данных о покупках
        syntheticAmount = currentValue * (syntheticPercentage / 100);
      } else {
        // Если портфель пуст, показываем небольшие значения
        syntheticAmount = Math.abs(syntheticPercentage) * 10; // $0-$30 
      }
      
      return { 
        amount: isPositive ? syntheticAmount : -syntheticAmount, 
        percentage: Math.abs(syntheticPercentage), 
        isPositive 
      };
    }
    
    // Реальный расчет для существующих покупок
    const gainLoss = currentValue - totalCost;
    const percentage = (gainLoss / totalCost) * 100;
    return { amount: gainLoss, percentage, isPositive: gainLoss >= 0 };
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Portfolio Overview */}
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 p-4">
        <h2 className="text-lg font-bold mb-3 text-amber-400">Portfolio Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400">Portfolio Value</div>
            <div className="text-xl font-bold">${formatNumber(getTotalPortfolioValue())}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Available Balance</div>
            <div className="text-xl font-bold text-green-400">${gameState.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>
        {(() => {
          const gainLoss = getTotalGainLoss();
          return (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400">Today's P&L</span>
                {getTotalPortfolioValue() > 0 ? (
                  <div className={`flex items-center text-sm ${gainLoss.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {gainLoss.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {gainLoss.isPositive ? '+' : ''}${formatNumber(gainLoss.amount)} ({gainLoss.percentage.toFixed(2)}%)
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">$0.00 (0.00%)</div>
                )}
              </div>
              
              {/* Holdings Section */}
              <div className="space-y-2">
                <div className="text-xs text-gray-400 mb-2">Holdings</div>
                {(() => {
                  // Создаем мапинг всех торговых активов (по возрастанию цены)
                  const assetMapping = [
                    { investmentKey: 'ko', priceKey: 'ko', symbol: 'KOLA', name: assetNames.ko, icon: '🥤' },
                    { investmentKey: 'oil', priceKey: 'oil', symbol: 'OIL', name: assetNames.oil, icon: '🛢️' },
                    { investmentKey: 'jnj', priceKey: 'jnj', symbol: 'JNSN', name: assetNames.jnj, icon: '💊' },
                    { investmentKey: 'pg', priceKey: 'pg', symbol: 'PRGB', name: assetNames.pg, icon: '🧴' },
                    { investmentKey: 'googl', priceKey: 'googl', symbol: 'FOGL', name: assetNames.googl, icon: '🔍' },
                    { investmentKey: 'amzn', priceKey: 'amzn', symbol: 'AMZM', name: assetNames.amzn, icon: '📦' },
                    { investmentKey: 'apple', priceKey: 'aapl', symbol: 'TIPL', name: assetNames.apple, icon: '🍎' },
                    { investmentKey: 'jpm', priceKey: 'jpm', symbol: 'KPM', name: assetNames.jpm, icon: '🏦' },
                    { investmentKey: 'tesla', priceKey: 'tsla', symbol: 'DESL', name: assetNames.tsla, icon: '⚡' },
                    { investmentKey: 'silver', priceKey: 'silver', symbol: 'SILVER', name: assetNames.silver, icon: '🥈' },
                    { investmentKey: 'msft', priceKey: 'msft', symbol: 'MSYS', name: assetNames.msft, icon: '🖥️' },
                    { investmentKey: 'nvda', priceKey: 'nvda', symbol: 'MVDA', name: assetNames.nvda, icon: '🎮' },
                    { investmentKey: 'platinum', priceKey: 'platinum', symbol: 'PLAT', name: assetNames.platinum, icon: '⚪' },
                    { investmentKey: 'gold', priceKey: 'gold', symbol: 'GOLD', name: assetNames.gold, icon: '🥇' },
                    { investmentKey: 'eth-separate', priceKey: 'eth', symbol: 'ETH', name: assetNames.eth, icon: '⟠' },
                    { investmentKey: 'btc-separate', priceKey: 'btc', symbol: 'BTC', name: assetNames.btc, icon: '₿' },
                    { investmentKey: 'brk', priceKey: 'brk', symbol: 'BRKS', name: assetNames.brk, icon: '💎' },
                    { investmentKey: 'uranium', priceKey: 'uranium', symbol: 'URAN', name: assetNames.uranium, icon: '☢️' },
                    { investmentKey: 'magdoladns', priceKey: 'magdoladns', symbol: 'MGD', name: 'Magdoladns', icon: '🍔' },
                    { investmentKey: 'burger_queen', priceKey: 'burger_queen', symbol: 'BQ', name: 'Burger Queen', icon: '👑' },
                    { investmentKey: 'biocat', priceKey: 'biocat', symbol: 'BIO', name: 'BIOCAT', icon: '🧬' },
                    { investmentKey: 'krc', priceKey: 'krc', symbol: 'KRC', name: 'Fried Chickens', icon: '🐔' },
                    { investmentKey: 'chtz', priceKey: 'chtz', symbol: 'CHTZ', name: 'Chelyabinsk Tractor Plant', icon: '🚜' }
                  ];
                  
                  // Определяем тип для объекта holding
                  interface Holding {
                    symbol: string;
                    name: string;
                    quantity: number;
                    price: number;
                    value: number;
                    icon: string;
                  }
                  
                  // Универсальный способ: показывать все активы, которыми владеет игрок
                  const holdings: (Holding & { assetId: string })[] = Object.keys(gameState.investments)
                    .filter(assetId => (gameState.investments[assetId] || 0) > 0)
                    .map(assetId => {
                      const asset = TRADING_ASSETS.find(a => a.id === assetId);
                      if (!asset) return null;
                      const quantity = gameState.investments[assetId] || 0;
                      const price = getCurrentPrice(assetId);
                      return {
                        symbol: asset.symbol,
                        name: asset.name,
                        quantity,
                        price,
                        value: quantity * price,
                        icon: asset.icon,
                        assetId
                      };
                    })
                    .filter(Boolean) as (Holding & { assetId: string })[];
                  
                  if (holdings.length === 0) {
                    return (
                      <div className="text-xs text-gray-500 italic">No holdings</div>
                    );
                  }
                  
                  return holdings.map((holding) => {
                    const tradingAsset = TRADING_ASSETS.find(asset => asset.id === holding.assetId);
                    if (!tradingAsset) return null;

                    const purchaseKey = holding.assetId;
                    const purchaseInfo = gameState.investmentPurchases?.[purchaseKey] || null;

                    let gainLossPercent = 0;
                    let avgBuyPrice = holding.price;

                    const seed = holding.symbol.charCodeAt(0) * holding.symbol.charCodeAt(1);
                    const now = Date.now();
                    const uniqueFreq = 30000 + (seed % 15000);
                    const amplitude = 2 + (seed % 10);
                    const randomOffset = ((Math.floor(now / 10000) + seed) % 1000) / 200 - 2.5;
                    const basePercentChange = (Math.sin(now / uniqueFreq + seed) * amplitude) + randomOffset;

                    if (purchaseInfo && purchaseInfo.totalShares > 0) {
                      avgBuyPrice = purchaseInfo.totalCost / purchaseInfo.totalShares;
                      const totalCost = avgBuyPrice * holding.quantity;
                      const realPercent = totalCost > 0 ? ((holding.value - totalCost) / totalCost) * 100 : 0;
                      gainLossPercent = Math.abs(realPercent) < 0.01 ? basePercentChange : realPercent;
                    } else {
                      gainLossPercent = basePercentChange;
                    }

                    const gainLoss = gainLossPercent > 0 ? Math.abs(gainLossPercent) * holding.value / 100 : -Math.abs(gainLossPercent) * holding.value / 100;
                    const isPositive = gainLoss >= 0;

                    const priceVolatility = Math.abs(Math.sin(Date.now() / 30000 + holding.symbol.charCodeAt(0)));
                    const recommendation = priceVolatility > 0.6 ? 'SELL' : priceVolatility < 0.3 ? 'BUY' : 'HOLD';
                    const recColor = recommendation === 'BUY' ? 'text-green-400' : 
                                   recommendation === 'SELL' ? 'text-red-400' : 'text-yellow-400';

                    return (
                      <div 
                        key={holding.symbol} 
                        className="flex items-center justify-between text-xs bg-white/5 rounded p-1.5 mb-1.5"
                      >
                        <div 
                          className="flex items-center space-x-1.5 cursor-pointer hover:bg-white/5 rounded p-1 -m-1 transition-colors flex-1"
                          onClick={() => tradingAsset && openChartModal(tradingAsset)}
                        >
                          <span className="text-xs">{holding.icon}</span>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-white font-medium text-xs">{holding.symbol}</span>
                              <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${recColor} bg-black/20`}>
                                {recommendation}
                              </span>
                            </div>
                            <div className="text-gray-400">{holding.quantity} × ${avgBuyPrice > 0 ? formatPrice(avgBuyPrice) : formatPrice(holding.price)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="text-white">${formatPrice(holding.value)}</div>
                            <div className={`${isPositive ? 'text-green-400' : 'text-red-400'}`}>{isPositive ? '+' : ''}{gainLossPercent.toFixed(1)}%</div>
                          </div>
                          {/* Quick Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (tradingAsset && holding.quantity > 0) {
                                  onSellAsset(tradingAsset.id, 1);
                                }
                              }}
                              className="w-7 h-6 bg-red-500 text-white rounded text-sm font-bold hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                              disabled={!tradingAsset || holding.quantity === 0}
                            >
                              -
                            </button>
                            <span className="text-sm text-white font-bold px-2 min-w-[24px] text-center">{holding.quantity}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (tradingAsset) {
                                  onBuyAsset(tradingAsset.id, getCurrentPrice(tradingAsset.id));
                                }
                              }}
                              className="w-7 h-6 bg-green-500 text-white rounded text-sm font-bold hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                              disabled={!tradingAsset || gameState.balance < getCurrentPrice(tradingAsset.id)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          );
        })()}
      </Card>

      {/* Asset Selection Grid */}
      <div className="grid grid-cols-2 gap-3">
        {availableAssets.map(asset => {
          const currentPrice = getCurrentPrice(asset.id);
          const priceChange = getPriceChange(asset.id);
          const quantity = getAssetQuantity(asset.id);
          const isSelected = selectedAsset.id === asset.id;

          return (
            <Card 
              key={asset.id}
              className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 p-2 cursor-pointer transition-all hover:shadow-[0_8px_32px_rgba(139,92,246,0.3)] ${
                isSelected ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/20' : 'hover:border-slate-600/50'
              }`}
              onClick={() => openChartModal(asset)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm">{asset.icon}</span>
                  <div>
                    <div className="font-bold text-xs">{asset.symbol}</div>
                    <div className="text-[10px] text-gray-400 line-clamp-1">{asset.name}</div>
                  </div>
                </div>
                <Badge className={`text-xs ${
                  priceChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Price:</span>
                  <span className="font-bold">${formatPrice(currentPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Owned:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickSell(asset);
                      }}
                      disabled={!canSell(asset)}
                      className="w-5 h-5 flex items-center justify-center bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      -
                    </button>
                    <span className="text-[10px] min-w-[25px] text-center">{quantity.toLocaleString('en-US')}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickBuy(asset);
                      }}
                      disabled={!canAfford(asset)}
                      className="w-5 h-5 flex items-center justify-center bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Value:</span>
                  <span className="text-xs font-semibold text-green-400">${formatPrice(quantity * currentPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Volume:</span>
                  <span className="text-xs">${formatNumber(currentPrice * Math.random() * 1000000 + 500000)}</span>
                </div>
                {!canAfford(asset) && (
                  <div className="flex justify-between items-center border-t border-red-500/20 pt-1 mt-1">
                    <span className="text-xs text-red-400">Need more:</span>
                    <span className="text-xs text-red-400 font-semibold">
                      ${(getBuyPrice(asset.id) - gameState.balance).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Compact Trading Modal */}
      {chartModalOpen && modalAsset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-3"
             onClick={() => setChartModalOpen(false)}>
          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 border border-white/20 rounded-xl p-4 max-w-sm w-full max-h-[85vh] overflow-y-auto backdrop-blur-xl"
               onClick={(e) => e.stopPropagation()}>
            
            {/* Compact Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-sm">
                  {modalAsset.icon}
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{modalAsset.name}</div>
                  <div className="text-gray-400 text-xs">{modalAsset.symbol} • {modalAsset.type.toUpperCase()}</div>
                </div>
              </div>
              <button
                onClick={() => setChartModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Price - Compact */}
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-white">${formatPrice(getCurrentPrice(modalAsset.id))}</div>
              <div className={`text-lg flex items-center justify-center space-x-1 ${
                getPriceChange(modalAsset.id) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {getPriceChange(modalAsset.id) >= 0 ? 
                  <TrendingUp className="w-4 h-4" /> : 
                  <TrendingDown className="w-4 h-4" />
                }
                <span>{getPriceChange(modalAsset.id) >= 0 ? '+' : ''}{getPriceChange(modalAsset.id).toFixed(2)}%</span>
              </div>
            </div>

            {/* Price Summary Card - Compact */}
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold text-white">{modalAsset.name}</div>
                <div className="flex space-x-1">
                  <button className="px-2 py-1 text-xs bg-white/10 rounded text-gray-400">1h</button>
                  <button className="px-2 py-1 text-xs bg-blue-500 rounded text-white font-bold">24h</button>
                  <button className="px-2 py-1 text-xs bg-white/10 rounded text-gray-400">7d</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-white">${formatPrice(getCurrentPrice(modalAsset.id))}</div>
                <div className={`text-sm font-bold ${
                  getPriceChange(modalAsset.id) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {getPriceChange(modalAsset.id) >= 0 ? '+' : ''}{getPriceChange(modalAsset.id).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Asset Description */}
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <div className="text-xs text-gray-400 mb-2">About</div>
              <div className="text-sm text-gray-200">
                {modalAsset.id === 'ko' && "Coca-Cola Company - Global beverage leader with strong dividend history and worldwide presence."}
                {modalAsset.id === 'tsla' && "Tesla Inc - Electric vehicle pioneer revolutionizing sustainable transportation and energy storage."}
                {modalAsset.id === 'aapl' && "Apple Inc - Technology giant known for innovative consumer electronics and services ecosystem."}
                {modalAsset.id === 'msft' && "Microsoft Corporation - Leading cloud computing and software solutions provider for businesses worldwide."}
                {modalAsset.id === 'amzn' && "Amazon.com Inc - E-commerce and cloud computing giant dominating online retail and AWS services."}
                {modalAsset.id === 'googl' && "Alphabet Inc - Parent company of Google, leading in search, advertising, and AI technologies."}
                {modalAsset.id === 'btc' && "Bitcoin - The original cryptocurrency and digital store of value with decentralized blockchain technology."}
                {modalAsset.id === 'eth' && "Ethereum - Smart contract platform enabling decentralized applications and DeFi innovations."}
                {modalAsset.id === 'gold' && "Gold - Precious metal commodity traditionally used as a hedge against inflation and economic uncertainty."}
                {modalAsset.id === 'silver' && "Silver - Industrial precious metal with both investment and manufacturing applications."}
                {modalAsset.id === 'oil' && "Crude Oil - Essential energy commodity driving global transportation and industrial production."}
                {modalAsset.id === 'uranium' && "Uranium - Nuclear fuel commodity critical for clean energy production and carbon reduction goals."}
                {modalAsset.id === 'platinum' && "Platinum - Rare precious metal with automotive, jewelry, and industrial applications."}
                {modalAsset.id === 'magdoladns' && "Magdoladns - A popular fast-food chain known for its burgers and fries."}
                {modalAsset.id === 'burger_queen' && "Burger Queen - Fast-food restaurant chain specializing in burgers, fries, and shakes."}
                {modalAsset.id === 'biocat' && "BIOCAT - A biotechnology company focused on genetic research and development."}
                {modalAsset.id === 'krc' && "Fried Chickens - A fast-food chain famous for its fried chicken and biscuits."}
                {modalAsset.id === 'chtz' && "Chelyabinsk Tractor Plant - A major manufacturer of tractors and agricultural machinery in Russia."}
                {!['ko', 'tsla', 'aapl', 'msft', 'amzn', 'googl', 'btc', 'eth', 'gold', 'silver', 'oil', 'uranium', 'platinum', 'magdoladns', 'burger_queen', 'biocat', 'krc', 'chtz'].includes(modalAsset.id) && 
                 `${modalAsset.name} - A ${modalAsset.type} investment opportunity with growth potential in the current market.`}
              </div>
            </div>

            {/* Holdings Info - Compact */}
            <div className="flex justify-between items-center mb-4 text-sm">
              <div>
                <div className="text-gray-400">You Own</div>
                <div className="font-bold text-white">{formatNumber(getAssetQuantity(modalAsset.id))} shares</div>
              </div>
              <div className="text-right">
                <div className="text-gray-400">Total Value</div>
                <div className="font-bold text-green-400">${formatPrice(getAssetQuantity(modalAsset.id) * getCurrentPrice(modalAsset.id))}</div>
              </div>
            </div>

            {/* Persistent Chart with real-time updates */}
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <PersistentChart 
                assetName={modalAsset.name}
                assetId={modalAsset.id}
                currentPrice={getCurrentPrice(modalAsset.id)}
                assetType={modalAsset.type}
                className="h-32"
              />
            </div>

            {/* Action Buttons - Compact */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                onClick={() => {
                  handleQuickBuy(modalAsset);
                  setChartModalOpen(false);
                }}
                disabled={!canAfford(modalAsset)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 text-sm rounded-lg"
              >
                BUY ${formatPrice(getCurrentPrice(modalAsset.id))}
              </Button>
              <Button
                onClick={() => {
                  handleQuickSell(modalAsset);
                  setChartModalOpen(false);
                }}
                disabled={!canSell(modalAsset)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 text-sm rounded-lg"
              >
                SELL ${formatPrice(getCurrentPrice(modalAsset.id))}
              </Button>
            </div>

            {/* Market Info - Very Compact */}
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
              <div>
                <div className="text-gray-400">Market Cap</div>
                <div className="text-white font-bold">${formatNumber(getCurrentPrice(modalAsset.id) * 1000)}M</div>
              </div>
              <div>
                <div className="text-gray-400">Volume</div>
                <div className="text-white font-bold">${formatNumber(getCurrentPrice(modalAsset.id) * 50)}K</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export function getTradingAssetPrice(assetId: string, prices?: Record<string, number>): number {
  const tradingAsset = TRADING_ASSETS.find((a: any) => a.id === assetId);
  if (!tradingAsset) return 0;
  if (prices && prices[assetId]) {
    return prices[assetId];
  }
  return tradingAsset.basePrice;
}

export { TRADING_ASSETS };