// ecpmAuction.ts
// Внутренний аукцион eCPM между AdMob и IronSource для rewarded рекламы

export type EcpmSource = 'admob' | 'ironsource';

export interface EcpmBid {
  sdk: EcpmSource;
  ecpm: number;
}

// Для MVP: eCPM можно брать из статистики, localStorage или задавать вручную/рандомно
export function getEcpmBids(): EcpmBid[] {
  // TODO: заменить на реальные данные из SDK/аналитики
  const admobEcpm = Number(localStorage.getItem('admob_ecpm')) || Math.random() * 5 + 2; // $2-7
  const ironsourceEcpm = Number(localStorage.getItem('ironsource_ecpm')) || Math.random() * 5 + 2;
  return [
    { sdk: 'admob', ecpm: admobEcpm },
    { sdk: 'ironsource', ecpm: ironsourceEcpm },
  ];
}

export function runEcpmAuction(): EcpmSource {
  const bids = getEcpmBids();
  bids.sort((a, b) => b.ecpm - a.ecpm);
  return bids[0].sdk;
}
