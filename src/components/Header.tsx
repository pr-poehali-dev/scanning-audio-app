import React, { useState } from 'react';
import Icon from '@/components/ui/icon';
import { CellAudioUploader } from '@/components/CellAudioUploader';
import { VoiceSettings } from '@/components/VoiceSettings';
import { VoiceDemo } from '@/components/VoiceDemo';

interface HeaderProps {
  onMenuOpen: () => void;
  onSettingsOpen: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header = ({ onMenuOpen, onSettingsOpen, activeTab, setActiveTab }: HeaderProps) => {
  const [isAudioUploaderOpen, setIsAudioUploaderOpen] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isVoiceDemoOpen, setIsVoiceDemoOpen] = useState(false);
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between py-3">
          {/* Left side - WB logo, hamburger menu and search */}
          <div className="flex items-center space-x-3">
            {/* WB Logo */}
            <div className="flex items-center">
              <img 
                src="https://cdn.poehali.dev/files/2f0c5a81-97a5-4c4d-8512-d9a07795ab42.png" 
                alt="WB" 
                className="w-8 h-8 rounded-lg"
              />
            </div>
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
            
            {/* Кнопка демонстрации голоса */}
            <button 
              onClick={() => setIsVoiceDemoOpen(true)}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 text-sm font-medium shadow-sm"
              title="Демонстрация голосовой озвучки"
            >
              <Icon name="Play" size={16} />
              <span className="hidden sm:inline">Демо</span>
            </button>

            {/* Кнопка настроек голоса */}
            <button 
              onClick={() => setIsVoiceSettingsOpen(true)}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 text-sm font-medium shadow-sm"
              title="Настройки голосовой озвучки"
            >
              <Icon name="Mic" size={16} />
              <span className="hidden sm:inline">Голос</span>
            </button>

            {/* Кнопка загрузки аудио ячеек - БОЛЬШАЯ И ЗАМЕТНАЯ */}
            <button 
              onClick={() => setIsAudioUploaderOpen(true)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm font-medium shadow-sm"
              title="Загрузить MP3 файлы для озвучки ячеек"
            >
              <Icon name="Upload" size={16} />
              <span className="hidden sm:inline">Озвучка ячеек</span>
              <span className="sm:hidden">Озвучка</span>
            </button>
            

          </div>
        </div>
      </div>
      
      {/* Компонент загрузки аудио */}
      <CellAudioUploader 
        isOpen={isAudioUploaderOpen}
        onClose={() => setIsAudioUploaderOpen(false)}
      />
      
      {/* Компонент настроек голоса */}
      <VoiceSettings 
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />
      
      {/* Компонент демонстрации голоса */}
      <VoiceDemo 
        isOpen={isVoiceDemoOpen}
        onClose={() => setIsVoiceDemoOpen(false)}
      />
      

    </div>
  );
};

export default Header;