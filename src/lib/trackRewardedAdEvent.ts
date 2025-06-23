// trackRewardedAdEvent.ts
// Универсальная отправка событий rewarded рекламы во все системы аналитики

import { appMetricaService } from './appmetrica';
import { appsFlyerService } from './appsflyer';
import { logGameEvent } from './firebase';
import { trackEvent as trackVercel } from './analytics';

export interface RewardedAdAnalyticsParams {
  provider: string; // 'admob' | 'ironsource' | ...
  revenue: number;
  userId: string;
}

export async function trackRewardedAdEvent({ provider, revenue, userId }: RewardedAdAnalyticsParams) {
  console.log('[trackRewardedAdEvent] Отправка аналитики для rewarded ad', { provider, revenue, userId });
  // AppMetrica
  try {
    console.log('[trackRewardedAdEvent] AppMetrica: trackAdView, trackAdRevenue');
    await appMetricaService.trackAdView('rewarded', revenue);
    await appMetricaService.trackAdRevenue('rewarded', revenue, provider);
  } catch (e) { console.warn('AppMetrica analytics error', e); }

  // AppsFlyer
  try {
    console.log('[trackRewardedAdEvent] AppsFlyer: trackAdView, trackAdRevenue');
    await appsFlyerService.trackAdView('rewarded', revenue);
    await appsFlyerService.trackAdRevenue('rewarded', revenue, provider);
  } catch (e) { console.warn('AppsFlyer analytics error', e); }

  // Firebase
  try {
    console.log('[trackRewardedAdEvent] Firebase: logGameEvent ad_view, ad_revenue');
    await logGameEvent(userId, 'ad_view', { provider });
    await logGameEvent(userId, 'ad_revenue', { provider, revenue });
  } catch (e) { console.warn('Firebase analytics error', e); }

  // Vercel Analytics
  try {
    console.log('[trackRewardedAdEvent] Vercel: trackVercel rewarded_ad');
    trackVercel('rewarded_ad', 'ads', provider, revenue);
  } catch (e) { console.warn('Vercel analytics error', e); }
}
