import { useCallback, useRef, useState } from 'react';

// Маппинг аудио файлов
const AUDIO_MAP: { [key: string]: string } = {
  'cell-number': 'cell-number.mp3',
  'check-discount-wallet': 'check-discount-wallet.mp3', 
  'check-product-camera': 'check-product-camera.mp3',
  'rate-pickup-point': 'rate-pickup-point.mp3',
  'receiving-start': 'receiving-start.mp3',
  'receiving-scan-box': 'receiving-scan-box.mp3',
  'receiving-check-package': 'receiving-check-package.mp3',
  'receiving-place-cell': 'receiving-place-cell.mp3',
  'receiving-complete': 'receiving-complete.mp3',
  'return-start': 'return-start.mp3',
  'return-scan-item': 'return-scan-item.mp3',
  'return-reason': 'return-reason.mp3',
  'return-complete': 'return-complete.mp3'
};

export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [customAudioFiles, setCustomAudioFiles] = useState<{[key: string]: string}>({});

  const playAudio = useCallback(async (audioKey: string) => {
    try {
      // Проверяем есть ли пользовательский файл
      const audioUrl = customAudioFiles[audioKey] || `/audio/${AUDIO_MAP[audioKey]}`;
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      await audio.play();
    } catch (error) {
      // Fallback к Web Speech API
      const messages: { [key: string]: string } = {
        'cell-number': 'Ячейка номер',
        'check-discount-wallet': 'Товары со скидкой проверьте ВБ кошелек',
        'check-product-camera': 'Проверьте товар под камерой',
        'rate-pickup-point': 'Оцените наш пункт выдачи в приложении',
        'receiving-start': 'Начинаем приемку товара',
        'receiving-scan-box': 'Отсканируйте стикер коробки',
        'receiving-check-package': 'Проверьте целостность упаковки',
        'receiving-place-cell': 'Разместите товар в ячейке',
        'receiving-complete': 'Приемка завершена успешно',
        'return-start': 'Начинаем процесс возврата',
        'return-scan-item': 'Отсканируйте товар для возврата',
        'return-reason': 'Выберите причину возврата',
        'return-complete': 'Возврат оформлен успешно. Деньги вернутся на карту в течение 5-10 дней'
      };

      const message = messages[audioKey];
      if (message && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [customAudioFiles]);

  const updateAudioFiles = useCallback((files: {[key: string]: string}) => {
    setCustomAudioFiles(prev => ({ ...prev, ...files }));
  }, []);

  return { playAudio, updateAudioFiles };
};