export interface AssetData {
  id: string;
  name: string;
  basePrice: number;
  baseIncome: number;
  icon: string;
  description: string;
  category: string;
  multiplier: number;
}

export const INVESTMENT_CATEGORIES = [
  { id: 'stocks', name: 'Акции', icon: 'fas fa-chart-line', description: 'Фондовый рынок', color: 'from-blue-500 to-purple-600' },
  { id: 'realestate', name: 'Дома', icon: 'fas fa-home', description: 'Недвижимость', color: 'from-green-500 to-emerald-600' },
  { id: 'cars', name: 'Авто', icon: 'fas fa-car', description: 'Роскошные машины', color: 'from-red-500 to-orange-600' },
  { id: 'yachts', name: 'Яхты', icon: 'fas fa-ship', description: 'Водный транспорт', color: 'from-cyan-500 to-blue-600' },
  { id: 'art', name: 'Картины', icon: 'fas fa-palette', description: 'Искусство', color: 'from-purple-500 to-pink-600' },
  { id: 'business', name: 'Бизнес', icon: 'fas fa-briefcase', description: 'Предприятия', color: 'from-gray-600 to-gray-800' },
  { id: 'space', name: 'Космос', icon: 'fas fa-rocket', description: 'Космические проекты', color: 'from-indigo-500 to-purple-700' }
];

