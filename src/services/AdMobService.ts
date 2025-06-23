
/**
 * Сервис для интеграции с Google AdMob
 */

export enum AdMobAdType {
  BANNER = 'banner',
  INTERSTITIAL = 'interstitial', 
  REWARDED = 'rewarded',
  REWARDED_INTERSTITIAL = 'rewarded_interstitial',
  APP_OPEN = 'app_open'
}

export enum AdMobAdSize {
  BANNER = 'BANNER', // 320x50
  LARGE_BANNER = 'LARGE_BANNER', // 320x100  
  MEDIUM_RECTANGLE = 'MEDIUM_RECTANGLE', // 300x250
  FULL_BANNER = 'FULL_BANNER', // 468x60
  LEADERBOARD = 'LEADERBOARD', // 728x90
  SMART_BANNER = 'SMART_BANNER' // Адаптивный размер
}

interface AdMobConfig {
  applicationId: string;
  testDeviceIds: string[];
  adUnits: {
    banner: string;
    interstitial: string;
    rewarded: string;
    rewardedInterstitial: string;
    appOpen: string;
  };
}

interface AdReward {
  type: string;
  amount: number;
}

class AdMobService {
  private isInitialized: boolean = false;
  private config: AdMobConfig;
  private adLoadedStates: Record<string, boolean> = {};
  
  // Настройки показа рекламы
  private settings = {
    interstitialCooldown: 60000, // 1 минута между показами
    maxBannerRefreshRate: 30000, // Обновление баннера каждые 30 сек
    rewardedAdPreload: true, // Предзагрузка rewarded рекламы
  };

  private lastInterstitialTime: number = 0;

  constructor() {
    this.config = {
      // ID приложения AdMob  
      applicationId: process.env.REACT_APP_ADMOB_APP_ID || 'ca-app-pub-3940256099942544~3347511713',
      
      // Тестовые устройства
      testDeviceIds: [
        'EMULATOR', // Эмулятор всегда тестовое устройство
        process.env.REACT_APP_ADMOB_TEST_DEVICE || ''
      ].filter(Boolean),

      // ID рекламных блоков
      adUnits: {
        banner: process.env.REACT_APP_ADMOB_BANNER || 'ca-app-pub-3940256099942544/6300978111',
        interstitial: process.env.REACT_APP_ADMOB_INTERSTITIAL || 'ca-app-pub-3940256099942544/1033173712',
        rewarded: process.env.REACT_APP_ADMOB_REWARDED || 'ca-app-pub-3940256099942544/5224354917',
        rewardedInterstitial: process.env.REACT_APP_ADMOB_REWARDED_INTERSTITIAL || 'ca-app-pub-3940256099942544/5354046379',
        appOpen: process.env.REACT_APP_ADMOB_APP_OPEN || 'ca-app-pub-3940256099942544/3419835294'
      }
    };
  }

