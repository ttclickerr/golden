/**
 * Сервис для работы с хранилищем данных игры
 * Обеспечивает сохранение и загрузку игрового состояния,
 * синхронизацию с сервером и локальное хранение данных
 */

import { GameState } from "@/types/game";
import { applovinService, AdjustEvent } from "./ApplovinService";

// Ключи для хранения данных
export enum StorageKeys {
  GAME_STATE = 'tycoon_game_state',
  SETTINGS = 'tycoon_settings',
  PLAYER_INFO = 'tycoon_player',
  SYNC_ID = 'tycoon_sync_id'
}

// Опции сохранения
interface SaveOptions {
  /**
   * Синхронизировать с сервером
   */
  syncWithServer?: boolean; 
  
  /**
   * Обрабатывать офлайн-прогресс при загрузке
   */
  processOfflineProgress?: boolean;
  
  /**
   * Трекать событие через Adjust
   */
  trackEvent?: boolean;
}

class StorageService {
  // ID для синхронизации с сервером
  private syncId: string | null = null;
  
  // Флаг, указывающий, загружены ли данные
  private isLoaded: boolean = false;
  
  constructor() {
    // Инициализируем syncId из локального хранилища
    this.syncId = localStorage.getItem(StorageKeys.SYNC_ID);
  }
  
  /**
   * Сохранить игровое состояние
   */
  saveGameState(gameState: GameState, options: SaveOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Создаем копию состояния для хранения
        const stateToSave = {
          ...gameState,
          lastSavedAt: Date.now()
        };
        
        // Сохраняем в локальное хранилище
        localStorage.setItem(StorageKeys.GAME_STATE, JSON.stringify(stateToSave));
        
        // Отслеживаем событие сохранения
        if (options.trackEvent) {
          applovinService.trackEvent(AdjustEvent.APP_OPEN, { action: 'save_game' });
        }
        
        // Синхронизируем с сервером, если требуется
        if (options.syncWithServer) {
          this.syncWithServer(stateToSave)
            .then(() => resolve(true))
            .catch(() => resolve(true)); // Даже если синхронизация не удалась, считаем сохранение успешным
        } else {
          resolve(true);
        }
      } catch (error) {
        console.error('Error saving game state:', error);
        resolve(false);
      }
    });
  }
  
  /**
   * Загрузить игровое состояние
   */
  loadGameState(options: SaveOptions = {}): Promise<GameState | null> {
    return new Promise((resolve) => {
      try {
        // Получаем данные из локального хранилища
        const savedStateJson = localStorage.getItem(StorageKeys.GAME_STATE);
        
        if (!savedStateJson) {
          this.isLoaded = true;
          resolve(null);
          return;
        }
        
        const savedState = JSON.parse(savedStateJson) as GameState;
        
        // Обработка офлайн-прогресса, если требуется
        if (options.processOfflineProgress) {
          const now = Date.now();
          const lastSaved = savedState.lastSavedAt;
          const elapsedTimeInSeconds = Math.floor((now - lastSaved) / 1000);
          
          // Обновляем время активной игры
          savedState.activeGameTime += elapsedTimeInSeconds;
          
          // Отмечаем, что данные загружены
          this.isLoaded = true;
          
          // Отслеживаем событие загрузки
          if (options.trackEvent) {
            applovinService.trackEvent(AdjustEvent.APP_OPEN, { 
              action: 'load_game',
              offline_time: elapsedTimeInSeconds
            });
          }
        }
        
        resolve(savedState);
      } catch (error) {
        console.error('Error loading game state:', error);
        resolve(null);
      }
    });
  }
  
  /**
   * Синхронизировать данные с сервером
   */
  private syncWithServer(gameState: GameState): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // В реальной реализации здесь будет код для отправки данных на сервер
      console.log('Syncing game state with server:', gameState);
      
      // Заглушка для разработки
      setTimeout(() => {
        if (Math.random() > 0.2) { // 80% успешных синхронизаций для симуляции
          // Генерируем syncId, если его еще нет
          if (!this.syncId) {
            this.syncId = `sync_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
            localStorage.setItem(StorageKeys.SYNC_ID, this.syncId);
          }
          resolve(true);
        } else {
          console.error('Failed to sync with server (simulated failure)');
          reject(new Error('Simulated server sync failure'));
        }
      }, 1000);
    });
  }
  
  /**
   * Очистить все данные
   */
  clearAllData(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        localStorage.removeItem(StorageKeys.GAME_STATE);
        localStorage.removeItem(StorageKeys.SETTINGS);
        localStorage.removeItem(StorageKeys.PLAYER_INFO);
        // Оставляем syncId для идентификации пользователя
        
        resolve(true);
      } catch (error) {
        console.error('Error clearing data:', error);
        resolve(false);
      }
    });
  }
  
  /**
   * Проверить, загружены ли данные
   */
  isDataLoaded(): boolean {
    return this.isLoaded;
  }
  
  /**
   * Проверить, есть ли сохраненные данные
   */
  hasSavedData(): boolean {
    return localStorage.getItem(StorageKeys.GAME_STATE) !== null;
  }
  
  /**
   * Получить ID синхронизации
   */
  getSyncId(): string | null {
    return this.syncId;
  }
}

// Экспортируем синглтон для использования во всем приложении
export const storageService = new StorageService();