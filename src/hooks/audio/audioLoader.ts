import { audioStorage } from '@/utils/audioStorage';
import { cloudAudioStorage } from '@/utils/cloudAudioStorage';
import { filterFilesByVariant } from './audioFilters';

export const loadAudioFiles = async (
  variant: 'v1' | 'v2',
  setUploadedFiles: (files: { [key: string]: string }) => void,
  uploadedFilesRef: React.MutableRefObject<{ [key: string]: string }>,
  setIsLoading: (value: boolean) => void,
  isMounted: boolean
): Promise<void> => {
  try {
    console.log('🔄 Начинаю загрузку аудиофайлов для варианта:', variant);
    
    try {
      const cloudFiles = await cloudAudioStorage.getAllFiles();
      console.log('☁️ Файлов в облаке:', Object.keys(cloudFiles).length);
      
      if (!isMounted) return;
      
      if (Object.keys(cloudFiles).length > 0) {
        const filteredFiles = filterFilesByVariant(cloudFiles, variant);
        console.log('✅ Загружено из облака (после фильтрации):', Object.keys(filteredFiles).length);
        setUploadedFiles(filteredFiles);
        uploadedFilesRef.current = filteredFiles;
        if (isMounted) setIsLoading(false);
        return;
      }
    } catch (cloudError) {
      console.warn('⚠️ Не удалось загрузить из облака, загружаю локально:', cloudError);
    }
    
    console.log('📂 Проверяю локальное хранилище...');
    const files = await audioStorage.getAllFiles();
    console.log('📦 Загружено локально:', Object.keys(files).length);
    
    if (!isMounted) return;
    
    const filteredFiles = filterFilesByVariant(files, variant);
    console.log('✅ После фильтрации:', Object.keys(filteredFiles).length);
    setUploadedFiles(filteredFiles);
    uploadedFilesRef.current = filteredFiles;
  } catch (error) {
    console.error('❌ Критическая ошибка загрузки:', error);
    if (!isMounted) return;
    setUploadedFiles({});
    uploadedFilesRef.current = {};
  }
  
  if (isMounted) {
    setIsLoading(false);
  }
};
