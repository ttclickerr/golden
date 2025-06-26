// trackAnalyticsEvent.ts
// Универсальная отправка любых событий рекламы/игры во все системы аналитики

import { appMetricaService } from './appmetrica';
import { appsFlyerService } from './appsflyer';
import { logGameEvent } from './firebase';
import { trackEvent as trackVercel } from './analytics';

export type AnalyticsEventName =
  | 'app_first_open'
  | 'app_open'
  | 'app_close'
  | 'session_start'
  | 'session_end'
  | 'screen_view'
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  | 'consent_given'
  | 'consent_denied'
  | 'banner_shown'
  | 'banner_clicked'
  | 'banner_failed'
  | 'interstitial_shown'
  | 'interstitial_clicked'
  | 'interstitial_failed'
  | 'rewarded_shown'
  | 'rewarded_completed'
  | 'rewarded_clicked'
  | 'rewarded_failed'
  | 'fullscreen_ad_shown'
  | 'fullscreen_ad_failed'
  | 'ad_revenue'
  | 'ad_impression'
  | 'ad_blocked'
  | 'purchase_initiated'
  | 'purchase_success'
  | 'purchase_failed'
  | 'purchase_restored'
  | 'error'
  | 'feedback_sent'
  | 'settings_changed'
  | 'achievement_unlocked'
  | 'level_up'
  | 'milestone_level'
  | 'premium_payment_page_view'
  | 'premium_reset'
  | 'premium_payment_start'
  | 'premium_purchase_started';

export interface AnalyticsEventParams {
  event: AnalyticsEventName;
  adType?: string;
  provider?: string;
  revenue?: number;
  userId?: string;
  screenName?: string;
  placement?: string;
  errorCode?: string;
  errorMessage?: string;
  [key: string]: any;
}

export async function trackAnalyticsEvent(params: AnalyticsEventParams) {
  const {
    event,
    adType = '',
    provider = '',
    revenue = 0,
    userId = 'anonymous',
    screenName = '',
    placement = '',
    errorCode = '',
    errorMessage = '',
    ...rest
  } = params;

  // AppMetrica
  try {
    if (event === 'rewarded_shown' || event === 'rewarded_completed' || event === 'interstitial_shown' || event === 'banner_shown') await appMetricaService.trackAdView(adType, revenue);
    if (event === 'ad_revenue') await appMetricaService.trackAdRevenue(adType, revenue, provider);
    if (event === 'banner_shown') await appMetricaService.reportEvent('banner_shown', { provider, placement, ...rest });
    if (event.endsWith('_failed')) await appMetricaService.reportEvent(event, { provider, adType, errorCode, errorMessage, ...rest });
    if (event === 'screen_view') await appMetricaService.reportEvent('screen_view', { screenName, ...rest });
    if (event === 'error') await appMetricaService.reportEvent('error', { errorCode, errorMessage, ...rest });
    // ...другие события по необходимости
  } catch (e) { console.warn('AppMetrica analytics error', e); }

  // AppsFlyer
  try {
    if (event === 'rewarded_shown' || event === 'rewarded_completed' || event === 'interstitial_shown' || event === 'banner_shown') await appsFlyerService.trackAdView(adType, revenue);
    if (event === 'ad_revenue') await appsFlyerService.trackAdRevenue(adType, revenue, provider);
    if (event === 'banner_shown') await appsFlyerService.trackEvent('af_banner_shown', { adType, provider, placement, ...rest });
    if (event.endsWith('_failed')) await appsFlyerService.trackEvent(event, { provider, adType, errorCode, errorMessage, ...rest });
    if (event === 'screen_view') await appsFlyerService.trackEvent('af_screen_view', { screenName, ...rest });
    if (event === 'error') await appsFlyerService.trackEvent('af_error', { errorCode, errorMessage, ...rest });
    // ...другие события по необходимости
  } catch (e) { console.warn('AppsFlyer analytics error', e); }

  // Firebase
  try {
    await logGameEvent(userId, event, { adType, provider, revenue, screenName, placement, errorCode, errorMessage, ...rest });
  } catch (e) { console.warn('Firebase analytics error', e); }

  // Vercel Analytics
  try {
    trackVercel(event, adType || 'ads', provider, revenue);
  } catch (e) { console.warn('Vercel analytics error', e); }
}
