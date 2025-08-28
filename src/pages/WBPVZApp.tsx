import { useState, useCallback } from 'react';
import { useAudio } from '@/hooks/useAudio';
import Icon from '@/components/ui/icon';

const WBPVZApp = () => {
  const [activeTab, setActiveTab] = useState('delivery');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const { playAudio } = useAudio();

  const tabs = [
    { id: 'delivery', label: 'Выдача', icon: 'Package', badge: '15' },
    { id: 'receiving', label: 'Приёмка', icon: 'ArrowDown', badge: null },
    { id: 'return', label: 'Возврат', icon: 'RotateCcw', badge: null }
  ];

  const handleQRScan = useCallback(async () => {
    setIsScanning(true);
    await playAudio('scan-success');
    
    setTimeout(() => {
      setIsScanning(false);
      playAudio('client-found');
    }, 2000);
  }, [playAudio]);

  const handlePhoneSubmit = useCallback(async () => {
    if (phoneNumber.length === 4) {
      await playAudio('phone-input');
      setPhoneNumber('');
    }
  }, [phoneNumber, playAudio]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Icon name="Package" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">WB PVZ</h1>
              <p className="text-xs text-gray-500">ПВЗ Московский</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Icon name="Search" size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Icon name="Bell" size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Icon name="Settings" size={20} className="text-gray-600" />
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
              Установить версию
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 relative flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon name={tab.icon as any} size={18} />
              <span>{tab.label}</span>
              {tab.badge && (
                <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge}
                </div>
              )}
            </button>
          ))}
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
                      <span className="text-purple-600 text-sm font-medium">Сканирование...</span>
                    </div>
                  </div>
                )}
              </div>
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

        {activeTab === 'receiving' && (
          <div className="max-w-md mx-auto text-center">
            <div className="space-y-6">
              <Icon name="ArrowDown" size={48} className="text-purple-600 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900">Приёмка товаров</h2>
              <p className="text-gray-600">Функция приёмки в разработке</p>
            </div>
          </div>
        )}

        {activeTab === 'return' && (
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
          <button 
            onClick={() => playAudio('welcome')}
            className="text-purple-600 hover:text-purple-700"
          >
            🔊 Тест звука
          </button>
        </div>
      </div>
    </div>
  );
};

export default WBPVZApp;