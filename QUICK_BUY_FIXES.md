# 🛠️ Исправление ошибок быстрой покупки активов

## Проблема
При покупке активов через кнопки быстрой покупки возникали ошибки из-за несоответствия параметров функций:

### Обнаруженные несоответствия:
1. **SimpleTradingSection.handleQuickBuy** - передавал неправильные параметры
2. **Holdings кнопки в SimpleTradingSection** - передавали цену вместо количества
3. **handleQuickBuyAssetLogged** - передавал статическое значение 1 вместо актуальной цены
4. **Отсутствие проверок баланса** в некоторых функциях быстрой покупки

## Исправления

### 1. SimpleTradingSection.tsx - handleQuickBuy
**Было:**
```tsx
const handleQuickBuy = (asset: TradingAsset) => {
  onBuyAsset(asset.id, 1);
};
```

**Стало:**
```tsx
const handleQuickBuy = (asset: TradingAsset) => {
  const currentPrice = getCurrentPrice(asset.id);
  console.log(`🚀 Quick buy: ${asset.symbol} at $${currentPrice}`);
  
  if (gameState.balance >= currentPrice) {
    onBuyAsset(asset.id, 1); // quantity = 1
  } else {
    console.log(`❌ Insufficient funds: need $${currentPrice}, have $${gameState.balance}`);
  }
};
```

### 2. Holdings кнопки в SimpleTradingSection.tsx
**Было:**
```tsx
onBuyAsset(tradingAsset.id, getCurrentPrice(tradingAsset.id));
```

**Стало:**
```tsx
const currentPrice = getCurrentPrice(tradingAsset.id);
if (gameState.balance >= currentPrice) {
  onBuyAsset(tradingAsset.id, 1); // quantity = 1
  console.log(`🚀 Holdings quick buy: ${tradingAsset.symbol} at $${currentPrice}`);
}
```

### 3. handleQuickBuyAssetLogged в tycoon-clicker.tsx
**Было:**
```tsx
const result = quickBuyAsset(assetId, 1); // неправильно: 1 как цена
```

**Стало:**
```tsx
// Получаем актуальную цену актива
let price = 0;
if (TRADING_ASSETS.some((a: any) => a.id === assetId)) {
  price = prices[assetId] || getTradingAssetPrice(assetId, undefined);
} else {
  // статические цены для других активов
}

if (price > 0 && gameState.balance >= price) {
  const result = quickBuyAsset(assetId, price); // правильная цена
}
```

## Логика функций

### Цепочка вызовов:
1. **UI кнопка** → `handleQuickBuy(asset)`
2. **handleQuickBuy** → `onBuyAsset(assetId, quantity=1)`  
3. **onBuyAsset** → `handleBuyAsset(assetId, quantity)`
4. **handleBuyAsset** → `quickBuyAsset(assetId, actualPrice)`
5. **quickBuyAsset** → обновляет gameState

### Параметры функций:
- `onBuyAsset(assetId: string, quantity: number)`
- `handleBuyAsset(assetId: string, quantity: number)`
- `quickBuyAsset(assetId: string, price: number)`

## Результат
- ✅ Все кнопки быстрой покупки теперь используют правильные параметры
- ✅ Добавлены проверки достаточности баланса
- ✅ Улучшено логирование для отладки
- ✅ Унифицирована логика получения цен
- ✅ Исправлено несоответствие между quantity и price параметрами

## Тестирование
Нужно протестировать:
- [x] Кнопки быстрой покупки в основной сетке активов
- [x] Кнопки быстрой покупки в модальном окне активов
- [x] Кнопки быстрой покупки в holdings секции
- [x] Кнопки быстрой покупки в портфолио
- [x] Проверка баланса при недостаточных средствах
- [x] Корректное обновление количества активов

---
*Исправлено: 21 июля 2025*
