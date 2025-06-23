// Автоматический перехватчик событий для trackAllAnalytics
import { trackAllAnalytics, AnalyticsEvents } from './analytics-universal';

// Прокси для автоматического трекинга вызовов
export function createAutoAnalyticsProxy<T extends object>(target: T, eventMap: Record<string, string> = {}) {
  return new Proxy(target, {
    get(obj, prop: string, receiver) {
      const orig = obj[prop];
      if (typeof orig === 'function') {
        return function (...args: any[]) {
          // Определяем имя события
          const eventName = eventMap[prop] || prop;
          // Автоматически отправляем событие в аналитику
          trackAllAnalytics({ name: eventName, params: { args } });
          // Вызываем оригинальный метод
          return orig.apply(this, args);
        };
      }
      return Reflect.get(obj, prop, receiver);
    }
  });
}

// Пример использования:
// import { createAutoAnalyticsProxy } from './auto-analytics';
// const store = createAutoAnalyticsProxy(originalStore, { buy: AnalyticsEvents.PURCHASE, upgrade: AnalyticsEvents.UPGRADE });
// store.buy('premium'); // автоматически отправит событие PURCHASE
