import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Trophy, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users,
  Star,
  Settings,
  LogOut,
  Play
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';

interface DashboardStats {
  totalValue: number;
  dailyIncome: number;
  level: number;
  experience: number;
  achievements: number;
  playTime: string;
  rank: number;
  isPremium: boolean;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalValue: 0,
    dailyIncome: 0,
    level: 1,
    experience: 0,
    achievements: 0,
    playTime: '0h 0m',
    rank: 999,
    isPremium: false
  });

  useEffect(() => {
    // Load user stats from localStorage
    const savedGame = localStorage.getItem('tycoon-clicker-save');
    if (savedGame) {
      const gameData = JSON.parse(savedGame);
      setStats({
        totalValue: gameData.balance || 0,
        dailyIncome: calculateDailyIncome(gameData.investments || {}),
        level: gameData.level || 1,
        experience: gameData.experience || 0,
        achievements: Object.keys(gameData.achievements || {}).length,
        playTime: formatPlayTime(gameData.startTime),
        rank: Math.floor(Math.random() * 100) + 1, // Mock rank for now
        isPremium: gameData.isPremium || false
      });
    }
  }, []);

  const calculateDailyIncome = (investments: any) => {
    // Calculate daily income from investments
    let dailyIncome = 0;
    Object.entries(investments).forEach(([asset, quantity]: [string, any]) => {
      // Add daily income calculation logic based on asset types
      if (asset === 'ko') dailyIncome += (quantity as number) * 0.3 * 86400; // Coca-Cola
      // Add more assets as needed
    });
    return dailyIncome;
  };

  const formatPlayTime = (startTime: string) => {
    if (!startTime) return '0h 0m';
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const experienceProgress = (stats.experience % 1000) / 10; // Assuming 1000 XP per level

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-2 sm:p-4">
      <div className="max-w-3xl mx-auto">
        {/* Ultra Compact Header */}
        <div className="flex items-center justify-between mb-4 bg-slate-800/30 backdrop-blur-sm rounded-xl p-3 border border-slate-700/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Dashboard</h1>
              <p className="text-gray-400 text-xs truncate max-w-[150px]">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {stats.isPremium && (
              <Badge className="bg-yellow-400/20 border-yellow-400/30 text-yellow-300 text-xs px-2 py-1">
                <Crown className="w-3 h-3 mr-1" />
                VIP
              </Badge>
            )}
            <Link href="/game">
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 px-3 py-1 text-xs">
                <Play className="w-3 h-3 mr-1" />
                Play
              </Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={signOut} className="text-gray-400 hover:text-white px-2 py-1">
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Ultra Compact Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Card className="bg-slate-800/40 border-slate-700/40 p-2 backdrop-blur-sm">
            <div className="text-center">
              <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Value</p>
              <p className="text-sm font-bold text-green-400">{formatNumber(stats.totalValue)}</p>
            </div>
          </Card>

          <Card className="bg-slate-800/40 border-slate-700/40 p-2 backdrop-blur-sm">
            <div className="text-center">
              <TrendingUp className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Daily</p>
              <p className="text-sm font-bold text-blue-400">{formatNumber(stats.dailyIncome)}</p>
            </div>
          </Card>

          <Card className="bg-slate-800/40 border-slate-700/40 p-2 backdrop-blur-sm">
            <div className="text-center">
              <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Level</p>
              <p className="text-sm font-bold text-yellow-400">{stats.level}</p>
            </div>
          </Card>

          <Card className="bg-slate-800/40 border-slate-700/40 p-2 backdrop-blur-sm">
            <div className="text-center">
              <Trophy className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Rank</p>
              <p className="text-sm font-bold text-orange-400">#{stats.rank}</p>
            </div>
          </Card>
        </div>

        {/* Ultra Compact Main Content */}
        <div className="grid grid-cols-1 gap-3">
          {/* Combined Progress & Features */}
          <Card className="bg-slate-800/40 border-slate-700/50 p-3 backdrop-blur-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Level Progress */}
              <div>
                <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Level {stats.level}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{stats.experience % 1000}/1000 XP</span>
                    <span className="text-gray-500">{1000 - (stats.experience % 1000)} to go</span>
                  </div>
                  <Progress value={experienceProgress} className="h-1.5" />
                </div>
              </div>

              {/* Premium Status */}
              <div>
                <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  Premium
                </h3>
                {stats.isPremium ? (
                  <Badge className="bg-green-400/20 text-green-400 text-xs">Active</Badge>
                ) : (
                  <Button size="sm" className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 h-6 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Achievements & Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="bg-slate-800/40 border-slate-700/50 p-3 backdrop-blur-sm">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
                <Trophy className="w-4 h-4 text-orange-400" />
                Latest Achievement
              </h3>
              <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <div className="flex-1">
                  <p className="font-medium text-xs">First Steps</p>
                  <p className="text-xs text-gray-400">Complete investment</p>
                </div>
                <Badge className="bg-green-400/20 text-green-400 text-xs">$50</Badge>
              </div>
            </Card>

            <Card className="bg-slate-800/40 border-slate-700/50 p-3 backdrop-blur-sm">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-400" />
                Quick Stats
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Play Time</span>
                  <span>{stats.playTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Achievements</span>
                  <span>{stats.achievements}/50</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}