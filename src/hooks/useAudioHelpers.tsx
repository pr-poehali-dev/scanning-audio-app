import { useCallback } from 'react';

export const useAudioHelpers = (updateAudioFiles: (files: Record<string, string>) => void, customAudioFiles: Record<string, string>) => {
  
  const getTabName = useCallback((tabId: string) => {
    const names: { [key: string]: string } = {
      'delivery': 'Выдача',
      'acceptance': 'Приемка', 
      'returns': 'Возврат',
      'general': 'Общие'
    };
    return names[tabId] || tabId;
  }, []);

  const handleFolderUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, tabType: string) => {
    const files = event.target.files;
    console.log('Выбрано файлов для', tabType, ':', files?.length);
    
    if (!files) return;

    const audioFiles: { [key: string]: string } = { ...customAudioFiles };
    let newFilesCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('Обрабатываю файл:', file.name, 'Тип:', file.type);
      
      if (file.type.startsWith('audio/')) {
        const baseFileName = file.name.replace(/\.[^/.]+$/, '');
        const audioUrl = URL.createObjectURL(file);
        
        // Сохраняем файл с префиксом вкладки
        const prefixedFileName = `${tabType}-${baseFileName}`;
        audioFiles[prefixedFileName] = audioUrl;
        
        // ТАКЖЕ сохраняем файл БЕЗ префикса для глобального доступа
        audioFiles[baseFileName] = audioUrl;
        
        console.log(`✅ Добавлен аудиофайл:`, {
          withPrefix: prefixedFileName,
          global: baseFileName,
          url: audioUrl
        });
        
        newFilesCount++;
      }
    }

    if (newFilesCount > 0) {
      updateAudioFiles(audioFiles);
      
      // Сохраняем аудио файлы в localStorage для всей платформы
      try {
        const audioFilesToStore = { ...audioFiles };
        // Удаляем URL объекты из localStorage (они не сериализуются)
        // Сохраняем только названия файлов для восстановления при перезагрузке
        const fileNames = Object.keys(audioFiles).filter(key => !key.includes('blob:'));
        localStorage.setItem('wb-pvz-uploaded-audio-files', JSON.stringify(fileNames));
        console.log(`💾 Сохранено ${fileNames.length} названий аудиофайлов в localStorage`);
      } catch (e) {
        console.warn('Не удалось сохранить список аудиофайлов в localStorage:', e);
      }
      
      alert(`Для вкладки "${getTabName(tabType)}" загружено ${newFilesCount} аудиофайлов.\n\n✅ Файлы теперь доступны для всей платформы!`);
    } else {
      alert('Аудиофайлы не найдены. Проверьте что выбрали файлы с расширением .mp3, .wav, .ogg или другими аудио форматами');
    }

    if (event.target) {
      event.target.value = '';
    }
  }, [updateAudioFiles, customAudioFiles, getTabName]);

  const getPhrasesByTab = useCallback((tabId: string) => {
    const phrases: { [key: string]: string[] } = {
      'delivery': ['Спасибо за заказ! Оцените пункт выдачи!', 'Верните на ячейку'],
      'acceptance': ['Принято в ПВЗ', 'Ошибка приемки', 'Ячейка 1', 'Ячейка 2', 'Ячейка 3'],
      'returns': ['Возврат оформлен', 'Ошибка возврата'],
      'general': ['Общий сигнал', 'Ошибка системы']
    };
    return phrases[tabId] || [];
  }, []);

  const getDescriptionsByTab = useCallback((tabId: string) => {
    const descriptions: { [key: string]: { text: string; enabled: boolean }[] } = {
      'delivery': [
        { text: 'Завершение выдачи заказа клиенту', enabled: true },
        { text: 'Снятие заказа клиента с примерки', enabled: false }
      ],
      'acceptance': [
        { text: 'Успешное принятие товара', enabled: true },
        { text: 'Ошибка при приемке', enabled: true },
        { text: 'Озвучка номера ячейки (универсальная)', enabled: true },
        { text: 'Озвучка конкретной ячейки (резерв)', enabled: true },
        { text: 'Озвучка конкретной ячейки (резерв)', enabled: true }
      ],
      'returns': [
        { text: 'Успешное оформление возврата', enabled: true },
        { text: 'Ошибка при возврате', enabled: false }
      ],
      'general': [
        { text: 'Общие уведомления', enabled: true },
        { text: 'Системные ошибки', enabled: true }
      ]
    };
    return descriptions[tabId] || [];
  }, []);

  const togglePhraseEnabled = useCallback((tabId: string, phraseIndex: number, audioSettings: any, updateAudioSetting: (key: string, value: any) => void) => {
    const currentEnabled = audioSettings.enabled[`${tabId}-${phraseIndex}`] || false;
    const newEnabled = {
      ...audioSettings.enabled,
      [`${tabId}-${phraseIndex}`]: !currentEnabled
    };
    updateAudioSetting('enabled', newEnabled);
  }, []);

  return {
    getTabName,
    handleFolderUpload,
    getPhrasesByTab,
    getDescriptionsByTab,
    togglePhraseEnabled,
  };
};