export const ASSETS: AssetData[] = [
  // Stocks
  { 
    id: 'apple', 
    name: 'Apple Inc.', 
    basePrice: 200, 
    baseIncome: 5, 
    icon: 'fab fa-apple', 
    description: 'Технологический гигант',
    category: 'stocks',
    multiplier: 1.18
  },
  { 
    id: 'tesla', 
    name: 'Tesla Motors', 
    basePrice: 250, 
    baseIncome: 8, 
    icon: 'fas fa-bolt', 
    description: 'Электромобили будущего',
    category: 'stocks',
    multiplier: 1.22
  },
  { 
    id: 'google', 
    name: 'Google', 
    basePrice: 280000, 
    baseIncome: 425, 
    icon: 'fab fa-google', 
    description: 'Поисковый гигант',
    category: 'stocks',
    multiplier: 1.16
  },
  { 
    id: 'amazon', 
    name: 'Amazon', 
    basePrice: 320000, 
    baseIncome: 480, 
    icon: 'fab fa-amazon', 
    description: 'Король e-commerce',
    category: 'stocks',
    multiplier: 1.19
  },
  
  // Real Estate - Недорогая недвижимость
  { 
    id: 'studio', 
    name: 'Студия', 
    basePrice: 45000, 
    baseIncome: 12, 
    icon: 'fas fa-door-open', 
    description: 'Маленькая студия',
    category: 'realestate',
    multiplier: 1.20
  },
  { 
    id: 'garage', 
    name: 'Гараж', 
    basePrice: 25000, 
    baseIncome: 8, 
    icon: 'fas fa-warehouse', 
    description: 'Парковочное место',
    category: 'realestate',
    multiplier: 1.18
  },
  { 
    id: 'room', 
    name: 'Комната', 
    basePrice: 35000, 
    baseIncome: 10, 
    icon: 'fas fa-bed', 
    description: 'Комната для аренды',
    category: 'realestate',
    multiplier: 1.22
  },
  { 
    id: 'apartment', 
    name: 'Квартира', 
    basePrice: 150000, 
    baseIncome: 45, 
    icon: 'fas fa-home', 
    description: 'Уютное жилье',
    category: 'realestate',
    multiplier: 1.25
  },
  { 
    id: 'cottage', 
    name: 'Дача', 
    basePrice: 85000, 
    baseIncome: 25, 
    icon: 'fas fa-mountain', 
    description: 'Загородный дом',
    category: 'realestate',
    multiplier: 1.24
  },
  { 
    id: 'duplex', 
    name: 'Дуплекс', 
    basePrice: 280000, 
    baseIncome: 85, 
    icon: 'fas fa-building', 
    description: 'Двухуровневая квартира',
    category: 'realestate',
    multiplier: 1.26
  },
  { 
    id: 'house', 
    name: 'Дом', 
    basePrice: 500000, 
    baseIncome: 180, 
    icon: 'fas fa-house', 
    description: 'Частный дом',
    category: 'realestate',
    multiplier: 1.28
  },
  { 
    id: 'mansion', 
    name: 'Особняк', 
    basePrice: 1200000, 
    baseIncome: 450, 
    icon: 'fas fa-chess-rook', 
    description: 'Роскошный особняк',
    category: 'realestate',
    multiplier: 1.32
  },
  { 
    id: 'skyscraper', 
    name: 'Небоскреб', 
    basePrice: 5000000, 
    baseIncome: 2500, 
    icon: 'fas fa-city', 
    description: 'Небоскреб в центре',
    category: 'realestate',
    multiplier: 1.35
  },
  { 
    id: 'island', 
    name: 'Остров', 
    basePrice: 25000000, 
    baseIncome: 15000, 
    icon: 'fas fa-map', 
    description: 'Частный остров',
    category: 'realestate',
    multiplier: 1.45
  },
  
  // Luxury Cars
  { 
    id: 'ferrari', 
    name: 'Ferrari F8', 
    basePrice: 280000, 
    baseIncome: 180, 
    icon: 'fas fa-horse', 
    description: 'Итальянская мощь',
    category: 'cars',
    multiplier: 1.20
  },
  { 
    id: 'lamborghini', 
    name: 'Lamborghini', 
    basePrice: 350000, 
    baseIncome: 220, 
    icon: 'fas fa-bull', 
    description: 'Дикий бык',
    category: 'cars',
    multiplier: 1.22
  },
  { 
    id: 'bugatti', 
    name: 'Bugatti Chiron', 
    basePrice: 3200000, 
    baseIncome: 1850, 
    icon: 'fas fa-wind', 
    description: 'Скорость света',
    category: 'cars',
    multiplier: 1.30
  },
  { 
    id: 'mclaren', 
    name: 'McLaren P1', 
    basePrice: 1500000, 
    baseIncome: 920, 
    icon: 'fas fa-fire', 
    description: 'Британская точность',
    category: 'cars',
    multiplier: 1.25
  },
  
  // Yachts & Planes
  { 
    id: 'yacht_small', 
    name: 'Малая яхта', 
    basePrice: 800000, 
    baseIncome: 450, 
    icon: 'fas fa-ship', 
    description: '30-метровая яхта',
    category: 'yachts',
    multiplier: 1.30
  },
  { 
    id: 'yacht_mega', 
    name: 'Мега-яхта', 
    basePrice: 15000000, 
    baseIncome: 8500, 
    icon: 'fas fa-anchor', 
    description: '100-метровая яхта',
    category: 'yachts',
    multiplier: 1.40
  },
  { 
    id: 'private_jet', 
    name: 'Частный джет', 
    basePrice: 25000000, 
    baseIncome: 12000, 
    icon: 'fas fa-plane', 
    description: 'Boeing 737',
    category: 'yachts',
    multiplier: 1.35
  },
  { 
    id: 'helicopter', 
    name: 'Вертолет', 
    basePrice: 3500000, 
    baseIncome: 2100, 
    icon: 'fas fa-helicopter', 
    description: 'Роскошный вертолет',
    category: 'yachts',
    multiplier: 1.28
  },
  
  // Art
  { 
    id: 'painting_classic', 
    name: 'Картина Моне', 
    basePrice: 5500000, 
    baseIncome: 3200, 
    icon: 'fas fa-palette', 
    description: 'Шедевр импрессионизма',
    category: 'art',
    multiplier: 1.50
  },
  { 
    id: 'sculpture', 
    name: 'Скульптура Родена', 
    basePrice: 8200000, 
    baseIncome: 4800, 
    icon: 'fas fa-monument', 
    description: 'Бронзовый шедевр',
    category: 'art',
    multiplier: 1.55
  },
  { 
    id: 'modern_art', 
    name: 'Современное искусство', 
    basePrice: 1200000, 
    baseIncome: 750, 
    icon: 'fas fa-spray-can', 
    description: 'Авангардная работа',
    category: 'art',
    multiplier: 1.45
  },
  
  // Business Empire - Малый и средний бизнес
  { 
    id: 'coffee_shop', 
    name: 'Кофейня', 
    basePrice: 35000, 
    baseIncome: 18, 
    icon: 'fas fa-coffee', 
    description: 'Уютная кофейня',
    category: 'business',
    multiplier: 1.20
  },
  { 
    id: 'bakery', 
    name: 'Пекарня', 
    basePrice: 55000, 
    baseIncome: 28, 
    icon: 'fas fa-bread-slice', 
    description: 'Свежая выпечка',
    category: 'business',
    multiplier: 1.22
  },
  { 
    id: 'barber_shop', 
    name: 'Барбершоп', 
    basePrice: 25000, 
    baseIncome: 15, 
    icon: 'fas fa-cut', 
    description: 'Стильные стрижки',
    category: 'business',
    multiplier: 1.18
  },
  { 
    id: 'flower_shop', 
    name: 'Цветочный магазин', 
    basePrice: 30000, 
    baseIncome: 16, 
    icon: 'fas fa-seedling', 
    description: 'Красивые букеты',
    category: 'business',
    multiplier: 1.19
  },
  { 
    id: 'laundry', 
    name: 'Прачечная', 
    basePrice: 45000, 
    baseIncome: 22, 
    icon: 'fas fa-tshirt', 
    description: 'Химчистка',
    category: 'business',
    multiplier: 1.21
  },
  { 
    id: 'food_truck', 
    name: 'Фуд-трак', 
    basePrice: 85000, 
    baseIncome: 45, 
    icon: 'fas fa-truck', 
    description: 'Уличная еда',
    category: 'business',
    multiplier: 1.23
  },
  { 
    id: 'gym', 
    name: 'Спортзал', 
    basePrice: 180000, 
    baseIncome: 95, 
    icon: 'fas fa-dumbbell', 
    description: 'Фитнес-клуб',
    category: 'business',
    multiplier: 1.24
  },
  { 
    id: 'restaurant', 
    name: 'Ресторан', 
    basePrice: 450000, 
    baseIncome: 280, 
    icon: 'fas fa-utensils', 
    description: 'Высокая кухня',
    category: 'business',
    multiplier: 1.25
  },
  { 
    id: 'car_wash', 
    name: 'Автомойка', 
    basePrice: 120000, 
    baseIncome: 65, 
    icon: 'fas fa-spray-can', 
    description: 'Мойка автомобилей',
    category: 'business',
    multiplier: 1.26
  },
  { 
    id: 'pharmacy', 
    name: 'Аптека', 
    basePrice: 280000, 
    baseIncome: 150, 
    icon: 'fas fa-pills', 
    description: 'Лекарственные препараты',
    category: 'business',
    multiplier: 1.27
  },
  { 
    id: 'gas_station', 
    name: 'АЗС', 
    basePrice: 850000, 
    baseIncome: 480, 
    icon: 'fas fa-gas-pump', 
    description: 'Заправочная станция',
    category: 'business',
    multiplier: 1.29
  },
  { 
    id: 'hotel', 
    name: 'Отель', 
    basePrice: 2500000, 
    baseIncome: 1400, 
    icon: 'fas fa-bed', 
    description: '5-звездочный отель',
    category: 'business',
    multiplier: 1.32
  },
  { 
    id: 'shopping_mall', 
    name: 'Торговый центр', 
    basePrice: 5500000, 
    baseIncome: 3200, 
    icon: 'fas fa-shopping-cart', 
    description: 'Крупный ТЦ',
    category: 'business',
    multiplier: 1.35
  },
  { 
    id: 'factory', 
    name: 'Завод', 
    basePrice: 8500000, 
    baseIncome: 4200, 
    icon: 'fas fa-industry', 
    description: 'Промышленное производство',
    category: 'business',
    multiplier: 1.38
  },
  { 
    id: 'bank', 
    name: 'Банк', 
    basePrice: 25000000, 
    baseIncome: 18000, 
    icon: 'fas fa-university', 
    description: 'Финансовая империя',
    category: 'business',
    multiplier: 1.45
  },
  
  // Space Tech
  { 
    id: 'spacex_stock', 
    name: 'Акции SpaceX', 
    basePrice: 15000000, 
    baseIncome: 9500, 
    icon: 'fas fa-rocket', 
    description: 'Частная космонавтика',
    category: 'space',
    multiplier: 1.60
  },
  { 
    id: 'space_station', 
    name: 'Космическая станция', 
    basePrice: 100000000, 
    baseIncome: 75000, 
    icon: 'fas fa-satellite', 
    description: 'Орбитальная станция',
    category: 'space',
    multiplier: 1.80
  },
  { 
    id: 'mars_colony', 
    name: 'Колония на Марсе', 
    basePrice: 500000000, 
    baseIncome: 425000, 
    icon: 'fas fa-globe-americas', 
    description: 'Межпланетная колония',
    category: 'space',
    multiplier: 2.00
  }
];

