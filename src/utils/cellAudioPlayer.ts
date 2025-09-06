// Утилита для воспроизведения озвучки ячеек при приемке и выдаче

export const playCellAudio = async (cellNumber: string): Promise<boolean> => {
  try {
    console.log(`🔊 Попытка воспроизведения озвучки для ячейки: ${cellNumber}`);

    // 1. Ищем в основной системе useAudio (раздел выдачи) - ПРИОРИТЕТ
    const mainAudioFiles = localStorage.getItem('wb-audio-files');
    if (mainAudioFiles) {
      const audioFiles = JSON.parse(mainAudioFiles);
      
      // Ищем с префиксом выдачи
      const deliveryKey = `delivery-cell-${cellNumber.toUpperCase()}`;
      if (audioFiles[deliveryKey]) {
        const audio = new Audio(audioFiles[deliveryKey]);
        await audio.play();
        console.log(`✅ Воспроизведена озвучка ячейки из раздела ВЫДАЧА: ${cellNumber}`);
        return true;
      }
      
      // Ищем простой ключ
      const simpleKey = cellNumber.toUpperCase();
      if (audioFiles[simpleKey]) {
        const audio = new Audio(audioFiles[simpleKey]);
        await audio.play();
        console.log(`✅ Воспроизведена озвучка ячейки (простой ключ): ${cellNumber}`);
        return true;
      }
      
      // Ищем с префиксом cell- (как в настройках)
      const cellKey = `cell-${cellNumber.toUpperCase()}`;
      if (audioFiles[cellKey]) {
        const audioUrl = audioFiles[cellKey];
        console.log(`🎵 Найден файл для ячейки ${cellNumber} по ключу ${cellKey}: ${audioUrl}`);
        
        // Проверяем что URL валидный
        if (audioUrl && typeof audioUrl === 'string' && audioUrl.trim()) {
          try {
            const audio = new Audio();
            
            // Добавляем обработчик ошибок ПЕРЕД установкой src
            audio.onerror = (e) => {
              console.error(`❌ Ошибка загрузки аудио для ячейки ${cellNumber}:`, e);
              console.error(`❌ Проблемный URL: ${audioUrl}`);
              console.error(`❌ URL начинается с: ${audioUrl.substring(0, 50)}...`);
              
              // Дополнительная диагностика base64
              if (audioUrl.startsWith('data:')) {
                const base64Part = audioUrl.split(',')[1];
                console.error(`❌ Base64 длина: ${base64Part ? base64Part.length : 'нет base64 части'}`);
                console.error(`❌ MIME тип: ${audioUrl.split(',')[0]}`);
              }
            };
            
            // Добавляем обработчик загрузки для диагностики
            audio.onloadeddata = () => {
              console.log(`✅ Аудио загружено для ячейки ${cellNumber}, длительность: ${audio.duration}s`);
            };
            
            audio.src = audioUrl;
            await audio.play();
            console.log(`✅ Воспроизведена озвучка ячейки (cell-префикс): ${cellNumber}`);
            return true;
          } catch (playError) {
            console.error(`❌ Ошибка воспроизведения для ячейки ${cellNumber}:`, playError);
            console.error(`❌ URL тип: ${typeof audioUrl}, длина: ${audioUrl.length}`);
            
            // Попробуем переработать файл если это base64
            if (audioUrl.startsWith('data:')) {
              console.log(`🔄 Попытка прямого воспроизведения base64...`);
              try {
                // Создаем новый blob из base64 и пробуем заново
                const base64Data = audioUrl.split(',')[1];
                const mimeType = audioUrl.split(',')[0].split(':')[1].split(';')[0];
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: mimeType });
                const newUrl = URL.createObjectURL(blob);
                
                const retryAudio = new Audio(newUrl);
                await retryAudio.play();
                console.log(`✅ ВОССТАНОВЛЕНО! Воспроизведена озвучка ячейки через blob: ${cellNumber}`);
                return true;
              } catch (retryError) {
                console.error(`❌ Не удалось восстановить base64:`, retryError);
              }
            }
          }
        } else {
          console.error(`❌ Пустой или некорректный URL для ячейки ${cellNumber}: ${audioUrl}`);
        }
      }
      
      // Поиск по всем ключам, содержащим номер ячейки  
      const cellNum = cellNumber.toUpperCase();
      for (const [key, audioUrl] of Object.entries(audioFiles)) {
        if (key.includes(cellNum) && (key.startsWith('cell-') || key.endsWith(`-${cellNum}`) || key === cellNum)) {
          console.log(`🎵 Найден файл для ячейки ${cellNumber} по ключу ${key}: ${audioUrl}`);
          
          if (audioUrl && typeof audioUrl === 'string' && (audioUrl as string).trim()) {
            try {
              const audio = new Audio(audioUrl as string);
              
              audio.onerror = (e) => {
                console.error(`❌ Ошибка загрузки аудио для ячейки ${cellNumber} (ключ ${key}):`, e);
                console.error(`❌ Проблемный URL: ${audioUrl}`);
              };
              
              await audio.play();
              console.log(`✅ Воспроизведена озвучка ячейки (найден ключ: ${key}): ${cellNumber}`);
              return true;
            } catch (playError) {
              console.error(`❌ Ошибка воспроизведения для ячейки ${cellNumber} (ключ ${key}):`, playError);
              console.error(`❌ URL: ${audioUrl}`);
            }
          } else {
            console.error(`❌ Пустой или некорректный URL для ячейки ${cellNumber} (ключ ${key}): ${audioUrl}`);
          }
        }
      }
    }

    // 2. Ищем в индивидуальных настройках ячеек (совместимость)
    const individualCells = localStorage.getItem('wb-pvz-individual-cell-audios');
    if (individualCells) {
      const cellAudios = JSON.parse(individualCells);
      const audioUrl = cellAudios[cellNumber.toUpperCase()] || cellAudios[`delivery-cell-${cellNumber.toUpperCase()}`];
      
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        await audio.play();
        console.log(`✅ Воспроизведена индивидуальная озвучка для ячейки ${cellNumber}`);
        return true;
      }
    }

    // 3. Ищем в общих настройках (старая система)
    const generalSettings = localStorage.getItem('wb-pvz-cell-audio-settings-permanent');
    if (generalSettings) {
      const audioFiles = JSON.parse(generalSettings);
      const audioUrl = audioFiles[cellNumber.toUpperCase()] || audioFiles[cellNumber.toLowerCase()];
      
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        await audio.play();
        console.log(`✅ Воспроизведена озвучка из старой системы для ячейки ${cellNumber}`);
        return true;
      }
    }

    // Поиск с вариациями (A1, A01, a1, и т.д.)
    const variations = [
      cellNumber.toUpperCase(),
      cellNumber.toLowerCase(),
      cellNumber.replace(/(\w)(\d+)/, (match, letter, num) => letter.toUpperCase() + num.padStart(2, '0')),
      cellNumber.replace(/(\w)0*(\d+)/, '$1$2').toUpperCase()
    ];

    for (const settings of [individualCells, generalSettings]) {
      if (!settings) continue;
      
      const audioFiles = JSON.parse(settings);
      for (const variation of variations) {
        if (audioFiles[variation]) {
          const audio = new Audio(audioFiles[variation]);
          await audio.play();
          console.log(`✅ Воспроизведена озвучка (вариация ${variation}) для ячейки ${cellNumber}`);
          return true;
        }
      }
    }

    console.log(`⚠️ Озвучка для ячейки ${cellNumber} не найдена`);
    return false;

  } catch (error) {
    console.error(`❌ Ошибка воспроизведения озвучки для ячейки ${cellNumber}:`, error);
    return false;
  }
};

