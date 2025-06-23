
/**
 * Сервис для интеграции с Adjust SDK
 */

export enum AdjustEvent {
  APP_OPEN = 'app_open',
  LEVEL_ACHIEVED = 'level_achieved', 
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  PURCHASE_MADE = 'purchase_made',
  AD_WATCHED = 'ad_watched',
  REAL_ESTATE_PURCHASED = 'real_estate_purchased',
  BUILDING_PURCHASED = 'building_purchased',
  UPGRADE_PURCHASED = 'upgrade_purchased',
  GAME_SESSION_START = 'game_session_start',
  GAME_SESSION_END = 'game_session_end',
  TUTORIAL_COMPLETED = 'tutorial_completed',
  FIRST_INVESTMENT = 'first_investment'
}

interface AdjustConfig {
  appToken: string;
  environment: 'sandbox' | 'production';
  logLevel: 'verbose' | 'debug' | 'info' | 'warn' | 'error' | 'assert' | 'suppress';
  eventTokens: Record<AdjustEvent, string>;
}

class AdjustService {
  private isInitialized: boolean = false;
  private config: AdjustConfig;
  
  constructor() {
    this.config = {
      // Токен приложения Adjust (получается из dashboard)
      appToken: process.env.REACT_APP_ADJUST_APP_TOKEN || 'YOUR_ADJUST_APP_TOKEN',
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'verbose',
      
      // Токены событий (настраиваются в Adjust dashboard)
      eventTokens: {
        [AdjustEvent.APP_OPEN]: process.env.REACT_APP_ADJUST_APP_OPEN || 'abc123',
        [AdjustEvent.LEVEL_ACHIEVED]: process.env.REACT_APP_ADJUST_LEVEL_ACHIEVED || 'def456',
        [AdjustEvent.ACHIEVEMENT_UNLOCKED]: process.env.REACT_APP_ADJUST_ACHIEVEMENT || 'ghi789',
        [AdjustEvent.PURCHASE_MADE]: process.env.REACT_APP_ADJUST_PURCHASE || 'jkl012',
        [AdjustEvent.AD_WATCHED]: process.env.REACT_APP_ADJUST_AD_WATCHED || 'mno345',
        [AdjustEvent.REAL_ESTATE_PURCHASED]: process.env.REACT_APP_ADJUST_REAL_ESTATE || 'pqr678',
        [AdjustEvent.BUILDING_PURCHASED]: process.env.REACT_APP_ADJUST_BUILDING || 'stu901',
        [AdjustEvent.UPGRADE_PURCHASED]: process.env.REACT_APP_ADJUST_UPGRADE || 'vwx234',
        [AdjustEvent.GAME_SESSION_START]: process.env.REACT_APP_ADJUST_SESSION_START || 'yzab12',
        [AdjustEvent.GAME_SESSION_END]: process.env.REACT_APP_ADJUST_SESSION_END || 'cdef34',
        [AdjustEvent.TUTORIAL_COMPLETED]: process.env.REACT_APP_ADJUST_TUTORIAL || 'ghij56',
        [AdjustEvent.FIRST_INVESTMENT]: process.env.REACT_APP_ADJUST_FIRST_INVEST || 'klmn78'
      }
    };
  }

  /**
   * Инициализация Adjust SDK
   */
  initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve(true);
        return;
      }

      console.log('🎯 Инициализация Adjust SDK');

      // Проверяем наличие Adjust SDK в window
      if (typeof window !== 'undefined' && (window as any).Adjust) {
        const adjustConfig = new (window as any).AdjustConfig(
          this.config.appToken,
          this.config.environment
        );

        adjustConfig.setLogLevel(this.config.logLevel);
        
        // Настройка коллбэков
        adjustConfig.setAttributionCallback((attribution: any) => {
          console.log('🎯 Adjust Attribution:', attribution);
        });

        adjustConfig.setEventSuccessCallback((eventSuccess: any) => {
          console.log('🎯 Adjust Event Success:', eventSuccess);
        });

        adjustConfig.setEventFailureCallback((eventFailure: any) => {
          console.log('🎯 Adjust Event Failure:', eventFailure);
        });

        // Инициализация
        (window as any).Adjust.initSdk(adjustConfig);
        this.isInitialized = true;
        
        console.log('✅ Adjust SDK инициализирован');
        resolve(true);
      } else {
        // Если SDK не загружен, используем заглушку для разработки
        console.log('⚠️ Adjust SDK не найден, используем заглушку');
        this.isInitialized = true;
        resolve(true);
      }
    });
  }

  /**
   * Отслеживание события
   */
  trackEvent(eventName: AdjustEvent, parameters?: Record<string, any>, revenue?: number): void {
    if (!this.isInitialized) {
      console.warn('⚠️ Adjust SDK не инициализирован');
      return;
    }

    const eventToken = this.config.eventTokens[eventName];
    if (!eventToken) {
      console.warn(`⚠️ Токен события не найден для: ${eventName}`);
      return;
    }

    console.log(`🎯 Отслеживание события: ${eventName}`, parameters);

    if (typeof window !== 'undefined' && (window as any).Adjust) {
      const adjustEvent = new (window as any).AdjustEvent(eventToken);

      // Добавляем параметры
      if (parameters) {
        Object.entries(parameters).forEach(([key, value]) => {
          adjustEvent.addCallbackParameter(key, String(value));
        });
      }

      // Добавляем доход если указан
      if (revenue && revenue > 0) {
        adjustEvent.setRevenue(revenue, 'USD');
      }

      (window as any).Adjust.trackEvent(adjustEvent);
    } else {
      // Заглушка для разработки
      console.log(`📊 [Mock] Adjust Event: ${eventName}`, { parameters, revenue });
    }
  }

  /**
   * Отслеживание дохода от рекламы
   */
  trackAdRevenue(source: string, revenue: number, currency: string = 'USD'): void {
    if (!this.isInitialized) return;

    console.log(`💰 Отслеживание дохода от рекламы: ${source} - ${revenue} ${currency}`);

    if (typeof window !== 'undefined' && (window as any).Adjust) {
      const adRevenue = new (window as any).AdjustAdRevenue(source);
      adRevenue.setRevenue(revenue, currency);
      (window as any).Adjust.trackAdRevenue(adRevenue);
    } else {
      console.log(`📊 [Mock] Ad Revenue: ${source} - ${revenue} ${currency}`);
    }
  }

  /**
   * Получение токена устройства для атрибуции
   */
  getAdid(): Promise<string | null> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Adjust) {
        (window as any).Adjust.getAdid((adid: string) => {
          resolve(adid);
        });
      } else {
        resolve(null);
      }
    });
  }
}

// Экспорт синглтона
export const adjustService = new AdjustService();
