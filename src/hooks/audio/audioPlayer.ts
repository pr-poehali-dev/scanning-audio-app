import { getPlaybackRate, diagnoseCellAudio, isCellKey } from './audioUtils';

// Функция для генерации маппинга ячеек динамически
const generateCellMappings = (): {[key: string]: string[]} => {
  const cellMappings: {[key: string]: string[]} = {};
  
  // Генерируем маппинги для ячеек A1-A99, B1-B99, C1-C99
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const numbers = Array.from({length: 99}, (_, i) => i + 1);
  
  letters.forEach(letter => {
    numbers.forEach(number => {
      const cellNumber = `${letter}${number}`;
      cellMappings[`cell-${cellNumber}`] = [
        cellNumber,                           // "A1"
        `cell-${cellNumber}`,                // "cell-A1"
        `ячейка-${cellNumber}`,              // "ячейка-A1" 
        `Ячейка ${cellNumber}`,              // "Ячейка A1"
        `delivery-cell-${cellNumber}`,       // "delivery-cell-A1"
        `audio_${cellNumber}`,               // "audio_A1"
        `cell_${cellNumber}`,                // "cell_A1"
        `${cellNumber}.mp3`,                 // "A1.mp3"
        cellNumber.toLowerCase()             // "a1"
      ];
    });
  });
  
  console.log(`🔧 Сгенерирован маппинг для ${Object.keys(cellMappings).length} ячеек`);
  return cellMappings;
};

// Маппинг системных ключей на реальные файлы
const KEY_MAPPINGS: {[key: string]: string[]} = {
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
  'return-complete': ['возврат', 'завершен'],
  
  // === ДИНАМИЧЕСКИЕ ЯЧЕЙКИ ===
  ...generateCellMappings()
};

// Русские ключевые слова для поиска
const RUSSIAN_KEYWORDS: {[key: string]: string[]} = {
  'discount': ['скидк', 'кошел', 'товары'],
  'check-product': ['товар', 'камер', 'провер'],  
  'rate-service': ['оцени', 'пвз', 'приложен']
};

// Создание списка возможных ключей для поиска
const getPossibleKeys = (audioKey: string): string[] => {
  const possibleKeys = [
    audioKey, // Глобальное название (приоритет)
    `delivery-${audioKey}`, // С префиксом delivery
    `acceptance-${audioKey}`, // С префиксом acceptance 
    `returns-${audioKey}`, // С префиксом returns
    `general-${audioKey}` // С префиксом general
  ];
  
  // Добавляем альтернативы для текущего ключа
  if (KEY_MAPPINGS[audioKey]) {
    possibleKeys.push(...KEY_MAPPINGS[audioKey]);
  }
  
  // СПЕЦИАЛЬНАЯ ОБРАБОТКА ДЛЯ ЯЧЕЕК
  // Если ключ похож на ячейку (например "A1", "B5", etc.)
  const cellMatch = audioKey.match(/^([A-Z])(\d+)$/i);
  if (cellMatch) {
    const cellNumber = cellMatch[0].toUpperCase();
    console.log(`🏠 ОБНАРУЖЕНА ЯЧЕЙКА: ${cellNumber}`);
    
    // Добавляем все варианты для ячейки
    const cellVariants = [
      cellNumber,                           // "A1"
      `cell-${cellNumber}`,                // "cell-A1"
      `ячейка-${cellNumber}`,              // "ячейка-A1" 
      `Ячейка ${cellNumber}`,              // "Ячейка A1"
      `delivery-cell-${cellNumber}`,       // "delivery-cell-A1"
      `audio_${cellNumber}`,               // "audio_A1"
      `cell_${cellNumber}`,                // "cell_A1"
      `${cellNumber}.mp3`,                 // "A1.mp3"
      cellNumber.toLowerCase(),            // "a1"
      `cell_audio_${cellNumber}`,          // "cell_audio_A1" (наш новый формат)
    ];
    
    possibleKeys.push(...cellVariants);
    console.log(`🔧 Добавлено ${cellVariants.length} вариантов для ячейки ${cellNumber}`);
  }
  
  return possibleKeys;
};

