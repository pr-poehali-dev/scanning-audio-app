import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { AudioFileList } from './audio/AudioFileList';
import { FolderUploadSection } from './audio/FolderUploadSection';
import { CellAudioSection } from './audio/CellAudioSection';
import { AudioDiagnostics } from './audio/AudioDiagnostics';

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

  const handleFolderFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Конвертируем файлы в base64 асинхронно
    for (const file of audioFilesList) {
      const matchingAudioFile = matchAudioFileByName(file.name);

      if (matchingAudioFile) {
        try {
          // Конвертируем файл в base64 для постоянного хранения
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          updatedFiles[matchingAudioFile.key] = base64;

          setAudioFiles(prev => prev.map(item => 
            item.key === matchingAudioFile.key
              ? { ...item, uploaded: true, url: base64 }
              : item
          ));
        } catch (error) {
          console.error('Ошибка конвертации файла:', file.name, error);
        }
      }

      processedFiles++;
      setUploadProgress((processedFiles / totalFiles) * 100);
    }

    setTimeout(async () => {
      setIsUploading(false);
      setUploadProgress(0);
      
      try {
        await onAudioFilesUpdate(updatedFiles);
        console.log('🔊 ФАЙЛЫ КОНВЕРТИРОВАНЫ В BASE64 И СОХРАНЕНЫ:', updatedFiles);
        
        // Проверяем что действительно сохранилось
        const saved = localStorage.getItem('wb-audio-files');
        console.log('📁 В localStorage wb-audio-files:', saved ? 'НАЙДЕН' : 'НЕ НАЙДЕН');
        
        const matchedCount = Object.keys(updatedFiles).length;
        alert(`✅ Успешно загружено ${matchedCount} из ${totalFiles} файлов\n\n💾 Файлы конвертированы в base64 и ПОСТОЯННО сохранены!\n\n🔊 Теперь озвучка должна работать!`);
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
        alert('❌ Ошибка при сохранении файлов. Проверьте консоль.');
      }
    }, 500);
  };

  const handleCellFolderFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsCellUploading(true);
    setCellUploadProgress(0);

    const audioFilesList = Array.from(files).filter(file => file.type.startsWith('audio/'));
    const totalFiles = audioFilesList.length;
    let processedFiles = 0;

    if (totalFiles === 0) {
      alert('В папке с ячейками не найдено аудиофайлов');
      setIsCellUploading(false);
      return;
    }

    // Создаем объект для хранения озвучки ячеек по номерам
    const cellAudios: { [key: string]: string } = {};

    // Конвертируем файлы ячеек в base64 асинхронно
    for (const file of audioFilesList) {
      // Извлекаем номер ячейки из названия файла - УЛУЧШЕННАЯ ЛОГИКА
      const fileName = file.name.toLowerCase().replace(/\.(mp3|wav|ogg|m4a|aac)$/, '');
      
      // СТРОГАЯ ФИЛЬТРАЦИЯ: Ищем номер ячейки ТОЛЬКО по четким правилам
      let cellNumber = null;
      
      // 1. ТОЛЬКО если файл называется просто числом: "123.mp3" → "123"
      const exactNumber = fileName.match(/^(\d{1,4})$/);
      if (exactNumber) {
        cellNumber = exactNumber[1];
        console.log(`📱✅ ТОЧНОЕ совпадение: "${file.name}" → ячейка "${cellNumber}"`);
      }
      
      // 2. ТОЛЬКО с явными префиксами: "ячейка-123", "cell-456", "cell_789"  
      else {
        const cellPattern = fileName.match(/^(?:ячейка|cell)[-_]?(\d{1,4})$/);
        if (cellPattern) {
          cellNumber = cellPattern[1];
          console.log(`📱✅ С префиксом: "${file.name}" → ячейка "${cellNumber}"`);
        }
      }
      
      // 3. ВСЕ ОСТАЛЬНОЕ ИГНОРИРУЕМ (никаких произвольных чисел!)
      if (!cellNumber) {
        console.log(`📱❌ ПРОПУЩЕН файл "${file.name}" - не соответствует формату ячеек`);
      }
      
      // СТРОГАЯ ПРОВЕРКА: номер ячейки должен быть разумным (1-9999)
      if (cellNumber) {
        const num = parseInt(cellNumber);
        if (num < 1 || num > 9999) {
          console.log(`📱❌ ОТКЛОНЕН номер "${cellNumber}" - вне диапазона 1-9999`);
          cellNumber = null;
        }
      }
      
      if (cellNumber) {
        try {
          // Конвертируем файл в base64 для постоянного хранения
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          cellAudios[cellNumber] = base64;
        } catch (error) {
          console.error('Ошибка конвертации ячейки:', file.name, error);
        }
      }

      processedFiles++;
      setCellUploadProgress((processedFiles / totalFiles) * 100);
    }

    setTimeout(async () => {
      setIsCellUploading(false);
      setCellUploadProgress(0);
      
      // Конвертируем ячейки в правильный формат для основной системы аудио
      const cellFilesForMainSystem: { [key: string]: string } = {};
      
      Object.entries(cellAudios).forEach(([cellNumber, base64]) => {
        // Добавляем все варианты ключей для ячеек
        cellFilesForMainSystem[cellNumber] = base64; // Просто номер: "12"
        cellFilesForMainSystem[`cell-${cellNumber}`] = base64; // С префиксом: "cell-12"  
        cellFilesForMainSystem[`ячейка-${cellNumber}`] = base64; // Русский префикс: "ячейка-12"
      });
      
      try {
        // Сохраняем в основную систему аудио
        await onAudioFilesUpdate(cellFilesForMainSystem);
        
        // Также сохраняем отдельно для обратной совместимости
        localStorage.setItem('cellAudios', JSON.stringify(cellAudios));
        
        console.log('📱 ЯЧЕЙКИ КОНВЕРТИРОВАНЫ В BASE64 И СОХРАНЕНЫ:', cellAudios);
        
        const cellCount = Object.keys(cellAudios).length;
        alert(`✅ Успешно загружено озвучки для ${cellCount} ячеек\n\n💾 Файлы конвертированы в base64 и ПОСТОЯННО сохранены!\n\n🔊 Теперь озвучка ячеек должна работать!`);
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

  const handlePlayFile = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(console.error);
  };

  const handleClearCells = () => {
    if (confirm('Удалить все озвучки ячеек?')) {
      localStorage.removeItem('cellAudios');
      window.location.reload();
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

          <FolderUploadSection
            audioFiles={audioFiles}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onFolderFiles={handleFolderFiles}
            onFolderUpload={() => {}}
          />

          <CellAudioSection
            isCellUploading={isCellUploading}
            cellUploadProgress={cellUploadProgress}
            cellCount={cellCount}
            onCellFolderFiles={handleCellFolderFiles}
            onClearCells={handleClearCells}
          />

          <AudioFileList
            audioFiles={audioFiles}
            onPlayFile={handlePlayFile}
            onRemoveFile={handleRemoveFile}
          />

          <AudioDiagnostics />
        </CardContent>
      </Card>
    </div>
  );
};