import { useCallback, useRef, useState, useEffect } from 'react';

const STORAGE_KEY = 'wb-audio-files';

export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [customAudioFiles, setCustomAudioFiles] = useState<{[key: string]: string}>({});

  // Загрузка сохраненных файлов при инициализации
  useEffect(() => {
    try {
      const savedFiles = localStorage.getItem(STORAGE_KEY);
      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles);
        setCustomAudioFiles(parsedFiles);
      }
    } catch (error) {
      console.error('Ошибка загрузки аудиофайлов из localStorage:', error);
    }
  }, []);

  const playAudio = useCallback(async (audioKey: string) => {
    try {
      console.log(`🔊 Попытка воспроизвести: "${audioKey}"`);
      console.log(`📁 Доступные файлы:`, Object.keys(customAudioFiles));
      
      // Создаем список возможных ключей для поиска (приоритет - глобальные файлы)
      const possibleKeys = [
        audioKey, // Глобальное название (приоритет)
        `delivery-${audioKey}`, // С префиксом delivery
        `acceptance-${audioKey}`, // С префиксом acceptance 
        `returns-${audioKey}`, // С префиксом returns
        `general-${audioKey}` // С префиксом general
      ];
      
      // Ищем первый подходящий файл
      let foundKey = null;
      let audioUrl = null;
      
      for (const key of possibleKeys) {
        if (customAudioFiles[key]) {
          foundKey = key;
          audioUrl = customAudioFiles[key];
          break;
        }
      }
      
      if (audioUrl && foundKey) {
        console.log(`🎵 Найден пользовательский файл "${foundKey}" для "${audioKey}"`);
        try {
          const audio = new Audio(audioUrl);
          audio.volume = 0.8;
          
          // Применяем скорость из настроек если есть
          const savedSpeed = localStorage.getItem('wb-pvz-audio-speed');
          if (savedSpeed) {
            audio.playbackRate = parseFloat(savedSpeed);
          }
          
          await audio.play();
          console.log(`✅ Успешно воспроизведен пользовательский звук: ${foundKey}`);
          return; // Если пользовательский файл есть, не играем тестовый звук
        } catch (audioError) {
          console.error(`❌ Ошибка воспроизведения пользовательского файла "${foundKey}":`, audioError);
        }
      } else {
        console.log(`⚠️ Пользовательский файл не найден для "${audioKey}". Проверены ключи:`, possibleKeys);
      }
      
      // ВСТРОЕННЫЙ ЗВУК ОТКЛЮЧЕН - только пользовательские файлы
      console.log(`📁 Доступные файлы в customAudioFiles:`, Object.keys(customAudioFiles));
      console.log(`❌ ЗВУК НЕ ВОСПРОИЗВЕДЕН - загрузите аудиофайл для "${audioKey}" в настройках`);
      return;
      
    } catch (error) {
      console.error(`❌ Ошибка воспроизведения "${audioKey}":`, error);
    }
  }, [customAudioFiles]);

  const playCellAudio = useCallback(async (cellNumber: string) => {
    try {
      console.log(`🔊 Озвучка ячейки: ${cellNumber}`);
      console.log(`📁 Доступные файлы ячеек:`, Object.keys(customAudioFiles).filter(key => key.startsWith('cell-')));
      
      // Создаем ключ для поиска аудио файла ячейки
      const cellKey = `cell-${cellNumber}`;
      const audioUrl = customAudioFiles[cellKey];
      
      if (audioUrl) {
        console.log(`🎵 Найден пользовательский файл для ячейки ${cellNumber}`);
        try {
          const audio = new Audio(audioUrl);
          audio.volume = 0.8;
          
          // Применяем скорость из настроек если есть
          const savedSpeed = localStorage.getItem('wb-pvz-audio-speed');
          if (savedSpeed) {
            audio.playbackRate = parseFloat(savedSpeed);
          }
          
          await audio.play();
          console.log(`✅ Успешно воспроизведена пользовательская озвучка ячейки ${cellNumber}`);
          return; // Если пользовательский файл есть, не играем тестовый звук
        } catch (audioError) {
          console.error(`❌ Ошибка воспроизведения пользовательского файла ячейки ${cellNumber}:`, audioError);
        }
      } else {
        console.log(`⚠️ Пользовательский файл не найден для ячейки ${cellNumber} (ключ: ${cellKey})`);
      }
      
      // ВСТРОЕННЫЙ ЗВУК ДЛЯ ЯЧЕЕК ТОЖЕ ОТКЛЮЧЕН
      console.log(`📁 Доступные файлы ячеек:`, Object.keys(customAudioFiles).filter(key => key.startsWith('cell-')));
      console.log(`❌ ЗВУК ЯЧЕЙКИ НЕ ВОСПРОИЗВЕДЕН - загрузите аудиофайл cell-${cellNumber}.mp3 в настройках`);
      return;
      
    } catch (error) {
      console.error(`❌ Ошибка озвучки ячейки ${cellNumber}:`, error);
    }
  }, [customAudioFiles]);

  const updateAudioFiles = useCallback((files: {[key: string]: string}) => {
    console.log(`🔄 Обновляю аудиофайлы. Новые файлы:`, Object.keys(files));
    console.log(`📄 Типы URL в files:`, Object.entries(files).map(([key, url]) => ({ key, isBlob: url.startsWith('blob:') })));
    
    const updatedFiles = { ...customAudioFiles, ...files };
    setCustomAudioFiles(updatedFiles);
    
    // Не сохраняем blob URL в localStorage, так как они не переживают перезагрузку
    // Оставляем их только в памяти текущей сессии
    console.log(`💾 Аудиофайлы загружены в память:`, Object.keys(updatedFiles));
    console.log(`⚠️ ВНИМАНИЕ: файлы будут доступны только до перезагрузки страницы`);
    console.log(`ℹ️ Для постоянного сохранения файлы нужно загружать заново после каждого обновления`);
  }, [customAudioFiles]);

  const removeAudioFile = useCallback((audioKey: string) => {
    const updatedFiles = { ...customAudioFiles };
    delete updatedFiles[audioKey];
    setCustomAudioFiles(updatedFiles);
    
    // Сохраняем в localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
    } catch (error) {
      console.error('Ошибка сохранения аудиофайлов в localStorage:', error);
    }
  }, [customAudioFiles]);

  const clearAllAudio = useCallback(() => {
    setCustomAudioFiles({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Ошибка очистки аудиофайлов из localStorage:', error);
    }
  }, []);

  const getLoadedFiles = useCallback(() => {
    return Object.keys(customAudioFiles);
  }, [customAudioFiles]);

  return { 
    playAudio, 
    playCellAudio,
    updateAudioFiles, 
    removeAudioFile, 
    clearAllAudio, 
    getLoadedFiles,
    customAudioFiles 
  };
};