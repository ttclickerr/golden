import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateUpgradePrice, getUpgradeById } from '../../data/upgrades';
import { calculateBuildingPrice, getBuildingById } from '../../data/buildings';
import type { Building, Upgrade, GameState } from '../../types/game';
import { toast } from 'sonner';
import { useAudio } from '../../lib/stores/useAudio';
import { applovinService, AdjustEvent } from '../../services/ApplovinService';
import { trackAnalyticsEvent } from '../../lib/trackAnalyticsEvent';

// Типы временных множителей
type MultiplierType = 'click' | 'income' | 'building';

// Интерфейс для временного множителя
interface TemporaryMultiplier {
  type: MultiplierType;
  value: number;
  expiresAt: number;
  targetId?: string; // для множителей, действующих на конкретное здание
}

interface GameStateStore extends GameState {
  // Дополнительные поля состояния
  temporaryMultipliers: TemporaryMultiplier[];
  
  // Actions
  click: () => void;
  buyUpgrade: (id: string) => void;
  buyBuilding: (id: string) => void;
  buyRealEstate: (id: string) => void;
  buyVehicle: (id: string) => void;
  buyStock: (id: string, amount: number) => void;
  buyCrypto: (id: string, amount: number) => void;
  buyYacht: (id: string) => void;
  addMultiplier: (type: MultiplierType, value: number, targetId?: string) => void;
  addTemporaryMultiplier: (type: MultiplierType, value: number, durationInSeconds: number, targetId?: string) => void;
  updateMultipliers: () => void;
  setManualClicks: (count: number) => void;
  setTotalCurrency: (amount: number) => void;
  setCurrentCurrency: (amount: number) => void;
  addCurrency: (amount: number) => void;
  addXP: (amount: number) => void;
  checkAchievements: () => void;
  unlockAchievement: (id: string) => void;
  
  // Новые методы для работы с заданиями и обучением
  completeQuest: (id: string) => void;
  updateQuestProgress: (category: string, amount: number) => void;
  checkQuests: () => void;
  completeTutorialStep: (id: string) => void;
  checkTutorial: () => void;
  setTutorialCompleted: (completed: boolean) => void;
  
  resetGame: () => void;
  saveGameState: () => void;
  loadGameState: () => void;
  startGameLoop: () => void;
  stopGameLoop: () => void;
}

