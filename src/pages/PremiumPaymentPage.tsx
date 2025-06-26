import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { trackAnalyticsEvent, type AnalyticsEventName } from '@/lib/trackAnalyticsEvent';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';

// Вспомогательная функция для обновления премиум-статуса
function setPremiumStatus(type: string) {
  localStorage.setItem('premium-status', 'true');
  localStorage.setItem('premium-type', type);
  if (type === 'premium_weekly') {
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('premium-expiry', expiry.toString());
  } else {
    localStorage.setItem('premium-expiry', 'lifetime');
  }
  window.dispatchEvent(new CustomEvent('premiumStatusChanged'));
}

export default function PremiumPaymentPage() {
  const [, setLocation] = useLocation();
  const [premiumType, setPremiumType] = useState<string>('premium_lifetime');
  const [premiumDescription, setPremiumDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(() => !user?.uid);

  // Проверка оплаты на сервере
  async function verifyPaymentAndActivate(providerOverride?: string) {
    setLoading(true);
    setError(false);
    setSuccess(false);
    try {
      const userId = user?.uid || 'demo_user';
      const res = await fetch(`/api/payments/verify?userId=${userId}`);
      const data = await res.json();
      if (data.paid) {
        setPremiumStatus(data.premiumType || premiumType);
        setSuccess(true);
        trackAnalyticsEvent({ event: 'purchase_success', provider: data.provider || providerOverride || 'unknown', premiumType: data.premiumType || premiumType });
        setTimeout(() => setLocation('/'), 3500);
      } else {
        setError(true);
        setErrorMessage('Payment not found or not confirmed. Please contact support.');
        trackAnalyticsEvent({ event: 'purchase_failed', provider: data.provider || providerOverride || 'unknown', premiumType: data.premiumType || premiumType });
      }
    } catch (e) {
      setError(true);
      setErrorMessage('Server error. Please try again later.');
    }
    setLoading(false);
  }

  // Проверка query-параметров для Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      verifyPaymentAndActivate('stripe');
    } else if (params.get('error')) {
      setError(true);
      setLoading(false);
      setErrorMessage('Payment failed or was cancelled. Please try again.');
      trackAnalyticsEvent({ event: 'purchase_failed', provider: 'stripe', premiumType });
    }
  }, [setLocation, premiumType, user]);

  // Set English description for selected premium type
  useEffect(() => {
    const pendingPremiumType = localStorage.getItem('premium-pending-type') || 'premium_lifetime';
    setPremiumType(pendingPremiumType);
    if (pendingPremiumType === 'premium_weekly') {
      setPremiumDescription('Premium for 7 days ($4.99 USD)');
    } else if (pendingPremiumType === 'premium_lifetime') {
      setPremiumDescription('Lifetime premium ($14.99 USD)');
    } else if (pendingPremiumType === 'remove_ads') {
      setPremiumDescription('Remove ads forever ($9.99 USD)');
    } else {
      setPremiumDescription('Premium subscription');
    }
    trackAnalyticsEvent({
      event: 'premium_payment_page_view' as AnalyticsEventName,
      userId: user?.uid || undefined,
      premiumType: pendingPremiumType
    });
  }, [user]);

  // Проверяем user_id и показываем AuthModal до любых действий
  useEffect(() => {
    setShowAuth(!user?.uid);
  }, [user, success, error]);

  const handleAuth = (userId: string, method: string) => {
    setShowAuth(false);
    // Можно добавить аналитику по методу входа
  };

  // Stripe Checkout redirect
  const handleStripe = () => {
    setLoading(true);
    trackAnalyticsEvent({
      event: 'premium_payment_start' as AnalyticsEventName,
      provider: 'stripe',
      userId: user?.uid || undefined,
      premiumType
    });
    window.location.href = `/api/payments/stripe-checkout?type=${premiumType}`;
  };

  // CloudPayments widget integration
  const handleCloudPayments = () => {
    setLoading(true);
    trackAnalyticsEvent({
      event: 'premium_payment_start' as AnalyticsEventName,
      provider: 'cloudpayments',
      userId: user?.uid || undefined,
      premiumType
    });
    // Dynamically load CloudPayments widget if not loaded
    if (!(window as any).CloudPayments) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudpayments.ru/bundles/cloudpayments.js';
      script.onload = () => openCloudPaymentsWidget();
      script.onerror = () => {
        setLoading(false);
        setError(true);
        setErrorMessage('Failed to load payment widget. Please try again.');
      };
      document.body.appendChild(script);
    } else {
      openCloudPaymentsWidget();
    }
  };

  // Open CloudPayments widget with demo/test data
  const openCloudPaymentsWidget = () => {
    // @ts-ignore
    const widget = new window.CloudPayments();
    widget.pay('charge', {
      publicId: 'test_api_00000000000000000000001', // Replace with your real publicId
      description: 'Purchase premium',
      amount: premiumType === 'premium_weekly' ? 4.99 : premiumType === 'remove_ads' ? 9.99 : 14.99,
      currency: 'USD',
      invoiceId: 'order_' + Date.now(),
      accountId: user?.uid || 'demo_user',
      email: '',
      skin: 'classic',
      data: { premiumType }
    }, {
      onSuccess: function () {
        verifyPaymentAndActivate('cloudpayments');
      },
      onFail: function (reason: any) {
        setError(true);
        setLoading(false);
        setErrorMessage('Payment failed: ' + (reason?.message || reason || 'Unknown error'));
        trackAnalyticsEvent({ event: 'purchase_failed', provider: 'cloudpayments', premiumType });
      },
      onComplete: function () {
        setLoading(false);
      }
    });
  };

  // Overlay Loader
  const LoaderOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-gray-900 via-purple-900/40 to-cyan-900/40 rounded-2xl shadow-2xl border border-purple-500/30">
        <svg className="animate-spin h-10 w-10 text-cyan-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <div className="text-white text-lg font-semibold">Processing payment...</div>
      </div>
    </div>
  );

  // Success Screen
  const SuccessScreen = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-green-900/80 to-cyan-900/80 rounded-2xl shadow-2xl border border-green-500/30">
        <svg className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <div className="text-white text-xl font-bold">Payment successful!</div>
        <div className="text-green-200 text-base">Thank you for your purchase. Premium is now active.</div>
        <Button className="mt-2 w-full" onClick={() => setLocation('/')}>Back to Game</Button>
      </div>
    </div>
  );

  // Error Screen
  const ErrorScreen = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-red-900/80 to-pink-900/80 rounded-2xl shadow-2xl border border-red-500/30">
        <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <div className="text-white text-xl font-bold">Payment failed</div>
        <div className="text-red-200 text-base">{errorMessage || 'Something went wrong. Please try again.'}</div>
        <Button className="mt-2 w-full" onClick={() => { setError(false); setErrorMessage(''); }}>Try Again</Button>
        <Button className="w-full" variant="outline" onClick={() => setLocation('/')}>Back to Game</Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20 rounded-2xl shadow-xl border border-purple-500/30 relative">
      {showAuth && <AuthModal onAuth={handleAuth} />}
      {!showAuth && <>
        {loading && <LoaderOverlay />}
        {success && <SuccessScreen />}
        {error && <ErrorScreen />}
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Premium Purchase</h1>
        <div className="mb-6 p-4 rounded-lg bg-purple-900/30 border border-purple-500/30">
          <h2 className="text-xl font-semibold text-white mb-2">Your choice:</h2>
          <p className="text-white text-lg">{premiumDescription}</p>
        </div>
        <div className="space-y-4">
          <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white" onClick={handleStripe} disabled={loading || success}>
            Pay with Stripe
          </Button>
          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white" onClick={handleCloudPayments} disabled={loading || success}>
            Pay with CloudPayments
          </Button>
          <Button className="w-full mt-2" variant="outline" onClick={() => setLocation("/")} disabled={loading || success}>
            Back to Game
          </Button>
        </div>
      </>}
    </div>
  );
}
