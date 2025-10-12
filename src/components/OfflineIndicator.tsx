import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    const handleNetworkStatus = (event: CustomEvent) => {
      if (event.detail.online) {
        handleOnline();
      } else {
        handleOffline();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('network-status', handleNetworkStatus as EventListener);

    if (!navigator.onLine) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('network-status', handleNetworkStatus as EventListener);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-white text-center font-medium animate-slide-down ${
        isOnline 
          ? 'bg-green-600' 
          : 'bg-amber-600'
      }`}
    >
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        <Icon 
          name={isOnline ? 'Wifi' : 'WifiOff'} 
          size={20} 
        />
        <span>
          {isOnline 
            ? 'Подключено к интернету' 
            : 'Офлайн режим • Данные из кэша'}
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
