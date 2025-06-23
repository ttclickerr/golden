import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useGameState } from "@/hooks/useGameState";
import { useAdRewards } from "@/hooks/useAdRewards";
import { StatsHeader } from "@/components/StatsHeader";
import { ClickButton } from "@/components/ClickButton";
import { InvestmentCard } from "@/components/InvestmentCard";
import { NavigationBar } from "@/components/NavigationBar";
import { UnifiedBoosterStore } from "@/components/UnifiedBoosterStore";
import { AdMobBanner } from "@/components/AdMobBanner";
import { AdBanner } from "@/components/AdBanner";
import { adjustService } from "@/lib/adjust";
import { adMobService } from "@/lib/admob";
import { appsFlyerService } from "@/lib/appsflyer";
import { appMetricaService } from "@/lib/appmetrica";
import { SimpleTradingSection } from "@/components/sections/SimpleTradingSection";
import { InvestmentsSection } from "@/components/sections/InvestmentsSection";
import { BusinessSection } from "@/components/sections/BusinessSection";
import { CasinoSection } from "@/components/sections/CasinoSection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/gameData";
import { useTranslation, getLanguageFlag, getLanguageName, type Language } from "@/lib/i18n";
import { useTransactionHistory } from "@/components/TransactionHistory";
import { useNotifications } from "@/components/NotificationSystem";
import { SettingsModal } from "@/components/SettingsModalNew";
import { ConsentManager } from "@/components/ConsentManager";

import { Volume2, Vibrate, RotateCcw, Globe, Play, Cloud, Shield, Settings } from "lucide-react";
import { FirebaseAuth } from "@/components/FirebaseAuth";
import { vibrationService } from "@/lib/vibration";
import { useLocation } from "wouter";

export default function TycoonClicker() {
  const { 
    gameState, 
    setGameState,
    handleClick, 
    buyInvestment, 
    sellInvestment, 
    quickBuyAsset, 
    quickSellAsset, 
    activateBooster, 
    buyBusiness, 
    upgradeBusiness, 
    sellBusiness,
    portfolioValue, 
    ASSETS, 
    ACHIEVEMENTS 
  } = useGameState();
  const { t, language } = useTranslation();
  const { transactions, addTransaction } = useTransactionHistory();
  const { addNotification } = useNotifications();
  const adRewards = useAdRewards();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem('premium-status') === 'true';
  });

  // Функция для изменения навигации с автоматическим закрытием настроек
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Функция для разворачивания хедера и перехода на главную
  const handleExpandHome = () => {
    setActiveSection('home');
    if (settingsOpen) {
      setSettingsOpen(false);
    }
  };

  
  // Настройки звука и вибрации
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('tycoon-sound') !== 'false';
  });
  const [vibrateEnabled, setVibrateEnabled] = useState(() => {
    return vibrationService.isVibrationEnabled();
  });

  // Consent management
  const handleConsentUpdate = (consents: any) => {
    adjustService.setEnabled(consents.analytics);
    adMobService.setConsentStatus(consents.advertising);
    console.log('Privacy settings updated:', consents);
  };

  // Portfolio calculation functions
  const getPortfolioValue = () => portfolioValue;
  
  const getBusinessValue = () => {
    return Object.entries(gameState.businesses).reduce((total, [businessId, business]) => {
      if (business?.owned) {
        return total + 50000; // Средняя стоимость бизнеса
      }
      return total;
    }, 0);
  };
  
  const getTotalNetWorth = () => {
    return gameState.balance + portfolioValue + getBusinessValue();
  };

  // Clean Portfolio Section render function
  const renderPortfolioSection = () => {
    return (
      <PortfolioSection
        gameState={gameState}
        getCompletedAchievements={getCompletedAchievements}
        ACHIEVEMENTS={ACHIEVEMENTS}
        getPortfolioValue={getPortfolioValue}
        getBusinessValue={getBusinessValue}
        getTotalNetWorth={getTotalNetWorth}
      />
    );
  };

  // Остальной код компонента остается таким же...
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-x-hidden">
      {/* Главное содержимое игры */}
      <div className="container mx-auto px-2 pb-20">
        {activeSection === 'portfolio' && renderPortfolioSection()}
        {/* Остальные секции... */}
      </div>
    </div>
  );
}