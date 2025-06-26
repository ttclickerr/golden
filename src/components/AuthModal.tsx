import React from 'react';
import { Button } from '@/components/ui/button';
import { signInWithGoogle, signInWithApple, signInWithEmail, onAuthStateChange, signOutUser } from '@/lib/firebase';

// Для Apple и Email auth — заглушки, можно интегрировать через Firebase Auth

function generateGuestId() {
  // UUID v4 генерация (упрощённая, исправлено)
  return 'guest-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function AuthModal({ onAuth }: { onAuth: (userId: string, method: string) => void }) {
  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showGuestWarning, setShowGuestWarning] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user && user.uid) {
        localStorage.setItem('user_id', user.uid);
        onAuth(user.uid, user.providerData?.[0]?.providerId || 'google');
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [onAuth]);

  // Закрытие окна после успешной авторизации
  React.useEffect(() => {
    if (error === null && !loading && !showGuestWarning && !showEmailForm) {
      // Если пользователь уже авторизован, закрываем окно
      if (localStorage.getItem('user_id')) {
        onAuth(localStorage.getItem('user_id')!, 'auto');
      }
    }
  }, [error, loading, showGuestWarning, showEmailForm, onAuth]);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(e.message || 'Google sign-in error');
    }
    setLoading(false);
  };

  const handleApple = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithApple();
    } catch (e: any) {
      setError(e.message || 'Apple sign-in error');
    }
    setLoading(false);
  };

  const handleEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithEmail(email, password);
      if (user && user.uid) {
        localStorage.setItem('user_id', user.uid);
        onAuth(user.uid, 'email');
      }
    } catch (err: any) {
      setError(err.message || 'Email sign-in error');
    }
    setLoading(false);
  };

  const handleGuest = () => {
    setShowGuestWarning(true);
  };

  const confirmGuest = () => {
    const guestId = generateGuestId();
    localStorage.setItem('user_id', guestId);
    onAuth(guestId, 'guest');
  };

  // Вместо return null — всегда рендерим, но скрываем через стили
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      style={{ display: typeof onAuth === 'function' ? undefined : 'none' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col gap-4 items-center">
        <h2 className="text-2xl font-bold mb-2 text-center">Sign in to continue</h2>
        {error && <div className="text-red-500 text-xs text-center w-full">{error}</div>}
        {!showEmailForm && !showGuestWarning && <>
          <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white" onClick={handleGoogle} disabled={loading}>
            Sign in with Google
          </Button>
          <Button className="w-full bg-gradient-to-r from-gray-800 to-gray-600 text-white" onClick={handleApple} disabled={loading}>
            Sign in with Apple
          </Button>
          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white" onClick={() => setShowEmailForm(true)} disabled={loading}>
            Sign in with Email
          </Button>
          <Button className="w-full mt-2 border border-gray-300 text-gray-600 bg-white hover:bg-gray-100" variant="outline" onClick={handleGuest} disabled={loading}>
            Continue as Guest
          </Button>
        </>}
        {showGuestWarning && (
          <div className="w-full flex flex-col gap-3 items-center">
            <div className="text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-3 text-xs text-center">
              <b>Warning!</b> You are entering as a guest.<br />
              Your progress and premium will not be restored if you change device or clear your browser.<br />
              <span className="text-red-500 font-semibold">We recommend signing in with Google, Apple or Email to save your data!</span>
            </div>
            <Button className="w-full bg-gradient-to-r from-gray-400 to-gray-600 text-white" onClick={confirmGuest} disabled={loading}>
              Continue as Guest
            </Button>
            <Button className="w-full" variant="outline" onClick={() => setShowGuestWarning(false)} disabled={loading}>
              Back
            </Button>
          </div>
        )}
        {showEmailForm && (
          <form className="w-full flex flex-col gap-2" onSubmit={handleEmail}>
            <input
              className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              disabled={loading}
            />
            <input
              className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in / Register'}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => setShowEmailForm(false)} disabled={loading}>
              Back
            </Button>
          </form>
        )}
        <div className="text-xs text-gray-500 mt-2 text-center">
          Your premium will be linked to your account.<br />Guest mode is device-specific.
        </div>
      </div>
    </div>
  );
}

// После успешной авторизации user_id всегда берём из useAuth, localStorage нужен только для SDK/legacy.
