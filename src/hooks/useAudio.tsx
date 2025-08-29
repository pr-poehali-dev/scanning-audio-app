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
      
      // Создаем список возможных ключей для поиска
      const possibleKeys = [
        audioKey, // Точное соответствие
        `delivery-${audioKey}`, // С префиксом delivery
        `general-${audioKey}`, // С префиксом general
        `acceptance-${audioKey}`, // С префиксом acceptance 
        `returns-${audioKey}` // С префиксом returns
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
      
      // Если пользовательского файла нет или он не воспроизвелся - играем тестовый звук
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Настраиваем звук в зависимости от типа
      switch(audioKey) {
        case 'scan-success':
        case 'client-found':
        case 'phone-input':
          oscillator.frequency.value = 800;
          break;
        case 'check-product':
        case 'discount':
          oscillator.frequency.value = 600;
          break;
        case 'rate-service':
          oscillator.frequency.value = 400;
          break;
        case 'delivery-complete':
          oscillator.frequency.value = 900;
          break;
        case 'test':
          oscillator.frequency.value = 500;
          break;
        default:
          oscillator.frequency.value = 700;
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      
      console.log(`🎵 Воспроизведен тестовый звук для "${audioKey}"`);
      
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
      
      // Если пользовательского файла нет - играем тестовый звук
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Тон зависит от номера ячейки
      const cellNum = parseInt(cellNumber) || 1;
      oscillator.frequency.value = 400 + (cellNum % 20) * 50;
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.type = 'square';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
      console.log(`🎵 Воспроизведен тестовый звук ячейки ${cellNumber}`);
      
    } catch (error) {
      console.error(`❌ Ошибка озвучки ячейки ${cellNumber}:`, error);
    }
  }, [customAudioFiles]);

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