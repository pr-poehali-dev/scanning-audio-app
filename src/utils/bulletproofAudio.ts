/**
 * 🛡️ ПУЛЕНЕПРОБИВАЕМАЯ СИСТЕМА ОЗВУЧКИ
 * ОПТИМИЗИРОВАННАЯ ДЛЯ ЭКОНОМИИ ПАМЯТИ
 */

// ЕДИНСТВЕННЫЙ ключ хранения
const BULLETPROOF_KEY = 'bulletproof-audio-system';

// Ключи для вариантов озвучки
const VOICE_VARIANT_KEYS = {
  variant1: 'wb-voice-variant1-permanent',
  variant2: 'wb-voice-variant2-permanent',
  standard: 'wb-voice-standard-permanent',
  alternative: 'wb-voice-alternative-permanent'
};

interface AudioRecord {
  url: string;
  name: string;
  lastUsed: string;
}

class BulletproofAudio {
  private static instance: BulletproofAudio;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private maxCacheSize = 10; // Максимум 10 аудио в памяти
  private loadedFiles: Record<string, string> = {};

  static getInstance(): BulletproofAudio {
    if (!BulletproofAudio.instance) {
      BulletproofAudio.instance = new BulletproofAudio();
    }
    return BulletproofAudio.instance;
  }

  /**
   * 🔄 ЛЕНИВАЯ инициализация - НЕ загружаем все файлы сразу
   */
  constructor() {
    this.loadFileIndex(); // Загружаем только индекс файлов
  }

  /**
   * 📂 ЛЕНИВАЯ загрузка: загружаем только индекс доступных файлов
   */
  private loadFileIndex(): void {
    console.log('🛡️ === ИНДЕКСАЦИЯ ДОСТУПНЫХ АУДИО ФАЙЛОВ ===');
    
    // СНАЧАЛА загружаем АКТИВНЫЙ вариант озвучки
    const activeVariant = localStorage.getItem('wb-active-voice-variant');
    console.log(`🎯 Активный вариант озвучки: ${activeVariant || 'не установлен'}`);
    
    if (activeVariant) {
      const activeStorageKey = `wb-voice-${activeVariant}-permanent`;
      try {
        const activeData = localStorage.getItem(activeStorageKey);
        if (activeData) {
          const parsedActive = JSON.parse(activeData);
          console.log(`🔥 ПРИОРИТЕТНАЯ индексация активного варианта ${activeVariant}: ${Object.keys(parsedActive).length} файлов`);
          
          // Только индексируем файлы, НЕ загружаем в память
          let count = 0;
          Object.entries(parsedActive).forEach(([fileKey, fileUrl]) => {
            if (typeof fileUrl === 'string' && fileUrl.startsWith('data:audio/') && count < 15) {
              this.loadedFiles[fileKey] = fileUrl;
              count++;
              
              // Если это ячейка - создаем все варианты ключей
              const cellMatch = fileKey.match(/(\d+)/);
              if (cellMatch) {
                const cellNumber = cellMatch[1];
                this.loadedFiles[cellNumber] = fileUrl;
                this.loadedFiles[`cell-${cellNumber}`] = fileUrl;
                this.loadedFiles[`ячейка-${cellNumber}`] = fileUrl;
              }
            }
          });
          
          console.log(`✅ Активный вариант ${activeVariant} индексирован: ${count} файлов`);
        }
      } catch (error) {
        console.error(`❌ Ошибка индексации активного варианта ${activeVariant}:`, error);
      }
    }
    
    // БЫСТРАЯ индексация fallback файлов (только если активный вариант пуст)
    if (Object.keys(this.loadedFiles).length === 0) {
      console.log('🔍 Поиск fallback файлов...');
      
      const storageKeys = [
        'wb-pvz-cell-audio-settings-permanent',
        'wb-audio-files',
        'wb-unified-audio-system',
        'wb-voice-variant1-permanent',
        'wb-voice-variant2-permanent',
        'wb-voice-standard-permanent',
        'wb-voice-alternative-permanent'
      ];
      
      for (const key of storageKeys.slice(0, 3)) { // Проверяем только первые 3 ключа
        try {
          const data = localStorage.getItem(key);
          if (!data) continue;
          
          const parsed = JSON.parse(data);
          if (typeof parsed === 'object' && parsed !== null) {
            let count = 0;
            Object.entries(parsed).forEach(([fileKey, fileUrl]) => {
              if (typeof fileUrl === 'string' && fileUrl.startsWith('data:audio/') && count < 5) {
                this.loadedFiles[fileKey] = fileUrl;
                count++;
                
                // Только для первых 5 файлов создаем псевдонимы
                const cellMatch = fileKey.match(/(\d+)/);
                if (cellMatch) {
                  const cellNumber = cellMatch[1];
                  this.loadedFiles[cellNumber] = fileUrl;
                }
              }
            });
            
            if (count > 0) {
              console.log(`✅ Fallback из ${key}: ${count} файлов`);
              break; // Берем только первый найденный источник
            }
          }
        } catch (error) {
          // Тихо игнорируем ошибки
        }
      }
    }
    
    const totalFiles = Object.keys(this.loadedFiles).length;
    console.log(`🎯 ИТОГО ИНДЕКСИРОВАНО: ${totalFiles} аудио файлов`);
    
    if (totalFiles === 0) {
      console.warn('⚠️ НЕТ АУДИО ФАЙЛОВ! Проверьте localStorage');
    }
  }

