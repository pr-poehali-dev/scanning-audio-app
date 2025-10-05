import Icon from '@/components/ui/icon';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onMenuOpen: () => void;
}

const MobileBottomNav = ({ activeTab, setActiveTab, onMenuOpen }: MobileBottomNavProps) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
      <div className="grid grid-cols-4 h-16">
        <button
          onClick={() => setActiveTab('delivery')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'delivery' ? 'text-purple-600' : 'text-gray-600'
          }`}
        >
          <div className="relative">
            <Icon name="Package" size={24} />
            {activeTab === 'delivery' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"></div>
            )}
          </div>
          <span className="text-xs font-medium">Выдача</span>
        </button>

        <button
          onClick={() => setActiveTab('acceptance')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'acceptance' ? 'text-purple-600' : 'text-gray-600'
          }`}
        >
          <div className="relative">
            <Icon name="ClipboardCheck" size={24} />
            {activeTab === 'acceptance' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"></div>
            )}
          </div>
          <span className="text-xs font-medium">Приёмка</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'returns' ? 'text-purple-600' : 'text-gray-600'
          }`}
        >
          <div className="relative">
            <Icon name="Undo2" size={24} />
            {activeTab === 'returns' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"></div>
            )}
          </div>
          <span className="text-xs font-medium">Возврат</span>
        </button>

        <button
          onClick={onMenuOpen}
          className="flex flex-col items-center justify-center gap-1 text-gray-600 transition-colors"
        >
          <Icon name="Menu" size={24} />
          <span className="text-xs font-medium">Меню</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
