// Универсальный сервис In-App Purchase для Android/iOS/Web
import { trackAllAnalytics, AnalyticsEvents } from '../lib/analytics-universal';

export type PremiumType = 'weekly' | 'lifetime';

export class InAppPurchaseService {
  async purchasePremium(type: PremiumType): Promise<{ success: boolean; expiry?: number | 'lifetime' }> {
    // Мобильные платформы: используем bridge
    if (typeof window !== 'undefined' && (window as any).InAppPurchase) {
      try {
        const result = await (window as any).InAppPurchase.buyPremium(type);
        if (result.success) {
          this.savePremiumToStorage(type);
          trackAllAnalytics({ name: AnalyticsEvents.PREMIUM_PURCHASED, params: { type } });
          return { success: true, expiry: result.expiry || (type === 'weekly' ? Date.now() + 7*24*60*60*1000 : 'lifetime') };
        }
        return { success: false };
      } catch (e) {
        trackAllAnalytics({ name: AnalyticsEvents.ERROR, params: { error: String(e), context: 'purchasePremium' } });
        return { success: false };
      }
    }
    // Web fallback (тест)
    this.savePremiumToStorage(type);
    trackAllAnalytics({ name: AnalyticsEvents.PREMIUM_PURCHASED, params: { type, test: true } });
    return { success: true, expiry: type === 'weekly' ? Date.now() + 7*24*60*60*1000 : 'lifetime' };
  }

  savePremiumToStorage(type: PremiumType) {
    localStorage.setItem('premium-status', 'true');
    localStorage.setItem('premium-type', type);
    if (type === 'weekly') {
      const expiry = Date.now() + 7*24*60*60*1000;
      localStorage.setItem('premium-expiry', expiry.toString());
    } else {
      localStorage.setItem('premium-expiry', 'lifetime');
    }
    window.dispatchEvent(new CustomEvent('premiumStatusChanged'));
  }
}

export const inAppPurchaseService = new InAppPurchaseService();
