import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { DropZone } from '../DropZone';

interface AudioFile {
  key: string;
  name: string;
  uploaded: boolean;
  url?: string;
}

interface FolderUploadSectionProps {
  audioFiles: AudioFile[];
  isUploading: boolean;
  uploadProgress: number;
  onFolderFiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFolderUpload: () => void;
}

export const FolderUploadSection = ({ 
  audioFiles, 
  isUploading, 
  uploadProgress, 
  onFolderFiles, 
  onFolderUpload 
}: FolderUploadSectionProps) => {
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFolderUpload = () => {
    folderInputRef.current?.click();
  };

  return (
    <>
      {/* Загрузка папки с drag&drop */}
      <DropZone onFolderDrop={onFolderFiles} isUploading={isUploading} uploadProgress={uploadProgress} />

      {/* Скрытый input для выбора папки */}
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        multiple
        accept="audio/*"
        onChange={onFolderFiles}
        className="hidden"
      />

      {/* Инструкция */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-3">Правила именования файлов</h4>
        <div className="text-yellow-800 text-sm space-y-2">
          <div><strong>Примеры:</strong> "ячейка.mp3", "скидка.wav", "камера.mp3", "оцените.mp3"</div>
          <div><strong>Форматы:</strong> MP3, WAV, OGG, M4A, AAC</div>
          <div><strong>Сохранение:</strong> Файлы сохраняются в браузере и остаются доступными после перезагрузки</div>
        </div>
      </div>
    </>
  );
};