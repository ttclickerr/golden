// Централизованный маппинг внутриигровых названий активов для трейдинга и инвестиций
// Генерируется на основе TRADING_ASSETS и ASSETS
import { TRADING_ASSETS } from "@/lib/tradingAssets";
import { ASSETS } from "@/lib/gameData";

// Собираем все id и имена из TRADING_ASSETS
const tradingAssetNames: Record<string, string> = {};
TRADING_ASSETS.forEach(asset => {
  tradingAssetNames[asset.id] = asset.name;
});

// Собираем все id и имена из ASSETS (только если их нет в TRADING_ASSETS)
ASSETS.forEach(asset => {
  if (!tradingAssetNames[asset.id]) {
    tradingAssetNames[asset.id] = asset.name;
  }
});

// Добавляем специальные ключи для совместимости с инвестициями
tradingAssetNames["btc-separate"] = tradingAssetNames["btc"] || "Bitcoin";
tradingAssetNames["eth-separate"] = tradingAssetNames["eth"] || "Ethereum";

export const assetNames: Record<string, string> = tradingAssetNames;
