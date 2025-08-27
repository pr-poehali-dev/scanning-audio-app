// Система озвучки с загрузкой файлов из облака Mail.ru
export class AudioSystem {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private baseUrl = 'https://cloud.mail.ru/public/vmnn/73ri9QfHz';
  
  // Маппинг событий на названия аудиофайлов
  private audioFiles: Record<string, string> = {
    // Общие звуки
    'tab-delivery': 'tab-delivery.mp3',
    'tab-receiving': 'tab-receiving.mp3', 
    'tab-return': 'tab-return.mp3',
    
    // Выдача
    'scan-discount-check': 'scan-discount-check.mp3', // "Товары со скидкой проверьте ВБ кошелек"
    'check-product-camera': 'check-product-camera.mp3', // "Проверьте товар под камерой"
    'product-scanned': 'product-scanned.mp3', // "Товар отсканирован"
    'product-to-fitting': 'product-to-fitting.mp3', // "Товар передан на примерку"
    'product-issued-rate': 'product-issued-rate.mp3', // "Товар выдан клиенту. Оцените наш пункт выдачи в приложении"
    
    // Приемка
    'receiving-start': 'receiving-start.mp3', // "Начинаем приемку товара. Отсканируйте стикер коробки"
    'check-package': 'check-package.mp3', // "Проверьте целостность упаковки"
    'place-in-cell': 'place-in-cell.mp3', // "Разместите товар в ячейке"
    'receiving-complete': 'receiving-complete.mp3', // "Приемка завершена успешно"
    
    // Возврат
    'return-start': 'return-start.mp3', // "Начинаем процесс возврата. Отсканируйте товар для возврата"
    'return-complete': 'return-complete.mp3', // "Возврат товара оформлен успешно. Деньги вернутся на карту в течение 5-10 дней"
    
    // Интерфейс
    'menu-open': 'menu-open.mp3',
    'products-open': 'products-open.mp3',
    'search-open': 'search-open.mp3',
    'input-focus': 'input-focus.mp3',
    'button-click': 'button-click.mp3'
  };

  // Предзагрузка аудиофайлов
  async preloadAudio(audioKey: string): Promise<void> {
    if (this.audioCache.has(audioKey)) {
      return;
    }

    const fileName = this.audioFiles[audioKey];
    if (!fileName) {
      console.warn(`Audio file not found for key: ${audioKey}`);
      return;
    }

    try {
      // Создаем прямые ссылки на файлы из облака Mail.ru
      // В реальности нужно получить прямые ссылки на файлы
      const audioUrl = this.getDirectDownloadUrl(fileName);
      
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = audioUrl;
      
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
        audio.load();
      });
      
      this.audioCache.set(audioKey, audio);
    } catch (error) {
      console.error(`Failed to preload audio ${audioKey}:`, error);
    }
  }

  // Преобразование облачной ссылки в прямую ссылку на файл
  private getDirectDownloadUrl(fileName: string): string {
    // Временное решение - создаем локальные аудиофайлы или используем заглушки
    // В реальном приложении здесь должна быть логика получения прямых ссылок из Mail.ru API
    return `/audio/${fileName}`;
  }

  // Воспроизведение аудио
  async playAudio(audioKey: string, priority: 'high' | 'normal' = 'normal'): Promise<void> {
    // Остановка текущего аудио если высокий приоритет
    if (priority === 'high') {
      this.stopAll();
    }

    // Попытка загрузить аудио если не загружено
    if (!this.audioCache.has(audioKey)) {
      await this.preloadAudio(audioKey);
    }

    const audio = this.audioCache.get(audioKey);
    if (!audio) {
      // Fallback на синтетическую речь если файл недоступен
      this.fallbackToSpeech(audioKey);
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error(`Failed to play audio ${audioKey}:`, error);
      this.fallbackToSpeech(audioKey);
    }
  }

  // Остановка всех аудио
  stopAll(): void {
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  // Резервная система через Web Speech API
  private fallbackToSpeech(audioKey: string): void {
    const messages: Record<string, string> = {
      'tab-delivery': 'Вкладка выдача активна',
      'tab-receiving': 'Вкладка приемка активна',
      'tab-return': 'Вкладка возврат активна',
      'scan-discount-check': 'Товары со скидкой проверьте ВБ кошелек',
      'check-product-camera': 'Проверьте товар под камерой',
      'product-scanned': 'Товар отсканирован',
      'product-to-fitting': 'Товар передан на примерку',
      'product-issued-rate': 'Товар выдан клиенту. Оцените наш пункт выдачи в приложении',
      'receiving-start': 'Начинаем приемку товара. Отсканируйте стикер коробки',
      'check-package': 'Проверьте целостность упаковки',
      'place-in-cell': 'Разместите товар в ячейке',
      'receiving-complete': 'Приемка завершена успешно',
      'return-start': 'Начинаем процесс возврата. Отсканируйте товар для возврата',
      'return-complete': 'Возврат товара оформлен успешно. Деньги вернутся на карту в течение 5-10 дней',
      'menu-open': 'Открываю меню',
      'products-open': 'Открываю товары',
      'search-open': 'Открываю поиск',
      'input-focus': 'Поле ввода активно'
    };

    const message = messages[audioKey] || 'Действие выполнено';
    
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Предзагрузка всех критически важных аудиофайлов
  async preloadCriticalAudio(): Promise<void> {
    const criticalAudio = [
      'scan-discount-check',
      'check-product-camera', 
      'product-issued-rate',
      'receiving-start',
      'return-start'
    ];

    const promises = criticalAudio.map(key => this.preloadAudio(key));
    await Promise.allSettled(promises);
  }
}

// Создание глобального экземпляра
export const audioSystem = new AudioSystem();

// Хук для использования в компонентах
export const useAudio = () => {
  const playAudio = (audioKey: string, priority: 'high' | 'normal' = 'normal') => {
    audioSystem.playAudio(audioKey, priority);
  };

  return { playAudio };
};