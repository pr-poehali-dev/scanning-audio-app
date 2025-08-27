import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeTab, setActiveTab] = useState('delivery');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [secondPhone, setSecondPhone] = useState('');
  const [cellNumber, setCellNumber] = useState(1189);
  const [isScanning, setIsScanning] = useState(false);

  // Аудио система для озвучки
  const playAudio = (message: string) => {
    // В реальном приложении здесь будет загрузка аудио файлов из облака
    console.log(`🔊 Озвучка: ${message}`);
    // Временная имитация озвучки
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'ru-RU';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleQRScan = () => {
    setIsScanning(true);
    playAudio('Товары со скидкой проверьте ВБ кошелек');
    
    // Имитация процесса сканирования
    setTimeout(() => {
      setIsScanning(false);
      playAudio('Проверьте товар под камерой');
    }, 2000);
  };

  const handleConfirmCode = () => {
    if (phoneNumber) {
      handleQRScan();
    }
  };

  const mockProducts = [
    {
      id: '164667827',
      article: '4569',
      name: 'ТЕЛОДВИЖЕНИЯ / Лонгслив женский...',
      size: 'Серый',
      color: 'Серый',
      barcode: '485748574758',
      image: '/api/placeholder/80/80'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">wb</span>
              </div>
              <div className="text-sm text-gray-500">
                <div>ID 50001234</div>
                <div>v1.0.51</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Icon name="Menu" className="text-gray-600" />
              <Icon name="Package" className="text-gray-600" />
              <Icon name="Search" className="text-gray-600" />
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">6</Badge>
                <Badge variant="secondary" className="bg-gray-100">12</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="MoreHorizontal" />
                <Icon name="RefreshCw" />
                <Icon name="MessageCircle" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'delivery', label: 'Выдача', count: 6 },
            { id: 'receiving', label: 'Приемка', count: null },
            { id: 'return', label: 'Возврат', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count && (
                <Badge className="ml-2 bg-purple-600">{tab.count}</Badge>
              )}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'delivery' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Scanner Section */}
            <Card className="p-8">
              <CardContent className="text-center space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Отсканируйте QR-код клиента
                </h2>
                
                <div className="relative">
                  <img 
                    src="https://cdn.poehali.dev/files/3f883f17-7be0-4384-a434-f809f2537323.png"
                    alt="QR Scanner"
                    className="w-64 h-48 mx-auto object-contain"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-purple-500 bg-opacity-20 rounded-lg animate-pulse flex items-center justify-center">
                      <div className="text-purple-700 font-medium">Сканирование...</div>
                    </div>
                  )}
                </div>

                <div className="text-gray-500">или</div>
                
                <div className="space-y-4">
                  <p className="text-gray-700">Введите номер телефона клиента</p>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="4456"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleConfirmCode}
                      className="bg-purple-500 hover:bg-purple-600 px-8"
                      disabled={!phoneNumber}
                    >
                      <Icon name="ChevronRight" className="text-white" />
                    </Button>
                  </div>
                  <Input
                    placeholder="967898"
                    value={secondPhone}
                    onChange={(e) => setSecondPhone(e.target.value)}
                  />
                  <Button 
                    onClick={handleConfirmCode}
                    className="w-full bg-purple-500 hover:bg-purple-600 py-3"
                    disabled={!phoneNumber}
                  >
                    Подтвердить код
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Products List */}
            <Card className="p-6">
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">
                    Отсканируйте товары перед примеркой: 0 из 150
                  </h3>
                  <Icon name="ArrowLeft" className="text-gray-400" />
                </div>
                
                <div className="bg-gray-100 rounded-lg p-8 text-center mb-6">
                  <div className="text-6xl font-bold text-gray-700 mb-2">
                    {cellNumber}
                  </div>
                  <div className="text-gray-500">Ячейка:</div>
                </div>

                <div className="space-y-4">
                  {mockProducts.map((product) => (
                    <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Icon name="Package" className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{product.id} {product.article}</div>
                        <div className="text-sm text-gray-600">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          Размер: {product.size} Цвет: {product.color}
                        </div>
                        <div className="text-xs text-gray-400">
                          Баркод: {product.barcode}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button variant="outline" size="sm">
                          Не сканировать
                        </Button>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-purple-500">
                            На примерке
                          </Button>
                          <Button size="sm" variant="outline">
                            Выдать
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-6 bg-purple-500 hover:bg-purple-600">
                  Пропустить всё
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'receiving' && (
          <Card className="p-8">
            <CardContent className="text-center space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Icon name="ArrowLeft" />
                  <span>Вернуться к приемке</span>
                </Button>
              </div>
              
              <div className="flex justify-center space-x-8 mb-8">
                <div className="flex items-center space-x-4">
                  {[1, 2, 3, 4].map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step}
                      </div>
                      {index < 3 && (
                        <div className={`w-8 h-0.5 mx-2 ${
                          index === 0 ? 'bg-purple-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Отсканируйте стикер коробки
              </h2>
              
              <div className="w-48 h-48 mx-auto bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center mb-6">
                <div className="w-24 h-24 border-4 border-purple-500 rounded-lg flex items-center justify-center">
                  <div className="w-16 h-16 bg-black opacity-80" style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='qr' patternUnits='userSpaceOnUse' width='10' height='10'%3e%3crect width='5' height='5' fill='black'/%3e%3crect x='5' y='5' width='5' height='5' fill='black'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23qr)'/%3e%3c/svg%3e")`
                  }} />
                </div>
              </div>

              <div className="text-gray-500 mb-4">или</div>
              
              <Input
                placeholder="89585787658"
                className="max-w-md mx-auto"
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'return' && (
          <Card className="p-8">
            <CardContent className="text-center space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Возврат товаров
              </h2>
              
              <div className="text-gray-600">
                Функционал возврата товаров
              </div>

              <div className="w-64 h-48 mx-auto bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center">
                <Icon name="RotateCcw" size={64} className="text-purple-400" />
              </div>

              <Button 
                className="bg-purple-500 hover:bg-purple-600"
                onClick={() => playAudio('Начинаем процесс возврата товара')}
              >
                Начать возврат
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;