import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  isPremium?: boolean;
  className?: string;
}

export function AppLayout({ children, isPremium = false, className = "" }: AppLayoutProps) {
  console.log('[DEBUG] AppLayout rendered', { isPremium, timestamp: new Date().toISOString() });

  // Вычисляем общий отступ снизу
  const NAVIGATION_HEIGHT = 70; // px
  const AD_BANNER_HEIGHT = 60; // px
  const bottomPadding = isPremium 
    ? NAVIGATION_HEIGHT  // Только навигация
    : NAVIGATION_HEIGHT + AD_BANNER_HEIGHT; // Навигация + реклама

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-cyan-900/20 ${className}`}>
      {/* Основной контент с отступом снизу */}
      <main 
        className="pb-4 px-4"
        style={{ 
          paddingBottom: `${bottomPadding + 16}px`, // +16px для дополнительного отступа
          minHeight: '100vh'
        }}
      >
        {children}
      </main>
    </div>
  );
}
