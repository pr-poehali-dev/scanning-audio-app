import React, { useState } from 'react';
import Icon from '@/components/ui/icon';
import { CellAudioUploader } from '@/components/CellAudioUploader';
import AudioTestDebug from '@/components/AudioTestDebug';

interface HeaderProps {
  onMenuOpen: () => void;
  onSettingsOpen: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header = ({ onMenuOpen, onSettingsOpen, activeTab, setActiveTab }: HeaderProps) => {
  const [isAudioUploaderOpen, setIsAudioUploaderOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
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
            
            {/* Кнопка загрузки аудио ячеек */}
            <button 
              onClick={() => setIsAudioUploaderOpen(true)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
              title="Загрузить аудио файлы ячеек"
            >
              <Icon name="VolumeX" size={20} />
            </button>
            
            {/* Кнопка диагностики аудио */}
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
              title="Диагностика аудио системы"
            >
              <Icon name="Bug" size={20} />
            </button>
            
            {/* ВРЕМЕННАЯ ДИАГНОСТИКА ОЗВУЧКИ */}
            <button 
              onClick={async () => {
                console.log('🚀 === ПОЛНАЯ ДИАГНОСТИКА СИСТЕМЫ ОЗВУЧКИ ===');
                
                // 1. Проверяем localStorage
                const storages = [
                  'wb-audio-files',
                  'wb-audio-files-backup',
                  'wb-audio-files-cells-backup',
                  'customAudioFiles',
                  'audioFiles'
                ];
                
                let report = '🔍 ДИАГНОСТИКА LOCALSTORAGE:\n\n';
                let foundCellFiles = [];
                
                storages.forEach(key => {
                  const data = localStorage.getItem(key);
                  if (data) {
                    try {
                      const files = JSON.parse(data);
                      const keys = Object.keys(files);
                      const cellKeys = keys.filter(k => k.includes('cell-') || /^\d+$/.test(k));
                      
                      report += `📦 ${key}: ${keys.length} файлов (${cellKeys.length} ячеек)\n`;
                      if (cellKeys.length > 0) {
                        report += `   🏠 Ячейки: ${cellKeys.slice(0, 3).join(', ')}${cellKeys.length > 3 ? '...' : ''}\n`;
                        foundCellFiles.push(...cellKeys.map(k => ({ storage: key, key: k, url: files[k] })));
                      }
                    } catch (e) {
                      report += `❌ ${key}: Ошибка парсинга\n`;
                    }
                  } else {
                    report += `❌ ${key}: НЕТ ДАННЫХ\n`;
                  }
                });
                
                report += `\n🎯 ВСЕГО НАЙДЕНО ФАЙЛОВ ЯЧЕЕК: ${foundCellFiles.length}\n\n`;
                
                // 2. Тестируем функцию playCellAudio
                if (foundCellFiles.length > 0) {
                  report += '🧪 ТЕСТ ВОСПРОИЗВЕДЕНИЯ:\n';
                  const testFile = foundCellFiles[0];
                  report += `Тестирую файл: ${testFile.key} из ${testFile.storage}\n`;
                  
                  try {
                    // Прямое воспроизведение
                    const audio = new Audio(testFile.url);
                    await audio.play();
                    report += `✅ ПРЯМОЕ ВОСПРОИЗВЕДЕНИЕ РАБОТАЕТ!\n`;
                    setTimeout(() => audio.pause(), 1000);
                  } catch (directError) {
                    report += `❌ Прямое воспроизведение: ${directError.message}\n`;
                    report += `❌ URL тип: ${testFile.url.startsWith('blob:') ? 'BLOB' : testFile.url.startsWith('data:') ? 'BASE64' : 'OTHER'}\n`;
                  }
                  
                  // Тестируем через систему
                  try {
                    const { playCellAudio } = await import('/src/utils/cellAudioPlayer');
                    const cellNumber = testFile.key.replace('cell-', '');
                    const success = await playCellAudio(cellNumber);
                    report += success ? `✅ playCellAudio РАБОТАЕТ для ${cellNumber}!\n` : `❌ playCellAudio НЕ РАБОТАЕТ для ${cellNumber}\n`;
                  } catch (systemError) {
                    report += `❌ Ошибка системы: ${systemError.message}\n`;
                  }
                } else {
                  report += '❌ НЕТ ФАЙЛОВ ДЛЯ ТЕСТА!\n';
                  report += '\n📋 ИНСТРУКЦИЯ:\n';
                  report += '1. Настройки → Фразы для озвучки → Выдача\n';
                  report += '2. Загрузите файл с именем cell-126.mp3\n';
                  report += '3. Сохраните и повторите диагностику\n';
                }
                
                alert(report);
                console.log(report);
              }}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md text-xs font-bold"
              title="Диагностика озвучки ячеек"
            >
              🔍
            </button>
          </div>
        </div>
      </div>
      
      {/* Компонент загрузки аудио */}
      <CellAudioUploader 
        isOpen={isAudioUploaderOpen}
        onClose={() => setIsAudioUploaderOpen(false)}
      />
      
      {/* Панель диагностики */}
      {showDebug && (
        <div className="border-t bg-gray-50 p-4">
          <AudioTestDebug />
        </div>
      )}
    </div>
  );
};

export default Header;