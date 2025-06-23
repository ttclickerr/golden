import { useTranslation } from 'react-i18next';
import { useGameState } from '@/lib/stores/useGameState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MousePointerClick, DollarSign, Clock, Building2, Zap, Award, TrendingUp } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const StatisticsPanel = () => {
  const { t } = useTranslation();
  const { 
    manualClicks, 
    totalCurrency, 
    currentCurrency, 
    passiveIncome, 
    clickValue,
    buildings,
    upgrades,
    level,
    xp,
    xpRequired,
    activeGameTime,
    achievements
  } = useGameState();
  
  // Calculate total buildings owned
  const totalBuildings = buildings.reduce((sum, building) => sum + building.count, 0);
  
  // Format play time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const playTime = formatTime(activeGameTime);
  
  // Calculate XP progress percentage
  const xpProgress = (xp / xpRequired) * 100;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{t('stats.title')}</CardTitle>
        <CardDescription>{t('stats.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">
              {t('stats.level')}: {level}
            </div>
            <div className="text-xs text-muted-foreground">
              {xp} / {xpRequired} XP
            </div>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatItem 
            icon={<MousePointerClick className="h-4 w-4 mr-2" />}
            label={t('stats.clicks')}
            value={formatNumber(manualClicks)}
          />
          
          <StatItem 
            icon={<DollarSign className="h-4 w-4 mr-2" />}
            label={t('stats.totalCurrency')}
            value={formatNumber(totalCurrency)}
          />
          
          <StatItem 
            icon={<DollarSign className="h-4 w-4 mr-2" />}
            label={t('stats.currentCurrency')}
            value={formatNumber(currentCurrency)}
          />
          
          <StatItem 
            icon={<TrendingUp className="h-4 w-4 mr-2" />}
            label={t('stats.passiveIncome')}
            value={`${formatNumber(passiveIncome)}/s`}
          />
          
          <StatItem 
            icon={<Zap className="h-4 w-4 mr-2" />}
            label={t('stats.clickValue')}
            value={formatNumber(clickValue)}
          />
          
          <StatItem 
            icon={<Building2 className="h-4 w-4 mr-2" />}
            label={t('stats.buildings')}
            value={totalBuildings.toString()}
          />
          
          <StatItem 
            icon={<Zap className="h-4 w-4 mr-2" />}
            label={t('stats.upgrades')}
            value={upgrades.length.toString()}
          />
          
          <StatItem 
            icon={<Clock className="h-4 w-4 mr-2" />}
            label={t('stats.playTime')}
            value={playTime}
          />
        </div>
        
        {/* Достижения */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">{t('stats.achievements')}</h3>
          {achievements.length > 0 ? (
            <div className="space-y-2">
              {achievements.filter(a => a.unlockedAt).map((achievement) => (
                <div key={achievement.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-green-500" />
                    <div>
                      <div className="font-medium text-sm">{achievement.name}</div>
                      <div className="text-xs text-muted-foreground">{achievement.description}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">+{achievement.reward}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              {t('stats.noAchievements')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatItem = ({ icon, label, value }: StatItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
      <div className="flex items-center text-sm font-medium">
        {icon}
        {label}
      </div>
      <div className="font-bold">{value}</div>
    </div>
  );
};

export default StatisticsPanel;
