import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Показываем промпт через 3 секунды после загрузки
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Приложение установлено');
    } else {
      console.log('❌ Установка отклонена');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  // Не показываем, если приложение уже установлено или промпт не готов
  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white rounded-xl shadow-2xl border-2 border-purple-200 p-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <Icon name="X" size={20} />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
          <img 
            src="https://cdn.poehali.dev/files/efef9a74-93b2-4603-ab83-2969a53a16d9.png" 
            alt="WB ПВЗ" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Установить приложение
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Добавьте WB ПВЗ на рабочий стол для быстрого доступа
          </p>

          <button
            onClick={handleInstallClick}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="Plus" size={18} />
            <span>Установить</span>
          </button>
        </div>
      </div>

      {/* Инструкция для iOS */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>iOS/Safari:</strong> Нажмите <Icon name="Share" size={12} className="inline" /> и выберите "На экран «Домой»"
        </p>
      </div>
    </div>
  );
};

export default InstallPrompt;