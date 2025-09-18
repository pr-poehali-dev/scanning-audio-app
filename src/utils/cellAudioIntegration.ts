/**
 * Интеграция ячеек в основную систему озвучки
 * Использует тот же алгоритм что и системные озвучки
 */

import { saveAudioFiles, loadAudioFilesFromStorage, saveCellSettings } from '../hooks/audio/audioStorage';

/**
 * Сохранить озвучку ячейки в основную систему (wb-audio-files)
 * Использует тот же принцип что и "Проверьте товар под камерой"
 */
export const saveCellAudioToMainSystem = async (cellNumber: string, file: File): Promise<boolean> => {
  try {
    console.log(`💾 [СУПЕР-СОХРАНЕНИЕ] Начинаю сохранение ${file.name} для ячейки ${cellNumber}`);
    console.log(`📊 [СУПЕР-СОХРАНЕНИЕ] Размер файла: ${file.size} байт, тип: ${file.type}`);
    
    // ТЕСТ 1: Проверяем что файл читается
    const dataUrl = await fileToDataUrl(file);
    console.log(`✅ [СУПЕР-СОХРАНЕНИЕ] Файл конвертирован в Data URL (${dataUrl.length} символов)`);
    
    // ТЕСТ 2: Проверяем что файл воспроизводится
    try {
      const testAudio = new Audio(dataUrl);
      testAudio.volume = 0.1;
      await testAudio.play();
      testAudio.pause();
      testAudio.currentTime = 0;
      console.log(`✅ [СУПЕР-СОХРАНЕНИЕ] Файл прошел тест воспроизведения`);
    } catch (testError) {
      console.error(`❌ [СУПЕР-СОХРАНЕНИЕ] Файл НЕ воспроизводится:`, testError);
      throw new Error(`Файл поврежден или неподдерживаемый формат: ${testError.message}`);
    }
    
    // ОСНОВНОЕ СОХРАНЕНИЕ: Загружаем существующие файлы
    const existingFiles = loadAudioFilesFromStorage();
    console.log(`📦 [СУПЕР-СОХРАНЕНИЕ] Загружено ${Object.keys(existingFiles).length} существующих файлов`);
    
    // Создаем ВСЕ возможные ключи для максимальной совместимости
    const cellKeys = [
      cellNumber,                     // "A1"
      `cell-${cellNumber}`,           // "cell-A1" (основной)
      `${cellNumber}`,                // "A1" (дубль для надежности)
      `ячейка-${cellNumber}`,         // "ячейка-A1"
      `Ячейка ${cellNumber}`,         // "Ячейка A1"
      `delivery-cell-${cellNumber}`,  // "delivery-cell-A1"
      cellNumber.toLowerCase(),       // "a1"
      `cell_${cellNumber}`,           // "cell_A1"
      `${cellNumber}.mp3`,            // "A1.mp3"
      `audio_${cellNumber}`,          // "audio_A1"
    ];
    
    console.log(`🔧 [СУПЕР-СОХРАНЕНИЕ] Сохраняю под ${cellKeys.length} ключами:`, cellKeys);
    
    // Добавляем озвучку под всеми ключами
    cellKeys.forEach(key => {
      existingFiles[key] = dataUrl;
      console.log(`💾 [СУПЕР-СОХРАНЕНИЕ] Сохранен ключ: ${key}`);
    });
    
    // КРИТИЧЕСКИ ВАЖНО: Сохраняем обновленные файлы
    saveAudioFiles(existingFiles);
    console.log(`✅ [СУПЕР-СОХРАНЕНИЕ] Вызван saveAudioFiles()`);
    
    saveCellSettings(existingFiles);
    console.log(`✅ [СУПЕР-СОХРАНЕНИЕ] Вызван saveCellSettings()`);
    
    // ПРОВЕРКА: Читаем обратно что сохранилось
    const verification = loadAudioFilesFromStorage();
    let foundKeys = 0;
    cellKeys.forEach(key => {
      if (verification[key] && verification[key] === dataUrl) {
        foundKeys++;
      }
    });
    
    console.log(`✅ [СУПЕР-СОХРАНЕНИЕ] Проверка: ${foundKeys}/${cellKeys.length} ключей сохранились корректно`);
    
    if (foundKeys === 0) {
      throw new Error('КРИТИЧЕСКАЯ ОШИБКА: НИ ОДИН ключ не сохранился!');
    }
    
    // ДОПОЛНИТЕЛЬНОЕ СОХРАНЕНИЕ в простом формате для совместимости
    const simpleKey = `audio_${cellNumber}`;
    localStorage.setItem(simpleKey, dataUrl);
    console.log(`✅ [СУПЕР-СОХРАНЕНИЕ] Дополнительно сохранен простой ключ: ${simpleKey}`);
    
    console.log(`🎉 [СУПЕР-СОХРАНЕНИЕ] УСПЕХ! Ячейка ${cellNumber} сохранена под ${foundKeys} ключами`);
    return true;
    
  } catch (error) {
    console.error(`💥 [СУПЕР-СОХРАНЕНИЕ] КРИТИЧЕСКАЯ ОШИБКА для ячейки ${cellNumber}:`, error);
    return false;
  }
};

