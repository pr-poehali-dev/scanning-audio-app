export const STORAGE_KEY = 'wb-audio-files';

// Константы для резервного сохранения
export const CEMENT_SOURCES = [
  'wb-pvz-cell-audio-settings-permanent',
  'wb-pvz-cell-audio-backup', 
  'wb-pvz-cell-audio-cement',
  'wb-pvz-cell-audio-settings-STEEL-PROTECTION',
  'wb-pvz-EMERGENCY-audio-backup',
  'wb-pvz-cell-audio-IMMEDIATE', // Мгновенное сохранение
  'wb-NEVER-LOSE-CELLS-BACKUP' // Дополнительный резерв
];

// Сохранение файлов в localStorage с множественным резервированием
export const saveAudioFiles = (files: {[key: string]: string}): void => {
  try {
    const jsonData = JSON.stringify(files);
    const sizeInMB = (jsonData.length / (1024 * 1024)).toFixed(2);
    
    console.log(`💾 Попытка сохранения ${Object.keys(files).length} файлов (${sizeInMB} МБ)...`);
    
    // Сначала сохраняем в резервные ключи (они меньше и надежнее)
    CEMENT_SOURCES.forEach(source => {
      try {
        localStorage.setItem(source, jsonData);
      } catch (backupError) {
        console.warn(`⚠️ Не удалось сохранить в ${source}:`, backupError);
      }
    });
    
    // Затем пробуем сохранить в основной ключ
    try {
      localStorage.setItem(STORAGE_KEY, jsonData);
      localStorage.setItem(`${STORAGE_KEY}-timestamp`, new Date().toISOString());
      localStorage.setItem(`${STORAGE_KEY}-count`, Object.keys(files).length.toString());
      console.log('✅ Основной ключ сохранен успешно');
    } catch (mainKeyError) {
      console.error('❌ Ошибка сохранения основного ключа:', mainKeyError);
      
      // Если основной ключ не сохранился, убеждаемся что резервы есть
      const hasBackup = CEMENT_SOURCES.some(source => {
        try {
          const test = localStorage.getItem(source);
          return test && test.length > 100;
        } catch {
          return false;
        }
      });
      
      if (hasBackup) {
        console.log('✅ Основной ключ не сохранился, но резервные копии есть');
      } else {
        throw new Error('Критическая ошибка: ни основной ключ, ни резервные копии не сохранились!');
      }
    }
    
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
  const cementedFiles = {};
  
  // Загружаем основные файлы
  const savedFiles = localStorage.getItem(STORAGE_KEY);
  if (savedFiles) {
    try {
      finalFiles = JSON.parse(savedFiles);
      console.log('📁 Основные файлы:', Object.keys(finalFiles).length);
    } catch (parseError) {
      console.error('❌ Ошибка парсинга основного ключа:', parseError);
      finalFiles = {};
    }
  } else {
    console.warn('⚠️ Основной ключ wb-audio-files ОТСУТСТВУЕТ! Пробую восстановление...');
    
    // Аварийное восстановление из резервных копий
    const backupSources = ['wb-pvz-cell-audio-settings-permanent', 'wb-pvz-cell-audio-cement'];
    for (const source of backupSources) {
      try {
        const backup = localStorage.getItem(source);
        if (backup) {
          const backupFiles = JSON.parse(backup);
          if (Object.keys(backupFiles).length > 0) {
            console.log(`🚨 АВАРИЙНОЕ ВОССТАНОВЛЕНИЕ из ${source}: ${Object.keys(backupFiles).length} файлов`);
            
            // Восстанавливаем основной ключ
            localStorage.setItem(STORAGE_KEY, backup);
            localStorage.setItem(`${STORAGE_KEY}-timestamp`, new Date().toISOString());
            localStorage.setItem(`${STORAGE_KEY}-count`, Object.keys(backupFiles).length.toString());
            
            finalFiles = backupFiles;
            console.log('✅ Основной ключ восстановлен!');
            break;
          }
        }
      } catch (err) {
        console.warn(`⚠️ Ошибка восстановления из ${source}:`, err);
      }
    }
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

// Полная очистка всех аудио данных
export const clearAudioStorage = (): void => {
  console.log('🗑️ === ПОЛНАЯ ОЧИСТКА ВСЕХ АУДИО ДАННЫХ ===');
  
  // Список ВСЕХ возможных ключей для очистки
  const allAudioKeys = [
    STORAGE_KEY,
    `${STORAGE_KEY}-timestamp`,
    `${STORAGE_KEY}-count`,
    `${STORAGE_KEY}-emergency`,
    ...CEMENT_SOURCES,
    
    // Дополнительные ключи из пуленепробиваемой системы
    'wb-unified-audio-system',
    'cellAudios',
    'wb-audio-files-backup',
    'wb-audio-files-cells-backup',
    'wb-audio-files-cells-backup-2', 
    'wb-audio-files-cells-backup-3',
    'wb-audio-files-cells-emergency',
    'wb-pvz-cells-permanent',
    'wb-pvz-cells-never-delete',
    'wb-pvz-cells-ultimate-backup',
    'wb-pvz-acceptance-cells',
    'wb-NEVER-LOSE-CELLS-BACKUP',
    'wb-pvz-cell-audio-timestamp',
    'wb-pvz-cell-audio-lock',
    
    // Старые ключи
    'audioFiles',
    'customAudioFiles',
    'wbAudioFiles'
  ];
  
  let removedCount = 0;
  
  allAudioKeys.forEach(key => {
    try {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        removedCount++;
        console.log(`🗑️ Удален: ${key}`);
      }
    } catch (error) {
      console.warn(`⚠️ Не удалось удалить ${key}:`, error);
    }
  });
  
  // Удаляем также все ключи, которые начинаются с паттернов
  const patterns = ['wb-audio', 'wb-pvz', 'cellAudio', 'audio'];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && patterns.some(pattern => key.toLowerCase().includes(pattern))) {
      try {
        localStorage.removeItem(key);
        removedCount++;
        console.log(`🗑️ Удален по паттерну: ${key}`);
        i--; // Уменьшаем индекс так как localStorage.length изменился
      } catch (error) {
        console.warn(`⚠️ Ошибка удаления ${key}:`, error);
      }
    }
  }
  
  console.log(`✅ ОЧИСТКА ЗАВЕРШЕНА: удалено ${removedCount} ключей`);
  console.log('🧹 Все аудио данные полностью удалены из localStorage');
};