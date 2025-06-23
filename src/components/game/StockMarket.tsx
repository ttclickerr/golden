import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameState } from '@/lib/stores/useGameState';
import { formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Интерфейс для акций
interface Stock {
  id: string;
  name: string;
  symbol: string;
  description: string;
  currentPrice: number;
  previousPrice: number;
  shares: number; // Количество акций у игрока
  volatility: number; // Волатильность от 0 до 1
  trend: number; // Тренд от -1 до 1
}

// Временные данные для примера
const initialStocks: Stock[] = [
  {
    id: 'tech_company',
    name: 'TechCorp',
    symbol: 'TCH',
    description: 'Технологическая компания, разрабатывающая инновационные решения',
    currentPrice: 100,
    previousPrice: 95,
    shares: 0,
    volatility: 0.3,
    trend: 0.2
  },
  {
    id: 'food_company',
    name: 'FoodInc',
    symbol: 'FOOD',
    description: 'Компания по производству продуктов питания',
    currentPrice: 45,
    previousPrice: 47,
    shares: 0,
    volatility: 0.1,
    trend: -0.1
  },
  {
    id: 'energy_company',
    name: 'EnergyCorp',
    symbol: 'ENRG',
    description: 'Энергетическая компания, занимающаяся добычей и переработкой ресурсов',
    currentPrice: 75,
    previousPrice: 73,
    shares: 0,
    volatility: 0.2,
    trend: 0.05
  },
  {
    id: 'financial_company',
    name: 'FinBank',
    symbol: 'FIN',
    description: 'Финансовая компания, предоставляющая банковские услуги',
    currentPrice: 200,
    previousPrice: 210,
    shares: 0,
    volatility: 0.25,
    trend: -0.05
  }
];

export default function StockMarket() {
  const { t } = useTranslation();
  const { currentCurrency } = useGameState();
  
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);
  const [refreshCountdown, setRefreshCountdown] = useState(60); // Обновление цен каждую минуту
  
  // Обновление цен акций и обратный отсчет
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          // Обновляем цены акций
          setStocks(prevStocks => updateStockPrices(prevStocks));
          return 60; // Сбрасываем таймер
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Функция обновления цен акций
  const updateStockPrices = (stocks: Stock[]): Stock[] => {
    return stocks.map(stock => {
      // Сохраняем текущую цену как предыдущую
      const previousPrice = stock.currentPrice;
      
      // Рассчитываем новую цену с учетом волатильности и тренда
      // Случайное изменение в пределах волатильности
      const randomChange = (Math.random() * 2 - 1) * stock.volatility;
      // Влияние тренда
      const trendChange = stock.trend * 0.1;
      // Общее изменение в процентах
      const percentChange = randomChange + trendChange;
      // Новая цена
      let newPrice = stock.currentPrice * (1 + percentChange);
      
      // Предотвращаем слишком низкие цены
      newPrice = Math.max(newPrice, 1);
      
      return {
        ...stock,
        previousPrice,
        currentPrice: newPrice
      };
    });
  };
  
  // Функция для покупки акций (заглушка)
  const buyStock = (stockId: string, amount: number) => {
    // В реальной реализации здесь будет вызов функции из useGameState
    console.log(`Buying ${amount} shares of stock: ${stockId}`);
  };
  
  // Функция для продажи акций (заглушка)
  const sellStock = (stockId: string, amount: number) => {
    // В реальной реализации здесь будет вызов функции из useGameState
    console.log(`Selling ${amount} shares of stock: ${stockId}`);
  };
  
  // Форматирование процента изменения
  const formatChangePercent = (current: number, previous: number) => {
    const percentChange = ((current - previous) / previous) * 100;
    return `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%`;
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('stocks.title', 'Фондовый рынок')}</CardTitle>
          <CardDescription>{t('stocks.description', 'Инвестируйте в акции компаний для получения дохода')}</CardDescription>
        </div>
        <div className="text-sm text-muted-foreground">
          Обновление через: {refreshCountdown}s
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stocks.map((stock) => {
            const isUp = stock.currentPrice > stock.previousPrice;
            const isOwned = stock.shares > 0;
            
            return (
              <div 
                key={stock.id}
                className={`p-4 border ${isOwned ? 'border-2 border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20' : 'border-muted'} rounded-lg`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <BarChart className="mr-2 h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold">{stock.name} <span className="text-sm font-normal text-muted-foreground">({stock.symbol})</span></h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{stock.description}</p>
                    
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="text-sm">
                        Цена: ${formatNumber(stock.currentPrice)}
                      </div>
                      <div className={`flex items-center text-sm ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                        {isUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {formatChangePercent(stock.currentPrice, stock.previousPrice)}
                      </div>
                      {isOwned && (
                        <div className="text-sm text-blue-600">
                          В портфеле: {stock.shares} шт.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sellStock(stock.id, 1)}
                      disabled={stock.shares <= 0}
                      className="whitespace-nowrap"
                    >
                      Продать
                    </Button>
                    <Button
                      variant={currentCurrency >= stock.currentPrice ? "default" : "outline"}
                      size="sm"
                      onClick={() => buyStock(stock.id, 1)}
                      disabled={currentCurrency < stock.currentPrice}
                      className="whitespace-nowrap"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}