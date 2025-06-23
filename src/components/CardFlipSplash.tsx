import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Типы для глобальных переменных рекламы
declare global {
  interface Window {
    admob: any;
  }
}

interface CardFlipSplashProps {
  onComplete: () => void;
  playerLevel?: number;
}

// Функция проверки готовности рекламы - приоритет загрузке
const checkAdReadiness = (): Promise<void> => {
  return new Promise((resolve) => {
    console.log('🔄 Начинаем проверку готовности рекламы...');
    
    // Проверяем готовность AdMob (приоритет)
    const checkAdMob = () => {
      if (window.admob) {
        console.log('✅ AdMob готов к показу');
        return true;
      }
      return false;
    };

    // Проверяем готовность Google AdSense
    const checkAdSense = () => {
      if (window.adsbygoogle && (window.adsbygoogle as any).loaded) {
        console.log('✅ AdSense готов к показу');
        return true;
      }
      return false;
    };

    // Проверяем готовность любых рекламных скриптов в документе
    const checkAdScripts = () => {
      const adScripts = document.querySelectorAll('script[src*="googlesyndication"], script[src*="adnxs"], script[src*="adsystem"]');
      return adScripts.length > 0;
    };

    // Увеличенное время ожидания для лучшей загрузки рекламы
    const maxWaitTime = 3000;
    const startTime = Date.now();
    let checkCount = 0;
    
    const checkAds = () => {
      checkCount++;
      const elapsed = Date.now() - startTime;
      
      if (checkCount % 10 === 0) {
        console.log(`🔍 Проверка рекламы #${checkCount}, прошло ${elapsed}мс`);
      }
      
      // Приоритет: AdMob > AdSense > скрипты > таймаут
      if (checkAdMob()) {
        console.log('🎯 AdMob загружен первым, запускаем игру');
        resolve();
        return;
      }
      
      if (checkAdSense()) {
        console.log('🎯 AdSense загружен, запускаем игру');
        resolve();
        return;
      }
      
      if (checkAdScripts() && elapsed > 1000) {
        console.log('📝 Рекламные скрипты найдены, продолжаем');
        resolve();
        return;
      }
      
      if (elapsed >= maxWaitTime) {
        console.log('⏰ Время ожидания рекламы истекло, запускаем без неё');
        resolve();
        return;
      }
      
      // Проверяем чаще в начале, реже потом
      const interval = elapsed < 1000 ? 50 : 150;
      setTimeout(checkAds, interval);
    };
    
    checkAds();
  });
};

// Короткие смешные цитаты с переводами
const splashQuotes = {
  en: ["Money grows on screens!", "Tap to get rich!", "Warning: Addictive!", "Your finger = ATM", "Capitalism loading..."],
  zh: ["金钱在屏幕上生长！", "点击致富！", "警告：上瘾！", "手指=取款机", "资本主义加载中..."],
  ja: ["お金が画面に生える！", "タップで一攫千金！", "警告：中毒性！", "指=ATM", "資本主義読み込み中..."],
  es: ["¡Dinero crece en pantallas!", "¡Toca para ser rico!", "¡Advertencia: Adictivo!", "Tu dedo = Cajero", "Cargando capitalismo..."],
  de: ["Geld wächst auf Bildschirmen!", "Tippe für Reichtum!", "Warnung: Süchtig!", "Dein Finger = Geldautomat", "Kapitalismus lädt..."],
  fr: ["L'argent pousse sur écrans!", "Tapez pour être riche!", "Attention: Addictif!", "Votre doigt = Distributeur", "Capitalisme en cours..."],
  pt: ["Dinheiro cresce nas telas!", "Toque para ficar rico!", "Aviso: Viciante!", "Seu dedo = Caixa eletrônico", "Carregando capitalismo..."],
  it: ["I soldi crescono sui schermi!", "Tocca per arricchirti!", "Attenzione: Crea dipendenza!", "Il tuo dito = Bancomat", "Caricamento capitalismo..."]
};

