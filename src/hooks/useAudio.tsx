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

  // Обертка для playAudio с передачей customAudioFiles
  const playAudioCallback = useCallback(async (audioKey: string) => {
    try {
      console.log(`🔊 ПОПЫТКА ВОСПРОИЗВЕСТИ: "${audioKey}"`);
      
      // Сначала пробуем новую систему голосовых помощников
      const { voiceAssistantManager } = await import('@/utils/voiceAssistantManager');
      
      // Для discount пробуем напрямую через новую систему
      if (audioKey === 'discount') {
        console.log('🎯 Озвучка скидки через новую систему...');
        const success = await voiceAssistantManager.playNewAssistantSound('discount');
        if (success) {
          console.log('✅ Скидка воспроизведена через новую систему');
          return;
        }
      }
      
      // Fallback на старую систему
      await playAudio(audioKey, customAudioFiles);
    } catch (error) {
      console.error(`❌ Ошибка воспроизведения "${audioKey}":`, error);
    }
  }, [customAudioFiles]);

  // Обертка для playCellAudio с передачей customAudioFiles
  const playCellAudioCallback = useCallback(async (cellNumber: string) => {
    try {
      console.log(`🔊 ПОПЫТКА ОЗВУЧИТЬ ЯЧЕЙКУ: "${cellNumber}"`);
      
      // Используем новую систему напрямую без циклов
      const { playCellAudio: newPlayCellAudio } = await import('@/utils/cellAudioPlayer');
      await newPlayCellAudio(cellNumber);
    } catch (error) {
      console.error(`❌ Ошибка озвучки ячейки "${cellNumber}":`, error);
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