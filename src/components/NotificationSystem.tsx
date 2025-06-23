import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Gift } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'reward';
  title: string;
  message: string;
  duration?: number;
  icon?: React.ReactNode;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration !== 0) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration || 4000);
        
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getIcon = (type: string, customIcon?: React.ReactNode) => {
    if (customIcon) return customIcon;
    
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'reward':
        return <Gift className="w-5 h-5 text-purple-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStyleClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-900/20 text-green-100';
      case 'error':
        return 'border-red-500/30 bg-red-900/20 text-red-100';
      case 'reward':
        return 'border-purple-500/30 bg-purple-900/20 text-purple-100';
      default:
        return 'border-blue-500/30 bg-blue-900/20 text-blue-100';
    }
  };

  return (
    <div className="fixed right-4 z-50 space-y-2 max-w-sm mb-4 notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            relative p-4 rounded-lg border backdrop-blur-md
            transition-all duration-300 ease-in-out
            animate-in slide-in-from-right-full
            ${getStyleClasses(notification.type)}
          `}
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type, notification.icon)}
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
              <p className="text-xs opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="text-white/60 hover:text-white/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress bar для автоматического скрытия */}
          {notification.duration !== 0 && (
            <div className="absolute bottom-0 left-0 h-1 bg-white/20 rounded-b-lg overflow-hidden">
              <div
                className="h-full bg-white/60 animate-pulse"
                style={{
                  animation: `shrink ${notification.duration || 4000}ms linear forwards`
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Hook для управления уведомлениями
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message: string, duration?: number) => {
    addNotification({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message: string, duration?: number) => {
    addNotification({ type: 'error', title, message, duration });
  };

  const showInfo = (title: string, message: string, duration?: number) => {
    addNotification({ type: 'info', title, message, duration });
  };

  const showReward = (title: string, message: string, duration?: number, icon?: React.ReactNode) => {
    addNotification({ type: 'reward', title, message, duration, icon });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showReward
  };
}