export const ACHIEVEMENTS = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Earn your first $10',
    requirement: 10,
    type: 'balance',
    reward: 50,
    icon: 'fas fa-baby'
  },
  {
    id: 'clicker_novice',
    name: 'Clicker Novice',
    description: 'Make 100 clicks',
    requirement: 100,
    type: 'clicks',
    reward: 100,
    icon: 'fas fa-hand-pointer'
  },
  {
    id: 'speed_clicker_beginner',
    name: 'Быстрый кликер',
    description: 'Достичь 120 CPM (HIGH SPEED)',
    requirement: 120,
    type: 'click_speed',
    reward: 250,
    icon: 'fas fa-tachometer-alt'
  },
  {
    id: 'speed_clicker_advanced',
    name: 'Критический кликер',
    description: 'Достичь 180 CPM (CRITICAL)',
    requirement: 180,
    type: 'click_speed',
    reward: 500,
    icon: 'fas fa-fire'
  },
  {
    id: 'speed_clicker_insane',
    name: 'Безумный кликер',
    description: 'Достичь 280 CPM (INSANE)',
    requirement: 280,
    type: 'click_speed',
    reward: 1000,
    icon: 'fas fa-rocket'
  },
  {
    id: 'speed_clicker_legendary',
    name: 'Легендарный кликер',
    description: 'Достичь 400 CPM (LEGENDARY)',
    requirement: 400,
    type: 'click_speed',
    reward: 2500,
    icon: 'fas fa-crown'
  },
  {
    id: 'speed_clicker_godlike',
    name: 'Божественный кликер',
    description: 'Достичь 600+ CPM (НЕВОЗМОЖНОЕ)',
    requirement: 600,
    type: 'click_speed',
    reward: 10000,
    icon: 'fas fa-bolt'
  },
  {
    id: 'thousandaire',
    name: 'Thousandaire',
    description: 'Accumulate $1,000',
    requirement: 1000,
    type: 'balance',
    reward: 500,
    icon: 'fas fa-dollar-sign'
  },
  {
    id: 'millionaire',
    name: 'Миллионер',
    description: 'Накопить $1,000,000',
    requirement: 1000000,
    type: 'balance',
    reward: 50000,
    icon: 'fas fa-trophy'
  },
  {
    id: 'click_master',
    name: 'Кликер-мастер',
    description: 'Сделать 10,000 кликов',
    requirement: 10000,
    type: 'clicks',
    reward: 25000,
    icon: 'fas fa-medal'
  }
];

