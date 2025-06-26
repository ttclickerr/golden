import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import './i18n';
import { Layout } from './components/Layout';
import { NotificationSystem, useNotifications } from './components/NotificationSystem';
import TycoonClicker from "./pages/tycoon-clicker";
import SystemPage from './pages/SystemPage';
import PremiumPaymentPage from "./pages/PremiumPaymentPage";
import { useEffect } from "react";
import { trackAnalyticsEvent } from "./lib/trackAnalyticsEvent";
import { useLocation } from "wouter";
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { notifications, removeNotification } = useNotifications();
  const [location] = useLocation();

  // Аналитика: первое открытие, сессия, экраны
  useEffect(() => {
    // Первое открытие
    if (!localStorage.getItem('first_open_tracked')) {
      trackAnalyticsEvent({ event: 'app_first_open' });
      localStorage.setItem('first_open_tracked', '1');
    }
    // Старт сессии
    trackAnalyticsEvent({ event: 'session_start' });
    // Завершение сессии
    const handleUnload = () => {
      trackAnalyticsEvent({ event: 'session_end' });
      trackAnalyticsEvent({ event: 'app_close' });
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      trackAnalyticsEvent({ event: 'session_end' });
      trackAnalyticsEvent({ event: 'app_close' });
    };
  }, []);

  // Аналитика: просмотр экрана
  useEffect(() => {
    let screenName = location === '/' ? 'main' : location.replace(/^\//, '');
    trackAnalyticsEvent({ event: 'screen_view', screenName });
  }, [location]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Layout>
            <NotificationSystem 
              notifications={notifications} 
              onRemove={removeNotification} 
            />
            <div className="dark no-flash min-h-screen">
              <Switch>
                <Route path="/">
                  <TycoonClicker />
                </Route>
                <Route path="/system">
                  <SystemPage />
                </Route>
                <Route path="/premium-payment">
                  <PremiumPaymentPage />
                </Route>
              </Switch>
            </div>
          </Layout>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;