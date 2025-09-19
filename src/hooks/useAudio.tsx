import { useCallback, useRef, useState, useEffect } from 'react';
import { createAudioLoader } from './audio/audioLoader';
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
        const { audioManager } = await import('@/utils/simpleAudioManager');
        console.log('📦 Запускаем миграцию из старой системы...');
        audioManager.migrateFromOldSystem();
        
        // ПРИНУДИТЕЛЬНО ПРОВЕРЯЕМ ЧТО ДАННЫЕ ЗАГРУЗИЛИСЬ
        const info = audioManager.getStorageInfo();
        console.log('📊 После миграции:', info);
        
        if (info.cellsCount === 0) {
          console.log('⚠️ Ячейки не загрузились, пробуем экстренное восстановление...');
          // Пробуем загрузить из старых ключей localStorage
          const oldKeys = ['wb-audio-files', 'wb-pvz-cell-audio-settings-permanent'];
          for (const key of oldKeys) {
            const oldData = localStorage.getItem(key);
            if (oldData) {
              try {
                const parsedData = JSON.parse(oldData);
                console.log(`🔄 Найдены данные в ${key}:`, Object.keys(parsedData).length, 'файлов');
                
                // Пытаемся сохранить файлы ячеек
                for (const [cellKey, audioUrl] of Object.entries(parsedData)) {
                  if (typeof audioUrl === 'string' && audioUrl.startsWith('data:audio/')) {
                    const match = cellKey.match(/(\d+)/);
                    if (match) {
                      const cellNumber = match[1];
                      console.log(`💾 Восстанавливаем ячейку ${cellNumber}`);
                      // Создаем File object для сохранения
                      const blob = await fetch(audioUrl).then(r => r.blob());
                      const file = new File([blob], `cell-${cellNumber}.mp3`, { type: 'audio/mp3' });
                      await audioManager.saveCellAudio(cellNumber, file);
                    }
                  }
                }
                break;
              } catch (err) {
                console.warn(`❌ Ошибка восстановления из ${key}:`, err);
              }
            }
          }
        }
        
        const finalInfo = audioManager.getStorageInfo();
        console.log(`✅ Новый менеджер: ${finalInfo.cellsCount} ячеек, ${finalInfo.totalFiles} файлов, ${finalInfo.totalSize}`);
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

  // ПУЛЕНЕПРОБИВАЕМАЯ обертка для playAudio
  const playAudioCallback = useCallback(async (audioKey: string) => {
    try {
      console.log(`🛡️ ПУЛЕНЕПРОБИВАЕМОЕ ВОСПРОИЗВЕДЕНИЕ: "${audioKey}"`);
      
      // ИСПОЛЬЗУЕМ ТОЛЬКО ПУЛЕНЕПРОБИВАЕМУЮ СИСТЕМУ
      const { playAudio } = await import('@/utils/bulletproofAudio');
      const success = await playAudio(audioKey);
      
      if (success) {
        console.log(`✅ ПУЛЕНЕПРОБИВАЕМО: "${audioKey}" воспроизведено!`);
      } else {
        console.error(`❌ КРИТИЧНО: "${audioKey}" не найдено даже пуленепробиваемо`);
      }
    } catch (error) {
      console.error(`❌ Критическая ошибка воспроизведения "${audioKey}":`, error);
    }
  }, [customAudioFiles]);

  // ПУЛЕНЕПРОБИВАЕМАЯ обертка для playCellAudio
  const playCellAudioCallback = useCallback(async (cellNumber: string) => {
    try {
      console.log(`🛡️ ПУЛЕНЕПРОБИВАЕМАЯ ОЗВУЧКА ЯЧЕЙКИ: "${cellNumber}"`);
      
      // ИСПОЛЬЗУЕМ ТОЛЬКО ПУЛЕНЕПРОБИВАЕМУЮ СИСТЕМУ
      const { playCellAudio } = await import('@/utils/bulletproofAudio');
      const success = await playCellAudio(cellNumber);
      
      if (success) {
        console.log(`✅ ПУЛЕНЕПРОБИВАЕМО: Ячейка "${cellNumber}" воспроизведена!`);
      } else {
        console.error(`❌ КРИТИЧНО: Ячейка "${cellNumber}" не найдена даже пуленепробиваемо`);
      }
    } catch (error) {
      console.error(`❌ Критическая ошибка озвучки ячейки "${cellNumber}":`, error);
    }
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