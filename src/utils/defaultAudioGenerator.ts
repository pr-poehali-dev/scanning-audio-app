// Генератор дефолтной озвучки через Web Speech API
// Используется если пользователь ещё не загрузил свои файлы

class DefaultAudioGenerator {
  private textMap: { [key: string]: string } = {
    // Ячейки 1-150
    ...Object.fromEntries(
      Array.from({ length: 150 }, (_, i) => [`cell_${i + 1}`, `ячейка ${i + 1}`])
    ),
    
    // Количество товаров
    ...Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [`count_${i + 1}`, `${i + 1}`])
    ),
    
    // Основные фразы
    'goods': 'товары',
    'word_items': 'товаров',
    'payment_on_delivery': 'оплата при получении',
    'please_check_good_under_camera': 'пожалуйста, проверьте товар под камерой',
    'thanks_for_order_rate_pickpoint': 'спасибо за заказ! Оцените работу пункта выдачи',
    'box_accepted': 'короб принят',
    'success_sound': 'готово'
  };

  speak(key: string, rate: number = 1.0): boolean {
    if (!('speechSynthesis' in window)) {
      console.warn('⚠️ Speech Synthesis API не поддерживается');
      return false;
    }

    const text = this.textMap[key];
    if (!text) {
      console.warn(`⚠️ Нет текста для ключа: ${key}`);
      return false;
    }

    try {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.lang = 'ru-RU';

      const voices = speechSynthesis.getVoices();
      const russianVoice = voices.find(voice => voice.lang.startsWith('ru'));
      if (russianVoice) {
        utterance.voice = russianVoice;
      }

      console.log(`🔊 TTS озвучка: "${text}"`);
      speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error(`❌ Ошибка TTS для ${key}:`, error);
      return false;
    }
  }

  speakSequence(keys: string[], rate: number = 1.0, delayMs: number = 300) {
    if (!('speechSynthesis' in window)) {
      console.warn('⚠️ Speech Synthesis API не поддерживается');
      return;
    }

    speechSynthesis.cancel();
    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= keys.length) {
        console.log('🏁 Последовательность TTS завершена');
        return;
      }

      const key = keys[currentIndex];
      const text = this.textMap[key];

      if (!text) {
        console.warn(`⚠️ Нет текста для ключа: ${key}`);
        currentIndex++;
        setTimeout(speakNext, delayMs);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.lang = 'ru-RU';

      const voices = speechSynthesis.getVoices();
      const russianVoice = voices.find(voice => voice.lang.startsWith('ru'));
      if (russianVoice) {
        utterance.voice = russianVoice;
      }

      utterance.onend = () => {
        console.log(`✅ TTS часть ${currentIndex + 1}/${keys.length} завершена`);
        currentIndex++;
        setTimeout(speakNext, delayMs);
      };

      utterance.onerror = (error) => {
        console.error(`❌ Ошибка TTS для ${key}:`, error);
        currentIndex++;
        setTimeout(speakNext, delayMs);
      };

      console.log(`🔊 TTS часть ${currentIndex + 1}/${keys.length}: "${text}"`);
      speechSynthesis.speak(utterance);
    };

    speakNext();
  }

  stop() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

export const defaultAudioGenerator = new DefaultAudioGenerator();