// Умный поиск файла по ключевым словам
const smartSearch = (audioKey: string, availableKeys: string[]): string | null => {
  console.log(`🔍 ЗАПУСКАЕМ УМНЫЙ ПОИСК для "${audioKey}"...`);
  
  // Ищем ключи со словами из искомого
  const searchWords = audioKey.toLowerCase().split('-');
  console.log(`🔤 Ищем по словам:`, searchWords);
  
  for (const availKey of availableKeys) {
    const availKeyLower = availKey.toLowerCase();
    
    // Проверяем каждое слово
    for (const word of searchWords) {
      if (word.length > 2 && availKeyLower.includes(word)) {
        console.log(`✅ НАЙДЕНО СОВПАДЕНИЕ: "${availKey}" содержит "${word}"`);
        return availKey;
      }
    }
  }
  
  // Поиск по русским ключевым словам
  const keywords = RUSSIAN_KEYWORDS[audioKey] || [];
  console.log(`🔤 Ищем по русским словам для "${audioKey}":`, keywords);
  
  for (const availKey of availableKeys) {
    const availKeyLower = availKey.toLowerCase();
    
    for (const keyword of keywords) {
      if (availKeyLower.includes(keyword)) {
        console.log(`✅ НАЙДЕНО ПО РУССКОМУ СЛОВУ: "${availKey}" содержит "${keyword}"`);
        return availKey;
      }
    }
  }
  
  return null;
};

// Воспроизведение аудио файла
const playAudioFile = async (audioUrl: string, foundKey: string): Promise<void> => {
  console.log(`🎵 НАЙДЕН ФАЙЛ "${foundKey}"`);
  console.log(`🔗 URL:`, audioUrl.substring(0, 50) + '...');
  
  try {
    const audio = new Audio(audioUrl);
    audio.volume = 0.8;
    audio.playbackRate = getPlaybackRate();
    
    console.log(`▶️ НАЧИНАЮ ВОСПРОИЗВЕДЕНИЕ...`);
    await audio.play();
    console.log(`✅ ЗВУК УСПЕШНО ВОСПРОИЗВЕДЕН: ${foundKey}`);
  } catch (audioError) {
    console.error(`❌ ОШИБКА ВОСПРОИЗВЕДЕНИЯ "${foundKey}":`, audioError);
    console.error(`❌ ДЕТАЛИ ОШИБКИ:`, {
      name: audioError.name,
      message: audioError.message,
      audioUrl: audioUrl.substring(0, 100)
    });
    throw audioError;
  }
};

// Основная функция воспроизведения аудио
export const playAudio = async (audioKey: string, customAudioFiles: {[key: string]: string}): Promise<void> => {
  try {
    console.log(`🔊 === ПОПЫТКА ВОСПРОИЗВЕСТИ ===`);
    console.log(`🎯 КЛЮЧ: "${audioKey}"`);
    
    // СПЕЦИАЛЬНАЯ ДИАГНОСТИКА ДЛЯ ЯЧЕЕК
    diagnoseCellAudio(audioKey, customAudioFiles);
    
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
      await playAudioFile(customAudioFiles[audioKey], audioKey);
      return;
    }

    const possibleKeys = getPossibleKeys(audioKey);
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
      const availableKeys = Object.keys(customAudioFiles);
      const smartFoundKey = smartSearch(audioKey, availableKeys);
      
      if (smartFoundKey) {
        foundKey = smartFoundKey;
        audioUrl = customAudioFiles[smartFoundKey];
      }
    }

    if (audioUrl && foundKey) {
      await playAudioFile(audioUrl, foundKey);
      return;
    } else {
      // СПЕЦИАЛЬНАЯ ОБРАБОТКА ДЛЯ ЯЧЕЕК  
      if (isCellKey(audioKey)) {
        console.warn(`🏠 ОЗВУЧКА ДЛЯ ЯЧЕЙКИ "${audioKey}" НЕ НАЙДЕНА`);
        console.log(`💡 У вас есть ${Object.keys(customAudioFiles).filter(k => isCellKey(k)).length} озвучек ячеек, но не для этой`);
        console.log(`📥 Загрузите аудиофайл для ячейки в: Настройки → Озвучка ячеек`);
        return;
      }
      
      console.log(`⚠️ ФАЙЛ НЕ НАЙДЕН ДЛЯ "${audioKey}"`);
      console.log(`🔍 ПРОВЕРЕННЫЕ КЛЮЧИ:`, possibleKeys);
      console.log(`📋 ДОСТУПНЫЕ ФАЙЛЫ (первые 10):`, Object.keys(customAudioFiles).slice(0, 10));
      console.log(`❌ ЗВУК НЕ ВОСПРОИЗВЕДЕН - загрузите аудиофайл для "${audioKey}" в настройках`);
    }
    
  } catch (error) {
    console.error(`❌ Ошибка воспроизведения "${audioKey}":`, error);
  }
};

