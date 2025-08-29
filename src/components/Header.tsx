import Icon from '@/components/ui/icon';

interface HeaderProps {
  onMenuOpen: () => void;
  onSettingsOpen: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header = ({ onMenuOpen, onSettingsOpen, activeTab, setActiveTab }: HeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between py-3">
          {/* Left side - hamburger menu and search */}
          <div className="flex items-center space-x-3">
            <button 
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
              onClick={onMenuOpen}
            >
              <Icon name="AlignJustify" size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md">
              <Icon name="MessageSquare" size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md">
              <Icon name="Search" size={20} />
            </button>
          </div>

          {/* Center - Main Navigation Tabs */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab('delivery')}
              className={`relative py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'delivery'
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>Выдача</span>
                <div className="w-5 h-5 bg-gray-600 text-white text-xs rounded-full flex items-center justify-center">
                  1
                </div>
              </div>
              {activeTab === 'delivery' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('acceptance')}
              className={`relative py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'acceptance'
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Приемка
              {activeTab === 'acceptance' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('returns')}
              className={`relative py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'returns'
                  ? 'text-purple-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Возврат
              {activeTab === 'returns' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>
          </div>

          {/* Right side - additional icons */}
          <div className="flex items-center space-x-3">
            <button 
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
              onClick={onSettingsOpen}
            >
              <Icon name="Grid3X3" size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md">
              <Icon name="RotateCcw" size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md">
              <Icon name="MessageCircle" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;