import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Medal, Award, TrendingUp, Globe, Flag, Crown, Star } from 'lucide-react';
import { formatNumber } from '@/lib/gameData';
import { apiRequest } from '@/lib/queryClient';

interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  balance: number;
  country: string;
  totalWorth: number;
  isPremium?: boolean;
}

interface LeaderboardSectionProps {
  currentLevel: number;
  currentBalance: number;
  passiveIncome: number;
}

export function LeaderboardSection({ currentLevel, currentBalance, passiveIncome }: LeaderboardSectionProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'country' | 'friends'>('global');
  const [userCountry] = useState('RU');
  const queryClient = useQueryClient();

  // Запрос данных лидерборда
  const { data: leaderboardData = [], isLoading } = useQuery({
    queryKey: ['/api/leaderboard', activeTab === 'country' ? userCountry : undefined],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('limit', '50');
      if (activeTab === 'country') {
        params.append('country', userCountry);
      }
      return apiRequest('GET', `/api/leaderboard?${params.toString()}`).then(res => res.json());
    },
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  // Обновление данных текущего игрока в лидерборде
  const updatePlayerMutation = useMutation({
    mutationFn: async (playerData: any) => {
      return apiRequest('POST', '/api/leaderboard', {
        userId: 1, // Заглушка для ID пользователя
        username: 'Player',
        level: currentLevel,
        balance: currentBalance,
        totalWorth: currentBalance + (passiveIncome * 3600),
        passiveIncome: passiveIncome,
        country: userCountry
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
    }
  });

  // Автоматическое обновление данных игрока при изменении состояния
  useEffect(() => {
    if (currentBalance > 0) {
      updatePlayerMutation.mutate({
        level: currentLevel,
        balance: currentBalance,
        passiveIncome: passiveIncome
      });
    }
  }, [currentLevel, Math.floor(currentBalance / 1000), Math.floor(passiveIncome)]);

  // Обработка данных для отображения
  const processedData = leaderboardData.map((entry: any, index: number) => ({
    rank: index + 1,
    username: entry.username,
    level: entry.level,
    balance: entry.balance,
    country: entry.country,
    totalWorth: entry.totalWorth || entry.balance,
    isPremium: entry.username.includes('Investor') || entry.username.includes('Mogul') || entry.username.includes('Titan') // Detect premium users by custom nicknames
  }));

  const filteredData = processedData.filter(entry => {
    if (activeTab === 'friends') {
      // Показываем только несколько записей для симуляции друзей
      return entry.rank <= 10;
    }
    return true;
  }).slice(0, 20);

  const userRank = processedData.findIndex(entry => entry.username === 'Player') + 1 || Math.floor(Math.random() * 30) + 15;

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Global Leaderboard</h3>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">{rank}</span>;
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'US': '🇺🇸', 'RU': '🇷🇺', 'DE': '🇩🇪', 'JP': '🇯🇵', 'CN': '🇨🇳',
      'UK': '🇬🇧', 'FR': '🇫🇷', 'BR': '🇧🇷', 'CA': '🇨🇦', 'AU': '🇦🇺'
    };
    return flags[country] || '🌍';
  };

  return (
    <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Global Leaderboard</h3>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-slate-800/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'global'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          Global
        </button>
        <button
          onClick={() => setActiveTab('country')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'country'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Flag className="w-4 h-4" />
          {getCountryFlag(userCountry)} {userCountry}
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'friends'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Friends
        </button>
      </div>

      {/* Your Rank */}
      <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-lg p-1.5 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {getRankIcon(userRank)}
            <span className="text-white font-bold text-xs">Your Rank: #{userRank}</span>
            <div className="text-purple-300 text-xs">Level {currentLevel}</div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-xs">${formatNumber(currentBalance)}</div>
            <div className="text-gray-400 text-xs">+${formatNumber(passiveIncome)}/sec</div>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-0.5 max-h-72 overflow-y-auto custom-scrollbar">
        {filteredData.map((entry, index) => (
          <div
            key={`${entry.username}-${entry.rank}`}
            className={`flex items-center justify-between p-1.5 rounded transition-colors ${
              entry.username === 'YOU'
                ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/50'
                : entry.isPremium
                  ? 'bg-gradient-to-r from-yellow-900/20 to-amber-800/20 border border-yellow-500/20'
                  : 'bg-slate-800/20 hover:bg-slate-700/20'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center w-5 text-xs">
                {entry.rank <= 3 ? getRankIcon(entry.rank) : <span className="text-gray-400 font-bold">{entry.rank}</span>}
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{getCountryFlag(entry.country)}</span>
                <div>
                  <div className={`font-semibold text-xs flex items-center gap-0.5 ${
                    entry.username === 'YOU' 
                      ? 'text-purple-300' 
                      : entry.isPremium 
                        ? 'text-yellow-300' 
                        : 'text-white'
                  }`}>
                    {entry.username}
                    {entry.isPremium && (
                      <Crown className="w-2.5 h-2.5 text-yellow-500" />
                    )}
                  </div>
                  <div className="text-gray-400 text-xs">Level {entry.level}</div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-white font-bold text-xs">${formatNumber(entry.totalWorth)}</div>
              <div className="text-gray-400 text-xs">
                Worth: ${formatNumber(entry.balance)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Competition Info */}
      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
        <div className="text-center text-gray-400 text-sm">
          <div>Weekly Competition ends in: <span className="text-purple-400 font-semibold">3d 14h 22m</span></div>
          <div className="mt-1">Top 10 players receive exclusive rewards!</div>
        </div>
      </div>
    </div>
  );
}