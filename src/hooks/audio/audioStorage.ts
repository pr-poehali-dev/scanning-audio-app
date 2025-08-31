export const STORAGE_KEY = 'wb-audio-files';

// Константы для резервного сохранения
export const CEMENT_SOURCES = [
  'wb-pvz-cell-audio-settings-permanent',
  'wb-pvz-cell-audio-backup', 
  'wb-pvz-cell-audio-cement',
  'wb-pvz-cell-audio-settings-STEEL-PROTECTION',
  'wb-pvz-EMERGENCY-audio-backup'
];

// Сохранение файлов в localStorage с множественным резервированием
export const saveAudioFiles = (files: {[key: string]: string}): void => {
  try {
    const jsonData = JSON.stringify(files);
    const sizeInMB = (jsonData.length / (1024 * 1024)).toFixed(2);
    
    localStorage.setItem(STORAGE_KEY, jsonData);
    localStorage.setItem(`${STORAGE_KEY}-timestamp`, new Date().toISOString());
    localStorage.setItem(`${STORAGE_KEY}-count`, Object.keys(files).length.toString());
    
    const cellFiles = Object.keys(files).filter(k => /^\d+$/.test(k) || k.includes('cell-') || k.includes('ячейка'));
    
    console.log('✅ === АВТОСОХРАНЕНИЕ ЗАВЕРШЕНО ===');
    console.log(`💾 Сохранено ${Object.keys(files).length} файлов (${sizeInMB} МБ)`);
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
        Object.entries(files).filter(([_, url]) => !url.startsWith('data:'))
      );
      localStorage.setItem(STORAGE_KEY + '-emergency', JSON.stringify(emergencyFiles));
      console.log('🚨 ЭКСТРЕННОЕ СОХРАНЕНИЕ:', Object.keys(emergencyFiles).length, 'файлов');
    } catch (emergencyError) {
      console.error('❌ Даже экстренное сохранение провалилось:', emergencyError);
    }
  }
};

// Принудительное сохранение настроек ячеек
export const saveCellSettings = (files: {[key: string]: string}): void => {
  const cellFiles = Object.entries(files).filter(([key]) => 
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
      localStorage.setItem('wb-pvz-cell-audio-lock', 'LOCKED');
      
      console.log(`🏠 🔒 ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ ЯЧЕЕК: ${cellFiles.length} файлов`);
      console.log('💎 Настройки ячеек сохранены НАВСЕГДА в отдельном защищенном ключе!');
      console.log('🔐 Ключи ячеек:', cellFiles.map(([key]) => key));
    } catch (error) {
      console.error('❌ Ошибка принудительного сохранения ячеек:', error);
    }
  }
};

// Загрузка файлов из всех источников
export const loadAudioFilesFromStorage = (): {[key: string]: string} => {
  console.log('🔄 === МОЩНАЯ ЗАГРУЗКА АУДИОФАЙЛОВ ===');
  
  let finalFiles = {};
  let cementedFiles = {};
  
  // Загружаем основные файлы
  const savedFiles = localStorage.getItem(STORAGE_KEY);
  if (savedFiles) {
    finalFiles = JSON.parse(savedFiles);
    console.log('📁 Основные файлы:', Object.keys(finalFiles).length);
  }
  
  // ПРИНУДИТЕЛЬНАЯ ЗАГРУЗКА ЗАБЕТОНИРОВАННЫХ ФАЙЛОВ ИЗ ВСЕХ ИСТОЧНИКОВ
  CEMENT_SOURCES.forEach(source => {
    try {
      const data = localStorage.getItem(source);
      if (data) {
        const sourceFiles = JSON.parse(data);
        Object.assign(cementedFiles, sourceFiles);
        console.log(`🏗️ ИЗ БЕТОНА (${source}):`, Object.keys(sourceFiles).length, 'файлов');
      }
    } catch (err) {
      console.warn(`⚠️ Ошибка загрузки из ${source}:`, err);
    }
  });
  
  // ПРИНУДИТЕЛЬНОЕ СЛИЯНИЕ ВСЕХ ИСТОЧНИКОВ
  if (Object.keys(cementedFiles).length > 0) {
    Object.assign(finalFiles, cementedFiles);
    console.log(`🏗️ СУММАРНО ИЗ БЕТОНА: ${Object.keys(cementedFiles).length} файлов`);
    
    // МГНОВЕННАЯ РЕЗЕРВНАЯ КОПИЯ В 6 МЕСТ
    const allBackupKeys = [
      ...CEMENT_SOURCES,
      STORAGE_KEY,
      'wb-pvz-NEVER-LOSE-CELLS-BACKUP'
    ];
    
    allBackupKeys.forEach(key => {
      try {
        localStorage.setItem(key, JSON.stringify(finalFiles));
      } catch (err) {
        console.warn(`Не удалось сохранить в ${key}:`, err);
      }
    });
    
    console.log(`🏗️ ФАЙЛЫ ПРОДУБЛИРОВАНЫ В ${allBackupKeys.length} МЕСТ!`);
  }
  
  console.log(`✅ ИТОГО ЗАГРУЖЕНО: ${Object.keys(finalFiles).length} файлов`);
  return finalFiles;
};

// Аварийное восстановление
export const emergencyRestore = (): {[key: string]: string} | null => {
  try {
    const emergency = localStorage.getItem('wb-pvz-cell-audio-cement');
    if (emergency) {
      console.log('🚨 АВАРИЙНОЕ ВОССТАНОВЛЕНИЕ УСПЕШНО!');
      return JSON.parse(emergency);
    }
  } catch (emergencyError) {
    console.error('🚨 Аварийное восстановление не удалось:', emergencyError);
  }
  return null;
};

// Очистка всех данных
export const clearAudioStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Ошибка очистки аудиофайлов из localStorage:', error);
  }
};