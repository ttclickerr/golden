// Purchase Restoration System for Google Play and App Store
import { apiRequest } from "./queryClient";
import { trackAnalyticsEvent } from './trackAnalyticsEvent';

export interface PurchaseRecord {
  transactionId: string;
  productId: string;
  purchaseDate: number;
  expiryDate?: number;
  platform: 'googleplay' | 'appstore' | 'web';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  isSubscription: boolean;
}

export interface RestoreResult {
  success: boolean;
  purchases: PurchaseRecord[];
  premiumStatus: {
    hasLifetime: boolean;
    hasActiveSubscription: boolean;
    expiryDate?: number;
  };
  message: string;
}

class PurchaseRestorationService {
  private isRestoring = false;

  async restorePurchases(): Promise<RestoreResult> {
    if (this.isRestoring) {
      throw new Error('Purchase restoration already in progress');
    }

    this.isRestoring = true;

    try {
      // Check if we're running in a mobile environment
      const isMobile = this.detectMobileEnvironment();
      
      if (isMobile.isAndroid) {
        const result = await this.restoreGooglePlayPurchases();
        if (result.success) trackAnalyticsEvent({ event: 'purchase_restored', provider: 'googleplay' });
        else trackAnalyticsEvent({ event: 'purchase_failed', provider: 'googleplay', errorMessage: result.message });
        return result;
      } else if (isMobile.isIOS) {
        const result = await this.restoreAppStorePurchases();
        if (result.success) trackAnalyticsEvent({ event: 'purchase_restored', provider: 'appstore' });
        else trackAnalyticsEvent({ event: 'purchase_failed', provider: 'appstore', errorMessage: result.message });
        return result;
      } else {
        const result = await this.restoreWebPurchases();
        if (result.success) trackAnalyticsEvent({ event: 'purchase_restored', provider: 'web' });
        else trackAnalyticsEvent({ event: 'purchase_failed', provider: 'web', errorMessage: result.message });
        return result;
      }
    } finally {
      this.isRestoring = false;
    }
  }

  private detectMobileEnvironment() {
    const userAgent = navigator.userAgent.toLowerCase();
    return {
      isAndroid: userAgent.includes('android') || (window as any).Android,
      isIOS: /iphone|ipad|ipod/.test(userAgent) || (window as any).webkit?.messageHandlers,
      isWeb: !userAgent.includes('android') && !/iphone|ipad|ipod/.test(userAgent)
    };
  }

  private async restoreGooglePlayPurchases(): Promise<RestoreResult> {
    console.log('🟢 Restoring Google Play purchases...');
    
    try {
      // Check if Google Play Billing is available
      if (!(window as any).googlePlayBilling) {
        console.warn('Google Play Billing not available, using fallback');
        return await this.restoreWebPurchases();
      }

      // Query purchase history from Google Play
      const result = await apiRequest('POST', '/api/restore-googleplay-purchases', {
        packageName: import.meta.env.VITE_GOOGLE_PACKAGE_NAME || 'com.wealthtycoon.game'
      });

      const data = await result.json();
      
      return {
        success: true,
        purchases: data.purchases || [],
        premiumStatus: data.premiumStatus || { hasLifetime: false, hasActiveSubscription: false },
        message: data.message || 'Google Play purchases restored successfully'
      };
    } catch (error) {
      console.error('Google Play restoration failed:', error);
      return {
        success: false,
        purchases: [],
        premiumStatus: { hasLifetime: false, hasActiveSubscription: false },
        message: 'Failed to restore Google Play purchases'
      };
    }
  }

  private async restoreAppStorePurchases(): Promise<RestoreResult> {
    console.log('🍎 Restoring App Store purchases...');
    
    try {
      // Check if StoreKit is available
      if (!(window as any).webkit?.messageHandlers?.storeKit) {
        console.warn('StoreKit not available, using fallback');
        return await this.restoreWebPurchases();
      }

      // Query purchase history from App Store
      const result = await apiRequest('POST', '/api/restore-appstore-purchases', {
        bundleId: import.meta.env.VITE_IOS_BUNDLE_ID || 'com.wealthtycoon.game'
      });

      const data = await result.json();
      
      return {
        success: true,
        purchases: data.purchases || [],
        premiumStatus: data.premiumStatus || { hasLifetime: false, hasActiveSubscription: false },
        message: data.message || 'App Store purchases restored successfully'
      };
    } catch (error) {
      console.error('App Store restoration failed:', error);
      return {
        success: false,
        purchases: [],
        premiumStatus: { hasLifetime: false, hasActiveSubscription: false },
        message: 'Failed to restore App Store purchases'
      };
    }
  }

  private async restoreWebPurchases(): Promise<RestoreResult> {
    console.log('🌐 Restoring web purchases...');
    
    try {
      // Check local storage and server for web purchases
      const localPremium = localStorage.getItem('premium-status') === 'true';
      const localPurchases = JSON.parse(localStorage.getItem('purchase-history') || '[]');
      
      // Verify with server
      const result = await apiRequest('POST', '/api/restore-web-purchases', {
        localPurchases,
        userId: localStorage.getItem('user-id')
      });

      const data = await result.json();
      
      const hasValidPurchases = localPremium || data.purchases?.length > 0;
      
      return {
        success: true,
        purchases: data.purchases || localPurchases,
        premiumStatus: {
          hasLifetime: hasValidPurchases,
          hasActiveSubscription: false
        },
        message: hasValidPurchases 
          ? 'Premium features restored successfully'
          : 'No previous purchases found'
      };
    } catch (error) {
      console.error('Web restoration failed:', error);
      return {
        success: false,
        purchases: [],
        premiumStatus: { hasLifetime: false, hasActiveSubscription: false },
        message: 'Failed to restore purchases'
      };
    }
  }

  // Validate subscription status
  validateSubscription(purchase: PurchaseRecord): boolean {
    if (!purchase.isSubscription) return true;
    
    const now = Date.now();
    return purchase.expiryDate ? purchase.expiryDate > now : false;
  }

  // Get premium status from purchases
  getPremiumStatus(purchases: PurchaseRecord[]) {
    const activePurchases = purchases.filter(p => 
      p.status === 'active' && 
      (!p.isSubscription || this.validateSubscription(p))
    );

    const hasLifetime = activePurchases.some(p => 
      p.productId === 'premium_forever' && !p.isSubscription
    );

    const activeSubscription = activePurchases.find(p => 
      p.productId === 'premium_monthly' && p.isSubscription
    );

    return {
      hasLifetime,
      hasActiveSubscription: !!activeSubscription,
      expiryDate: activeSubscription?.expiryDate
    };
  }
}

export const purchaseRestorationService = new PurchaseRestorationService();