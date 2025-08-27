import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface UseSpeechRecognitionProps {
  onCommand?: (command: string) => void;
  onTranscript?: (transcript: string) => void;
  language?: string;
  continuous?: boolean;
}

export const useSpeechRecognition = ({
  onCommand,
  onTranscript,
  language = 'ru-RU',
  continuous = true
}: UseSpeechRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = continuous;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language;
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        
        if (onTranscript) {
          onTranscript(fullTranscript);
        }

        if (finalTranscript && onCommand) {
          processCommand(finalTranscript.toLowerCase().trim());
        }
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
    }
  }, [language, continuous, onTranscript, onCommand]);

  const processCommand = useCallback((command: string) => {
    // Словарь команд для системы приемки/выдачи
    const commandMap: { [key: string]: string } = {
      // Навигация
      'выдача': 'delivery',
      'приемка': 'receiving', 
      'возврат': 'return',
      'настройки': 'settings',
      
      // Действия с товарами
      'сканировать': 'scan',
      'не сканировать': 'skip-scan',
      'на примерку': 'try-on',
      'выдать': 'issue',
      'принять': 'receive',
      'отклонить': 'reject',
      'вернуть': 'return-item',
      
      // Приемка
      'начать приемку': 'start-receiving',
      'завершить приемку': 'complete-receiving',
      'товар поврежден': 'damaged',
      'товар в порядке': 'ok',
      
      // Общие команды
      'далее': 'next',
      'назад': 'back',
      'отмена': 'cancel',
      'подтвердить': 'confirm',
      'пропустить': 'skip',
      'повторить': 'repeat',
      'стоп': 'stop',
      'пауза': 'pause',
    };

    // Поиск команды в тексте
    for (const [phrase, action] of Object.entries(commandMap)) {
      if (command.includes(phrase)) {
        if (onCommand) {
          onCommand(action);
        }
        return;
      }
    }

    // Если точная команда не найдена, передаем весь текст
    if (onCommand) {
      onCommand(command);
    }
  }, [onCommand]);

  const startListening = useCallback(() => {
    if (recognition && isSupported && !isListening) {
      recognition.start();
    }
  }, [recognition, isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    toggleListening
  };
};