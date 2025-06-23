import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameState } from '@/lib/stores/useGameState';
import { formatNumber } from '@/lib/utils';
import { Car, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Интерфейс для транспорта
interface Vehicle {
  id: string;
  name: string;
  description: string;
  price: number;
  speed: number;
  capacity: number;
  image: string;
  category: 'economy' | 'luxury' | 'sport' | 'utility';
  owned: boolean;
  purchasedAt?: number;
}

// Временные данные для примера
const vehicles: Vehicle[] = [
  {
    id: 'sedan',
    name: 'Седан',
    description: 'Экономичный городской автомобиль для повседневного использования',
    price: 15000,
    speed: 180,
    capacity: 5,
    image: 'sedan',
    category: 'economy',
    owned: false
  },
  {
    id: 'suv',
    name: 'Внедорожник',
    description: 'Вместительный автомобиль для семейных поездок и путешествий',
    price: 35000,
    speed: 170,
    capacity: 7,
    image: 'suv',
    category: 'utility',
    owned: false
  },
  {
    id: 'sports_car',
    name: 'Спорткар',
    description: 'Быстрый и стильный автомобиль для ценителей скорости',
    price: 80000,
    speed: 280,
    capacity: 2,
    image: 'sports_car',
    category: 'sport',
    owned: false
  },
  {
    id: 'luxury_sedan',
    name: 'Люксовый седан',
    description: 'Комфортный автомобиль премиум-класса с богатым оснащением',
    price: 120000,
    speed: 220,
    capacity: 5,
    image: 'luxury_sedan',
    category: 'luxury',
    owned: false
  }
];

export default function VehiclesList() {
  const { t } = useTranslation();
  const { currentCurrency } = useGameState();
  
  // Разделяем транспорт на приобретенный и доступный
  const ownedVehicles = vehicles.filter(vehicle => vehicle.owned);
  const availableVehicles = vehicles.filter(vehicle => !vehicle.owned);
  
  // Функция для покупки транспорта (заглушка)
  const buyVehicle = (id: string) => {
    // В реальной реализации здесь будет вызов функции из useGameState
    console.log(`Buying vehicle: ${id}`);
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{t('vehicles.title', 'Транспорт')}</CardTitle>
        <CardDescription>{t('vehicles.description', 'Покупайте различные транспортные средства для повышения статуса')}</CardDescription>
      </CardHeader>
      <CardContent>
        {ownedVehicles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('vehicles.owned', 'Ваш транспорт')}</h3>
            <div className="space-y-4">
              {ownedVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id}
                  className="p-4 border-2 border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <Car className="mr-2 h-4 w-4 text-blue-600" />
                        <h3 className="font-semibold">{vehicle.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{vehicle.description}</p>
                      
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="flex items-center text-xs">
                          <span>Скорость: {vehicle.speed} км/ч</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <span>Вместимость: {vehicle.capacity} чел.</span>
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
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('vehicles.available', 'Доступный транспорт')}</h3>
          {availableVehicles.length > 0 ? (
            <div className="space-y-4">
              {availableVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id}
                  className="p-4 border border-muted rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <Car className="mr-2 h-4 w-4 text-blue-600" />
                        <h3 className="font-semibold">{vehicle.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{vehicle.description}</p>
                      
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="flex items-center text-xs">
                          <span>Скорость: {vehicle.speed} км/ч</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <span>Вместимость: {vehicle.capacity} чел.</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Button
                        variant={currentCurrency >= vehicle.price ? "default" : "outline"}
                        onClick={() => buyVehicle(vehicle.id)}
                        disabled={currentCurrency < vehicle.price}
                        className="whitespace-nowrap"
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatNumber(vehicle.price)}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-6">
              Вы приобрели весь доступный транспорт!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}