// AppsFlyer Analytics Service
interface AppsFlyerEvent {
  eventName: string;
  eventValues: Record<string, any>;
}

interface AppsFlyerInterface {
  initSdk: (options: {
    devKey: string;
    isDebug: boolean;
    appId?: string;
    onInstallConversionDataListener?: (data: any) => void;
    onDeepLinkListener?: (data: any) => void;
  }) => Promise<string>;
  logEvent: (eventName: string, eventValues: Record<string, any>) => Promise<string>;
  setCustomerUserId: (userId: string) => void;
  getAppsFlyerUID: () => Promise<string>;
}

declare global {
  interface Window {
    plugins?: {
      appsFlyer?: AppsFlyerInterface;
    };
  }
}

class AppsFlyerService {
  private isInitialized = false;
  private devKey: string | null = null;

  constructor() {
    this.devKey = import.meta.env.VITE_APPSFLYER_DEV_KEY;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('AppsFlyer already initialized');
      return;
    }

    if (!this.devKey) {
      console.warn('AppsFlyer dev key not found in environment variables');
      return;
    }

    try {
      // Check if AppsFlyer is available (mobile app)
      if (window.plugins?.appsFlyer) {
        await window.plugins.appsFlyer.initSdk({
          devKey: this.devKey,
          isDebug: false,
          appId: import.meta.env.VITE_IOS_BUNDLE_ID || 'com.wealthtycoon.game',
          onInstallConversionDataListener: this.onInstallConversionData.bind(this),
          onDeepLinkListener: this.onDeepLink.bind(this)
        });
        
        console.log('AppsFlyer SDK initialized successfully');
        this.isInitialized = true;
      } else {
        // Web fallback - simulate AppsFlyer functionality
        console.log('AppsFlyer SDK not available, using web fallback');
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize AppsFlyer:', error);
    }
  }

  private onInstallConversionData(data: any): void {
    console.log('AppsFlyer install conversion data:', data);
    
    // Track install attribution
    if (data.type === 'onInstallConversionDataLoaded') {
      this.trackEvent('af_app_opened', {
        af_media_source: data.media_source || 'organic',
        af_campaign: data.campaign || 'unknown'
      });
    }
  }

  private onDeepLink(data: any): void {
    console.log('AppsFlyer deep link data:', data);
    
    // Handle deep link events
    this.trackEvent('af_deep_link', {
      deep_link_value: data.deep_link_value || '',
      match_type: data.match_type || 'probabilistic'
    });
  }

  async trackEvent(eventName: string, eventValues: Record<string, any> = {}): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (window.plugins?.appsFlyer) {
        await window.plugins.appsFlyer.logEvent(eventName, eventValues);
        console.log(`AppsFlyer event tracked: ${eventName}`, eventValues);
      } else {
        // Web fallback - log to console
        console.log(`AppsFlyer event (web): ${eventName}`, eventValues);
      }
    } catch (error) {
      console.error('Failed to track AppsFlyer event:', error);
    }
  }

  async setUserId(userId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (window.plugins?.appsFlyer) {
        window.plugins.appsFlyer.setCustomerUserId(userId);
        console.log(`AppsFlyer user ID set: ${userId}`);
      } else {
        console.log(`AppsFlyer user ID (web): ${userId}`);
      }
    } catch (error) {
      console.error('Failed to set AppsFlyer user ID:', error);
    }
  }

  async getAppsFlyerUID(): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (window.plugins?.appsFlyer) {
        return await window.plugins.appsFlyer.getAppsFlyerUID();
      } else {
        // Web fallback - generate a simple UID
        return `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
    } catch (error) {
      console.error('Failed to get AppsFlyer UID:', error);
      return null;
    }
  }

  // Game-specific tracking methods
  async trackGameStart(): Promise<void> {
    await this.trackEvent('af_tutorial_completion', {
      af_content_type: 'game_start',
      af_level: 1
    });
  }

  async trackPurchase(revenue: number, currency: string = 'USD', productId?: string): Promise<void> {
    await this.trackEvent('af_purchase', {
      af_revenue: revenue,
      af_currency: currency,
      af_content_id: productId || 'unknown',
      af_content_type: 'in_app_purchase'
    });
  }

  async trackAdView(adType: string, revenue?: number): Promise<void> {
    await this.trackEvent('af_ad_view', {
      af_adrev_ad_type: adType,
      af_revenue: revenue || 0,
      af_currency: 'USD'
    });
  }

  async trackLevelUp(level: number): Promise<void> {
    await this.trackEvent('af_level_achieved', {
      af_level: level,
      af_content_type: 'level_progression'
    });
  }

  async trackInvestment(assetType: string, amount: number): Promise<void> {
    await this.trackEvent('af_spend_credits', {
      af_content_type: 'investment',
      af_content_id: assetType,
      af_currency: 'game_currency',
      af_quantity: amount
    });
  }

  // Дополнительные события для максимальной аналитики
  async trackAdRevenue(adType: string, revenue: number, adNetwork?: string): Promise<void> {
    await this.trackEvent('af_ad_revenue', {
      af_adrev_ad_type: adType,
      af_adrev_revenue: revenue,
      af_adrev_ad_network: adNetwork || 'admob',
      af_currency: 'USD'
    });
  }

  async trackSubscription(subscriptionType: string, price: number, period: string): Promise<void> {
    await this.trackEvent('af_subscribe', {
      af_revenue: price,
      af_currency: 'USD',
      af_content_type: subscriptionType,
      af_subscription_period: period
    });
  }

  async trackLogin(method: string = 'guest'): Promise<void> {
    await this.trackEvent('af_login', {
      af_login_method: method
    });
  }

  async trackRegistration(method: string = 'email'): Promise<void> {
    await this.trackEvent('af_complete_registration', {
      af_registration_method: method
    });
  }

  async trackBusinessPurchase(businessType: string, price: number): Promise<void> {
    await this.trackEvent('af_purchase', {
      af_revenue: price,
      af_currency: 'USD',
      af_content_type: 'business',
      af_content_id: businessType
    });
  }

  async trackBoosterUsed(boosterType: string, duration: number): Promise<void> {
    await this.trackEvent('af_use_item', {
      af_content_type: 'booster',
      af_content_id: boosterType,
      af_quantity: duration
    });
  }

  async trackAchievementUnlocked(achievementId: string, reward: number): Promise<void> {
    await this.trackEvent('af_achievement_unlocked', {
      af_achievement_id: achievementId,
      af_score: reward
    });
  }

  async trackSessionStart(): Promise<void> {
    await this.trackEvent('af_session_start', {
      af_content_type: 'game_session'
    });
  }

  async trackSessionEnd(duration: number): Promise<void> {
    await this.trackEvent('af_session_end', {
      af_session_duration: duration,
      af_content_type: 'game_session'
    });
  }
}

export const appsFlyerService = new AppsFlyerService();