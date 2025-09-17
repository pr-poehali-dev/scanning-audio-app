import { useCallback } from 'react';
import { playCellAudio } from '@/utils/simpleAudioManager';

interface CellAudioHandlersProps {
  playAudio: (key: string) => Promise<void>;
}

export const createCellAudioHandlers = (props: CellAudioHandlersProps) => {
  const { playAudio } = props;

  // Обработчик клика по ячейке
  const handleCellClick = useCallback(async (cellNumber: string) => {
    console.log(`🏠 === ОБРАБОТЧИК КЛИКА ПО ЯЧЕЙКЕ: "${cellNumber}" ===`);
    
    // ПРЯМАЯ ПРОВЕРКА ЛОКАЛСТОРЕЙДЖА
    console.log(`📦 Проверяю localStorage напрямую...`);
    const mainFiles = localStorage.getItem('wb-audio-files');
    if (mainFiles) {
      const files = JSON.parse(mainFiles);
      const keys = Object.keys(files);
      console.log(`📋 Всего файлов в wb-audio-files: ${keys.length}`);
      console.log(`📋 Первые 10 ключей:`, keys.slice(0, 10));
      
      // Ищем файлы ячеек
      const cellKeys = keys.filter(k => k.includes('cell-') || k.includes(cellNumber) || /^\d+$/.test(k));
      console.log(`🏠 Найдено ключей ячеек: ${cellKeys.length}`, cellKeys);
      
      // Специально ищем наш номер ячейки
      const exactKeys = keys.filter(k => k.includes(cellNumber));
      console.log(`🎯 Ключи содержащие "${cellNumber}":`, exactKeys);
      
      if (exactKeys.length > 0) {
        console.log(`🎵 ПРОБУЮ ПРЯМОЕ ВОСПРОИЗВЕДЕНИЕ ПЕРВОГО НАЙДЕННОГО ФАЙЛА...`);
        const key = exactKeys[0];
        const url = files[key];
        console.log(`🔗 URL: ${url.substring(0, 50)}...`);
        
        try {
          const audio = new Audio(url);
          await audio.play();
          console.log(`✅ ПРЯМОЕ ВОСПРОИЗВЕДЕНИЕ СРАБОТАЛО!`);
          setTimeout(() => audio.pause(), 2000);
          return; // Успешно воспроизвели
        } catch (directError) {
          console.error(`❌ Прямое воспроизведение не сработало:`, directError);
        }
      }
    } else {
      console.error(`❌ wb-audio-files ПУСТОЕ!`);
    }
    
    // ТЕПЕРЬ ПРОБУЕМ ЧЕРЕЗ СИСТЕМУ
    console.log(`🔧 Пробую через playCellAudio...`);
    try {
      const success = await playCellAudio(cellNumber);
      if (success) {
        console.log(`✅ СИСТЕМА playCellAudio СРАБОТАЛА!`);
      } else {
        console.warn(`❌ СИСТЕМА playCellAudio НЕ НАШЛА ФАЙЛ для ячейки "${cellNumber}"`);
        console.warn(`📋 РЕШЕНИЕ: Загрузите файл с именем "cell-${cellNumber}.mp3" через Настройки → Фразы для озвучки → Выдача`);
      }
    } catch (error) {
      console.error(`❌ ОШИБКА СИСТЕМЫ playCellAudio:`, error);
    }
  }, []);

  return {
    handleCellClick
  };
};