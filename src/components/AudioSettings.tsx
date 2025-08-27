import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface AudioFile {
  key: string;
  name: string;
  file?: File;
  url?: string;
  uploaded: boolean;
}

interface AudioSettingsProps {
  onAudioFilesUpdate: (files: { [key: string]: string }) => void;
}

export const AudioSettings = ({ onAudioFilesUpdate }: AudioSettingsProps) => {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([
    { key: 'tab-delivery', name: 'Вкладка "Выдача"', uploaded: false },
    { key: 'tab-receiving', name: 'Вкладка "Приемка"', uploaded: false },
    { key: 'tab-return', name: 'Вкладка "Возврат"', uploaded: false },
    { key: 'scan-discount-check', name: 'Проверка товаров со скидкой', uploaded: false },
    { key: 'check-product-camera', name: 'Проверка товара под камерой', uploaded: false },
    { key: 'product-to-fitting', name: 'Товар на примерку', uploaded: false },
    { key: 'product-issued-rate', name: 'Товар выдан, оцените', uploaded: false },
    { key: 'receiving-start', name: 'Начало приемки', uploaded: false },
    { key: 'receiving-complete', name: 'Приемка завершена', uploaded: false },
    { key: 'return-start', name: 'Начало возврата', uploaded: false },
    { key: 'return-complete', name: 'Возврат завершен', uploaded: false },
    { key: 'input-focus', name: 'Фокус на поле ввода', uploaded: false },
    { key: 'button-click', name: 'Клик по кнопке', uploaded: false },
  ]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (key: string, file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Пожалуйста, выберите аудиофайл');
      return;
    }

    const url = URL.createObjectURL(file);
    
    setAudioFiles(prev => prev.map(item => 
      item.key === key 
        ? { ...item, file, url, uploaded: true }
        : item
    ));

    // Уведомляем родительский компонент о новом файле
    const updatedFiles: { [key: string]: string } = {};
    audioFiles.forEach(item => {
      if (item.key === key) {
        updatedFiles[key] = url;
      } else if (item.url) {
        updatedFiles[item.key] = item.url;
      }
    });
    onAudioFilesUpdate(updatedFiles);
  };

  const handleBulkUpload = () => {
    fileInputRef.current?.click();
  };

  const handleBulkFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    setUploadProgress(0);

    const totalFiles = files.length;
    let processedFiles = 0;
    const updatedFiles: { [key: string]: string } = {};

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('audio/')) {
        processedFiles++;
        setUploadProgress((processedFiles / totalFiles) * 100);
        return;
      }

      // Пытаемся определить ключ по имени файла
      const fileName = file.name.toLowerCase().replace(/\.(mp3|wav|ogg|m4a)$/, '');
      const matchingAudioFile = audioFiles.find(item => 
        item.key.toLowerCase() === fileName ||
        fileName.includes(item.key.toLowerCase()) ||
        item.key.toLowerCase().includes(fileName)
      );

      if (matchingAudioFile) {
        const url = URL.createObjectURL(file);
        updatedFiles[matchingAudioFile.key] = url;

        setAudioFiles(prev => prev.map(item => 
          item.key === matchingAudioFile.key
            ? { ...item, file, url, uploaded: true }
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
    }, 500);
  };

  const playTestAudio = (audioFile: AudioFile) => {
    if (audioFile.url) {
      const audio = new Audio(audioFile.url);
      audio.play().catch(console.error);
    }
  };

  const removeAudioFile = (key: string) => {
    setAudioFiles(prev => prev.map(item => 
      item.key === key 
        ? { ...item, file: undefined, url: undefined, uploaded: false }
        : item
    ));
  };

  const uploadedCount = audioFiles.filter(item => item.uploaded).length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Volume2" />
          Настройки озвучки
        </CardTitle>
        <div className="text-sm text-gray-600">
          Загружено файлов: {uploadedCount} из {audioFiles.length}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Bulk Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Icon name="Upload" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Загрузить аудиофайлы</h3>
          <p className="text-gray-600 mb-4">
            Выберите несколько аудиофайлов. Система автоматически определит их назначение по именам файлов.
          </p>
          <Button onClick={handleBulkUpload} disabled={isUploading}>
            {isUploading ? 'Загрузка...' : 'Выбрать файлы'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*"
            onChange={handleBulkFiles}
            className="hidden"
          />
          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} />
            </div>
          )}
        </div>

        {/* Individual Files */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Индивидуальные файлы</h3>
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
                  {audioFile.uploaded ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playTestAudio(audioFile)}
                      >
                        <Icon name="Play" className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeAudioFile(audioFile.key)}
                      >
                        <Icon name="Trash" className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <div>
                      <Label htmlFor={`file-${audioFile.key}`} className="cursor-pointer">
                        <Button size="sm" variant="outline" asChild>
                          <div>
                            <Icon name="Upload" className="w-4 h-4 mr-2" />
                            Загрузить
                          </div>
                        </Button>
                      </Label>
                      <Input
                        id={`file-${audioFile.key}`}
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(audioFile.key, file);
                        }}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Format Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Поддерживаемые форматы</h4>
          <p className="text-blue-700 text-sm">
            MP3, WAV, OGG, M4A. Рекомендуемое качество: 44.1kHz, битрейт 128-320 kbps.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};