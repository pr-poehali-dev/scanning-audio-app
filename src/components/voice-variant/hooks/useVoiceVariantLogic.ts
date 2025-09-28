import { useState, useRef } from 'react';

interface VoiceVariantInfo {
  count: number;
  exists: boolean;
  cells: string[];
}

export const useVoiceVariantLogic = () => {
  const [selectedVariant, setSelectedVariant] = useState<'standard' | 'alternative'>('standard');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const filesArray = Array.from(files);
    
    console.log(`📁 Загружаем ${filesArray.length} файлов для варианта: ${selectedVariant}`);

    // Получаем или создаем хранилище для выбранного варианта
    const storageKey = `wb-voice-${selectedVariant}-permanent`;
    let audioData: Record<string, string> = {};
    
    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) {
        audioData = JSON.parse(existing);
      }
    } catch (error) {
      console.log('🆕 Создаем новое хранилище для варианта:', selectedVariant);
    }

    let successCount = 0;

    // Обрабатываем каждый файл
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const fileName = file.name;
      
      // Извлекаем номер ячейки из имени файла
      const cellMatch = fileName.match(/(\d+)/);
      if (!cellMatch) {
        console.warn(`⚠️ Не удалось извлечь номер ячейки из файла: ${fileName}`);
        continue;
      }
      
      const cellNumber = cellMatch[1];
      setUploadProgress(prev => ({ ...prev, [cellNumber]: 0 }));

      try {
        // Проверяем тип файла
        if (!file.type.startsWith('audio/')) {
          console.warn(`⚠️ Файл ${fileName} не является аудиофайлом`);
          setUploadProgress(prev => ({ ...prev, [cellNumber]: -1 }));
          continue;
        }

        // Конвертируем в base64
        const base64 = await fileToBase64(file);
        audioData[cellNumber] = base64;
        successCount++;
        
        setUploadProgress(prev => ({ ...prev, [cellNumber]: 100 }));
        console.log(`✅ Файл ${fileName} загружен для ячейки ${cellNumber}`);
        
      } catch (error) {
        console.error(`❌ Ошибка загрузки файла ${fileName}:`, error);
        setUploadProgress(prev => ({ ...prev, [cellNumber]: -1 }));
      }
    }

    // Сохраняем все данные
    localStorage.setItem(storageKey, JSON.stringify(audioData));
    
    // Устанавливаем активный вариант если это первая загрузка или если загружаем в уже активный
    const currentActiveVariant = localStorage.getItem('wb-active-voice-variant');
    if (!currentActiveVariant || currentActiveVariant === selectedVariant) {
      localStorage.setItem('wb-active-voice-variant', selectedVariant);
      console.log(`🎯 Установлен активный вариант: ${selectedVariant}`);
    }

    console.log(`💾 Сохранено ${successCount} файлов для варианта ${selectedVariant}`);
    setIsUploading(false);
    
    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (successCount > 0) {
      alert(`✅ Успешно загружено ${successCount} озвучек для варианта "${selectedVariant}"`);
    }
  };

  const getVariantInfo = (variant: 'standard' | 'alternative'): VoiceVariantInfo => {
    const storageKey = `wb-voice-${variant}-permanent`;
    try {
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        const count = Object.keys(parsed).filter(key => /^\d+$/.test(key)).length;
        const cells = Object.keys(parsed).filter(key => /^\d+$/.test(key)).sort((a, b) => parseInt(a) - parseInt(b));
        return { count, exists: count > 0, cells };
      }
    } catch (error) {
      console.log(`Ошибка чтения данных для ${variant}:`, error);
    }
    return { count: 0, exists: false, cells: [] };
  };

  const setActiveVariant = async (variant: 'standard' | 'alternative') => {
    try {
      const { activateVoiceVariant } = await import('@/utils/bulletproofAudio');
      const success = activateVoiceVariant(variant);
      
      if (success) {
        console.log(`🎯 Активный вариант изменен на: ${variant}`);
        alert(`✅ Активный вариант озвучки: ${variant === 'standard' ? 'Стандартная' : 'Альтернативная'}`);
      } else {
        alert(`❌ Ошибка активации варианта "${variant}"`);
      }
    } catch (error) {
      console.error('Ошибка активации варианта:', error);
      alert('❌ Ошибка активации варианта');
    }
  };

  const clearVariant = (variant: 'standard' | 'alternative') => {
    if (confirm(`🗑️ Удалить все озвучки для варианта "${variant === 'standard' ? 'Стандартная' : 'Альтернативная'}"?`)) {
      const storageKey = `wb-voice-${variant}-permanent`;
      localStorage.removeItem(storageKey);
      
      // Если удаляем активный вариант, сбрасываем активность
      const activeVariant = localStorage.getItem('wb-active-voice-variant');
      if (activeVariant === variant) {
        localStorage.removeItem('wb-active-voice-variant');
      }
      
      alert(`🧹 Вариант "${variant === 'standard' ? 'Стандартная' : 'Альтернативная'}" очищен`);
    }
  };

  const testVariant = async (variant: 'standard' | 'alternative') => {
    const info = getVariantInfo(variant);
    if (info.cells.length === 0) {
      alert('❌ Нет загруженных ячеек для тестирования');
      return;
    }

    const testCell = info.cells[0];
    try {
      // Сохраняем оригинальный активный вариант
      const originalActive = localStorage.getItem('wb-active-voice-variant');
      
      // Активируем тестируемый вариант через bulletproof систему
      const { activateVoiceVariant, playCellAudio } = await import('@/utils/bulletproofAudio');
      
      console.log(`🧪 Тестируем вариант ${variant} с ячейкой ${testCell}`);
      const activated = activateVoiceVariant(variant);
      
      if (!activated) {
        alert(`❌ Не удалось активировать вариант "${variant}"`);
        return;
      }
      
      // Тестируем воспроизведение
      const success = await playCellAudio(testCell);
      
      // Восстанавливаем оригинальный активный вариант
      if (originalActive) {
        activateVoiceVariant(originalActive);
      } else {
        localStorage.removeItem('wb-active-voice-variant');
      }
      
      if (success) {
        alert(`✅ Тест варианта "${variant}" успешен! Ячейка ${testCell} воспроизведена.`);
      } else {
        alert(`❌ Ошибка воспроизведения ячейки ${testCell} для варианта "${variant}"`);
      }
    } catch (error) {
      console.error('Ошибка тестирования:', error);
      alert('❌ Ошибка тестирования озвучки');
    }
  };

  return {
    selectedVariant,
    setSelectedVariant,
    uploadProgress,
    isUploading,
    fileInputRef,
    handleFileSelect,
    getVariantInfo,
    setActiveVariant,
    clearVariant,
    testVariant
  };
};