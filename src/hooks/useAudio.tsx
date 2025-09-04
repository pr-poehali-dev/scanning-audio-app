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
    const { setupAudioLoading } = createAudioLoader(setCustomAudioFiles, {});
    const cleanup = setupAudioLoading();
    
    return cleanup;
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