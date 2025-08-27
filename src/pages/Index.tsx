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
  const [cellNumber] = useState(1189);
  const [currentStep, setCurrentStep] = useState('scan'); // scan, check, actions, payment
  
  // Состояния для приемки
  const [receivingStep, setReceivingStep] = useState(1); // 1-4 этапы приемки
  const [receivingBarcode, setReceivingBarcode] = useState('');
  
  // Состояния для возврата
  const [returnStep, setReturnStep] = useState(1); // 1-3 этапы возврата
  const [returnReason, setReturnReason] = useState('');

  const { playAudio, playCellAudio, updateAudioFiles, removeAudioFile, clearAllAudio, customAudioFiles } = useAudio();

  // Симуляция товаров
  const mockProducts = [
    {
      id: '164667827',
      article: '4569',
      name: 'ТЕЛОДВИЖЕНИЯ / Лонгслив женский...',
      size: 'Серый',
      color: 'Серый',
      barcode: '485748574758',
    },
    {
      id: '164667828',
      article: '4570',
      name: 'ТЕЛОДВИЖЕНИЯ / Свитшот женский...',
      size: 'Черный',
      color: 'Черный',
      barcode: '485748574759',
    }
  ];

  const handleQRScan = async () => {
    if (activeTab === 'delivery') {
      setIsScanning(true);
      
      // Озвучка ячейки и скидки
      await playAudio('cell-number');
      setTimeout(() => playCellAudio(String(cellNumber)), 500);
      setTimeout(() => playAudio('check-discount-wallet'), 2000);
      
      setTimeout(() => {
        setIsScanning(false);
        setCurrentStep('check');
        
        // Автоматическое сканирование товара менеджером
        setTimeout(() => {
          playAudio('check-product-camera');
          setCurrentStep('actions');
        }, 2000);
      }, 3000);
    }
  };

  const handleTryOn = () => {
    console.log('Товар на примерку');
  };

  const handleIssue = () => {
    setCurrentStep('payment');
    // Симуляция оплаты
    setTimeout(() => {
      playAudio('rate-pickup-point');
      setCurrentStep('scan'); // Возврат к начальному состоянию
    }, 2000);
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

            {currentStep === 'check' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Ячейка: {cellNumber}</h2>
                <div className="text-lg text-blue-600">Менеджер приносит товар со склада...</div>
              </div>
            )}

            {currentStep === 'actions' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Ячейка: {cellNumber}</h2>
                <div className="grid gap-4">
                  {mockProducts.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <div className="font-medium">{product.id} {product.article}</div>
                            <div className="text-sm text-gray-600">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              Размер: {product.size} Цвет: {product.color}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleTryOn}
                              className="bg-purple-500 hover:bg-purple-600"
                            >
                              На примерке
                            </Button>
                            <Button 
                              onClick={handleIssue}
                              variant="outline"
                            >
                              Выдать
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Оплата проходит...</h2>
                <div className="text-lg text-green-600">Пожалуйста, подождите</div>
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