import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { audioStorage } from '@/utils/audioStorage';
import { cloudAudioStorage } from '@/utils/cloudAudioStorage';

interface CloudSyncPanelProps {
  isUploading: boolean;
  uploadProgress: { current: number; total: number };
  uploadedFiles: { [key: string]: string };
  setUploadedFiles: (files: { [key: string]: string }) => void;
  setIsUploading: (value: boolean) => void;
  setUploadProgress: (value: { current: number; total: number }) => void;
}

export const CloudSyncPanel = ({
  isUploading,
  uploadProgress,
  uploadedFiles,
  setUploadedFiles,
  setIsUploading,
  setUploadProgress
}: CloudSyncPanelProps) => {
  const [showUserId, setShowUserId] = useState(false);
  const [userId] = useState(() => localStorage.getItem('audio-user-id') || '');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSetUserId = () => {
    const newId = prompt('Введите User ID с другого устройства:', '');
    if (newId && newId.trim()) {
      localStorage.setItem('audio-user-id', newId.trim());
      window.location.reload();
    }
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
        try {
          await cloudAudioStorage.saveFile(fileName, file);
          console.log(`☁️ Загружен в облако: ${fileName}`);
        } catch (cloudError) {
          console.warn(`⚠️ Облако недоступно для ${fileName}, сохранено локально`);
        }
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

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <div className="text-sm text-blue-900">
        <strong>Важно:</strong> Загрузите файлы с ТОЧНЫМИ названиями как указано ниже
      </div>
      
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-3 space-y-2">
          <div className="flex items-start gap-2 text-sm text-green-800">
            <Icon name="Cloud" className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>☁️ Облачное хранилище активно!</strong>
              <p className="text-xs mt-1">Все файлы автоматически сохраняются в облако и синхронизируются между всеми вашими устройствами</p>
            </div>
          </div>
          
          <div className="border-t border-green-200 pt-2 space-y-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowUserId(!showUserId)}
                className="text-xs"
              >
                <Icon name="Key" className="w-3 h-3 mr-1" />
                {showUserId ? 'Скрыть ID' : 'Показать User ID'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleSetUserId}
                className="text-xs"
              >
                <Icon name="Download" className="w-3 h-3 mr-1" />
                Вставить ID
              </Button>
            </div>
            
            {showUserId && (
              <div className="bg-white rounded p-2 space-y-1">
                <div className="text-xs text-gray-600">
                  Ваш User ID (скопируйте его на другое устройство):
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded break-all">
                    {userId}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyUserId}
                    className="flex-shrink-0"
                  >
                    <Icon name={copySuccess ? "Check" : "Copy"} className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  💡 Откройте сайт на другом устройстве и нажмите "Вставить ID", чтобы использовать те же аудиофайлы
                </div>
              </div>
            )}
          </div>
        </div>
        
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
  );
};
