/**
 * Упрощенный и надежный менеджер аудио файлов
 * Заменяет сложную систему из 15+ ключей localStorage одним надежным решением
 */

// Единственный ключ для хранения всех аудио файлов
const AUDIO_STORAGE_KEY = 'wb-audio-files-unified';

// Интерфейс для аудио файла
interface AudioFile {
  url: string;
  name: string;
  size: number;
  uploadDate: string;
}

// Интерфейс для структуры хранения
interface AudioStorage {
  cells: Record<string, AudioFile>;
  delivery: Record<string, AudioFile>;
  acceptance: Record<string, AudioFile>;
  returns: Record<string, AudioFile>;
  version: string;
  lastModified: string;
}

class SimpleAudioManager {
  private static instance: SimpleAudioManager;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  static getInstance(): SimpleAudioManager {
    if (!SimpleAudioManager.instance) {
      SimpleAudioManager.instance = new SimpleAudioManager();
    }
    return SimpleAudioManager.instance;
  }

  /**
   * Получить все аудио файлы из localStorage
   */
  private getStorage(): AudioStorage {
    try {
      const data = localStorage.getItem(AUDIO_STORAGE_KEY);
      if (!data) {
        return this.createEmptyStorage();
      }
      
      const parsed = JSON.parse(data);
      
      // Проверяем структуру данных
      if (!parsed.cells || !parsed.version) {
        console.log('🔄 Устаревшая структура данных, создаем новую');
        return this.createEmptyStorage();
      }
      
      return parsed;
    } catch (error) {
      console.error('❌ Ошибка чтения localStorage:', error);
      return this.createEmptyStorage();
    }
  }

  /**
   * Создать пустую структуру хранения
   */
  private createEmptyStorage(): AudioStorage {
    return {
      cells: {},
      delivery: {},
      acceptance: {},
      returns: {},
      version: '1.0',
      lastModified: new Date().toISOString()
    };
  }

