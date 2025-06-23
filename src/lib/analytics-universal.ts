// Универсальный трекер аналитики для AppMetrica, AppsFlyer, Adjust, Vercel
import { trackEvent as trackVercel } from './analytics';
import { appMetricaService } from './appmetrica';
import { appsFlyerService } from './appsflyer';
import { adjustService, ADJUST_EVENTS } from './adjust';
import { logGameEvent } from './firebase';
import { ironSourceService } from './ironsource';

export type AnalyticsEvent = {
  name: string;
  params?: Record<string, any>;
};

// Конфигурация SDK
const SDK_CONFIG = {
  appsFlyer: {
    devKey: import.meta.env.VITE_APPSFLYER_DEV_KEY
  },
  ironSource: {
    appKey: import.meta.env.VITE_IRONSOURCE_APP_KEY
  }
};

// Инициализация всех SDK
export async function initializeAnalytics() {
  try {
    // AppsFlyer
    await appsFlyerService?.initialize();
    
    // IronSource
    if (window.IronSource) {
      window.IronSource.init(SDK_CONFIG.ironSource.appKey);
    }
  } catch (e) {
    console.error('Analytics initialization error:', e);
  }
}

export function trackAllAnalytics(event: AnalyticsEvent) {
  try {
    // Vercel Analytics
    trackVercel(event.name, event.params?.category, event.params?.label, event.params?.value);

    // AppsFlyer
    appsFlyerService?.trackEvent(event.name, event.params);

    // IronSource events
    if (window.IronSource && event.params?.revenue) {
      window.IronSource.trackRevenue(event.params.revenue, event.params.currency || 'USD');
    }
  } catch (e) {
    console.error('Analytics tracking error:', e);
  }
}

// Инициализация AppsFlyer SDK при старте приложения
try {
  appsFlyerService?.initialize();
} catch (e) {
  // ignore errors
}

// Примеры стандартных событий
export const AnalyticsEvents = {
  APP_LAUNCH: 'app_launch',
  APP_CLOSE: 'app_close',
  PURCHASE: 'purchase',
  PREMIUM_PURCHASED: 'premium_purchased',
  REMOVE_ADS: 'remove_ads',
  AD_WATCHED: 'ad_watched',
  AD_CLICKED: 'ad_clicked',
  AD_FAILED: 'ad_failed',
  REWARD_RECEIVED: 'reward_received',
  GAME_SESSION_START: 'game_session_start',
  GAME_SESSION_END: 'game_session_end',
  LEVEL_UP: 'level_up',
  BOOSTER_USED: 'booster_used',
  BOOSTER_PURCHASED: 'booster_purchased',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  ACHIEVEMENT_VIEWED: 'achievement_viewed',
  STORE_VIEWED: 'store_viewed',
  STORE_PURCHASE: 'store_purchase',
  UPGRADE: 'upgrade',
  UPGRADE_PURCHASED: 'upgrade_purchased',
  INVESTMENT: 'investment',
  INVESTMENT_SOLD: 'investment_sold',
  INCOME_RECEIVED: 'income_received',
  PROGRESS: 'progress',
  PAGE_VIEW: 'page_view',
  ERROR: 'error',
  AUTH_LOGIN: 'auth_login',
  AUTH_LOGOUT: 'auth_logout',
  AUTH_REGISTER: 'auth_register',
  PROFILE_VIEWED: 'profile_viewed',
  LANGUAGE_CHANGED: 'language_changed',
  SETTINGS_OPENED: 'settings_opened',
  SETTINGS_CHANGED: 'settings_changed',
  LEADERBOARD_VIEWED: 'leaderboard_viewed',
  LEADERBOARD_POSITION: 'leaderboard_position',
  CASINO_PLAYED: 'casino_played',
  CASINO_WIN: 'casino_win',
  CASINO_LOSE: 'casino_lose',
  TUTORIAL_STARTED: 'tutorial_started',
  TUTORIAL_COMPLETED: 'tutorial_completed',
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_CLICKED: 'notification_clicked',
  SOCIAL_SHARE: 'social_share',
  SOCIAL_INVITE: 'social_invite',
  FEEDBACK_SENT: 'feedback_sent',
  SUPPORT_REQUEST: 'support_request',
  IRONSOURCE_AD_LOADED: 'ironsource_ad_loaded',
  IRONSOURCE_AD_SHOWN: 'ironsource_ad_shown',
  IRONSOURCE_AD_CLICKED: 'ironsource_ad_clicked',
  IRONSOURCE_AD_CLOSED: 'ironsource_ad_closed',
  IRONSOURCE_AD_FAILED: 'ironsource_ad_failed',
  // ...добавляйте новые события по мере необходимости
};
