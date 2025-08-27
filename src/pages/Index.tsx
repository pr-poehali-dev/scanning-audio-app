import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/AppHeader';
import { DeliveryTab } from '@/components/DeliveryTab';
import { ReceivingTab } from '@/components/ReceivingTab';
import { ReturnTab } from '@/components/ReturnTab';
import { useAudio, audioSystem } from '@/components/AudioSystem';

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

  // Новая система озвучки из облака
  const { playAudio } = useAudio();
  
  // Предзагрузка критически важных аудиофайлов
  useEffect(() => {
    audioSystem.preloadCriticalAudio();
  }, []);

  // Озвучка при смене вкладок
  useEffect(() => {
    const audioKeys = {
      delivery: 'tab-delivery',
      receiving: 'tab-receiving', 
      return: 'tab-return'
    };
    if (audioKeys[activeTab]) {
      playAudio(audioKeys[activeTab]);
    }
  }, [activeTab, playAudio]);

  const handleQRScan = () => {
    setIsScanning(true);
    playAudio('scan-discount-check', 'high');
    
    setTimeout(() => {
      setIsScanning(false);
      playAudio('check-product-camera');
    }, 2000);
  };

  const handleTryOn = () => {
    playAudio('product-to-fitting');
  };

  const handleIssue = () => {
    playAudio('product-issued-rate', 'high');
  };

  const handleReceivingStart = () => {
    setReceivingStep(1);
    playAudio('receiving-start');
  };

  const handleReceivingNext = () => {
    if (receivingStep < 4) {
      setReceivingStep(prev => prev + 1);
      const audioKeys = {
        2: 'check-package',
        3: 'place-in-cell',
        4: 'receiving-complete'
      };
      playAudio(audioKeys[receivingStep + 1]);
    }
  };

  const handleReturnStart = () => {
    playAudio('return-start');
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