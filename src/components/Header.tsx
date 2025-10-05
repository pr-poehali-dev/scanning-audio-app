import React from 'react';
import Icon from '@/components/ui/icon';

interface HeaderProps {
  onMenuOpen: () => void;
  onSettingsOpen: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header = ({ onMenuOpen, onSettingsOpen, activeTab, setActiveTab }: HeaderProps) => {
  return (
    <div className="bg-gray-100">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 sm:h-[72px]">
            {/* Left side - Logo and Menu icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <img 
                src="https://cdn.poehali.dev/files/85c8d8ae-4b8f-45da-8f82-ca7b135fbe9f.png" 
                alt="WB" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <button 
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={onMenuOpen}
              >
                <Icon name="Menu" size={24} />
              </button>
              <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <Icon name="ShoppingCart" size={24} />
              </button>
              <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <Icon name="Search" size={24} />
              </button>
            </div>

            {/* Center - Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('delivery')}
                className={`relative h-16 sm:h-[72px] px-3 sm:px-5 text-sm sm:text-base font-normal transition-colors border-b-2 ${
                  activeTab === 'delivery'
                    ? 'text-purple-600 border-purple-600'
                    : 'text-gray-700 hover:text-gray-900 border-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span>Выдача</span>
                  <div className="w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    2
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('acceptance')}
                className={`relative h-16 sm:h-[72px] px-3 sm:px-5 text-sm sm:text-base font-normal transition-colors border-b-2 ${
                  activeTab === 'acceptance'
                    ? 'text-purple-600 border-purple-600'
                    : 'text-gray-700 hover:text-gray-900 border-transparent'
                }`}
              >
                Приемка
              </button>
              
              <button
                onClick={() => setActiveTab('returns')}
                className={`relative h-16 sm:h-[72px] px-3 sm:px-5 text-sm sm:text-base font-normal transition-colors border-b-2 ${
                  activeTab === 'returns'
                    ? 'text-purple-600 border-purple-600'
                    : 'text-gray-700 hover:text-gray-900 border-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span>Возврат</span>
                  <div className="w-5 h-5 bg-gray-700 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    12
                  </div>
                </div>
              </button>
            </div>

            {/* Right side - icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={onSettingsOpen}
              >
                <Icon name="Grid3x3" size={24} />
              </button>
              <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <Icon name="RotateCcw" size={24} />
              </button>
              <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <Icon name="MessageCircle" size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;