  /**
   * 💾 ЛЕНИВАЯ загрузка аудио в память (только когда нужно)
   */
  private loadAudioToMemory(cellKey: string): HTMLAudioElement | null {
    // Проверяем кэш
    if (this.audioCache.has(cellKey)) {
      console.log(`💿 Из кэша: ${cellKey}`);
      return this.audioCache.get(cellKey)!;
    }

    // Ищем файл в индексе
    const audioUrl = this.loadedFiles[cellKey];
    if (!audioUrl) {
      console.warn(`❌ Файл не найден в индексе: ${cellKey}`);
      return null;
    }

    try {
      // Управляем размером кэша
      if (this.audioCache.size >= this.maxCacheSize) {
        // Удаляем первый элемент (самый старый)
        const firstKey = this.audioCache.keys().next().value;
        this.audioCache.delete(firstKey);
        console.log(`🗑️ Удален из кэша: ${firstKey}`);
      }

      // Создаем аудио элемент
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      this.audioCache.set(cellKey, audio);
      
      console.log(`📥 Загружен в кэш: ${cellKey} (размер кэша: ${this.audioCache.size})`);
      return audio;
    } catch (error) {
      console.error(`❌ Ошибка создания Audio для ${cellKey}:`, error);
      return null;
    }
  }

  /**
   * 🔊 ВОСПРОИЗВЕДЕНИЕ аудио файла (главная функция)
   */
  async playAudio(cellKey: string): Promise<boolean> {
    console.log(`🎵 Запрос воспроизведения: ${cellKey}`);

    const audio = this.loadAudioToMemory(cellKey);
    if (!audio) return false;

    try {
      audio.currentTime = 0;
      await audio.play();
      console.log(`✅ Успешно воспроизведено: ${cellKey}`);
      return true;
    } catch (error) {
      console.error(`❌ Ошибка воспроизведения ${cellKey}:`, error);
      return false;
    }
  }

  /**
   * 📊 Статистика системы
   */
  getStats(): Record<string, any> {
    return {
      indexedFiles: Object.keys(this.loadedFiles).length,
      cachedAudio: this.audioCache.size,
      maxCacheSize: this.maxCacheSize,
      activeVariant: localStorage.getItem('wb-active-voice-variant') || 'не установлен'
    };
  }

  /**
   * 🧹 Очистка кэша
   */
  clearCache(): void {
    this.audioCache.clear();
    console.log('🧹 Кэш аудио очищен');
  }

  /**
   * 🔄 Перезагрузка индекса
   */
  reloadIndex(): void {
    this.loadedFiles = {};
    this.clearCache();
    this.loadFileIndex();
  }
}

// ГЛОБАЛЬНЫЙ ЭКЗЕМПЛЯР
const bulletproofAudio = BulletproofAudio.getInstance();

/**
 * 🎯 ОСНОВНАЯ ФУНКЦИЯ ДЛЯ ВОСПРОИЗВЕДЕНИЯ
 */
export async function playCellAudio(cellKey: string | number): Promise<boolean> {
  const key = String(cellKey);
  return await bulletproofAudio.playAudio(key);
}

/**
 * 🔄 Активация варианта озвучки
 */
export function activateVoiceVariant(variant: string): boolean {
  try {
    localStorage.setItem('wb-active-voice-variant', variant);
    bulletproofAudio.reloadIndex(); // Перезагружаем индекс с новым активным вариантом
    console.log(`🎯 Активирован вариант: ${variant}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка активации варианта:', error);
    return false;
  }
}

/**
 * 📊 Получить статистику системы
 */
export function getAudioSystemStats(): Record<string, any> {
  return bulletproofAudio.getStats();
}

/**
 * 🧹 Очистить кэш
 */
export function clearAudioCache(): void {
  bulletproofAudio.clearCache();
}

/**
 * 🔄 Перезагрузить систему
 */
export function reloadAudioSystem(): void {
  bulletproofAudio.reloadIndex();
}

console.log('🛡️ Пуленепробиваемая система озвучки ОПТИМИЗИРОВАНА и готова!');