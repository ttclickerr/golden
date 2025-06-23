import { useTranslation } from 'react-i18next';
import { useGameState } from '@/lib/stores/useGameState';
import { getAllUpgrades } from '@/data/upgrades';
import UpgradeItem from './UpgradeItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upgrade } from '@/types/game';

const UpgradesList = () => {
  const { t } = useTranslation();
  const { upgrades: purchasedUpgrades } = useGameState();
  
  // Get all available upgrades
  const allUpgrades = getAllUpgrades();
  
  // Filter purchased upgrades to show at the top
  const purchased = allUpgrades.filter(upgrade => 
    purchasedUpgrades.some(p => p.id === upgrade.id)
  );
  
  // Filter available but not purchased upgrades
  const available = allUpgrades.filter(upgrade => 
    !purchasedUpgrades.some(p => p.id === upgrade.id)
  );

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{t('upgrades.title')}</CardTitle>
        <CardDescription>{t('upgrades.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {purchased.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {t('upgrades.purchased')}
            </h3>
            <div className="space-y-2">
              {purchased.map((upgrade: Upgrade) => (
                <UpgradeItem 
                  key={upgrade.id} 
                  upgrade={upgrade} 
                  purchased={true} 
                />
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            {t('upgrades.available')}
          </h3>
          
          {available.length > 0 ? (
            <div className="space-y-2">
              {available.map((upgrade: Upgrade) => (
                <UpgradeItem 
                  key={upgrade.id} 
                  upgrade={upgrade} 
                  purchased={false} 
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-center text-muted-foreground py-4">
              {t('upgrades.noneAvailable')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradesList;
