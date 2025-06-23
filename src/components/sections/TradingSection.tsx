import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TradingChart } from "@/components/TradingChart";
import { formatNumber } from "@/lib/gameData";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

interface TradingSectionProps {
  gameState: any;
  onBuyAsset: (assetId: string, quantity: number) => void;
  onSellAsset: (assetId: string, quantity: number) => void;
}

interface TradingAsset {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  change24h: number;
  volume: number;
  marketCap: number;
  type: 'crypto' | 'stock';
  icon: string;
}

const TRADING_ASSETS: TradingAsset[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    currentPrice: 43250.50,
    change24h: 2.34,
    volume: 28500000000,
    marketCap: 845000000000,
    type: 'crypto',
    icon: '₿'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    currentPrice: 2650.75,
    change24h: -1.22,
    volume: 15200000000,
    marketCap: 318000000000,
    type: 'crypto',
    icon: 'Ξ'
  },
  {
    id: 'aapl',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    currentPrice: 195.83,
    change24h: 0.87,
    volume: 45600000,
    marketCap: 3020000000000,
    type: 'stock',
    icon: '🍎'
  },
  {
    id: 'googl',
    name: 'Alphabet Inc.',
    symbol: 'GOOGL',
    currentPrice: 142.56,
    change24h: 1.45,
    volume: 25800000,
    marketCap: 1790000000000,
    type: 'stock',
    icon: '🔍'
  },
  {
    id: 'tsla',
    name: 'Tesla Inc.',
    symbol: 'TSLA',
    currentPrice: 248.42,
    change24h: -2.15,
    volume: 89200000,
    marketCap: 789000000000,
    type: 'stock',
    icon: '⚡'
  },
  {
    id: 'nvda',
    name: 'NVIDIA Corp.',
    symbol: 'NVDA',
    currentPrice: 875.30,
    change24h: 3.67,
    volume: 52100000,
    marketCap: 2160000000000,
    type: 'stock',
    icon: '🎮'
  }
];

