import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface CellAudioSectionProps {
  isCellUploading: boolean;
  cellUploadProgress: number;
  cellCount: number;
  onCellFolderFiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearCells: () => void;
}

export const CellAudioSection = ({ 
  isCellUploading, 
  cellUploadProgress, 
  cellCount,
  onCellFolderFiles,
  onClearCells 
}: CellAudioSectionProps) => {
  const cellFolderInputRef = useRef<HTMLInputElement>(null);

  const handleCellFolderUpload = () => {
    cellFolderInputRef.current?.click();
  };

  return (
    <>
      {/* Загрузка папки с ячейками */}
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
        <Icon name="Hash" className="mx-auto h-12 w-12 text-blue-400 mb-4" />
        <h3 className="text-lg font-medium mb-2 text-blue-800">Папка с озвучкой ячеек</h3>
        <p className="text-blue-600 mb-4">
          Загрузите отдельную папку с озвучкой номеров ячеек.
          Файлы должны содержать номера ячеек в названии (например: "1.mp3", "ячейка-15.wav", "cell_42.mp3")
        </p>
        <div className="flex justify-center gap-2">
          <Button 
            onClick={handleCellFolderUpload} 
            disabled={isCellUploading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isCellUploading ? 'Загружаю ячейки...' : 'Выбрать папку с ячейками'}
          </Button>
          {cellCount > 0 && (
            <Button 
              onClick={onClearCells}
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
            >
              <Icon name="Hash" className="w-4 h-4 mr-1" />
              Очистить ячейки
            </Button>
          )}
        </div>
        {isCellUploading && (
          <div className="mt-4">
            <Progress value={cellUploadProgress} className="bg-blue-100" />
            <div className="text-sm text-blue-600 mt-2">Обрабатываю ячейки...</div>
          </div>
        )}
      </div>

      {/* Скрытый input для выбора папки с ячейками */}
      <input
        ref={cellFolderInputRef}
        type="file"
        webkitdirectory=""
        multiple
        accept="audio/*"
        onChange={onCellFolderFiles}
        className="hidden"
      />
    </>
  );
};