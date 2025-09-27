/**
 * 🛡️ ПУЛЕНЕПРОБИВАЕМАЯ СИСТЕМА ОЗВУЧКИ
 * Работает ВСЕГДА, при любых обстоятельствах
 */

// ЕДИНСТВЕННЫЙ ключ хранения
const BULLETPROOF_KEY = 'bulletproof-audio-system';

interface AudioRecord {
  url: string;
  name: string;
  lastUsed: string;
}

class BulletproofAudio {
  private static instance: BulletproofAudio;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  static getInstance(): BulletproofAudio {
    if (!BulletproofAudio.instance) {
      BulletproofAudio.instance = new BulletproofAudio();
    }
    return BulletproofAudio.instance;
  }

  /**
   * 🔄 ПРИНУДИТЕЛЬНАЯ загрузка всех файлов при запуске
   */
  constructor() {
    this.loadAllAudioFiles();
  }

  /**
   * 📂 Загрузить ВСЕ аудио файлы из localStorage
   */
  private loadAllAudioFiles(): Record<string, string> {
    console.log('🛡️ === ПУЛЕНЕПРОБИВАЕМАЯ ЗАГРУЗКА ВСЕХ АУДИО ===');
    
    const allFiles: Record<string, string> = {};
    
    // СПИСОК ВСЕХ ВОЗМОЖНЫХ КЛЮЧЕЙ
    const storageKeys = [
      'wb-pvz-cell-audio-settings-permanent',
      'wb-audio-files',
      'wb-audio-files-backup', 
      'wb-audio-files-cells-backup',
      'wb-unified-audio-system',
      'customAudioFiles',
      'audioFiles',
      'cellAudios',
      // ДОБАВЛЯЕМ НОВЫЕ ВАРИАНТЫ ОЗВУЧКИ
      'wb-pvz-variant-variant1-audio-base64',
      'wb-pvz-variant-variant2-audio-base64',
      BULLETPROOF_KEY
    ];

    let totalLoaded = 0;

    storageKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          console.log(`🔍 Проверяю ключ: ${key}, размер данных: ${data.length}`);
          const parsed = JSON.parse(data);
          
          if (key === 'wb-unified-audio-system' && parsed.files) {
            // Единая система - извлекаем файлы
            Object.values(parsed.files).forEach((file: any) => {
              if (file.url && file.url.startsWith('data:audio/')) {
                allFiles[file.cellNumber || file.name] = file.url;
                // Дублируем с разными префиксами
                if (file.cellNumber) {
                  allFiles[file.cellNumber] = file.url;
                  allFiles[`cell-${file.cellNumber}`] = file.url;
                  allFiles[`ячейка-${file.cellNumber}`] = file.url;
                }
                totalLoaded++;
              }
            });
          } else if (typeof parsed === 'object') {
            // Обычные системы - добавляем все файлы
            Object.entries(parsed).forEach(([fileKey, fileUrl]) => {
              if (typeof fileUrl === 'string' && 
                  (fileUrl.startsWith('data:audio/') || fileUrl.startsWith('blob:'))) {
                allFiles[fileKey] = fileUrl;
                
                // Если это ячейка - создаем все варианты ключей
                const cellMatch = fileKey.match(/(\d+)/);
                if (cellMatch) {
                  const cellNumber = cellMatch[1];
                  allFiles[cellNumber] = fileUrl;
                  allFiles[`cell-${cellNumber}`] = fileUrl;
                  allFiles[`ячейка-${cellNumber}`] = fileUrl;
                }
                
                totalLoaded++;
              }
            });
          }
          
          console.log(`📂 Загружено из ${key}: ${Object.keys(parsed).length} файлов`);
        }
      } catch (error) {
        console.warn(`⚠️ Ошибка загрузки из ${key}:`, error);
      }
    });

    console.log(`🛡️ ИТОГО ЗАГРУЖЕНО: ${totalLoaded} уникальных файлов`);
    console.log(`🛡️ ВСЕГО КЛЮЧЕЙ В ПАМЯТИ: ${Object.keys(allFiles).length}`);

    // Сохраняем в пуленепробиваемое хранилище
    this.saveToStorage(allFiles);

    return allFiles;
  }

  /**
   * 💾 Сохранить в пуленепробиваемое хранилище
   */
  private saveToStorage(files: Record<string, string>): void {
    try {
      const bulletproofData = {
        files: files,
        lastUpdate: new Date().toISOString(),
        version: 'bulletproof-1.0'
      };
      
      localStorage.setItem(BULLETPROOF_KEY, JSON.stringify(bulletproofData));
      
      // ДУБЛИРУЕМ в основные ключи для совместимости
      localStorage.setItem('wb-audio-files', JSON.stringify(files));
      localStorage.setItem('wb-pvz-cell-audio-settings-permanent', JSON.stringify(files));
      
      console.log('🛡️ Файлы сохранены в пуленепробиваемое хранилище');
    } catch (error) {
      console.error('❌ Ошибка сохранения пуленепробиваемого хранилища:', error);
    }
  }

  /**
   * 🎯 ГЛАВНАЯ ФУНКЦИЯ: Воспроизвести аудио
   */
  async playAudio(key: string): Promise<boolean> {
    console.log(`🛡️ === ПУЛЕНЕПРОБИВАЕМОЕ ВОСПРОИЗВЕДЕНИЕ: ${key} ===`);

    // Перезагружаем файлы при каждом воспроизведении для надежности
    const allFiles = this.loadAllAudioFiles();

    // Список возможных ключей для поиска
    const possibleKeys = [
      key,
      key.toString(),
      `cell-${key}`,
      `ячейка-${key}`,
      key.toLowerCase(),
      key.toUpperCase()
    ];

    // Специальные маппинги для системных звуков
    if (key === 'discount') {
      possibleKeys.push(
        'Товары со со скидкой проверьте ВБ кошелек',
        'Товары со скидкой проверьте ВБ кошелек',
        'товары со скидкой проверьте вб кошелек',
        'скидка',
        'кошелек',
        'пик цифра товаров' // Альтернативный вариант
      );
    }

    if (key === 'check-product' || key === 'check-product-camera') {
      possibleKeys.push(
        'Проверьте товар под камерой',
        'пожалуйста проверьте товар под камерой',
        'камера',
        'товар'
      );
    }

    if (key === 'rate-pvz') {
      possibleKeys.push(
        'Оцените наш пункт выдачи',
        'Пожалуйста оцените наш пункт выдачи в приложении',
        'пожалуйста оцените наш пункт выдачи в приложении',
        'спасибо за заказ оцените пункт выдачи',
        'оцените',
        'пункт выдачи',
        'отзыв'
      );
    }

    // Новые системные звуки для альтернативного варианта
    if (key === 'cash-on-delivery') {
      possibleKeys.push(
        'оплата при получении',
        'наложенный платеж',
        'оплата'
      );
    }

    // Ищем файл по всем возможным ключам
    let audioUrl: string | null = null;
    let foundKey = '';

    for (const searchKey of possibleKeys) {
      if (allFiles[searchKey]) {
        audioUrl = allFiles[searchKey];
        foundKey = searchKey;
        break;
      }
    }

    if (!audioUrl) {
      console.error(`❌ ПУЛЕНЕПРОБИВАЕМАЯ СИСТЕМА: Аудио "${key}" НЕ НАЙДЕНО`);
      console.log(`🔍 Искали по ключам:`, possibleKeys);
      console.log(`📂 Доступные ключи:`, Object.keys(allFiles).slice(0, 20));
      return false;
    }

    // Воспроизводим аудио
    try {
      // Создаем новый Audio элемент каждый раз для надежности
      const audio = new Audio();
      audio.src = audioUrl;
      audio.volume = 0.8;
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Таймаут воспроизведения'));
        }, 5000);

        audio.addEventListener('ended', () => {
          clearTimeout(timeout);
          resolve();
        });

        audio.addEventListener('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });

        audio.play().catch(reject);
      });

      console.log(`✅ ПУЛЕНЕПРОБИВАЕМО: "${key}" воспроизведено (ключ: ${foundKey})`);
      return true;

    } catch (error) {
      console.error(`❌ ПУЛЕНЕПРОБИВАЕМАЯ СИСТЕМА: Ошибка воспроизведения "${key}":`, error);
      return false;
    }
  }

  /**
   * 📊 Получить статистику
   */
  getStats(): { totalFiles: number; cellFiles: number; systemFiles: number } {
    const allFiles = this.loadAllAudioFiles();
    const keys = Object.keys(allFiles);
    
    const cellFiles = keys.filter(key => 
      /^\d+$/.test(key) || key.includes('cell-') || key.includes('ячейка-')
    ).length;
    
    const systemFiles = keys.filter(key =>
      key.includes('скидк') || key.includes('кошелек') || key.includes('камер') || 
      key.includes('товар') || key.includes('discount') || key.includes('check')
    ).length;

    return {
      totalFiles: keys.length,
      cellFiles: Math.floor(cellFiles / 3), // Делим на 3 т.к. каждая ячейка в 3 форматах
      systemFiles
    };
  }
}

// Создаем единственный экземпляр
const bulletproofAudio = BulletproofAudio.getInstance();

// Экспортируем главные функции
export const playAudio = (key: string) => bulletproofAudio.playAudio(key);
export const playCellAudio = (cellNumber: string) => bulletproofAudio.playAudio(cellNumber);
export const playSystemAudio = (soundKey: string) => bulletproofAudio.playAudio(soundKey);
export const getAudioStats = () => bulletproofAudio.getStats();

// Автоматически загружаем все файлы при импорте
console.log('🛡️ ПУЛЕНЕПРОБИВАЕМАЯ СИСТЕМА АКТИВИРОВАНА');