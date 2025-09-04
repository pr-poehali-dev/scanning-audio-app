// ПРОСТАЯ И НАДЕЖНАЯ СИСТЕМА ОЗВУЧКИ ЯЧЕЕК

const STORAGE_KEY = 'SIMPLE_CELL_AUDIO_SYSTEM';

// Простое сохранение файла ячейки
export const saveCellAudio = async (cellNumber: string, file: File): Promise<boolean> => {
  try {
    console.log(`💾 Сохраняю ячейку ${cellNumber}:`, file.name);
    
    // Конвертируем в base64
    const base64 = await fileToBase64(file);
    
    // Получаем существующие файлы
    const existing = getCellAudios();
    
    // Добавляем новый файл во ВСЕ возможные варианты ключей
    existing[cellNumber] = base64;
    existing[`cell-${cellNumber}`] = base64;
    existing[`ячейка-${cellNumber}`] = base64;
    
    // Сохраняем в localStorage  
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    
    console.log(`✅ Ячейка ${cellNumber} сохранена в 3 форматах`);
    return true;
    
  } catch (error) {
    console.error(`❌ Ошибка сохранения ячейки ${cellNumber}:`, error);
    return false;
  }
};

// Сохранение папки с ячейками
export const saveCellFolder = async (files: File[]): Promise<number> => {
  let savedCount = 0;
  
  for (const file of files) {
    const cellNumber = extractCellNumber(file.name);
    if (cellNumber) {
      const success = await saveCellAudio(cellNumber, file);
      if (success) savedCount++;
    }
  }
  
  console.log(`📁 Сохранено ${savedCount} файлов ячеек из ${files.length}`);
  return savedCount;
};

// Воспроизведение ячейки
export const playCellAudio = async (cellNumber: string): Promise<boolean> => {
  try {
    console.log(`🔊 Пытаемся воспроизвести ячейку: ${cellNumber}`);
    
    const files = getCellAudios();
    
    // Пробуем все варианты ключей
    const keys = [cellNumber, `cell-${cellNumber}`, `ячейка-${cellNumber}`];
    
    for (const key of keys) {
      if (files[key]) {
        console.log(`✅ Найден ключ: ${key}`);
        
        const audio = new Audio(files[key]);
        audio.volume = 0.8;
        
        await audio.play();
        console.log(`🎵 Ячейка ${cellNumber} воспроизведена!`);
        
        // Останавливаем через 3 секунды
        setTimeout(() => audio.pause(), 3000);
        
        return true;
      }
    }
    
    console.warn(`❌ Ячейка ${cellNumber} не найдена`);
    return false;
    
  } catch (error) {
    console.error(`❌ Ошибка воспроизведения ячейки ${cellNumber}:`, error);
    return false;
  }
};

// Получение всех файлов ячеек
export const getCellAudios = (): Record<string, string> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('❌ Ошибка загрузки файлов ячеек:', error);
    return {};
  }
};

// Диагностика системы
export const diagnoseCellSystem = (): void => {
  console.log('🔍 === ДИАГНОСТИКА ПРОСТОЙ СИСТЕМЫ ===');
  
  const files = getCellAudios();
  const keys = Object.keys(files);
  const cellKeys = keys.filter(k => /^\d+$/.test(k) || k.includes('cell-') || k.includes('ячейка'));
  
  console.log(`📁 Всего файлов: ${keys.length}`);
  console.log(`🏠 Файлов ячеек: ${cellKeys.length}`);
  console.log(`📋 Ключи ячеек:`, cellKeys);
  
  // Проверяем валидность файлов
  let validFiles = 0;
  cellKeys.forEach(key => {
    const url = files[key];
    if (url && url.startsWith('data:audio/')) {
      validFiles++;
    }
  });
  
  console.log(`✅ Валидных файлов: ${validFiles}/${cellKeys.length}`);
};

// Вспомогательные функции
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const extractCellNumber = (filename: string): string | null => {
  // Извлекаем номер ячейки из имени файла
  const match = filename.match(/(\d+)/);
  return match ? match[1] : null;
};