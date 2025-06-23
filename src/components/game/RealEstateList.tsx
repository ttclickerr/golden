import { useTranslation } from 'react-i18next';
import { useGameState } from '@/lib/stores/useGameState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { Building2, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RealEstateList = () => {
  const { t } = useTranslation();
  const { realEstate, currentCurrency, buyRealEstate } = useGameState();

  // Находим доступные объекты недвижимости
  const availableRealEstate = realEstate.filter(re => !re.owned);
  const ownedRealEstate = realEstate.filter(re => re.owned);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{t('realEstate.title')}</CardTitle>
        <CardDescription>{t('realEstate.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {ownedRealEstate.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('realEstate.owned')}</h3>
            <div className="space-y-4">
              {ownedRealEstate.map((property) => (
                <div 
                  key={property.id}
                  className="p-4 border-2 border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4 text-blue-600" />
                        <h3 className="font-semibold">{property.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{property.description}</p>
                      
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          <span>{t('realEstate.income')}: ${formatNumber(property.income)}/h</span>
                        </div>
                        <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{t('realEstate.appreciation')}: {(property.appreciation * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('realEstate.available')}</h3>
          {availableRealEstate.length > 0 ? (
            <div className="space-y-4">
              {availableRealEstate.map((property) => (
                <div 
                  key={property.id}
                  className="p-4 border border-muted rounded-lg relative"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4 text-blue-600" />
                        <h3 className="font-semibold">{property.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{property.description}</p>
                      
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          <span>{t('realEstate.income')}: ${formatNumber(property.income)}/h</span>
                        </div>
                        <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{t('realEstate.appreciation')}: {(property.appreciation * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Button
                        variant={currentCurrency >= property.price ? "default" : "outline"}
                        onClick={() => buyRealEstate(property.id)}
                        disabled={currentCurrency < property.price}
                        className="whitespace-nowrap"
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatNumber(property.price)}
                      </Button>
                      
                      <div className="text-xs text-muted-foreground mt-1 text-center">
                        {t('realEstate.maintenance')}: ${formatNumber(property.maintenanceCost)}/mo
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-6">
              {t('realEstate.noneAvailable')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealEstateList;