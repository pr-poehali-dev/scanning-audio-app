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
  const [folderUploadProgress, setFolderUploadProgress] = useState(0);
  const [isFolderUploading, setIsFolderUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [matchingResults, setMatchingResults] = useState<{matched: number, total: number}>({matched: 0, total: 0});

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

  const handleFolderUpload = () => {
    folderInputRef.current?.click();
  };

  // Улучшенный алгоритм сопоставления файлов
  const matchAudioFileByName = (fileName: string): AudioFile | null => {
    const cleanFileName = fileName.toLowerCase().replace(/\.(mp3|wav|ogg|m4a|aac)$/, '');
    
    // Прямое совпадение по ключу
    let match = audioFiles.find(item => item.key.toLowerCase() === cleanFileName);
    if (match) return match;
    
    // Поиск по содержанию ключевых слов
    const keywordMatches: {[key: string]: string[]} = {
      'tab-delivery': ['выдача', 'delivery', 'выдать', 'доставка'],
      'tab-receiving': ['приемка', 'receiving', 'прием', 'получение'],
      'tab-return': ['возврат', 'return', 'вернуть'],
      'scan-discount-check': ['скидка', 'discount', 'check', 'проверка'],
      'check-product-camera': ['камера', 'camera', 'товар', 'product'],
      'product-to-fitting': ['примерка', 'fitting', 'примерить'],
      'product-issued-rate': ['выдан', 'issued', 'оценка', 'rate'],
      'receiving-start': ['начало', 'start', 'приемка'],
      'receiving-complete': ['завершена', 'complete', 'готово'],
      'return-start': ['возврат', 'return', 'начало'],
      'return-complete': ['возврат', 'return', 'завершен'],
      'input-focus': ['ввод', 'input', 'фокус', 'focus'],
      'button-click': ['кнопка', 'button', 'click', 'нажатие']
    };
    
    // Поиск по ключевым словам
    for (const [key, keywords] of Object.entries(keywordMatches)) {
      if (keywords.some(keyword => cleanFileName.includes(keyword))) {
        match = audioFiles.find(item => item.key === key);
        if (match) return match;
      }
    }
    
    return null;
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

      // Используем улучшенный алгоритм сопоставления
      const matchingAudioFile = matchAudioFileByName(file.name);

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
      setMatchingResults({matched: Object.keys(updatedFiles).length, total: totalFiles});
      onAudioFilesUpdate(updatedFiles);
    }, 500);
  };

  // Обработка загрузки папки
  const handleFolderFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsFolderUploading(true);
    setFolderUploadProgress(0);

    const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
    const totalFiles = audioFiles.length;
    let processedFiles = 0;
    const updatedFiles: { [key: string]: string } = {};

    if (totalFiles === 0) {
      alert('В выбранной папке не найдено аудиофайлов');
      setIsFolderUploading(false);
      return;
    }

    audioFiles.forEach((file) => {
      const matchingAudioFile = matchAudioFileByName(file.name);

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
      setFolderUploadProgress((processedFiles / totalFiles) * 100);
    });

    setTimeout(() => {
      setIsFolderUploading(false);
      setFolderUploadProgress(0);
      setMatchingResults({matched: Object.keys(updatedFiles).length, total: totalFiles});
      onAudioFilesUpdate(updatedFiles);
      
      // Показываем результат сопоставления
      if (Object.keys(updatedFiles).length > 0) {
        alert(`Успешно загружено ${Object.keys(updatedFiles).length} из ${totalFiles} файлов из папки`);
      } else {
        alert('Не удалось сопоставить файлы из папки с известными командами озвучки');
      }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Файлы */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Icon name="FileAudio" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Выбрать файлы</h3>
            <p className="text-gray-600 mb-4">
              Загрузите несколько аудиофайлов
            </p>
            <Button onClick={handleBulkUpload} disabled={isUploading || isFolderUploading}>
              {isUploading ? 'Загружаю файлы...' : 'Выбрать файлы'}
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
                <div className="text-sm text-gray-500 mt-2">Загружаю файлы...</div>
              </div>
            )}
          </div>

          {/* Папка */}
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center bg-purple-50">
            <Icon name="FolderOpen" className="mx-auto h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-lg font-medium mb-2 text-purple-800">Загрузить папку</h3>
            <p className="text-purple-600 mb-4">
              Выберите папку с аудиофайлами для автоматического распознавания
            </p>
            <Button 
              onClick={handleFolderUpload} 
              disabled={isUploading || isFolderUploading}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {isFolderUploading ? 'Загружаю папку...' : 'Выбрать папку'}
            </Button>
            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              multiple
              accept="audio/*"
              onChange={handleFolderFiles}
              className="hidden"
            />
            {isFolderUploading && (
              <div className="mt-4">
                <Progress value={folderUploadProgress} className="bg-purple-100" />
                <div className="text-sm text-purple-600 mt-2">Обрабатываю папку...</div>
              </div>
            )}
          </div>
        </div>

        {/* Результаты сопоставления */}
        {matchingResults.total > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Info" className="text-blue-600 w-5 h-5" />
              <h4 className="font-medium text-blue-900">Результат загрузки</h4>
            </div>
            <p className="text-blue-700 text-sm">
              Успешно сопоставлено {matchingResults.matched} из {matchingResults.total} файлов с командами озвучки.
            </p>
            {matchingResults.matched < matchingResults.total && (
              <p className="text-orange-600 text-sm mt-1">
                {matchingResults.total - matchingResults.matched} файлов не удалось сопоставить. 
                Проверьте имена файлов или загрузите их вручную.
              </p>
            )}
          </div>
        )}

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

        {/* Правила именования файлов */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-3">Правила именования файлов для автоматического распознавания</h4>
          <div className="text-yellow-800 text-sm space-y-2">
            <div><strong>Навигация:</strong> delivery, receiving, return, выдача, приемка, возврат</div>
            <div><strong>Действия:</strong> scan, camera, fitting, issued, start, complete</div>
            <div><strong>Ключевые слова:</strong> скидка, товар, примерка, кнопка, ввод, фокус</div>
            <div className="mt-2 text-xs">
              <em>Примеры: "выдача.mp3", "scan-discount.wav", "товар-на-примерку.mp3"</em>
            </div>
          </div>
        </div>

        {/* Audio Format Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Поддерживаемые форматы</h4>
          <p className="text-blue-700 text-sm">
            MP3, WAV, OGG, M4A, AAC. Рекомендуемое качество: 44.1kHz, битрейт 128-320 kbps.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};