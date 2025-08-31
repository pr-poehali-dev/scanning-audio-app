import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ProcessSectionProps {
  type: 'delivery' | 'receiving' | 'return';
  title: string;
  iconName: string;
  iconColor: string;
  files: File[];
  uploading: string | null;
  onFolderUpload: (type: 'delivery' | 'receiving' | 'return', event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSection: (type: 'delivery' | 'receiving' | 'return') => void;
  showRecommendations?: boolean;
}

export const ProcessSectionComponent = ({
  type,
  title,
  iconName,
  iconColor,
  files,
  uploading,
  onFolderUpload,
  onClearSection,
  showRecommendations = false
}: ProcessSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={iconName as any} size={18} className={iconColor} />
          <span className="font-medium">{title}</span>
          <Badge variant="secondary">{files.length} файлов</Badge>
        </div>
        {files.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClearSection(type)}
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
        onChange={(e) => onFolderUpload(type, e)}
        className="hidden"
      />
      
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading === type}
        className="w-full"
      >
        {uploading === type ? (
          <>
            <Icon name="Loader2" size={16} className="animate-spin mr-2" />
            Загрузка...
          </>
        ) : (
          <>
            <Icon name="FolderOpen" size={16} className="mr-2" />
            Выбрать папку для {type === 'delivery' ? 'выдачи' : type === 'receiving' ? 'приемки' : 'возврата'}
          </>
        )}
      </Button>
      
      {showRecommendations && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800 font-medium mb-2">💡 Рекомендуемые файлы для приемки:</p>
          <div className="text-xs text-blue-700 space-y-1">
            <div><strong>Действия:</strong> "коробка-принята.mp3", "отсканируйте-еще-раз.mp3", "продолжайте-приемку.mp3"</div>
            <div><strong>Статусы:</strong> "товар-для-пвз.mp3", "отсканируйте-следующий-товар.mp3", "приоритетный-заказ.mp3"</div>
            <div><strong>Проверки:</strong> "повтор-товар-уже-принят.mp3", "коробка-отсканирована.mp3"</div>
            <div><strong>Ячейки:</strong> "1.mp3", "2.mp3", "3.mp3" ... "482.mp3" (номера ячеек)</div>
          </div>
        </div>
      )}
    </div>
  );
};