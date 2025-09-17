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
    
    // АКТИВАЦИЯ АУДИО КОНТЕКСТА (обязательно для браузеров)
    try {
      console.log(`🔊 Активирую аудио контекст...`);
      // Создаем аудио контекст если его нет
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
          console.log(`✅ Аудио контекст активирован`);
        }
      }
      
      // Простой тест звука для разблокировки автовоспроизведения
      const testAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAA=');
      testAudio.volume = 0.01;
      await testAudio.play().catch(() => {});
      testAudio.pause();
      console.log(`✅ Браузерный звук разблокирован`);
    } catch (activationError) {
      console.warn(`⚠️ Ошибка активации аудио:`, activationError);
    }
    
    // СНАЧАЛА ПРОБУЕМ OBJECT URL МЕНЕДЖЕР (самый надежный)
    console.log(`🔧 Пробую Object URL менеджер...`);
    try {
      const { objectUrlAudioManager } = await import('@/utils/objectUrlAudioManager');
      const objectUrlSuccess = await objectUrlAudioManager.playCellAudio(cellNumber);
      if (objectUrlSuccess) {
        console.log(`✅ OBJECT URL МЕНЕДЖЕР СРАБОТАЛ!`);
        return; // Успешно воспроизвели
      } else {
        console.warn(`❌ OBJECT URL МЕНЕДЖЕР НЕ НАШЕЛ ФАЙЛ для ячейки "${cellNumber}"`);
      }
    } catch (objectUrlError) {
      console.error(`❌ ОШИБКА OBJECT URL МЕНЕДЖЕРА:`, objectUrlError);
    }
    
    // ЗАТЕМ ПРОБУЕМ DATA URL МЕНЕДЖЕР
    console.log(`🔧 Пробую Data URL менеджер...`);
    try {
      const success = await playCellAudio(cellNumber);
      if (success) {
        console.log(`✅ DATA URL МЕНЕДЖЕР СРАБОТАЛ!`);
        return; // Успешно воспроизвели
      } else {
        console.warn(`❌ DATA URL МЕНЕДЖЕР НЕ НАШЕЛ ФАЙЛ для ячейки "${cellNumber}"`);
      }
    } catch (dataUrlError) {
      console.error(`❌ ОШИБКА DATA URL МЕНЕДЖЕРА:`, dataUrlError);
    }
    
    // РЕЗЕРВНЫЙ ПЛАН - ПРЯМАЯ ПРОВЕРКА ЛОКАЛСТОРЕЙДЖА
    console.log(`📦 Проверяю localStorage напрямую...`);
    
    // Проверяем новое хранилище
    const unifiedStorage = localStorage.getItem('wb-audio-files-unified');
    if (unifiedStorage) {
      try {
        const storage = JSON.parse(unifiedStorage);
        console.log(`🔧 Проверяю новое хранилище...`);
        
        const cellKeys = [`cell-${cellNumber}`, cellNumber, cellNumber.toString()];
        for (const key of cellKeys) {
          if (storage.cells && storage.cells[key]) {
            console.log(`✅ НАЙДЕН ФАЙЛ В НОВОМ ХРАНИЛИЩЕ: ${key}`);
            const audioFile = storage.cells[key];
            
            try {
              const audio = new Audio(audioFile.url);
              audio.volume = 0.8;
              await audio.play();
              console.log(`✅ ВОСПРОИЗВЕДЕНИЕ ИЗ НОВОГО ХРАНИЛИЩА УСПЕШНО!`);
              setTimeout(() => audio.pause(), 2000);
              return;
            } catch (playError) {
              console.error(`❌ Ошибка воспроизведения из нового хранилища:`, playError);
            }
          }
        }
      } catch (parseError) {
        console.error(`❌ Ошибка парсинга нового хранилища:`, parseError);
      }
    }
    
    // Проверяем старое хранилище
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
          audio.volume = 0.8;
          await audio.play();
          console.log(`✅ ПРЯМОЕ ВОСПРОИЗВЕДЕНИЕ СРАБОТАЛО!`);
          setTimeout(() => audio.pause(), 2000);
          return; // Успешно воспроизвели
        } catch (directError) {
          console.error(`❌ Прямое воспроизведение не сработало:`, directError);
          console.error(`❌ Детали ошибки:`, {
            name: directError.name,
            message: directError.message,
            code: (directError as any).code
          });
        }
      }
    } else {
      console.error(`❌ wb-audio-files ПУСТОЕ!`);
    }
    
    console.warn(`❌ ВСЕ ПОПЫТКИ ВОСПРОИЗВЕДЕНИЯ ПРОВАЛИЛИСЬ для ячейки "${cellNumber}"`);
    console.warn(`📋 РЕШЕНИЕ: Загрузите файл с именем "cell-${cellNumber}.mp3" через синюю кнопку в шапке`);
  }, []);

  return {
    handleCellClick
  };
};