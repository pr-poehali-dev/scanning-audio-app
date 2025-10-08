import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { AudioSettings } from '@/hooks/useAppState';
import { audioStorage } from '@/utils/audioStorage';
import { cloudAudioStorage } from '@/utils/cloudAudioStorage';

interface AudioManagerProps {
  audioSettings: AudioSettings;
  setAudioSettings: (settings: AudioSettings) => void;
  uploadedFiles: { [key: string]: string };
  setUploadedFiles: (files: { [key: string]: string }) => void;
  onTestAudio: (phraseKey: string) => void;
}

const BASIC_FILES = [
  { key: 'goods', label: 'Файл "goods.mp3" - озвучка товары', testKey: 'delivery-cell-info' },
  { key: 'word_items', label: 'Файл "word_items.mp3" - слово "товаров"', testKey: 'delivery-cell-info' },
  { key: 'payment_on_delivery', label: 'Файл "payment_on_delivery.mp3" - оплата при получении', testKey: 'delivery-cell-info' },
  { key: 'please_check_good_under_camera', label: 'Файл "please_check_good_under_camera.mp3" - проверьте товар', testKey: 'check-product-under-camera' },
  { key: 'thanks_for_order_rate_pickpoint', label: 'Файл "thanks_for_order_rate_pickpoint.mp3" - спасибо за заказ', testKey: 'delivery-thanks' },
];

const COUNT_FILES = Array.from({ length: 20 }, (_, i) => ({
  key: `count_${i + 1}`,
  label: `Файл "count_${i + 1}.mp3" - количество ${i + 1}`,
  testKey: 'delivery-cell-info'
}));

const CELL_FILES = Array.from({ length: 482 }, (_, i) => ({
  key: `cell_${i + 1}`,
  label: `Файл "cell_${i + 1}.mp3" - ячейка ${i + 1}`,
  testKey: 'delivery-cell-info'
}));

const REQUIRED_FILES = [...BASIC_FILES, ...COUNT_FILES, ...CELL_FILES];

export const AudioManager = ({
  uploadedFiles,
  setUploadedFiles,
  onTestAudio
}: AudioManagerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  
  useEffect(() => {
    const loadFiles = async () => {
      // Пробуем загрузить из облака
      const cloudFiles = await cloudAudioStorage.getAllFiles();
      console.log('☁️ Файлов в облаке:', Object.keys(cloudFiles).length);
      
      if (Object.keys(cloudFiles).length > 0) {
        setUploadedFiles(cloudFiles);
      } else {
        // Если в облаке пусто - загружаем локально
        const files = await audioStorage.getAllFiles();
        console.log('📂 Загружено локально:', Object.keys(files).length);
        if (Object.keys(files).length > 0) {
          setUploadedFiles(files);
        }
      }
    };
    
    loadFiles();
  }, [setUploadedFiles]);
  
  const handleFileUpload = async (fileKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Сохраняем локально и в облако
    const url = await audioStorage.saveFile(fileKey, file);
    await cloudAudioStorage.saveFile(fileKey, file);
    setUploadedFiles({ ...uploadedFiles, [fileKey]: url });
    console.log('✅ Загружен в облако:', fileKey);
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('🔥 handleBulkUpload вызван, файлов:', files?.length);
    if (!files || files.length === 0) {
      console.log('❌ Нет файлов');
      return;
    }

    setIsUploading(true);
    console.log(`📦 Массовая загрузка: ${files.length} файлов`);
    const newFiles: { [key: string]: string } = { ...uploadedFiles };
    let successCount = 0;
    let errorCount = 0;

    setUploadProgress({ current: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name.replace(/\.(mp3|wav|ogg|m4a|webm)$/i, '');
      
      console.log(`📁 Файл ${i+1}/${files.length}: "${file.name}" → ключ: "${fileName}"`);
      setUploadProgress({ current: i + 1, total: files.length });
      
      try {
        const url = await audioStorage.saveFile(fileName, file);
        await cloudAudioStorage.saveFile(fileName, file);
        newFiles[fileName] = url;
        successCount++;
        console.log(`✅ ${fileName}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Ошибка загрузки ${fileName}:`, error);
        if (error instanceof Error) {
          console.error(`❌ Детали: ${error.message}`, error.stack);
        }
      }
    }

    setUploadedFiles(newFiles);
    setIsUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    console.log(`✅ Загрузка завершена: ${successCount} файлов, ошибок: ${errorCount}`);
    alert(`Загружено: ${successCount} файлов${errorCount > 0 ? `\nОшибок: ${errorCount}` : ''}`);
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

    // Параллельная загрузка пачками по 100 файлов
    const BATCH_SIZE = 100;
    const fileArray = Array.from(files);
    
    for (let batchStart = 0; batchStart < fileArray.length; batchStart += BATCH_SIZE) {
      const batch = fileArray.slice(batchStart, batchStart + BATCH_SIZE);
      
      const uploadPromises = batch.map(async (file) => {
        const fileName = file.name.replace('.mp3', '').replace('.wav', '').replace('.ogg', '');
        
        // Преобразуем "123" в "cell-123"
        let cellKey = fileName;
        if (!fileName.startsWith('cell-')) {
          const cellNumber = parseInt(fileName, 10);
          if (!isNaN(cellNumber) && cellNumber >= 1 && cellNumber <= 482) {
            cellKey = `cell-${cellNumber}`;
          } else {
            return { success: false, key: fileName };
          }
        }
        
        try {
          const url = await audioStorage.saveFile(cellKey, file);
          return { success: true, key: cellKey, url };
        } catch (error) {
          console.error(`❌ ${cellKey}:`, error);
          return { success: false, key: cellKey };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      // Обновляем результаты
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Volume2" className="w-5 h-5" />
          Загрузка аудиофайлов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="text-sm text-blue-900">
            <strong>Важно:</strong> Загрузите файлы с ТОЧНЫМИ названиями как указано ниже
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleBulkUpload}
                className="hidden"
                id="bulk-upload"
                disabled={isUploading}
              />
              <Button
                variant="default"
                className="gap-2"
                disabled={isUploading}
                onClick={() => document.getElementById('bulk-upload')?.click()}
              >
                <Icon name="Upload" className="w-4 h-4" />
                {isUploading ? 'Загрузка...' : 'Массовая загрузка файлов'}
              </Button>
              <div className="text-xs text-gray-600 flex items-center">
                Можно загружать файлы с именами: goods.mp3, 1.mp3, 2.mp3, 3.mp3 или cell_1.mp3, cell_2.mp3
              </div>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Загрузка файлов...</span>
                  <span>{uploadProgress.current} / {uploadProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Основные файлы</h3>
          {BASIC_FILES.map((file) => (
            <div key={file.key} className="border rounded-lg p-3 space-y-2">
              <Label className="text-sm font-medium">{file.label}</Label>
              
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(file.key, e)}
                  className="flex-1"
                />
                {uploadedFiles[file.key] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTestAudio(file.testKey)}
                  >
                    <Icon name="Play" className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {uploadedFiles[file.key] && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Icon name="CheckCircle" className="w-3 h-3" />
                  <span>Файл загружен</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Озвучки ячеек (1-482)</h3>
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
                  Загружено: {CELL_FILES.filter(f => uploadedFiles[f.key]).length} из {CELL_FILES.length}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              💡 Файлы можно называть просто: 1.mp3, 2.mp3, 3.mp3, ..., 482.mp3
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2 border rounded-lg">
            {CELL_FILES.map((file) => {
              const cellNum = file.key.replace('cell_', '');
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
      </CardContent>
    </Card>
  );
};