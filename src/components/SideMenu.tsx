import Icon from '@/components/ui/icon';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsOpen: () => void;
  pvzInfo: {
    id: string;
    address: string;
    employeeId: string;
  };
  updatePvzInfo: (field: string, value: string) => void;
  expandedMenuItems: { [key: string]: boolean };
  toggleMenuItem: (item: string) => void;
}

const SideMenu = ({ 
  isOpen, 
  onClose, 
  onSettingsOpen,
  pvzInfo, 
  updatePvzInfo, 
  expandedMenuItems, 
  toggleMenuItem 
}: SideMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-sm text-gray-600 space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs">ID ПВЗ:</span>
              <input 
                type="text" 
                value={pvzInfo.id}
                onChange={(e) => updatePvzInfo('id', e.target.value)}
                placeholder="Введите ID"
                className="text-xs border-b border-gray-200 bg-transparent outline-none flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">Адрес:</span>
              <input 
                type="text" 
                value={pvzInfo.address}
                onChange={(e) => updatePvzInfo('address', e.target.value)}
                placeholder="Введите адрес"
                className="text-xs border-b border-gray-200 bg-transparent outline-none flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">ID сотрудника:</span>
              <input 
                type="text" 
                value={pvzInfo.employeeId}
                onChange={(e) => updatePvzInfo('employeeId', e.target.value)}
                placeholder="Введите ID"
                className="text-xs border-b border-gray-200 bg-transparent outline-none flex-1"
              />
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg ml-2"
          >
            <Icon name="X" size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Поиск по ШК"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {/* Как работать с программой */}
            <button 
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => toggleMenuItem('program')}
            >
              <div className="flex items-center space-x-3">
                <Icon name="BookOpen" size={18} className="text-red-500" />
                <span className="text-sm text-gray-700">Как работать с программой</span>
              </div>
              <Icon 
                name={expandedMenuItems.program ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-400" 
              />
            </button>
            {expandedMenuItems.program && (
              <div className="bg-gray-50 py-2">
                <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                  Руководство пользователя
                </button>
                <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                  Частые вопросы
                </button>
                <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                  Обучающие видео
                </button>
              </div>
            )}

            {/* Наклейки для работы с товаром */}
            <button 
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => toggleMenuItem('labels')}
            >
              <div className="flex items-center space-x-3">
                <Icon name="Tag" size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">Наклейки для работы с товаром</span>
              </div>
              <Icon 
                name={expandedMenuItems.labels ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-400" 
              />
            </button>
            {expandedMenuItems.labels && (
              <div className="bg-gray-50 py-2">
                <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                  Печать этикеток
                </button>
                <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                  Настройка принтера
                </button>
              </div>
            )}

            {/* Настройки */}
            <div className={`${expandedMenuItems.settings ? 'bg-purple-100' : ''}`}>
              <button 
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-purple-50"
                onClick={() => toggleMenuItem('settings')}
              >
                <div className="flex items-center space-x-3">
                  <Icon name="Settings" size={18} className="text-purple-600" />
                  <span className="text-sm text-gray-700">Настройки</span>
                </div>
                <Icon 
                  name={expandedMenuItems.settings ? "ChevronUp" : "ChevronDown"} 
                  size={16} 
                  className="text-gray-400" 
                />
              </button>
              {expandedMenuItems.settings && (
                <div className="bg-purple-50 py-2">
                  <button className="w-full flex items-center space-x-3 px-12 py-2 text-left text-sm text-gray-600 hover:bg-purple-100">
                    <Icon name="Sliders" size={16} />
                    <span>Основные</span>
                  </button>
                  <button 
                    className="w-full flex items-center space-x-3 px-12 py-2 text-left text-sm text-gray-600 hover:bg-purple-100"
                    onClick={() => {
                      onClose();
                      onSettingsOpen();
                    }}
                  >
                    <Icon name="Volume2" size={16} />
                    <span>Голосовая озвучка</span>
                  </button>
                </div>
              )}
            </div>

            {/* Оставить отзыв */}
            <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <Icon name="Star" size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">Оставить отзыв</span>
              </div>
            </button>

            {/* Полезные ссылки */}
            <button 
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => toggleMenuItem('links')}
            >
              <div className="flex items-center space-x-3">
                <Icon name="ExternalLink" size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">Полезные ссылки</span>
              </div>
              <Icon 
                name={expandedMenuItems.links ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-400" 
              />
            </button>
            {expandedMenuItems.links && (
              <div className="bg-gray-50 py-2">
                <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                  Портал партнеров
                </button>
                <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                  База знаний
                </button>
                <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                  Техподдержка
                </button>
              </div>
            )}

            {/* Дополнительный функционал */}
            <button 
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => toggleMenuItem('additional')}
            >
              <div className="flex items-center space-x-3">
                <Icon name="MoreHorizontal" size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">Дополнительный функционал</span>
              </div>
              <Icon 
                name={expandedMenuItems.additional ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-400" 
              />
            </button>
            {expandedMenuItems.additional && (
              <div className="bg-gray-50 py-2">
                <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                  Режим офлайн
                </button>
                <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                  Экспорт отчетов
                </button>
                <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                  Обновления
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Exit */}
        <div className="border-t p-4">
          <button 
            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg"
            onClick={() => {
              if (confirm('Вы действительно хотите выйти?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            <Icon name="LogOut" size={18} className="text-gray-600" />
            <span className="text-sm text-gray-700">Выйти</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;