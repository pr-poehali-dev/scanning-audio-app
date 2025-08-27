import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeTab, setActiveTab] = useState('delivery');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [secondPhone, setSecondPhone] = useState('');
  const [cellNumber, setCellNumber] = useState(1189);
  const [isScanning, setIsScanning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [receivingStep, setReceivingStep] = useState(1);
  const [scannedProducts, setScannedProducts] = useState(0);
  const [totalProducts, setTotalProducts] = useState(150);
  const [barcode, setBarcode] = useState('');
  const [returnItems, setReturnItems] = useState([]);
  const [currentView, setCurrentView] = useState('scanner');

  // Расширенная аудио система для озвучки
  const playAudio = (message: string, priority: 'high' | 'normal' = 'normal') => {
    console.log(`🔊 Озвучка (${priority}): ${message}`);
    if (window.speechSynthesis) {
      if (priority === 'high') {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'ru-RU';
      utterance.rate = priority === 'high' ? 1.1 : 0.9;
      utterance.pitch = priority === 'high' ? 1.2 : 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Озвучка при смене вкладок
  useEffect(() => {
    const messages = {
      delivery: 'Вкладка выдача активна',
      receiving: 'Вкладка приемка активна', 
      return: 'Вкладка возврат активна'
    };
    if (messages[activeTab]) {
      playAudio(messages[activeTab]);
    }
  }, [activeTab]);

  const handleQRScan = () => {
    setIsScanning(true);
    playAudio('Товары со скидкой проверьте ВБ кошелек', 'high');
    
    setTimeout(() => {
      setIsScanning(false);
      playAudio('Проверьте товар под камерой');
      setCurrentView('products');
    }, 2000);
  };

  const handleProductScan = (productId: string) => {
    setScannedProducts(prev => prev + 1);
    playAudio('Товар отсканирован');
  };

  const handleTryOn = () => {
    playAudio('Товар передан на примерку');
  };

  const handleIssue = () => {
    playAudio('Товар выдан клиенту. Оцените наш пункт выдачи в приложении', 'high');
  };

  const handleReceivingStart = () => {
    setReceivingStep(1);
    playAudio('Начинаем приемку товара. Отсканируйте стикер коробки');
  };

  const handleReceivingNext = () => {
    if (receivingStep < 4) {
      setReceivingStep(prev => prev + 1);
      const messages = {
        2: 'Проверьте целостность упаковки',
        3: 'Разместите товар в ячейке',
        4: 'Приемка завершена успешно'
      };
      playAudio(messages[receivingStep + 1]);
    }
  };

  const handleReturnStart = () => {
    playAudio('Начинаем процесс возврата. Отсканируйте товар для возврата');
  };

  const handleConfirmCode = () => {
    if (phoneNumber) {
      handleQRScan();
    }
  };

  const sidebarMenuItems = [
    { icon: 'Package', label: 'Товары', id: 'products', badge: '150' },
    { icon: 'RefreshCw', label: 'Смена ячейки', id: 'change-cell' },
    { icon: 'RotateCcw', label: 'Принять снова', id: 'reaccept', badge: '9' }
  ];

  const mockProducts = [
    {
      id: '164667827',
      article: '4569',
      name: 'ТЕЛОДВИЖЕНИЯ / Лонгслив женский...',
      size: 'Серый',
      color: 'Серый',
      barcode: '485748574758',
      image: '/api/placeholder/80/80',
      scanned: false
    },
    {
      id: '164667828',
      article: '4570',
      name: 'ТЕЛОДВИЖЕНИЯ / Свитшот женский...',
      size: 'Черный',
      color: 'Черный', 
      barcode: '485748574759',
      image: '/api/placeholder/80/80',
      scanned: false
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
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => playAudio('Открываю меню')}>
                    <Icon name="Menu" className="text-gray-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="py-6">
                    <h3 className="text-lg font-semibold mb-4">Меню</h3>
                    <div className="space-y-2">
                      {sidebarMenuItems.map((item) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            playAudio(`Переход в ${item.label}`);
                            setSidebarOpen(false);
                          }}
                        >
                          <Icon name={item.icon} className="mr-3" />
                          {item.label}
                          {item.badge && (
                            <Badge className="ml-auto bg-purple-100 text-purple-700">
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button variant="ghost" size="sm" onClick={() => playAudio('Открываю товары')}>
                <Icon name="Package" className="text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => playAudio('Открываю поиск')}>
                <Icon name="Search" className="text-gray-600" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">6</Badge>
                <Badge variant="secondary" className="bg-gray-100">12</Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => playAudio('Открываю дополнительные опции')}>
                  <Icon name="MoreHorizontal" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => playAudio('Обновляю данные')}>
                  <Icon name="RefreshCw" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => playAudio('Открываю чат поддержки')}>
                  <Icon name="MessageCircle" />
                </Button>
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
              onClick={() => {
                setActiveTab(tab.id);
                playAudio(`Переключение на ${tab.label}`);
              }}
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

        {/* ВЫДАЧА */}
        {activeTab === 'delivery' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Scanner Section */}
            <Card className="p-8">
              <CardContent className="text-center space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Отсканируйте QR-код клиента
                </h2>
                
                <div className="relative cursor-pointer" onClick={handleQRScan}>
                  <img 
                    src="https://cdn.poehali.dev/files/3f883f17-7be0-4384-a434-f809f2537323.png"
                    alt="QR Scanner"
                    className="w-64 h-48 mx-auto object-contain hover:scale-105 transition-transform"
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
                      onFocus={() => playAudio('Поле ввода номера телефона')}
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
                    onFocus={() => playAudio('Дополнительное поле номера')}
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
                    Отсканируйте товары перед примеркой: {scannedProducts} из {totalProducts}
                  </h3>
                  <Button variant="ghost" size="sm">
                    <Icon name="ArrowLeft" className="text-gray-400" />
                  </Button>
                </div>
                
                <Progress value={(scannedProducts / totalProducts) * 100} className="mb-4" />
                
                <div className="bg-gray-100 rounded-lg p-8 text-center mb-6">
                  <div className="text-6xl font-bold text-gray-700 mb-2">
                    {cellNumber}
                  </div>
                  <div className="text-gray-500">Ячейка:</div>
                </div>

                <div className="space-y-4">
                  {mockProducts.map((product) => (
                    <div key={product.id} className={`flex items-center space-x-4 p-4 border rounded-lg transition-all ${
                      product.scanned ? 'bg-green-50 border-green-200' : 'bg-white'
                    }`}>
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => playAudio('Товар помечен как не сканировать')}
                        >
                          Не сканировать
                        </Button>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="bg-purple-500"
                            onClick={handleTryOn}
                          >
                            На примерке
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleIssue}
                          >
                            Выдать
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full mt-6 bg-purple-500 hover:bg-purple-600"
                  onClick={() => playAudio('Все товары пропущены')}
                >
                  Пропустить всё
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ПРИЕМКА */}
        {activeTab === 'receiving' && (
          <Card className="p-8 max-w-4xl mx-auto">
            <CardContent className="text-center space-y-6">
              <div className="flex items-center justify-between mb-6">
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2"
                  onClick={() => playAudio('Возвращаемся к приемке')}
                >
                  <Icon name="ArrowLeft" />
                  <span>Вернуться к приемке</span>
                </Button>
                <Badge className="bg-purple-100 text-purple-700">
                  Шаг {receivingStep} из 4
                </Badge>
              </div>
              
              <div className="flex justify-center space-x-8 mb-8">
                <div className="flex items-center space-x-4">
                  {[1, 2, 3, 4].map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
                        step <= receivingStep ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step}
                      </div>
                      {index < 3 && (
                        <div className={`w-12 h-1 mx-2 rounded transition-all ${
                          step < receivingStep ? 'bg-purple-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {receivingStep === 1 && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Отсканируйте стикер коробки
                  </h2>
                  
                  <div className="w-64 h-64 mx-auto bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center mb-6 cursor-pointer hover:bg-purple-100 transition-colors"
                       onClick={handleReceivingNext}>
                    <div className="w-32 h-32 border-4 border-purple-500 rounded-lg flex items-center justify-center">
                      <Icon name="QrCode" size={64} className="text-purple-500" />
                    </div>
                  </div>

                  <div className="text-gray-500 mb-4">или</div>
                  
                  <div className="flex space-x-2 max-w-md mx-auto">
                    <Input
                      placeholder="89585787658"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      onFocus={() => playAudio('Поле ввода штрих-кода')}
                    />
                    <Button 
                      onClick={handleReceivingNext}
                      className="bg-purple-500 hover:bg-purple-600"
                      disabled={!barcode}
                    >
                      <Icon name="Search" />
                    </Button>
                  </div>
                </>
              )}

              {receivingStep === 2 && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Проверьте целостность упаковки
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <Icon name="CheckCircle" className="text-green-500 mx-auto mb-2" size={48} />
                      <p className="text-green-700">Упаковка в хорошем состоянии</p>
                    </div>
                    <div className="flex space-x-4 justify-center">
                      <Button 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={handleReceivingNext}
                      >
                        Упаковка целая
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-red-300 text-red-600"
                        onClick={() => playAudio('Упаковка повреждена, требуется проверка')}
                      >
                        Повреждения
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {receivingStep === 3 && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Разместите товар в ячейке
                  </h2>
                  <div className="bg-purple-50 rounded-lg p-8 mb-6">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {cellNumber + 1}
                    </div>
                    <p className="text-purple-700">Рекомендуемая ячейка</p>
                  </div>
                  <Button 
                    className="bg-purple-500 hover:bg-purple-600 w-full py-3"
                    onClick={handleReceivingNext}
                  >
                    Товар размещен
                  </Button>
                </>
              )}

              {receivingStep === 4 && (
                <>
                  <div className="text-green-500 mb-4">
                    <Icon name="CheckCircle" size={64} className="mx-auto" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Приемка завершена успешно!
                  </h2>
                  <Button 
                    className="bg-purple-500 hover:bg-purple-600"
                    onClick={() => {
                      setReceivingStep(1);
                      setBarcode('');
                      handleReceivingStart();
                    }}
                  >
                    Принять следующий товар
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ВОЗВРАТ */}
        {activeTab === 'return' && (
          <Card className="p-8 max-w-4xl mx-auto">
            <CardContent className="text-center space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Возврат товаров
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-left">Отсканируйте товар</h3>
                  <div className="w-full h-48 bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors"
                       onClick={handleReturnStart}>
                    <Icon name="RotateCcw" size={64} className="text-purple-400" />
                  </div>
                  
                  <div className="text-gray-500">или</div>
                  
                  <Input
                    placeholder="Введите штрих-код товара"
                    onFocus={() => playAudio('Поле ввода штрих-кода для возврата')}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-left">Причина возврата</h3>
                  <div className="space-y-2">
                    {[
                      'Не подошел размер',
                      'Дефект товара',
                      'Не соответствует описанию',
                      'Передумал покупать',
                      'Другая причина'
                    ].map((reason) => (
                      <Button
                        key={reason}
                        variant="outline"
                        className="w-full text-left justify-start"
                        onClick={() => playAudio(`Выбрана причина: ${reason}`)}
                      >
                        {reason}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button 
                  className="bg-purple-500 hover:bg-purple-600 w-full py-3"
                  onClick={() => playAudio('Возврат товара оформлен успешно. Деньги вернутся на карту в течение 5-10 дней', 'high')}
                >
                  Оформить возврат
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;