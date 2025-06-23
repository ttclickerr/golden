import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { FirebaseGameService } from '@/services/firebase';
import { Cloud, CheckCircle, LogOut, Loader2 } from 'lucide-react';

interface FirebaseAuthProps {
  gameState: any;
  onGameStateLoad: (gameState: any) => void;
  onGameStateSave: () => void;
}

export const FirebaseAuth = ({ gameState, onGameStateLoad, onGameStateSave }: FirebaseAuthProps) => {
  const { user, signIn, signOut, loading, isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Auto-save every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const autoSave = async () => {
      try {
        setIsSaving(true);
        await FirebaseGameService.saveGameState(user.uid, {
          userId: user.uid,
          balance: gameState.balance,
          level: gameState.level,
          experience: gameState.experience,
          prestige: gameState.prestige,
          lastUpdated: new Date().toISOString(),
        });

        await FirebaseGameService.saveInvestments(user.uid, gameState.investments);
        
        await FirebaseGameService.updateLeaderboard(user.uid, {
          username: user.displayName || 'Неизвестный игрок',
          level: gameState.level,
          balance: gameState.balance,
          totalWorth: gameState.balance + Object.values(gameState.investments).reduce((sum: number, qty: any) => sum + (typeof qty === 'number' ? qty * 100 : 0), 0),
          country: 'Россия',
          isPremium: gameState.isPremium || false,
        });

        setLastSyncTime(new Date().toLocaleTimeString());
        onGameStateSave();
      } catch (error) {
        console.error('Ошибка автосохранения:', error);
      } finally {
        setIsSaving(false);
      }
    };

    // Initial save after login
    autoSave();

    // Set up auto-save interval
    const interval = setInterval(autoSave, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user, gameState, onGameStateSave]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn();
    } catch (error) {
      console.error('Ошибка входа:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadProgress = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const savedGameState = await FirebaseGameService.loadGameState(user.uid);
      const savedInvestments = await FirebaseGameService.loadInvestments(user.uid);

      if (savedGameState) {
        const loadedState = {
          ...gameState,
          ...savedGameState,
          investments: savedInvestments || gameState.investments,
        };
        onGameStateLoad(loadedState);
        setLastSyncTime(new Date().toLocaleTimeString());
        console.log('✅ Прогресс загружен из облака');
      }
    } catch (error) {
      console.error('Ошибка загрузки прогресса:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setLastSyncTime(null);
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--tropico-cyan))]" />
        <span className="ml-2 text-gray-300">Подключение...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-400 mb-3">
          Войдите через Google, чтобы сохранить прогресс в облаке и синхронизировать его между устройствами.
        </div>
        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Cloud className="w-4 h-4 mr-2" />
          )}
          Войти через Google
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-400" />
        <div className="flex-1">
          <div className="text-sm font-medium text-green-400">
            Подключено как {user.displayName || user.email}
          </div>
          {lastSyncTime && (
            <div className="text-xs text-gray-400">
              Последняя синхронизация: {lastSyncTime}
            </div>
          )}
        </div>
        {isSaving && (
          <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--tropico-cyan))]" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleLoadProgress}
          disabled={isLoading}
          variant="outline"
          className="text-sm"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Cloud className="w-4 h-4 mr-1" />
          )}
          Загрузить
        </Button>
        
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="text-sm"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Выйти
        </Button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Автосохранение каждые 30 секунд
      </div>
    </div>
  );
};