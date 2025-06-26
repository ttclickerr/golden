import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Shield, CheckCircle, XCircle, Info } from 'lucide-react';
import { trackAnalyticsEvent } from '../lib/trackAnalyticsEvent';

interface ConsentManagerProps {
  onConsentUpdate: (consents: ConsentData) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface ConsentData {
  analytics: boolean;
  advertising: boolean;
  personalization: boolean;
  functional: boolean;
}

export function ConsentManager({ onConsentUpdate, isOpen, onClose }: ConsentManagerProps) {
  const [consents, setConsents] = useState<ConsentData>({
    analytics: true,
    advertising: true,
    personalization: true,
    functional: true, // Always enabled for basic functionality
  });

  useEffect(() => {
    // Check if there are saved consents
    const savedConsents = localStorage.getItem('user-consents');
    if (savedConsents) {
      const parsed = JSON.parse(savedConsents);
      setConsents(parsed);
      onConsentUpdate(parsed);
    }
  }, []);

  const handleConsentChange = (type: keyof ConsentData, value: boolean) => {
    if (type === 'functional' || type === 'advertising') return; // Don't allow disabling functional cookies or advertising
    
    const newConsents = { ...consents, [type]: value };
    setConsents(newConsents);
  };

  const handleSaveConsents = () => {
    localStorage.setItem('user-consents', JSON.stringify(consents));
    onConsentUpdate(consents);
    // Аналитика: согласие или отказ
    if (consents.analytics || consents.advertising || consents.personalization) {
      trackAnalyticsEvent({ event: 'consent_given', ...consents });
    } else {
      trackAnalyticsEvent({ event: 'consent_denied', ...consents });
    }
    onClose();
  };

  const handleAcceptAll = () => {
    const allConsents = {
      analytics: true,
      advertising: true,
      personalization: true,
      functional: true,
    };
    setConsents(allConsents);
    localStorage.setItem('user-consents', JSON.stringify(allConsents));
    onConsentUpdate(allConsents);
    trackAnalyticsEvent({ event: 'consent_given', ...allConsents });
    onClose();
  };

  const handleRejectAll = () => {
    const minimalConsents = {
      analytics: false,
      advertising: false,
      personalization: false,
      functional: true,
    };
    setConsents(minimalConsents);
    localStorage.setItem('user-consents', JSON.stringify(minimalConsents));
    onConsentUpdate(minimalConsents);
    trackAnalyticsEvent({ event: 'consent_denied', ...minimalConsents });
    onClose();
  };

  const consentItems = [
    {
      key: 'functional' as keyof ConsentData,
      title: 'Functional',
      description: 'Essential for game operation and progress saving',
      required: true,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />
    },
    {
      key: 'analytics' as keyof ConsentData,
      title: 'Analytics',
      description: 'Performance monitoring and crash reporting',
      required: false,
      icon: <Info className="w-5 h-5 text-blue-500" />
    },

    {
      key: 'personalization' as keyof ConsentData,
      title: 'Personalization',
      description: 'Customized content and game recommendations',
      required: false,
      icon: <CheckCircle className="w-5 h-5 text-amber-500" />
    },
    {
      key: 'advertising' as keyof ConsentData,
      title: 'Advertising',
      description: 'AdMob personalized ads and revenue optimization',
      required: true,
      icon: <Info className="w-5 h-5 text-green-500" />
    }
  ];

  // Оптимизация: логируем только при изменениях состояния
  const logRef = React.useRef({ isOpen: false, consents: {} });
  React.useEffect(() => {
    if (logRef.current.isOpen !== isOpen || JSON.stringify(logRef.current.consents) !== JSON.stringify(consents)) {
      console.log('🔒 ConsentManager state change:', { isOpen, consents });
      logRef.current = { isOpen, consents };
    }
  }, [isOpen, consents]);
  
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[99999]"
      style={{ display: isOpen ? 'flex' : 'none' }}
      onClick={onClose}
    >
      <div 
        className="max-w-2xl w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/20 text-white rounded-xl p-6 max-h-[90vh] overflow-y-auto" 
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <Shield className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
          <h2 className="text-2xl font-bold text-yellow-400">Privacy Settings</h2>
        </div>

        <div className="space-y-4">
          <p id="privacy-description" className="text-sm text-slate-300 text-center">
            Configure your data preferences. Some features are required for app functionality.
          </p>

          <div className="space-y-3">
            {consentItems.map((item) => (
              <Card 
                key={item.key} 
                className="p-4 bg-slate-800/50 border-slate-700 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {item.icon}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        {item.required && (
                          <Badge variant="secondary" className="text-xs bg-green-600 text-white">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {item.required ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <button
                          onClick={() => handleConsentChange(item.key, !consents[item.key])}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            consents[item.key]
                              ? 'bg-purple-600 border-purple-600'
                              : 'border-slate-500 hover:border-purple-400'
                          }`}
                        >
                          {consents[item.key] && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleAcceptAll}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept All
              </Button>
              <Button
                onClick={handleSaveConsents}
                variant="outline"
                className="flex-1 border-purple-500 text-purple-300 hover:bg-purple-900/30"
              >
                Save Choices
              </Button>
              <Button
                onClick={handleRejectAll}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Essential Only
              </Button>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-400 text-center">
                You can change these settings anytime from the game settings menu.
              </p>
              
              <div className="flex flex-col gap-1 text-xs text-center">
                <div className="text-slate-400">Privacy Policies:</div>
                <div className="flex justify-center gap-4">
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Google Privacy Policy
                  </a>
                  <a 
                    href="https://support.google.com/admob/answer/6128543" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    AdMob Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}