import { useCallback } from 'react';
import { playCellAudio } from '@/utils/simpleCellAudio';

interface CellAudioHandlersProps {
  playAudio: (key: string) => Promise<void>;
}

export const createCellAudioHandlers = (props: CellAudioHandlersProps) => {
  const { playAudio } = props;

  // Обработчик клика по ячейке
  const handleCellClick = useCallback(async (cellNumber: string) => {
    console.log(`🏠 КЛИК ПО ЯЧЕЙКЕ: "${cellNumber}"`);
    
    // СНАЧАЛА пробуем простую систему
    const success = await playCellAudio(cellNumber);
    if (success) {
      console.log(`✅ ЯЧЕЙКА ${cellNumber} воспроизведена через простую систему!`);
      return;
    }
    
    // Если не получилось - пробуем старую систему
    console.log(`⚠️ Простая система не сработала, пробуем старую...`);
    
    const cellAudioKeys = [
      'cell-number',        // Универсальная озвучка (приоритет!)
      cellNumber,           // 123
      `cell-${cellNumber}`, // cell-123  
      `ячейка-${cellNumber}` // ячейка-123
    ];
    
    for (const key of cellAudioKeys) {
      try {
        await playAudio(key);
        console.log(`✅ ОЗВУЧКА ЯЧЕЙКИ НАЙДЕНА через старую систему: ${key}`);
        return; // Успешно воспроизвели
      } catch (error) {
        console.log(`⚠️ Не найден ключ: ${key}`);
      }
    }
    
    console.warn(`❌ ОЗВУЧКА ДЛЯ ЯЧЕЙКИ "${cellNumber}" НЕ НАЙДЕНА НИ В ОДНОЙ СИСТЕМЕ!`);
  }, [playAudio]);

  return {
    handleCellClick
  };
};