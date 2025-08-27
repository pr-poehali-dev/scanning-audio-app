import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/AppHeader';
import { DeliveryTab } from '@/components/DeliveryTab';
import { ReceivingTab } from '@/components/ReceivingTab';
import { ReturnTab } from '@/components/ReturnTab';

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
    }, 2000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <AppHeader 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        playAudio={playAudio}
      />

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

        {/* Tab Content */}
        {activeTab === 'delivery' && (
          <DeliveryTab
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            secondPhone={secondPhone}
            setSecondPhone={setSecondPhone}
            isScanning={isScanning}
            cellNumber={cellNumber}
            scannedProducts={scannedProducts}
            totalProducts={totalProducts}
            handleQRScan={handleQRScan}
            handleConfirmCode={handleConfirmCode}
            handleTryOn={handleTryOn}
            handleIssue={handleIssue}
            playAudio={playAudio}
          />
        )}

        {activeTab === 'receiving' && (
          <ReceivingTab
            receivingStep={receivingStep}
            barcode={barcode}
            setBarcode={setBarcode}
            cellNumber={cellNumber}
            handleReceivingNext={handleReceivingNext}
            handleReceivingStart={handleReceivingStart}
            playAudio={playAudio}
          />
        )}

        {activeTab === 'return' && (
          <ReturnTab
            handleReturnStart={handleReturnStart}
            playAudio={playAudio}
          />
        )}
      </div>
    </div>
  );
};

export default Index;