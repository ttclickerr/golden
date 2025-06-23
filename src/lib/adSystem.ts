// Система управления рекламой
export interface AdConfig {
  id: string;
  name: string;
  duration: number; // в миллисекундах
  skipTime?: number; // время до появления кнопки пропуска
}

// Конфигурация рекламных роликов
export const AD_CONFIGS: AdConfig[] = [
  {
    id: 'ad1',
    name: 'Premium Investment Ad',
    duration: 15000, // 15 секунд
    skipTime: 5000   // можно пропустить через 5 секунд
  },
  {
    id: 'ad2', 
    name: 'Business Expansion Ad',
    duration: 20000, // 20 секунд
    skipTime: 8000   // можно пропустить через 8 секунд
  },
  {
    id: 'ad3',
    name: 'Crypto Trading Ad', 
    duration: 25000, // 25 секунд
    skipTime: 10000  // можно пропустить через 10 секунд
  }
];

export class AdManager {
  private currentAdIndex = 0;
  private isPlaying = false;
  
  getCurrentAd(): AdConfig {
    return AD_CONFIGS[this.currentAdIndex];
  }
  
  getNextAd(): AdConfig {
    this.currentAdIndex = (this.currentAdIndex + 1) % AD_CONFIGS.length;
    return this.getCurrentAd();
  }
  
  async playAd(onComplete: () => void, onSkip?: () => void): Promise<void> {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    const ad = this.getNextAd();
    
    return new Promise((resolve) => {
      // Запускаем "показ" рекламы
      console.log(`🎬 Показываем рекламу: ${ad.name} (${ad.duration}мс)`);
      
      const adTimer = setTimeout(() => {
        this.isPlaying = false;
        onComplete();
        resolve();
      }, ad.duration);
      
      // Возможность пропустить через skipTime
      if (ad.skipTime) {
        setTimeout(() => {
          console.log(`⏭️ Реклама можно пропустить через ${ad.skipTime}мс`);
        }, ad.skipTime);
      }
    });
  }
  
  isAdPlaying(): boolean {
    return this.isPlaying;
  }
}

export const adManager = new AdManager();