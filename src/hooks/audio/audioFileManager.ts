import { convertBlobToBase64 } from './audioUtils';
import { saveAudioFiles, saveCellSettings, clearAudioStorage } from './audioStorage';

// Обновление аудиофайлов с усиленной конвертацией blob URL в base64
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
        
        // ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА: убеждаемся что base64 валидный
        if (!base64Url.startsWith('data:')) {
          console.error(`❌ ВНИМАНИЕ: Файл "${key}" не содержит корректный base64!`);
        }
      } catch (error) {
        console.error(`❌ Ошибка конвертации файла "${key}":`, error);
        // Попытка повторной конвертации через FileReader
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const base64Url = await base64Promise;
          permanentFiles[key] = base64Url;
          console.log(`✅ ПОВТОРНАЯ ПОПЫТКА: Файл "${key}" сконвертирован через FileReader`);
        } catch (retryError) {
          console.error(`❌ КРИТИЧЕСКАЯ ОШИБКА: Не удалось конвертировать "${key}":`, retryError);
          permanentFiles[key] = url; // Fallback к blob URL
        }
      }
    } else {
      permanentFiles[key] = url;
    }
  }
  
  const updatedFiles = { ...customAudioFiles, ...permanentFiles };
  setCustomAudioFiles(updatedFiles);
  
  // 🔒 МУЛЬТИСОХРАНЕНИЕ В 10 МЕСТАХ для озвучки ячеек
  const cellFiles = Object.fromEntries(
    Object.entries(updatedFiles).filter(([key]) => 
      /^\d+$/.test(key) || key.includes('cell-') || key.includes('ячейка')
    )
  );
  
  if (Object.keys(cellFiles).length > 0) {
    console.log(`🏠 Сохраняю ${Object.keys(cellFiles).length} файлов ячеек в 10 местах`);
    
    const cellBackupKeys = [
      'wb-audio-files',
      'wb-audio-files-cells-backup',
      'wb-audio-files-cells-backup-2', 
      'wb-audio-files-cells-backup-3',
      'wb-audio-files-cells-emergency',
      'wb-pvz-cells-permanent',
      'wb-pvz-cells-never-delete',
      'wb-pvz-cells-ultimate-backup',
      'wb-pvz-acceptance-cells',
      'wb-NEVER-LOSE-CELLS-BACKUP'
    ];
    
    cellBackupKeys.forEach(key => {
      try {
        localStorage.setItem(key, JSON.stringify(updatedFiles));
        localStorage.setItem(`${key}-timestamp`, new Date().toISOString());
      } catch (err) {
        console.warn(`Не удалось сохранить ячейки в ${key}:`, err);
      }
    });
    
    console.log(`✅ ЯЧЕЙКИ СОХРАНЕНЫ В ${cellBackupKeys.length} МЕСТАХ!`);
  }
  
  // Сохранение всех файлов  
  saveAudioFiles(updatedFiles);
  saveCellSettings(updatedFiles);
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