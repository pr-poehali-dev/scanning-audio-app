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
  onAudioFilesUpdate: (files: { [key: string]: string }) => Promise<void>;
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
  const [cellUploadProgress, setCellUploadProgress] = useState(0);
  const [isCellUploading, setIsCellUploading] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const cellFolderInputRef = useRef<HTMLInputElement>(null);

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

    setTimeout(async () => {
      setIsUploading(false);
      setUploadProgress(0);
      
      try {
        await onAudioFilesUpdate(updatedFiles);
        console.log('Сохранено файлов:', updatedFiles);
        
        // Проверяем что действительно сохранилось
        const saved = localStorage.getItem('wb-audio-files');
        console.log('В localStorage:', saved);
        
        const matchedCount = Object.keys(updatedFiles).length;
        alert(`✅ Успешно загружено ${matchedCount} из ${totalFiles} файлов\n\n💾 Файлы конвертированы в base64 и ПОСТОЯННО сохранены!`);
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
        alert('❌ Ошибка при сохранении файлов. Проверьте консоль.');
      }
    }, 500);
  };

  const handleCellFolderUpload = () => {
    cellFolderInputRef.current?.click();
  };

  const handleCellFolderFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsCellUploading(true);
    setCellUploadProgress(0);

    const audioFilesList = Array.from(files).filter(file => file.type.startsWith('audio/'));
    const totalFiles = audioFilesList.length;
    let processedFiles = 0;
    const updatedFiles: { [key: string]: string } = {};

    if (totalFiles === 0) {
      alert('В папке с ячейками не найдено аудиофайлов');
      setIsCellUploading(false);
      return;
    }

    // Создаем объект для хранения озвучки ячеек по номерам
    const cellAudios: { [key: string]: string } = {};

    audioFilesList.forEach((file) => {
      // Извлекаем номер ячейки из названия файла
      const fileName = file.name.toLowerCase().replace(/\.(mp3|wav|ogg|m4a|aac)$/, '');
      const cellNumber = fileName.match(/\d+/)?.[0]; // Ищем первое число в названии
      
      if (cellNumber) {
        const url = URL.createObjectURL(file);
        cellAudios[cellNumber] = url;
      }

      processedFiles++;
      setCellUploadProgress((processedFiles / totalFiles) * 100);
    });

    setTimeout(async () => {
      setIsCellUploading(false);
      setCellUploadProgress(0);
      
      // Конвертируем ячейки в правильный формат для основной системы аудио
      const cellFilesForMainSystem: { [key: string]: string } = {};
      
      Object.entries(cellAudios).forEach(([cellNumber, url]) => {
        // Добавляем все варианты ключей для ячеек
        cellFilesForMainSystem[cellNumber] = url; // Просто номер: "12"
        cellFilesForMainSystem[`cell-${cellNumber}`] = url; // С префиксом: "cell-12"  
        cellFilesForMainSystem[`ячейка-${cellNumber}`] = url; // Русский префикс: "ячейка-12"
      });
      
      try {
        // Сохраняем в основную систему аудио
        await onAudioFilesUpdate(cellFilesForMainSystem);
        
        // Также сохраняем отдельно для обратной совместимости
        localStorage.setItem('cellAudios', JSON.stringify(cellAudios));
        
        const cellCount = Object.keys(cellAudios).length;
        alert(`✅ Успешно загружено озвучки для ${cellCount} ячеек\n\n💾 Файлы интегрированы в основную систему аудио и ПОСТОЯННО сохранены!`);
      } catch (error) {
        console.error('Ошибка при сохранении ячеек:', error);
        alert('❌ Ошибка при сохранении ячеек. Проверьте консоль.');
      }
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
  
  // Получаем информацию о загруженных ячейках
  const cellAudios = JSON.parse(localStorage.getItem('cellAudios') || '{}');
  const cellCount = Object.keys(cellAudios).length;

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
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                Загружено файлов: {uploadedCount} из {audioFiles.length}
              </div>
              {cellCount > 0 && (
                <div className="text-sm text-blue-600">
                  📱 Ячейки: {cellCount} шт.
                </div>
              )}
            </div>
            {(uploadedCount > 0 || cellCount > 0) && (
              <div className="flex gap-2">
                {cellCount > 0 && (
                  <Button 
                    onClick={() => {
                      if (confirm('Удалить все озвучки ячеек?')) {
                        localStorage.removeItem('cellAudios');
                        window.location.reload();
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Icon name="Hash" className="w-4 h-4 mr-1" />
                    Очистить ячейки
                  </Button>
                )}
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
            )}
          </div>

          {/* Загрузка папки с drag&drop */}
          <DropZone onFolderDrop={handleFolderFiles} isUploading={isUploading} uploadProgress={uploadProgress} />

          {/* Загрузка папки с ячейками */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
            <Icon name="Hash" className="mx-auto h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-lg font-medium mb-2 text-blue-800">Папка с озвучкой ячеек</h3>
            <p className="text-blue-600 mb-4">
              Загрузите отдельную папку с озвучкой номеров ячеек.
              Файлы должны содержать номера ячеек в названии (например: "1.mp3", "ячейка-15.wav", "cell_42.mp3")
            </p>
            <Button 
              onClick={handleCellFolderUpload} 
              disabled={isCellUploading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isCellUploading ? 'Загружаю ячейки...' : 'Выбрать папку с ячейками'}
            </Button>
            {isCellUploading && (
              <div className="mt-4">
                <Progress value={cellUploadProgress} className="bg-blue-100" />
                <div className="text-sm text-blue-600 mt-2">Обрабатываю ячейки...</div>
              </div>
            )}
          </div>

          {/* Скрытые inputs для выбора папок */}
          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory=""
            multiple
            accept="audio/*"
            onChange={handleFolderFiles}
            className="hidden"
          />
          <input
            ref={cellFolderInputRef}
            type="file"
            webkitdirectory=""
            multiple
            accept="audio/*"
            onChange={handleCellFolderFiles}
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
            <p className="text-blue-700 text-sm mb-3">
              Загруженные аудиофайлы автоматически сохраняются в браузере и будут работать 
              даже после закрытия и повторного открытия приложения.
            </p>
            
            {/* Диагностика */}
            <div className="border-t border-blue-200 pt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const storage1 = localStorage.getItem('wb-audio-files');
                  const storage2 = localStorage.getItem('cellAudios');
                  const info = `
🔍 ДИАГНОСТИКА СОХРАНЕНИЯ:

📁 Основные файлы: ${storage1 ? 'найдены' : 'НЕ НАЙДЕНЫ'}
📱 Ячейки: ${storage2 ? 'найдены' : 'НЕ НАЙДЕНЫ'}

💾 Размер localStorage: ${((JSON.stringify(localStorage).length * 2) / 1024 / 1024).toFixed(2)} МБ

🌐 Браузер: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Другой'}
🔒 Приватный режим: ${!window.indexedDB ? 'ДА (может блокировать сохранение)' : 'НЕТ'}

📊 Детали:
- Основные: ${storage1 ? Object.keys(JSON.parse(storage1)).length + ' файлов' : '0 файлов'}  
- Ячейки: ${storage2 ? Object.keys(JSON.parse(storage2)).length + ' ячеек' : '0 ячеек'}
                  `.trim();
                  alert(info);
                }}
                className="text-xs"
              >
                <Icon name="Search" className="w-3 h-3 mr-1" />
                Диагностика
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};