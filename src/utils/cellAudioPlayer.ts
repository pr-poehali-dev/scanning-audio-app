import { audioManager } from './simpleAudioManager';

/**
 * Воспроизведение аудио файла ячейки
 * Теперь использует упрощенный и надежный audioManager
 */
export const playCellAudio = async (cellNumber: string): Promise<boolean> => {
  try {
    console.log(`🔊 [NEW SYSTEM] Воспроизведение озвучки для ячейки: ${cellNumber}`);
    
    // Пытаемся мигрировать данные из старой системы если это первый запуск
    const hasFiles = audioManager.getCellsWithAudio().length > 0;
    if (!hasFiles) {
      console.log('🔄 Данных нет, пытаемся мигрировать из старой системы...');
      audioManager.migrateFromOldSystem();
    }
    
    // Используем новый менеджер
    const success = await audioManager.playCellAudio(cellNumber);
    
    if (success) {
      console.log(`✅ [NEW SYSTEM] Аудио ячейки ${cellNumber} воспроизводится`);
    } else {
      console.warn(`❌ [NEW SYSTEM] Аудио для ячейки ${cellNumber} не найдено`);
      
      // Показываем информацию о доступных ячейках
      const availableCells = audioManager.getCellsWithAudio();
      console.log(`📋 Доступные ячейки с аудио (${availableCells.length}):`, availableCells.slice(0, 10));
      
      const storageInfo = audioManager.getStorageInfo();
      console.log(`💽 Информация о хранилище:`, storageInfo);
    }
    
    return success;
  } catch (error) {
    console.error(`❌ [NEW SYSTEM] Ошибка воспроизведения ячейки "${cellNumber}":`, error);
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