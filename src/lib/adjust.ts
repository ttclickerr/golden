// Типы для Adjust SDK
declare global {
  interface Window {
    Adjust: {
      initSdk: (config: AdjustConfig) => void;
      trackEvent: (event: AdjustEvent) => void;
      addSessionCallbackParameter: (key: string, value: string) => void;
      addSessionPartnerParameter: (key: string, value: string) => void;
      setEnabled: (enabled: boolean) => void;
      isEnabled: () => boolean;
    };
  }
}

interface AdjustConfig {
  appToken: string;
  environment: string;
  logLevel?: string;
  eventBufferingEnabled?: boolean;
  defaultTracker?: string;
  attributionCallback?: (attribution: any) => void;
  sessionSuccessCallback?: (sessionSuccess: any) => void;
  sessionFailureCallback?: (sessionFailure: any) => void;
  eventSuccessCallback?: (eventSuccess: any) => void;
  eventFailureCallback?: (eventFailure: any) => void;
}

interface AdjustEvent {
  eventToken: string;
  revenue?: number;
  currency?: string;
  callbackParameters?: Record<string, string>;
  partnerParameters?: Record<string, string>;
}

// Event tokens - эти токены должны быть получены из панели Adjust
export const ADJUST_EVENTS = {
  APP_LAUNCH: 'abc123',
  PURCHASE: 'abc124',
  LEVEL_UP: 'abc125',
  AD_WATCHED: 'abc126',
  INVESTMENT_MADE: 'abc127',
  BUSINESS_PURCHASED: 'abc128',
  ACHIEVEMENT_UNLOCKED: 'abc129',
  GAME_SESSION_START: 'abc130',
  GAME_SESSION_END: 'abc131',
} as const;

class AdjustService {
  private isInitialized = false;
  private isEnabled = true;

  initialize() {
    if (!import.meta.env.VITE_ADJUST_APP_TOKEN) {
      console.warn('Adjust app token not found in environment variables');
      return;
    }

    if (typeof window === 'undefined' || !window.Adjust) {
      console.warn('Adjust SDK not loaded');
      return;
    }

    const config: AdjustConfig = {
      appToken: import.meta.env.VITE_ADJUST_APP_TOKEN,
      environment: import.meta.env.VITE_ADJUST_ENVIRONMENT || 'sandbox',
      logLevel: 'verbose',
      eventBufferingEnabled: false,
      attributionCallback: (attribution) => {
        console.log('Adjust Attribution:', attribution);
      },
      sessionSuccessCallback: (sessionSuccess) => {
        console.log('Adjust Session Success:', sessionSuccess);
      },
      eventSuccessCallback: (eventSuccess) => {
        console.log('Adjust Event Success:', eventSuccess);
      },
    };

    try {
      window.Adjust.initSdk(config);
      this.isInitialized = true;
      console.log('Adjust SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Adjust SDK:', error);
    }
  }

  trackEvent(eventToken: string, revenue?: number, currency?: string, parameters?: Record<string, string>) {
    if (!this.isInitialized || !this.isEnabled) {
      console.log('Adjust not initialized or disabled, skipping event:', eventToken);
      return;
    }

    const event: AdjustEvent = {
      eventToken,
      ...(revenue && { revenue }),
      ...(currency && { currency }),
      ...(parameters && { callbackParameters: parameters }),
    };

    try {
      window.Adjust.trackEvent(event);
      console.log('Adjust event tracked:', eventToken, parameters);
    } catch (error) {
      console.error('Failed to track Adjust event:', error);
    }
  }

  trackAppLaunch() {
    this.trackEvent(ADJUST_EVENTS.APP_LAUNCH);
  }

  trackPurchase(amount: number, currency: string = 'USD') {
    this.trackEvent(ADJUST_EVENTS.PURCHASE, amount, currency);
  }

  trackLevelUp(level: number) {
    this.trackEvent(ADJUST_EVENTS.LEVEL_UP, undefined, undefined, { level: level.toString() });
  }

  trackAdWatched(adType: string, reward?: string) {
    this.trackEvent(ADJUST_EVENTS.AD_WATCHED, undefined, undefined, { 
      ad_type: adType,
      ...(reward && { reward })
    });
  }

  trackInvestment(assetType: string, amount: number) {
    this.trackEvent(ADJUST_EVENTS.INVESTMENT_MADE, amount, 'USD', { 
      asset_type: assetType 
    });
  }

  trackBusinessPurchase(businessType: string, amount: number) {
    this.trackEvent(ADJUST_EVENTS.BUSINESS_PURCHASED, amount, 'USD', { 
      business_type: businessType 
    });
  }

  trackAchievement(achievementId: string) {
    this.trackEvent(ADJUST_EVENTS.ACHIEVEMENT_UNLOCKED, undefined, undefined, { 
      achievement_id: achievementId 
    });
  }

  trackSessionStart() {
    this.trackEvent(ADJUST_EVENTS.GAME_SESSION_START);
  }

  trackSessionEnd(duration: number) {
    this.trackEvent(ADJUST_EVENTS.GAME_SESSION_END, undefined, undefined, { 
      session_duration: duration.toString() 
    });
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (this.isInitialized && window.Adjust) {
      window.Adjust.setEnabled(enabled);
    }
  }
}

export const adjustService = new AdjustService();