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
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Side Menu */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Меню</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* ПВЗ Info Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Информация о ПВЗ
              </h3>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ID ПВЗ</label>
                  <input
                    type="text"
                    value={pvzInfo.id}
                    onChange={(e) => updatePvzInfo('id', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Введите ID ПВЗ"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Адрес</label>
                  <textarea
                    value={pvzInfo.address}
                    onChange={(e) => updatePvzInfo('address', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={2}
                    placeholder="Введите адрес ПВЗ"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ID сотрудника</label>
                  <input
                    type="text"
                    value={pvzInfo.employeeId}
                    onChange={(e) => updatePvzInfo('employeeId', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Введите ID сотрудника"
                  />
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Инструменты
              </h3>
              
              <div className="space-y-2">
                {/* Настройки */}
                <button
                  onClick={() => {
                    onSettingsOpen();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon name="Settings" size={18} />
                  <span className="text-sm">Настройки</span>
                </button>

                {/* Статистика */}
                <button
                  onClick={() => toggleMenuItem('stats')}
                  className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="BarChart3" size={18} />
                    <span className="text-sm">Статистика</span>
                  </div>
                  <Icon name={expandedMenuItems.stats ? "ChevronUp" : "ChevronDown"} size={16} />
                </button>
                
                {expandedMenuItems.stats && (
                  <div className="ml-6 space-y-1">
                    <div className="text-xs text-gray-600 py-2">
                      <div>Выдано сегодня: 0</div>
                      <div>Принято товаров: 0</div>
                      <div>Возвратов: 0</div>
                    </div>
                  </div>
                )}

                {/* Справка */}
                <button
                  onClick={() => toggleMenuItem('help')}
                  className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="HelpCircle" size={18} />
                    <span className="text-sm">Справка</span>
                  </div>
                  <Icon name={expandedMenuItems.help ? "ChevronUp" : "ChevronDown"} size={16} />
                </button>
                
                {expandedMenuItems.help && (
                  <div className="ml-6 space-y-1">
                    <div className="text-xs text-gray-600 py-2">
                      <div>Версия: 1.0.51</div>
                      <div>Поддержка: support@wb.ru</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              <div>WB ПВЗ Система</div>
              <div>Версия 1.0.51</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;