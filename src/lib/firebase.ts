import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, OAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";

// Firebase конфигурация
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDSv2HCSQKCklKrcQm1DHjz-geFFG9S7bs",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "tycoon-clicker-ca2ac"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tycoon-clicker-ca2ac",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "tycoon-clicker-ca2ac"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:809250963923:web:1fad78ae66acec410b6f26",
};

// Инициализация Firebase
let app: any = null;
let auth: any = null;
let db: any = null;

export const initializeFirebase = () => {
  if (!app) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('🔥 Firebase app initialized successfully');
  }
  return true;
};

export const getFirebaseAuth = () => {
  if (!auth) initializeFirebase();
  return auth;
};
export const getFirebaseApp = () => {
  if (!app) initializeFirebase();
  return app;
};

// Google аутентификация
export const signInWithGoogle = async () => {
  initializeFirebase();
  const auth = getFirebaseAuth();
  if (!auth) {
    console.warn('❌ Firebase не инициализирован');
    return null;
  }
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('❌ Подробная ошибка входа через Google:', error);
    throw error;
  }
};

// Email аутентификация
export const signInWithEmail = async (email: string, password: string) => {
  initializeFirebase();
  const auth = getFirebaseAuth();
  if (!auth) return null;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    }
    throw error;
  }
};

// Apple аутентификация (OAuth)
export const signInWithApple = async () => {
  initializeFirebase();
  const auth = getFirebaseAuth();
  if (!auth) return null;
  try {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    await signInWithRedirect(auth, provider);
  } catch (error) {
    throw error;
  }
};

// Выход из аккаунта
export const signOutUser = async () => {
  if (!auth) return;
  
  try {
    await signOut(auth);
    console.log('👋 Пользователь вышел из аккаунта');
  } catch (error) {
    console.error('❌ Ошибка выхода:', error);
    throw error;
  }
};

// Слушатель состояния аутентификации
export const onAuthStateChange = (callback: (user: any) => void) => {
  if (!auth) return () => {};
  
  return onAuthStateChanged(auth, (user) => {
    console.log('🔐 Состояние аутентификации изменено:', user ? 'вошел' : 'вышел');
    callback(user);
  });
};

// Сохранение игрового состояния пользователя
export const saveUserGameState = async (userId: string, gameState: any) => {
  if (!db) {
    console.warn('Firestore не инициализирован');
    return false;
  }
  
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      gameState,
      lastUpdated: new Date(),
      version: '1.0'
    }, { merge: true });
    
    console.log('💾 Игровое состояние сохранено в Firebase');
    return true;
  } catch (error) {
    console.error('❌ Ошибка сохранения в Firebase:', error);
    return false;
  }
};

// Загрузка игрового состояния пользователя
export const loadUserGameState = async (userId: string) => {
  if (!db) {
    console.warn('Firestore не инициализирован');
    return null;
  }
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('📥 Игровое состояние загружено из Firebase');
      return data.gameState;
    } else {
      console.log('📄 Новый пользователь - создается первое сохранение');
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки из Firebase:', error);
    return null;
  }
};

// Логирование событий для аналитики
export const logGameEvent = async (userId: string, eventType: string, eventData: any) => {
  if (!db) return;
  
  try {
    await addDoc(collection(db, 'gameEvents'), {
      userId,
      eventType,
      eventData,
      timestamp: new Date()
    });
    
    console.log('📊 Событие записано:', eventType);
  } catch (error) {
    console.error('❌ Ошибка записи события:', error);
  }
};

export { auth, db };