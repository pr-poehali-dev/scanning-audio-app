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
            
            {/* КНОПКА ЭКСТРЕННОГО ТЕСТА ЯЧЕЕК */}
            <button 
              onClick={async () => {
                console.log('🧪 === ЭКСТРЕННЫЙ ТЕСТ ЯЧЕЕК ===');
                
                // Проверяем все хранилища
                const storages = [
                  'wb-audio-files',
                  'wb-pvz-cell-audio-settings-permanent',
                  'wb-pvz-cell-audio-cement',
                  'wb-pvz-cell-audio-IMMEDIATE'
                ];
                
                let totalFiles = 0;
                let report = '🧪 ЭКСТРЕННАЯ ДИАГНОСТИКА ЯЧЕЕК:\n\n';
                
                for (const storageKey of storages) {
                  const storage = localStorage.getItem(storageKey);
                  if (storage) {
                    try {
                      const files = JSON.parse(storage);
                      const cellFiles = Object.keys(files).filter(key => 
                        /^\d+$/.test(key) || key.includes('cell-') || key.includes('ячейка')
                      );
                      totalFiles += cellFiles.length;
                      report += `📦 ${storageKey}: ${cellFiles.length} ячеек\n`;
                      if (cellFiles.length > 0) {
                        report += `   📋 Ключи: ${cellFiles.slice(0, 5).join(', ')}${cellFiles.length > 5 ? '...' : ''}\n`;
                      }
                    } catch (error) {
                      report += `❌ ${storageKey}: Ошибка парсинга\n`;
                    }
                  } else {
                    report += `❌ ${storageKey}: НЕТ ДАННЫХ\n`;
                  }
                }
                
                if (totalFiles === 0) {
                  report += `\n❌ ЯЧЕЙКИ НЕ НАЙДЕНЫ!\n\n🔧 РЕШЕНИЕ:\n1. Настройки → Голосовая озвучка\n2. Загрузите папку с ячейками\n3. Нажмите "Сохранить"`;
                } else {
                  report += `\n✅ НАЙДЕНО ${totalFiles} файлов ячеек`;
                }
                
                alert(report);
              }}
              className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-md text-xs font-bold"
              title="Экстренный тест ячеек"
            >
              🧪
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;