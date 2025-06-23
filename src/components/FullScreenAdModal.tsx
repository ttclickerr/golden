import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { trackAnalyticsEvent } from '../lib/trackAnalyticsEvent';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface FullScreenAdModalProps {
  isOpen: boolean;
  onComplete: () => void;
  rewardType: string;
}

export function FullScreenAdModal({ isOpen, onComplete, rewardType }: FullScreenAdModalProps) {
  const [countdown, setCountdown] = useState(30); // Было 3, теперь 30 секунд
  const [phase, setPhase] = useState<'loading' | 'ad' | 'completing'>('loading');
  const [isPremium, setIsPremium] = useState(() => {
    const savedPremiumType = localStorage.getItem('premium-type');
    const testModeActive = localStorage.getItem('premium-test-mode') === 'enabled';
    return (savedPremiumType === 'lifetime' || savedPremiumType === 'weekly') && !testModeActive;
  });

  useEffect(() => {
    const handlePremiumChange = () => {
      const savedPremiumType = localStorage.getItem('premium-type');
      const testModeActive = localStorage.getItem('premium-test-mode') === 'enabled';
      setIsPremium((savedPremiumType === 'lifetime' || savedPremiumType === 'weekly') && !testModeActive);
    };
    window.addEventListener('premiumStatusChanged', handlePremiumChange);
    return () => {
      window.removeEventListener('premiumStatusChanged', handlePremiumChange);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(30); // Было 3, теперь 30 секунд
      setPhase('loading');
      return;
    }
    // Логируем показ полноэкранной рекламы
    const userId = localStorage.getItem('user_id') || 'anonymous';
    trackAnalyticsEvent({ event: 'fullscreen_ad_shown', adType: 'fullscreen', provider: 'admob', userId, rewardType });

    // Фаза загрузки (1 секунда)
    const loadingTimer = setTimeout(() => {
      setPhase('ad');
    }, 1000);

    return () => clearTimeout(loadingTimer);
  }, [isOpen]);

  useEffect(() => {
    if (phase !== 'ad') return;

    // Инициализируем AdSense для полноэкранной рекламы
    if (window.adsbygoogle) {
      try {
        (window.adsbygoogle as any[]).push({});
      } catch (e) {
        console.warn('AdSense не загружен:', e);
      }
    }

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Начинаем завершение
      setPhase('completing');
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(completeTimer);
    }
  }, [countdown, phase, onComplete]);

  if (isPremium) return null;

  const getRewardInfo = (type: string) => {
    switch (type) {
      case 'mega_multiplier':
        return { title: 'Mega Multiplier', desc: 'x5 Income for 2 minutes', icon: '🚀' };
      case 'golden_touch':
        return { title: 'Golden Touch', desc: 'x10 Click Value for 2 minutes', icon: '✨' };
      case 'time_warp':
        return { title: 'Time Warp', desc: 'x2 Passive Speed for 2 minutes', icon: '⚡' };
      case 'reset_mega':
        return { title: 'Reset Mega Multiplier', desc: 'Remove cooldown instantly', icon: '🔄' };
      case 'reset_golden':
        return { title: 'Reset Golden Touch', desc: 'Remove cooldown instantly', icon: '🔄' };
      case 'reset_time':
        return { title: 'Reset Time Warp', desc: 'Remove cooldown instantly', icon: '🔄' };
      case 'reset_all':
        return { title: 'Reset All Cooldowns', desc: 'Remove all cooldowns instantly', icon: '🔄' };
      default:
        return { title: 'Reward', desc: 'Get your reward', icon: '🎁' };
    }
  };

  const reward = getRewardInfo(rewardType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" 
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}>
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-8 max-w-2xl mx-auto border border-purple-400/30">
        <div className="flex flex-col items-center justify-center h-[250px] text-white">
          <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse mb-4"></div>
          <div className="text-xl font-medium mb-2">Advertisement Space</div>
          <div className="px-4 py-2 bg-white/10 rounded-lg text-sm">AdSense Ready</div>
        </div>
      </div>
    </div>
  );
}