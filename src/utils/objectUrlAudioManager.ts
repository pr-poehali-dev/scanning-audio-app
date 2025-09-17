/**
 * Альтернативный менеджер аудио с использованием Object URL
 * Более надежный для больших файлов чем Data URL
 */

class ObjectUrlAudioManager {
  private static instance: ObjectUrlAudioManager;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private urlCache: Map<string, string> = new Map();

  static getInstance(): ObjectUrlAudioManager {
    if (!ObjectUrlAudioManager.instance) {
      ObjectUrlAudioManager.instance = new ObjectUrlAudioManager();
    }
    return ObjectUrlAudioManager.instance;
  }

  /**
   * Сохранить аудио файл для ячейки
   */
  async saveCellAudio(cellNumber: string, file: File): Promise<boolean> {
    try {
      console.log(`💾 [OBJECT URL] Сохраняю аудио для ячейки ${cellNumber}:`, {
        name: file.name,
        type: file.type,
        size: Math.round(file.size / 1024) + 'KB'
      });

      // Проверяем что это аудио файл
      if (!file.type.startsWith('audio/') && !this.isAudioFile(file.name)) {
        console.warn(`⚠️ Файл ${file.name} может не быть аудио файлом`);
      }

      // Создаем Object URL
      const objectUrl = URL.createObjectURL(file);
      console.log(`🔗 Object URL создан: ${objectUrl}`);

      // Тестируем что аудио загружается
      const testSuccess = await this.testAudioFile(objectUrl, file.name);
      if (!testSuccess) {
        URL.revokeObjectURL(objectUrl);
        return false;
      }

      // Сохраняем в кэш
      const keys = [cellNumber, `cell-${cellNumber}`];
      keys.forEach(key => {
        // Освобождаем старый URL если есть
        const oldUrl = this.urlCache.get(key);
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }
        
        this.urlCache.set(key, objectUrl);
        
        // Очищаем аудио кэш
        const oldAudio = this.audioCache.get(key);
        if (oldAudio) {
          oldAudio.pause();
          oldAudio.src = '';
          this.audioCache.delete(key);
        }
      });

      console.log(`✅ Аудио для ячейки ${cellNumber} сохранено через Object URL`);
      return true;

    } catch (error) {
      console.error(`❌ Ошибка сохранения аудио для ячейки ${cellNumber}:`, error);
      return false;
    }
  }

  /**
   * Проверить является ли файл аудио по расширению
   */
  private isAudioFile(filename: string): boolean {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.opus'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return audioExtensions.includes(ext);
  }

  /**
   * Протестировать аудио файл
   */
  private testAudioFile(url: string, filename: string): Promise<boolean> {
    return new Promise((resolve) => {
      const testAudio = new Audio();
      
      const timeout = setTimeout(() => {
        console.warn(`⏱️ Таймаут тестирования ${filename}`);
        resolve(true); // Возвращаем true, возможно сработает
      }, 3000);

      testAudio.addEventListener('canplay', () => {
        clearTimeout(timeout);
        console.log(`✅ Аудио файл ${filename} успешно протестирован`);
        resolve(true);
      }, { once: true });

      testAudio.addEventListener('error', (e) => {
        clearTimeout(timeout);
        console.error(`❌ Тест аудио файла ${filename} провален:`, e);
        resolve(false);
      }, { once: true });

      testAudio.src = url;
    });
  }

  /**
   * Воспроизвести аудио ячейки
   */
  async playCellAudio(cellNumber: string): Promise<boolean> {
    try {
      console.log(`🎵 [OBJECT URL] Воспроизведение ячейки ${cellNumber}`);

      // Ищем URL по разным ключам
      const possibleKeys = [cellNumber, `cell-${cellNumber}`, cellNumber.toString()];
      let url: string | null = null;
      let foundKey = '';

      for (const key of possibleKeys) {
        url = this.urlCache.get(key) || null;
        if (url) {
          foundKey = key;
          break;
        }
      }

      if (!url) {
        console.warn(`❌ Object URL для ячейки ${cellNumber} не найден`);
        const availableKeys = Array.from(this.urlCache.keys());
        console.log(`📋 Доступные ключи:`, availableKeys);
        return false;
      }

      console.log(`🔗 Найден Object URL для ${foundKey}: ${url}`);

      // Получаем или создаем аудио элемент
      let audio = this.audioCache.get(foundKey);
      
      if (!audio) {
        audio = new Audio();
        this.setupAudioListeners(audio, foundKey);
        this.audioCache.set(foundKey, audio);
        audio.src = url;
      }

      // Воспроизводим
      try {
        if (!audio.paused) {
          audio.pause();
        }
        audio.currentTime = 0;
        audio.volume = 0.8;
        
        await audio.play();
        console.log(`✅ Аудио ячейки ${cellNumber} воспроизводится`);
        return true;
        
      } catch (playError) {
        console.error(`❌ Ошибка воспроизведения:`, playError);
        return false;
      }

    } catch (error) {
      console.error(`❌ Критическая ошибка воспроизведения ячейки ${cellNumber}:`, error);
      return false;
    }
  }

  /**
   * Настройка слушателей для аудио элемента
   */
  private setupAudioListeners(audio: HTMLAudioElement, key: string): void {
    audio.addEventListener('loadstart', () => console.log(`🔄 Загрузка ${key}...`));
    audio.addEventListener('canplay', () => console.log(`✅ ${key} готов к воспроизведению`));
    audio.addEventListener('ended', () => console.log(`🏁 Воспроизведение ${key} завершено`));
    audio.addEventListener('error', (e) => {
      console.error(`❌ Ошибка аудио ${key}:`, {
        error: e,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src
      });
    });
  }

  /**
   * Получить список ячеек с аудио
   */
  getCellsWithAudio(): string[] {
    const cellNumbers: Set<string> = new Set();
    
    Array.from(this.urlCache.keys()).forEach(key => {
      if (key.startsWith('cell-')) {
        cellNumbers.add(key.replace('cell-', ''));
      } else if (/^\d+$/.test(key)) {
        cellNumbers.add(key);
      }
    });
    
    return Array.from(cellNumbers).sort((a, b) => parseInt(a) - parseInt(b));
  }

  /**
   * Удалить аудио ячейки
   */
  removeCellAudio(cellNumber: string): boolean {
    const keys = [cellNumber, `cell-${cellNumber}`, cellNumber.toString()];
    let removed = false;
    
    keys.forEach(key => {
      const url = this.urlCache.get(key);
      if (url) {
        URL.revokeObjectURL(url);
        this.urlCache.delete(key);
        removed = true;
      }
      
      const audio = this.audioCache.get(key);
      if (audio) {
        audio.pause();
        audio.src = '';
        this.audioCache.delete(key);
      }
    });
    
    if (removed) {
      console.log(`✅ Аудио ячейки ${cellNumber} удалено`);
    }
    
    return removed;
  }

  /**
   * Очистить все аудио
   */
  clearAllAudio(): boolean {
    try {
      // Освобождаем все Object URLs
      this.urlCache.forEach(url => URL.revokeObjectURL(url));
      this.urlCache.clear();
      
      // Останавливаем все аудио
      this.audioCache.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      this.audioCache.clear();
      
      console.log('✅ Все аудио файлы очищены');
      return true;
    } catch (error) {
      console.error('❌ Ошибка очистки аудио файлов:', error);
      return false;
    }
  }

  /**
   * Получить информацию о менеджере
   */
  getInfo(): { cellsCount: number; totalUrls: number } {
    return {
      cellsCount: this.getCellsWithAudio().length,
      totalUrls: this.urlCache.size
    };
  }
}

// Экспортируем единственный экземпляр
export const objectUrlAudioManager = ObjectUrlAudioManager.getInstance();

// Экспортируем основные функции
export const saveCellAudio = (cellNumber: string, file: File) => objectUrlAudioManager.saveCellAudio(cellNumber, file);
export const playCellAudio = (cellNumber: string) => objectUrlAudioManager.playCellAudio(cellNumber);
export const getCellsWithAudio = () => objectUrlAudioManager.getCellsWithAudio();
export const removeCellAudio = (cellNumber: string) => objectUrlAudioManager.removeCellAudio(cellNumber);
export const clearAllAudio = () => objectUrlAudioManager.clearAllAudio();
export const getAudioManagerInfo = () => objectUrlAudioManager.getInfo();