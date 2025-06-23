import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { formatNumber } from "@/lib/gameData";
import { useToast } from "@/hooks/use-toast";
import { Zap, Bomb, Gem, Rocket, Cherry, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

interface CasinoSectionProps {
  gameState: any;
  onUpdateBalance: (newBalance: number) => void;
  onRecordTransaction: (transaction: any) => void;
}

interface CasinoGame {
  id: string;
  name: string;
  description: string;
  icon: any;
  minBet: number;
  maxBet: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  color: string;
}

const CASINO_GAMES: CasinoGame[] = [
  {
    id: 'diamond_mine',
    name: 'Diamond Mine',
    description: 'Find diamonds, avoid bombs. Each diamond multiplies your bet!',
    icon: Gem,
    minBet: 1000,
    maxBet: 250000,
    riskLevel: 'Medium',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'rocket_crash',
    name: 'Rocket Crash',
    description: 'Cash out before the rocket crashes! Higher = bigger wins.',
    icon: Rocket,
    minBet: 2500,
    maxBet: 500000,
    riskLevel: 'High',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'slot_machine',
    name: 'Slot Machine',
    description: 'Classic slots with progressive jackpot!',
    icon: Cherry,
    minBet: 500,
    maxBet: 150000,
    riskLevel: 'Low',
    color: 'from-purple-500 to-pink-600'
  }
];

export function CasinoSection({ gameState, onUpdateBalance, onRecordTransaction }: CasinoSectionProps) {
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<CasinoGame | null>(null);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [betAmount, setBetAmount] = useState(500);
  
  // Diamond Mine state
  const [mineGrid, setMineGrid] = useState<Array<Array<'hidden' | 'diamond' | 'bomb' | 'revealed'>>>([]);
  const [mineGameActive, setMineGameActive] = useState(false);
  const [mineWinnings, setMineWinnings] = useState(0);
  const [diamondsFound, setDiamondsFound] = useState(0);
  const [explosionMessage, setExplosionMessage] = useState('');
  const [showExplosion, setShowExplosion] = useState(false);
  
  // Rocket Crash state
  const [rocketMultiplier, setRocketMultiplier] = useState(1.0);
  const [rocketGameActive, setRocketGameActive] = useState(false);
  const [rocketCrashed, setRocketCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [rocketInterval, setRocketInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Slot Machine state
  const [slotReels, setSlotReels] = useState(['🍒', '🍒', '🍒']);
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [jackpot, setJackpot] = useState(1250000);
  const [spinningReels, setSpinningReels] = useState(['🍒', '🍒', '🍒']);
  const [jackpotNotifications, setJackpotNotifications] = useState(new Set<number>());
  
  const openGameModal = (game: CasinoGame) => {
    setSelectedGame(game);
    setGameModalOpen(true);
    setBetAmount(game.minBet * 10); // Устанавливаем разумную начальную ставку
  };

  const canAffordBet = (amount: number): boolean => {
    return gameState.balance >= amount;
  };

  const showInsufficientFundsToast = (amount: number) => {
    toast({
      title: "💰 Insufficient Funds",
      description: `Need $${Math.floor(amount)} but have $${Math.floor(gameState.balance)}`,
      className: "bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white border-red-500 shadow-xl",
    });
  };

  const updateBalanceWithWin = (winAmount: number, gameName: string, details?: string) => {
    onUpdateBalance(gameState.balance + winAmount);
    
    // Добавляем запись в историю транзакций
    const transaction = {
      id: `casino-win-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'casino',
      amount: winAmount,
      description: `Win in ${gameName}${details ? ` (${details})` : ''}`,
      timestamp: new Date(),
      source: 'Casino'
    };
    
    onRecordTransaction(transaction);
    
    // Show toast notification based on win amount
    if (winAmount >= 100000) {
      toast({
        title: "🎰 MEGA WIN!",
        description: `+$${Math.floor(winAmount)} in ${gameName}! ${details || ''}`,
        className: "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-black border-yellow-300 shadow-2xl font-bold",
      });
    } else if (winAmount >= 25000) {
      toast({
        title: "🎊 BIG WIN!",
        description: `+$${Math.floor(winAmount)} in ${gameName}! ${details || ''}`,
        className: "bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 text-white border-emerald-300 shadow-xl font-semibold",
      });
    } else {
      toast({
        title: "💰 WIN!",
        description: `+$${Math.floor(winAmount)} in ${gameName}`,
        className: "bg-gradient-to-r from-green-500 via-emerald-600 to-green-700 text-white border-green-400 shadow-lg",
      });
    }
    
    console.log(`🎰 Win in ${gameName}: +$${winAmount} ${details || ''}`);
  };

  const recordBetLoss = (betAmount: number, gameName: string, details?: string) => {
    // Записываем ставку как проигрыш в историю транзакций
    const transaction = {
      id: `casino-bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'casino',
      amount: -betAmount, // Ставка - это расход
      description: `Ставка в ${gameName}${details ? ` (${details})` : ''}`,
      timestamp: new Date(),
      source: 'Casino'
    };
    
    onRecordTransaction(transaction);
    console.log(`🎲 Ставка в ${gameName}: -$${betAmount} ${details || ''}`);
  };

  // Diamond Mine Logic
  const initializeMineGame = () => {
    if (!canAffordBet(betAmount)) {
      showInsufficientFundsToast(betAmount);
      return;
    }
    
    const grid = Array(5).fill(null).map(() => Array(5).fill('hidden'));
    
    // Place 5 bombs randomly
    const bombs = [];
    while (bombs.length < 5) {
      const row = Math.floor(Math.random() * 5);
      const col = Math.floor(Math.random() * 5);
      const pos = `${row}-${col}`;
      if (!bombs.includes(pos)) {
        bombs.push(pos);
        grid[row][col] = 'bomb';
      }
    }
    
    // Fill rest with diamonds
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (grid[i][j] === 'hidden') {
          grid[i][j] = 'diamond';
        }
      }
    }
    
    // Reset display grid
    const displayGrid = Array(5).fill(null).map(() => Array(5).fill('hidden'));
    setMineGrid(displayGrid);
    setMineGameActive(true);
    setMineWinnings(betAmount);
    setDiamondsFound(0);
    onUpdateBalance(gameState.balance - betAmount);
    recordBetLoss(betAmount, "Diamond Mine");
  };

  const revealMineCell = (row: number, col: number) => {
    if (!mineGameActive || mineGrid[row][col] !== 'hidden') return;
    
    const newGrid = [...mineGrid];
    
    // Check if it's a bomb (from hidden grid)
    const hiddenGrid = Array(5).fill(null).map(() => Array(5).fill('hidden'));
    const bombs = [];
    let bombSeed = betAmount + Date.now();
    
    // Recreate the same bomb positions
    while (bombs.length < 5) {
      const rowPos = bombSeed % 5;
      const colPos = (bombSeed * 7) % 5;
      const pos = `${rowPos}-${colPos}`;
      if (!bombs.includes(pos)) {
        bombs.push(pos);
      }
      bombSeed = bombSeed * 13 + 7;
    }
    
    const isBomb = bombs.includes(`${row}-${col}`);
    
    if (isBomb) {
      newGrid[row][col] = 'bomb';
      setMineGrid(newGrid);
      setMineGameActive(false);
      setMineWinnings(0);
      
      // Show explosion notification
      const lossAmount = betAmount;
      const diamondsFoundCount = diamondsFound;
      const message = `-$${Math.floor(lossAmount)} (${diamondsFoundCount} diamonds found)`;
      
      setExplosionMessage(message);
      setShowExplosion(true);
      
      // Show toast notification for bomb explosion after a short delay
      setTimeout(() => {
        toast({
          title: "💥 BOMB EXPLODED!",
          description: `Lost $${Math.floor(lossAmount)} after finding ${diamondsFoundCount} diamonds`,
          variant: "destructive",
        });
      }, 100);
      
      // Убираем сообщение через 2.5 секунды
      setTimeout(() => {
        setShowExplosion(false);
        setExplosionMessage('');
      }, 2500);
      
      // Добавляем запись о проигрыше в историю
      const transaction = {
        id: `mine-loss-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'casino',
        amount: -betAmount,
        description: `💥 Diamond Mine (${diamondsFound} 💎)`,
        timestamp: new Date(),
        source: 'Casino'
      };
      onRecordTransaction(transaction);
      console.log(`💥 Проигрыш в Diamond Mine: -$${betAmount} (найдено ${diamondsFound} алмазов)`);
    } else {
      newGrid[row][col] = 'diamond';
      setMineGrid(newGrid);
      const newDiamonds = diamondsFound + 1;
      setDiamondsFound(newDiamonds);
      const newWinnings = betAmount * Math.pow(1.4, newDiamonds);
      setMineWinnings(newWinnings);
      
      // Show diamond found notification
      setTimeout(() => {
        toast({
          title: "💎 DIAMOND FOUND!",
          description: `Found ${newDiamonds} diamonds! Current value: $${Math.floor(newWinnings)}`,
          className: "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white border-cyan-300 shadow-xl font-semibold",
        });
      }, 100);
    }
  };

  const cashOutMine = () => {
    if (mineWinnings > 0) {
      updateBalanceWithWin(mineWinnings, 50, 30);
      setMineGameActive(false);
    }
  };

  // Rocket Crash Logic
  const startRocketGame = () => {
    if (!canAffordBet(betAmount)) {
      showInsufficientFundsToast(betAmount);
      return;
    }
    
    setRocketMultiplier(1.0);
    setRocketGameActive(true);
    setRocketCrashed(false);
    setCashedOut(false);
    onUpdateBalance(gameState.balance - betAmount);
    recordBetLoss(betAmount, "Rocket Crash");
    
    const crashPoint = 1 + Math.random() * 9; // Crash between 1.0x and 10.0x
    
    const interval = setInterval(() => {
      setRocketMultiplier(prev => {
        // Ускоренный взлет от земли, затем нормальное ускорение
        const increment = prev < 1.5 ? 0.08 : prev < 3 ? 0.04 : prev < 6 ? 0.06 : 0.10;
        const newMultiplier = prev + increment;
        
        if (newMultiplier >= crashPoint) {
          setRocketCrashed(true);
          setRocketGameActive(false);
          clearInterval(interval);
          setRocketInterval(null);
          
          // Only show crash notification if player didn't cash out
          setTimeout(() => {
            setCashedOut(current => {
              if (!current) {
                toast({
                  title: "🚀💥 ROCKET CRASHED!",
                  description: `Crashed at ${crashPoint.toFixed(2)}x! Lost $${Math.floor(betAmount)}`,
                  className: "bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white border-red-500 shadow-2xl",
                });
              }
              return current;
            });
          }, 100);
          
          return crashPoint;
        }
        return newMultiplier;
      });
    }, 50); // Уменьшаем интервал с 100ms до 50ms для более плавной анимации
    
    setRocketInterval(interval);
  };

  const cashOutRocket = () => {
    if (rocketGameActive && !cashedOut && rocketInterval) {
      const winnings = betAmount * rocketMultiplier;
      updateBalanceWithWin(winnings, "Rocket Crash", `${rocketMultiplier.toFixed(2)}x`);
      setCashedOut(true);
      setRocketGameActive(false);
      
      // Clear the interval to stop the rocket
      clearInterval(rocketInterval);
      setRocketInterval(null);
      
      // Show success notification
      setTimeout(() => {
        toast({
          title: "🚀✨ CASH OUT SUCCESS!",
          description: `Cashed out at ${rocketMultiplier.toFixed(2)}x! Won $${Math.floor(winnings)}`,
          className: "bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 text-white border-emerald-400 shadow-2xl font-semibold",
        });
      }, 100);
    }
  };

  // Slot Machine Logic
  const spinSlots = () => {
    if (!canAffordBet(betAmount)) {
      showInsufficientFundsToast(betAmount);
      return;
    }
    
    setSlotSpinning(true);
    onUpdateBalance(gameState.balance - betAmount);
    recordBetLoss(betAmount, "Slot Machine");
    
    // Add to jackpot
    setJackpot(prev => {
      const newJackpot = prev + betAmount * 0.1;
      
      // Show jackpot milestone notifications only once per threshold
      const thresholds = [2000000, 1500000];
      thresholds.forEach(threshold => {
        if (newJackpot >= threshold && prev < threshold && !jackpotNotifications.has(threshold)) {
          setJackpotNotifications(current => new Set([...current, threshold]));
          
          setTimeout(() => {
            if (threshold === 2000000) {
              toast({
                title: "🎰 MASSIVE JACKPOT!",
                description: `Jackpot reached $${Math.floor(newJackpot)}! Lucky 7️⃣7️⃣7️⃣ wins it all!`,
                className: "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 text-white border-purple-400 shadow-2xl font-bold",
              });
            } else if (threshold === 1500000) {
              toast({
                title: "💎 HUGE JACKPOT!",
                description: `Jackpot is now $${Math.floor(newJackpot)}! Getting bigger!`,
                className: "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-blue-400 shadow-xl font-semibold",
              });
            }
          }, 100);
        }
      });
      
      return newJackpot;
    });
    
    const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '7️⃣'];
    
    // Анимация быстрого перебора символов
    let spinCount = 0;
    const maxSpins = 60; // 60 кадров анимации
    
    const spinInterval = setInterval(() => {
      // Генерируем случайные символы для каждого барабана
      const randomReels = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];
      
      setSpinningReels(randomReels);
      spinCount++;
      
      // Останавливаем анимацию через 60 кадров (2 секунды при 30fps)
      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        
        // Определяем финальные символы
        const finalReels = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        ];
        
        setSlotReels(finalReels);
        setSpinningReels(finalReels);
        setSlotSpinning(false);
        
        // Check for wins
        let winMultiplier = 0;
        if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
          if (finalReels[0] === '7️⃣') {
            // Jackpot!
            updateBalanceWithWin(jackpot, "Slot Machine", "JACKPOT! 7️⃣7️⃣7️⃣");
            setJackpot(50000); // Reset jackpot
            return;
          } else if (finalReels[0] === '💎') {
            winMultiplier = 50;
          } else if (finalReels[0] === '⭐') {
            winMultiplier = 25;
          } else if (finalReels[0] === '🍇') {
            winMultiplier = 15;
          } else if (finalReels[0] === '🍊') {
            winMultiplier = 10;
          } else if (finalReels[0] === '🍋') {
            winMultiplier = 8;
          } else if (finalReels[0] === '🍒') {
            winMultiplier = 5;
          }
        } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
          winMultiplier = 2;
        }
        
        if (winMultiplier > 0) {
          const winCombo = `${finalReels[0]}${finalReels[1]}${finalReels[2]}`;
          updateBalanceWithWin(betAmount * winMultiplier, "Slot Machine", `${winCombo} (x${winMultiplier})`);
        }
      }
    }, 33); // 30fps анимация
  };

  // Calculate casino statistics from game state
  const getCasinoStats = () => {
    const stats = gameState.casinoStats || { totalWagered: 0, totalWon: 0, gamesPlayed: 0 };
    const netGainLoss = stats.totalWon - stats.totalWagered;
    const winRate = stats.gamesPlayed > 0 ? ((stats.totalWon / stats.totalWagered) * 100) : 0;
    
    return {
      totalWagered: stats.totalWagered || 0,
      totalWon: stats.totalWon || 0,
      netGainLoss,
      gamesPlayed: stats.gamesPlayed || 0,
      winRate: Math.max(0, winRate)
    };
  };

  const casinoStats = getCasinoStats();

  return (
    <div className="space-y-6 pb-20">
      {/* Casino Overview */}
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 p-4">
        <h2 className="text-lg font-bold mb-4 text-amber-400 border-b border-gray-600 pb-2">Casino Overview</h2>
        {/* Available Games section removed for space */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400">Total Wagered</div>
            <div className="text-xl font-bold">${formatNumber(casinoStats.totalWagered)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Total Won</div>
            <div className="text-xl font-bold text-green-400">${formatNumber(casinoStats.totalWon)}</div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400">Net P&L</div>
              <div className={`text-lg font-bold ${casinoStats.netGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {casinoStats.netGainLoss >= 0 ? '+' : ''}${formatNumber(casinoStats.netGainLoss)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Games Played</div>
              <div className="text-lg font-bold text-white">{casinoStats.gamesPlayed}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Casino Balance Display */}
      <div className="text-center">
        <div className="bg-green-500/20 px-3 py-1 rounded-lg inline-block">
          <span className="text-xs text-gray-400">Balance: </span>
          <span className="text-sm font-bold text-green-400">${Math.floor(gameState.balance)}</span>
        </div>
      </div>

      {/* Games Grid - Horizontal compact layout */}
      <div className="space-y-2">
        {CASINO_GAMES.map((game) => {
          const IconComponent = game.icon;
          const canPlay = canAffordBet(game.minBet);
          
          return (
            <Card 
              key={game.id} 
              className={`relative overflow-hidden p-3 cursor-pointer transition-all duration-300 transform hover:scale-[1.01]
                bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-sm
                border border-purple-500/20 hover:border-purple-400/40 rounded-lg
                shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_16px_rgba(139,92,246,0.3)]
                ${!canPlay ? 'opacity-50' : ''}
              `}
              onClick={() => canPlay && openGameModal(game)}
            >
              <div className="flex items-center justify-between">
                {/* Left side - Icon and Info */}
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-sm bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {game.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-1 max-w-[200px]">{game.description}</p>
                  </div>
                </div>
                
                {/* Right side - Stats and Play button */}
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-gray-400">Min: ${game.minBet >= 1000 ? `${game.minBet/1000}K` : game.minBet}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">Max: ${game.maxBet >= 1000 ? `${game.maxBet/1000}K` : game.maxBet}</span>
                    </div>
                    <Badge className={`text-xs px-2 py-0.5 ${
                      game.riskLevel === 'Low' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      game.riskLevel === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                      game.riskLevel === 'High' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'
                    } text-white shadow-lg`}>
                      {game.riskLevel}
                    </Badge>
                  </div>
                  
                  {canPlay ? (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold px-4 py-2 text-xs shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                    >
                      PLAY
                    </Button>
                  ) : (
                    <div className="text-xs text-red-400 font-medium bg-red-900/20 px-2 py-1 rounded border border-red-500/30 text-center">
                      Need<br/>${Math.floor(game.minBet - gameState.balance)}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Game Modal */}
      <Dialog open={gameModalOpen} onOpenChange={setGameModalOpen}>
        <DialogContent className="max-w-sm w-[95vw] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-purple-500/20 backdrop-blur-sm p-3">
          {selectedGame && (
            <>
              <DialogHeader className="border-b border-white/10 pb-2 mb-2">
                <DialogTitle className="flex items-center space-x-2 text-white">
                  <selectedGame.icon className="w-6 h-6 text-white" />
                  <div>
                    <div className="text-base font-bold text-white">{selectedGame.name}</div>
                    <div className="text-gray-400 text-xs">{selectedGame.description}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-2">
                {/* Bet Amount Selector - Компактнее */}
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-2 border border-purple-500/20">
                  <div className="text-center mb-2">
                    <div className="text-xs text-gray-400 mb-1">BET AMOUNT</div>
                    <div className="text-base font-bold text-green-400 font-mono break-all">
                      ${betAmount >= 1000000 ? `${(betAmount/1000000).toFixed(1)}M` : 
                        betAmount >= 1000 ? `${(betAmount/1000).toFixed(1)}K` : 
                        Math.floor(betAmount)}
                    </div>
                  </div>
                  
                  {/* Quick Bet Buttons */}
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {[selectedGame.minBet, 50, 100, 500, 1000].filter(amount => amount <= selectedGame.maxBet).map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        variant={betAmount === amount ? "default" : "outline"}
                        size="sm"
                        className={`text-xs font-bold h-7 ${betAmount === amount ? 'bg-green-600 text-white border-green-500' : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'}`}
                      >
                        ${amount >= 1000 ? `${amount/1000}K` : amount}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => setBetAmount(Math.max(selectedGame.minBet, betAmount / 2))}
                      size="sm"
                      className="bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/40 font-bold px-2 h-7 text-xs"
                    >
                      ÷ 2
                    </Button>
                    
                    <div className="text-xs text-gray-400 text-center px-1">
                      <div>Min: ${selectedGame.minBet}</div>
                      <div>Max: ${selectedGame.maxBet >= 1000 ? `${selectedGame.maxBet/1000}K` : selectedGame.maxBet}</div>
                    </div>
                    
                    <Button
                      onClick={() => setBetAmount(Math.min(selectedGame.maxBet, betAmount * 2))}
                      size="sm"
                      className="bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/40 font-bold px-2 h-7 text-xs"
                    >
                      × 2
                    </Button>
                  </div>
                </div>

                {/* Game Content */}
                {selectedGame.id === 'diamond_mine' && (
                  <div className="space-y-2">
                    {/* Explosion Message - Компактный и злой */}
                    {showExplosion && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-100">
                        <div className="relative animate-in zoom-in duration-150">
                          {/* Compact explosion rings */}
                          <div className="absolute inset-0 bg-red-600/60 rounded-lg animate-ping scale-110 duration-200"></div>
                          <div className="absolute inset-0 bg-orange-600/40 rounded-lg animate-ping scale-120 duration-300"></div>
                          
                          {/* Compact explosion box */}
                          <div className="relative bg-gradient-to-br from-red-700 via-red-800 to-red-900 border-2 border-red-400 rounded-lg p-4 mx-4 text-center shadow-xl max-w-xs transform animate-pulse duration-200">
                            {/* Minimal effects */}
                            <div className="absolute -top-2 -left-2 text-yellow-400 text-lg animate-spin duration-200">💥</div>
                            <div className="absolute -top-2 -right-2 text-orange-400 text-lg animate-bounce duration-150">🔥</div>
                            <div className="absolute -bottom-2 -left-2 text-red-400 text-lg animate-pulse duration-300">💀</div>
                            <div className="absolute -bottom-2 -right-2 text-yellow-300 text-lg animate-spin duration-180">⚡</div>
                            
                            <div className="text-2xl font-bold text-white mb-2 animate-pulse duration-150 drop-shadow-lg">
                              💥 BOOM! 💥
                            </div>
                            <div className="text-sm text-red-100 font-bold leading-tight drop-shadow-md">
                              {explosionMessage}
                            </div>
                            
                            {/* Compact progress bar */}
                            <div className="mt-3 h-1 bg-red-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full animate-pulse duration-100 transform origin-left scale-x-100 transition-transform duration-2000 ease-out"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-400">
                        Find diamonds, avoid bombs! Current winnings: <span className="text-green-400 font-bold">${Math.floor(mineWinnings)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Diamonds found: {diamondsFound}/20
                      </div>
                    </div>
                    
                    {!mineGameActive ? (
                      <Button
                        onClick={initializeMineGame}
                        disabled={!canAffordBet(betAmount)}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                      >
                        Start Mining - ${Math.floor(betAmount)}
                      </Button>
                    ) : (
                      <>
                        <div className="grid grid-cols-5 gap-1 max-w-xs mx-auto">
                          {mineGrid.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                              <Button
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => revealMineCell(rowIndex, colIndex)}
                                disabled={cell !== 'hidden'}
                                className={`aspect-square h-10 w-10 p-0 text-sm ${
                                  cell === 'hidden' ? 'bg-gray-700 hover:bg-gray-600' :
                                  cell === 'diamond' ? 'bg-green-600' :
                                  'bg-red-600'
                                }`}
                              >
                                {cell === 'diamond' ? <Gem className="w-3 h-3" /> :
                                 cell === 'bomb' ? <Bomb className="w-3 h-3" /> : '?'}
                              </Button>
                            ))
                          )}
                        </div>
                        
                        {mineWinnings > betAmount && (
                          <Button
                            onClick={cashOutMine}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            Cash Out - ${Math.floor(mineWinnings)}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {selectedGame.id === 'rocket_crash' && (
                  <div className="space-y-2">
                    <div className="text-center space-y-1">
                      <div className="text-2xl font-bold text-orange-400">
                        {rocketMultiplier.toFixed(2)}x
                      </div>
                      <div className="text-xs text-gray-400">
                        Potential winnings: <span className="text-green-400 font-bold">${Math.floor(betAmount * rocketMultiplier).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="relative h-48 rounded-lg overflow-hidden border border-gray-700">
                      {/* Ground/Terrain */}
                      <div 
                        className="absolute bottom-0 w-full h-8 opacity-80"
                        style={{
                          background: `
                            linear-gradient(90deg, 
                              #2d5016 0%, #1a2e0a 20%, #4a6b2a 40%, 
                              #2d5016 60%, #1a2e0a 80%, #4a6b2a 100%)
                          `,
                          backgroundSize: '400% 100%',
                          animation: rocketGameActive ? 'rocketMovingBackground 1.5s linear infinite' : 'none'
                        }}
                      />
                      
                      {/* Sky with moving clouds */}
                      <div 
                        className="absolute inset-0 opacity-40"
                        style={{
                          background: `
                            radial-gradient(ellipse at 10% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
                            radial-gradient(ellipse at 70% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
                            radial-gradient(ellipse at 90% 60%, rgba(255, 255, 255, 0.06) 0%, transparent 40%),
                            linear-gradient(180deg, #1e3a8a 0%, #1e293b 50%, #374151 100%)
                          `,
                          backgroundSize: '300% 100%, 250% 100%, 200% 100%, 100% 100%',
                          animation: rocketGameActive ? 'rocketMovingBackground 3s linear infinite' : 'none'
                        }}
                      />
                      
                      {/* Rocket Trail Effect */}
                      {rocketGameActive && !rocketCrashed && (
                        <div 
                          className="absolute opacity-30"
                          style={{
                            bottom: `${Math.min(rocketMultiplier * 10, 85)}%`,
                            left: '20%',
                            width: '30%',
                            height: '2px',
                            background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.8) 0%, rgba(156, 163, 175, 0.4) 50%, transparent 100%)',
                            animation: 'rocketSmoke 2s ease-out infinite'
                          }}
                        />
                      )}
                      
                      {/* Rocket with integrated exhaust */}
                      <div 
                        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-all text-3xl ${
                          rocketCrashed ? 'text-red-500 text-4xl' : 'text-orange-400'
                        } ${rocketGameActive && !rocketCrashed ? 'animate-pulse' : ''}`}
                        style={{ 
                          transform: `translateX(-50%) translateY(-${Math.min(rocketMultiplier * 10, 85)}%)`,
                          transition: 'transform 0.05s ease-out'
                        }}
                      >
                        <div className="relative">
                          {rocketCrashed ? '💥' : '🚀'}
                          
                          {/* Exhaust coming directly from rocket bottom */}
                          {!rocketCrashed && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                              {/* Single angled fire */}
                              <div 
                                className="absolute z-0"
                                style={{ 
                                  left: '-28px',
                                  top: '-12px',
                                  transform: 'rotate(210deg)',
                                  transformOrigin: 'center'
                                }}
                              >
                                <span 
                                  className="text-orange-400 text-xl"
                                  style={{ animation: 'rocketFlame 0.15s ease-in-out infinite' }}
                                >
                                  🔥
                                </span>
                              </div>
                              
                              {/* Smoke trail going downward */}
                              <div 
                                className="text-gray-400 opacity-50 text-xs absolute"
                                style={{ 
                                  animation: 'rocketSmoke 1s ease-out infinite',
                                  marginTop: '4px',
                                  left: '-8px',
                                  top: '4px',
                                  transform: 'rotate(210deg)',
                                  transformOrigin: 'center'
                                }}
                              >
                                💨
                              </div>
                              
                              <div 
                                className="text-gray-500 opacity-30 text-xs absolute"
                                style={{ 
                                  animation: 'rocketSmoke 1s ease-out infinite', 
                                  animationDelay: '0.3s',
                                  marginTop: '8px',
                                  left: '-6px',
                                  top: '8px',
                                  transform: 'rotate(210deg)',
                                  transformOrigin: 'center'
                                }}
                              >
                                💨
                              </div>
                              
                              <div 
                                className="text-gray-600 opacity-15 text-xs absolute"
                                style={{ 
                                  animation: 'rocketSmoke 1s ease-out infinite', 
                                  animationDelay: '0.6s',
                                  marginTop: '12px',
                                  left: '-4px',
                                  top: '12px',
                                  transform: 'rotate(210deg)',
                                  transformOrigin: 'center'
                                }}
                              >
                                💨
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      

                    </div>
                    
                    {!rocketGameActive && !rocketCrashed ? (
                      <Button
                        onClick={startRocketGame}
                        disabled={!canAffordBet(betAmount)}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                      >
                        Launch Rocket - ${betAmount.toLocaleString()}
                      </Button>
                    ) : rocketGameActive && !cashedOut ? (
                      <Button
                        onClick={cashOutRocket}
                        className="w-full bg-green-600 hover:bg-green-700 animate-pulse"
                      >
                        CASH OUT - ${Math.floor(betAmount * rocketMultiplier)}
                      </Button>
                    ) : (
                      <div className="text-center">
                        {rocketCrashed && !cashedOut ? (
                          <div className="text-red-400">💥 Rocket Crashed! You lost ${Math.floor(betAmount)}</div>
                        ) : (
                          <div className="text-green-400">✅ Cashed out ${Math.floor(betAmount * rocketMultiplier)}!</div>
                        )}
                        <Button
                          onClick={() => {
                            setRocketMultiplier(1.0);
                            setRocketGameActive(false);
                            setRocketCrashed(false);
                            setCashedOut(false);
                          }}
                          className="mt-2 bg-gray-700"
                        >
                          Play Again
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {selectedGame.id === 'slot_machine' && (
                  <div className="space-y-2">
                    {/* Jackpot Display - Еще компактнее */}
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-black font-bold py-1 px-2 rounded mb-1 text-xs">
                        💰 PROGRESSIVE JACKPOT: ${Math.floor(jackpot)} 💰
                      </div>
                    </div>
                    
                    {/* Slot Machine - Компактный дизайн */}
                    <div className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-lg p-2 border-2 border-yellow-600">
                      {/* Machine Header */}
                      <div className="text-center mb-1">
                        <div className="bg-red-600 text-white font-bold py-0.5 px-2 rounded-full inline-block text-xs">
                          🎰 TROPICO SLOTS 🎰
                        </div>
                      </div>
                      
                      {/* Reels Container */}
                      <div className="bg-black rounded-lg p-1.5 mb-2 border-2 border-gray-600">
                        <div className="flex justify-center space-x-1">
                          {(slotSpinning ? spinningReels : slotReels).map((symbol, index) => (
                            <div key={index} className="relative">
                              {/* Reel Frame - Компактнее */}
                              <div className="w-12 h-16 bg-gradient-to-b from-gray-700 to-gray-900 rounded border border-gray-600 overflow-hidden">
                                {/* Reel Window */}
                                <div className="w-full h-full bg-white rounded-sm border border-gray-400 flex items-center justify-center relative overflow-hidden">
                                  {slotSpinning ? (
                                    /* Fast Spinning Symbols */
                                    <div className="absolute inset-0 flex flex-col justify-center items-center">
                                      <div className="text-2xl transition-all duration-75 transform scale-110">{symbol}</div>
                                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-yellow-200 to-transparent opacity-30 animate-pulse"></div>
                                      {/* Blur effect for speed */}
                                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                  ) : (
                                    /* Static Symbol */
                                    <div className="text-2xl font-bold transform transition-all duration-300 scale-100 hover:scale-110">{symbol}</div>
                                  )}
                                  
                                  {/* Spinning Effect Overlay */}
                                  {slotSpinning && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-ping"></div>
                                  )}
                                </div>
                                
                                {/* Reel Number - Компактнее */}
                                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 font-bold">
                                  REEL {index + 1}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Payline Indicator - Компактнее */}
                      <div className="flex justify-center mb-2">
                        <div className="bg-red-600 h-0.5 w-40 rounded-full relative">
                          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 text-red-400 text-xs font-bold">
                            PAYLINE
                          </div>
                        </div>
                      </div>
                      
                      {/* Paytable - Компактнее */}
                      <div className="bg-gray-800 rounded-lg p-2 text-xs text-center">
                        <div className="text-yellow-400 font-bold mb-1 text-xs">PAYTABLE</div>
                        <div className="grid grid-cols-3 gap-0.5 text-gray-300 text-xs">
                          <div>🍒 = 5x</div>
                          <div>🍋 = 8x</div>
                          <div>🍊 = 10x</div>
                          <div>🍇 = 15x</div>
                          <div>⭐ = 25x</div>
                          <div>💎 = 50x</div>
                          <div className="col-span-3 text-yellow-400 font-bold text-xs">7️⃣7️⃣7️⃣ = JACKPOT!</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Control Panel - Премиальный дизайн */}
                    <div className="bg-gradient-to-br from-red-800 via-red-900 to-red-950 rounded-xl p-3 border border-red-500/30 shadow-2xl shadow-red-900/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-gray-300">
                          <div>BALANCE: <span className="text-green-400 font-bold">${Math.floor(gameState.balance)}</span></div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {/* Quick Bet Buttons - Премиальный стиль */}
                          <div className="flex flex-col space-y-1">
                            <Button
                              onClick={() => setBetAmount(Math.max(10, betAmount - 50))}
                              className="w-7 h-7 bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white text-xs p-0 rounded-lg border border-gray-500/30 shadow-lg"
                              size="sm"
                            >
                              -
                            </Button>
                            <Button
                              onClick={() => setBetAmount(betAmount + 50)}
                              disabled={betAmount + 50 > gameState.balance}
                              className="w-7 h-7 bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white text-xs p-0 rounded-lg border border-gray-500/30 shadow-lg disabled:opacity-50"
                              size="sm"
                            >
                              +
                            </Button>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-xs text-gray-300 mb-2">
                              BET: <span className="text-white font-bold">${Math.floor(betAmount)}</span>
                            </div>
                            {/* Spin Button - Максимально широкий премиальный стиль */}
                            <Button
                              onClick={spinSlots}
                              disabled={slotSpinning || !canAffordBet(betAmount)}
                              className={`bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-bold text-base px-8 py-3 rounded-xl border-2 border-yellow-300/50 shadow-2xl shadow-yellow-500/30 ${
                                slotSpinning ? 'animate-pulse' : 'hover:scale-105 hover:shadow-yellow-500/50'
                              } transition-all duration-300`}
                            >
                              {slotSpinning ? '🎰 SPIN...' : '🎰 SPIN'}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* LED Status Lights - Премиальный стиль */}
                      <div className="flex justify-center space-x-2">
                        <div className={`w-3 h-3 rounded-full border border-white/20 ${slotSpinning ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-gray-700'}`}></div>
                        <div className={`w-3 h-3 rounded-full border border-white/20 ${canAffordBet(betAmount) ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-700'}`}></div>
                        <div className={`w-3 h-3 rounded-full border border-white/20 ${jackpot > 100000 ? 'bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50' : 'bg-gray-700'}`}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      

    </div>
  );
}