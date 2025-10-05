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
          {/* Header with ID */}
          <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">WB</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500">ID {pvzInfo.id || '50001234'}</div>
                  <div className="text-sm font-medium text-gray-900">V.1.0.51</div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
          </div>

          {/* User Profile Button */}
          <div className="px-4 py-3 border-b">
            <button className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={20} className="text-white" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">Сотрудник ПВЗ</div>
                <div className="text-xs text-gray-500">ID {pvzInfo.employeeId || 'не указан'}</div>
              </div>
            </button>
          </div>

          {/* Content - Cells Grid */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {/* Cells Section */}
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { cell: 4, items: 2 },
                  { cell: 521, items: 2 }
                ].map((data, index) => (
                  <button
                    key={index}
                    className="bg-white border-2 border-purple-600 rounded-lg p-4 hover:bg-purple-50 transition-colors active:scale-95"
                  >
                    <div className="text-4xl font-bold text-gray-900 leading-none mb-1">
                      {data.cell}
                    </div>
                    <div className="text-xs text-gray-500">
                      {data.items}<sup className="ml-0.5">2</sup>
                    </div>
                  </button>
                ))}
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