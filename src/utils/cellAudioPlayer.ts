import { audioManager } from './simpleAudioManager';

/**
 * Воспроизведение аудио файла ячейки
 * ПРОСТОЕ И НАДЕЖНОЕ РЕШЕНИЕ - только audioManager
 */
export const playCellAudio = async (cellNumber: string): Promise<boolean> => {
  try {
    console.log(`🔊 ПРЯМОЕ воспроизведение ячейки: ${cellNumber}`);
    
    // СНАЧАЛА пробуем bulletproof систему (новые варианты озвучки)
    try {
      const { playCellAudio: bulletproofPlay } = await import('./bulletproofAudio');
      const bulletproofSuccess = await bulletproofPlay(cellNumber);
      
      if (bulletproofSuccess) {
        console.log(`✅ Ячейка ${cellNumber} воспроизведена через BULLETPROOF систему`);
        return true;
      }
    } catch (bulletproofError) {
      console.log(`⚠️ Bulletproof система недоступна:`, bulletproofError);
    }
    
    // ЗАТЕМ пробуем audioManager (старая система)
    const success = await audioManager.playCellAudio(cellNumber);
    
    if (success) {
      console.log(`✅ Ячейка ${cellNumber} воспроизведена через AUDIOMANAGER`);
    } else {
      console.warn(`❌ Ячейка ${cellNumber} НЕ НАЙДЕНА ни в одной системе`);
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
    // СНАЧАЛА проверяем bulletproof систему
    try {
      const activeVariant = localStorage.getItem('wb-active-voice-variant');
      if (activeVariant) {
        const variantData = localStorage.getItem(`wb-voice-${activeVariant}-permanent`);
        if (variantData) {
          const parsed = JSON.parse(variantData);
          if (parsed[cellNumber] || parsed[cellNumber.toString()]) {
            return true;
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Ошибка проверки bulletproof системы:', error);
    }
    
    // ЗАТЕМ проверяем audioManager
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
    const allCells: string[] = [];
    
    // СНАЧАЛА добавляем ячейки из bulletproof системы
    try {
      const activeVariant = localStorage.getItem('wb-active-voice-variant');
      if (activeVariant) {
        const variantData = localStorage.getItem(`wb-voice-${activeVariant}-permanent`);
        if (variantData) {
          const parsed = JSON.parse(variantData);
          const bulletproofCells = Object.keys(parsed).filter(key => /^\d+$/.test(key));
          allCells.push(...bulletproofCells);
          console.log(`📋 [BULLETPROOF] Найдено ${bulletproofCells.length} ячеек в активном варианте`);
        }
      }
    } catch (error) {
      console.log('⚠️ Ошибка получения bulletproof ячеек:', error);
    }
    
    // ЗАТЕМ добавляем ячейки из audioManager (если нет bulletproof)
    if (allCells.length === 0) {
      const hasFiles = audioManager.getCellsWithAudio().length > 0;
      if (!hasFiles) {
        audioManager.migrateFromOldSystem();
      }
      
      const managerCells = audioManager.getCellsWithAudio();
      allCells.push(...managerCells);
      console.log(`📋 [AUDIOMANAGER] Найдено ${managerCells.length} ячеек`);
    }
    
    // Убираем дубликаты и сортируем
    const uniqueCells = [...new Set(allCells)].sort((a, b) => parseInt(a) - parseInt(b));
    console.log(`📋 [ИТОГО] Доступно ${uniqueCells.length} озвученных ячеек:`, uniqueCells.slice(0, 10));
    
    return uniqueCells;
  } catch (error) {
    console.error('❌ [NEW SYSTEM] Ошибка получения списка озвученных ячеек:', error);
    return [];
  }
};