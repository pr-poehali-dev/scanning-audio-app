import { useCallback } from 'react';
import { playCellAudio } from '@/utils/cellAudioPlayer';

interface CellAudioHandlersProps {
  playAudio: (key: string) => Promise<void>;
}

export const createCellAudioHandlers = (props: CellAudioHandlersProps) => {
  const { playAudio } = props;

  // Обработчик клика по ячейке
  const handleCellClick = useCallback(async (cellNumber: string) => {
    console.log(`🏠 КЛИК ПО ЯЧЕЙКЕ: "${cellNumber}"`);
    
    try {
      const success = await playCellAudio(cellNumber);
      if (success) {
        console.log(`✅ ЯЧЕЙКА ${cellNumber} успешно воспроизведена!`);
      } else {
        console.warn(`❌ Озвучка для ячейки "${cellNumber}" не найдена. Загрузите файлы через: Настройки → Фразы для озвучки → Выдача → загрузить файл "cell-${cellNumber}.mp3"`);
      }
    } catch (error) {
      console.error(`❌ Ошибка воспроизведения озвучки ячейки "${cellNumber}":`, error);
    }
  }, []);

  return {
    handleCellClick
  };
};