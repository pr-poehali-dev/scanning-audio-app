import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/AppHeader';
import { DeliveryTab } from '@/components/DeliveryTab';
import { ReceivingTab } from '@/components/ReceivingTab';
import { ReturnTab } from '@/components/ReturnTab';
import { AudioSettings } from '@/components/AudioSettings';
import { VoiceControl } from '@/components/VoiceControl';
import { useAudio, audioSystem } from '@/components/AudioSystem';
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
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showVoiceControl, setShowVoiceControl] = useState(true);
  const [customAudioFiles, setCustomAudioFiles] = useState<{[key: string]: string}>({});

  // Новая система озвучки из облака
  const { playAudio } = useAudio();
  
  // Предзагрузка критически важных аудиофайлов
  useEffect(() => {
    audioSystem.preloadCriticalAudio();
    // Обновляем систему озвучки при загрузке новых файлов
    if (Object.keys(customAudioFiles).length > 0) {
      audioSystem.updateAudioFiles(customAudioFiles);
    }
  }, [customAudioFiles]);

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

  // Обработчик голосовых команд
  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);
    
    switch (command) {
      case 'delivery':
        setActiveTab('delivery');
        break;
      case 'receiving':
        setActiveTab('receiving');
        break;
      case 'return':
        setActiveTab('return');
        break;
      case 'settings':
        setShowAudioSettings(!showAudioSettings);
        break;
      case 'scan':
        handleQRScan();
        break;
      case 'try-on':
        handleTryOn();
        break;
      case 'issue':
        handleIssue();
        break;
      case 'start-receiving':
        handleReceivingStart();
        break;
      case 'next':
        handleReceivingNext();
        break;
      case 'return-item':
        handleReturnStart();
        break;
      default:
        console.log('Unknown command:', command);
    }
  };

  const handleAudioFilesUpdate = (files: {[key: string]: string}) => {
    setCustomAudioFiles(files);
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-1">
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
          
          {/* Кнопки управления */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVoiceControl(!showVoiceControl)}
              className={showVoiceControl ? 'bg-green-50 border-green-200' : ''}
            >
              <Icon name="Mic" className="w-4 h-4 mr-1" />
              Голос
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAudioSettings(!showAudioSettings)}
            >
              <Icon name="Settings" className="w-4 h-4 mr-1" />
              Озвучка
            </Button>
          </div>
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

        {/* Настройки озвучки */}
        {showAudioSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Настройки озвучки</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAudioSettings(false)}
                >
                  <Icon name="X" className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4">
                <AudioSettings onAudioFilesUpdate={handleAudioFilesUpdate} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Голосовое управление */}
      <VoiceControl 
        onCommand={handleVoiceCommand}
        isVisible={showVoiceControl}
      />
    </div>
  );
};

export default Index;