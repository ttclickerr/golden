// International translation system for Tycoon Clicker
export type Language = 
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko'
  | 'ar' | 'hi' | 'tr' | 'pl' | 'nl' | 'sv' | 'da' | 'no' | 'fi' | 'cs'
  | 'hu' | 'ro' | 'bg' | 'hr' | 'sk' | 'sl' | 'et' | 'lv' | 'lt' | 'uk'
  | 'he' | 'th' | 'vi' | 'id' | 'ms' | 'tl';

export interface Translations {
  // Game header
  tycoonClicker: string;
  balance: string;
  income: string;
  clickRate: string;
  premium: string;
  
  // Click button
  click: string;
  
  // Navigation tabs
  boosters: string;
  rewards: string;
  store: string;
  
  // Premium store
  premiumStore: string;
  premiumStoreDesc: string;
  shop: string;
  
  // Achievements
  recentAchievements: string;
  firstSteps: string;
  firstStepsDesc: string;
  completed: string;
  
  // AdMob
  adMobAd: string;
  adMobDesc: string;
  watch: string;
  
  // Navigation bottom
  home: string;
  trading: string;
  business: string;
  casino: string;
  portfolio: string;
  
  // Common
  level: string;
  perSec: string;
  perClick: string;
  day: string;
  
  // Ad system
  advertisementTitle: string;
  supportGameDesc: string;
  playingAd: string;
  autoCloseIn: string;
  seconds: string;
  boosterActivation: string;
  watchAdToActivate: string;
  
  // Boosters
  clickBooster: string;
  incomeBooster: string;
  moneyBooster: string;
  doubleClick: string;
  passiveIncome: string;
  instantMoney: string;
  duration: string;
  multiplier: string;
  reward: string;
  
  // Store categories
  currency: string;
  premiumFeatures: string;
  removeAds: string;
  unlockFeatures: string;
  
  // Notifications
  adReward: string;
  boosterActivated: string;
  achievementUnlocked: string;
  
  // Time units
  minutes: string;
  hours: string;
  
  // Settings
  settings: string;
  language: string;
  privacy: string;
  consent: string;
  
  // Investment assets
  cocaCola: string;
  cornerStore: string;
  
  // Errors
  adError: string;
  loadingError: string;
  
  // Store items
  cooldownReset: string;
}

