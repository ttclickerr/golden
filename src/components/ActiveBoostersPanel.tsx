import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Clock, Star, Target, Coins } from "lucide-react";

interface ActiveBooster {
  endTime: number;
  multiplier: number;
}

interface ActiveBoostersPanelProps {
  activeBoosters: Record<string, ActiveBooster>;
}

const BOOSTER_ICONS: Record<string, any> = {
  'mega_multiplier': Star,
  'mega_income': Star,
  'golden_touch': Target,
  'golden_click': Target,
  'time_warp': Clock,
  'time_speed': Clock,
  'auto_click': Zap,
  'auto_clicker': Zap,
  'income_boost': Coins,
  'double_income': Coins,
  'click_boost': Zap,
  'mega_click': Star
};

const BOOSTER_NAMES: Record<string, string> = {
  'mega_multiplier': '5x Mega Multiplier',
  'mega_income': '5x Mega Multiplier',
  'golden_touch': '10x Golden Touch',
  'golden_click': '10x Golden Touch',
  'time_warp': '2x Time Warp',
  'time_speed': '2x Time Warp',
  'auto_click': 'Auto Clicker',
  'auto_clicker': 'Auto Clicker',
  'income_boost': '3x Income Boost',
  'double_income': '3x Income Boost',
  'click_boost': '5x Click Boost',
  'mega_click': '5x Click Boost'
};

export function ActiveBoostersPanel({ activeBoosters }: ActiveBoostersPanelProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const activeBoosterEntries = Object.entries(activeBoosters).filter(([_, booster]) => 
    booster.endTime > currentTime
  );

  if (activeBoosterEntries.length === 0) {
    return null;
  }

  return (
    <Card className="p-3 mb-4 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border-purple-500/30">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-semibold text-white">Active Boosters</span>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {activeBoosterEntries.map(([boosterId, booster]) => {
          const Icon = BOOSTER_ICONS[boosterId] || Zap;
          const name = BOOSTER_NAMES[boosterId] || boosterId;
          const timeLeft = Math.max(0, booster.endTime - currentTime);
          const totalDuration = booster.endTime - (booster.endTime - 120000); // Assume 2 min default
          const progress = Math.max(0, (timeLeft / totalDuration) * 100);
          const secondsLeft = Math.floor(timeLeft / 1000);
          
          return (
            <div key={boosterId} className="flex items-center gap-3 p-2 bg-black/20 rounded-lg">
              <Icon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white truncate">{name}</span>
                  <Badge variant="secondary" className="text-xs bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                    {secondsLeft}s
                  </Badge>
                </div>
                
                <Progress 
                  value={progress} 
                  className="h-1.5 bg-gray-700"
                  style={{
                    '--progress-background': 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                  } as any}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}