const loadingSteps = {
  en: ["Initializing capitalism...", "Loading market data...", "Connecting to Wall Street...", "Calculating profits...", "Ready to make money!"],
  zh: ["初始化资本主义...", "加载市场数据...", "连接华尔街...", "计算利润...", "准备赚钱！"],
  ja: ["資本主義初期化中...", "市場データ読み込み中...", "ウォール街接続中...", "利益計算中...", "お金を稼ぐ準備完了！"],
  es: ["Inicializando capitalismo...", "Cargando datos del mercado...", "Conectando a Wall Street...", "Calculando ganancias...", "¡Listo para ganar dinero!"],
  de: ["Kapitalismus wird initialisiert...", "Marktdaten werden geladen...", "Verbindung zur Wall Street...", "Gewinne werden berechnet...", "Bereit, Geld zu verdienen!"],
  fr: ["Initialisation du capitalisme...", "Chargement des données de marché...", "Connexion à Wall Street...", "Calcul des profits...", "Prêt à gagner de l'argent!"],
  pt: ["Inicializando capitalismo...", "Carregando dados do mercado...", "Conectando à Wall Street...", "Calculando lucros...", "Pronto para ganhar dinheiro!"],
  it: ["Inizializzazione capitalismo...", "Caricamento dati di mercato...", "Connessione a Wall Street...", "Calcolo profitti...", "Pronto a fare soldi!"]
};

