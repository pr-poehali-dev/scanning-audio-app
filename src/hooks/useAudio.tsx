import { useCallback, useRef, useState, useEffect } from 'react';

const STORAGE_KEY = 'wb-audio-files';

export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [customAudioFiles, setCustomAudioFiles] = useState<{[key: string]: string}>({});

  // Загрузка сохраненных файлов при инициализации с улучшенным логированием
  useEffect(() => {
    try {
      console.log('🔄 === ЗАГРУЗКА СОХРАНЕННЫХ АУДИОФАЙЛОВ ===');
      const savedFiles = localStorage.getItem(STORAGE_KEY);
      const timestamp = localStorage.getItem(`${STORAGE_KEY}-timestamp`);
      const count = localStorage.getItem(`${STORAGE_KEY}-count`);
      
      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles);
        
        // 🔓 АВТОЗАГРУЗКА ЗАЩИЩЕННЫХ НАСТРОЕК ЯЧЕЕК И ПРИЕМКИ
        try {
          const protectedCellFiles = localStorage.getItem('wb-pvz-cell-audio-settings-permanent');
          const cellLock = localStorage.getItem('wb-pvz-cell-audio-lock');
          
          if (protectedCellFiles && cellLock === 'LOCKED') {
            const cellSettings = JSON.parse(protectedCellFiles);
            console.log('🔓 АВТОЗАГРУЗКА ЗАЩИЩЕННЫХ ФАЙЛОВ:', Object.keys(cellSettings));
            
            // Принудительно мержим ВСЕ защищенные файлы
            Object.keys(cellSettings).forEach(key => {
              parsedFiles[key] = cellSettings[key];
              console.log(`🔓 Восстановлен файл: ${key}`);
            });
            
            console.log('🔓 ИТОГО ПОСЛЕ МЕРЖА:', Object.keys(parsedFiles).length, 'файлов');
          } else {
            console.warn('⚠️ Защищенные файлы не найдены или заблокированы');
          }
        } catch (error) {
          console.error('❌ Ошибка загрузки защищенных настроек:', error);
        }
        
        setCustomAudioFiles(parsedFiles);
        
        const cellFiles = Object.keys(parsedFiles).filter(k => /^\d+$/.test(k) || k.includes('cell-') || k.includes('ячейка'));
        
        console.log('✅ АВТОЗАГРУЗКА УСПЕШНА!');
        console.log(`💾 Загружено ${Object.keys(parsedFiles).length} файлов`);
        console.log(`🏠 Загружено ${cellFiles.length} файлов ячеек:`, cellFiles);
        console.log(`⏰ Последнее сохранение:`, timestamp || 'неизвестно');
        console.log(`📊 Ожидалось файлов:`, count || 'неизвестно');
        console.log(`🔒 Защищенных настроек ячеек: ${Object.keys(localStorage.getItem('wb-pvz-cell-audio-settings-permanent') || '{}').length}`);
        
        if (cellFiles.length === 0) {
          console.warn('⚠️ ФАЙЛЫ ЯЧЕЕК НЕ НАЙДЕНЫ! Проверьте загрузку в настройках.');
        }
      } else {
        console.log('ℹ️ Сохраненные файлы не найдены - первый запуск');
      }
    } catch (error) {
      console.error('❌ КРИТИЧЕСКАЯ ОШИБКА загрузки аудиофайлов:', error);
      console.log('🔧 Попытка очистки поврежденных данных...');
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}-timestamp`);
        localStorage.removeItem(`${STORAGE_KEY}-count`);
        console.log('✅ Поврежденные данные очищены');
      } catch (clearError) {
        console.error('❌ Не удалось очистить поврежденные данные:', clearError);
      }
    }
  }, []);

  const playAudio = useCallback(async (audioKey: string) => {
    try {
      console.log(`🔊 === ПОПЫТКА ВОСПРОИЗВЕСТИ ===`);
      console.log(`🎯 КЛЮЧ: "${audioKey}"`);
      
      // СПЕЦИАЛЬНАЯ ДИАГНОСТИКА ДЛЯ ЯЧЕЕК
      if (audioKey.includes('cell-') || audioKey.includes('ячейка') || /^\d+$/.test(audioKey)) {
        console.log(`🏠 === ДИАГНОСТИКА ЯЧЕЙКИ ===`);
        console.log(`📍 Запрошена ячейка: "${audioKey}"`);
        console.log(`📊 Загружено ячеек: ${Object.keys(customAudioFiles).filter(k => k.includes('cell-') || /^\d+$/.test(k)).length}`);
        
        const cellKeys = Object.keys(customAudioFiles).filter(k => k.includes('cell-') || /^\d+$/.test(k));
        console.log(`📋 Доступные ячейки:`, cellKeys);
        
        // КРИТИЧНО: Откуда взялся номер ячейки?
        console.log(`❓ ОТКУДА ЭТОТ НОМЕР? Проверьте стек вызовов ниже:`);
        console.trace();
      }
      
      console.log(`📁 ВСЕГО ФАЙЛОВ:`, Object.keys(customAudioFiles).length);
      console.log(`💾 ПЕРВЫЕ 10 КЛЮЧЕЙ:`, Object.keys(customAudioFiles).slice(0, 10));
      
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
      
      // КРИТИЧНО: Маппинг системных ключей на РЕАЛЬНЫЕ загруженные файлы
      const keyMappings: {[key: string]: string[]} = {
        // === МАППИНГ НА РЕАЛЬНЫЕ РУССКИЕ НАЗВАНИЯ ===
        'discount': [
          'Товары со со скидкой проверьте ВБ кошелек',
          'delivery-Товары со со скидкой проверьте ВБ кошелек',
          'скидка', 'кошелек', 'check-discount-wallet'
        ],
        
        'check-product': [
          'Проверьте товар под камерой', 
          'delivery-Проверьте товар под камерой',
          'камера', 'товар', 'check-product-camera'
        ],
        
        'check-product-camera': [
          'Проверьте товар под камерой',
          'delivery-Проверьте товар под камерой', 
          'камера', 'товар'
        ],
        
        'rate-service': [
          'Оцените ПВЗ в приложении',
          'delivery-Оцените ПВЗ в приложении',
          'оцените', 'rate-pickup-point'
        ],
        
        'cell-number': ['cell-number', 'ячейка'],
        
        // === ДОПОЛНИТЕЛЬНЫЕ СИСТЕМНЫЕ КЛЮЧИ ===
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
      
      // ЕСЛИ НЕ НАЙДЕН - ПРОБУЕМ УМНЫЙ ПОИСК
      if (!audioUrl || !foundKey) {
        console.log(`🔍 ЗАПУСКАЕМ УМНЫЙ ПОИСК для "${audioKey}"...`);
        const availableKeys = Object.keys(customAudioFiles);
        
        // Ищем ключи со словами из искомого
        const searchWords = audioKey.toLowerCase().split('-');
        console.log(`🔤 Ищем по словам:`, searchWords);
        
        for (const availKey of availableKeys) {
          const availKeyLower = availKey.toLowerCase();
          
          // Проверяем каждое слово
          for (const word of searchWords) {
            if (word.length > 2 && availKeyLower.includes(word)) {
              console.log(`✅ НАЙДЕНО СОВПАДЕНИЕ: "${availKey}" содержит "${word}"`);
              foundKey = availKey;
              audioUrl = customAudioFiles[availKey];
              break;
            }
          }
          
          if (foundKey) break;
        }
        
        // Ещё один способ - поиск по русским ключевым словам
        if (!foundKey) {
          const russianKeywords = {
            'discount': ['скидк', 'кошел', 'товары'],
            'check-product': ['товар', 'камер', 'провер'],  
            'rate-service': ['оцени', 'пвз', 'приложен']
          };
          
          const keywords = russianKeywords[audioKey] || [];
          console.log(`🔤 Ищем по русским словам для "${audioKey}":`, keywords);
          
          for (const availKey of availableKeys) {
            const availKeyLower = availKey.toLowerCase();
            
            for (const keyword of keywords) {
              if (availKeyLower.includes(keyword)) {
                console.log(`✅ НАЙДЕНО ПО РУССКОМУ СЛОВУ: "${availKey}" содержит "${keyword}"`);
                foundKey = availKey;
                audioUrl = customAudioFiles[availKey];
                break;
              }
            }
            
            if (foundKey) break;
          }
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
        // СПЕЦИАЛЬНАЯ ОБРАБОТКА ДЛЯ ЯЧЕЕК  
        if (audioKey.includes('cell-') || audioKey.includes('ячейка') || /^cell-\d+$/.test(audioKey)) {
          console.warn(`🏠 ОЗВУЧКА ДЛЯ ЯЧЕЙКИ "${audioKey}" НЕ НАЙДЕНА`);
          console.log(`💡 У вас есть ${Object.keys(customAudioFiles).filter(k => k.includes('cell-') || /^\d+$/.test(k)).length} озвучек ячеек, но не для этой`);
          console.log(`📥 Загрузите аудиофайл для ячейки в: Настройки → Озвучка ячеек`);
          
          // НЕ показываем критичную ошибку - просто тихо завершаем
          return;
        }
        
        console.log(`⚠️ ФАЙЛ НЕ НАЙДЕН ДЛЯ "${audioKey}"`);
        console.log(`🔍 ПРОВЕРЕННЫЕ КЛЮЧИ:`, possibleKeys);
        console.log(`📋 ДОСТУПНЫЕ ФАЙЛЫ (первые 10):`, Object.keys(customAudioFiles).slice(0, 10));
        console.log(`❌ ЗВУК НЕ ВОСПРОИЗВЕДЕН - загрузите аудиофайл для "${audioKey}" в настройках`);
      }
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
    
    // 🔒 ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ настроек ячеек для приемки (НАВСЕГДА!)
    const cellFiles = Object.entries(updatedFiles).filter(([key]) => 
      key.includes('cell-') || 
      key.includes('ячейка') || 
      /^\d+$/.test(key) ||
      key.includes('acceptance-')
    );
    
    if (cellFiles.length > 0) {
      try {
        const cellSettings = Object.fromEntries(cellFiles);
        localStorage.setItem('wb-pvz-cell-audio-settings-permanent', JSON.stringify(cellSettings));
        localStorage.setItem('wb-pvz-cell-audio-timestamp', new Date().toISOString());
        localStorage.setItem('wb-pvz-cell-audio-lock', 'LOCKED'); // Блокировка от удаления
        
        console.log(`🏠 🔒 ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ ЯЧЕЕК: ${cellFiles.length} файлов`);
        console.log('💎 Настройки ячеек сохранены НАВСЕГДА в отдельном защищенном ключе!');
        console.log('🔐 Ключи ячеек:', cellFiles.map(([key]) => key));
      } catch (error) {
        console.error('❌ Ошибка принудительного сохранения ячеек:', error);
      }
    }
    
    // Расширенное сохранение в localStorage с проверками
    try {
      const jsonData = JSON.stringify(updatedFiles);
      const sizeInMB = (jsonData.length / (1024 * 1024)).toFixed(2);
      
      localStorage.setItem(STORAGE_KEY, jsonData);
      localStorage.setItem(`${STORAGE_KEY}-timestamp`, new Date().toISOString());
      localStorage.setItem(`${STORAGE_KEY}-count`, Object.keys(updatedFiles).length.toString());
      
      const cellFiles = Object.keys(updatedFiles).filter(k => /^\d+$/.test(k) || k.includes('cell-') || k.includes('ячейка'));
      
      console.log('✅ === АВТОСОХРАНЕНИЕ ЗАВЕРШЕНО ===');
      console.log(`💾 Сохранено ${Object.keys(updatedFiles).length} файлов (${sizeInMB} МБ)`);
      console.log(`🏠 Файлов ячеек: ${cellFiles.length}`, cellFiles);
      console.log(`⏰ Время сохранения:`, new Date().toLocaleString('ru-RU'));
      
      // Проверяем что действительно сохранилось
      const verification = localStorage.getItem(STORAGE_KEY);
      if (verification && JSON.parse(verification)) {
        console.log('✅ ПРОВЕРКА ПРОЙДЕНА: Файлы успешно записаны в localStorage');
      } else {
        console.error('❌ ПРОВЕРКА ПРОВАЛЕНА: Файлы не найдены после сохранения!');
      }
      
    } catch (error) {
      console.error('❌ КРИТИЧЕСКАЯ ОШИБКА СОХРАНЕНИЯ:', error);
      
      // Попытка экстренного сохранения без base64
      try {
        const emergencyFiles = Object.fromEntries(
          Object.entries(updatedFiles).filter(([_, url]) => !url.startsWith('data:'))
        );
        localStorage.setItem(STORAGE_KEY + '-emergency', JSON.stringify(emergencyFiles));
        console.log('🚨 ЭКСТРЕННОЕ СОХРАНЕНИЕ:', Object.keys(emergencyFiles).length, 'файлов');
      } catch (emergencyError) {
        console.error('❌ Даже экстренное сохранение провалилось:', emergencyError);
      }
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