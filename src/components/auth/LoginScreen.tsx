import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Chrome, Loader2 } from 'lucide-react';

export const LoginScreen = () => {
  const { signIn, loading, error } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signIn();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/90 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white mb-2">
            Tycoon Clicker
          </CardTitle>
          <CardDescription className="text-gray-300">
            Sign in to save your progress and compete on the global leaderboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading || isSigningIn}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3"
          >
            {isSigningIn ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Chrome className="w-5 h-5 mr-2" />
            )}
            Continue with Google
          </Button>
          
          {error && (
            <div className="text-red-400 text-sm text-center p-3 bg-red-900/20 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}
          
          <div className="text-center text-sm text-gray-400">
            Your game progress will be saved to the cloud and synced across all your devices.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};