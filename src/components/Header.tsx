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
  return (
    <div className="bg-gray-100">
      <div className="bg-white pt-8 md:pt-0 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left side - Logo */}
            <div className="flex items-center gap-2">
              <img 
                src="https://cdn.poehali.dev/files/7bf1199a-f009-4c4f-8473-0e816b628133.png" 
                alt="WB ПВЗ" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-gray-900">ПВЗ WB</div>
                <div className="text-xs text-gray-500">Пункт выдачи</div>
              </div>
            </div>

            {/* Center - Tabs (Desktop only) */}
            <div className="hidden md:flex items-center gap-1">
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
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Индикатор варианта озвучки */}
              <div 
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  audioVariant === 'v1' 
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
                onClick={onAudioSettingsOpen}
                title="Настройки озвучки"
              >
                <Icon name="Volume2" size={14} />
                <span>Вариант {audioVariant === 'v1' ? '1' : '2'}</span>
              </div>
              
              <button 
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors sm:hidden"
                onClick={onAudioSettingsOpen}
                title="Настройки озвучки"
              >
                <Icon name="Volume2" size={20} className="sm:w-6 sm:h-6" />
              </button>
              <button 
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={onSettingsOpen}
                title="Настройки"
              >
                <Icon name="Settings" size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;