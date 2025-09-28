import { useRef } from 'react';
import Icon from '@/components/ui/icon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioSettings: {
    speed: number;
    activeTab: string;
    phrases: any;
    enabled: any;
  };
  updateAudioSetting: (key: string, value: any) => void;
}

const SettingsModal = ({
  isOpen,
  onClose,
  audioSettings,
  updateAudioSetting
}: SettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Настройки</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Общие настройки */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Общие настройки</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Скорость работы
                  </label>
                  <select
                    value={audioSettings.speed}
                    onChange={(e) => updateAudioSetting('speed', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={0.5}>Медленно (0.5x)</option>
                    <option value={0.75}>Немного медленно (0.75x)</option>
                    <option value={1}>Нормально (1x)</option>
                    <option value={1.25}>Немного быстро (1.25x)</option>
                    <option value={1.5}>Быстро (1.5x)</option>
                    <option value={2}>Очень быстро (2x)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Активная вкладка по умолчанию
                  </label>
                  <select
                    value={audioSettings.activeTab}
                    onChange={(e) => updateAudioSetting('activeTab', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="delivery">Выдача</option>
                    <option value="acceptance">Приемка</option>
                    <option value="returns">Возврат</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Уведомления */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Уведомления</h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700">Звуковые уведомления</span>
                </label>
                
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700">Вибрация</span>
                </label>
                
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700">Push-уведомления</span>
                </label>
              </div>
            </div>

            {/* Интерфейс */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Интерфейс</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тема оформления
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="light">Светлая</option>
                    <option value="dark">Темная</option>
                    <option value="auto">Автоматическая</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Размер шрифта
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="small">Маленький</option>
                    <option value="medium">Средний</option>
                    <option value="large">Большой</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Безопасность */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Безопасность</h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Требовать PIN для входа</span>
                </label>
                
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700">Автоматический выход через 30 минут</span>
                </label>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;