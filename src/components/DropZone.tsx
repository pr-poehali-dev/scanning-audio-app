import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface DropZoneProps {
  onFolderDrop: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  uploadProgress: number;
}

export const DropZone = ({ onFolderDrop, isUploading, uploadProgress }: DropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const items = Array.from(e.dataTransfer.items);
    
    // Проверяем, есть ли папка среди перетаскиваемых элементов
    const folderItems = items.filter(item => 
      item.kind === 'file' && item.webkitGetAsEntry()?.isDirectory
    );

    if (folderItems.length > 0) {
      // Создаем искусственный event для совместимости с существующей функцией
      const files: File[] = [];
      
      const processEntry = (entry: FileSystemEntry) => {
        if (entry.isFile) {
          const fileEntry = entry as FileSystemFileEntry;
          fileEntry.file((file: File) => {
            if (file.type.startsWith('audio/')) {
              files.push(file);
            }
          });
        } else if (entry.isDirectory) {
          const dirEntry = entry as FileSystemDirectoryEntry;
          const reader = dirEntry.createReader();
          reader.readEntries((entries) => {
            entries.forEach(processEntry);
          });
        }
      };

      // Обрабатываем первую папку
      const firstFolder = folderItems[0].webkitGetAsEntry();
      if (firstFolder) {
        processEntry(firstFolder);
        
        // Даем время на обработку файлов, затем создаем event
        setTimeout(() => {
          const fileList = new DataTransfer();
          files.forEach(file => fileList.items.add(file));
          
          const syntheticEvent = {
            target: { files: fileList.files }
          } as React.ChangeEvent<HTMLInputElement>;
          
          onFolderDrop(syntheticEvent);
        }, 100);
      }
    } else {
      alert('Пожалуйста, перетащите папку с аудиофайлами');
    }
  };

  const handleButtonClick = () => {
    folderInputRef.current?.click();
  };

  return (
    <>
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-purple-500 bg-purple-100' 
            : 'border-purple-300 bg-purple-50'
        } ${isUploading ? 'opacity-50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Иконка папки */}
          <div className={`transition-transform duration-200 ${isDragOver ? 'scale-110' : ''}`}>
            <Icon 
              name="FolderOpen" 
              className={`h-16 w-16 ${isDragOver ? 'text-purple-600' : 'text-purple-400'}`} 
            />
          </div>

          {/* Заголовок */}
          <div className="space-y-2">
            <h3 className={`text-xl font-semibold ${isDragOver ? 'text-purple-700' : 'text-purple-800'}`}>
              {isDragOver ? '📁 Отпустите папку здесь' : '📁 Загрузка папки с озвучкой'}
            </h3>
            <p className="text-purple-600 max-w-md">
              Перетащите папку с аудиофайлами сюда или нажмите кнопку для выбора
            </p>
          </div>

          {/* Поддерживаемые форматы */}
          <div className="text-sm text-purple-500 bg-white px-4 py-2 rounded-full border border-purple-200">
            🎵 MP3 • WAV • OGG • M4A • AAC
          </div>

          {/* Кнопка выбора */}
          <Button 
            onClick={handleButtonClick}
            disabled={isUploading}
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-6 py-2"
            size="lg"
          >
            {isUploading ? (
              <>
                <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                Обрабатываю...
              </>
            ) : (
              <>
                <Icon name="Upload" className="w-4 h-4 mr-2" />
                Выбрать папку
              </>
            )}
          </Button>

          {/* Прогресс загрузки */}
          {isUploading && (
            <div className="w-full max-w-md space-y-2">
              <Progress value={uploadProgress} className="bg-purple-100" />
              <div className="text-sm text-purple-600">
                Обрабатываю файлы в папке... {Math.round(uploadProgress)}%
              </div>
            </div>
          )}

          {/* Подсказка */}
          <div className="text-xs text-purple-400 max-w-lg">
            💡 Файлы автоматически сохранятся в браузере. Названия файлов должны содержать 
            ключевые слова: "ячейка", "скидка", "камера", "оцените", "приемка", "возврат"
          </div>
        </div>
      </div>

      {/* Скрытый input для выбора папки */}
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        multiple
        accept="audio/*"
        onChange={onFolderDrop}
        className="hidden"
      />
    </>
  );
};