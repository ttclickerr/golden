import { RewardedAdsService, RewardedAdProvider } from '../services/RewardedAdsService';
import React, { useState } from 'react';
import { runEcpmAuction } from '../lib/ecpmAuction';
import { updateEcpmStats } from '../lib/ecpmStatsService';
import { logGameEvent } from '../lib/firebase';
import { trackRewardedAdEvent } from '../lib/trackRewardedAdEvent';
import { useAuth } from '@/hooks/useAuth';

const initialBoosters = [
  { id: 1, name: 'Mega Multiplier', isFree: true },
  { id: 2, name: 'Golden Touch', isFree: false },
  { id: 3, name: 'Time Warp', isFree: false },
  { id: 4, name: 'Reset All Boosters', isFree: false },
];

const BoosterList = () => {
  const { user } = useAuth();
  const [adLoading, setAdLoading] = useState(false);
  const [boosters, setBoosters] = useState(initialBoosters);
  const [availableBoosters, setAvailableBoosters] = useState(1); // 1 по умолчанию
  const [lastAuction, setLastAuction] = useState<{winner: string, admob: number, ironsource: number}|null>(null);

  const handleActivateBooster = async (booster: any) => {
    console.log('[BoosterList] handleActivateBooster called for booster:', booster);
    // Перед аукционом обновляем eCPM из аналитики
    const { admobEcpm, ironsourceEcpm } = await updateEcpmStats();
    console.log('[BoosterList] eCPM stats:', { admobEcpm, ironsourceEcpm });
    // Выбираем победителя аукциона
    const winner = runEcpmAuction();
    console.log('[BoosterList] Аукцион eCPM победитель:', winner);
    setLastAuction({ winner, admob: admobEcpm, ironsource: ironsourceEcpm });
    // Аукцион eCPM для rewarded рекламы
    if (booster.isFree) {
      setAvailableBoosters((prev) => prev - 1);
      console.log('[BoosterList] Free booster активирован');
      // ...логика активации бустера...
    } else {
      setAdLoading(true);
      const provider = winner === 'admob' ? RewardedAdProvider.AdMob : RewardedAdProvider.IronSource;
      const userId = user?.uid || 'anonymous';
      // Логируем показ рекламы
      logGameEvent(userId, 'rewarded_shown', { provider, boosterId: booster.id });
      let result = false;
      try {
        result = await RewardedAdsService.showRewardedAd(provider);
      } catch (e) {
        result = false;
      }
      setAdLoading(false);
      if (result) {
        setAvailableBoosters((prev) => prev + 1);
        // ...логика активации бустера...
        logGameEvent(userId, 'rewarded_completed', { provider, boosterId: booster.id });
        // --- Универсальная отправка событий во все системы аналитики ---
        const revenue = 0.01 + Math.random() * 0.04; // $0.01-$0.05 (эмуляция)
        await trackRewardedAdEvent({ provider, revenue, userId });
      } else {
        logGameEvent(userId, 'rewarded_failed', { provider, boosterId: booster.id });
      }
    }
  };

  return (
    <div>
      {/* Верхняя панель с количеством бустеров */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
        <span>Boosters: {availableBoosters}</span>
        <button>History</button>
        <button>Settings</button>
      </div>
      {lastAuction && (
        <div style={{margin:'12px 0',padding:'8px 16px',background:'#232b4a',borderRadius:8,color:'#fff',fontSize:15}}>
          <b>Аукцион eCPM:</b> AdMob: <span style={{color:'#facc15'}}>${lastAuction.admob.toFixed(2)}</span>, IronSource: <span style={{color:'#38bdf8'}}>${lastAuction.ironsource.toFixed(2)}</span> — <b>Победитель:</b> <span style={{color:lastAuction.winner==='admob'?'#facc15':'#38bdf8'}}>{lastAuction.winner.toUpperCase()}</span>
        </div>
      )}
      {/* Список бустеров */}
      {boosters.map((booster) => (
        <div key={booster.id}>
          <span>{booster.name}</span>
          <button
            onClick={() => handleActivateBooster(booster)}
            disabled={adLoading || (booster.isFree ? availableBoosters <= 0 : false)}
          >
            {booster.isFree ? 'Activate' : 'Watch'}
          </button>
        </div>
      ))}
      {adLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 32,
        }}>
          Реклама...
        </div>
      )}
    </div>
  );
};

export default BoosterList;