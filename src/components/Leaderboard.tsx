import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/gameData";

interface LeaderboardEntry {
  rank: number;
  username: string;
  country: string;
  countryFlag: string;
  netWorth: number;
  level: number;
  achievements: number;
  passiveIncome: number;
}

interface LeaderboardProps {
  gameState: any;
}

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' }
];

// Моковые данные для демонстрации
const generateLeaderboardData = (selectedCountry?: string): LeaderboardEntry[] => {
  const countries = selectedCountry ? [COUNTRIES.find(c => c.code === selectedCountry)!] : COUNTRIES;
  const data: LeaderboardEntry[] = [];
  
  countries.forEach(country => {
    for (let i = 0; i < (selectedCountry ? 50 : 10); i++) {
      data.push({
        rank: data.length + 1,
        username: `Player${Math.floor(Math.random() * 10000)}`,
        country: country.code,
        countryFlag: country.flag,
        netWorth: Math.floor(Math.random() * 10000000000) + 1000000,
        level: Math.floor(Math.random() * 100) + 1,
        achievements: Math.floor(Math.random() * 200) + 10,
        passiveIncome: Math.floor(Math.random() * 100000) + 1000
      });
    }
  });
  
  return data.sort((a, b) => b.netWorth - a.netWorth).map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
};

export function Leaderboard({ gameState }: LeaderboardProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('networth');
  
  const currentPlayerCountry = 'RU'; // Можно получить из настроек игрока
  const leaderboardData = generateLeaderboardData(selectedCountry === 'all' ? undefined : selectedCountry);
  
  // Добавляем текущего игрока в список
  const currentPlayer: LeaderboardEntry = {
    rank: Math.floor(Math.random() * 1000) + 1,
    username: 'You',
    country: currentPlayerCountry,
    countryFlag: COUNTRIES.find(c => c.code === currentPlayerCountry)?.flag || '🏳️',
    netWorth: gameState.balance,
    level: gameState.level,
    achievements: 15, // Можно посчитать из системы достижений
    passiveIncome: gameState.passiveIncome
  };
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };
  
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <Card className="bg-slate-800/80 border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">🏆 Global Leaderboards</h2>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600/50">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">🌍 Global</SelectItem>
              {COUNTRIES.map(country => (
                <SelectItem key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Позиция текущего игрока */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg border border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-3">Your Current Position</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">GLOBAL RANK</div>
              <div className="text-xl font-bold text-white">#{currentPlayer.rank.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">COUNTRY RANK</div>
              <div className="text-xl font-bold text-white">#{Math.floor(currentPlayer.rank / 10)}</div>
              <div className="text-xs text-gray-300">{currentPlayer.countryFlag} {COUNTRIES.find(c => c.code === currentPlayerCountry)?.name}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">NET WORTH</div>
              <div className="text-xl font-bold text-green-400">${formatNumber(currentPlayer.netWorth)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">LEVEL</div>
              <div className="text-xl font-bold text-cyan-400">LVL {currentPlayer.level}</div>
            </div>
          </div>
        </div>

        {/* Tabs для разных категорий */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-700/50">
            <TabsTrigger value="networth" className="text-xs">Net Worth</TabsTrigger>
            <TabsTrigger value="level" className="text-xs">Level</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs">Achievements</TabsTrigger>
            <TabsTrigger value="passive" className="text-xs">Passive Income</TabsTrigger>
          </TabsList>

          <TabsContent value="networth" className="space-y-2 mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {leaderboardData.slice(0, 100).map((entry, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-lg font-bold ${getRankColor(entry.rank)} min-w-[3rem]`}>
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="text-2xl">{entry.countryFlag}</div>
                    <div>
                      <div className="font-semibold text-white">{entry.username}</div>
                      <div className="text-xs text-gray-400">{COUNTRIES.find(c => c.code === entry.country)?.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">${formatNumber(entry.netWorth)}</div>
                    <div className="text-xs text-gray-400">LVL {entry.level}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="level" className="space-y-2 mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[...leaderboardData].sort((a, b) => b.level - a.level).slice(0, 100).map((entry, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-lg font-bold ${getRankColor(index + 1)} min-w-[3rem]`}>
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="text-2xl">{entry.countryFlag}</div>
                    <div>
                      <div className="font-semibold text-white">{entry.username}</div>
                      <div className="text-xs text-gray-400">{COUNTRIES.find(c => c.code === entry.country)?.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-cyan-400">LVL {entry.level}</div>
                    <div className="text-xs text-gray-400">${formatNumber(entry.netWorth)}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-2 mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[...leaderboardData].sort((a, b) => b.achievements - a.achievements).slice(0, 100).map((entry, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-lg font-bold ${getRankColor(index + 1)} min-w-[3rem]`}>
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="text-2xl">{entry.countryFlag}</div>
                    <div>
                      <div className="font-semibold text-white">{entry.username}</div>
                      <div className="text-xs text-gray-400">{COUNTRIES.find(c => c.code === entry.country)?.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-400">🏆 {entry.achievements}</div>
                    <div className="text-xs text-gray-400">LVL {entry.level}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="passive" className="space-y-2 mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[...leaderboardData].sort((a, b) => b.passiveIncome - a.passiveIncome).slice(0, 100).map((entry, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-lg font-bold ${getRankColor(index + 1)} min-w-[3rem]`}>
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="text-2xl">{entry.countryFlag}</div>
                    <div>
                      <div className="font-semibold text-white">{entry.username}</div>
                      <div className="text-xs text-gray-400">{COUNTRIES.find(c => c.code === entry.country)?.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-400">${formatNumber(entry.passiveIncome)}/sec</div>
                    <div className="text-xs text-gray-400">${formatNumber(entry.passiveIncome * 86400)}/day</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}