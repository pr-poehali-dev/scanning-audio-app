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
      
      // Ищем без префикса
      const simpleKey = cellNumber.toUpperCase();
      if (audioFiles[simpleKey]) {
        const audio = new Audio(audioFiles[simpleKey]);
        await audio.play();
        console.log(`✅ Воспроизведена озвучка ячейки (простой ключ): ${cellNumber}`);
        return true;
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
      
      // Проверяем без префикса
      const simpleKey = cellNumber.toUpperCase();
      if (audioFiles[simpleKey]) {
        return true;
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