const initialState: GameState = {
  currentCurrency: 0,
  totalCurrency: 0,
  manualClicks: 0,
  clickValue: 1,
  passiveIncome: 0,
  lastSavedAt: Date.now(),
  buildings: [],
  upgrades: [],
  realEstate: [
    {
      id: 'apartment',
      name: 'Роскошные Апартаменты',
      description: 'Современные апартаменты в центре города с отличным видом',
      price: 50000,
      image: 'apartment',
      income: 500,
      incomePerHour: 500,
      appreciation: 0.05,
      maintenanceCost: 150,
      owned: false
    },
    {
      id: 'house',
      name: 'Загородный Дом',
      description: 'Уютный дом за городом с большим участком земли',
      price: 90000,
      image: 'house',
      income: 900,
      incomePerHour: 900,
      appreciation: 0.06,
      maintenanceCost: 280,
      owned: false
    },
    {
      id: 'villa',
      name: 'Пляжная Вилла',
      description: 'Роскошная вилла на берегу моря с собственным пляжем',
      price: 150000,
      image: 'villa',
      income: 1500,
      incomePerHour: 1500,
      appreciation: 0.08,
      maintenanceCost: 350,
      owned: false
    },
    {
      id: 'mansion',
      name: 'Современный Особняк',
      description: 'Элитный особняк с бассейном, теннисным кортом и садом',
      price: 250000,
      image: 'mansion',
      income: 2500,
      incomePerHour: 2500,
      appreciation: 0.1,
      maintenanceCost: 450,
      owned: false
    }
  ],
  level: 1,
  xp: 0,
  xpRequired: 1000,
  activeGameTime: 0,
  achievements: [],
  quests: [
    {
      id: 'reach_level_5',
      name: 'Финансовый рост',
      description: 'Достигните 5 уровня',
      category: 'level',
      target: 5,
      reward: 5000,
      completed: false,
      progress: 1
    },
    {
      id: 'buy_first_business',
      name: 'Первый бизнес',
      description: 'Купите свой первый бизнес',
      category: 'building',
      target: 1,
      reward: 1000,
      completed: false,
      progress: 0
    },
    {
      id: 'buy_first_stock',
      name: 'Инвестор',
      description: 'Купите свою первую акцию',
      category: 'stock',
      target: 1,
      reward: 2000,
      completed: false,
      progress: 0
    },
    {
      id: 'buy_first_crypto',
      name: 'Криптоэнтузиаст',
      description: 'Приобретите первую криптовалюту',
      category: 'crypto',
      target: 1,
      reward: 3000,
      completed: false,
      progress: 0
    },
    {
      id: 'buy_first_vehicle',
      name: 'Автолюбитель',
      description: 'Купите свой первый автомобиль',
      category: 'vehicle',
      target: 1,
      reward: 4000,
      completed: false,
      progress: 0
    },
    {
      id: 'buy_first_yacht',
      name: 'Морской волк',
      description: 'Приобретите яхту',
      category: 'yacht',
      target: 1,
      reward: 10000,
      completed: false,
      progress: 0
    }
  ],
  tutorial: [
    {
      id: 'tutorial_click',
      step: 1,
      title: 'Ваш первый доход',
      description: 'Нажмите на экран, чтобы заработать деньги',
      completed: false
    },
    {
      id: 'tutorial_business',
      step: 2,
      title: 'Покупка бизнеса',
      description: 'Перейдите на вкладку "Бизнес" и купите свой первый бизнес для получения пассивного дохода',
      completed: false
    },
    {
      id: 'tutorial_upgrade',
      step: 3,
      title: 'Улучшения',
      description: 'Приобретите улучшение для увеличения дохода',
      completed: false
    },
    {
      id: 'tutorial_quests',
      step: 4,
      title: 'Задания',
      description: 'Ознакомьтесь со списком заданий и выполните их для получения дополнительных наград',
      completed: false
    }
  ],
  tutorialCompleted: false
};

