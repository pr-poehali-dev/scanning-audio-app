import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { DropZone } from './DropZone';

interface AudioFile {
  key: string;
  name: string;
  uploaded: boolean;
  url?: string;
}

interface AudioUploaderProps {
  onAudioFilesUpdate: (files: { [key: string]: string }) => void;
  onClose: () => void;
  removeAudioFile: (key: string) => void;
  clearAllAudio: () => void;
  existingFiles: { [key: string]: string };
}

export const AudioUploader = ({ 
  onAudioFilesUpdate, 
  onClose, 
  removeAudioFile,
  clearAllAudio,
  existingFiles 
}: AudioUploaderProps) => {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([
    { key: 'cell-number', name: 'Ячейка номер', uploaded: false },
    { key: 'check-discount-wallet', name: 'Товары со скидкой проверьте ВБ кошелек', uploaded: false },
    { key: 'check-product-camera', name: 'Проверьте товар под камерой', uploaded: false },
    { key: 'rate-pickup-point', name: 'Оцените пункт выдачи', uploaded: false },
    { key: 'receiving-start', name: 'Начало приемки', uploaded: false },
    { key: 'receiving-complete', name: 'Приемка завершена', uploaded: false },
    { key: 'return-start', name: 'Начало возврата', uploaded: false },
    { key: 'return-complete', name: 'Возврат завершен', uploaded: false },
  ]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Обновляем состояние при загрузке существующих файлов
  useEffect(() => {
    setAudioFiles(prev => prev.map(item => ({
      ...item,
      uploaded: !!existingFiles[item.key],
      url: existingFiles[item.key]
    })));
  }, [existingFiles]);

  const matchAudioFileByName = (fileName: string): AudioFile | null => {
    const cleanFileName = fileName.toLowerCase().replace(/\.(mp3|wav|ogg|m4a|aac)$/, '');
    
    // Прямое совпадение
    let match = audioFiles.find(item => item.key.toLowerCase() === cleanFileName);
    if (match) return match;
    
    // Поиск по ключевым словам
    const keywordMatches: {[key: string]: string[]} = {
      'cell-number': ['ячейка', 'cell', 'номер', 'number'],
      'check-discount-wallet': ['скидка', 'discount', 'кошелек', 'wallet', 'вб'],
      'check-product-camera': ['камера', 'camera', 'товар', 'product', 'проверьте'],
      'rate-pickup-point': ['оцените', 'rate', 'пункт', 'pickup', 'выдачи'],
      'receiving-start': ['приемка', 'receiving', 'начало', 'start'],
      'receiving-complete': ['приемка', 'receiving', 'завершена', 'complete'],
      'return-start': ['возврат', 'return', 'начало', 'start'],
      'return-complete': ['возврат', 'return', 'завершен', 'complete']
    };
    
    for (const [key, keywords] of Object.entries(keywordMatches)) {
      if (keywords.some(keyword => cleanFileName.includes(keyword))) {
        match = audioFiles.find(item => item.key === key);
        if (match) return match;
      }
    }
    
    return null;
  };

  const handleFolderUpload = () => {
    folderInputRef.current?.click();
  };

  const handleFolderFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    setUploadProgress(0);

    const audioFilesList = Array.from(files).filter(file => file.type.startsWith('audio/'));
    const totalFiles = audioFilesList.length;
    let processedFiles = 0;
    const updatedFiles: { [key: string]: string } = {};

    if (totalFiles === 0) {
      alert('В выбранной папке не найдено аудиофайлов');
      setIsUploading(false);
      return;
    }

    audioFilesList.forEach((file) => {
      const matchingAudioFile = matchAudioFileByName(file.name);

      if (matchingAudioFile) {
        const url = URL.createObjectURL(file);
        updatedFiles[matchingAudioFile.key] = url;

        setAudioFiles(prev => prev.map(item => 
          item.key === matchingAudioFile.key
            ? { ...item, uploaded: true, url }
            : item
        ));
      }

      processedFiles++;
      setUploadProgress((processedFiles / totalFiles) * 100);
    });

    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      onAudioFilesUpdate(updatedFiles);
      
      const matchedCount = Object.keys(updatedFiles).length;
      alert(`Успешно загружено ${matchedCount} из ${totalFiles} файлов из папки`);
    }, 500);
  };

  const handleRemoveFile = (key: string) => {
    setAudioFiles(prev => prev.map(item => 
      item.key === key 
        ? { ...item, uploaded: false, url: undefined }
        : item
    ));
    removeAudioFile(key);
  };

  const handleClearAll = () => {
    if (confirm('Вы уверены, что хотите удалить все аудиофайлы?')) {
      setAudioFiles(prev => prev.map(item => ({
        ...item,
        uploaded: false,
        url: undefined
      })));
      clearAllAudio();
    }
  };

  const uploadedCount = audioFiles.filter(item => item.uploaded).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Volume2" />
            Настройка озвучки
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Загружено файлов: {uploadedCount} из {audioFiles.length}
            </div>
            {uploadedCount > 0 && (
              <Button 
                onClick={handleClearAll}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Icon name="Trash" className="w-4 h-4 mr-1" />
                Очистить все
              </Button>
            )}
          </div>

          {/* Загрузка папки с drag&drop */}
          <DropZone onFolderDrop={handleFolderFiles} isUploading={isUploading} uploadProgress={uploadProgress} />

          {/* Скрытый input для выбора папки */}
          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory=""
            multiple
            accept="audio/*"
            onChange={handleFolderFiles}
            className="hidden"
          />

          {/* Список файлов */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Список аудиофайлов</h3>
            <div className="grid gap-3">
              {audioFiles.map((audioFile) => (
                <div key={audioFile.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      audioFile.uploaded ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <div className="font-medium">{audioFile.name}</div>
                      <div className="text-sm text-gray-500">{audioFile.key}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {audioFile.uploaded && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (audioFile.url) {
                              const audio = new Audio(audioFile.url);
                              audio.play().catch(console.error);
                            }
                          }}
                        >
                          <Icon name="Play" className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFile(audioFile.key)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Icon name="Trash" className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Инструкция */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-3">Правила именования файлов</h4>
            <div className="text-yellow-800 text-sm space-y-2">
              <div><strong>Примеры:</strong> "ячейка.mp3", "скидка.wav", "камера.mp3", "оцените.mp3"</div>
              <div><strong>Форматы:</strong> MP3, WAV, OGG, M4A, AAC</div>
              <div><strong>Сохранение:</strong> Файлы сохраняются в браузере и остаются доступными после перезагрузки</div>
            </div>
          </div>

          {/* Информация о хранении */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💾 Автоматическое сохранение</h4>
            <p className="text-blue-700 text-sm">
              Загруженные аудиофайлы автоматически сохраняются в браузере и будут работать 
              даже после закрытия и повторного открытия приложения.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};