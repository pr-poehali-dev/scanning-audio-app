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
    
    // Специальная обработка для вариантов озвучки
    if (tabType === 'variant-variant1' || tabType === 'variant-variant2') {
      const variantName = tabType === 'variant-variant1' ? 'Стандартная' : 'Альтернативная';
      console.log(`🎭 ЗАГРУЖАЮ ВАРИАНТ: ${variantName}`);
      
      const base64Files: { [key: string]: string } = {};
      let processedCount = 0;
      
      const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const baseFileName = file.name.replace(/\.[^/.]+$/, '');
          const audioUrl = URL.createObjectURL(file);
          
          // Сохраняем в base64 для постоянного хранения
          base64Files[baseFileName] = base64;
          
          // Создаем временный URL для использования
          audioFiles[baseFileName] = audioUrl;
          
          // Обработка ячеек
          if (/^\d+$/.test(baseFileName)) {
            audioFiles[`cell-${baseFileName}`] = audioUrl;
            audioFiles[`ячейка-${baseFileName}`] = audioUrl;
            base64Files[`cell-${baseFileName}`] = base64;
            base64Files[`ячейка-${baseFileName}`] = base64;
            console.log(`🏠 ЯЧЕЙКА ${baseFileName}: все форматы`);
          }
          
          // Обработка системных звуков
          if (baseFileName.toLowerCase().includes('товары со скидкой') || 
              baseFileName.toLowerCase().includes('скидк')) {
            audioFiles['discount'] = audioUrl;
            audioFiles['Товары со скидкой проверьте ВБ кошелек'] = audioUrl;
            base64Files['discount'] = base64;
            base64Files['Товары со скидкой проверьте ВБ кошелек'] = base64;
          }
          
          if (baseFileName.toLowerCase().includes('проверьте товар') || 
              baseFileName.toLowerCase().includes('камер')) {
            audioFiles['check-product-camera'] = audioUrl;
            audioFiles['Проверьте товар под камерой'] = audioUrl;
            base64Files['check-product-camera'] = base64;
            base64Files['Проверьте товар под камерой'] = base64;
          }
          
          if (baseFileName.toLowerCase().includes('оцените') || 
              baseFileName.toLowerCase().includes('пункт выдачи')) {
            audioFiles['rate-pvz'] = audioUrl;
            audioFiles['Оцените наш пункт выдачи'] = audioUrl;
            audioFiles['Пожалуйста оцените наш пункт выдачи в приложении'] = audioUrl;
            base64Files['rate-pvz'] = base64;
            base64Files['Оцените наш пункт выдачи'] = base64;
            base64Files['Пожалуйста оцените наш пункт выдачи в приложении'] = base64;
          }
          
          if (baseFileName.toLowerCase().includes('оплата при получении') || 
              baseFileName.toLowerCase().includes('наложенный платеж')) {
            audioFiles['cash-on-delivery'] = audioUrl;
            audioFiles['оплата при получении'] = audioUrl;
            base64Files['cash-on-delivery'] = base64;
            base64Files['оплата при получении'] = base64;
          }
          
          if (baseFileName.toLowerCase().includes('пик') && baseFileName.toLowerCase().includes('цифра')) {
            audioFiles['pick-digit'] = audioUrl;
            audioFiles['Пик цифра товаров'] = audioUrl;
            base64Files['pick-digit'] = base64;
            base64Files['Пик цифра товаров'] = base64;
          }
          
          if (baseFileName.toLowerCase().includes('спасибо') && baseFileName.toLowerCase().includes('заказ')) {
            audioFiles['thanks'] = audioUrl;
            audioFiles['Спасибо за заказ оцените пункт выдачи'] = audioUrl;
            base64Files['thanks'] = base64;
            base64Files['Спасибо за заказ оцените пункт выдачи'] = base64;
          }
          
          processedCount++;
          console.log(`✅ ${variantName} - ФАЙЛ: ${baseFileName} (${processedCount}/${files.length})`);
          
          // Когда все файлы обработаны
          if (processedCount === files.length) {
            // Сохраняем в localStorage с постоянным хранением
            try {
              const storageKey = `wb-pvz-${tabType}-audio-base64`;
              localStorage.setItem(storageKey, JSON.stringify(base64Files));
              console.log(`💾 СОХРАНЕН ${variantName}: ${Object.keys(base64Files).length} файлов в localStorage`);
              
              // Также сохраняем список названий для быстрого доступа
              const fileNames = Object.keys(base64Files);
              localStorage.setItem(`wb-pvz-${tabType}-files`, JSON.stringify(fileNames));
            } catch (e) {
              console.warn('Ошибка сохранения варианта озвучки:', e);
            }
            
            // Обновляем аудио файлы в приложении
            updateAudioFiles(audioFiles);
            
            alert(`${variantName} озвучка загружена!\n\n✅ Файлов: ${Object.keys(base64Files).length}\n💾 Сохранено навсегда в браузере`);
          }
        };
        reader.readAsDataURL(file);
      };
      
      // Обрабатываем все аудио файлы
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('audio/')) {
          processFile(file);
          newFilesCount++;
        }
      }
      
      if (event.target) {
        event.target.value = '';
      }
      return;
    }
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('Обрабатываю файл:', file.name, 'Тип:', file.type);
      
      if (file.type.startsWith('audio/')) {
        const baseFileName = file.name.replace(/\.[^/.]+$/, '');
        const audioUrl = URL.createObjectURL(file);
        
        // Специальная обработка для вариантов озвучки
        if (tabType === 'variant-variant1' || tabType === 'variant-variant2') {
          console.log(`🎯 Обрабатываю файл варианта озвучки: ${baseFileName}`);
          
          // Для ячеек (число) - создаем все форматы
          if (/^\d+$/.test(baseFileName)) {
            audioFiles[baseFileName] = audioUrl; // 44
            audioFiles[`cell-${baseFileName}`] = audioUrl; // cell-44
            audioFiles[`ячейка-${baseFileName}`] = audioUrl; // ячейка-44
            console.log(`🏠 ЯЧЕЙКА ${baseFileName}: созданы все форматы`);
          }
          // Для системных звуков - сохраняем как есть и создаем дубли
          else {
            audioFiles[baseFileName] = audioUrl;
            
            // Маппинг системных звуков
            if (baseFileName.toLowerCase().includes('товары со скидкой') || 
                baseFileName.toLowerCase().includes('скидк')) {
              audioFiles['discount'] = audioUrl;
              audioFiles['Товары со скидкой проверьте ВБ кошелек'] = audioUrl;
            }
            
            if (baseFileName.toLowerCase().includes('проверьте товар') || 
                baseFileName.toLowerCase().includes('камер')) {
              audioFiles['check-product-camera'] = audioUrl;
              audioFiles['Проверьте товар под камерой'] = audioUrl;
            }
            
            if (baseFileName.toLowerCase().includes('оцените') || 
                baseFileName.toLowerCase().includes('пункт выдачи')) {
              audioFiles['rate-pvz'] = audioUrl;
              audioFiles['Оцените наш пункт выдачи'] = audioUrl;
              audioFiles['Пожалуйста оцените наш пункт выдачи в приложении'] = audioUrl;
            }
            
            if (baseFileName.toLowerCase().includes('оплата при получении') || 
                baseFileName.toLowerCase().includes('наложенный платеж')) {
              audioFiles['cash-on-delivery'] = audioUrl;
              audioFiles['оплата при получении'] = audioUrl;
            }
            
            console.log(`🎵 СИСТЕМНЫЙ ЗВУК: ${baseFileName}`);
          }
        } else {
          // Обычная обработка для других вкладок
          const prefixedFileName = `${tabType}-${baseFileName}`;
          audioFiles[prefixedFileName] = audioUrl;
          audioFiles[baseFileName] = audioUrl;
        }
        
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