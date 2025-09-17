import { useCallback, useRef, useState, useEffect } from 'react';
import { createAudioLoader } from './audio/audioLoader';
import { playAudio, playCellAudio } from './audio/audioPlayer';
import { updateAudioFiles, removeAudioFile, clearAllAudio, getLoadedFiles } from './audio/audioFileManager';

export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [customAudioFiles, setCustomAudioFiles] = useState<{[key: string]: string}>({});

  // СУПЕР ЗАЩИТА - ЗАГРУЗКА СОХРАНЕННЫХ ФАЙЛОВ С ТРОЙНЫМ ВОССТАНОВЛЕНИЕМ
  useEffect(() => {
    console.log('🚀 ИНИЦИАЛИЗАЦИЯ АУДИО СИСТЕМЫ...');
    
    // СНАЧАЛА МИГРИРУЕМ ДАННЫЕ В НОВЫЙ МЕНЕДЖЕР
    const initializeAudioSystem = async () => {
      // СНАЧАЛА ИНИЦИАЛИЗИРУЕМ ГЛАВНУЮ СИСТЕМУ
      try {
        const { initializeCellAudioSystem } = await import('@/utils/cellAudioIntegration');
        console.log('🚀 Инициализируем главную систему озвучки ячеек...');
        await initializeCellAudioSystem();
      } catch (error) {
        console.log('⚠️ Главная система недоступна:', error);
      }
      
      // ЗАТЕМ МИГРИРУЕМ ДАННЫЕ В НОВЫЙ МЕНЕДЖЕР
      try {
        const { migrateFromOldSystem, getStorageInfo } = await import('@/utils/simpleAudioManager');
        console.log('📦 Запускаем миграцию из старой системы...');
        migrateFromOldSystem();
        
        const info = getStorageInfo();
        console.log(`✅ Новый менеджер: ${info.cellsCount} ячеек, ${info.totalFiles} файлов, ${info.totalSize}`);
      } catch (error) {
        console.log('⚠️ Новый менеджер недоступен, используем старую систему');
      }
      
      // ЗАТЕМ ИНИЦИАЛИЗИРУЕМ СТАРУЮ СИСТЕМУ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
      const { setupAudioLoading } = createAudioLoader(setCustomAudioFiles, {});
      return setupAudioLoading();
    };
    
    const cleanup = initializeAudioSystem();
    
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, []); // Без зависимости для избежания бесконечного цикла

  // Обертка для playAudio с передачей customAudioFiles
  const playAudioCallback = useCallback(async (audioKey: string) => {
    await playAudio(audioKey, customAudioFiles);
  }, [customAudioFiles]);

  // Обертка для playCellAudio с передачей customAudioFiles
  const playCellAudioCallback = useCallback(async (cellNumber: string) => {
    await playCellAudio(cellNumber, customAudioFiles);
  }, [customAudioFiles]);

  // Обертка для updateAudioFiles
  const updateAudioFilesCallback = useCallback(async (files: {[key: string]: string}) => {
    await updateAudioFiles(files, customAudioFiles, setCustomAudioFiles);
  }, [customAudioFiles]);

  // Обертка для removeAudioFile
  const removeAudioFileCallback = useCallback((audioKey: string) => {
    removeAudioFile(audioKey, customAudioFiles, setCustomAudioFiles);
  }, [customAudioFiles]);

  // Обертка для clearAllAudio
  const clearAllAudioCallback = useCallback(() => {
    clearAllAudio(setCustomAudioFiles);
  }, []);

  // Обертка для getLoadedFiles
  const getLoadedFilesCallback = useCallback(() => {
    return getLoadedFiles(customAudioFiles);
  }, [customAudioFiles]);

  return { 
    playAudio: playAudioCallback, 
    playCellAudio: playCellAudioCallback,
    updateAudioFiles: updateAudioFilesCallback, 
    removeAudioFile: removeAudioFileCallback, 
    clearAllAudio: clearAllAudioCallback, 
    getLoadedFiles: getLoadedFilesCallback,
    customAudioFiles 
  };
};