// Воспроизведение звука ячейки
export const playCellAudio = async (cellNumber: string, customAudioFiles: {[key: string]: string}): Promise<void> => {
  try {
    console.log(`🔊 === ОЗВУЧКА ЯЧЕЙКИ ===`);
    console.log(`🎯 Ячейка: ${cellNumber}`);
    
    // СНАЧАЛА ПРОБУЕМ НОВЫЙ НАДЕЖНЫЙ МЕНЕДЖЕР
    try {
      const { audioManager } = await import('@/utils/simpleAudioManager');
      console.log(`🔧 Пробую новый менеджер аудио...`);
      const success = await audioManager.playCellAudio(cellNumber);
      if (success) {
        console.log(`✅ НОВЫЙ МЕНЕДЖЕР УСПЕШНО ВОСПРОИЗВЕЛ ЯЧЕЙКУ ${cellNumber}`);
        return;
      }
    } catch (newManagerError) {
      console.log(`⚠️ Новый менеджер недоступен, используем старую систему:`, newManagerError);
    }
    
    // РЕЗЕРВНАЯ СИСТЕМА (СТАРАЯ)
    console.log(`📊 Всего файлов в памяти: ${Object.keys(customAudioFiles).length}`);
    
    // ПРИНУДИТЕЛЬНАЯ ПОПЫТКА ВОССТАНОВЛЕНИЯ ФАЙЛОВ ЯЧЕЕК
    if (Object.keys(customAudioFiles).length === 0) {
      console.log(`⚠️ ФАЙЛЫ НЕ ЗАГРУЖЕНЫ! ПОПЫТКА АВАРИЙНОГО ВОССТАНОВЛЕНИЯ...`);
      const backupSources = [
        'wb-pvz-cell-audio-settings-permanent',
        'wb-pvz-cell-audio-IMMEDIATE', 
        'wb-pvz-cell-audio-cement',
        'wb-NEVER-LOSE-CELLS-BACKUP'
      ];
      
      for (const source of backupSources) {
        const backupData = localStorage.getItem(source);
        if (backupData) {
          try {
            const backupFiles = JSON.parse(backupData);
            console.log(`🔄 ВОССТАНОВЛЕН ИСТОЧНИК ${source}: ${Object.keys(backupFiles).length} файлов`);
            Object.assign(customAudioFiles, backupFiles);
            break;
          } catch (err) {
            console.warn(`⚠️ Ошибка восстановления из ${source}:`, err);
          }
        }
      }
    }
    
    const cellFiles = Object.keys(customAudioFiles).filter(key => 
      key.startsWith('cell-') || key.includes('ячейка') || /^\d+$/.test(key)
    );
    console.log(`🏠 Файлы ячеек (${cellFiles.length}):`, cellFiles);
    
    // Множественные варианты поиска ячейки
    const possibleCellKeys = [
      `cell-${cellNumber}`,
      `${cellNumber}`, // Просто номер
      `ячейка-${cellNumber}`,
      `cells-${cellNumber}`,
      cellNumber.toString()
    ];
    
    console.log(`🔍 Ищем ячейку по ключам:`, possibleCellKeys);
    
    let foundKey = null;
    let audioUrl = null;
    
    for (const key of possibleCellKeys) {
      if (customAudioFiles[key]) {
        foundKey = key;
        audioUrl = customAudioFiles[key];
        console.log(`✅ НАЙДЕНА ЯЧЕЙКА: "${key}" → ${audioUrl.substring(0, 50)}...`);
        break;
      }
    }
    
    if (audioUrl && foundKey) {
      console.log(`🎵 ВОСПРОИЗВОЖУ ЯЧЕЙКУ: ${foundKey}`);
      await playAudioFile(audioUrl, foundKey);
      console.log(`✅ ЯЧЕЙКА ${cellNumber} УСПЕШНО ОЗВУЧЕНА`);
      return;
    }
    
    console.log(`❌ ОЗВУЧКА ЯЧЕЙКИ ${cellNumber} НЕ НАЙДЕНА`);
    console.log(`💾 Проверенные ключи:`, possibleCellKeys);
    console.log(`📁 Доступные файлы ячеек:`, cellFiles);
    console.log(`💡 Загрузите аудиофайл для ячейки в: Настройки → Озвучка ячеек`);
    
  } catch (error) {
    console.error(`❌ Ошибка озвучки ячейки ${cellNumber}:`, error);
  }
};