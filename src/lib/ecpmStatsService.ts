// ecpmStatsService.ts
// Сервис для сбора eCPM из разных SDK аналитики и статистики

import { appMetricaService } from './appmetrica';
import { appsFlyerService } from './appsflyer';
import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { trackEvent as trackVercel } from './analytics';

// --- Реальные вызовы к SDK/API ---
async function getAppMetricaEcpm(): Promise<number|null> {
  // Пример: вычисление eCPM по событиям ad_view и ad_revenue из localStorage
  try {
    const adViews = Number(localStorage.getItem('appmetrica_ad_views')) || 0;
    const adRevenue = Number(localStorage.getItem('appmetrica_ad_revenue')) || 0;
    if (adViews > 0) {
      return (adRevenue / adViews) * 1000;
    }
    return null;
  } catch {
    return null;
  }
}

async function getAppsFlyerEcpm(): Promise<number|null> {
  // Пример: вычисление eCPM по событиям af_ad_view и af_ad_revenue из localStorage
  try {
    const adViews = Number(localStorage.getItem('appsflyer_ad_views')) || 0;
    const adRevenue = Number(localStorage.getItem('appsflyer_ad_revenue')) || 0;
    if (adViews > 0) {
      return (adRevenue / adViews) * 1000;
    }
    return null;
  } catch {
    return null;
  }
}

async function getFirebaseEcpm(): Promise<number|null> {
  // Пример: вычисление eCPM по событиям ad_view и ad_revenue из Firestore
  try {
    if (!db) return null;
    const q = query(collection(db, 'gameEvents'), where('eventType', 'in', ['ad_view', 'ad_revenue']));
    const snapshot = await getDocs(q);
    let views = 0;
    let revenue = 0;
    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.eventType === 'ad_view') views++;
      if (d.eventType === 'ad_revenue' && typeof d.eventData?.revenue === 'number') revenue += d.eventData.revenue;
    });
    if (views > 0) {
      return (revenue / views) * 1000;
    }
    return null;
  } catch {
    return null;
  }
}

async function getVercelAnalyticsEcpm(): Promise<number|null> {
  // TODO: реализовать fetch к API, если eCPM туда отправляется
  return null;
}

// --- Отправка eCPM в backend для истории ---
async function saveEcpmToBackend(sdk: string, value: number, source: string) {
  try {
    await fetch('http://localhost:3001/api/ecpm-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sdk, value, source })
    });
  } catch {}
}

export async function updateEcpmStats() {
  const [appmetrica, firebase, appsflyer, vercel] = await Promise.all([
    getAppMetricaEcpm(),
    getFirebaseEcpm(),
    getAppsFlyerEcpm(),
    getVercelAnalyticsEcpm(),
  ]);
  const admobEcpm = Math.max(appmetrica||0, firebase||0, vercel||0);
  const ironsourceEcpm = Math.max(appsflyer||0, appmetrica||0);
  localStorage.setItem('admob_ecpm', String(admobEcpm));
  localStorage.setItem('ironsource_ecpm', String(ironsourceEcpm));
  // Сохраняем историю в backend
  await saveEcpmToBackend('admob', admobEcpm, appmetrica ? 'AppMetrica' : firebase ? 'Firebase' : 'Vercel');
  await saveEcpmToBackend('ironsource', ironsourceEcpm, appsflyer ? 'AppsFlyer' : 'AppMetrica');
  return { admobEcpm, ironsourceEcpm };
}
