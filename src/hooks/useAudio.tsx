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
      
      // Простая тестовая озвучка - генерируем короткий бип
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Настраиваем звук в зависимости от типа
      switch(audioKey) {
        case 'cell-number':
          oscillator.frequency.value = 800;
          break;
        case 'check-discount-wallet':
          oscillator.frequency.value = 600;
          break;
        case 'check-product-camera':
          oscillator.frequency.value = 400;
          break;
        case 'delivery-complete':
          oscillator.frequency.value = 900;
          break;
        case 'receiving-scan':
          oscillator.frequency.value = 500;
          break;
        case 'return-complete':
          oscillator.frequency.value = 300;
          break;
        default:
          oscillator.frequency.value = 700;
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      
      console.log(`🎵 Тестовый звук для ${audioKey}`);
      
      // Если есть пользовательский файл, играем его
      const audioUrl = customAudioFiles[audioKey];
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        await audio.play();
        console.log(`🎵 Пользовательский звук: ${audioKey}`);
      }
      
    } catch (error) {
      console.error(`❌ Ошибка воспроизведения "${audioKey}":`, error);
    }
  }, [customAudioFiles]);

  const playCellAudio = useCallback(async (cellNumber: string) => {
    try {
      console.log(`🔊 Озвучка ячейки: ${cellNumber}`);
      
      // Простая озвучка ячейки - генерируем звук с числом
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
      
      console.log(`🎵 Звук ячейки ${cellNumber}`);
      
      // Проверяем пользовательский файл
      const cellAudios = JSON.parse(localStorage.getItem('cellAudios') || '{}');
      const audioUrl = cellAudios[cellNumber];
      
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        await audio.play();
        console.log(`🎵 Пользовательская озвучка ячейки ${cellNumber}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка озвучки ячейки ${cellNumber}:`, error);
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