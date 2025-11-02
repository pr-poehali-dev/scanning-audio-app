import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { detectDevice } from '@/utils/deviceDetection';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const deviceInfo = detectDevice();

  useEffect(() => {
    if (deviceInfo.isPWA) {
      return;
    }

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      return;
    }

    if (deviceInfo.isIOS && !deviceInfo.isPWA) {
      setTimeout(() => setShowIOSInstructions(true), 3000);
      return;
    }

    if (deviceInfo.isYandexBrowser && !deviceInfo.isPWA) {
      setTimeout(() => setShowInstallBanner(true), 3000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [deviceInfo.isPWA, deviceInfo.isIOS, deviceInfo.isYandexBrowser]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (deviceInfo.isPWA) {
    return null;
  }

  if (showIOSInstructions && deviceInfo.isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4 shadow-2xl z-50 animate-slide-up">
        <div className="max-w-md mx-auto">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <h3 className="font-semibold">Установите приложение</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-sm space-y-2 bg-white/10 rounded-lg p-3 backdrop-blur">
            <p className="font-medium">Для установки на iPhone:</p>
            <ol className="space-y-1 text-white/90 list-decimal list-inside">
              <li>Нажмите на <span className="inline-flex items-center px-1.5 py-0.5 bg-white/20 rounded">⎙ Поделиться</span></li>
              <li>Выберите <span className="font-medium">"На экран Домой"</span></li>
              <li>Нажмите <span className="font-medium">"Добавить"</span></li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (showInstallBanner && deviceInfo.isYandexBrowser) {
    return (
      <div className="fixed top-4 right-4 bg-white rounded-xl shadow-2xl border border-purple-200 p-4 max-w-sm z-50 animate-slide-down">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src="https://cdn.poehali.dev/files/be8acfbd-86e8-4684-a4ea-c81b413adb99.png" alt="WB" className="w-8 h-8 rounded-lg" />
            <h3 className="font-semibold text-gray-900">Добавить на рабочий стол</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-sm space-y-3">
          <p className="text-gray-600">
            Для удобного доступа к приложению:
          </p>
          <ol className="space-y-2 text-gray-700 list-decimal list-inside bg-gray-50 rounded-lg p-3">
            <li>Нажмите на <span className="font-semibold">три точки ⋮</span> в браузере</li>
            <li>Выберите <span className="font-semibold">"Добавить ярлык"</span></li>
            <li>Нажмите <span className="font-semibold">"Добавить"</span></li>
          </ol>
          <p className="text-xs text-gray-500">
            Ярлык с иконкой WB появится на рабочем столе
          </p>
        </div>
        
        <button
          onClick={handleDismiss}
          className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
        >
          Понятно
        </button>
      </div>
    );
  }

  if (showInstallBanner && deferredPrompt && deviceInfo.isDesktop) {
    return (
      <div className="fixed top-4 right-4 bg-white rounded-xl shadow-2xl border border-purple-200 p-4 max-w-sm z-50 animate-slide-down">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Установить приложение</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Установите WB ПВЗ на рабочий стол для быстрого доступа и работы без браузера
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Установить
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Позже
          </button>
        </div>
      </div>
    );
  }

  if (showInstallBanner && deferredPrompt && (deviceInfo.isAndroid || deviceInfo.isMobile)) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4 shadow-2xl z-50 animate-slide-up">
        <div className="max-w-md mx-auto">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <h3 className="font-semibold">Установите приложение</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-white/90 mb-3">
            Быстрый доступ с главного экрана вашего устройства
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Установить
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-white/80 hover:text-white transition-colors"
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallPWA;