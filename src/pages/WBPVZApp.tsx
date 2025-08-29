import { useState, useCallback, useRef } from 'react';
import { useAudio } from '@/hooks/useAudio';
import QRScanner from '@/components/QRScanner';
import Icon from '@/components/ui/icon';

const WBPVZApp = () => {
  const [activeTab, setActiveTab] = useState('acceptance');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [expandedMenuItems, setExpandedMenuItems] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem('wb-pvz-expanded-menu');
    return saved ? JSON.parse(saved) : { settings: false };
  });
  const [pvzInfo, setPvzInfo] = useState({
    id: localStorage.getItem('wb-pvz-id') || '',
    address: localStorage.getItem('wb-pvz-address') || '',
    employeeId: localStorage.getItem('wb-pvz-employee-id') || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playAudio, updateAudioFiles, customAudioFiles } = useAudio();

  const tabs = [
    { id: 'delivery', label: 'Выдача', icon: 'Package', badge: '15' },
    { id: 'receiving', label: 'Приёмка', icon: 'ArrowDown', badge: null },
    { id: 'return', label: 'Возврат', icon: 'RotateCcw', badge: null }
  ];

  const handleQRScan = useCallback(() => {
    setShowQRScanner(true);
  }, []);

  const toggleMenuItem = useCallback((item: string) => {
    const newExpanded = {
      ...expandedMenuItems,
      [item]: !expandedMenuItems[item]
    };
    setExpandedMenuItems(newExpanded);
    localStorage.setItem('wb-pvz-expanded-menu', JSON.stringify(newExpanded));
  }, [expandedMenuItems]);

  const updatePvzInfo = useCallback((field: string, value: string) => {
    setPvzInfo(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem(`wb-pvz-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
      return updated;
    });
  }, []);

  const handleQRScanResult = useCallback(async (data: string) => {
    console.log('QR код отсканирован:', data);
    setScannedData(data);
    setIsScanning(true);
    
    // Определяем тип озвучки по QR-коду
    let audioKey = 'scan-success'; // по умолчанию
    
    if (data.includes('check_product') || data.includes('проверь')) {
      audioKey = 'check-product';
    } else if (data.includes('discount') || data.includes('скидка')) {
      audioKey = 'discount';
    } else if (data.includes('rate') || data.includes('оцените')) {
      audioKey = 'rate-service';
    } else if (data.includes('client') || data.includes('клиент')) {
      audioKey = 'client-found';
    }
    
    await playAudio(audioKey);
    
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  }, [playAudio]);

  const handlePhoneSubmit = useCallback(async () => {
    if (phoneNumber.length === 4) {
      await playAudio('phone-input');
      setPhoneNumber('');
    }
  }, [phoneNumber, playAudio]);

  const handleFolderUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('Выбрано файлов:', files?.length);
    
    if (!files) return;

    const audioFiles: { [key: string]: string } = {};
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('Обрабатываю файл:', file.name, 'Тип:', file.type);
      
      if (file.type.startsWith('audio/')) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // убираем расширение
        const audioUrl = URL.createObjectURL(file);
        audioFiles[fileName] = audioUrl;
        console.log('Добавлен аудиофайл:', fileName);
      }
    }

    console.log('Итого аудиофайлов:', Object.keys(audioFiles));

    if (Object.keys(audioFiles).length > 0) {
      updateAudioFiles(audioFiles);
      alert(`Загружено ${Object.keys(audioFiles).length} аудиофайлов: ${Object.keys(audioFiles).join(', ')}`);
    } else {
      alert('Аудиофайлы не найдены. Проверьте что выбрали файлы с расширением .mp3, .wav, .ogg или другими аудио форматами');
    }

    // Очищаем input
    if (event.target) {
      event.target.value = '';
    }
  }, [updateAudioFiles]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            {/* Left side - hamburger menu and search */}
            <div className="flex items-center space-x-3">
              <button 
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
                onClick={() => setShowSideMenu(true)}
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
                onClick={() => setShowSettings(true)}
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

      {/* Content */}
      <div className="flex-1 p-6">
        {activeTab === 'delivery' && (
          <div className="max-w-md mx-auto text-center space-y-8">
            {/* QR Scanner */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-700">
                Отсканируйте QR-код клиента или курьера
              </h2>
              
              <div 
                className={`relative w-48 h-48 mx-auto cursor-pointer transition-all duration-300 ${
                  isScanning ? 'animate-pulse' : 'hover:scale-105'
                }`}
                onClick={handleQRScan}
              >
                <img 
                  src="https://cdn.poehali.dev/files/d3679227-0f5e-4ab8-89c8-87de6d7eb8cb.png"
                  alt="QR Scanner"
                  className="w-full h-full object-contain"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-purple-100 bg-opacity-80 rounded-xl flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-purple-600 text-sm font-medium">Обработка...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Результат сканирования */}
              {scannedData && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Отсканировано:</h4>
                  <p className="text-sm text-green-700 break-all">{scannedData}</p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-gray-500 text-sm font-medium">ИЛИ</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Phone Input */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-gray-700">
                Введите номер телефона клиента
              </h3>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Последние 4 цифры номера"
                  className="w-full px-4 py-3 text-lg text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  maxLength={4}
                />
                
                <button
                  onClick={handlePhoneSubmit}
                  disabled={phoneNumber.length !== 4}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    phoneNumber.length === 4
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Найти заказ
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'acceptance' && (
          <div className="max-w-md mx-auto text-center">
            <div className="space-y-6">
              <Icon name="ArrowDown" size={48} className="text-purple-600 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900">Приёмка товаров</h2>
              <p className="text-gray-600">Функция приёмки в разработке</p>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="max-w-md mx-auto text-center">
            <div className="space-y-6">
              <Icon name="RotateCcw" size={48} className="text-purple-600 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900">Возврат товаров</h2>
              <p className="text-gray-600">Функция возврата в разработке</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t px-4 py-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Версия 2.1.0</span>
          <div className="flex items-center gap-4">
            <span>Загружено аудио: {Object.keys(customAudioFiles).length}</span>
            <button 
              onClick={() => playAudio('test')}
              className="text-purple-600 hover:text-purple-700 text-xs"
            >
              🔊 Тест звука
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Настройки озвучки</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Загрузите папку с аудиофайлами для озвучки действий.
                  Названия файлов должны соответствовать событиям.
                </p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Icon name="FolderOpen" size={18} />
                    Выбрать файлы аудио
                  </button>
                  
                  <p className="text-xs text-gray-500">
                    Выберите несколько аудиофайлов (Ctrl/Cmd + клик для множественного выбора)
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleFolderUpload}
                  className="hidden"
                />
              </div>
              
              {Object.keys(customAudioFiles).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Загруженные файлы:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {Object.keys(customAudioFiles).map((fileName) => (
                      <div key={fileName} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                        <span>{fileName}</span>
                        <button
                          onClick={() => playAudio(fileName)}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <Icon name="Play" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                <p className="mb-1">Примеры названий файлов:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>scan-success.mp3 - успешное сканирование</li>
                  <li>client-found.mp3 - клиент найден</li>
                  <li>phone-input.mp3 - ввод телефона</li>
                  <li>delivery-complete.mp3 - выдача завершена</li>
                  <li>check-product.mp3 - проверьте товар под камерой</li>
                  <li>discount.mp3 - товары со скидкой</li>
                  <li>rate-service.mp3 - оцените наш ПВЗ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Side Menu */}
      {showSideMenu && (
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
                onClick={() => setShowSideMenu(false)}
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
                    <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                      Руководство пользователя
                    </button>
                    <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                      Частые вопросы
                    </button>
                    <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
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
                    <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                      Печать этикеток
                    </button>
                    <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
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
                          setShowSideMenu(false);
                          setShowSettings(true);
                        }}
                      >
                        <Icon name="Volume2" size={16} />
                        <span>Голосовая озвучка</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Оставить отзыв */}
                <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50">
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
                    <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                      Портал партнеров
                    </button>
                    <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                      База знаний
                    </button>
                    <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
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
                    <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                      Режим офлайн
                    </button>
                    <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
                      Экспорт отчетов
                    </button>
                    <button className="w-full px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100">
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
      )}

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onScan={handleQRScanResult}
        onClose={() => setShowQRScanner(false)}
      />
    </div>
  );
};

export default WBPVZApp;