export const useGameState = create<GameStateStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      temporaryMultipliers: [],
      buildingPurchases: 0,
      upgradePurchases: 0,
      lastAdWatched: 0,
      
      // Методы для работы с заданиями
      completeQuest: (id: string) => {
        const state = get();
        const quest = state.quests.find(q => q.id === id);
        
        if (quest && !quest.completed) {
          // Обновляем состояние квеста
          const updatedQuests = state.quests.map(q => 
            q.id === id ? { ...q, completed: true } : q
          );
          
          // Выдаем награду
          set({
            quests: updatedQuests,
            currentCurrency: state.currentCurrency + quest.reward,
            totalCurrency: state.totalCurrency + quest.reward,
          });
          
          // Показываем уведомление
          toast.success(`Задание выполнено: ${quest.name}! Награда: ${quest.reward}`);
          
          // Воспроизводим звук награды
          const { playSuccess } = useAudio.getState();
          playSuccess();
        }
      },
      
      updateQuestProgress: (category: string, amount: number) => {
        const state = get();
        const updatedQuests = state.quests.map(quest => {
          if (quest.category === category && !quest.completed) {
            const newProgress = quest.progress + amount;
            // Если прогресс достиг цели, отмечаем задание как выполненное
            if (newProgress >= quest.target) {
              get().completeQuest(quest.id);
              return { ...quest, progress: newProgress, completed: true };
            }
            return { ...quest, progress: newProgress };
          }
          return quest;
        });
        
        set({ quests: updatedQuests });
      },
      
      checkQuests: () => {
        const state = get();
        
        // Проверяем задания по уровню
        if (state.level >= 5) {
          const levelQuest = state.quests.find(q => q.id === 'reach_level_5');
          if (levelQuest && !levelQuest.completed) {
            get().completeQuest('reach_level_5');
          }
        }
        
        // Другие проверки можно добавить здесь
      },
      
      // Методы для работы с обучением
      completeTutorialStep: (id: string) => {
        const state = get();
        const tutorialStep = state.tutorial.find(t => t.id === id);
        
        if (tutorialStep && !tutorialStep.completed) {
          // Обновляем состояние шага обучения
          const updatedTutorial = state.tutorial.map(t => 
            t.id === id ? { ...t, completed: true } : t
          );
          
          set({ tutorial: updatedTutorial });
          
          // Проверяем, все ли шаги обучения выполнены
          const allCompleted = updatedTutorial.every(t => t.completed);
          if (allCompleted && !state.tutorialCompleted) {
            set({ tutorialCompleted: true });
            toast.success('Обучение успешно завершено!');
          } else {
            // Находим следующий шаг обучения
            const nextStep = updatedTutorial.find(t => !t.completed);
            if (nextStep) {
              toast.info(`Следующий шаг: ${nextStep.title}`);
            }
          }
        }
      },
      
      checkTutorial: () => {
        const state = get();
        
        // Если обучение уже завершено, не делаем ничего
        if (state.tutorialCompleted) return;
        
        // Проверяем первый шаг - клик
        if (!state.tutorial[0].completed && state.manualClicks > 0) {
          get().completeTutorialStep('tutorial_click');
        }
        
        // Проверяем второй шаг - покупка бизнеса
        if (state.tutorial[0].completed && !state.tutorial[1].completed && state.buildings.length > 0) {
          get().completeTutorialStep('tutorial_business');
        }
        
        // Проверяем третий шаг - покупка улучшения
        if (state.tutorial[1].completed && !state.tutorial[2].completed && state.upgrades.length > 0) {
          get().completeTutorialStep('tutorial_upgrade');
        }
        
        // Четвертый шаг - ознакомление с заданиями, отмечается вручную через UI
      },
      
      setTutorialCompleted: (completed: boolean) => {
        set({ tutorialCompleted: completed });
      },
      
      // Заглушки для новых методов (будут реализованы позже)
      buyVehicle: (id: string) => {
        // Будет реализовано позже
        get().updateQuestProgress('vehicle', 1);
      },
      
      buyStock: (id: string, amount: number) => {
        // Будет реализовано позже
        get().updateQuestProgress('stock', amount);
      },
      
      buyCrypto: (id: string, amount: number) => {
        // Будет реализовано позже
        get().updateQuestProgress('crypto', amount);
      },
      
      buyYacht: (id: string) => {
        // Будет реализовано позже
        get().updateQuestProgress('yacht', 1);
      },
      
      addMultiplier: (type: MultiplierType, value: number, targetId?: string) => {
        if (type === 'click') {
          // Постоянный множитель для клика
          set({ clickValue: get().clickValue * value });
        } else if (type === 'income') {
          // Постоянный множитель для всего пассивного дохода
          set({ passiveIncome: get().passiveIncome * value });
        } else if (type === 'building' && targetId) {
          // Постоянный множитель для конкретного здания
          const updatedBuildings = get().buildings.map(building => {
            if (building.id === targetId) {
              const newIncomePerSecond = building.baseIncomePerSecond * value;
              const incomeDifference = (newIncomePerSecond - building.baseIncomePerSecond) * building.count;
              
              // Обновляем общий пассивный доход
              set({ passiveIncome: get().passiveIncome + incomeDifference });
              
              return {
                ...building,
                baseIncomePerSecond: newIncomePerSecond
              };
            }
            return building;
          });
          
          set({ buildings: updatedBuildings });
        }
      },
      
      addTemporaryMultiplier: (type: MultiplierType, value: number, durationInSeconds: number, targetId?: string) => {
        const expiresAt = Date.now() + durationInSeconds * 1000;
        
        // Добавляем новый временный множитель
        const newMultiplier: TemporaryMultiplier = {
          type,
          value,
          expiresAt,
          targetId
        };
        
        // Фиксируем событие просмотра рекламы и активации буста
        applovinService.trackEvent(AdjustEvent.AD_WATCHED, { 
          boost_type: type,
          boost_value: value,
          boost_duration: durationInSeconds 
        });
        
        set({ temporaryMultipliers: [...get().temporaryMultipliers, newMultiplier] });
      },
      
      updateMultipliers: () => {
        const now = Date.now();
        const activeMultipliers = get().temporaryMultipliers.filter(
          multiplier => multiplier.expiresAt > now
        );
        
        if (activeMultipliers.length !== get().temporaryMultipliers.length) {
          set({ temporaryMultipliers: activeMultipliers });
        }
      },

      click: () => {
        const { playHit } = useAudio.getState();
        playHit();
        
        const state = get();
        
        // Применяем временные множители к клику
        let clickMultiplier = 1;
        state.temporaryMultipliers.forEach(multiplier => {
          if (multiplier.type === 'click' && multiplier.expiresAt > Date.now()) {
            clickMultiplier *= multiplier.value;
          }
        });
        
        const effectiveClickValue = state.clickValue * clickMultiplier;
        
        set((state) => {
          // Добавляем XP при клике
          const newXP = state.xp + 2;
          let newLevel = state.level;
          let newXPRequired = state.xpRequired;
          
          // Проверяем, достигнут ли новый уровень
          if (newXP >= state.xpRequired) {
            newLevel = state.level + 1;
            // Каждый следующий уровень требует на 50% больше XP
            newXPRequired = Math.floor(state.xpRequired * 1.5);
            
            // Фиксируем событие повышения уровня
            applovinService.trackEvent(AdjustEvent.LEVEL_ACHIEVED, { level: newLevel });
            
            // Показываем уведомление о новом уровне
            toast.success(`Уровень повышен! Теперь вы на уровне ${newLevel}`);
            
            // Обновляем прогресс задания по достижению уровня
            setTimeout(() => get().updateQuestProgress('level', 1), 100);
          }
          
          return {
            currentCurrency: state.currentCurrency + effectiveClickValue,
            totalCurrency: state.totalCurrency + effectiveClickValue,
            manualClicks: state.manualClicks + 1,
            xp: newXP >= state.xpRequired ? newXP - state.xpRequired : newXP,
            level: newLevel,
            xpRequired: newXPRequired
          };
        });
        
        // Проверяем достижения после клика
        get().checkAchievements();
        
        // Проверяем шаги обучения
        get().checkTutorial();
        
        // Проверяем задания
        get().checkQuests();
      },

      buyUpgrade: (id: string) => {
        const state = get();
        const upgrade = getUpgradeById(id);
        
        if (!upgrade) return;
        
        // Check if upgrade is already owned
        if (state.upgrades.find(u => u.id === id)) {
          toast.error("Вы уже приобрели это улучшение!");
          return;
        }
        
        const price = calculateUpgradePrice(upgrade);
        
        if (state.currentCurrency >= price) {
          const { playSuccess } = useAudio.getState();
          playSuccess();
          
          // Apply upgrade effects
          let newClickValue = state.clickValue;
          let newPassiveIncome = state.passiveIncome;
          
          if (upgrade.effect.type === 'click_multiplier') {
            newClickValue = state.clickValue * upgrade.effect.value;
          } else if (upgrade.effect.type === 'passive_income_multiplier') {
            newPassiveIncome = state.passiveIncome * upgrade.effect.value;
          }
          
          set({
            currentCurrency: state.currentCurrency - price,
            clickValue: newClickValue,
            passiveIncome: newPassiveIncome,
            upgrades: [...state.upgrades, { ...upgrade, purchasedAt: Date.now() }],
          });
          
          toast.success(`Куплено: ${upgrade.name}`);
          
          // Проверяем шаги обучения
          get().checkTutorial();
        } else {
          toast.error("Недостаточно средств!");
        }
      },

      buyBuilding: (id: string) => {
        const state = get();
        const buildingTemplate = getBuildingById(id);
        
        if (!buildingTemplate) return;
        
        // Find if player already owns this building type
        const existingBuilding = state.buildings.find(b => b.id === id);
        const count = existingBuilding ? existingBuilding.count + 1 : 1;
        const price = calculateBuildingPrice(buildingTemplate, count - 1);
        
        if (state.currentCurrency >= price) {
          const { playSuccess } = useAudio.getState();
          playSuccess();
          
          // Calculate new passive income
          const incomePerSecond = buildingTemplate.baseIncomePerSecond;
          let newPassiveIncome = state.passiveIncome + incomePerSecond;
          
          // Update or add building
          const updatedBuildings = existingBuilding 
            ? state.buildings.map(b => 
                b.id === id 
                  ? { ...b, count: b.count + 1, lastPurchasedAt: Date.now() } 
                  : b
              )
            : [...state.buildings, { 
                ...buildingTemplate, 
                count: 1, 
                purchasedAt: Date.now(),
                lastPurchasedAt: Date.now() 
              }];
          
          set({
            currentCurrency: state.currentCurrency - price,
            passiveIncome: newPassiveIncome,
            buildings: updatedBuildings,
          });
          
          toast.success(`Куплено: ${buildingTemplate.name}`);
          
          // Обновляем прогресс задания
          get().updateQuestProgress('building', 1);
          
          // Проверяем шаги обучения
          get().checkTutorial();
        } else {
          toast.error("Недостаточно средств!");
        }
      },

      setManualClicks: (count: number) => set({ manualClicks: count }),
      setTotalCurrency: (amount: number) => set({ totalCurrency: amount }),
      setCurrentCurrency: (amount: number) => set({ currentCurrency: amount }),
      
      addCurrency: (amount: number) => {
        set((state) => ({
          currentCurrency: state.currentCurrency + amount,
          totalCurrency: state.totalCurrency + amount,
        }));
      },
      
      resetGame: () => {
        set(initialState);
        toast.success("Game reset successful!");
      },
      
      saveGameState: () => {
        set({ lastSavedAt: Date.now() });
      },
      
      loadGameState: () => {
        // This function is automatically handled by the persist middleware
        // but we keep it for clarity and potential future manual operations
        const now = Date.now();
        const lastSaved = get().lastSavedAt;
        const elapsedTimeInSeconds = Math.floor((now - lastSaved) / 1000);
        
        // If there was some time passed since last save, add offline progress
        if (elapsedTimeInSeconds > 10) { // Only process if more than 10 seconds have passed
          const passiveIncome = get().passiveIncome;
          const offlineEarnings = passiveIncome * elapsedTimeInSeconds * 0.5; // 50% efficiency when offline
          
          if (offlineEarnings > 0) {
            set((state) => ({
              currentCurrency: state.currentCurrency + offlineEarnings,
              totalCurrency: state.totalCurrency + offlineEarnings,
            }));
            
            toast.info(`Welcome back! You earned ${offlineEarnings.toFixed(0)} while away.`);
          }
          
          set({ lastSavedAt: now });
        }
      },
      
      // Game loop for passive income
      startGameLoop: () => {
        const gameLoop = setInterval(() => {
          const state = get();
          
          // Обновляем временные множители
          get().updateMultipliers();
          
          // Расчет пассивного дохода с учетом множителей
          let effectivePassiveIncome = state.passiveIncome;
          state.temporaryMultipliers.forEach(multiplier => {
            if (multiplier.type === 'income' && multiplier.expiresAt > Date.now()) {
              effectivePassiveIncome *= multiplier.value;
            }
          });
          
          if (effectivePassiveIncome > 0) {
            set((state) => ({
              currentCurrency: state.currentCurrency + effectivePassiveIncome,
              totalCurrency: state.totalCurrency + effectivePassiveIncome,
              activeGameTime: state.activeGameTime + 1,
            }));
          } else {
            // Даже если нет пассивного дохода, увеличиваем счетчик времени
            set((state) => ({
              activeGameTime: state.activeGameTime + 1
            }));
          }
          
          // Проверяем достижения каждые 5 секунд
          if (state.activeGameTime % 5 === 0) {
            get().checkAchievements();
          }
          
          // Save the game state every minute
          if (state.activeGameTime % 60 === 0) {
            get().saveGameState();
          }
          
          // Показываем межстраничную рекламу каждые 5 минут игры
          if (state.activeGameTime % 300 === 0 && state.activeGameTime > 0) {
            applovinService.showInterstitialAd();
          }
        }, 1000);
        
        // @ts-ignore - storing the interval ID in window for cleanup
        window.gameLoopInterval = gameLoop;
      },
      
      addXP: (amount: number) => {
        set((state) => {
          // Добавляем опыт
          const newXP = state.xp + amount;
          let newLevel = state.level;
          let newXPRequired = state.xpRequired;
          let levelUp = false;
          // Проверяем, достигнут ли новый уровень
          if (newXP >= state.xpRequired) {
            newLevel = state.level + 1;
            newXPRequired = Math.floor(state.xpRequired * 1.5);
            levelUp = true;
            // Показываем уведомление о новом уровне
            toast.success(`Уровень повышен! Теперь вы на уровне ${newLevel}`);
          }
          // Отправка аналитики при повышении уровня
          if (levelUp) {
            trackAnalyticsEvent({
              event: 'level_up',
              level: newLevel
            });
            // milestone_level
            const milestones = [5, 10, 25, 50, 99];
            if (milestones.includes(newLevel)) {
              trackAnalyticsEvent({
                event: 'milestone_level',
                level: newLevel
              });
            }
          }
          return {
            xp: newXP >= state.xpRequired ? newXP - state.xpRequired : newXP,
            level: newLevel,
            xpRequired: newXPRequired
          };
        });
      },
      
      checkAchievements: () => {
        const state = get();
        const { achievements } = state;
        
        // Определяем список достижений, которые можно получить
        const availableAchievements = [
          // Достижения за клики
          {
            id: 'clicks_novice',
            name: 'Новичок Кликер',
            description: 'Сделайте 100 кликов',
            category: 'clicks' as const,
            target: 100,
            reward: 50,
            icon: 'mouse-pointer-click',
            progress: state.manualClicks
          },
          {
            id: 'clicks_intermediate',
            name: 'Опытный Кликер',
            description: 'Сделайте 1000 кликов',
            category: 'clicks' as const,
            target: 1000,
            reward: 500,
            icon: 'mouse-pointer-click',
            progress: state.manualClicks
          },
          // Достижения за валюту
          {
            id: 'currency_first',
            name: 'Первый Заработок',
            description: 'Заработайте 1000 монет',
            category: 'currency' as const,
            target: 1000,
            reward: 100,
            icon: 'dollar-sign',
            progress: state.totalCurrency
          },
          {
            id: 'currency_businessman',
            name: 'Бизнесмен',
            description: 'Заработайте 10000 монет',
            category: 'currency' as const,
            target: 10000,
            reward: 1000,
            icon: 'dollar-sign',
            progress: state.totalCurrency
          },
          // Достижения за здания
          {
            id: 'buildings_starter',
            name: 'Начинающий Застройщик',
            description: 'Приобретите 5 зданий',
            category: 'buildings' as const,
            target: 5,
            reward: 200,
            icon: 'building',
            progress: state.buildings.reduce((sum, b) => sum + b.count, 0)
          },
          // Достижения за улучшения
          {
            id: 'upgrades_first',
            name: 'Первое Улучшение',
            description: 'Приобретите 1 улучшение',
            category: 'upgrades' as const,
            target: 1,
            reward: 100,
            icon: 'zap',
            progress: state.upgrades.length
          }
        ];
        
        // Проверяем каждое достижение
        for (const achievement of availableAchievements) {
          // Проверяем, не получено ли уже это достижение
          const alreadyUnlocked = achievements.some(a => a.id === achievement.id && a.unlockedAt);
          
          // Если достижение еще не получено и цель достигнута, разблокируем его
          if (!alreadyUnlocked && achievement.progress >= achievement.target) {
            get().unlockAchievement(achievement.id);
          }
        }
      },
      
      unlockAchievement: (id: string) => {
        set((state) => {
          // Находим достижение в нашем списке
          const availableAchievements = [
            // Достижения за клики
            {
              id: 'clicks_novice',
              name: 'Новичок Кликер',
              description: 'Сделайте 100 кликов',
              category: 'clicks' as const,
              target: 100,
              reward: 50,
              icon: 'mouse-pointer-click',
              progress: state.manualClicks
            },
            {
              id: 'clicks_intermediate',
              name: 'Опытный Кликер',
              description: 'Сделайте 1000 кликов',
              category: 'clicks' as const,
              target: 1000,
              reward: 500,
              icon: 'mouse-pointer-click',
              progress: state.manualClicks
            },
            // Достижения за валюту
            {
              id: 'currency_first',
              name: 'Первый Заработок',
              description: 'Заработайте 1000 монет',
              category: 'currency' as const,
              target: 1000,
              reward: 100,
              icon: 'dollar-sign',
              progress: state.totalCurrency
            },
            {
              id: 'currency_businessman',
              name: 'Бизнесмен',
              description: 'Заработайте 10000 монет',
              category: 'currency' as const,
              target: 10000,
              reward: 1000,
              icon: 'dollar-sign',
              progress: state.totalCurrency
            },
            // Достижения за здания
            {
              id: 'buildings_starter',
              name: 'Начинающий Застройщик',
              description: 'Приобретите 5 зданий',
              category: 'buildings' as const,
              target: 5,
              reward: 200,
              icon: 'building',
              progress: state.buildings.reduce((sum, b) => sum + b.count, 0)
            },
            // Достижения за улучшения
            {
              id: 'upgrades_first',
              name: 'Первое Улучшение',
              description: 'Приобретите 1 улучшение',
              category: 'upgrades' as const,
              target: 1,
              reward: 100,
              icon: 'zap',
              progress: state.upgrades.length
            }
          ];
          
          const achievement = availableAchievements.find(a => a.id === id);
          
          if (!achievement) return state;
          
          // Добавляем достижение в список разблокированных
          const updatedAchievements = [
            ...state.achievements.filter(a => a.id !== id),
            { ...achievement, unlockedAt: Date.now() }
          ];
          
          // Добавляем награду за достижение
          const { reward } = achievement;
          
          // Показываем уведомление
          toast.success(`Достижение разблокировано: ${achievement.name}! +${reward} монет`);
          // Отправка аналитики о достижении
          trackAnalyticsEvent({
            event: 'achievement_unlocked',
            achievement_id: achievement.id,
            achievement_name: achievement.name,
            reward: achievement.reward
          });
          // Возвращаем обновленное состояние
          return {
            achievements: updatedAchievements,
            currentCurrency: state.currentCurrency + reward,
            totalCurrency: state.totalCurrency + reward
          };
        });
      },
      
      buyRealEstate: (id: string) => {
        const state = get();
        const realEstate = state.realEstate.find(re => re.id === id);
        
        if (!realEstate || realEstate.owned) return;
        
        if (state.currentCurrency >= realEstate.price) {
          const { playSuccess } = useAudio.getState();
          playSuccess();
          
          // Обновляем пассивный доход
          const newPassiveIncome = state.passiveIncome + (realEstate.income / 3600); // Конвертируем часовой доход в доход за секунду
          
          // Обновляем список недвижимости
          const updatedRealEstate = state.realEstate.map(re => 
            re.id === id 
              ? { ...re, owned: true, purchasedAt: Date.now() } 
              : re
          );
          
          set({
            currentCurrency: state.currentCurrency - realEstate.price,
            passiveIncome: newPassiveIncome,
            realEstate: updatedRealEstate,
          });
          
          toast.success(`Куплена недвижимость: ${realEstate.name}`);
          
          // Проверяем достижения после покупки
          get().checkAchievements();
          get().addXP(50); // Даем опыт за покупку недвижимости
        } else {
          toast.error("Недостаточно денег!");
        }
      },
      
      stopGameLoop: () => {
        // @ts-ignore
        if (window.gameLoopInterval) {
          // @ts-ignore
          clearInterval(window.gameLoopInterval);
        }
        get().saveGameState();
      },
    }),
    {
      name: "tycoon-clicker-storage",
    }
  )
);
