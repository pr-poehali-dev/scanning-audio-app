import Icon from '@/components/ui/icon';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsOpen: () => void;
  pvzInfo: {
    id: string;
    address: string;
    employeeId: string;
  };
  updatePvzInfo: (field: string, value: string) => void;
  expandedMenuItems: { [key: string]: boolean };
  toggleMenuItem: (item: string) => void;
  handleDiscountAudio?: () => void;
  handleCheckProductAudio?: () => void;
  handleRatePvzAudio?: () => void;
}

const SideMenu = ({ 
  isOpen, 
  onClose, 
  onSettingsOpen,
  pvzInfo, 
  updatePvzInfo, 
  expandedMenuItems, 
  toggleMenuItem,
  handleDiscountAudio,
  handleCheckProductAudio,
  handleRatePvzAudio
}: SideMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-sm text-gray-600 space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs">ID ПВЗ:</span>
              <input 
                type="text" 
                value={pvzInfo.id}
                onChange={(e) => updatePvzInfo('id', e.target.value)}
                placeholder="Введите ID"
                className="text-xs border-b border-gray-200 bg-transparent outline-none flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">Адрес:</span>
              <input 
                type="text" 
                value={pvzInfo.address}
                onChange={(e) => updatePvzInfo('address', e.target.value)}
                placeholder="Введите адрес"
                className="text-xs border-b border-gray-200 bg-transparent outline-none flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">ID сотрудника:</span>
              <input 
                type="text" 
                value={pvzInfo.employeeId}
                onChange={(e) => updatePvzInfo('employeeId', e.target.value)}
                placeholder="Введите ID"
                className="text-xs border-b border-gray-200 bg-transparent outline-none flex-1"
              />
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg ml-2"
          >
            <Icon name="X" size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Поиск по ШК"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const barcode = (e.target as HTMLInputElement).value.trim();
                  if (barcode) {
                    alert(`🔍 Поиск товара по ШК: ${barcode}\n\nФункция в разработке - скоро добавим полноценный поиск!`);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {/* Как работать с программой */}
            <button 
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => toggleMenuItem('program')}
            >
              <div className="flex items-center space-x-3">
                <Icon name="BookOpen" size={18} className="text-red-500" />
                <span className="text-sm text-gray-700">Как работать с программой</span>
              </div>
              <Icon 
                name={expandedMenuItems.program ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-400" 
              />
            </button>
            {expandedMenuItems.program && (
              <div className="bg-gray-50 py-2">
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => alert('📖 Руководство пользователя\n\nЗдесь будет открываться подробная инструкция по работе с системой.')}
                >
                  Руководство пользователя
                </button>
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => alert('❓ Частые вопросы\n\n• Как сканировать QR-код?\n• Что делать если товар не найден?\n• Как настроить принтер?\n\nПолный список ответов в разработке.')}
                >
                  Частые вопросы
                </button>
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => alert('🎥 Обучающие видео\n\nВидеоуроки по работе с системой скоро будут добавлены!')}
                >
                  Обучающие видео
                </button>
              </div>
            )}

            {/* Наклейки для работы с товаром */}
            <button 
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => toggleMenuItem('labels')}
            >
              <div className="flex items-center space-x-3">
                <Icon name="Tag" size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">Наклейки для работы с товаром</span>
              </div>
              <Icon 
                name={expandedMenuItems.labels ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-400" 
              />
            </button>
            {expandedMenuItems.labels && (
              <div className="bg-gray-50 py-2">
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => alert('🖨️ Печать этикеток\n\nФункция печати этикеток будет добавлена в ближайшем обновлении.')}
                >
                  Печать этикеток
                </button>
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => alert('⚙️ Настройка принтера\n\nНастройка принтера этикеток в разработке.')}
                >
                  Настройка принтера
                </button>
              </div>
            )}

            {/* Настройки */}
            <div className={`${expandedMenuItems.settings ? 'bg-purple-100' : ''}`}>
              <button 
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-purple-50"
                onClick={() => toggleMenuItem('settings')}
              >
                <div className="flex items-center space-x-3">
                  <Icon name="Settings" size={18} className="text-purple-600" />
                  <span className="text-sm text-gray-700">Настройки</span>
                </div>
                <Icon 
                  name={expandedMenuItems.settings ? "ChevronUp" : "ChevronDown"} 
                  size={16} 
                  className="text-gray-400" 
                />
              </button>
              {expandedMenuItems.settings && (
                <div className="bg-purple-50 py-2">
                  <button className="w-full flex items-center space-x-3 px-12 py-2 text-left text-sm text-gray-600 hover:bg-purple-100">
                    <Icon name="Sliders" size={16} />
                    <span>Основные</span>
                  </button>
                  <button 
                    className="w-full flex items-center space-x-3 px-12 py-2 text-left text-sm text-gray-600 hover:bg-purple-100"
                    onClick={() => {
                      onClose();
                      onSettingsOpen();
                    }}
                  >
                    <Icon name="Volume2" size={16} />
                    <span>Голосовая озвучка</span>
                  </button>
                </div>
              )}
            </div>

            {/* Системные звуки */}
            <button 
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => toggleMenuItem('systemSounds')}
            >
              <div className="flex items-center space-x-3">
                <Icon name="Volume2" size={18} className="text-blue-600" />
                <span className="text-sm text-gray-700">Системные звуки</span>
              </div>
              <Icon 
                name={expandedMenuItems.systemSounds ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-400" 
              />
            </button>
            {expandedMenuItems.systemSounds && (
              <div className="bg-blue-50 py-2">
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-blue-100"
                  onClick={handleDiscountAudio}
                >
                  🔊 Товары со скидкой
                </button>
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-blue-100"
                  onClick={handleCheckProductAudio}
                >
                  🔊 Проверьте товар под камерой
                </button>
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-blue-100"
                  onClick={handleRatePvzAudio}
                >
                  🔊 Оцените наш пункт выдачи
                </button>
              </div>
            )}

            {/* Оставить отзыв */}
            <button 
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => {
                const feedback = prompt('⭐ Ваш отзыв о системе WB ПВЗ:\n\n(Укажите что нравится и что можно улучшить)');
                if (feedback) {
                  alert(`Спасибо за отзыв! 🙏\n\nВаш отзыв: "${feedback}"\n\nМы обязательно учтем ваши пожелания в следующих обновлениях.`);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <Icon name="Star" size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">Оставить отзыв</span>
              </div>
            </button>

            {/* Полезные ссылки */}
            <button 
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => toggleMenuItem('links')}
            >
              <div className="flex items-center space-x-3">
                <Icon name="ExternalLink" size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">Полезные ссылки</span>
              </div>
              <Icon 
                name={expandedMenuItems.links ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-400" 
              />
            </button>
            {expandedMenuItems.links && (
              <div className="bg-gray-50 py-2">
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => alert('🔗 Портал партнеров\n\nСсылка на официальный портал партнеров WB будет добавлена.')}
                >
                  Портал партнеров
                </button>
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => alert('📚 База знаний\n\nБаза знаний с ответами на все вопросы в разработке.')}
                >
                  База знаний
                </button>
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => alert('🆘 Техподдержка\n\nТелефон: 8-800-XXX-XX-XX\nEmail: support@example.com\n\nСвязь с техподдержкой скоро будет добавлена.')}
                >
                  Техподдержка
                </button>
              </div>
            )}

            {/* Дополнительный функционал */}
            <button 
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => toggleMenuItem('additional')}
            >
              <div className="flex items-center space-x-3">
                <Icon name="MoreHorizontal" size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">Дополнительный функционал</span>
              </div>
              <Icon 
                name={expandedMenuItems.additional ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-400" 
              />
            </button>
            {expandedMenuItems.additional && (
              <div className="bg-gray-50 py-2">
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => alert('📡 Режим офлайн\n\nРежим работы без интернета будет добавлен в следующих версиях.')}
                >
                  Режим офлайн
                </button>
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => alert('📊 Экспорт отчетов\n\nФункция экспорта отчетов о работе в Excel/PDF скоро появится.')}
                >
                  Экспорт отчетов
                </button>
                <button 
                  className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => alert('🔄 Обновления\n\nТекущая версия: 1.0.0\nПоследнее обновление: Сегодня\n\nАвтообновления включены.')}
                >
                  Обновления
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Exit */}
        <div className="border-t p-4">
          <button 
            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg"
            onClick={() => {
              if (confirm('Вы действительно хотите выйти?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            <Icon name="LogOut" size={18} className="text-gray-600" />
            <span className="text-sm text-gray-700">Выйти</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;