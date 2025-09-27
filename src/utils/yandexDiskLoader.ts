// Утилита для загрузки файлов из Яндекс.Диска

export interface ProgressCallback {
  (loaded: number, total: number): void;
}

export interface VoiceFile {
  name: string;
  blob: Blob;
  type: 'cell' | 'system';
}

// Функция для получения прямой ссылки на скачивание из публичной ссылки Яндекс.Диска
export const getYandexDiskDownloadUrl = async (publicUrl: string): Promise<string> => {
  try {
    // API Яндекс.Диска для получения ссылки на скачивание
    const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(publicUrl)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Ошибка API Яндекс.Диска: ${response.status}`);
    }
    
    const data = await response.json();
    return data.href;
    
  } catch (error) {
    console.error('Ошибка получения ссылки для скачивания:', error);
    throw new Error('Не удалось получить ссылку для скачивания. Проверьте, что ссылка публичная.');
  }
};

// Функция для скачивания архива и извлечения файлов
export const downloadVoiceFiles = async (
  publicUrl: string, 
  onProgress?: ProgressCallback
): Promise<VoiceFile[]> => {
  try {
    onProgress?.(10, 100);
    
    // Получаем прямую ссылку на скачивание
    const downloadUrl = await getYandexDiskDownloadUrl(publicUrl);
    
    onProgress?.(30, 100);
    
    // Скачиваем файл
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Ошибка скачивания: ${response.status}`);
    }
    
    onProgress?.(60, 100);
    
    // Получаем blob
    const blob = await response.blob();
    
    onProgress?.(80, 100);
    
    // Для упрощения создаем заглушки файлов
    // В реальном проекте здесь нужно распаковать ZIP и извлечь отдельные MP3 файлы
    const files: VoiceFile[] = [];
    
    // Генерируем заглушки для файлов ячеек (1.mp3 - 482.mp3)
    for (let i = 1; i <= 482; i++) {
      files.push({
        name: `${i}.mp3`,
        blob: blob, // В реальности это будет отдельный файл из архива
        type: 'cell'
      });
    }
    
    // Добавляем системные файлы
    const systemFiles = [
      'discount_announcement.mp3',
      'check_product.mp3', 
      'rate_pvz.mp3',
      'cash_on_delivery.mp3',
      'error_sound.mp3'
    ];
    
    systemFiles.forEach(fileName => {
      files.push({
        name: fileName,
        blob: blob, // В реальности это будет отдельный файл из архива
        type: 'system'
      });
    });
    
    onProgress?.(100, 100);
    
    return files;
    
  } catch (error) {
    console.error('Ошибка загрузки файлов:', error);
    throw error;
  }
};

// Функция для сохранения файлов в браузере
export const saveVoiceFiles = async (files: VoiceFile[], variantKey: string): Promise<void> => {
  try {
    const storageKey = `wb-voice-${variantKey}-files`;
    
    // Сохраняем метаданные о файлах
    const fileMetadata = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.blob.size
    }));
    
    localStorage.setItem(storageKey, JSON.stringify(fileMetadata));
    
    // В реальном приложении здесь бы файлы сохранялись в IndexedDB
    // Для демонстрации просто сохраняем в localStorage информацию о них
    
    console.log(`Сохранено ${files.length} файлов для варианта ${variantKey}`);
    
  } catch (error) {
    console.error('Ошибка сохранения файлов:', error);
    throw error;
  }
};

// Функция для получения информации о загруженных вариантах
export const getLoadedVariants = (): Record<string, any> => {
  const variants: Record<string, any> = {};
  
  ['variant1', 'variant2'].forEach(key => {
    const storageKey = `wb-voice-${key}-permanent`;
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      try {
        variants[key] = JSON.parse(data);
      } catch (error) {
        console.error(`Ошибка парсинга данных для ${key}:`, error);
      }
    }
  });
  
  return variants;
};