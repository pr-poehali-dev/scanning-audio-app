import { audioManager } from './simpleAudioManager';

/**
 * Воспроизведение аудио файла ячейки
 * ПРОСТОЕ И НАДЕЖНОЕ РЕШЕНИЕ - только audioManager
 */
export const playCellAudio = async (cellNumber: string): Promise<boolean> => {
  try {
    console.log(`🔊 ПРЯМОЕ воспроизведение ячейки: ${cellNumber}`);
    
    // ТОЛЬКО audioManager - никаких сложных систем
    const success = await audioManager.playCellAudio(cellNumber);
    
    if (success) {
      console.log(`✅ Ячейка ${cellNumber} воспроизведена УСПЕШНО`);
    } else {
      console.warn(`❌ Ячейка ${cellNumber} НЕ НАЙДЕНА`);
    }
    
    return success;
  } catch (error) {
    console.error(`❌ ОШИБКА воспроизведения ячейки "${cellNumber}":`, error);
    return false;
  }
};

/**
 * Проверка наличия озвучки для ячейки
 */
export const hasCellAudio = (cellNumber: string): boolean => {
  try {
    // Мигрируем данные если нужно
    const hasFiles = audioManager.getCellsWithAudio().length > 0;
    if (!hasFiles) {
      audioManager.migrateFromOldSystem();
    }
    
    const availableCells = audioManager.getCellsWithAudio();
    return availableCells.includes(cellNumber) || availableCells.includes(cellNumber.toUpperCase());
  } catch (error) {
    console.error(`❌ [NEW SYSTEM] Ошибка проверки озвучки для ячейки ${cellNumber}:`, error);
    return false;
  }
};

/**
 * Получение списка всех озвученных ячеек
 */
export const getAudioEnabledCells = (): string[] => {
  try {
    // Мигрируем данные если нужно
    const hasFiles = audioManager.getCellsWithAudio().length > 0;
    if (!hasFiles) {
      audioManager.migrateFromOldSystem();
    }
    
    const cells = audioManager.getCellsWithAudio();
    console.log(`📋 [NEW SYSTEM] Найдено ${cells.length} озвученных ячеек:`, cells.slice(0, 10));
    return cells;
  } catch (error) {
    console.error('❌ [NEW SYSTEM] Ошибка получения списка озвученных ячеек:', error);
    return [];
  }
};