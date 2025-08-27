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
      
      // Проверяем есть ли пользовательский файл
      const audioUrl = customAudioFiles[audioKey];
      
      if (!audioUrl) {
        console.warn(`❌ Аудиофайл для ключа "${audioKey}" не найден в customAudioFiles`);
        console.log(`💾 Проверяем localStorage...`);
        
        // Пробуем загрузить из localStorage напрямую
        const stored = localStorage.getItem('wb-audio-files');
        if (stored) {
          const storedFiles = JSON.parse(stored);
          const storedUrl = storedFiles[audioKey];
          if (storedUrl) {
            console.log(`✅ Найден в localStorage: ${audioKey}`);
            const audio = new Audio(storedUrl);
            await audio.play();
            return;
          }
        }
        return;
      }

      console.log(`✅ Воспроизводим файл: ${audioKey}`);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      await audio.play();
      console.log(`🎵 Успешно воспроизведен: ${audioKey}`);
    } catch (error) {
      console.error(`❌ Ошибка воспроизведения аудио "${audioKey}":`, error);
    }
  }, [customAudioFiles]);

  const playCellAudio = useCallback(async (cellNumber: string) => {
    try {
      // Получаем озвучку ячеек из localStorage
      const cellAudios = JSON.parse(localStorage.getItem('cellAudios') || '{}');
      const audioUrl = cellAudios[cellNumber];
      
      if (!audioUrl) {
        console.log(`Озвучка для ячейки ${cellNumber} не найдена`);
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      await audio.play();
    } catch (error) {
      console.error(`Ошибка воспроизведения озвучки ячейки ${cellNumber}:`, error);
    }
  }, []);

  const updateAudioFiles = useCallback((files: {[key: string]: string}) => {
    const updatedFiles = { ...customAudioFiles, ...files };
    setCustomAudioFiles(updatedFiles);
    
    // Сохраняем в localStorage с проверкой размера
    try {
      const dataToSave = JSON.stringify(updatedFiles);
      const sizeInMB = (new Blob([dataToSave]).size / 1024 / 1024).toFixed(2);
      
      console.log(`💾 Сохраняю ${Object.keys(updatedFiles).length} файлов (${sizeInMB} МБ)`);
      
      localStorage.setItem(STORAGE_KEY, dataToSave);
      
      // Проверяем что действительно сохранилось
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        console.log('✅ Файлы успешно сохранены в localStorage');
      } else {
        console.error('❌ Файлы не сохранились в localStorage');
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения аудиофайлов:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('Ошибка: Недостаточно места в браузере для сохранения файлов. Попробуйте загрузить меньше файлов или очистить данные браузера.');
      }
    }
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