import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Globe, Volume2, Vibrate, RotateCcw, Shield, ChevronDown, Check, Cloud } from "lucide-react";
import { useTranslation, useTranslationStore, getLanguageFlag, getLanguageName, type Language, languageNames } from "@/lib/i18n";
import { ConsentManager } from "@/components/ConsentManager";
import { useAuth } from "@/hooks/useAuth";
import { adjustService } from "@/lib/adjust";
import { adMobService } from "@/lib/admob";
import { VersionInfo } from "@/components/VersionInfo";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Простой компонент для входа через Firebase в настройках
function SimpleFirebaseAuth() {
  const { user, signIn, signOut, loading } = useAuth();

  // Firebase настроен напрямую в коде
  const hasFirebaseKeys = true;

  if (!hasFirebaseKeys) {
    return (
      <div className="p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-300">
        Firebase not configured. API keys needed.
      </div>
    );
  }

  if (loading) {
    return (
      <Button disabled className="w-full">
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-green-400">
          Connected: {user.displayName || user.email}
        </div>
        <Button onClick={signOut} variant="outline" className="w-full text-xs">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={signIn} className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium">
      <Cloud className="w-4 h-4 mr-2" />
      Sign in with Google
    </Button>
  );
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, t } = useTranslation();
  const { setLanguage } = useTranslationStore();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('tycoon-sound') !== 'false';
  });
  const [vibrateEnabled, setVibrateEnabled] = useState(() => {
    return localStorage.getItem('tycoon-vibrate') !== 'false';
  });
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  // Popular languages to show first
  const popularLanguages: Language[] = ['en', 'es', 'fr', 'de', 'ru', 'zh', 'ja', 'ko', 'pt', 'it'];
  const otherLanguages: Language[] = Object.keys(languageNames).filter(lang => 
    !popularLanguages.includes(lang as Language)
  ) as Language[];

  if (!isOpen) return null;

  const handleConsentUpdate = (consents: any) => {
    adjustService.setEnabled(consents.analytics);
    adMobService.setConsentStatus(consents.advertising);
    console.log('Privacy settings updated:', consents);
  };

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('tycoon-sound', newValue.toString());
  };

  const handleVibrateToggle = () => {
    const newValue = !vibrateEnabled;
    setVibrateEnabled(newValue);
    localStorage.setItem('tycoon-vibrate', newValue.toString());
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setLanguageDropdownOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/30 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">{t('settings')}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-purple-500/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Language Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">{t('language')}</span>
              </div>
              
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  className="w-full justify-between bg-slate-800/50 border-purple-500/30 text-white hover:bg-purple-500/20 hover:border-purple-400"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getLanguageFlag(language)}</span>
                    <span>{getLanguageName(language)}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>

                {languageDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {/* Popular Languages */}
                    <div className="p-2">
                      <div className="text-xs text-gray-400 mb-2 px-2">Popular</div>
                      {popularLanguages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-purple-500/20 rounded-md transition-colors"
                        >
                          <span className="text-lg">{getLanguageFlag(lang)}</span>
                          <span className="flex-1 text-left">{getLanguageName(lang)}</span>
                          {language === lang && <Check className="w-4 h-4 text-purple-400" />}
                        </button>
                      ))}
                    </div>

                    {/* Other Languages */}
                    <div className="border-t border-purple-500/20 p-2">
                      <div className="text-xs text-gray-400 mb-2 px-2">Others</div>
                      {otherLanguages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-purple-500/20 rounded-md transition-colors"
                        >
                          <span className="text-lg">{getLanguageFlag(lang)}</span>
                          <span className="flex-1 text-left">{getLanguageName(lang)}</span>
                          {language === lang && <Check className="w-4 h-4 text-purple-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">Audio</span>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={handleSoundToggle}
                  className={`w-full justify-between ${
                    soundEnabled 
                      ? 'bg-purple-500/20 border-purple-400 text-white' 
                      : 'bg-slate-800/50 border-purple-500/30 text-gray-400'
                  }`}
                >
                  <span>Sound Effects</span>
                  <Badge variant={soundEnabled ? "default" : "secondary"}>
                    {soundEnabled ? 'ON' : 'OFF'}
                  </Badge>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleVibrateToggle}
                  className={`w-full justify-between ${
                    vibrateEnabled 
                      ? 'bg-purple-500/20 border-purple-400 text-white' 
                      : 'bg-slate-800/50 border-purple-500/30 text-gray-400'
                  }`}
                >
                  <span>Vibration</span>
                  <Badge variant={vibrateEnabled ? "default" : "secondary"}>
                    {vibrateEnabled ? 'ON' : 'OFF'}
                  </Badge>
                </Button>
              </div>
            </div>

            {/* Cloud Save */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-gray-300">Cloud Save</span>
              </div>
              
              <div className="p-3 bg-slate-800/50 border border-purple-500/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">
                  Sign in with Google to sync progress across devices
                </div>
                <SimpleFirebaseAuth />
              </div>
            </div>

            {/* Privacy */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">{t('privacy')}</span>
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  console.log('Privacy button clicked, opening consent modal');
                  setConsentModalOpen(true);
                }}
                className="w-full bg-slate-800/50 border-purple-500/30 text-white hover:bg-purple-500/20 hover:border-purple-400"
              >
                Manage Privacy Settings
              </Button>
            </div>

            {/* Version Info */}
            <div className="pt-4 border-t border-purple-500/20">
              <VersionInfo showDetails={true} className="mt-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Consent Manager */}
      <ConsentManager
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
        onConsentUpdate={handleConsentUpdate}
      />
    </>
  );
}