import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AudioUploader } from '@/components/AudioUploader';
import { DeliveryTab } from '@/components/DeliveryTab';
import { ReceivingTab } from '@/components/ReceivingTab';
import { ReturnTab } from '@/components/ReturnTab';
import { useAudio } from '@/hooks/useAudio';
import Icon from '@/components/ui/icon';

interface Product {
  id: string;
  article: string;
  name: string;
  size: string;
  color: string;
  barcode: string;
}

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
  const mockProducts: Product[] = Array.from({ length: itemsCount }, (_, index) => ({
    id: `16466782${index + 7}`,
    article: `456${index + 9}`,
    name: ['ТЕЛОДВИЖЕНИЯ / Свитшот женский...', 'ТЕЛОДВИЖЕНИЯ / Лонгслив женский...', 'ТЕЛОДВИЖЕНИЯ / Худи унисекс...'][Math.floor(Math.random() * 3)],
    size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
    color: ['Розовый', 'Черный', 'Белый', 'Серый'][Math.floor(Math.random() * 4)],
    barcode: `48574857475${index + 8}`,
  }));

  // Обработчики для выдачи
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

  const handleConfirmCode = () => {
    if (phoneNumber.length === 4) {
      handleQRScan();
    }
  };

  // Обработчики для приемки
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

  const handleReceivingReset = () => {
    setReceivingStep(1);
  };

  // Обработчики для возврата
  const handleReturnStart = () => {
    playAudio('return-start');
    setReturnStep(2);
  };

  const handleReturnComplete = () => {
    playAudio('return-complete');
    setReturnStep(1);
  };

  const handleReturnReasonSelect = (reason: string) => {
    setReturnReason(reason);
  };

  const handleReturnStepChange = (step: number) => {
    setReturnStep(step);
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
          <DeliveryTab
            currentStep={currentStep}
            cellNumber={cellNumber}
            itemsCount={itemsCount}
            mockProducts={mockProducts}
            isScanning={isScanning}
            phoneNumber={phoneNumber}
            onPhoneNumberChange={setPhoneNumber}
            onQRScan={handleQRScan}
            onManagerScan={handleManagerScan}
            onTryOn={handleTryOn}
            onIssue={handleIssue}
            onConfirmCode={handleConfirmCode}
          />
        )}

        {/* Приёмка */}
        {activeTab === 'receiving' && (
          <ReceivingTab
            receivingStep={receivingStep}
            receivingBarcode={receivingBarcode}
            onReceivingBarcodeChange={setReceivingBarcode}
            onReceivingStart={handleReceivingStart}
            onReceivingNext={handleReceivingNext}
            onReceivingReset={handleReceivingReset}
          />
        )}

        {/* Возврат */}
        {activeTab === 'return' && (
          <ReturnTab
            returnStep={returnStep}
            returnReason={returnReason}
            onReturnStart={handleReturnStart}
            onReturnComplete={handleReturnComplete}
            onReturnReasonSelect={handleReturnReasonSelect}
            onReturnStepChange={handleReturnStepChange}
          />
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