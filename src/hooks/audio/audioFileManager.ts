import { convertBlobToBase64 } from './audioUtils';
import { saveAudioFiles, saveCellSettings, clearAudioStorage } from './audioStorage';

// Обновление аудиофайлов с конвертацией blob URL в base64
export const updateAudioFiles = async (
  files: {[key: string]: string},
  customAudioFiles: {[key: string]: string},
  setCustomAudioFiles: (files: {[key: string]: string}) => void
): Promise<void> => {
  console.log(`🔄 Обновляю аудиофайлы. Новые файлы:`, Object.keys(files));
  console.log(`📄 Типы URL в files:`, Object.entries(files).map(([key, url]) => ({ key, isBlob: url.startsWith('blob:') })));
  
  // Конвертируем blob URL в base64 для постоянного сохранения
  const permanentFiles: {[key: string]: string} = {};
  
  for (const [key, url] of Object.entries(files)) {
    if (url.startsWith('blob:')) {
      try {
        const base64Url = await convertBlobToBase64(url);
        permanentFiles[key] = base64Url;
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
  saveCellSettings(updatedFiles);
  
  // Сохранение в localStorage
  saveAudioFiles(updatedFiles);
};

// Удаление аудиофайла
export const removeAudioFile = (
  audioKey: string,
  customAudioFiles: {[key: string]: string},
  setCustomAudioFiles: (files: {[key: string]: string}) => void
): void => {
  const updatedFiles = { ...customAudioFiles };
  delete updatedFiles[audioKey];
  setCustomAudioFiles(updatedFiles);
  
  // Сохраняем в localStorage
  saveAudioFiles(updatedFiles);
};

// Очистка всех аудиофайлов
export const clearAllAudio = (setCustomAudioFiles: (files: {[key: string]: string}) => void): void => {
  setCustomAudioFiles({});
  clearAudioStorage();
};

// Получение списка загруженных файлов
export const getLoadedFiles = (customAudioFiles: {[key: string]: string}): string[] => {
  return Object.keys(customAudioFiles);
};