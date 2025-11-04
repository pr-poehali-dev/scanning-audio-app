import React from 'react';
import Icon from '@/components/ui/icon';

interface HeaderProps {
  onMenuOpen: () => void;
  onSettingsOpen: () => void;
  onAudioSettingsOpen: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  audioVariant?: 'v1' | 'v2';
}

const Header = ({ onMenuOpen, onSettingsOpen, onAudioSettingsOpen, activeTab, setActiveTab, audioVariant = 'v1' }: HeaderProps) => {
  const getTabCount = (tab: string) => {
    if (tab === 'delivery') return 6;
    if (tab === 'returns') return 12;
    return 0;
  };

  return (
    <div className="bg-white border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left side - Menu, Cart, Search */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onMenuOpen}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="Menu" size={24} className="text-gray-700" />
            </button>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
              <Icon name="ShoppingCart" size={24} className="text-gray-700" />
            </button>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
              <Icon name="Search" size={24} className="text-gray-700" />
            </button>
          </div>

          {/* Center - Tabs */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('delivery')}
              className={`flex flex-col items-center gap-1 pb-3 pt-4 border-b-2 transition-colors ${
                activeTab === 'delivery'
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="Package" size={20} />
                {getTabCount('delivery') > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center px-1.5 font-medium">
                    {getTabCount('delivery')}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">Выдача</span>
            </button>
            
            <button
              onClick={() => setActiveTab('acceptance')}
              className={`flex flex-col items-center gap-1 pb-3 pt-4 border-b-2 transition-colors ${
                activeTab === 'acceptance'
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              <Icon name="PackagePlus" size={20} />
              <span className="text-sm font-medium">Приемка</span>
            </button>
            
            <button
              onClick={() => setActiveTab('returns')}
              className={`flex flex-col items-center gap-1 pb-3 pt-4 border-b-2 transition-colors relative ${
                activeTab === 'returns'
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 relative">
                <Icon name="PackageX" size={20} />
                {getTabCount('returns') > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gray-800 text-white text-xs rounded-full flex items-center justify-center px-1.5 font-medium">
                    {getTabCount('returns')}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">Возврат</span>
            </button>
          </div>

          {/* Right side - icons */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
              <Icon name="ListTodo" size={24} className="text-gray-700" />
            </button>
            
            <button 
              onClick={onAudioSettingsOpen}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
            >
              <Icon name="RotateCcw" size={24} className="text-gray-700" />
            </button>
            
            <button 
              onClick={onSettingsOpen}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name="MessageCircle" size={24} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;