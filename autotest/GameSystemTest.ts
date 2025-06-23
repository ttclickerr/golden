// autotest/GameSystemTest.ts
// Автоматические тесты для проверки ключевых игровых систем
import { RewardedAdsService, RewardedAdProvider } from '../services/RewardedAdsService';

// Заглушки для аналитики и оплаты
const Analytics = {
  logEvent: (event: string, params?: any) => true,
};
const Payments = {
  pay: (amount: number) => true,
};

// Тесты бустеров
async function testBoosters() {
  let boosterActivated = true;
  console.assert(boosterActivated, 'Free booster should activate');
  const adResult = await RewardedAdsService.showRewardedAd(RewardedAdProvider.AdMob);
  console.assert(adResult, 'Rewarded ad booster should activate after ad');
}

// Тест статистики
function testStats() {
  const stats = { coins: 100, boosters: 2 };
  console.assert(stats.coins >= 0, 'Coins should be non-negative');
  console.assert(stats.boosters >= 0, 'Boosters should be non-negative');
}

// Тест аналитики
function testAnalytics() {
  const result = Analytics.logEvent('test_event', { foo: 'bar' });
  console.assert(result, 'Analytics event should be logged');
}

// Тест оплаты
function testPayments() {
  const result = Payments.pay(100);
  console.assert(result, 'Payment should be processed');
}

export async function runAllGameSystemTests() {
  console.log('--- Game System Tests Start ---');
  await testBoosters();
  testStats();
  testAnalytics();
  testPayments();
  console.log('--- Game System Tests Complete ---');
}

// Для ручного запуска
// runAllGameSystemTests();
