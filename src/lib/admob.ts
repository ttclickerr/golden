// Типы для AdMob/Google Ads
declare global {
  interface Window {
    adsbygoogle: any[];
    googletag: {
      cmd: any[];
      defineSlot: (adUnitPath: string, size: number[], div: string) => any;
      pubads: () => any;
      enableServices: () => void;
    };
  }
}

interface AdMobConfig {
  appId: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
}

interface AdRequestResult {
  success: boolean;
  error?: string;
  reward?: {
    type: string;
    amount: number;
  };
}

class AdMobService {
  private isInitialized = false;
  private config: AdMobConfig | null = null;
  private consentGiven = false;
  private adIdPermissionGranted = false;
  
  async initialize() {
    // Используем реальные AdMob ID или fallback для разработки
    const appId = import.meta.env.VITE_ADMOB_APP_ID || 'ca-app-pub-3508065928952669~4380773684';
    const bannerAdUnitId = import.meta.env.VITE_ADMOB_BANNER_ID || 'ca-app-pub-3508065928952669/1559778036';
    const rewardedAdUnitId = import.meta.env.VITE_ADMOB_REWARDED_ID || 'ca-app-pub-3508065928952669/4113938540';
    const interstitialAdUnitId = import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-3508065928952669/5778374001';

    this.config = {
      appId,
      bannerAdUnitId,
      interstitialAdUnitId,
      rewardedAdUnitId,
    };

    // Проверка разрешения AD_ID для Android 13+
    this.adIdPermissionGranted = await this.checkAdIdPermission();
    
    if (typeof window !== 'undefined') {
      window.adsbygoogle = window.adsbygoogle || [];
      this.isInitialized = true;
      console.log('AdMob service initialized successfully');
      console.log('AD_ID permission status:', this.adIdPermissionGranted ? 'Granted' : 'Not granted');
    }
  }

  // Проверка разрешения AD_ID для Android 13+
  private async checkAdIdPermission(): Promise<boolean> {
    try {
      // Проверяем, запущено ли приложение на Android
      const isAndroid = typeof window !== 'undefined' && 
                        window.navigator && 
                        /android/i.test(window.navigator.userAgent);
      
      if (!isAndroid) return true; // Для не-Android платформ разрешение не требуется
      
      // Для Capacitor/Cordova можно использовать плагин для проверки разрешений
      // Здесь упрощенная проверка для веб-версии
      console.log('Android device detected, AD_ID permission required for Android 13+');
      
      // В реальном приложении здесь будет проверка через нативный мост
      // Для демонстрации возвращаем true
      return true;
    } catch (error) {
      console.error('Error checking AD_ID permission:', error);
      return false;
    }
  }

  setConsentStatus(hasConsent: boolean) {
    this.consentGiven = hasConsent;
    console.log('AdMob consent status updated:', hasConsent);
  }

  // Показ баннерной рекламы
  showBannerAd(containerId: string): Promise<AdRequestResult> {
    return new Promise((resolve) => {
      if (!this.isInitialized || !this.consentGiven) {
        resolve({ success: false, error: 'Service not initialized or consent not given' });
        return;
      }

      // Проверка разрешения AD_ID для Android 13+
      if (!this.adIdPermissionGranted) {
        console.warn('AD_ID permission not granted, ad functionality may be limited');
      }

      try {
        const adElement = document.getElementById(containerId);
        if (!adElement) {
          resolve({ success: false, error: 'Container element not found' });
          return;
        }

        // Для веб-версии используем Google AdSense
        adElement.innerHTML = `
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="${this.config?.appId}"
               data-ad-slot="${this.config?.bannerAdUnitId}"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        `;

        (window.adsbygoogle = window.adsbygoogle || []).push({});
        
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);

      } catch (error: unknown) {
        console.error('Banner ad error:', error);
        resolve({ success: false, error: String(error) });
      }
    });
  }

  // Показ полноэкранной рекламы
  showInterstitialAd(): Promise<AdRequestResult> {
    return new Promise((resolve) => {
      if (!this.isInitialized || !this.consentGiven) {
        resolve({ success: false, error: 'Service not initialized or consent not given' });
        return;
      }

      // Проверка разрешения AD_ID для Android 13+
      if (!this.adIdPermissionGranted) {
        console.warn('AD_ID permission not granted, ad functionality may be limited');
      }

      console.log('Interstitial ad requested');
      
      // Имитация показа полноэкранной рекламы
      // В реальном приложении здесь будет настоящая интеграция
      setTimeout(() => {
        resolve({ success: true });
      }, 2000);
    });
  }

  // Показ рекламы с наградой
  showRewardedAd(): Promise<AdRequestResult> {
    return new Promise((resolve) => {
      if (!this.isInitialized || !this.consentGiven) {
        resolve({ success: false, error: 'Service not initialized or consent not given' });
        return;
      }

      // Проверка разрешения AD_ID для Android 13+
      if (!this.adIdPermissionGranted) {
        console.warn('AD_ID permission not granted, ad functionality may be limited');
      }

      console.log('Rewarded ad requested');
      
      // Имитация показа рекламы с наградой
      // В реальном приложении здесь будет настоящая интеграция
      setTimeout(() => {
        const rewardTypes = ['coins', 'booster', 'multiplier'];
        const rewardType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
        
        resolve({ 
          success: true, 
          reward: {
            type: rewardType,
            amount: Math.floor(Math.random() * 100) + 50
          }
        });
      }, 3000);
    });
  }

  // Проверка доступности рекламы
  isAdAvailable(adType: 'banner' | 'interstitial' | 'rewarded'): boolean {
    if (!this.isInitialized || !this.consentGiven) {
      return false;
    }

    // Проверка разрешения AD_ID для Android 13+
    if (!this.adIdPermissionGranted) {
      console.warn('AD_ID permission not granted, ad availability may be limited');
    }

    // В реальном приложении здесь будет проверка загрузки рекламы
    return true;
  }

  // Предзагрузка рекламы
  preloadAds() {
    if (!this.isInitialized || !this.consentGiven) {
      return;
    }

    // Проверка разрешения AD_ID для Android 13+
    if (!this.adIdPermissionGranted) {
      console.warn('AD_ID permission not granted, ad preloading may be limited');
    }

    console.log('Preloading ads...');
    // В реальном приложении здесь будет предзагрузка рекламы
  }
}

export const adMobService = new AdMobService();