// Система уровней с заданиями
export interface LevelData {
  level: number;
  title: string;
  description: string;
  requiredXP: number;
  rewards: {
    money?: number;
    clickMultiplier?: number;
    unlocks?: string[];
  };
  tasks: {
    description: string;
    xpReward: number;
    completed?: boolean;
  }[];
}

export const LEVELS: LevelData[] = [
  {
    level: 1,
    title: "Новичок инвестор",
    description: "Изучите основы торговли",
    requiredXP: 100,
    rewards: { money: 1000, unlocks: ["Apple", "Tesla", "Bitcoin", "Ethereum"] },
    tasks: [
      { description: "Сделайте 50 кликов", xpReward: 25 },
      { description: "Купите первую акцию Apple", xpReward: 30 },
      { description: "Накопите $10,000", xpReward: 45 }
    ]
  },
  {
    level: 2,
    title: "Продвинутый трейдер",
    description: "Расширьте портфель",
    requiredXP: 250,
    rewards: { money: 5000, clickMultiplier: 1.2, unlocks: ["Microsoft", "Google", "Coca-Cola"] },
    tasks: [
      { description: "Инвестируйте в 3 разных актива", xpReward: 40 },
      { description: "Накопите $50,000", xpReward: 50 },
      { description: "Получите $100/сек пассивного дохода", xpReward: 60 }
    ]
  },
  {
    level: 3,
    title: "Портфельный менеджер",
    description: "Диверсифицируйте инвестиции",
    requiredXP: 500,
    rewards: { money: 15000, unlocks: ["Amazon", "JPMorgan", "Procter & Gamble"] },
    tasks: [
      { description: "Инвестируйте в 5 активов", xpReward: 70 },
      { description: "Накопите $200,000", xpReward: 80 },
      { description: "Сделайте 500 кликов", xpReward: 60 }
    ]
  },
  {
    level: 4,
    title: "Технологический гуру",
    description: "Инвестируйте в будущее",
    requiredXP: 800,
    rewards: { money: 25000, clickMultiplier: 1.5, unlocks: ["Nvidia", "Johnson & Johnson"] },
    tasks: [
      { description: "Купите акции Nvidia", xpReward: 90 },
      { description: "Накопите $500,000", xpReward: 100 },
      { description: "Получите $300/сек пассивного дохода", xpReward: 110 }
    ]
  },
  {
    level: 5,
    title: "Сырьевой специалист",
    description: "Откройте товарные рынки",
    requiredXP: 1200,
    rewards: { money: 50000, unlocks: ["Нефть", "Pfizer"] },
    tasks: [
      { description: "Инвестируйте в медицинские акции", xpReward: 120 },
      { description: "Накопите $1,000,000", xpReward: 150 },
      { description: "Купите первый товарный актив", xpReward: 130 }
    ]
  },
  {
    level: 6,
    title: "Драгоценные металлы",
    description: "Инвестируйте в стабильность",
    requiredXP: 1800,
    rewards: { money: 100000, clickMultiplier: 2.0, unlocks: ["Золото", "Серебро"] },
    tasks: [
      { description: "Купите золото", xpReward: 140 },
      { description: "Накопите $2,000,000", xpReward: 160 },
      { description: "Получите $500/сек пассивного дохода", xpReward: 180 }
    ]
  },
  {
    level: 7,
    title: "Платиновый инвестор",
    description: "Элитные инвестиции",
    requiredXP: 2500,
    rewards: { money: 200000, unlocks: ["Платина"] },
    tasks: [
      { description: "Инвестируйте в платину", xpReward: 200 },
      { description: "Накопите $5,000,000", xpReward: 220 },
      { description: "Получите $800/сек пассивного дохода", xpReward: 240 }
    ]
  },
  {
    level: 8,
    title: "Магнат",
    description: "Элитные корпорации",
    requiredXP: 3500,
    rewards: { money: 500000, clickMultiplier: 2.5, unlocks: ["Berkshire Hathaway"] },
    tasks: [
      { description: "Купите акции Berkshire", xpReward: 280 },
      { description: "Накопите $10,000,000", xpReward: 300 },
      { description: "Получите $1000/сек пассивного дохода", xpReward: 320 }
    ]
  },
  {
    level: 9,
    title: "Корпоративный титан",
    description: "Подготовка к урану",
    requiredXP: 5000,
    rewards: { money: 1000000, clickMultiplier: 3.0 },
    tasks: [
      { description: "Накопите $25,000,000", xpReward: 400 },
      { description: "Получите $1500/сек пассивного дохода", xpReward: 450 },
      { description: "Инвестируйте в 10 разных активов", xpReward: 500 }
    ]
  },
  {
    level: 10,
    title: "Энергетический магнат",
    description: "Доступ к урану",
    requiredXP: 7000,
    rewards: { money: 2500000, clickMultiplier: 4.0, unlocks: ["Уран"] },
    tasks: [
      { description: "Купите уран", xpReward: 600 },
      { description: "Накопите $50,000,000", xpReward: 700 },
      { description: "Получите $2000/сек пассивного дохода", xpReward: 800 }
    ]
  }
];

export function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  if (num >= 1) return Math.floor(num).toLocaleString();
  return num.toFixed(1); // Для чисел меньше 1 показываем одну цифру после точки
}

export function calculatePrice(basePrice: number, quantity: number, multiplier: number): number {
  return Math.floor(basePrice * Math.pow(multiplier, quantity));
}

export function calculateIncome(baseIncome: number, quantity: number): number {
  return baseIncome * quantity;
}
