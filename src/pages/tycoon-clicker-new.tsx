import { useState, useEffect, createPortal } from 'react';
import { AdBanner } from '@/components/AdBanner';
import { AdRewardSystem } from '@/components/AdRewardSystem';
import { BoosterRewardToggle } from '@/components/BoosterRewardToggle';
import { ClickButton } from '@/components/ClickButton';
import { StatsHeader } from '@/components/StatsHeader';
import { NavigationBar } from '@/components/NavigationBar';
import { QuickSettingsModal } from '@/components/QuickSettingsModal';
import { ConsentManager } from '@/components/ConsentManager';
import { useGameState } from '@/hooks/useGameState';
import { useNotifications } from '@/components/NotificationSystem';
import { NotificationSystem } from '@/components/NotificationSystem';
import { useTransactionHistory } from '@/components/TransactionHistory';
import { SimpleTradingSection } from '@/components/sections/SimpleTradingSection';
import { BusinessSection } from '@/components/sections/BusinessSection';
import { CasinoSection } from '@/components/sections/CasinoSection';

export default function TycoonClicker() {
  const { gameState, click, buyInvestment, sellInvestment, addMoney, buyBusiness, sellBusiness, buyBusinessUpgrade } = useGameState();
  const { notifications, addNotification, removeNotification } = useNotifications();
  const { transactions, addTransaction } = useTransactionHistory();
  
  const [activeSection, setActiveSection] = useState('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adRewardOpen, setAdRewardOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);

  // AdMob интеграция
  useEffect(() => {
    const initAdMob = () => {
      // Проверяем наличие AdMob ID
      if (!import.meta.env.VITE_ADMOB_APP_ID) {
        console.warn('AdMob App ID not found in environment variables');
        return;
      }

      // Инициализация AdMob (имитация для веб-версии)
      console.log('AdMob initialized with App ID:', import.meta.env.VITE_ADMOB_APP_ID);
      console.log('Banner ID:', import.meta.env.VITE_ADMOB_BANNER_ID);
      console.log('Interstitial ID:', import.meta.env.VITE_ADMOB_INTERSTITIAL_ID);
      console.log('Rewarded ID:', import.meta.env.VITE_ADMOB_REWARDED_ID);
    };

    initAdMob();
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleWatchAd = async (rewardType: string) => {
    // Имитация просмотра рекламы
    addNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Просмотр рекламы',
      message: 'Загрузка рекламного ролика...'
    });

    // Имитация задержки
    setTimeout(() => {
      addNotification({
        id: Date.now().toString(),
        type: 'reward',
        title: 'Награда получена!',
        message: `Вы получили бонус: ${rewardType}`
      });

      // Выдаем награду в зависимости от типа
      switch (rewardType) {
        case 'money_boost':
          addMoney(1000);
          addTransaction('ad_reward', 1000, 'Награда за просмотр рекламы: деньги');
          break;
        case 'click_boost':
          addNotification({
            id: Date.now().toString(),
            type: 'success',
            title: 'Бустер активирован!',
            message: 'Увеличение клика x2 на 60 секунд'
          });
          break;
        case 'passive_boost':
          addNotification({
            id: Date.now().toString(),
            type: 'success',
            title: 'Бустер активирован!',
            message: 'Увеличение пассивного дохода x2 на 60 секунд'
          });
          break;
      }
    }, 2000);
  };

  const calculateRealPassiveIncome = (): number => {
    let total = 0;
    
    // Доход от инвестиций
    Object.entries(gameState.investments).forEach(([assetId, quantity]) => {
      if (typeof quantity === 'number' && quantity > 0) {
        const baseIncome = getAssetPassiveIncome(assetId);
        total += baseIncome * quantity;
      }
    });

    // Доход от бизнесов
    Object.entries(gameState.businesses).forEach(([businessId, businessData]) => {
      if (businessData && typeof businessData.quantity === 'number' && businessData.quantity > 0) {
        const baseIncome = getBusinessPassiveIncome(businessId);
        total += baseIncome * businessData.quantity;
      }
    });

    // Применяем бонусы уровня
    const levelBonus = gameState.level * 0.05; // 5% за уровень
    total *= (1 + levelBonus);

    return total;
  };

  const getAssetPassiveIncome = (assetId: string): number => {
    const incomeMap: { [key: string]: number } = {
      'ko': 0.3,    // Coca-Cola: $0.30/сек
      'aapl': 0.5,  // Apple: $0.50/сек  
      'googl': 0.8, // Google: $0.80/сек
      'btc': 2.0,   // Bitcoin: $2.00/сек
      'eth': 1.5,   // Ethereum: $1.50/сек
      'gold': 1.0,  // Gold: $1.00/сек
    };
    return incomeMap[assetId] || 0;
  };

  const getBusinessPassiveIncome = (businessId: string): number => {
    const incomeMap: { [key: string]: number } = {
      'corner_store': 0.17,     // $15000/day = ~$0.17/сек
      'coffee_shop': 0.35,      // $30000/day = ~$0.35/сек
      'restaurant': 0.58,       // $50000/day = ~$0.58/сек
    };
    return incomeMap[businessId] || 0;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'trading':
        return (
          <SimpleTradingSection 
            gameState={gameState}
            onBuyInvestment={buyInvestment}
            onSellInvestment={sellInvestment}
            onNotification={addNotification}
            onTransaction={addTransaction}
          />
        );
      case 'business':
        return (
          <BusinessSection 
            gameState={gameState}
            onBuyBusiness={buyBusiness}
            onSellBusiness={sellBusiness}
            onBuyUpgrade={buyBusinessUpgrade}
            onNotification={addNotification}
            onTransaction={addTransaction}
          />
        );
      case 'casino':
        return (
          <CasinoSection 
            gameState={gameState}
            onAddMoney={addMoney}
            onNotification={addNotification}
            onTransaction={addTransaction}
          />
        );
      case 'boosters':
        return (
          <BoosterRewardToggle 
            gameState={gameState}
            onBoosterActivate={(boosterId) => console.log('Booster activated:', boosterId)}
            onWatchAd={handleWatchAd}
          />
        );
      default:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ClickButton 
                onClick={click}
                clickValue={gameState.clickValue}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="min-h-screen pb-40">
        <StatsHeader 
          gameState={gameState} 
          realPassiveIncome={Math.round(calculateRealPassiveIncome() * 10) / 10} 
          onSettingsClick={() => setSettingsOpen(true)}
          isCollapsed={activeSection !== 'home'}
          transactions={transactions}
        />
        
        <main className="px-4 py-6">
          {renderContent()}
        </main>
        
        {/* AdMob Banner */}
        <AdBanner />

        <NavigationBar 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        {/* Система уведомлений */}
        <NotificationSystem 
          notifications={notifications}
          onRemove={removeNotification}
        />

        {/* Модальные окна */}
        <QuickSettingsModal 
          isOpen={settingsOpen} 
          onClose={() => setSettingsOpen(false)} 
        />
        
        {/* <AdRewardSystem 
          isOpen={adRewardOpen}
          onClose={() => setAdRewardOpen(false)}
          onWatchAd={handleWatchAd}
          gameState={gameState}
        /> */}

        <ConsentManager 
          isOpen={consentOpen}
          onClose={() => setConsentOpen(false)}
          onConsentUpdate={(consents) => {
            console.log('Согласия обновлены:', consents);
            setConsentOpen(false);
          }}
        />
      </div>
    </>
  );
}