export const translations = {
  en: {
    tycoonClicker: "Tycoon Clicker",
    balance: "Balance",
    income: "Income",
    clickRate: "Click Rate",
    premium: "Premium",
    click: "CLICK",
    boosters: "BOOSTERS",
    rewards: "REWARDS", 
    store: "STORE",
    premiumStore: "PREMIUM STORE",
    premiumStoreDesc: "Buy currency, boosters and premium features!",
    shop: "SHOP",
    recentAchievements: "Recent Achievements",
    firstSteps: "First Steps",
    firstStepsDesc: "Earn your first $10",
    completed: "COMPLETED",
    adMobAd: "AdMob Advertisement",
    adMobDesc: "Earn up to $600 for watching!",
    watch: "Watch",
    home: "Home",
    trading: "Trading",
    business: "Business",
    casino: "Casino",
    portfolio: "Portfolio",
    level: "LVL",
    perSec: "/sec",
    perClick: "/click",
    day: "day",
    advertisementTitle: "Advertisement",
    supportGameDesc: "Support the game by watching an ad and get a reward!",
    playingAd: "Playing advertisement...",
    autoCloseIn: "Auto-close in",
    seconds: "seconds",
    boosterActivation: "Booster Activation",
    watchAdToActivate: "Watch an ad to activate the booster!",
    clickBooster: "Click Booster",
    incomeBooster: "Income Booster", 
    moneyBooster: "Money Booster",
    doubleClick: "Double Click",
    passiveIncome: "Passive Income",
    instantMoney: "Instant Money",
    duration: "Duration",
    multiplier: "Multiplier",
    reward: "Reward",
    currency: "Currency",
    premiumFeatures: "Premium Features",
    removeAds: "Remove all ads",
    unlockFeatures: "Unlock exclusive features",
    adReward: "Ad Reward",
    boosterActivated: "Booster Activated",
    achievementUnlocked: "Achievement Unlocked",
    minutes: "min",
    hours: "h",
    settings: "Settings",
    language: "Language",
    privacy: "Privacy",
    consent: "Consent",
    cocaCola: "Coca-Cola",
    cornerStore: "Corner Store",
    adError: "Ad loading error",
    loadingError: "Loading error",
    cooldownReset: "Cooldown Reset"
  },
  
  es: {
    tycoonClicker: "Magnate Clicker",
    balance: "Saldo",
    income: "Ingresos",
    clickRate: "Tasa de Clic",
    premium: "Premium",
    click: "CLIC",
    boosters: "IMPULSORES",
    rewards: "RECOMPENSAS",
    store: "TIENDA",
    premiumStore: "TIENDA PREMIUM",
    premiumStoreDesc: "¡Compra moneda, impulsores y funciones premium!",
    shop: "TIENDA",
    recentAchievements: "Logros Recientes",
    firstSteps: "Primeros Pasos",
    firstStepsDesc: "Gana tus primeros $10",
    completed: "COMPLETADO",
    adMobAd: "Anuncio AdMob",
    adMobDesc: "¡Gana hasta $600 por ver!",
    watch: "Ver",
    home: "Inicio",
    trading: "Trading",
    business: "Negocio",
    casino: "Casino",
    portfolio: "Cartera",
    level: "NIV",
    perSec: "/seg",
    perClick: "/clic",
    day: "día",
    advertisementTitle: "Anuncio",
    supportGameDesc: "¡Apoya el juego viendo un anuncio y obtén una recompensa!",
    playingAd: "Reproduciendo anuncio...",
    autoCloseIn: "Cierre automático en",
    seconds: "segundos",
    boosterActivation: "Activación de Impulsor",
    watchAdToActivate: "¡Ve un anuncio para activar el impulsor!",
    clickBooster: "Impulsor de Clic",
    incomeBooster: "Impulsor de Ingresos",
    moneyBooster: "Impulsor de Dinero",
    doubleClick: "Doble Clic",
    passiveIncome: "Ingresos Pasivos",
    instantMoney: "Dinero Instantáneo",
    duration: "Duración",
    multiplier: "Multiplicador",
    reward: "Recompensa",
    currency: "Moneda",
    premiumFeatures: "Funciones Premium",
    removeAds: "Eliminar todos los anuncios",
    unlockFeatures: "Desbloquear funciones exclusivas",
    adReward: "Recompensa del Anuncio",
    boosterActivated: "Impulsor Activado",
    achievementUnlocked: "Logro Desbloqueado",
    minutes: "min",
    hours: "h",
    settings: "Configuración",
    language: "Idioma",
    privacy: "Privacidad",
    consent: "Consentimiento",
    cocaCola: "Coca-Cola",
    cornerStore: "Tienda de Esquina",
    adError: "Error al cargar anuncio",
    loadingError: "Error de carga"
  },

  fr: {
    tycoonClicker: "Magnat Clicker",
    balance: "Solde",
    income: "Revenus",
    clickRate: "Taux de Clic",
    premium: "Premium",
    click: "CLIC",
    boosters: "BOOSTERS",
    rewards: "RÉCOMPENSES",
    store: "MAGASIN",
    premiumStore: "MAGASIN PREMIUM",
    premiumStoreDesc: "Achetez de la monnaie, des boosters et des fonctionnalités premium !",
    shop: "MAGASIN",
    recentAchievements: "Succès Récents",
    firstSteps: "Premiers Pas",
    firstStepsDesc: "Gagnez vos premiers $10",
    completed: "TERMINÉ",
    adMobAd: "Publicité AdMob",
    adMobDesc: "Gagnez jusqu'à $600 en regardant !",
    watch: "Regarder",
    home: "Accueil",
    trading: "Trading",
    business: "Business",
    casino: "Casino",
    portfolio: "Portefeuille",
    level: "NIV",
    perSec: "/sec",
    perClick: "/clic",
    day: "jour",
    advertisementTitle: "Publicité",
    supportGameDesc: "Soutenez le jeu en regardant une publicité et obtenez une récompense !",
    playingAd: "Lecture de la publicité...",
    autoCloseIn: "Fermeture automatique dans",
    seconds: "secondes",
    boosterActivation: "Activation du Booster",
    watchAdToActivate: "Regardez une publicité pour activer le booster !",
    clickBooster: "Booster de Clic",
    incomeBooster: "Booster de Revenus",
    moneyBooster: "Booster d'Argent",
    doubleClick: "Double Clic",
    passiveIncome: "Revenus Passifs",
    instantMoney: "Argent Instantané",
    duration: "Durée",
    multiplier: "Multiplicateur",
    reward: "Récompense",
    currency: "Monnaie",
    premiumFeatures: "Fonctionnalités Premium",
    removeAds: "Supprimer toutes les publicités",
    unlockFeatures: "Débloquer des fonctionnalités exclusives",
    adReward: "Récompense Publicitaire",
    boosterActivated: "Booster Activé",
    achievementUnlocked: "Succès Débloqué",
    minutes: "min",
    hours: "h",
    settings: "Paramètres",
    language: "Langue",
    privacy: "Confidentialité",
    consent: "Consentement",
    cocaCola: "Coca-Cola",
    cornerStore: "Magasin du Coin",
    adError: "Erreur de chargement de la publicité",
    loadingError: "Erreur de chargement"
  },

  de: {
    tycoonClicker: "Tycoon Clicker",
    balance: "Guthaben",
    income: "Einkommen",
    clickRate: "Klickrate",
    premium: "Premium",
    click: "KLICK",
    boosters: "BOOSTER",
    rewards: "BELOHNUNGEN",
    store: "SHOP",
    premiumStore: "PREMIUM SHOP",
    premiumStoreDesc: "Kaufe Währung, Booster und Premium-Features!",
    shop: "SHOP",
    recentAchievements: "Neueste Erfolge",
    firstSteps: "Erste Schritte",
    firstStepsDesc: "Verdiene deine ersten $10",
    completed: "ABGESCHLOSSEN",
    adMobAd: "AdMob Werbung",
    adMobDesc: "Verdiene bis zu $600 durch Ansehen!",
    watch: "Ansehen",
    home: "Start",
    trading: "Trading",
    business: "Business",
    casino: "Casino",
    portfolio: "Portfolio",
    level: "LVL",
    perSec: "/Sek",
    perClick: "/Klick",
    day: "Tag",
    advertisementTitle: "Werbung",
    supportGameDesc: "Unterstütze das Spiel durch Ansehen einer Werbung und erhalte eine Belohnung!",
    playingAd: "Werbung läuft...",
    autoCloseIn: "Automatisches Schließen in",
    seconds: "Sekunden",
    boosterActivation: "Booster-Aktivierung",
    watchAdToActivate: "Schaue eine Werbung an, um den Booster zu aktivieren!",
    clickBooster: "Klick-Booster",
    incomeBooster: "Einkommens-Booster",
    moneyBooster: "Geld-Booster",
    doubleClick: "Doppelklick",
    passiveIncome: "Passives Einkommen",
    instantMoney: "Sofortgeld",
    duration: "Dauer",
    multiplier: "Multiplikator",
    reward: "Belohnung",
    currency: "Währung",
    premiumFeatures: "Premium-Features",
    removeAds: "Alle Werbung entfernen",
    unlockFeatures: "Exklusive Features freischalten",
    adReward: "Werbe-Belohnung",
    boosterActivated: "Booster Aktiviert",
    achievementUnlocked: "Erfolg Freigeschaltet",
    minutes: "Min",
    hours: "Std",
    settings: "Einstellungen",
    language: "Sprache",
    privacy: "Datenschutz",
    consent: "Einwilligung",
    cocaCola: "Coca-Cola",
    cornerStore: "Eckladen",
    adError: "Werbung Ladefehler",
    loadingError: "Ladefehler"
  },

  ru: {
    tycoonClicker: "Tycoon Clicker",
    balance: "Balance",
    income: "Income",
    clickRate: "Click Rate",
    premium: "Premium",
    click: "CLICK",
    boosters: "BOOSTERS",
    rewards: "REWARDS",
    store: "STORE",
    premiumStore: "PREMIUM STORE",
    premiumStoreDesc: "Buy currency, boosters and premium features!",
    shop: "SHOP",
    recentAchievements: "Recent Achievements",
    firstSteps: "First Steps",
    firstStepsDesc: "Earn your first $10",
    completed: "COMPLETED",
    adMobAd: "AdMob Advertising",
    adMobDesc: "Earn up to $600 for watching!",
    watch: "Watch",
    home: "Home",
    trading: "Trading",
    business: "Business",
    casino: "Casino",
    portfolio: "Portfolio",
    level: "LVL",
    perSec: "/sec",
    perClick: "/click",
    day: "day",
    advertisementTitle: "Advertisement",
    supportGameDesc: "Support the game by watching ads and get rewards!",
    playingAd: "Playing advertisement...",
    autoCloseIn: "Auto-closing in",
    seconds: "seconds",
    boosterActivation: "Booster Activation",
    watchAdToActivate: "Watch ad to activate booster!",
    clickBooster: "Click Booster",
    incomeBooster: "Income Booster",
    moneyBooster: "Money Booster",
    doubleClick: "Double Click",
    passiveIncome: "Passive Income",
    instantMoney: "Instant Money",
    duration: "Duration",
    multiplier: "Multiplier",
    reward: "Reward",
    currency: "Currency",
    premiumFeatures: "Premium Features",
    removeAds: "Remove all ads",
    unlockFeatures: "Unlock exclusive features",
    adReward: "Ad Reward",
    boosterActivated: "Booster Activated",
    achievementUnlocked: "Achievement Unlocked",
    minutes: "minutes",
    hours: "hours",
    settings: "Settings",
    language: "Language",
    privacy: "Privacy",
    consent: "Consent",
    cocaCola: "Coca-Cola",
    cornerStore: "Corner Store",
    adError: "Ad Loading Error",
    loadingError: "Loading Error",
    cooldownReset: "Cooldown Reset"
  },

  zh: {
    tycoonClicker: "大亨点击器",
    balance: "余额",
    income: "收入",
    clickRate: "点击率",
    premium: "高级版",
    click: "点击",
    boosters: "增强器",
    rewards: "奖励",
    store: "商店",
    premiumStore: "高级商店",
    premiumStoreDesc: "购买货币、增强器和高级功能！",
    shop: "商店",
    recentAchievements: "最近成就",
    firstSteps: "第一步",
    firstStepsDesc: "赚取您的第一个$10",
    completed: "已完成",
    adMobAd: "AdMob广告",
    adMobDesc: "观看可赚取高达$600！",
    watch: "观看",
    home: "主页",
    trading: "交易",
    business: "商业",
    casino: "赌场",
    portfolio: "投资组合",
    level: "等级",
    perSec: "/秒",
    perClick: "/点击",
    day: "天",
    advertisementTitle: "广告",
    supportGameDesc: "通过观看广告支持游戏并获得奖励！",
    playingAd: "正在播放广告...",
    autoCloseIn: "自动关闭于",
    seconds: "秒",
    boosterActivation: "增强器激活",
    watchAdToActivate: "观看广告以激活增强器！",
    clickBooster: "点击增强器",
    incomeBooster: "收入增强器",
    moneyBooster: "金钱增强器",
    doubleClick: "双击",
    passiveIncome: "被动收入",
    instantMoney: "即时金钱",
    duration: "持续时间",
    multiplier: "倍数",
    reward: "奖励",
    currency: "货币",
    premiumFeatures: "高级功能",
    removeAds: "移除所有广告",
    unlockFeatures: "解锁独家功能",
    adReward: "广告奖励",
    boosterActivated: "增强器已激活",
    achievementUnlocked: "成就已解锁",
    minutes: "分钟",
    hours: "小时",
    settings: "设置",
    language: "语言",
    privacy: "隐私",
    consent: "同意",
    cocaCola: "可口可乐",
    cornerStore: "街角商店",
    adError: "广告加载错误",
    loadingError: "加载错误"
  },

  ja: {
    tycoonClicker: "タイクーンクリッカー",
    balance: "残高",
    income: "収入",
    clickRate: "クリック率",
    premium: "プレミアム",
    click: "クリック",
    boosters: "ブースター",
    rewards: "報酬",
    store: "ストア",
    premiumStore: "プレミアムストア",
    premiumStoreDesc: "通貨、ブースター、プレミアム機能を購入！",
    shop: "ショップ",
    recentAchievements: "最近の実績",
    firstSteps: "最初のステップ",
    firstStepsDesc: "最初の$10を稼ぐ",
    completed: "完了",
    adMobAd: "AdMob広告",
    adMobDesc: "視聴で最大$600獲得！",
    watch: "視聴",
    home: "ホーム",
    trading: "トレード",
    business: "ビジネス",
    casino: "カジノ",
    portfolio: "ポートフォリオ",
    level: "LV",
    perSec: "/秒",
    perClick: "/クリック",
    day: "日",
    advertisementTitle: "広告",
    supportGameDesc: "広告を視聴してゲームをサポートし、報酬を獲得！",
    playingAd: "広告再生中...",
    autoCloseIn: "自動終了まで",
    seconds: "秒",
    boosterActivation: "ブースター起動",
    watchAdToActivate: "広告を視聴してブースターを起動！",
    clickBooster: "クリックブースター",
    incomeBooster: "収入ブースター",
    moneyBooster: "マネーブースター",
    doubleClick: "ダブルクリック",
    passiveIncome: "受動収入",
    instantMoney: "インスタントマネー",
    duration: "継続時間",
    multiplier: "倍率",
    reward: "報酬",
    currency: "通貨",
    premiumFeatures: "プレミアム機能",
    removeAds: "すべての広告を削除",
    unlockFeatures: "限定機能をアンロック",
    adReward: "広告報酬",
    boosterActivated: "ブースター起動",
    achievementUnlocked: "実績アンロック",
    minutes: "分",
    hours: "時間",
    settings: "設定",
    language: "言語",
    privacy: "プライバシー",
    consent: "同意",
    cocaCola: "コカ・コーラ",
    cornerStore: "コーナーストア",
    adError: "広告読み込みエラー",
    loadingError: "読み込みエラー"
  }
};

