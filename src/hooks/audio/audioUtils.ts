// Вспомогательные функции для работы с аудио

// Конвертация ArrayBuffer в base64
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Конвертация blob URL в base64 для постоянного сохранения
export const convertBlobToBase64 = async (url: string): Promise<string> => {
  if (!url.startsWith('blob:')) {
    return url;
  }
  
  try {
    // Получаем файл как ArrayBuffer
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    
    // Конвертируем в base64
    const base64 = arrayBufferToBase64(arrayBuffer);
    const mimeType = response.headers.get('content-type') || 'audio/mpeg';
    return `data:${mimeType};base64,${base64}`;
    
  } catch (error) {
    console.error(`❌ Ошибка конвертации blob URL:`, error);
    return url; // Fallback к оригинальному URL
  }
};

// Получение скорости воспроизведения из настроек
export const getPlaybackRate = (): number => {
  const savedSpeed = localStorage.getItem('wb-pvz-audio-speed');
  return savedSpeed ? parseFloat(savedSpeed) : 1.0;
};

// Проверка является ли ключ ячейкой
export const isCellKey = (key: string): boolean => {
  return key.includes('cell-') || key.includes('ячейка') || /^\d+$/.test(key);
};

// Получение всех ключей ячеек из файлов
export const getCellKeys = (files: {[key: string]: string}): string[] => {
  return Object.keys(files).filter(isCellKey);
};

// Диагностика ячейки
export const diagnoseCellAudio = (audioKey: string, customAudioFiles: {[key: string]: string}): void => {
  if (isCellKey(audioKey)) {
    console.log(`🏠 === ДИАГНОСТИКА ЯЧЕЙКИ ===`);
    console.log(`📍 Запрошена ячейка: "${audioKey}"`);
    console.log(`📊 Загружено ячеек: ${getCellKeys(customAudioFiles).length}`);
    
    const cellKeys = getCellKeys(customAudioFiles);
    console.log(`📋 Доступные ячейки:`, cellKeys);
    
    console.log(`❓ ОТКУДА ЭТОТ НОМЕР? Проверьте стек вызовов ниже:`);
    console.trace();
  }
};