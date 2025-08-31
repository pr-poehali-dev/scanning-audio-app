import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AudioSettingsFooterProps {
  totalFiles: number;
  onClose: () => void;
  onSave: () => void;
}

export const AudioSettingsFooter = ({ totalFiles, onClose, onSave }: AudioSettingsFooterProps) => {
  const handleProtectedCheck = () => {
    const protected_files = localStorage.getItem('wb-pvz-cell-audio-settings-permanent');
    const lock = localStorage.getItem('wb-pvz-cell-audio-lock');
    console.log('🔍 ПРОВЕРКА ЗАЩИЩЕННОГО ХРАНИЛИЩА:');
    console.log('🔒 Заблокировано:', lock);
    if (protected_files) {
      const files = JSON.parse(protected_files);
      console.log('🔒 Защищенные файлы:', Object.keys(files));
      console.log('🔒 Всего:', Object.keys(files).length, 'файлов');
      alert(`Защищенных файлов: ${Object.keys(files).length}\nСписок в консоли`);
    } else {
      console.log('❌ Нет защищенных файлов');
      alert('Защищенные файлы не найдены');
    }
  };

  return (
    <div className="p-6 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Icon name="FileAudio" size={16} />
          <span>Всего загружено: <strong>{totalFiles} файлов</strong></span>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleProtectedCheck}
            size="sm"
          >
            🔍 Проверить защищенные
          </Button>
          
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onSave}>
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить настройки
          </Button>
        </div>
      </div>
    </div>
  );
};