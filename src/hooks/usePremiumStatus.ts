import { useState, useEffect } from 'react';

interface PremiumStatus {
  isPremium: boolean;
  premiumType: 'lifetime' | 'weekly' | null;
  expiryDate: Date | null;
  testModeActive: boolean;
}

export function usePremiumStatus(): PremiumStatus {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>(() => {
    // Инициализируем из localStorage
    const savedType = localStorage.getItem('premium-type') as 'lifetime' | 'weekly' | null;
    const testModeActive = localStorage.getItem('premium-test-mode') === 'enabled';
    const isPremium = (savedType === 'lifetime' || savedType === 'weekly') && !testModeActive;
    
    let expiryDate: Date | null = null;
    if (savedType === 'weekly') {
      const expiryStr = localStorage.getItem('premium-expiry');
      if (expiryStr && expiryStr !== 'lifetime') {
        expiryDate = new Date(parseInt(expiryStr));
      }
    }
    
    return {
      isPremium,
      premiumType: savedType,
      expiryDate,
      testModeActive
    };
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedType = localStorage.getItem('premium-type') as 'lifetime' | 'weekly' | null;
      const testModeActive = localStorage.getItem('premium-test-mode') === 'enabled';
      const isPremium = (savedType === 'lifetime' || savedType === 'weekly') && !testModeActive;
      
      let expiryDate: Date | null = null;
      if (savedType === 'weekly') {
        const expiryStr = localStorage.getItem('premium-expiry');
        if (expiryStr && expiryStr !== 'lifetime') {
          expiryDate = new Date(parseInt(expiryStr));
          // Проверяем не истек ли срок
          if (expiryDate.getTime() < Date.now()) {
            // Премиум истек, удаляем статус
            localStorage.removeItem('premium-type');
            localStorage.removeItem('premium-expiry');
            localStorage.removeItem('premium-status');
            setPremiumStatus({
              isPremium: false,
              premiumType: null,
              expiryDate: null,
              testModeActive
            });
            return;
          }
        }
      }
      
      setPremiumStatus({
        isPremium,
        premiumType: savedType,
        expiryDate,
        testModeActive
      });
    };

    const handlePremiumStatusChange = () => {
      handleStorageChange();
    };

    // Слушаем изменения в localStorage
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('premiumStatusChanged', handlePremiumStatusChange);
    
    // Проверяем срок действия каждую минуту
    const interval = setInterval(() => {
      if (premiumStatus.premiumType === 'weekly' && premiumStatus.expiryDate) {
        if (premiumStatus.expiryDate.getTime() < Date.now()) {
          handleStorageChange();
        }
      }
    }, 60000); // каждую минуту

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('premiumStatusChanged', handlePremiumStatusChange);
      clearInterval(interval);
    };
  }, [premiumStatus.premiumType, premiumStatus.expiryDate]);

  return premiumStatus;
}