/**
 * Воспроизвести озвучку ячейки через основную систему
 */
export const playCellAudioFromMainSystem = async (cellNumber: string): Promise<boolean> => {
  try {
    console.log(`🎵 [ГЛАВНАЯ СИСТЕМА] Воспроизведение ячейки ${cellNumber}`);
    
    // Загружаем все файлы
    const files = loadAudioFilesFromStorage();
    console.log(`📦 [ГЛАВНАЯ СИСТЕМА] Загружено ${Object.keys(files).length} файлов`);
    
    // Показываем все ключи для отладки
    const allKeys = Object.keys(files);
    console.log(`📋 [ГЛАВНАЯ СИСТЕМА] Первые 10 ключей:`, allKeys.slice(0, 10));
    
    // Ищем озвучку ячейки по разным ключам
    const possibleKeys = [
      `cell-${cellNumber}`,
      `${cellNumber}`,
      `ячейка-${cellNumber}`,
      `Ячейка ${cellNumber}`,
      `delivery-cell-${cellNumber}`,
    ];
    
    console.log(`🔍 [ГЛАВНАЯ СИСТЕМА] Ищу ключи для ячейки "${cellNumber}":`, possibleKeys);
    
    let audioUrl: string | null = null;
    let foundKey = '';
    
    for (const key of possibleKeys) {
      const hasKey = files.hasOwnProperty(key);
      const fileContent = files[key];
      console.log(`🔎 [ГЛАВНАЯ СИСТЕМА] Ключ "${key}": ${hasKey ? 'ЕСТЬ' : 'НЕТ'}${hasKey ? ` (${fileContent ? fileContent.substring(0, 30) + '...' : 'ПУСТОЙ'})` : ''}`);
      
      if (files[key]) {
        audioUrl = files[key];
        foundKey = key;
        console.log(`✅ [ГЛАВНАЯ СИСТЕМА] Найден ключ: ${key}`);
        break;
      }
    }
    
    if (!audioUrl) {
      console.warn(`❌ [ГЛАВНАЯ СИСТЕМА] Озвучка ячейки ${cellNumber} не найдена`);
      const cellKeys = Object.keys(files).filter(k => 
        k.includes('cell-') || k.includes('ячейка') || /^\d+$/.test(k)
      );
      console.log(`📋 Доступные ячейки:`, cellKeys);
      return false;
    }
    
    // Воспроизводим аудио
    const audio = new Audio(audioUrl);
    audio.volume = 0.8;
    
    try {
      await audio.play();
      console.log(`✅ [ГЛАВНАЯ СИСТЕМА] Ячейка ${cellNumber} воспроизводится (ключ: ${foundKey})`);
      return true;
    } catch (playError) {
      console.error(`❌ [ГЛАВНАЯ СИСТЕМА] Ошибка воспроизведения:`, playError);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ [ГЛАВНАЯ СИСТЕМА] Критическая ошибка для ячейки ${cellNumber}:`, error);
    return false;
  }
};

/**
 * Получить список ячеек с озвучкой из основной системы
 */
export const getCellsFromMainSystem = (): string[] => {
  try {
    const files = loadAudioFilesFromStorage();
    console.log(`📦 [getCellsFromMainSystem] Всего файлов: ${Object.keys(files).length}`);
    
    const cellNumbers: Set<string> = new Set();
    const validCells: Set<string> = new Set();
    let emptyFiles = 0;
    let validFiles = 0;
    
    Object.keys(files).forEach(key => {
      let cellNumber = '';
      
      // Извлекаем номер ячейки из разных форматов ключей
      if (key.startsWith('cell-')) {
        cellNumber = key.replace('cell-', '');
      } else if (key.startsWith('ячейка-')) {
        cellNumber = key.replace('ячейка-', '');
      } else if (key.startsWith('Ячейка ')) {
        cellNumber = key.replace('Ячейка ', '');
      } else if (key.startsWith('delivery-cell-')) {
        cellNumber = key.replace('delivery-cell-', '');
      } else if (/^\d+$/.test(key)) {
        cellNumber = key;
      }
      
      if (cellNumber) {
        cellNumbers.add(cellNumber);
        
        // Проверяем что файл не пустой
        const fileContent = files[key];
        if (fileContent && fileContent.length > 100) { // Минимальная длина для аудио файла
          validCells.add(cellNumber);
          validFiles++;
        } else {
          emptyFiles++;
        }
      }
    });
    
    const sortedCells = Array.from(validCells).sort((a, b) => {
      const aNum = parseInt(a) || 0;
      const bNum = parseInt(b) || 0;
      return aNum - bNum;
    });
    
    console.log(`📋 [ГЛАВНАЯ СИСТЕМА] Найдено ${cellNumbers.size} ключей ячеек, из них валидных: ${validCells.size}`);
    console.log(`📊 [ГЛАВНАЯ СИСТЕМА] Валидных файлов: ${validFiles}, пустых: ${emptyFiles}`);
    console.log(`🎯 [ГЛАВНАЯ СИСТЕМА] Первые 10 валидных:`, sortedCells.slice(0, 10));
    return sortedCells;
    
  } catch (error) {
    console.error(`❌ [ГЛАВНАЯ СИСТЕМА] Ошибка получения списка ячеек:`, error);
    return [];
  }
};

/**
 * Конвертировать файл в Data URL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Добавить ячейки в систему маппинга ключей
 * Это позволит находить ячейки через основную функцию playAudio()
 */
export const addCellsToKeyMapping = (): void => {
  try {
    const cells = getCellsFromMainSystem();
    
    // Динамически расширяем маппинг ключей
    const dynamicMapping: {[key: string]: string[]} = {};
    
    cells.forEach(cellNumber => {
      const cellKey = `cell-${cellNumber}`;
      dynamicMapping[cellKey] = [
        `cell-${cellNumber}`,
        `${cellNumber}`,
        `ячейка-${cellNumber}`,
        `Ячейка ${cellNumber}`,
        `delivery-cell-${cellNumber}`,
      ];
    });
    
    console.log(`🔧 [ГЛАВНАЯ СИСТЕМА] Добавлен маппинг для ${cells.length} ячеек`);
    
    // Сохраняем маппинг в глобальную переменную для использования в audioPlayer
    (window as any).cellKeyMapping = dynamicMapping;
    
  } catch (error) {
    console.error(`❌ [ГЛАВНАЯ СИСТЕМА] Ошибка создания маппинга:`, error);
  }
};

/**
 * Миграция ячеек из других систем в главную
 */
export const migrateCellsToMainSystem = async (): Promise<number> => {
  let migratedCount = 0;
  
  try {
    console.log(`🔄 [МИГРАЦИЯ] Начинаю миграцию ячеек в основную систему...`);
    
    // Проверяем Object URL менеджер
    try {
      const { objectUrlAudioManager } = await import('./objectUrlAudioManager');
      const objectUrlCells = objectUrlAudioManager.getCellsWithAudio();
      
      if (objectUrlCells.length > 0) {
        console.log(`📦 [МИГРАЦИЯ] Найдено ${objectUrlCells.length} ячеек в Object URL менеджере`);
        // Примечание: Object URLs нельзя мигрировать в Data URLs,
        // но мы можем убедиться что маппинг настроен правильно
      }
    } catch (error) {
      console.log(`⚠️ [МИГРАЦИЯ] Object URL менеджер недоступен`);
    }
    
    // Проверяем новый Data URL менеджер
    try {
      const { audioManager } = await import('./simpleAudioManager');
      const dataUrlCells = audioManager.getCellsWithAudio();
      
      if (dataUrlCells.length > 0) {
        console.log(`📦 [МИГРАЦИЯ] Найдено ${dataUrlCells.length} ячеек в Data URL менеджере`);
        // Здесь можно было бы мигрировать, но это сложно без доступа к исходным Data URLs
      }
    } catch (error) {
      console.log(`⚠️ [МИГРАЦИЯ] Data URL менеджер недоступен`);
    }
    
    // Обновляем маппинг ключей
    addCellsToKeyMapping();
    
    console.log(`✅ [МИГРАЦИЯ] Завершена миграция ${migratedCount} ячеек`);
    return migratedCount;
    
  } catch (error) {
    console.error(`❌ [МИГРАЦИЯ] Ошибка миграции:`, error);
    return 0;
  }
};

/**
 * Инициализация системы ячеек
 */
export const initializeCellAudioSystem = async (): Promise<void> => {
  try {
    console.log(`🚀 [ИНИЦИАЛИЗАЦИЯ] Запуск системы озвучки ячеек...`);
    
    // Мигрируем существующие ячейки
    await migrateCellsToMainSystem();
    
    // Настраиваем маппинг ключей
    addCellsToKeyMapping();
    
    // Проверяем состояние
    const cells = getCellsFromMainSystem();
    console.log(`✅ [ИНИЦИАЛИЗАЦИЯ] Система готова. Доступно ${cells.length} ячеек`);
    
  } catch (error) {
    console.error(`❌ [ИНИЦИАЛИЗАЦИЯ] Ошибка инициализации:`, error);
  }
};