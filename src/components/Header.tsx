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
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Menu, Cart, Search */}
          <div className="flex items-center space-x-2">
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

          {/* Center - Main Navigation Tabs */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('delivery')}
              className={`relative h-16 px-6 text-base font-normal transition-colors border-b-2 ${
                activeTab === 'delivery'
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-700 hover:text-gray-900 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Выдача</span>
                {activeTab === 'delivery' && (
                  <div className="w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    2
                  </div>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('acceptance')}
              className={`relative h-16 px-6 text-base font-normal transition-colors border-b-2 ${
                activeTab === 'acceptance'
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-700 hover:text-gray-900 border-transparent'
              }`}
            >
              Приемка
            </button>
            
            <button
              onClick={() => setActiveTab('returns')}
              className={`relative h-16 px-6 text-base font-normal transition-colors border-b-2 ${
                activeTab === 'returns'
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-700 hover:text-gray-900 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Возврат</span>
                <div className="w-5 h-5 bg-gray-700 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  12
                </div>
              </div>
            </button>
          </div>

          {/* Right side - additional icons */}
          <div className="flex items-center space-x-2">
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
  );
};

export default Header;