import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AudioUploader } from '@/components/AudioUploader';
import { useAudio } from '@/hooks/useAudio';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeTab, setActiveTab] = useState('delivery');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showAudioUploader, setShowAudioUploader] = useState(false);
  
  // Состояния для выдачи
  const [cellNumber] = useState(() => Math.floor(Math.random() * 482) + 1); // Случайная ячейка 1-482
  const [currentStep, setCurrentStep] = useState('scan'); // scan, manager-scan, check, try-on, payment, rate
  const [itemsCount] = useState(() => Math.floor(Math.random() * 5) + 1); // Случайное количество 1-5 товаров
  
  // Состояния для приемки
  const [receivingStep, setReceivingStep] = useState(1); // 1-4 этапы приемки
  const [receivingBarcode, setReceivingBarcode] = useState('');
  
  // Состояния для возврата
  const [returnStep, setReturnStep] = useState(1); // 1-3 этапы возврата
  const [returnReason, setReturnReason] = useState('');

  const { playAudio, playCellAudio, updateAudioFiles, removeAudioFile, clearAllAudio, customAudioFiles } = useAudio();

  // Симуляция товаров - генерируем случайное количество
  const mockProducts = Array.from({ length: itemsCount }, (_, index) => ({
    id: `16466782${index + 7}`,
    article: `456${index + 9}`,
    name: ['ТЕЛОДВИЖЕНИЯ / Свитшот женский...', 'ТЕЛОДВИЖЕНИЯ / Лонгслив женский...', 'ТЕЛОДВИЖЕНИЯ / Худи унисекс...'][Math.floor(Math.random() * 3)],
    size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
    color: ['Розовый', 'Черный', 'Белый', 'Серый'][Math.floor(Math.random() * 4)],
    barcode: `48574857475${index + 8}`,
  }));

  const handleQRScan = async () => {
    if (activeTab === 'delivery') {
      setIsScanning(true);
      
      // 1. Озвучка ячейки и скидки (клиент сканирует QR)
      await playAudio('cell-number');
      setTimeout(() => playCellAudio(String(cellNumber)), 500);
      setTimeout(() => playAudio('check-discount-wallet'), 2000);
      
      setTimeout(() => {
        setIsScanning(false);
        setCurrentStep('manager-scan'); // Ждем когда менеджер принесет товар
        
        // Автоматический вызов сканирования менеджером (имитация)
        setTimeout(() => {
          handleManagerScan();
        }, 3000); // Менеджер принесет товар через 3 секунды
      }, 3500);
    }
  };

  const handleManagerScan = async () => {
    // 2. Менеджер приносит товар со склада и сканирует (автоматически)
    setCurrentStep('check');
    await playAudio('check-product-camera');
    
    // Переход к кнопкам действий
    setTimeout(() => {
      setCurrentStep('actions'); // Исправлено: должно быть 'actions' чтобы совпадало с JSX
    }, 2000);
  };

  const handleTryOn = () => {
    console.log('Товар отправлен на примерку');
    setCurrentStep('payment'); // Ждем пока клиент примерит
  };

  const handleIssue = () => {
    console.log('Товар выдан клиенту');
    setCurrentStep('payment');
    // Симуляция: когда оплата пройдет, играем озвучку оценки
    setTimeout(() => {
      playAudio('rate-pickup-point');
      setTimeout(() => {
        // Сброс к начальному состоянию для следующего клиента
        setCurrentStep('scan');
      }, 3000);
    }, 4000); // Ждем 4 секунды до "оплаты"
  };

  // Приемка
  const handleReceivingStart = () => {
    playAudio('receiving-start');
    setReceivingStep(2);
  };

  const handleReceivingNext = () => {
    if (receivingStep < 4) {
      const nextStep = receivingStep + 1;
      setReceivingStep(nextStep);
      
      if (nextStep === 4) {
        playAudio('receiving-complete');
      }
    }
  };

  // Возврат
  const handleReturnStart = () => {
    playAudio('return-start');
    setReturnStep(2);
  };

  const handleReturnComplete = () => {
    playAudio('return-complete');
    setReturnStep(1);
  };

  const handleConfirmCode = () => {
    if (phoneNumber.length === 4) {
      handleQRScan();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img src="https://cdn.poehali.dev/files/042b80d5-4fd3-473f-b81d-c42ef32edea0.png" alt="WB" className="w-8 h-8" />
              </div>
              <div className="text-sm text-gray-600">
                <div>ID 50006760</div>
                <div>V1.0.67</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Icon name="Menu" className="w-6 h-6 text-gray-600" />
              <Icon name="Package" className="w-6 h-6 text-gray-600" />
              <Icon name="Search" className="w-6 h-6 text-gray-600" />
              <Icon name="MessageCircle" className="w-6 h-6 text-gray-600" />
              <Icon name="User" className="w-6 h-6 text-gray-600" />
              <Button 
                onClick={() => setShowAudioUploader(true)}
                variant="outline"
                size="sm"
              >
                <Icon name="Volume2" className="w-4 h-4 mr-2" />
                Озвучка
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Icon name="Download" className="w-4 h-4 mr-2" />
                Установить версию
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'delivery', label: 'Выдача', count: null, icon: 'Package' },
              { id: 'receiving', label: 'Приёмка', count: null, icon: 'Inbox' },
              { id: 'return', label: 'Возврат', count: 13, icon: 'RotateCcw' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon name={tab.icon} className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count && (
                  <Badge className="bg-gray-200 text-gray-800 text-xs">
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* User Avatar */}
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-8">
          <Icon name="User" className="w-6 h-6 text-purple-600" />
        </div>

        {/* Выдача */}
        {activeTab === 'delivery' && (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {currentStep === 'scan' && (
              <>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Отсканируйте QR-код клиента или курьера
                </h1>

                <div className="relative">
                  <img 
                    src="https://cdn.poehali.dev/files/b424339e-eb83-4c2d-8902-4d08926a37df.png"
                    alt="QR Scanner"
                    className="w-80 h-60 mx-auto object-contain cursor-pointer hover:scale-105 transition-transform"
                    onClick={handleQRScan}
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg animate-pulse flex items-center justify-center">
                      <div className="text-blue-700 font-medium">Сканирование...</div>
                    </div>
                  )}
                </div>

                <div className="text-lg text-gray-600">или</div>

                <Card className="max-w-md mx-auto">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Введите номер телефона клиента</h2>
                    <div className="space-y-4">
                      <Input
                        placeholder="Последние 4 цифры номера"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="text-center text-lg"
                        maxLength={4}
                      />
                      <Button 
                        onClick={handleConfirmCode}
                        className="w-full bg-purple-500 hover:bg-purple-600 py-3"
                        disabled={!phoneNumber || phoneNumber.length !== 4}
                      >
                        Найти заказы
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {currentStep === 'manager-scan' && (
              <div className="flex h-screen">
                {/* Левая часть - информация о ячейке */}
                <div className="w-1/2 flex flex-col items-center justify-center bg-gray-50 p-8">
                  <div className="text-center mb-8">
                    <div className="text-sm text-gray-600 mb-2">
                      Отсканируйте товары перед примеркой: 0 из {itemsCount}
                    </div>
                    
                    <div className="bg-gray-200 rounded-lg p-8 mb-6">
                      <div className="text-sm text-gray-600 mb-2">Ячейка:</div>
                      <div className="text-6xl font-bold text-gray-800">{cellNumber}</div>
                    </div>
                    
                    {/* QR Scanner */}
                    <div className="relative border-4 border-dashed border-purple-300 rounded-lg p-6">
                      <img 
                        src="https://cdn.poehali.dev/files/e5b9f145-0416-4038-a4f2-54bf7de46618.png"
                        alt="QR Scanner"
                        className="w-32 h-32 mx-auto object-contain cursor-pointer"
                        onClick={handleManagerScan}
                      />
                    </div>
                  </div>
                </div>

                {/* Правая часть - список товаров */}
                <div className="w-1/2 p-6 bg-white">
                  <div className="mb-4">
                    <div className="text-gray-600 text-sm mb-4">Список товаров для сканирования:</div>
                  </div>
                  
                  <div className="space-y-4">
                    {mockProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img 
                          src={`https://via.placeholder.com/80x80/f0f0f0/999?text=Товар`}
                          alt="Product"
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{product.id} {product.article}</div>
                          <div className="text-sm text-gray-600">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            Размер: {product.size} Цвет: {product.color}
                          </div>
                          <div className="text-xs text-gray-400">Баркод: {product.barcode}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            Не сканировать
                          </Button>
                          {index === 0 && (
                            <Button size="sm" variant="outline" className="text-xs text-purple-600">
                              Смотреть все
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      Пропустить все
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'check' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Ячейка: {cellNumber}</h2>
                <div className="text-lg text-green-600">📱 Товар отсканирован менеджером</div>
                <div className="text-lg text-blue-600">🔍 "Проверьте товар под камерой"</div>
              </div>
            )}

            {currentStep === 'actions' && (
              <div className="flex h-screen">
                {/* Левая панель - информация о ячейке */}
                <div className="w-80 bg-gray-50 p-6 flex flex-col">
                  <div className="text-center mb-8">
                    <div className="text-sm text-gray-600 mb-1">Ячейка</div>
                    <div className="text-6xl font-bold text-gray-800 mb-6">{cellNumber}</div>
                    
                    <div className="text-sm text-gray-600 mb-2">Товаров</div>
                    <div className="text-2xl font-bold text-gray-800 mb-4">{itemsCount} из {itemsCount}</div>
                    
                    <div className="text-sm text-gray-600 mb-2">Пакетов</div>
                    <div className="text-2xl font-bold text-gray-800 mb-6">3</div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6">
                      <Icon name="Plus" className="mx-auto w-8 h-8 text-gray-400" />
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">К оплате</div>
                    <div className="text-xl font-bold text-purple-600 mb-6">17 876 ₽</div>
                  </div>
                  
                  <div className="mt-auto space-y-3">
                    <Button 
                      onClick={handleIssue}
                      className="w-full bg-purple-500 hover:bg-purple-600 py-3"
                    >
                      Выдать
                    </Button>
                    <Button 
                      onClick={handleTryOn}
                      variant="outline"
                      className="w-full py-3"
                    >
                      Снять с примерки
                    </Button>
                  </div>
                </div>

                {/* Правая часть - товары */}
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                        <span className="text-sm">Снять все</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Клиент +7 (...) ... 75 89
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    {mockProducts.map((product) => (
                      <div key={product.id} className="relative">
                        <div className="absolute top-2 left-2 z-10">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Icon name="Check" className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 z-10">
                          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Оплачен
                          </div>
                        </div>
                        <div className="absolute top-8 right-2 z-10">
                          <Icon name="RotateCcw" className="w-5 h-5 text-green-600" />
                        </div>
                        
                        <div className="bg-white rounded-lg border p-4">
                          <img 
                            src={`https://via.placeholder.com/200x200/f0f0f0/999?text=Товар`}
                            alt="Product"
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                          
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{product.id} {product.article}</div>
                            <div className="text-xs text-gray-600">{product.name}</div>
                            <div className="text-purple-600 text-sm font-bold">1 935 ₽ 5 670 ₽</div>
                            <div className="text-xs text-gray-500">
                              Цвет: {product.color} Размер: {product.size}
                            </div>
                            <div className="text-xs text-gray-400">Баркод: {product.barcode}</div>
                          </div>
                        </div>
                        
                        <div className="absolute bottom-4 right-4">
                          <Icon name="MoreHorizontal" className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">💳 Ожидание оплаты</h2>
                <div className="text-lg text-blue-600">Клиент производит оплату...</div>
                <div className="text-sm text-gray-500">После оплаты прозвучит просьба оценить пункт выдачи</div>
                <div className="animate-pulse text-green-600">⏳ Ожидание...</div>
              </div>
            )}
          </div>
        )}

        {/* Приёмка */}
        {activeTab === 'receiving' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold text-center">Приёмка товара</h1>
            
            {receivingStep === 1 && (
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <h2 className="text-xl">Готовы начать приёмку?</h2>
                  <Button onClick={handleReceivingStart} className="bg-purple-500">
                    Начать приёмку
                  </Button>
                </CardContent>
              </Card>
            )}

            {receivingStep === 2 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl">Этап 1: Сканирование стикера коробки</h2>
                  <Input
                    placeholder="Отсканируйте или введите штрихкод"
                    value={receivingBarcode}
                    onChange={(e) => setReceivingBarcode(e.target.value)}
                  />
                  <Button onClick={handleReceivingNext} disabled={!receivingBarcode}>
                    Далее
                  </Button>
                </CardContent>
              </Card>
            )}

            {receivingStep === 3 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl">Этап 2: Проверка упаковки</h2>
                  <div className="space-y-2">
                    <Button onClick={handleReceivingNext} className="w-full bg-green-500">
                      Упаковка в порядке
                    </Button>
                    <Button variant="outline" className="w-full text-red-600 border-red-300">
                      Упаковка повреждена
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {receivingStep === 4 && (
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <h2 className="text-xl text-green-600">Приёмка завершена успешно!</h2>
                  <Button onClick={() => setReceivingStep(1)}>
                    Новая приёмка
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Возврат */}
        {activeTab === 'return' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold text-center">Возврат товара</h1>
            
            {returnStep === 1 && (
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <h2 className="text-xl">Готовы оформить возврат?</h2>
                  <Button onClick={handleReturnStart} className="bg-red-500">
                    Начать возврат
                  </Button>
                </CardContent>
              </Card>
            )}

            {returnStep === 2 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl">Выберите причину возврата</h2>
                  <div className="space-y-2">
                    {[
                      'Не подошёл размер',
                      'Не понравился товар',
                      'Брак или повреждение',
                      'Другая причина'
                    ].map((reason) => (
                      <Button
                        key={reason}
                        variant="outline"
                        className="w-full text-left"
                        onClick={() => {
                          setReturnReason(reason);
                          setReturnStep(3);
                        }}
                      >
                        {reason}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {returnStep === 3 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl">Причина: {returnReason}</h2>
                  <Button onClick={handleReturnComplete} className="w-full bg-red-500">
                    Оформить возврат
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Audio Uploader Modal */}
      {showAudioUploader && (
        <AudioUploader
          onAudioFilesUpdate={updateAudioFiles}
          onClose={() => setShowAudioUploader(false)}
          removeAudioFile={removeAudioFile}
          clearAllAudio={clearAllAudio}
          existingFiles={customAudioFiles}
        />
      )}
    </div>
  );
};

export default Index;