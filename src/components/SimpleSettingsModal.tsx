import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SimpleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleSettingsModal({ isOpen, onClose }: SimpleSettingsModalProps) {
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
      window.location.reload();
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[hsl(var(--tropico-teal))] to-[hsl(var(--tropico-cyan))] flex items-center justify-center">
            <span className="text-white text-sm font-bold">⚙️</span>
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-[hsl(var(--tropico-teal))] to-[hsl(var(--tropico-cyan))] bg-clip-text text-transparent">
            Settings
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Язык */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
            🌐 Язык
          </h3>
          <div className="p-3 rounded-lg border border-white/20 text-white/70">
            Русский (по умолчанию)
          </div>
        </div>

        {/* Звук */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
            🔊 Звук
          </h3>
          <button
            onClick={handleSoundToggle}
            className={`w-full p-3 rounded-lg border text-left transition-all ${
              soundEnabled
                ? 'border-[hsl(var(--tropico-teal))] bg-[hsl(var(--tropico-teal))]/10 text-[hsl(var(--tropico-teal))]'
                : 'border-white/20 text-white/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Звуковые эффекты</span>
              <span className="text-sm">{soundEnabled ? 'Вкл' : 'Выкл'}</span>
            </div>
          </button>
        </div>

        {/* Данные */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
            🗑️ Данные
          </h3>
          <button
            onClick={handleClearHistory}
            className="w-full p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-left"
          >
            Очистить историю транзакций
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        <Button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-[hsl(var(--tropico-teal))] to-[hsl(var(--tropico-cyan))] hover:opacity-90 h-12"
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
}