export default function CardFlipSplash({ onComplete, playerLevel = 1 }: CardFlipSplashProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentQuote, setCurrentQuote] = useState("");
  
  // Определяем режим отображения на основе уровня игрока
  const isNewPlayer = (playerLevel || 1) === 1;
  const showFullAnimation = !isNewPlayer;

  // Получаем текущий язык из localStorage или используем английский по умолчанию
  const getCurrentLanguage = () => {
    const saved = localStorage.getItem('gameLanguage');
    return saved && splashQuotes[saved as keyof typeof splashQuotes] ? saved : 'en';
  };
  
  const language = getCurrentLanguage();
  const quotes = splashQuotes[language as keyof typeof splashQuotes];
  const steps = loadingSteps[language as keyof typeof loadingSteps];

  useEffect(() => {
    // Для новых игроков (уровень 1) - быстрый переход без фанфаров
    if (isNewPlayer) {
      console.log('👶 Новый игрок: быстрый переход без анимаций');
      
      // Быстрое завершение для новых игроков
      setTimeout(() => {
        setProgress(100);
        setCurrentStep(steps[steps.length - 1]);
        setIsFlipping(true);
        setTimeout(() => onComplete(), 500);
      }, 800);
      
      return;
    }
    
    // Полная анимация для опытных игроков (уровень 2+)
    console.log('🎉 Опытный игрок: полные фанфары и эффекты');
    
    // Инициализируем рекламу сразу при показе заставки
    const initializeAds = () => {
      console.log('🚀 Запуск инициализации рекламных сервисов...');
      
      // Проверяем доступность AdMob
      if (window.admob) {
        console.log('✅ AdMob уже доступен и готов');
        try {
          // Предзагружаем межстраничную рекламу
          if (window.admob.interstitial) {
            console.log('🎯 Предзагрузка межстраничной рекламы...');
          }
        } catch (error) {
          console.log('⚠️ Ошибка предзагрузки AdMob:', error);
        }
      } else {
        console.log('⏳ Ожидание инициализации AdMob...');
      }
      
      // Проверяем AdSense и запускаем предзагрузку
      if (window.adsbygoogle) {
        console.log('✅ Google AdSense готов к работе');
        try {
          (window.adsbygoogle as any).loaded = true;
        } catch (error) {
          console.log('⚠️ Ошибка настройки AdSense:', error);
        }
      } else {
        console.log('📥 Загрузка Google AdSense...');
      }
      
      // Запускаем проверку готовности рекламы в фоне
      setTimeout(() => {
        checkAdReadiness().then(() => {
          console.log('🎉 Рекламные сервисы полностью готовы к показу');
        });
      }, 500);

      // Инициализируем рекламу на заставке через 1 секунду
      setTimeout(() => {
        try {
          if (window.adsbygoogle) {
            (window.adsbygoogle as any).push({});
            console.log('📺 Реклама на заставке инициализирована');
          }
        } catch (error) {
          console.log('⚠️ Ошибка инициализации рекламы на заставке:', error);
        }
      }, 1500);
    };
    
    // Запускаем инициализацию рекламы
    initializeAds();
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 8 + 3;
        const stepIndex = Math.floor((newProgress / 100) * steps.length);
        const quoteIndex = Math.floor((newProgress / 100) * quotes.length);
        
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
        }
        // Случайная цитата при каждом обновлении прогресса
        const randomQuoteIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomQuoteIndex]);

        if (newProgress >= 100) {
          clearInterval(interval);
          // Проверяем готовность рекламы перед завершением
          checkAdReadiness().then(() => {
            setIsFlipping(true);
            // Простое завершение без лишних эффектов
            setTimeout(() => onComplete(), 1500);
          });
          return 100;
        }
        return newProgress;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [onComplete, steps, quotes, isNewPlayer]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isFlipping ? 0 : 1,
          filter: isFlipping ? "blur(20px)" : "blur(0px)"
        }}
        exit={{ 
          opacity: 0,
          filter: "blur(10px)"
        }}
        transition={{ 
          duration: isFlipping ? 1.2 : 0.8,
          ease: [0.23, 1, 0.32, 1]
        }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-yellow-900/20"
      >
        {/* Animated Background Grid - только для опытных игроков */}
        {showFullAnimation && (
          <div className="absolute inset-0 opacity-20">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(76, 195, 165, 0.15) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(251, 191, 36, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                animation: 'gridMove 20s linear infinite'
              }}
            />
          </div>
        )}

        {/* Tech Particles - только для опытных игроков */}
        {showFullAnimation && (
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${i % 2 === 0 ? 'bg-yellow-400' : 'bg-[#4cc3a5]'}`}
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0
                }}
                animate={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        )}

        {/* Main Content Container */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div 
            className="text-center max-w-2xl px-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Logo Section */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: isNewPlayer ? 0.3 : 0.8, delay: isNewPlayer ? 0 : 0.2 }}
              className="mb-8"
            >
              {/* Tech Logo */}
              <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl rotate-12 shadow-lg shadow-yellow-400/25"></div>
                <div className="absolute inset-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
                    TC
                  </div>
                </div>
                {/* Rotating ring - только для опытных игроков */}
                {showFullAnimation && (
                  <motion.div
                    className="absolute -inset-2 border-2 border-yellow-400/40 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                )}
                {/* Pulsing glow effect - только для опытных игроков */}
                {showFullAnimation && (
                  <motion.div
                    className="absolute -inset-3 bg-yellow-400/20 rounded-full blur-md"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>

              {/* Title */}
              <motion.h1 
                className="text-5xl font-bold text-white mb-2"
                initial={{ letterSpacing: "0.5em", opacity: 0 }}
                animate={{ letterSpacing: "0.1em", opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                TYCOON CLICKER
              </motion.h1>
              
              <motion.div 
                className="text-lg text-[#4cc3a5] font-light tracking-widest uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Premium Experience
              </motion.div>
            </motion.div>



            {/* Loading Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="space-y-6"
            >
              {/* Progress Bar */}
              <div className="relative mb-8">
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden border border-[#4cc3a5]/20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-400 via-[#4cc3a5] to-yellow-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                  {/* Animated glow effect */}
                  <motion.div
                    className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent"
                    animate={{ x: [-80, 320] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
              </div>

              {/* Status Text */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#4cc3a5] font-medium text-center mb-6"
              >
                {currentStep}
              </motion.div>

              {/* Quote Section with more space */}
              <motion.div
                key={currentQuote}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-yellow-400/80 text-base italic text-center px-4 py-6 min-h-[60px] flex items-center justify-center"
              >
                <span className="max-w-lg leading-relaxed">"{currentQuote}"</span>
              </motion.div>

              {/* Tech Details */}
              <div className="flex justify-center space-x-6 text-xs text-gray-500 mt-6">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#4cc3a5] rounded-full animate-pulse"></div>
                  <span>SECURE</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span>ENCRYPTED</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#4cc3a5] rounded-full animate-pulse"></div>
                  <span>OPTIMIZED</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Corner Tech Elements */}
        <div className="absolute top-4 left-4 text-[#4cc3a5]/60 text-xs font-mono">
          TC://INIT_v2.1.0
        </div>
        <div className="absolute top-4 right-4 text-yellow-400/60 text-xs font-mono">
          {progress.toFixed(1)}%
        </div>
        <div className="absolute bottom-4 left-4 text-[#4cc3a5]/60 text-xs font-mono">
          SYSTEM.READY
        </div>
        <div className="absolute bottom-4 right-4 text-yellow-400/60 text-xs font-mono">
          WIZA.PREMIUM
        </div>

      </motion.div>

      {/* Нижний баннер в заставке */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 to-indigo-900 border-t border-purple-400/30">
        <div className="h-[60px] flex items-center justify-center text-white text-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">Advertisement Space</span>
            <div className="px-2 py-1 bg-white/10 rounded text-xs">AdSense</div>
          </div>
        </div>
        
        {/* Скрытый AdSense для будущего использования */}
        <ins 
          className="adsbygoogle"
          style={{ display: 'none' }}
          data-ad-client="ca-pub-4328087894770041"
          data-ad-slot="5243095999"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </AnimatePresence>
  );
}