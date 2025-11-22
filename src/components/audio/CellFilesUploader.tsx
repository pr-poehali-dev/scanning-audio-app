import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { AudioSettings } from '@/hooks/useAppState';
import { audioStorage } from '@/utils/audioStorage';
import { cloudAudioStorage } from '@/utils/cloudAudioStorage';
import { getCellFiles } from './AudioManagerConstants';

interface CellFilesUploaderProps {
  audioSettings: AudioSettings;
  uploadedFiles: { [key: string]: string };
  setUploadedFiles: (files: { [key: string]: string }) => void;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  setUploadProgress: (value: { current: number; total: number }) => void;
}

export const CellFilesUploader = ({
  audioSettings,
  uploadedFiles,
  setUploadedFiles,
  isUploading,
  setIsUploading,
  setUploadProgress
}: CellFilesUploaderProps) => {
  const handleFileUpload = async (fileKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const variant = audioSettings.variant;
    const v1Files = ['goods', 'payment_on_delivery', 'please_check_good_under_camera', 'thanks_for_order_rate_pickpoint', 'success_sound'];
    const v2Files = ['checkWBWallet', 'scanAfterQrClient', 'askRatePickPoint', 'box_accepted', 'quantity_text'];
    const allowedFiles = variant === 'v1' ? v1Files : v2Files;
    
    const isCellFile = fileKey.startsWith(`cell_${variant}_`);
    const isBasicFile = allowedFiles.includes(fileKey);
    const isCountFile = fileKey.startsWith('count_');
    const isNumberFile = fileKey.startsWith('number_');
    
    if (!isCellFile && !isBasicFile && !isCountFile && !isNumberFile) {
      alert(`❌ Ошибка: файл "${fileKey}" не соответствует варианту ${variant}!\n\nВы выбрали вариант ${variant}, но пытаетесь загрузить файл для другого варианта.`);
      return;
    }

    const url = await audioStorage.saveFile(fileKey, file);
    
    try {
      await cloudAudioStorage.saveFile(fileKey, file);
      console.log('✅ Загружен локально и в облако:', fileKey);
    } catch (cloudError) {
      console.warn('⚠️ Облако недоступно, файл сохранён локально:', fileKey);
    }
    
    setUploadedFiles({ ...uploadedFiles, [fileKey]: url });
  };

  const handleCellBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔥 handleCellBulkUpload вызван');
    const files = event.target.files;
    console.log('📁 Файлов выбрано:', files?.length || 0);
    
    if (!files || files.length === 0) {
      console.log('❌ Нет файлов для загрузки');
      return;
    }

    setIsUploading(true);
    console.log(`📦 Массовая загрузка ячеек: ${files.length} файлов`);
    
    const newFiles: { [key: string]: string } = { ...uploadedFiles };
    let successCount = 0;
    let errorCount = 0;

    setUploadProgress({ current: 0, total: files.length });

    const BATCH_SIZE = 100;
    const fileArray = Array.from(files);
    
    for (let batchStart = 0; batchStart < fileArray.length; batchStart += BATCH_SIZE) {
      const batch = fileArray.slice(batchStart, batchStart + BATCH_SIZE);
      
      const uploadPromises = batch.map(async (file) => {
        const fileName = file.name.replace('.mp3', '').replace('.wav', '').replace('.ogg', '').replace('.webm', '');
        
        let cellKey = fileName;
        
        if (fileName.startsWith('cell_v1_') || fileName.startsWith('cell_v2_')) {
          cellKey = fileName;
        } 
        else {
          const cellNumber = parseInt(fileName, 10);
          if (!isNaN(cellNumber) && cellNumber >= 1 && cellNumber <= 482) {
            cellKey = `cell_${audioSettings.variant}_${cellNumber}`;
          } else {
            return { success: false, key: fileName };
          }
        }
        
        try {
          const url = await audioStorage.saveFile(cellKey, file);
          try {
            await cloudAudioStorage.saveFile(cellKey, file);
          } catch (cloudError) {
            console.warn(`⚠️ Облако недоступно для ${cellKey}`);
          }
          return { success: true, key: cellKey, url };
        } catch (error) {
          console.error(`❌ ${cellKey}:`, error);
          return { success: false, key: cellKey };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      results.forEach(result => {
        if (result.success && result.url) {
          newFiles[result.key] = result.url;
          successCount++;
        } else {
          errorCount++;
        }
      });

      const currentProgress = Math.min(batchStart + batch.length, fileArray.length);
      setUploadProgress({ current: currentProgress, total: fileArray.length });
      console.log(`📊 Прогресс: ${currentProgress}/${fileArray.length} (${Math.round(currentProgress/fileArray.length*100)}%)`);
    }

    setUploadedFiles(newFiles);
    setIsUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    console.log(`✅ Загрузка завершена: ${successCount} успешно, ${errorCount} ошибок`);
    alert(`Загружено ячеек: ${successCount} из ${files.length}\n${errorCount > 0 ? `Ошибок: ${errorCount}` : ''}`);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Озвучки ячеек (1-482) - {audioSettings.variant === 'v1' ? 'Вариант 1' : 'Вариант 2'}</h3>
          <div className="flex items-center gap-3">
            <Input
              type="file"
              accept="audio/*"
              multiple
              onChange={handleCellBulkUpload}
              className="hidden"
              id="cell-bulk-upload"
              disabled={isUploading}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isUploading}
              onClick={() => document.getElementById('cell-bulk-upload')?.click()}
            >
              <Icon name="Upload" className="w-3 h-3" />
              Загрузить массово
            </Button>
            <span className="text-xs text-gray-500">
              Загружено: {getCellFiles(audioSettings.variant).filter(f => uploadedFiles[f.key]).length} из {getCellFiles(audioSettings.variant).length}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          💡 Файлы для {audioSettings.variant === 'v1' ? 'варианта 1' : 'варианта 2'}: cell_{audioSettings.variant}_1.mp3, cell_{audioSettings.variant}_2.mp3, ..., cell_{audioSettings.variant}_482.mp3
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2 border rounded-lg">
        {getCellFiles(audioSettings.variant).map((file) => {
          const cellNum = file.key.replace(`cell_${audioSettings.variant}_`, '');
          const isUploaded = uploadedFiles[file.key];
          
          return (
            <div key={file.key} className="relative">
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileUpload(file.key, e)}
                className="hidden"
                id={`upload-${file.key}`}
              />
              <label
                htmlFor={`upload-${file.key}`}
                className={`
                  flex items-center justify-center gap-1 p-2 border rounded cursor-pointer
                  transition-colors text-xs
                  ${isUploaded 
                    ? 'bg-green-50 border-green-300 text-green-700' 
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }
                `}
              >
                {isUploaded && <Icon name="CheckCircle" className="w-3 h-3" />}
                <span>Ячейка {cellNum}</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
