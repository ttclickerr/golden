import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";

// Firebase конфигурация
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Инициализация Firebase
let app: any = null;
let auth: any = null;
let db: any = null;

export const initializeFirebase = () => {
  try {
    // Проверяем, не инициализирован ли уже Firebase
    if (app && auth && db) {
      console.log('🔥 Firebase уже инициализирован');
      return true;
    }

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    console.log('🔥 Firebase успешно инициализирован:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });
    
    return true;
  } catch (error: any) {
    // Если приложение уже существует, просто используем его
    if (error.code === 'app/duplicate-app') {
      console.log('🔥 Firebase приложение уже существует, используем его');
      return true;
    }
    console.error('❌ Ошибка инициализации Firebase:', error);
    return false;
  }
};

// Google аутентификация
export const signInWithGoogle = async () => {
  console.log('🔐 Попытка входа через Google...');
  console.log('🔍 Firebase состояние:', { auth: !!auth, app: !!app });
  console.log('🔍 Переменные окружения:', {
    apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  });
  
  if (!auth) {
    console.warn('❌ Firebase не инициализирован');
    return null;
  }
  
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    console.log('🚀 Запуск Google редиректа...');
    await signInWithRedirect(auth, provider);
    console.log('✅ Редирект на Google успешно запущен');
  } catch (error) {
    console.error('❌ Подробная ошибка входа через Google:', error);
    console.error('❌ Код ошибки:', error.code);
    console.error('❌ Сообщение ошибки:', error.message);
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