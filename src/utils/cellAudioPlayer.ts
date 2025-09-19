import { audioManager } from './simpleAudioManager';
import { voiceAssistantManager } from './voiceAssistantManager';

/**
 * Воспроизведение аудио файла ячейки
 * Теперь использует систему голосовых помощников с выбором между старым и новым
 */
export const playCellAudio = async (cellNumber: string): Promise<boolean> => {
  try {
    console.log(`🔊 Воспроизведение озвучки для ячейки: ${cellNumber}`);
    
    // Используем систему голосовых помощников
    const success = await voiceAssistantManager.playCellAudio(cellNumber);
    
    if (success) {
      console.log(`✅ Аудио ячейки ${cellNumber} воспроизводится через ${voiceAssistantManager.getCurrentAssistant()} помощника`);
    } else {
      console.warn(`❌ Аудио для ячейки ${cellNumber} не найдено в системе ${voiceAssistantManager.getCurrentAssistant()} помощника`);
      
      // Для fallback показываем информацию о доступных ячейках
      if (voiceAssistantManager.getCurrentAssistant() === 'old') {
        // Для старого помощника показываем ячейки из audioManager
        const availableCells = audioManager.getCellsWithAudio();
        console.log(`📋 Доступные ячейки в старой системе (${availableCells.length}):`, availableCells.slice(0, 10));
      } else {
        // Для нового помощника показываем загруженные звуки
        const loadedSounds = voiceAssistantManager.getLoadedSounds();
        console.log(`📋 Загруженные звуки в новой системе (${loadedSounds.length}):`, loadedSounds);
      }
    }
    
    return success;
  } catch (error) {
    console.error(`❌ Ошибка воспроизведения ячейки "${cellNumber}":`, error);
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