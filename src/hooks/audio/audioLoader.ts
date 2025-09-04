import { loadAudioFilesFromStorage, emergencyRestore, CEMENT_SOURCES, STORAGE_KEY } from './audioStorage';

// Основная функция загрузки аудиофайлов
export const createAudioLoader = (
  setCustomAudioFiles: (files: {[key: string]: string}) => void,
  customAudioFiles: {[key: string]: string}
) => {
  const loadAudioFiles = () => {
    try {
      const finalFiles = loadAudioFilesFromStorage();
      
      // 🔧 ПРИНУДИТЕЛЬНАЯ СИНХРОНИЗАЦИЯ ФАЙЛОВ ЯЧЕЕК
      console.log('🔧 === ПРИНУДИТЕЛЬНАЯ СИНХРОНИЗАЦИЯ ===');
      
      // Находим все файлы которые могут быть ячейками
      const cellKeys = Object.keys(finalFiles).filter(key => 
        /^\d+$/.test(key) || 
        key.includes('cell-') || 
        key.includes('ячейка') ||
        key.includes('коробка') ||
        key.includes('box')
      );
      
      console.log(`🏠 Найдено ${cellKeys.length} файлов ячеек:`, cellKeys);
      
      // ПРИНУДИТЕЛЬНОЕ ДУБЛИРОВАНИЕ ВО ВСЕ ФОРМАТЫ
      const syncedFiles = { ...finalFiles };
      
      cellKeys.forEach(originalKey => {
        const audioUrl = finalFiles[originalKey];
        
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
      
      // 💾 ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ СИНХРОНИЗИРОВАННЫХ ФАЙЛОВ
      try {
        localStorage.setItem('wb-audio-files', JSON.stringify(syncedFiles));
        localStorage.setItem('wb-pvz-cell-audio-settings-permanent', JSON.stringify(syncedFiles));
        console.log('💾 СИНХРОНИЗИРОВАННЫЕ ФАЙЛЫ ПРИНУДИТЕЛЬНО СОХРАНЕНЫ!');
      } catch (saveError) {
        console.error('❌ Ошибка принудительного сохранения:', saveError);
      }
      
      setCustomAudioFiles(syncedFiles);
      
    } catch (error) {
      console.error('❌ Критическая ошибка загрузки аудио:', error);
      
      // Аварийная попытка загрузки
      const emergencyFiles = emergencyRestore();
      if (emergencyFiles) {
        setCustomAudioFiles(emergencyFiles);
      }
    }
  };

  // Настройка автоматической загрузки и мониторинга
  const setupAudioLoading = () => {
    // ЗАГРУЗКА ПРИ СТАРТЕ
    loadAudioFiles();
    
    // ДОПОЛНИТЕЛЬНАЯ ЗАГРУЗКА ЧЕРЕЗ 1 СЕКУНДУ (на случай задержки)
    setTimeout(loadAudioFiles, 1000);
    
    // ПРОВЕРКА КАЖДЫЕ 10 СЕКУНД (на случай потери)
    const interval = setInterval(() => {
      try {
        // Проверяем localStorage напрямую вместо состояния
        const storedFiles = localStorage.getItem('wb-pvz-cell-audio-settings-permanent');
        const currentFiles = storedFiles ? Object.keys(JSON.parse(storedFiles)).length : 0;
        
        if (currentFiles === 0) {
          console.log('⚠️ ОЗВУЧКА ПОТЕРЯНА! ВОССТАНАВЛИВАЮ...');
          loadAudioFiles();
        }
      } catch (error) {
        console.warn('⚠️ Ошибка проверки localStorage:', error);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  };

  return { loadAudioFiles, setupAudioLoading };
};