// Add remaining languages after the main translations object is defined
Object.assign(translations, {
  ko: translations.en,
  ar: translations.en,
  hi: translations.en,
  tr: translations.en,
  pl: translations.en,
  nl: translations.en,
  sv: translations.en,
  da: translations.en,
  no: translations.en,
  fi: translations.en,
  cs: translations.en,
  hu: translations.en,
  ro: translations.en,
  bg: translations.en,
  hr: translations.en,
  sk: translations.en,
  sl: translations.en,
  et: translations.en,
  lv: translations.en,
  lt: translations.en,
  uk: translations.en,
  he: translations.en,
  th: translations.en,
  vi: translations.en,
  id: translations.en,
  ms: translations.en,
  tl: translations.en,
  it: translations.en,
  pt: translations.en
}) as Record<Language, Translations>;

export const languageNames: Record<Language, string> = {
  en: "English",
  es: "Español", 
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  ru: "Русский",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ar: "العربية",
  hi: "हिन्दी",
  tr: "Türkçe",
  pl: "Polski",
  nl: "Nederlands",
  sv: "Svenska",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
  cs: "Čeština",
  hu: "Magyar",
  ro: "Română",
  bg: "Български",
  hr: "Hrvatski",
  sk: "Slovenčina",
  sl: "Slovenščina",
  et: "Eesti",
  lv: "Latviešu",
  lt: "Lietuvių",
  uk: "Українська",
  he: "עברית",
  th: "ไทย",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  tl: "Filipino"
};