// Функция для проверки наличия озвучки для ячейки
export const hasCellAudio = (cellNumber: string): boolean => {
  try {
    // 1. Проверяем в основной системе useAudio (раздел выдачи) - ПРИОРИТЕТ
    const mainAudioFiles = localStorage.getItem('wb-audio-files');
    if (mainAudioFiles) {
      const audioFiles = JSON.parse(mainAudioFiles);
      
      // Проверяем с префиксом выдачи
      const deliveryKey = `delivery-cell-${cellNumber.toUpperCase()}`;
      if (audioFiles[deliveryKey]) {
        return true;
      }
      
      // Проверяем простой ключ
      const simpleKey = cellNumber.toUpperCase();
      if (audioFiles[simpleKey]) {
        return true;
      }
      
      // Проверяем с префиксом cell-
      const cellKey = `cell-${cellNumber.toUpperCase()}`;
      if (audioFiles[cellKey]) {
        return true;
      }
      
      // Поиск по всем ключам, содержащим номер ячейки
      const cellNum = cellNumber.toUpperCase();
      for (const key of Object.keys(audioFiles)) {
        if (key.includes(cellNum) && (key.startsWith('cell-') || key.endsWith(`-${cellNum}`) || key === cellNum)) {
          return true;
        }
      }
    }

    // 2. Проверяем индивидуальные настройки
    const individualCells = localStorage.getItem('wb-pvz-individual-cell-audios');
    if (individualCells) {
      const cellAudios = JSON.parse(individualCells);
      if (cellAudios[cellNumber.toUpperCase()] || cellAudios[`delivery-cell-${cellNumber.toUpperCase()}`]) {
        return true;
      }
    }

    // 3. Проверяем общие настройки (старая система)
    const generalSettings = localStorage.getItem('wb-pvz-cell-audio-settings-permanent');
    if (generalSettings) {
      const audioFiles = JSON.parse(generalSettings);
      if (audioFiles[cellNumber.toUpperCase()] || audioFiles[cellNumber.toLowerCase()]) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`❌ Ошибка проверки озвучки для ячейки ${cellNumber}:`, error);
    return false;
  }
};

// Функция для получения списка всех озвученных ячеек
export const getAudioEnabledCells = (): string[] => {
  const cells: string[] = [];

  try {
    // Из индивидуальных настроек
    const individualCells = localStorage.getItem('wb-pvz-individual-cell-audios');
    if (individualCells) {
      const cellAudios = JSON.parse(individualCells);
      cells.push(...Object.keys(cellAudios));
    }

    // Из общих настроек (избегаем дубликатов)
    const generalSettings = localStorage.getItem('wb-pvz-cell-audio-settings-permanent');
    if (generalSettings) {
      const audioFiles = JSON.parse(generalSettings);
      for (const key of Object.keys(audioFiles)) {
        // Только ячейки (формат A1, B15 и т.д.)
        if (/^[A-Z]+\d+$/i.test(key) && !cells.includes(key.toUpperCase())) {
          cells.push(key.toUpperCase());
        }
      }
    }

    console.log(`📋 Найдено ${cells.length} озвученных ячеек:`, cells);
    return cells;
  } catch (error) {
    console.error('❌ Ошибка получения списка озвученных ячеек:', error);
    return [];
  }
};