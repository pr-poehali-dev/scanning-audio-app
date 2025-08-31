import { loadAudioFilesFromStorage, emergencyRestore, CEMENT_SOURCES, STORAGE_KEY } from './audioStorage';

// Основная функция загрузки аудиофайлов
export const createAudioLoader = (
  setCustomAudioFiles: (files: {[key: string]: string}) => void,
  customAudioFiles: {[key: string]: string}
) => {
  const loadAudioFiles = () => {
    try {
      const finalFiles = loadAudioFilesFromStorage();
      setCustomAudioFiles(finalFiles);
      
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
      const currentFiles = Object.keys(customAudioFiles).length;
      console.log(`🔍 ПРОВЕРКА ОЗВУЧКИ: ${currentFiles} файлов`);
      if (currentFiles === 0) {
        console.log('⚠️ ОЗВУЧКА ПОТЕРЯНА! ВОССТАНАВЛИВАЮ...');
        loadAudioFiles();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  };

  return { loadAudioFiles, setupAudioLoading };
};