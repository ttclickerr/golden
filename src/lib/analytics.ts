import { track } from '@vercel/analytics';

// Track events using Vercel Analytics
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  track(action, {
    category,
    label,
    value
  });
};

// Tycoon-specific analytics events
export const trackInvestment = (assetType: string, amount: number) => {
  trackEvent('investment', 'game', assetType, amount);
};

export const trackLevelUp = (level: number) => {
  trackEvent('level_up', 'game', 'player_level', level);
};

export const trackPurchase = (itemType: string, cost: number) => {
  trackEvent('purchase', 'monetization', itemType, cost);
};

export const trackGameSession = (duration: number) => {
  trackEvent('session_duration', 'engagement', 'game_time', duration);
};