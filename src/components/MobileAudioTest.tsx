import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface MobileAudioTestProps {
  onTest: () => void;
}

const MobileAudioTest = ({ onTest }: MobileAudioTestProps) => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Проверяем, запускается ли на мобильном устройстве
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasTestedAudio = localStorage.getItem('wb-pvz-audio-tested');
    
    if (isMobile && !hasTestedAudio && !dismissed) {
      // Показываем подсказку через 2 секунды
      setTimeout(() => setShow(true), 2000);
    }
  }, [dismissed]);

  const handleTest = () => {
    onTest();
    localStorage.setItem('wb-pvz-audio-tested', 'true');
    setShow(false);
    setDismissed(true);
  };

  const handleDismiss = () => {
    localStorage.setItem('wb-pvz-audio-tested', 'true');
    setShow(false);
    setDismissed(true);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Icon name="Volume2" size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Включить звук?</h3>
            <p className="text-sm text-gray-500">Озвучка поможет работать быстрее</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Для корректной работы озвучки на мобильном устройстве нужно разрешение. 
          Нажмите "Проверить звук" чтобы активировать.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleTest}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Проверить звук
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Позже
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAudioTest;
