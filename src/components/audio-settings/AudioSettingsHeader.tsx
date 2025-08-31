import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AudioSettingsHeaderProps {
  onClose: () => void;
}

export const AudioSettingsHeader = ({ onClose }: AudioSettingsHeaderProps) => {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="Settings" size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold">Настройки озвучки</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <Icon name="X" size={20} />
        </Button>
      </div>
      <p className="text-gray-600 mt-2">
        Загрузите папки с аудиофайлами для автоматической озвучки процессов
      </p>
    </div>
  );
};