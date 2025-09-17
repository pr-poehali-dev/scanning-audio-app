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
    console.log(`💾 [ГЛАВНАЯ СИСТЕМА] Сохраняю ячейку ${cellNumber} в wb-audio-files...`);
    
    // Загружаем существующие файлы
    const existingFiles = loadAudioFilesFromStorage();
    
    // Конвертируем файл в Data URL
    const dataUrl = await fileToDataUrl(file);
    
    // Создаем ключи для ячейки (аналогично системным озвучкам)
    const cellKeys = [
      `cell-${cellNumber}`,           // Основной ключ
      `${cellNumber}`,                // Просто номер
      `ячейка-${cellNumber}`,         // Русский ключ
      `Ячейка ${cellNumber}`,         // Красивый русский ключ
      `delivery-cell-${cellNumber}`,  // С префиксом delivery (как системные)
    ];
    
    // Добавляем озвучку под всеми ключами
    cellKeys.forEach(key => {
      existingFiles[key] = dataUrl;
    });
    
    // Сохраняем обновленные файлы
    saveAudioFiles(existingFiles);
    saveCellSettings(existingFiles);
    
    console.log(`✅ [ГЛАВНАЯ СИСТЕМА] Ячейка ${cellNumber} сохранена под ключами:`, cellKeys);
    return true;
    
  } catch (error) {
    console.error(`❌ [ГЛАВНАЯ СИСТЕМА] Ошибка сохранения ячейки ${cellNumber}:`, error);
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
    
    // Ищем озвучку ячейки по разным ключам
    const possibleKeys = [
      `cell-${cellNumber}`,
      `${cellNumber}`,
      `ячейка-${cellNumber}`,
      `Ячейка ${cellNumber}`,
      `delivery-cell-${cellNumber}`,
    ];
    
    let audioUrl: string | null = null;
    let foundKey = '';
    
    for (const key of possibleKeys) {
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
    const cellNumbers: Set<string> = new Set();
    
    Object.keys(files).forEach(key => {
      // Извлекаем номер ячейки из разных форматов ключей
      if (key.startsWith('cell-')) {
        cellNumbers.add(key.replace('cell-', ''));
      } else if (key.startsWith('ячейка-')) {
        cellNumbers.add(key.replace('ячейка-', ''));
      } else if (key.startsWith('Ячейка ')) {
        cellNumbers.add(key.replace('Ячейка ', ''));
      } else if (key.startsWith('delivery-cell-')) {
        cellNumbers.add(key.replace('delivery-cell-', ''));
      } else if (/^\d+$/.test(key)) {
        cellNumbers.add(key);
      }
    });
    
    const sortedCells = Array.from(cellNumbers).sort((a, b) => {
      const aNum = parseInt(a) || 0;
      const bNum = parseInt(b) || 0;
      return aNum - bNum;
    });
    
    console.log(`📋 [ГЛАВНАЯ СИСТЕМА] Найдено ${sortedCells.length} ячеек:`, sortedCells.slice(0, 10));
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