export function TradingSection({ gameState, onBuyAsset, onSellAsset }: TradingSectionProps) {
  const [selectedAsset, setSelectedAsset] = useState<TradingAsset>(TRADING_ASSETS[0]);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('1');
  
  // Price simulation with volatility
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>(() => {
    const prices: Record<string, number> = {};
    TRADING_ASSETS.forEach(asset => {
      prices[asset.id] = asset.currentPrice;
    });
    return prices;
  });

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrices(prev => {
        const newPrices = { ...prev };
        TRADING_ASSETS.forEach(asset => {
          // Simulate price volatility (±0.5% to ±3%)
          const volatility = asset.type === 'crypto' ? 0.03 : 0.015; // Crypto more volatile
          const changePercent = (Math.random() - 0.5) * volatility * 2;
          const newPrice = prev[asset.id] * (1 + changePercent);
          newPrices[asset.id] = Math.max(newPrice, asset.currentPrice * 0.8); // Don't go below 80% of base
        });
        return newPrices;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const getAssetQuantity = (assetId: string): number => {
    return gameState.investments[assetId] || 0;
  };

  const canAffordAsset = (asset: TradingAsset, qty: number): boolean => {
    return gameState.balance >= (asset.currentPrice * qty);
  };

  const handleTrade = () => {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;

    if (orderType === 'buy') {
      if (canAffordAsset(selectedAsset, qty)) {
        onBuyAsset(selectedAsset.id, qty);
        setQuantity('1');
      }
    } else {
      const owned = getAssetQuantity(selectedAsset.id);
      if (owned >= qty) {
        onSellAsset(selectedAsset.id, qty);
        setQuantity('1');
      }
    }
  };

  const getMaxQuantity = (): number => {
    if (orderType === 'buy') {
      return Math.floor(gameState.balance / selectedAsset.currentPrice);
    } else {
      return getAssetQuantity(selectedAsset.id);
    }
  };

  const getTotalValue = (): number => {
    const qty = parseFloat(quantity) || 0;
    return selectedAsset.currentPrice * qty;
  };

  return (
    <div className="space-y-6 pb-20 pt-0">
      {/* Market Overview */}
      <div className="grid grid-cols-2 gap-3 mt-0">
        {TRADING_ASSETS.map(asset => (
          <Card 
            key={asset.id}
            className={`glass-card border-white/10 p-3 cursor-pointer transition-all ${
              selectedAsset.id === asset.id ? 'border-blue-500/50 bg-blue-500/10' : 'hover:border-white/20'
            }`}
            onClick={() => setSelectedAsset(asset)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{asset.icon}</span>
                <div>
                  <div className="font-bold text-sm">{asset.symbol}</div>
                  <div className="text-xs text-gray-400">{asset.name}</div>
                </div>
              </div>
              <Badge className={`text-xs ${
                asset.change24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
              </Badge>
            </div>
            <div className="text-right">
              <div className="font-bold">${formatNumber(asset.currentPrice)}</div>
              <div className="text-xs text-gray-400">
                Owned: {formatNumber(getAssetQuantity(asset.id))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Trading Chart */}
      <Card className="glass-card border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{selectedAsset.icon}</span>
            <div>
              <h3 className="text-xl font-bold">{selectedAsset.name}</h3>
              <p className="text-gray-400">{selectedAsset.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${formatNumber(selectedAsset.currentPrice)}</div>
            <div className={`flex items-center text-sm ${
              selectedAsset.change24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {selectedAsset.change24h >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h.toFixed(2)}%
            </div>
          </div>
        </div>

        <TradingChart 
          assetName={selectedAsset.name}
          currentPrice={selectedAsset.currentPrice}
          assetType={selectedAsset.type}
          className="h-48"
        />

        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <div className="text-xs text-gray-400">Market Cap</div>
            <div className="font-bold">${formatNumber(selectedAsset.marketCap)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Volume (24h)</div>
            <div className="font-bold">${formatNumber(selectedAsset.volume)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">You Own</div>
            <div className="font-bold">{formatNumber(getAssetQuantity(selectedAsset.id))}</div>
          </div>
        </div>
      </Card>

      {/* Trading Panel */}
      <Card className="glass-card border-white/10 p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Trading Panel
        </h3>

        {/* Order Type */}
        <div className="flex space-x-2 mb-4">
          <Button
            variant={orderType === 'buy' ? 'default' : 'outline'}
            className={`flex-1 ${orderType === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}`}
            onClick={() => setOrderType('buy')}
          >
            BUY
          </Button>
          <Button
            variant={orderType === 'sell' ? 'default' : 'outline'}
            className={`flex-1 ${orderType === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}`}
            onClick={() => setOrderType('sell')}
          >
            SELL
          </Button>
        </div>

        {/* Order Mode */}
        <div className="flex space-x-2 mb-4">
          <Button
            variant={orderMode === 'market' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setOrderMode('market')}
          >
            Market
          </Button>
          <Button
            variant={orderMode === 'limit' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setOrderMode('limit')}
          >
            Limit
          </Button>
        </div>

        {/* Quantity Input */}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Quantity</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="glass-card border-white/10"
                min="0"
                step="0.01"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(getMaxQuantity().toString())}
                className="whitespace-nowrap"
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white/5 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price per {selectedAsset.symbol}</span>
              <span>${formatNumber(selectedAsset.currentPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Quantity</span>
              <span>{quantity || '0'}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-white/10 pt-2">
              <span>Total</span>
              <span>${formatNumber(getTotalValue())}</span>
            </div>
            {orderType === 'buy' && (
              <div className="flex justify-between text-xs text-gray-400">
                <span>Available Balance</span>
                <span>${formatNumber(gameState.balance)}</span>
              </div>
            )}
            {orderType === 'sell' && (
              <div className="flex justify-between text-xs text-gray-400">
                <span>Available to Sell</span>
                <span>{formatNumber(getAssetQuantity(selectedAsset.id))}</span>
              </div>
            )}
          </div>

          {/* Trade Button */}
          <Button
            className={`w-full ${
              orderType === 'buy' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
            onClick={handleTrade}
            disabled={
              parseFloat(quantity) <= 0 || 
              (orderType === 'buy' && !canAffordAsset(selectedAsset, parseFloat(quantity))) ||
              (orderType === 'sell' && getAssetQuantity(selectedAsset.id) < parseFloat(quantity))
            }
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {orderType === 'buy' ? 'BUY' : 'SELL'} {selectedAsset.symbol}
          </Button>
        </div>
      </Card>
    </div>
  );
}