/**
 * 🛡️ ПУЛЕНЕПРОБИВАЕМАЯ СИСТЕМА ОЗВУЧКИ
 * ЭКСТРЕМАЛЬНАЯ ЭКОНОМИЯ ПАМЯТИ
 */

class BulletproofAudio {
  private static instance: BulletproofAudio;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private maxCacheSize = 3; // МАКСИМУМ 3 аудио в памяти одновременно
  private currentActiveVariant: string | null = null;

  static getInstance(): BulletproofAudio {
    if (!BulletproofAudio.instance) {
      BulletproofAudio.instance = new BulletproofAudio();
    }
    return BulletproofAudio.instance;
  }

  constructor() {
    this.currentActiveVariant = localStorage.getItem('wb-active-voice-variant');
    console.log('🛡️ Пуленепробиваемая система УЛЬТРА-ЭКОНОМНАЯ инициализирована');
  }

  /**
   * 🔍 Поиск файла БЕЗ загрузки в память (только проверка существования)
   */
  private findAudioUrl(cellKey: string): string | null {
    // Сначала проверяем активный вариант
    if (this.currentActiveVariant) {
      const activeStorageKey = `wb-voice-${this.currentActiveVariant}-permanent`;
      try {
        const data = localStorage.getItem(activeStorageKey);
        if (data) {
          const parsed = JSON.parse(data);
          
          // Ищем файл по разным ключам
          const searchKeys = [
            cellKey,
            cellKey.toString(),
            `cell-${cellKey}`,
            `ячейка-${cellKey}`
          ];
          
          for (const key of searchKeys) {
            if (parsed[key] && typeof parsed[key] === 'string' && parsed[key].startsWith('data:audio/')) {
              console.log(`🎯 Найден файл в активном варианте ${this.currentActiveVariant}: ${key}`);
              return parsed[key];
            }
          }
        }
      } catch (error) {
        console.error(`❌ Ошибка поиска в активном варианте:`, error);
      }
    }

    // Fallback поиск в старых системах (ТОЛЬКО первые 2 ключа)
    const fallbackKeys = [
      'wb-pvz-cell-audio-settings-permanent',
      'wb-unified-audio-system'
    ];

    for (const storageKey of fallbackKeys) {
      try {
        const data = localStorage.getItem(storageKey);
        if (!data) continue;
        
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && parsed !== null) {
          
          if (storageKey === 'wb-unified-audio-system' && parsed.files) {
            // Проверяем только первые 3 файла
            const files = Object.values(parsed.files).slice(0, 3);
            for (const file of files) {
              const fileObj = file as any;
              if (fileObj.cellNumber == cellKey && fileObj.url && fileObj.url.startsWith('data:audio/')) {
                console.log(`🔍 Fallback из ${storageKey}: файл ${cellKey}`);
                return fileObj.url;
              }
            }
          } else {
            // Обычная система - проверяем только нужный ключ
            if (parsed[cellKey] && typeof parsed[cellKey] === 'string' && parsed[cellKey].startsWith('data:audio/')) {
              console.log(`🔍 Fallback из ${storageKey}: файл ${cellKey}`);
              return parsed[cellKey];
            }
          }
        }
      } catch (error) {
        // Тихо игнорируем ошибки
      }
    }

    console.warn(`❌ Файл не найден: ${cellKey}`);
    return null;
  }

  /**
   * 💾 ЛЕНИВАЯ загрузка аудио в память (только при воспроизведении)
   */
  private loadAudioToMemory(cellKey: string, audioUrl: string): HTMLAudioElement | null {
    // Проверяем кэш
    if (this.audioCache.has(cellKey)) {
      console.log(`💿 Из кэша: ${cellKey}`);
      return this.audioCache.get(cellKey)!;
    }

    try {
      // АГРЕССИВНАЯ очистка кэша
      if (this.audioCache.size >= this.maxCacheSize) {
        // Удаляем ВСЕ элементы кроме последнего
        const entries = Array.from(this.audioCache.entries());
        for (let i = 0; i < entries.length - 1; i++) {
          const [key, audio] = entries[i];
          audio.pause();
          audio.src = '';
          this.audioCache.delete(key);
        }
        console.log(`🗑️ Кэш ОЧИЩЕН: оставлен 1 файл из ${entries.length}`);
      }

      // Создаем аудио элемент
      const audio = new Audio();
      audio.preload = 'none'; // НЕ загружаем заранее
      audio.src = audioUrl;
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

    // Сначала ищем файл БЕЗ загрузки в память
    const audioUrl = this.findAudioUrl(cellKey);
    if (!audioUrl) return false;

    // Только ТЕПЕРЬ загружаем в память
    const audio = this.loadAudioToMemory(cellKey, audioUrl);
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
   * 🎯 Активация варианта
   */
  activateVariant(variant: string): boolean {
    try {
      this.currentActiveVariant = variant;
      localStorage.setItem('wb-active-voice-variant', variant);
      
      // ПОЛНАЯ очистка кэша при смене варианта
      this.clearCache();
      
      console.log(`🎯 Активирован вариант: ${variant}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка активации варианта:', error);
      return false;
    }
  }

  /**
   * 📊 Минимальная статистика
   */
  getStats(): Record<string, any> {
    return {
      cachedAudio: this.audioCache.size,
      maxCacheSize: this.maxCacheSize,
      activeVariant: this.currentActiveVariant || 'не установлен'
    };
  }

  /**
   * 🧹 Полная очистка кэша
   */
  clearCache(): void {
    this.audioCache.forEach((audio, key) => {
      audio.pause();
      audio.src = '';
    });
    this.audioCache.clear();
    console.log('🧹 Кэш аудио ПОЛНОСТЬЮ очищен');
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
  return bulletproofAudio.activateVariant(variant);
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
  bulletproofAudio.clearCache();
}

/**
 * 📋 Получить информацию о вариантах озвучки
 */
export function getVoiceVariantsInfo(): Record<string, { count: number; exists: boolean; cells: string[] }> {
  const variants = {
    standard: { count: 0, exists: false, cells: [] as string[] },
    alternative: { count: 0, exists: false, cells: [] as string[] }
  };

  // Проверяем каждый вариант в localStorage БЕЗ загрузки данных
  Object.keys(variants).forEach(variant => {
    const storageKey = `wb-voice-${variant}-permanent`;
    try {
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && parsed !== null) {
          const cells = Object.keys(parsed).filter(key => /^\d+$/.test(key)).sort((a, b) => parseInt(a) - parseInt(b));
          variants[variant as keyof typeof variants] = {
            count: cells.length,
            exists: cells.length > 0,
            cells: cells.slice(0, 5) // Показываем только первые 5 ячеек
          };
        }
      }
    } catch (error) {
      console.error(`Ошибка чтения данных для ${variant}:`, error);
    }
  });

  return variants;
}

console.log('🛡️ Пуленепробиваемая система озвучки ЭКСТРЕМАЛЬНО ОПТИМИЗИРОВАНА!');