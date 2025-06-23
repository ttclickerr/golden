// ironsource-universal.ts
// Универсальный сервис IronSource для Web, iOS, Android

export interface IronSourceRewardedResult {
  success: boolean;
  reward?: {
    type: string;
    amount: number;
  };
}

class UniversalIronSourceService {
  private isInitialized = false;
  private platform: 'web' | 'ios' | 'android' = 'web';
  private config = {
    appKey: import.meta.env.VITE_IRONSOURCE_APP_KEY || '',
    rewardedId: import.meta.env.VITE_IRONSOURCE_REWARDED_ID || '',
    bannerId: import.meta.env.VITE_IRONSOURCE_BANNER_ID || ''
  };

  constructor() {
    this.detectPlatform();
    this.initialize();
  }

  private detectPlatform() {
    if ((window as any).Capacitor) {
      this.platform = (window as any).Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
    } else {
      this.platform = 'web';
    }
  }

  private async initialize() {
    // TODO: Реальная инициализация IronSource SDK для каждой платформы
    this.isInitialized = true;
  }

  async showRewarded(): Promise<IronSourceRewardedResult> {
    if (!this.isInitialized) return { success: false };
    try {
      switch (this.platform) {
        case 'web':
          return this.showWebRewarded();
        case 'ios':
        case 'android':
          return this.showMobileRewarded();
      }
    } catch (e) {
      return { success: false };
    }
  }

  private async showWebRewarded(): Promise<IronSourceRewardedResult> {
    // TODO: Вызов реального IronSource SDK для web, если доступен
    // Fallback: эмуляция показа рекламы
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, reward: { type: 'coins', amount: 100 } });
      }, 4000);
    });
  }

  private async showMobileRewarded(): Promise<IronSourceRewardedResult> {
    // TODO: Вызов реального IronSource SDK через bridge/capacitor/cordova
    if ((window as any).IronSourceSDK) {
      try {
        const result = await (window as any).IronSourceSDK.showRewardedAd({
          appKey: this.config.appKey,
          placementId: this.config.rewardedId
        });
        return {
          success: result?.success,
          reward: result?.reward || { type: 'coins', amount: 100 }
        };
      } catch (e) {
        return { success: false };
      }
    }
    // Fallback: эмуляция
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, reward: { type: 'coins', amount: 100 } });
      }, 4000);
    });
  }
}

export const ironSourceService = new UniversalIronSourceService();
export default ironSourceService;
