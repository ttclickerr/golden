import { useTranslation } from 'react-i18next';
import { useGameState } from '@/lib/stores/useGameState';
import { getAllBuildings } from '@/data/buildings';
import BuildingItem from './BuildingItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from '@/types/game';

const BuildingsList = () => {
  const { t } = useTranslation();
  const { buildings: ownedBuildings } = useGameState();
  
  // Get all buildings
  const allBuildings = getAllBuildings();
  
  // Map buildings to include count from owned buildings
  const buildingsWithCount = allBuildings.map(building => {
    const owned = ownedBuildings.find(b => b.id === building.id);
    return {
      ...building,
      count: owned ? owned.count : 0,
    };
  });

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{t('buildings.title')}</CardTitle>
        <CardDescription>{t('buildings.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {buildingsWithCount.map((building: Building) => (
            <BuildingItem 
              key={building.id} 
              building={building} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingsList;
