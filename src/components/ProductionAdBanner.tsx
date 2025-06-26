import { useEffect, useState } from 'react';

interface ProductionAdBannerProps {
  className?: string;
}

export function ProductionAdBanner({ className = '' }: ProductionAdBannerProps) {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Определяем production среду
    const isProd = window.location.hostname !== 'localhost' && 
                   !window.location.hostname.includes('replit');
    setIsProduction(isProd);
    
    if (isProd) {
      // Загружаем AdSense скрипт только в production
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + 
                   import.meta.env.VITE_ADMOB_APP_ID;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  if (!isProduction) {
    // В development не показываем баннер, чтобы не мешал навигации
    return null;
  }

  return (
    <div className={`fixed z-40 ${className}`} 
      style={{
        bottom: 'env(safe-area-inset-bottom, 0)',
        left: 'env(safe-area-inset-left, 0)',
        right: 'env(safe-area-inset-right, 0)'
      }}>
      <div className="w-full h-[50px] bg-white border-t border-gray-200">
      </div>
    </div>
  );
}