  /**
   * Инициализация AdMob
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    console.log('📱 Инициализация AdMob SDK');

    try {
      // Проверяем наличие AdMob в window (для веб-версии это будет Google Adsense)
      if (typeof window !== 'undefined' && (window as any).googletag) {
        // Инициализация Google Ad Manager для веб
        (window as any).googletag.cmd.push(() => {
          (window as any).googletag.pubads().enableSingleRequest();
          (window as any).googletag.pubads().disableInitialLoad();
          (window as any).googletag.enableServices();
        });

        console.log('✅ Google Ad Manager инициализирован для веб');
      } else if (typeof window !== 'undefined' && (window as any).AdMob) {
        // Для мобильных приложений
        await (window as any).AdMob.initialize({
          applicationId: this.config.applicationId,
          testDeviceIds: this.config.testDeviceIds,
          initializeForTesting: process.env.NODE_ENV !== 'production'
        });

        console.log('✅ AdMob SDK инициализирован');
      } else {
        console.log('⚠️ AdMob SDK не найден, используем заглушку');
      }

      this.isInitialized = true;
      await this.preloadAds();
      return true;

    } catch (error) {
      console.error('❌ Ошибка инициализации AdMob:', error);
      return false;
    }
  }

  /**
   * Предзагрузка рекламы
   */
  private async preloadAds(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // Предзагружаем все типы рекламы
      await Promise.all([
        this.loadInterstitialAd(),
        this.loadRewardedAd(),
        this.loadAppOpenAd()
      ]);

      console.log('✅ Реклама предзагружена');
    } catch (error) {
      console.error('❌ Ошибка предзагрузки рекламы:', error);
    }
  }

  /**
   * Создание и показ баннерной рекламы
   */
  async showBannerAd(
    containerId: string, 
    size: AdMobAdSize = AdMobAdSize.SMART_BANNER
  ): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      console.log(`📱 Показ баннерной рекламы в контейнере: ${containerId}`);

      if (typeof window !== 'undefined' && (window as any).googletag) {
        // Веб-версия с Google Ad Manager
        const slot = (window as any).googletag.defineSlot(
          this.config.adUnits.banner,
          [[320, 50], [728, 90], [300, 250]], // Адаптивные размеры
          containerId
        ).addService((window as any).googletag.pubads());

        (window as any).googletag.display(containerId);
        (window as any).googletag.pubads().refresh([slot]);

        return true;
      } else if (typeof window !== 'undefined' && (window as any).AdMob) {
        // Мобильная версия
        await (window as any).AdMob.showBanner({
          adUnitId: this.config.adUnits.banner,
          adSize: size,
          position: 'bottom'
        });

        return true;
      } else {
        // Заглушка для разработки
        console.log(`📊 [Mock] Banner Ad показан в ${containerId}`);
        return true;
      }
    } catch (error) {
      console.error('❌ Ошибка показа баннерной рекламы:', error);
      return false;
    }
  }

  /**
   * Скрытие баннерной рекламы
   */
  async hideBannerAd(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      if (typeof window !== 'undefined' && (window as any).AdMob) {
        await (window as any).AdMob.hideBanner();
      }
      console.log('📱 Баннерная реклама скрыта');
    } catch (error) {
      console.error('❌ Ошибка скрытия баннерной рекламы:', error);
    }
  }

  /**
   * Загрузка межстраничной рекламы
   */
  async loadInterstitialAd(): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      console.log('📱 Загрузка межстраничной рекламы');

      if (typeof window !== 'undefined' && (window as any).AdMob) {
        await (window as any).AdMob.prepareInterstitial({
          adUnitId: this.config.adUnits.interstitial
        });
      }

      this.adLoadedStates['interstitial'] = true;
      return true;
    } catch (error) {
      console.error('❌ Ошибка загрузки межстраничной рекламы:', error);
      return false;
    }
  }

  /**
   * Показ межстраничной рекламы
   */
  async showInterstitialAd(): Promise<boolean> {
    if (!this.isInitialized) return false;

    // Проверяем кулдаун
    const now = Date.now();
    if (now - this.lastInterstitialTime < this.settings.interstitialCooldown) {
      console.log('⏰ Межстраничная реклама на кулдауне');
      return false;
    }

    try {
      console.log('📱 Показ межстраничной рекламы');

      if (typeof window !== 'undefined' && (window as any).AdMob) {
        await (window as any).AdMob.showInterstitial();
      } else {
        console.log('📊 [Mock] Interstitial Ad показан');
      }

      this.lastInterstitialTime = now;
      this.adLoadedStates['interstitial'] = false;
      
      // Предзагружаем следующую рекламу
      setTimeout(() => this.loadInterstitialAd(), 1000);

      return true;
    } catch (error) {
      console.error('❌ Ошибка показа межстраничной рекламы:', error);
      return false;
    }
  }

  /**
   * Загрузка рекламы с вознаграждением
   */
  async loadRewardedAd(): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      console.log('📱 Загрузка рекламы с вознаграждением');

      if (typeof window !== 'undefined' && (window as any).AdMob) {
        await (window as any).AdMob.prepareRewardVideo({
          adUnitId: this.config.adUnits.rewarded
        });
      }

      this.adLoadedStates['rewarded'] = true;
      return true;
    } catch (error) {
      console.error('❌ Ошибка загрузки рекламы с вознаграждением:', error);
      return false;
    }
  }

  /**
   * Показ рекламы с вознаграждением
   */
  async showRewardedAd(): Promise<AdReward | null> {
    if (!this.isInitialized || !this.adLoadedStates['rewarded']) {
      return null;
    }

    try {
      console.log('📱 Показ рекламы с вознаграждением');

      if (typeof window !== 'undefined' && (window as any).AdMob) {
        const result = await (window as any).AdMob.showRewardVideo();
        
        if (result.rewardGranted) {
          this.adLoadedStates['rewarded'] = false;
          setTimeout(() => this.loadRewardedAd(), 1000);
          
          return {
            type: result.rewardType || 'coin',
            amount: result.rewardAmount || 1
          };
        }
      } else {
        // Заглушка для разработки
        console.log('📊 [Mock] Rewarded Ad показан');
        return { type: 'coin', amount: 1 };
      }

      return null;
    } catch (error) {
      console.error('❌ Ошибка показа рекламы с вознаграждением:', error);
      return null;
    }
  }

  /**
   * Загрузка рекламы при открытии приложения
   */
  async loadAppOpenAd(): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      console.log('📱 Загрузка App Open рекламы');
      // Реализация App Open рекламы
      this.adLoadedStates['appOpen'] = true;
      return true;
    } catch (error) {
      console.error('❌ Ошибка загрузки App Open рекламы:', error);
      return false;
    }
  }

  /**
   * Проверка доступности рекламы
   */
  isAdReady(adType: AdMobAdType): boolean {
    return this.adLoadedStates[adType] || false;
  }

  /**
   * Получение статистики рекламы
   */
  getAdStats(): Record<string, any> {
    return {
      initialized: this.isInitialized,
      loadedAds: this.adLoadedStates,
      lastInterstitialTime: this.lastInterstitialTime,
      settings: this.settings
    };
  }
}

// Экспорт синглтона
export const adMobService = new AdMobService();
