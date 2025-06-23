// AppMetrica Analytics Service
interface AppMetricaEvent {
  eventName: string;
  eventValues: Record<string, any>;
}

interface AppMetricaInterface {
  activate: (apiKey: string, options?: any) => void;
  reportEvent: (eventName: string, parameters?: Record<string, any>) => void;
  reportRevenue: (price: number, currency: string, productId?: string, receipt?: any) => void;
  setUserProfileID: (userID: string) => void;
  reportUserProfile: (attributes: Record<string, any>) => void;
  getLibraryVersion: () => string;
}

declare global {
  interface Window {
    AppMetrica?: AppMetricaInterface;
  }
}

class AppMetricaService {
  private isInitialized = false;
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_APPMETRICA_API_KEY;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('AppMetrica already initialized');
      return;
    }

    if (!this.apiKey) {
      console.warn('AppMetrica API key not found in environment variables');
      return;
    }

    try {
      // Check if AppMetrica is available (mobile app)
      if (window.AppMetrica) {
        window.AppMetrica.activate(this.apiKey, {
          sessionTimeout: 300,
          crashReporting: true,
          locationTracking: false,
          logs: false
        });
        
        console.log('AppMetrica SDK initialized successfully');
        this.isInitialized = true;
      } else {
        // Web fallback - simulate AppMetrica functionality
        console.log('AppMetrica SDK not available, using web fallback');
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize AppMetrica:', error);
    }
  }

  async reportEvent(eventName: string, parameters: Record<string, any> = {}): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (window.AppMetrica) {
        window.AppMetrica.reportEvent(eventName, parameters);
        console.log(`AppMetrica event tracked: ${eventName}`, parameters);
      } else {
        // Web fallback - log to console
        console.log(`AppMetrica event (web): ${eventName}`, parameters);
      }
    } catch (error) {
      console.error('Failed to track AppMetrica event:', error);
    }
  }

  async reportRevenue(price: number, currency: string = 'USD', productId?: string, receipt?: any): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (window.AppMetrica) {
        window.AppMetrica.reportRevenue(price, currency, productId, receipt);
        console.log(`AppMetrica revenue tracked: ${price} ${currency}`, { productId, receipt });
      } else {
        console.log(`AppMetrica revenue (web): ${price} ${currency}`, { productId, receipt });
      }
    } catch (error) {
      console.error('Failed to track AppMetrica revenue:', error);
    }
  }

  async setUserId(userId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (window.AppMetrica) {
        window.AppMetrica.setUserProfileID(userId);
        console.log(`AppMetrica user ID set: ${userId}`);
      } else {
        console.log(`AppMetrica user ID (web): ${userId}`);
      }
    } catch (error) {
      console.error('Failed to set AppMetrica user ID:', error);
    }
  }

  async reportUserProfile(attributes: Record<string, any>): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (window.AppMetrica) {
        window.AppMetrica.reportUserProfile(attributes);
        console.log('AppMetrica user profile updated:', attributes);
      } else {
        console.log('AppMetrica user profile (web):', attributes);
      }
    } catch (error) {
      console.error('Failed to update AppMetrica user profile:', error);
    }
  }

  // Game-specific tracking methods
  async trackGameStart(): Promise<void> {
    await this.reportEvent('game_start', {
      level: 1,
      content_type: 'tutorial'
    });
  }

  async trackPurchase(revenue: number, currency: string = 'USD', productId?: string): Promise<void> {
    await this.reportRevenue(revenue, currency, productId);
    await this.reportEvent('purchase', {
      revenue: revenue,
      currency: currency,
      product_id: productId || 'unknown',
      content_type: 'in_app_purchase'
    });
  }

  async trackAdRevenue(adType: string, revenue: number, adNetwork?: string): Promise<void> {
    await this.reportRevenue(revenue, 'USD', `ad_${adType}`);
    await this.reportEvent('ad_revenue', {
      ad_type: adType,
      revenue: revenue,
      ad_network: adNetwork || 'admob',
      currency: 'USD'
    });
  }

  async trackLevelUp(level: number): Promise<void> {
    await this.reportEvent('level_up', {
      level: level,
      content_type: 'level_progression'
    });
  }

  async trackInvestment(assetType: string, amount: number): Promise<void> {
    await this.reportEvent('spend_virtual_currency', {
      content_type: 'investment',
      item_name: assetType,
      virtual_currency_name: 'game_currency',
      value: amount
    });
  }

  async trackSubscription(subscriptionType: string, price: number, period: string): Promise<void> {
    await this.reportRevenue(price, 'USD', subscriptionType);
    await this.reportEvent('subscribe', {
      revenue: price,
      currency: 'USD',
      content_type: subscriptionType,
      subscription_period: period
    });
  }

  async trackLogin(method: string = 'guest'): Promise<void> {
    await this.reportEvent('login', {
      login_method: method
    });
  }

  async trackRegistration(method: string = 'email'): Promise<void> {
    await this.reportEvent('registration', {
      registration_method: method
    });
  }

  async trackBusinessPurchase(businessType: string, price: number): Promise<void> {
    await this.reportRevenue(price, 'USD', businessType);
    await this.reportEvent('purchase', {
      revenue: price,
      currency: 'USD',
      content_type: 'business',
      item_name: businessType
    });
  }

  async trackBoosterUsed(boosterType: string, duration: number): Promise<void> {
    await this.reportEvent('use_item', {
      content_type: 'booster',
      item_name: boosterType,
      quantity: duration
    });
  }

  async trackAchievementUnlocked(achievementId: string, reward: number): Promise<void> {
    await this.reportEvent('achievement_unlocked', {
      achievement_id: achievementId,
      score: reward
    });
  }

  async trackSessionStart(): Promise<void> {
    await this.reportEvent('session_start', {
      content_type: 'game_session'
    });
  }

  async trackSessionEnd(duration: number): Promise<void> {
    await this.reportEvent('session_end', {
      session_duration: duration,
      content_type: 'game_session'
    });
  }

  async trackAdView(adType: string, revenue?: number): Promise<void> {
    await this.reportEvent('ad_view', {
      ad_type: adType,
      revenue: revenue || 0,
      currency: 'USD'
    });
  }
}

export const appMetricaService = new AppMetricaService();