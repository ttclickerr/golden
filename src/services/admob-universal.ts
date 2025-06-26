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

  // Удалена поддержка web/AdSense/adsbygoogle. Оставлена только мобильная инициализация.
  private async initializeWeb() {
    return Promise.resolve(true);
  }

  private async initializeMobile() {
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
        case 'ios':
        case 'android':
          return this.showMobileBanner(position);
      }
    } catch (error) {
      console.error('Banner ad error:', error);
      return false;
    }
    return false;
  }

  private showWebBanner(): boolean {
    // Удалено: web баннеры не поддерживаются
    return false;
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
        case 'ios':
        case 'android':
          return this.showMobileInterstitial();
      }
    } catch (error) {
      console.error('Interstitial ad error:', error);
      return false;
    }
    return false;
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
        case 'ios':
        case 'android':
          return this.showMobileRewarded();
      }
    } catch (error) {
      console.error('Rewarded ad error:', error);
      return { success: false };
    }
    return { success: false };
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