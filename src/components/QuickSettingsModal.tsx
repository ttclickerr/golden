import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FirebaseAuth } from '@/components/FirebaseAuth';



interface QuickSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConsent: () => void;
  gameState?: any;
  onGameStateLoad?: () => void;
  onGameStateSave?: () => void;
}

export function QuickSettingsModal({ isOpen, onClose, onOpenConsent, gameState, onGameStateLoad, onGameStateSave }: QuickSettingsModalProps) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('tycoon-sound') !== 'false';
  });
  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('tycoon-sound', newValue.toString());
  };

  const handleClearHistory = () => {
    if (confirm('Очистить всю историю транзакций?')) {
      localStorage.removeItem('tycoon-transactions');
      localStorage.removeItem('tycoon-gamestate');
      window.location.reload();
    }
  };

  const handleResetToStartBalance = () => {
    if (confirm('Сбросить игру до стартового баланса $99?')) {
      localStorage.removeItem('tycoon-clicker-save');
      localStorage.removeItem('tycoon-gamestate');
      localStorage.removeItem('tycoon-transactions');
      window.location.reload();
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border border-purple-500/20"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className="flex items-center justify-between p-6 border-b border-gradient-to-r from-purple-500/20 to-cyan-500/20 bg-gradient-to-r from-purple-900/30 to-cyan-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-violet-600 to-cyan-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">⚙️</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            НАСТРОЙКИ ИГРЫ
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-red-500/20 border border-gray-600/50 hover:border-red-500/50 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all duration-300"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto">
        {/* Звук */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">🔊</span>
            АУДИО НАСТРОЙКИ
          </h3>
          <button
            onClick={handleSoundToggle}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.02] ${
              soundEnabled
                ? 'border-cyan-500/50 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 text-cyan-300 shadow-lg shadow-cyan-500/20'
                : 'border-gray-600/50 bg-gradient-to-r from-gray-800/40 to-gray-700/40 text-gray-400 hover:border-gray-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Звуковые эффекты</span>
              <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                soundEnabled 
                  ? 'bg-cyan-500/20 text-cyan-300' 
                  : 'bg-gray-600/20 text-gray-400'
              }`}>
                {soundEnabled ? 'ВКЛЮЧЕНО' : 'ВЫКЛЮЧЕНО'}
              </span>
            </div>
          </button>
        </div>

        {/* Язык */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">🌐</span>
            ЯЗЫК ИНТЕРФЕЙСА
          </h3>
          <div className="p-4 rounded-xl border-2 border-green-500/50 bg-gradient-to-r from-green-900/40 to-emerald-900/40 text-green-300">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Русский</span>
              <span className="px-3 py-1 rounded-lg text-sm font-bold bg-green-500/20">ПО УМОЛЧАНИЮ</span>
            </div>
          </div>
        </div>

        {/* Firebase Authentication */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">☁️</span>
            ОБЛАЧНОЕ СОХРАНЕНИЕ
          </h3>
          <div className="rounded-xl border-2 border-purple-500/50 bg-gradient-to-r from-purple-900/40 to-violet-900/40 p-4">
            <FirebaseAuth 
              gameState={gameState || {}} 
              onGameStateLoad={onGameStateLoad || (()=>{})} 
              onGameStateSave={onGameStateSave || (()=>{})} 
            />
          </div>
        </div>

        {/* Данные */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">🗑️</span>
            УПРАВЛЕНИЕ ДАННЫМИ
          </h3>
          <button
            onClick={handleResetToStartBalance}
            className="w-full p-4 rounded-xl border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 text-yellow-300 hover:bg-gradient-to-r hover:from-yellow-900/60 hover:to-orange-900/60 transition-all duration-300 text-left hover:scale-[1.02] shadow-lg shadow-yellow-500/20 mb-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Сбросить до $99</span>
              <span className="px-3 py-1 rounded-lg text-sm font-bold bg-yellow-500/20">НОВАЯ ИГРА</span>
            </div>
          </button>
          
          <button
            onClick={handleClearHistory}
            className="w-full p-4 rounded-xl border-2 border-red-500/50 bg-gradient-to-r from-red-900/40 to-orange-900/40 text-red-300 hover:bg-gradient-to-r hover:from-red-900/60 hover:to-orange-900/60 transition-all duration-300 text-left hover:scale-[1.02] shadow-lg shadow-red-500/20"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Очистить историю</span>
              <span className="px-3 py-1 rounded-lg text-sm font-bold bg-red-500/20">ОЧИСТИТЬ ВСЕ</span>
            </div>
          </button>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">🛡️</span>
            НАСТРОЙКИ ПРИВАТНОСТИ
          </h3>
          <button
            onClick={() => {
              console.log('🔒 Открытие модального окна GDPR настроек...');
              onOpenConsent();
            }}
            className="w-full p-4 rounded-xl border-2 border-indigo-500/50 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 text-indigo-300 hover:bg-gradient-to-r hover:from-indigo-900/60 hover:to-purple-900/60 transition-all duration-300 text-left hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Управление согласиями</span>
              <span className="px-3 py-1 rounded-lg text-sm font-bold bg-indigo-500/20">GDPR</span>
            </div>
          </button>
        </div>
      </div>

      <div className="p-6 border-t border-gradient-to-r from-purple-500/20 to-cyan-500/20 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
        <Button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-purple-500 via-violet-600 to-cyan-500 hover:from-purple-600 hover:via-violet-700 hover:to-cyan-600 h-14 text-lg font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]"
        >
          ✓ СОХРАНИТЬ И ЗАКРЫТЬ
        </Button>
      </div>
    </div>
  );
}