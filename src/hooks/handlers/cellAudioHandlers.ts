import { useCallback } from 'react';

interface CellAudioHandlersProps {
  playAudio: (key: string) => Promise<void>;
}

export const createCellAudioHandlers = (props: CellAudioHandlersProps) => {
  const { playAudio } = props;

  // Обработчик клика по ячейке
  const handleCellClick = useCallback(async (cellNumber: string) => {
    console.log(`🏠 КЛИК ПО ЯЧЕЙКЕ: "${cellNumber}"`);
    
    // Пробуем разные варианты названий файлов
    const cellAudioKeys = [
      'cell-number',        // Универсальная озвучка (приоритет!)
      cellNumber,           // 123
      `cell-${cellNumber}`, // cell-123  
      `ячейка-${cellNumber}` // ячейка-123
    ];
    
    console.log(`🎯 Пробуем ключи для ячейки:`, cellAudioKeys);
    
    for (const key of cellAudioKeys) {
      try {
        await playAudio(key);
        console.log(`✅ ОЗВУЧКА ЯЧЕЙКИ НАЙДЕНА: ${key}`);
        return; // Успешно воспроизвели
      } catch (error) {
        console.log(`⚠️ Не найден ключ: ${key}`);
      }
    }
    
    console.warn(`❌ ОЗВУЧКА ДЛЯ ЯЧЕЙКИ "${cellNumber}" НЕ НАЙДЕНА!`);
  }, [playAudio]);

  return {
    handleCellClick
  };
};