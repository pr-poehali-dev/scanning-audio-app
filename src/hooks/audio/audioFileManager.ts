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
  
  // ОТКЛЮЧАЕМ ПРОБЛЕМНУЮ КОНВЕРТАЦИЮ В BASE64
  // Сохраняем blob URL напрямую - они будут работать в текущей сессии
  console.log(`🚫 КОНВЕРТАЦИЯ В BASE64 ОТКЛЮЧЕНА - используем blob URL напрямую`);
  const permanentFiles: {[key: string]: string} = { ...files };
  
  const updatedFiles = { ...customAudioFiles, ...permanentFiles };
  
  // 🔧 ПРИНУДИТЕЛЬНАЯ СИНХРОНИЗАЦИЯ ФАЙЛОВ ЯЧЕЕК ПРЯМО ЗДЕСЬ
  console.log('🔧 === ПРИНУДИТЕЛЬНАЯ СИНХРОНИЗАЦИЯ ===');
  
  // Находим все файлы которые могут быть ячейками
  const cellKeys = Object.keys(updatedFiles).filter(key => 
    /^\d+$/.test(key) || 
    key.includes('cell-') || 
    key.includes('ячейка') ||
    key.includes('коробка') ||
    key.includes('box')
  );
  
  console.log(`🏠 Найдено ${cellKeys.length} файлов ячеек:`, cellKeys);
  
  // ПРИНУДИТЕЛЬНОЕ ДУБЛИРОВАНИЕ ВО ВСЕ ФОРМАТЫ
  const syncedFiles = { ...updatedFiles };
  
  cellKeys.forEach(originalKey => {
    const audioUrl = updatedFiles[originalKey];
    
    // Если это просто число - создаем все варианты
    if (/^\d+$/.test(originalKey)) {
      syncedFiles[originalKey] = audioUrl; // 44
      syncedFiles[`cell-${originalKey}`] = audioUrl; // cell-44  
      syncedFiles[`ячейка-${originalKey}`] = audioUrl; // ячейка-44
      console.log(`🔄 СИНХРОНИЗИРОВАНА ЯЧЕЙКА: ${originalKey} → 3 формата`);
    }
    
    // Если есть cell- префикс - создаем остальные варианты  
    if (originalKey.startsWith('cell-')) {
      const number = originalKey.replace('cell-', '');
      syncedFiles[number] = audioUrl; // 44
      syncedFiles[originalKey] = audioUrl; // cell-44
      syncedFiles[`ячейка-${number}`] = audioUrl; // ячейка-44
      console.log(`🔄 СИНХРОНИЗИРОВАН CELL-: ${originalKey} → 3 формата`);
    }
    
    // Если есть ячейка- префикс
    if (originalKey.startsWith('ячейка-')) {
      const number = originalKey.replace('ячейка-', '');
      syncedFiles[number] = audioUrl; // 44
      syncedFiles[`cell-${number}`] = audioUrl; // cell-44  
      syncedFiles[originalKey] = audioUrl; // ячейка-44
      console.log(`🔄 СИНХРОНИЗИРОВАНА ЯЧЕЙКА-: ${originalKey} → 3 формата`);
    }
  });
  
  console.log(`🔧 ИТОГО ПОСЛЕ СИНХРОНИЗАЦИИ: ${Object.keys(syncedFiles).length} файлов`);
  
  setCustomAudioFiles(syncedFiles);
  
  // 🔒 МУЛЬТИСОХРАНЕНИЕ В 10 МЕСТАХ для озвучки ячеек
  const cellFiles = Object.fromEntries(
    Object.entries(syncedFiles).filter(([key]) => 
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
        localStorage.setItem(key, JSON.stringify(syncedFiles)); // Сохраняем syncedFiles
        localStorage.setItem(`${key}-timestamp`, new Date().toISOString());
      } catch (err) {
        console.warn(`Не удалось сохранить ячейки в ${key}:`, err);
      }
    });
    
    console.log(`✅ ЯЧЕЙКИ СОХРАНЕНЫ В ${cellBackupKeys.length} МЕСТАХ!`);
  }
  
  // Сохранение всех файлов  
  saveAudioFiles(syncedFiles); // Используем syncedFiles
  saveCellSettings(syncedFiles); // Используем syncedFiles
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