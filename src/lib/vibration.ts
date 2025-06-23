// Vibration API для мобильных устройств (Android/iOS)
export interface VibrationPattern {
  pattern: number[];
  name: string;
  description: string;
}

export const vibrationPatterns: Record<string, VibrationPattern> = {
  click: {
    pattern: [10],
    name: 'Click',
    description: 'Легкая вибрация при клике'
  },
  success: {
    pattern: [50, 50, 100],
    name: 'Success',
    description: 'Вибрация при успешной покупке'
  },
  achievement: {
    pattern: [100, 50, 100, 50, 200],
    name: 'Achievement',
    description: 'Вибрация при получении достижения'
  },
  levelUp: {
    pattern: [200, 100, 200],
    name: 'Level Up',
    description: 'Вибрация при повышении уровня'
  },
  error: {
    pattern: [300],
    name: 'Error',
    description: 'Вибрация при ошибке'
  },
  notification: {
    pattern: [50, 100, 50],
    name: 'Notification',
    description: 'Вибрация для уведомлений'
  }
};

class VibrationService {
  private isEnabled: boolean = true;
  private isSupported: boolean = false;

  constructor() {
    this.checkSupport();
    this.loadSettings();
  }

  private checkSupport(): void {
    // Проверяем поддержку Vibration API
    this.isSupported = 'vibrate' in navigator;
    
    if (!this.isSupported) {
      console.log('📳 Vibration API не поддерживается этим устройством');
    } else {
      console.log('📳 Vibration API поддерживается');
    }
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('wealth-tycoon-vibration');
    if (saved !== null) {
      this.isEnabled = JSON.parse(saved);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('wealth-tycoon-vibration', JSON.stringify(enabled));
    console.log(`📳 Вибрация ${enabled ? 'включена' : 'выключена'}`);
  }

  public isVibrationEnabled(): boolean {
    return this.isEnabled;
  }

  public isVibrationSupported(): boolean {
    return this.isSupported;
  }

  public vibrate(patternName: keyof typeof vibrationPatterns): void {
    if (!this.isEnabled || !this.isSupported) {
      return;
    }

    const pattern = vibrationPatterns[patternName];
    if (!pattern) {
      console.warn(`📳 Неизвестный паттерн вибрации: ${patternName}`);
      return;
    }

    try {
      navigator.vibrate(pattern.pattern);
      console.log(`📳 Вибрация: ${pattern.name}`);
    } catch (error) {
      console.error('📳 Ошибка вибрации:', error);
    }
  }

  public vibrateCustom(pattern: number[]): void {
    if (!this.isEnabled || !this.isSupported) {
      return;
    }

    try {
      navigator.vibrate(pattern);
      console.log(`📳 Кастомная вибрация: [${pattern.join(', ')}]`);
    } catch (error) {
      console.error('📳 Ошибка кастомной вибрации:', error);
    }
  }

  public stopVibration(): void {
    if (!this.isSupported) {
      return;
    }

    try {
      navigator.vibrate(0);
      console.log('📳 Вибрация остановлена');
    } catch (error) {
      console.error('📳 Ошибка остановки вибрации:', error);
    }
  }

  // Специальные методы для игровых событий
  public vibrateClick(): void {
    this.vibrate('click');
  }

  public vibrateSuccess(): void {
    this.vibrate('success');
  }

  public vibrateAchievement(): void {
    this.vibrate('achievement');
  }

  public vibrateLevelUp(): void {
    this.vibrate('levelUp');
  }

  public vibrateError(): void {
    this.vibrate('error');
  }

  public vibrateNotification(): void {
    this.vibrate('notification');
  }

  // Метод для тестирования вибрации
  public testVibration(): void {
    if (!this.isSupported) {
      console.warn('📳 Вибрация не поддерживается на этом устройстве');
      return;
    }

    console.log('📳 Тестирование вибрации...');
    this.vibrateCustom([100, 50, 100, 50, 100]);
  }
}

// Создаем единственный экземпляр сервиса
export const vibrationService = new VibrationService();

// Утилитарные функции для удобства
export const vibrate = (pattern: keyof typeof vibrationPatterns) => {
  vibrationService.vibrate(pattern);
};

export const vibrateCustom = (pattern: number[]) => {
  vibrationService.vibrateCustom(pattern);
};

export const setVibrationEnabled = (enabled: boolean) => {
  vibrationService.setEnabled(enabled);
};

export const isVibrationEnabled = () => {
  return vibrationService.isVibrationEnabled();
};

export const isVibrationSupported = () => {
  return vibrationService.isVibrationSupported();
};