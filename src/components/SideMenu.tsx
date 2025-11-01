import Icon from '@/components/ui/icon';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsOpen: () => void;
  onAudioSettingsOpen?: () => void;
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
  onAudioSettingsOpen,
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
      <div className={`fixed top-0 left-0 h-full w-[90vw] sm:w-[320px] max-w-[320px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header with Logo and ID */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src="https://cdn.poehali.dev/files/7bf1199a-f009-4c4f-8473-0e816b628133.png" 
                alt="WB ПВЗ" 
                className="w-12 h-12 object-contain"
              />
              <div className="flex-1">
                <div className="text-xs text-gray-500">ID {pvzInfo.id || '50001234'}</div>
                <div className="text-xs text-gray-400">V.1.0.51</div>
              </div>
            </div>
          </div>

          {/* User Profile Button */}
          <div className="px-4 py-3 border-b bg-purple-600">
            <button className="w-full flex items-center gap-3 p-3 bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={20} className="text-purple-600" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">Сотрудник</div>
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
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

            {/* Menu Items */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Инструменты
              </h3>
              
              <div className="space-y-2">
                {/* Озвучка */}
                {onAudioSettingsOpen && (
                  <button
                    onClick={() => {
                      onAudioSettingsOpen();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon name="Volume2" size={18} />
                    <span className="text-sm">Озвучка</span>
                  </button>
                )}
                
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