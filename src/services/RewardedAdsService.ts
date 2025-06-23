// RewardedAdsService.ts
// Сервис для показа rewarded рекламы AdMob и IronSource

// Импорт SDK (заглушки, заменить на реальные импорты в зависимости от платформы)
import { adMobService } from './admob-universal';
import { ironSourceService } from './ironsource-universal';

export enum RewardedAdProvider {
  AdMob = 'admob',
  IronSource = 'ironsource',
}

export class RewardedAdsService {
  static async showRewardedAd(provider: RewardedAdProvider): Promise<boolean> {
    console.log('[RewardedAdsService] showRewardedAd called with provider:', provider);
    switch (provider) {
      case RewardedAdProvider.AdMob:
        console.log('[RewardedAdsService] Запуск показа AdMob rewarded ad');
        return await RewardedAdsService.showAdMobRewarded();
      case RewardedAdProvider.IronSource:
        console.log('[RewardedAdsService] Запуск показа IronSource rewarded ad');
        return await RewardedAdsService.showIronSourceRewarded();
      default:
        console.warn('[RewardedAdsService] Неизвестный провайдер:', provider);
        return false;
    }
  }

  private static async showAdMobRewarded(): Promise<boolean> {
    console.log('[RewardedAdsService] showAdMobRewarded вызван');
    // Используем универсальный сервис для показа rewarded рекламы
    try {
      const result = await adMobService.showRewarded();
      if (result.success) {
        console.log('[RewardedAdsService] AdMob rewarded ad просмотрена (SDK success)');
        return true;
      } else {
        console.log('[RewardedAdsService] AdMob rewarded ad не просмотрена (SDK fail)');
        return false;
      }
    } catch (e) {
      console.error('[RewardedAdsService] Ошибка показа AdMob rewarded ad:', e);
      return false;
    }
  }

  private static async showIronSourceRewarded(): Promise<boolean> {
    console.log('[RewardedAdsService] showIronSourceRewarded вызван');
    try {
      const result = await ironSourceService.showRewarded();
      if (result.success) {
        console.log('[RewardedAdsService] IronSource rewarded ad просмотрена (SDK success)');
        return true;
      } else {
        console.log('[RewardedAdsService] IronSource rewarded ad не просмотрена (SDK fail)');
        return false;
      }
    } catch (e) {
      console.error('[RewardedAdsService] Ошибка показа IronSource rewarded ad:', e);
      return false;
    }
  }
}
