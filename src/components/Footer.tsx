import { useEffect, useState, useRef } from "react";
import { AdMobBanner } from "./AdMobBanner";
import { IronSourceBanner } from "./IronSourceBanner";
import { trackAnalyticsEvent } from '../lib/trackAnalyticsEvent';

// Расширяем window для поддержки bridge-плагинов
declare global {
  interface Window {    admob: any;
    IronSource: any;
  }
}

function isBridgeAvailable() {
  return (
    (typeof window !== 'undefined' && window.admob && window.admob.banner) ||
    (typeof window !== 'undefined' && window.IronSource && window.IronSource.showBanner)
  );
}

async function showNativeBanner(network: 'admob' | 'ironsource') {
  if (network === 'admob' && window.admob?.banner?.show) {
    await window.admob.banner.show({
      adUnitId: import.meta.env.VITE_ADMOB_BANNER_ID,
      position: 'bottom',
    });
    // Логируем показ баннера во все системы аналитики
    const userId = localStorage.getItem('user_id') || 'anonymous';
    await trackAnalyticsEvent({ event: 'banner_shown', adType: 'banner', provider: 'admob', userId });
  } else if (network === 'ironsource' && window.IronSource?.showBanner) {
    await window.IronSource.showBanner({
      placementId: import.meta.env.VITE_IRONSOURCE_BANNER_ID,
      position: 'bottom',
    });
    // Логируем показ баннера во все системы аналитики
    const userId = localStorage.getItem('user_id') || 'anonymous';
    await trackAnalyticsEvent({ event: 'banner_shown', adType: 'banner', provider: 'ironsource', userId });
  }
}

export function Footer() {
  const [bestNetwork, setBestNetwork] = useState<'admob' | 'ironsource' | null>(null);
  const [isNative, setIsNative] = useState(false);
  const lastLoadedRef = useRef<'admob' | 'ironsource' | null>(null);

  useEffect(() => {
    const native = isBridgeAvailable();
    setIsNative(native);

    const getEcpm = async (network: 'admob' | 'ironsource') => {
      if (native) {
        if (network === 'admob' && window.admob?.getEcpm) {
          return await window.admob.getEcpm();
        }
        if (network === 'ironsource' && window.IronSource?.getBannerEcpm) {
          return await window.IronSource.getBannerEcpm();
        }
      }
      return network === 'admob' ? 1.2 : 2.0;
    };

    Promise.all([getEcpm('admob'), getEcpm('ironsource')]).then(([admobEcpm, ironsourceEcpm]) => {
      const selected = admobEcpm >= ironsourceEcpm ? 'admob' : 'ironsource';
      setBestNetwork(selected);
      lastLoadedRef.current = selected;
      if (native) {
        showNativeBanner(selected);
      }
    }).catch(() => {
      // В случае ошибки используем последний успешно загруженный
      if (lastLoadedRef.current) {
        setBestNetwork(lastLoadedRef.current);
        if (native) {
          showNativeBanner(lastLoadedRef.current);
        }
      }
    });

    return () => {
      if (native && window.admob?.banner?.hide) window.admob.banner.hide();
      if (native && window.IronSource?.hideBanner) window.IronSource.hideBanner();
    };
  }, []);

  if (!bestNetwork && lastLoadedRef.current) {
    // Показываем последний успешно загруженный баннер
    return (
      <footer className="w-full fixed bottom-0 left-0 z-50">
        {lastLoadedRef.current === 'admob' ? <AdMobBanner adType="banner" /> : <IronSourceBanner />}
      </footer>
    );
  }

  if (!bestNetwork) return null;
  if (isNative) return null;

  return (
    <footer className="w-full fixed bottom-0 left-0 z-50">
      {bestNetwork === 'admob' ? <AdMobBanner adType="banner" /> : <IronSourceBanner />}
    </footer>
  );
}