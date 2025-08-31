import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface CellsSectionProps {
  files: File[];
  uploading: string | null;
  onFolderUpload: (type: 'cells', event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSection: (type: 'cells') => void;
}

export const CellsSectionComponent = ({
  files,
  uploading,
  onFolderUpload,
  onClearSection
}: CellsSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg flex items-center gap-2">
        <Icon name="Grid3X3" size={20} className="text-purple-600" />
        Озвучка ячеек
      </h3>

      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={18} className="text-purple-600" />
            <span className="font-medium">Номера ячеек</span>
            <Badge variant="secondary">{files.length} файлов</Badge>
          </div>
          {files.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClearSection('cells')}
              className="text-red-500 hover:text-red-700"
            >
              <Icon name="Trash2" size={16} />
            </Button>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          webkitdirectory="true"
          directory=""
          accept="audio/*"
          onChange={(e) => onFolderUpload('cells', e)}
          className="hidden"
        />
        
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading === 'cells'}
          className="w-full"
        >
          {uploading === 'cells' ? (
            <>
              <Icon name="Loader2" size={16} className="animate-spin mr-2" />
              Загрузка...
            </>
          ) : (
            <>
              <Icon name="FolderOpen" size={16} className="mr-2" />
              Выбрать папку с номерами ячеек
            </>
          )}
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Как работает озвучка ячеек:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Назовите файлы по номеру ячейки: <code>A1.mp3</code>, <code>B15.wav</code></li>
              <li>• При показе товара в ячейке A1 проиграется файл A1.mp3</li>
              <li>• Поддерживаются форматы: MP3, WAV, OGG, M4A, AAC, FLAC</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};