  /**
   * Сохранить данные в localStorage
   */
  private saveStorage(storage: AudioStorage): boolean {
    try {
      storage.lastModified = new Date().toISOString();
      const data = JSON.stringify(storage);
      
      // Проверяем размер данных (лимит ~5MB для localStorage)
      const sizeInMB = new Blob([data]).size / (1024 * 1024);
      if (sizeInMB > 4.5) {
        console.warn(`⚠️ Размер данных ${sizeInMB.toFixed(2)}MB близок к лимиту localStorage`);
      }
      
      localStorage.setItem(AUDIO_STORAGE_KEY, data);
      console.log(`✅ Данные сохранены (${sizeInMB.toFixed(2)}MB)`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка сохранения в localStorage:', error);
      
      // Если переполнение - очищаем старые файлы
      if (error.name === 'QuotaExceededError') {
        console.log('🧹 Очищаем старые файлы из-за переполнения...');
        this.clearOldFiles();
        return this.saveStorage(storage); // Повторная попытка
      }
      
      return false;
    }
  }

  /**
   * Очистить старые файлы при переполнении
   */
  private clearOldFiles(): void {
    try {
      const storage = this.getStorage();
      
      // Удаляем файлы старше 30 дней
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      
      let cleanedCount = 0;
      
      ['cells', 'delivery', 'acceptance', 'returns'].forEach(category => {
        const files = storage[category as keyof typeof storage] as Record<string, AudioFile>;
        Object.keys(files).forEach(key => {
          const file = files[key];
          if (new Date(file.uploadDate) < cutoffDate) {
            delete files[key];
            cleanedCount++;
          }
        });
      });
      
      if (cleanedCount > 0) {
        this.saveStorage(storage);
        console.log(`🧹 Удалено ${cleanedCount} старых файлов`);
      }
    } catch (error) {
      console.error('❌ Ошибка очистки старых файлов:', error);
    }
  }

  /**
   * Сохранить аудио файл для ячейки
   */
  async saveCellAudio(cellNumber: string, file: File): Promise<boolean> {
    try {
      console.log(`💾 Сохраняю аудио для ячейки ${cellNumber}:`, file.name);
      
      // Конвертируем файл в Data URL
      const dataUrl = await this.fileToDataUrl(file);
      
      const storage = this.getStorage();
      
      // Сохраняем файл с метаданными
      storage.cells[cellNumber] = {
        url: dataUrl,
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString()
      };
      
      // Также сохраняем с префиксом cell- для обратной совместимости
      storage.cells[`cell-${cellNumber}`] = storage.cells[cellNumber];
      
      const success = this.saveStorage(storage);
      
      if (success) {
        console.log(`✅ Аудио для ячейки ${cellNumber} сохранено успешно`);
        // Очищаем кэш для этой ячейки
        this.audioCache.delete(cellNumber);
        this.audioCache.delete(`cell-${cellNumber}`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ Ошибка сохранения аудио для ячейки ${cellNumber}:`, error);
      return false;
    }
  }

  /**
   * Конвертировать файл в Data URL
   */
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Проверяем формат файла
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'];
      const isValidType = validTypes.some(type => file.type === type || file.name.toLowerCase().includes(type.split('/')[1]));
      
      if (!isValidType) {
        console.warn(`⚠️ Неподдерживаемый формат файла: ${file.type} (${file.name})`);
        // Но все равно пытаемся загрузить
      }
      
      // Проверяем размер (максимум 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        reject(new Error(`Файл слишком большой: ${file.size} байт (максимум ${maxSize})`));
        return;
      }
      
      console.log(`📁 Конвертирую файл: ${file.name} (${file.type}, ${Math.round(file.size/1024)}KB)`);
      
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        
        // Проверяем что Data URL валидный
        if (!result || !result.startsWith('data:')) {
          reject(new Error('Не удалось создать Data URL'));
          return;
        }
        
        console.log(`✅ Data URL создан: ${result.substring(0, 50)}... (${result.length} символов)`);
        
        // Тестируем что аудио можно загрузить
        const testAudio = new Audio();
        
        const testPromise = new Promise<void>((testResolve, testReject) => {
          const timeout = setTimeout(() => {
            testReject(new Error('Таймаут тестирования аудио'));
          }, 5000);
          
          testAudio.addEventListener('canplaythrough', () => {
            clearTimeout(timeout);
            console.log(`✅ Аудио файл валидный и готов к воспроизведению`);
            testResolve();
          }, { once: true });
          
          testAudio.addEventListener('error', () => {
            clearTimeout(timeout);
            testReject(new Error('Аудио файл поврежден или неподдерживаемый формат'));
          }, { once: true });
          
          testAudio.src = result;
        });
        
        testPromise
          .then(() => resolve(result))
          .catch(testError => {
            console.error(`❌ Тест аудио провален:`, testError);
            // Все равно возвращаем результат, возможно сработает
            resolve(result);
          });
      };
      
      reader.onerror = () => {
        reject(new Error('Ошибка чтения файла'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Воспроизвести аудио ячейки
   */
  async playCellAudio(cellNumber: string): Promise<boolean> {
    try {
      console.log(`🎵 Воспроизводим аудио для ячейки ${cellNumber}`);
      
      const storage = this.getStorage();
      
      // Ищем файл по разным вариантам ключа
      const possibleKeys = [
        cellNumber,
        `cell-${cellNumber}`,
        cellNumber.toString()
      ];
      
      let audioFile: AudioFile | null = null;
      let foundKey = '';
      
      for (const key of possibleKeys) {
        if (storage.cells[key]) {
          audioFile = storage.cells[key];
          foundKey = key;
          break;
        }
      }
      
      if (!audioFile) {
        console.warn(`❌ Аудио файл для ячейки ${cellNumber} не найден`);
        console.log(`📋 Доступные ячейки:`, Object.keys(storage.cells));
        return false;
      }
      
      // Проверяем кэш
      let audio = this.audioCache.get(foundKey);
      
      if (!audio) {
        // Проверяем валидность URL перед созданием аудио
        if (!audioFile.url || !audioFile.url.startsWith('data:audio/')) {
          console.error(`❌ Невалидный URL аудио для ${foundKey}:`, audioFile.url?.substring(0, 100));
          return false;
        }
        
        // Создаем новый элемент аудио
        audio = new Audio();
        
        // Кэшируем для быстрого повторного воспроизведения
        this.audioCache.set(foundKey, audio);
        
        // Подробное логирование событий аудио
        audio.addEventListener('loadstart', () => console.log(`🔄 Начало загрузки аудио ${foundKey}`));
        audio.addEventListener('loadedmetadata', () => console.log(`📊 Метаданные загружены для ${foundKey}`));
        audio.addEventListener('canplay', () => console.log(`✅ Аудио ${foundKey} готово к воспроизведению`));
        audio.addEventListener('canplaythrough', () => console.log(`💯 Аудио ${foundKey} полностью загружено`));
        audio.addEventListener('error', (e) => {
          const errorCode = audio?.error?.code;
          const errorMessage = audio?.error?.message;
          console.error(`❌ Ошибка аудио ${foundKey}:`, {
            event: e,
            errorCode,
            errorMessage,
            networkState: audio?.networkState,
            readyState: audio?.readyState,
            currentSrc: audio?.currentSrc?.substring(0, 100)
          });
        });
        audio.addEventListener('ended', () => console.log(`🏁 Воспроизведение ${foundKey} завершено`));
        
        // Устанавливаем источник после добавления слушателей
        try {
          audio.src = audioFile.url;
          console.log(`🔗 URL установлен для ${foundKey}: ${audioFile.url.substring(0, 50)}...`);
        } catch (srcError) {
          console.error(`❌ Ошибка установки URL для ${foundKey}:`, srcError);
          return false;
        }
      }
      
      // Готовим к воспроизведению
      try {
        // Останавливаем текущее воспроизведение если есть
        if (!audio.paused) {
          audio.pause();
        }
        audio.currentTime = 0;
        
        // Ждем готовности к воспроизведению
        if (audio.readyState < 2) { // HAVE_CURRENT_DATA
          console.log(`⏳ Ждем загрузки аудио ${foundKey}...`);
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Таймаут загрузки аудио'));
            }, 10000);
            
            const onCanPlay = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              resolve();
            };
            
            const onError = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              reject(new Error(`Ошибка загрузки аудио: ${audio.error?.message}`));
            };
            
            audio.addEventListener('canplay', onCanPlay, { once: true });
            audio.addEventListener('error', onError, { once: true });
            
            if (audio.readyState >= 2) {
              onCanPlay();
            }
          });
        }
        
        // Устанавливаем громкость и воспроизводим
        audio.volume = 0.8;
        await audio.play();
        console.log(`✅ Аудио ячейки ${cellNumber} успешно воспроизводится`);
        
      } catch (playError) {
        console.error(`❌ Ошибка воспроизведения аудио ${foundKey}:`, {
          error: playError,
          readyState: audio.readyState,
          networkState: audio.networkState,
          duration: audio.duration,
          currentSrc: audio.currentSrc?.substring(0, 100)
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Ошибка воспроизведения аудио ячейки ${cellNumber}:`, error);
      return false;
    }
  }

  /**
   * Получить список всех ячеек с аудио
   */
  getCellsWithAudio(): string[] {
    const storage = this.getStorage();
    const cellNumbers: Set<string> = new Set();
    
    Object.keys(storage.cells).forEach(key => {
      // Извлекаем номер ячейки из ключа
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
    try {
      const storage = this.getStorage();
      
      // Удаляем все варианты ключей
      const keysToRemove = [cellNumber, `cell-${cellNumber}`, cellNumber.toString()];
      let removed = false;
      
      keysToRemove.forEach(key => {
        if (storage.cells[key]) {
          delete storage.cells[key];
          this.audioCache.delete(key);
          removed = true;
        }
      });
      
      if (removed) {
        this.saveStorage(storage);
        console.log(`✅ Аудио ячейки ${cellNumber} удалено`);
      }
      
      return removed;
    } catch (error) {
      console.error(`❌ Ошибка удаления аудио ячейки ${cellNumber}:`, error);
      return false;
    }
  }

  /**
   * Получить информацию о хранилище
   */
  getStorageInfo(): { totalFiles: number; totalSize: string; cellsCount: number } {
    const storage = this.getStorage();
    let totalSize = 0;
    let totalFiles = 0;
    
    ['cells', 'delivery', 'acceptance', 'returns'].forEach(category => {
      const files = storage[category as keyof typeof storage] as Record<string, AudioFile>;
      Object.values(files).forEach(file => {
        totalSize += file.size;
        totalFiles++;
      });
    });
    
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    const cellsCount = Object.keys(storage.cells).length;
    
    return {
      totalFiles,
      totalSize: `${sizeInMB} MB`,
      cellsCount
    };
  }

  /**
   * Очистить все аудио файлы
   */
  clearAllAudio(): boolean {
    try {
      localStorage.removeItem(AUDIO_STORAGE_KEY);
      this.audioCache.clear();
      console.log('✅ Все аудио файлы очищены');
      return true;
    } catch (error) {
      console.error('❌ Ошибка очистки аудио файлов:', error);
      return false;
    }
  }

  /**
   * Миграция данных из старой системы
   */
  migrateFromOldSystem(): boolean {
    try {
      console.log('🔄 Начинаю миграцию из старой системы...');
      
      const storage = this.getStorage();
      let migratedCount = 0;
      
      // Список старых ключей для миграции
      const oldKeys = [
        'wb-audio-files',
        'wb-audio-files-backup',
        'wb-audio-files-cells-backup',
        'customAudioFiles',
        'audioFiles',
        'cellAudios'
      ];
      
      oldKeys.forEach(oldKey => {
        try {
          const oldData = localStorage.getItem(oldKey);
          if (oldData) {
            const parsed = JSON.parse(oldData);
            
            Object.keys(parsed).forEach(key => {
              // Определяем тип файла по ключу
              if (key.includes('cell-') || /^\d+$/.test(key)) {
                // Это файл ячейки
                const cellNumber = key.replace('cell-', '');
                if (!storage.cells[cellNumber] && parsed[key]) {
                  storage.cells[cellNumber] = {
                    url: parsed[key],
                    name: `cell-${cellNumber}.mp3`,
                    size: 0,
                    uploadDate: new Date().toISOString()
                  };
                  migratedCount++;
                }
              }
            });
          }
        } catch (e) {
          console.log(`⚠️ Не удалось мигрировать ${oldKey}`);
        }
      });
      
      if (migratedCount > 0) {
        this.saveStorage(storage);
        console.log(`✅ Мигрировано ${migratedCount} файлов из старой системы`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Ошибка миграции:', error);
      return false;
    }
  }
}

// Экспортируем единственный экземпляр
export const audioManager = SimpleAudioManager.getInstance();

// Экспортируем основные функции для обратной совместимости
export const saveCellAudio = (cellNumber: string, file: File) => audioManager.saveCellAudio(cellNumber, file);
export const playCellAudio = (cellNumber: string) => audioManager.playCellAudio(cellNumber);
export const getCellsWithAudio = () => audioManager.getCellsWithAudio();
export const removeCellAudio = (cellNumber: string) => audioManager.removeCellAudio(cellNumber);
export const getStorageInfo = () => audioManager.getStorageInfo();
export const clearAllAudio = () => audioManager.clearAllAudio();
export const migrateFromOldSystem = () => audioManager.migrateFromOldSystem();