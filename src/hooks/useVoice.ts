import { useCallback } from 'react';

export const useVoice = () => {
  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = options?.rate || 0.9;
      utterance.pitch = options?.pitch || 1;
      utterance.volume = options?.volume || 1;
      
      speechSynthesis.speak(utterance);
    }
  }, []);

  const announceCell = useCallback((cellNumber: string) => {
    speak(`Ячейка ${cellNumber}. Товары со скидкой проверьте ВБ кошелек`);
  }, [speak]);

  const announceProductCheck = useCallback(() => {
    speak('Проверьте товар под камерой');
  }, [speak]);

  const announceRating = useCallback(() => {
    speak('Оцените наш пункт выдачи в приложении');
  }, [speak]);

  return {
    speak,
    announceCell,
    announceProductCheck,
    announceRating
  };
};