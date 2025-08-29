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
      console.log(`🔊 ПОПЫТКА ВОСПРОИЗВЕСТИ: "${audioKey}"`);
      console.log(`📁 ДОСТУПНЫЕ ФАЙЛЫ:`, Object.keys(customAudioFiles));
      console.log(`💾 РАЗМЕР ХРАНИЛИЩА:`, Object.keys(customAudioFiles).length, 'файлов');
      
      // ПРИНУДИТЕЛЬНАЯ ДИАГНОСТИКА
      console.log(`🔍 === ДЕТАЛЬНАЯ ДИАГНОСТИКА ===`);
      console.log(`🎯 ИЩЕМ КЛЮЧ: "${audioKey}"`);
      console.log(`📋 ВСЕ ДОСТУПНЫЕ КЛЮЧИ (${Object.keys(customAudioFiles).length} шт.):`);
      Object.keys(customAudioFiles).forEach((key, index) => {
        const isExact = key === audioKey;
        const includes = key.includes(audioKey) || audioKey.includes(key);
        console.log(`  ${index + 1}. "${key}" ${isExact ? '🎯 ТОЧНОЕ!' : includes ? '🔍 ПОХОЖЕЕ!' : ''}`);
      });
      console.log(`💾 СОДЕРЖИМОЕ localStorage:`, localStorage.getItem('wb-audio-files')?.substring(0, 200) + '...');
      
      // ПРЯМОЕ СОВПАДЕНИЕ - ВЫСШИЙ ПРИОРИТЕТ
      if (customAudioFiles[audioKey]) {
        console.log(`🎵 ПРЯМОЕ СОВПАДЕНИЕ: "${audioKey}"`);
        try {
          const audio = new Audio(customAudioFiles[audioKey]);
          audio.volume = 0.8;
          await audio.play();
          console.log(`✅ УСПЕШНО ВОСПРОИЗВЕДЕН: ${audioKey}`);
          return;
        } catch (error) {
          console.error(`❌ ОШИБКА ВОСПРОИЗВЕДЕНИЯ "${audioKey}":`, error);
        }
      }

      // Создаем список возможных ключей для поиска
      const possibleKeys = [
        audioKey, // Глобальное название (приоритет)
        `delivery-${audioKey}`, // С префиксом delivery
        `acceptance-${audioKey}`, // С префиксом acceptance 
        `returns-${audioKey}`, // С префиксом returns
        `general-${audioKey}` // С префиксом general
      ];
      
      // Добавляем специальные маппинги для всех ключей
      const keyMappings: {[key: string]: string[]} = {
        // КРИТИЧНО: Основные системные ключи → загруженные файлы
        'discount': ['check-discount-wallet', 'скидка', 'discount'],
        'check-product': ['check-product-camera', 'камера', 'товар', 'check-product'],
        'check-product-camera': ['check-product', 'камера', 'товар'],
        'rate-service': ['rate-pickup-point', 'оцените', 'rate-service'],
        'cell-number': ['cell-number', 'ячейка'],
        
        // И обратно - загруженные файлы → системные ключи  
        'check-discount-wallet': ['discount', 'скидка'],
        'check-product-camera': ['check-product', 'камера', 'товар'],
        'rate-pickup-point': ['rate-service', 'оцените'],
        
        // Дополнительные варианты
        'receiving-start': ['приемка', 'начало'],
        'receiving-complete': ['приемка', 'завершена'],
        'return-start': ['возврат', 'начало'],
        'return-complete': ['возврат', 'завершен']
      };
      
      // Добавляем альтернативы для текущего ключа
      if (keyMappings[audioKey]) {
        possibleKeys.push(...keyMappings[audioKey]);
      }
      
      console.log(`🔍 ПРОВЕРЯЮ КЛЮЧИ:`, possibleKeys);
      
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
        console.log(`🎵 НАЙДЕН ФАЙЛ "${foundKey}" ДЛЯ "${audioKey}"`);
        console.log(`🔗 URL:`, audioUrl.substring(0, 50) + '...');
        try {
          const audio = new Audio(audioUrl);
          audio.volume = 0.8;
          
          // Применяем скорость из настроек если есть
          const savedSpeed = localStorage.getItem('wb-pvz-audio-speed');
          if (savedSpeed) {
            audio.playbackRate = parseFloat(savedSpeed);
          }
          
          console.log(`▶️ НАЧИНАЮ ВОСПРОИЗВЕДЕНИЕ...`);
          await audio.play();
          console.log(`✅ ЗВУК УСПЕШНО ВОСПРОИЗВЕДЕН: ${foundKey}`);
          return; // Если пользовательский файл есть, не играем тестовый звук
        } catch (audioError) {
          console.error(`❌ ОШИБКА ВОСПРОИЗВЕДЕНИЯ "${foundKey}":`, audioError);
          console.error(`❌ ДЕТАЛИ ОШИБКИ:`, {
            name: audioError.name,
            message: audioError.message,
            audioUrl: audioUrl.substring(0, 100)
          });
        }
      } else {
        console.log(`⚠️ ФАЙЛ НЕ НАЙДЕН ДЛЯ "${audioKey}"`);
        console.log(`🔍 ПРОВЕРЕННЫЕ КЛЮЧИ:`, possibleKeys);
        console.log(`📋 ДОСТУПНЫЕ ФАЙЛЫ:`, Object.keys(customAudioFiles));
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

  const updateAudioFiles = useCallback(async (files: {[key: string]: string}) => {
    console.log(`🔄 Обновляю аудиофайлы. Новые файлы:`, Object.keys(files));
    console.log(`📄 Типы URL в files:`, Object.entries(files).map(([key, url]) => ({ key, isBlob: url.startsWith('blob:') })));
    
    // Конвертируем blob URL в base64 для постоянного сохранения
    const permanentFiles: {[key: string]: string} = {};
    
    for (const [key, url] of Object.entries(files)) {
      if (url.startsWith('blob:')) {
        try {
          // Получаем файл как ArrayBuffer
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          
          // Конвертируем в base64
          const base64 = arrayBufferToBase64(arrayBuffer);
          const mimeType = response.headers.get('content-type') || 'audio/mpeg';
          permanentFiles[key] = `data:${mimeType};base64,${base64}`;
          
          console.log(`✅ Файл "${key}" конвертирован в base64 для постоянного сохранения`);
        } catch (error) {
          console.error(`❌ Ошибка конвертации файла "${key}":`, error);
          permanentFiles[key] = url; // Fallback к blob URL
        }
      } else {
        permanentFiles[key] = url;
      }
    }
    
    const updatedFiles = { ...customAudioFiles, ...permanentFiles };
    setCustomAudioFiles(updatedFiles);
    
    // Сохраняем в localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
      console.log(`💾 Аудиофайлы ПОСТОЯННО сохранены:`, Object.keys(updatedFiles));
    } catch (error) {
      console.error('❌ Ошибка сохранения аудиофайлов в localStorage:', error);
    }
  }, [customAudioFiles]);

  // Вспомогательная функция для конвертации ArrayBuffer в base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

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