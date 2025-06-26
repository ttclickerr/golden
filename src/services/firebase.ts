import { initializeApp, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit, where, updateDoc, increment } from 'firebase/firestore';
import { GameState, Investment, LeaderboardEntry } from '@/types/gameTypes';

const firebaseConfig = {
  apiKey: "AIzaSyDSv2HCSQKCklKrcQm1DHjz-geFFG9S7bs",
  authDomain: "tycoon-clicker-ca2ac.firebaseapp.com",
  projectId: "tycoon-clicker-ca2ac",
  storageBucket: "tycoon-clicker-ca2ac.appspot.com",
  appId: "1:809250963923:web:1fad78ae66acec410b6f26",
};

// Избегаем дублирования Firebase инициализации
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    app = getApp();
  } else {
    throw error;
  }
}
console.log('🔥 Firebase app initialized successfully');
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions for game data
export class FirebaseGameService {
  // Save game state
  static async saveGameState(userId: string, gameState: Partial<GameState>) {
    try {
      const gameRef = doc(db, 'gameStates', userId);
      await setDoc(gameRef, {
        ...gameState,
        lastUpdated: new Date().toISOString(),
      }, { merge: true });
      console.log('✅ Game state saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving game state:', error);
      throw error;
    }
  }

  // Load game state
  static async loadGameState(userId: string): Promise<GameState | null> {
    try {
      const gameRef = doc(db, 'gameStates', userId);
      const gameSnap = await getDoc(gameRef);
      
      if (gameSnap.exists()) {
        console.log('✅ Game state loaded from Firebase');
        return gameSnap.data() as GameState;
      } else {
        console.log('📄 No saved game state found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading game state:', error);
      throw error;
    }
  }

  // Save investments
  static async saveInvestments(userId: string, investments: Record<string, number>) {
    try {
      const investRef = doc(db, 'investments', userId);
      await setDoc(investRef, {
        investments,
        lastUpdated: new Date().toISOString(),
      }, { merge: true });
      console.log('✅ Investments saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving investments:', error);
      throw error;
    }
  }

  // Load investments
  static async loadInvestments(userId: string): Promise<Record<string, number> | null> {
    try {
      const investRef = doc(db, 'investments', userId);
      const investSnap = await getDoc(investRef);
      
      if (investSnap.exists()) {
        console.log('✅ Investments loaded from Firebase');
        return investSnap.data().investments;
      } else {
        console.log('📄 No saved investments found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading investments:', error);
      throw error;
    }
  }

  // Update leaderboard entry
  static async updateLeaderboard(userId: string, userData: {
    username: string;
    level: number;
    balance: number;
    totalWorth: number;
    country: string;
    isPremium?: boolean;
    customNickname?: string;
  }) {
    try {
      const leaderRef = doc(db, 'leaderboard', userId);
      await setDoc(leaderRef, {
        ...userData,
        userId,
        lastUpdated: new Date().toISOString(),
      }, { merge: true });
      console.log('✅ Leaderboard updated in Firebase');
    } catch (error) {
      console.error('❌ Error updating leaderboard:', error);
      throw error;
    }
  }

  // Get leaderboard
  static async getLeaderboard(limitCount: number = 50): Promise<LeaderboardEntry[]> {
    try {
      const leaderRef = collection(db, 'leaderboard');
      const q = query(leaderRef, orderBy('totalWorth', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      
      const leaderboard: LeaderboardEntry[] = [];
      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        leaderboard.push({
          rank: index + 1,
          username: data.customNickname || data.username,
          level: data.level,
          balance: data.balance,
          totalWorth: data.totalWorth,
          country: data.country,
          isPremium: data.isPremium || false,
          userId: data.userId,
        });
      });
      
      console.log(`✅ Loaded ${leaderboard.length} leaderboard entries from Firebase`);
      return leaderboard;
    } catch (error) {
      console.error('❌ Error loading leaderboard:', error);
      throw error;
    }
  }

  // Get user rank
  static async getUserRank(userId: string, userTotalWorth: number): Promise<number> {
    try {
      const leaderRef = collection(db, 'leaderboard');
      const q = query(leaderRef, where('totalWorth', '>', userTotalWorth));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.size + 1;
    } catch (error) {
      console.error('❌ Error getting user rank:', error);
      return 999;
    }
  }

  // Save user profile
  static async saveUserProfile(userId: string, profile: {
    username: string;
    email: string;
    isPremium: boolean;
    customNickname?: string;
    country: string;
  }) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...profile,
        lastUpdated: new Date().toISOString(),
      }, { merge: true });
      console.log('✅ User profile saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving user profile:', error);
      throw error;
    }
  }

  // Load user profile
  static async loadUserProfile(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        console.log('✅ User profile loaded from Firebase');
        return userSnap.data();
      } else {
        console.log('📄 No user profile found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      throw error;
    }
  }

  // Save purchase data
  static async savePurchase(userId: string, purchaseData: {
    type: 'weekly' | 'lifetime';
    transactionId: string;
    purchaseDate: string;
    platform: 'web' | 'android' | 'ios';
    price?: number;
    currency?: string;
  }) {
    try {
      const purchaseRef = doc(db, 'purchases', userId);
      await setDoc(purchaseRef, {
        ...purchaseData,
        userId,
        lastUpdated: new Date().toISOString(),
      }, { merge: true });
      console.log('✅ Purchase data saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving purchase data:', error);
      throw error;
    }
  }

  // Load purchase data
  static async loadPurchase(userId: string) {
    try {
      const purchaseRef = doc(db, 'purchases', userId);
      const purchaseSnap = await getDoc(purchaseRef);
      
      if (purchaseSnap.exists()) {
        const data = purchaseSnap.data();
        console.log('✅ Purchase data loaded from Firebase');
        
        // Проверяем валидность weekly подписки
        if (data.type === 'weekly') {
          const purchaseDate = new Date(data.purchaseDate);
          const now = new Date();
          const daysSincePurchase = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSincePurchase > 7) {
            console.log('⚠️ Weekly subscription expired');
            return { ...data, expired: true };
          }
        }
        
        return data;
      } else {
        console.log('📄 No purchase data found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading purchase data:', error);
      throw error;
    }
  }

  // Restore purchases from cloud
  static async restorePurchases(userId: string) {
    try {
      const purchaseData = await this.loadPurchase(userId);
      
      if (purchaseData && !purchaseData.expired) {
        // Восстанавливаем premium статус в localStorage
        localStorage.setItem('premium-type', purchaseData.type);
        localStorage.setItem('premium-purchase-date', purchaseData.purchaseDate);
        localStorage.setItem('premium-transaction-id', purchaseData.transactionId);
        
        console.log(`✅ Premium ${purchaseData.type} status restored from cloud`);
        return {
          success: true,
          type: purchaseData.type,
          purchaseDate: purchaseData.purchaseDate
        };
      } else if (purchaseData?.expired) {
        // Очищаем expired подписку
        localStorage.removeItem('premium-type');
        localStorage.removeItem('premium-purchase-date');
        localStorage.removeItem('premium-transaction-id');
        
        console.log('⚠️ Expired subscription removed');
        return {
          success: false,
          message: 'Subscription expired'
        };
      } else {
        console.log('📄 No valid purchases to restore');
        return {
          success: false,
          message: 'No purchases found'
        };
      }
    } catch (error) {
      console.error('❌ Error restoring purchases:', error);
      throw error;
    }
  }
}