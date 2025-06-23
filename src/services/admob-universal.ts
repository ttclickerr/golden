/**
 * Universal AdMob Service for Web, iOS and Android
 * Handles banner, interstitial and rewarded ads across all platforms
 */

interface AdMobConfig {
  appId: string;
  bannerId: string;
  interstitialId: string;
  rewardedId: string;
}

interface RewardedAdResult {
  success: boolean;
  reward?: {
    type: string;
    amount: number;
  };
}

class UniversalAdMobService {
  private config: AdMobConfig;
  private isInitialized = false;
  private platform: 'web' | 'ios' | 'android' = 'web';

  constructor() {
    this.config = {
      appId: import.meta.env.VITE_ADMOB_APP_ID || '',
      bannerId: import.meta.env.VITE_ADMOB_BANNER_ID || '',
      interstitialId: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || '',
      rewardedId: import.meta.env.VITE_ADMOB_REWARDED_ID || ''
    };

    this.detectPlatform();
    this.initialize();
  }

  private detectPlatform() {
    // Detect if running in Capacitor (mobile app)
    if ((window as any).Capacitor) {
      this.platform = (window as any).Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
    } else {
      this.platform = 'web';
    }
  }

  private async initialize() {
    try {
      switch (this.platform) {
        case 'web':
          await this.initializeWeb();
          break;
        case 'ios':
        case 'android':
          await this.initializeMobile();
          break;
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('AdMob initialization failed:', error);
    }
  }

  private async initializeWeb() {
    // Load Google AdSense for web platform
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.appId}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      return new Promise((resolve) => {
        script.onload = () => {
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          // Force AdSense initialization
          try {
            (window as any).adsbygoogle.push({
              google_ad_client: this.config.appId,
              enable_page_level_ads: true
            });
          } catch (e) {
            console.error('AdSense initialization error:', e);
          }
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load AdSense script');
          resolve(false);
        };
      });
    } else {
      return Promise.resolve(true);
    }
  }

  private async initializeMobile() {
    // Initialize AdMob for mobile platforms using Capacitor plugin
    if ((window as any).AdMob) {
      await (window as any).AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: [],
        initializeForTesting: false,
      });
    }
  }

  // Banner Ads
  async showBanner(position: 'top' | 'bottom' = 'bottom'): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      switch (this.platform) {
        case 'web':
          return this.showWebBanner();
        case 'ios':
        case 'android':
          return this.showMobileBanner(position);
      }
    } catch (error) {
      console.error('Banner ad error:', error);
      return false;
    }
  }

  private showWebBanner(): boolean {
    // Web banner is handled by React component
    return true;
  }

  private async showMobileBanner(position: 'top' | 'bottom'): Promise<boolean> {
    if (!(window as any).AdMob) return false;

    try {
      await (window as any).AdMob.showBanner({
        adId: this.config.bannerId,
        position: position === 'top' ? 'TOP_CENTER' : 'BOTTOM_CENTER',
        margin: 0,
      });
      return true;
    } catch (error) {
      console.error('Mobile banner error:', error);
      return false;
    }
  }

  async hideBanner(): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      if (this.platform === 'ios' || this.platform === 'android') {
        if ((window as any).AdMob) {
          await (window as any).AdMob.hideBanner();
          return true;
        }
      }
      return true;
    } catch (error) {
      console.error('Hide banner error:', error);
      return false;
    }
  }

  // Interstitial Ads
  async showInterstitial(): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      switch (this.platform) {
        case 'web':
          return this.showWebInterstitial();
        case 'ios':
        case 'android':
          return this.showMobileInterstitial();
      }
    } catch (error) {
      console.error('Interstitial ad error:', error);
      return false;
    }
  }

  private async showWebInterstitial(): Promise<boolean> {
    // Create fullscreen interstitial for web
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const adContainer = document.createElement('ins');
    adContainer.className = 'adsbygoogle';
    adContainer.style.cssText = `
      display: block;
      width: 300px;
      height: 250px;
    `;
    adContainer.setAttribute('data-ad-client', this.config.appId);
    adContainer.setAttribute('data-ad-slot', this.config.interstitialId);
    adContainer.setAttribute('data-ad-format', 'auto');

    overlay.appendChild(adContainer);
    document.body.appendChild(overlay);

    // Initialize ad
    if ((window as any).adsbygoogle) {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    }

    // Auto-close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 5000);

    return true;
  }

  private async showMobileInterstitial(): Promise<boolean> {
    if (!(window as any).AdMob) return false;

    try {
      await (window as any).AdMob.prepareInterstitial({
        adId: this.config.interstitialId,
      });

      await (window as any).AdMob.showInterstitial();
      return true;
    } catch (error) {
      console.error('Mobile interstitial error:', error);
      return false;
    }
  }

  // Rewarded Ads
  async showRewarded(): Promise<RewardedAdResult> {
    if (!this.isInitialized) {
      return { success: false };
    }

    try {
      switch (this.platform) {
        case 'web':
          return this.showWebRewarded();
        case 'ios':
        case 'android':
          return this.showMobileRewarded();
      }
    } catch (error) {
      console.error('Rewarded ad error:', error);
      return { success: false };
    }
  }

  private async showWebRewarded(): Promise<RewardedAdResult> {
    return new Promise((resolve) => {
      // Create fullscreen rewarded ad for web
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.95);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      `;

      // Контейнер для рекламы фиксированного размера
      const adContainer = document.createElement('ins');
      adContainer.className = 'adsbygoogle';
      adContainer.style.cssText = `
        display: block;
        width: 320px;
        height: 480px;
        background: #111;
        border-radius: 16px;
        box-shadow: 0 4px 32px #000a;
      `;
      adContainer.setAttribute('data-ad-client', this.config.appId);
      adContainer.setAttribute('data-ad-slot', this.config.rewardedId);
      adContainer.setAttribute('data-ad-format', 'auto');

      // Кнопка закрытия
      const closeBtn = document.createElement('button');
      closeBtn.innerText = '✕';
      closeBtn.style.cssText = `
        position: absolute;
        top: 24px;
        right: 32px;
        background: rgba(0,0,0,0.5);
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 10001;
      `;
      closeBtn.onclick = () => {
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
        resolve({ success: false });
      };

      // Сообщение об ошибке
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = 'color:#fff;text-align:center;margin-top:24px;display:none;';
      errorMsg.innerText = 'Ad failed to load. Please try again later.';

      overlay.appendChild(adContainer);
      overlay.appendChild(closeBtn);
      overlay.appendChild(errorMsg);
      document.body.appendChild(overlay);

      let adLoaded = false;
      let adError = false;

      // Попытка инициализации рекламы
      try {
        if ((window as any).adsbygoogle) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          adLoaded = true;
        }
      } catch (e) {
        adError = true;
        errorMsg.style.display = 'block';
      }

      // Fallback: если реклама не загрузилась за 6 секунд — показать ошибку
      setTimeout(() => {
        if (!adLoaded) {
          errorMsg.style.display = 'block';
        }
      }, 6000);

      // Автоматическое завершение через 7 секунд (эмуляция просмотра)
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
        if (!adError) {
          resolve({
            success: true,
            reward: {
              type: 'coins',
              amount: 100
            }
          });
        } else {
          resolve({ success: false });
        }
      }, 7000);
    });
  }

  private async showMobileRewarded(): Promise<RewardedAdResult> {
    if (!(window as any).AdMob) {
      return { success: false };
    }

    try {
      await (window as any).AdMob.prepareRewardVideoAd({
        adId: this.config.rewardedId,
      });

      const result = await (window as any).AdMob.showRewardVideoAd();
      
      return {
        success: true,
        reward: {
          type: 'coins',
          amount: result.reward?.amount || 100
        }
      };
    } catch (error) {
      console.error('Mobile rewarded error:', error);
      return { success: false };
    }
  }

  // Utility methods
  getPlatform(): string {
    return this.platform;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getConfig(): AdMobConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const adMobService = new UniversalAdMobService();
export default adMobService;