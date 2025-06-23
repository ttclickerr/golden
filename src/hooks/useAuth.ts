import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signInWithGoogle, signOutUser, FirebaseGameService } from '@/services/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        console.log('🔐 User signed in:', user.displayName || user.email);
        
        // Автоматическое восстановление покупок и игрового состояния при входе
        try {
          // Восстанавливаем покупки
          const restoreResult = await FirebaseGameService.restorePurchases(user.uid);
          if (restoreResult.success) {
            console.log(`🔄 Premium ${restoreResult.type} status restored automatically`);
          }
          
          // Восстанавливаем игровое состояние
          const gameState = await FirebaseGameService.loadGameState(user.uid);
          if (gameState) {
            console.log('🔄 Game state restored from cloud:', gameState);
            localStorage.setItem('tycoon-clicker-save', JSON.stringify(gameState));
            // Перезагружаем страницу для применения всех изменений
            window.location.reload();
          }
        } catch (error) {
          console.error('❌ Failed to restore data:', error);
        }
      } else {
        console.log('🔐 User signed out');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setError(null);
      setLoading(true);
      const user = await signInWithGoogle();
      console.log('✅ Successfully signed in');
      return user;
    } catch (error: any) {
      // Не показываем ошибку если пользователь просто закрыл окно
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message);
        console.error('❌ Sign in failed:', error);
        throw error;
      } else {
        console.log('🔐 User cancelled sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await signOutUser();
      console.log('✅ Successfully signed out');
    } catch (error: any) {
      setError(error.message);
      console.error('❌ Sign out failed:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
};