import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { DeliveryTab } from '@/components/DeliveryTab';
import { ReceivingTab } from '@/components/ReceivingTab';
import { ReturnTab } from '@/components/ReturnTab';
import { AudioSettings } from '@/components/AudioSettings';
import { AudioManager } from '@/components/AudioManager';
import { useAudio } from '@/hooks/useAudio';
import Icon from '@/components/ui/icon';

interface Product {
  id: string;
  article: string;
  name: string;
  size: string;
  color: string;
  barcode: string;
  currentPrice: number;
  originalPrice: number;
}

interface AudioFiles {
  delivery: File[];
  receiving: File[];
  return: File[];
  cells: File[];
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('delivery');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showAudioManager, setShowAudioManager] = useState(false);
  const [audioFiles, setAudioFiles] = useState<AudioFiles>({
    delivery: [],
    receiving: [],
    return: [],
    cells: []
  });

  const [isProcessing, setIsProcessing] = useState(false); // Предотвращаем множественные вызовы
  const [audioEnabled, setAudioEnabled] = useState(false); // Разрешение на воспроизведение аудио
  
  // Принудительный сброс isProcessing через 10 секунд на случай зависания
  useEffect(() => {
    if (isProcessing) {
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Принудительный сброс isProcessing через 10 секунд');
        setIsProcessing(false);
      }, 10000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isProcessing]);
  
  // Состояния для выдачи
  const [cellNumber] = useState(() => Math.floor(Math.random() * 482) + 1); // Случайная ячейка 1-482
  const [currentStep, setCurrentStep] = useState('scan'); // scan, manager-scan, check, try-on, payment, rate
  const [itemsCount] = useState(() => Math.floor(Math.random() * 8) + 1); // Случайное количество 1-8 товаров
  const [customerPhone] = useState(() => {
    // Генерируем случайный номер телефона
    const codes = ['9', '8', '7', '6', '5'];
    const code = codes[Math.floor(Math.random() * codes.length)];
    const digits = Math.floor(Math.random() * 9000) + 1000;
    return `+7 (...) ... ${code}${digits.toString().slice(0, 1)} ${digits.toString().slice(1, 3)}`;
  });
  
  // Состояния для приемки
  const [receivingStep, setReceivingStep] = useState(1); // 1-4 этапы приемки
  const [receivingBarcode, setReceivingBarcode] = useState('');
  
  // Состояния для возврата
  const [returnStep, setReturnStep] = useState(1); // 1-3 этапы возврата
  const [returnReason, setReturnReason] = useState('');

  const { playAudio, playCellAudio, updateAudioFiles, removeAudioFile, clearAllAudio, customAudioFiles } = useAudio();

  // Симуляция товаров - генерируем случайное количество
  const productNames = [
    'Nike / Кроссовки мужские Air Max',
    'Adidas / Футболка женская Originals',
    'Zara / Джинсы женские slim fit',
    'H&M / Платье вечернее чёрное',
    'Uniqlo / Рубашка мужская белая',
    'Levi\'s / Куртка джинсовая классическая',
    'Calvin Klein / Трусы мужские набор 3шт',
    'Tommy Hilfiger / Поло мужское синее',
    'Apple / Чехол для iPhone 14 Pro',
    'Samsung / Наушники Galaxy Buds Pro',
    'Xiaomi / Powerbank 20000mAh',
    'Logitech / Мышь беспроводная MX Master',
    'ТЕЛОДВИЖЕНИЯ / Худи унисекс черное',
    'ТЕЛОДВИЖЕНИЯ / Свитшот женский розовый',
    'ТЕЛОДВИЖЕНИЯ / Лонгслив мужской серый'
  ];

  // Функция для генерации реальных цен
  const generatePrices = () => {
    const originalPrice = Math.floor(Math.random() * 8000) + 500; // От 500 до 8500
    const discountPercent = Math.floor(Math.random() * 70) + 10; // Скидка от 10% до 80%
    const currentPrice = Math.floor(originalPrice * (100 - discountPercent) / 100);
    return { currentPrice, originalPrice };
  };

  const mockProducts: Product[] = Array.from({ length: itemsCount }, (_, index) => {
    const { currentPrice, originalPrice } = generatePrices();
    return {
      id: `16466782${Math.floor(Math.random() * 9000) + 1000}${index}`,
      article: `${Math.floor(Math.random() * 9000) + 1000}`,
      name: productNames[Math.floor(Math.random() * productNames.length)],
      size: ['XS', 'S', 'M', 'L', 'XL', '42', '43', '44', '46', '48', 'Универсальный'][Math.floor(Math.random() * 11)],
      color: ['Черный', 'Белый', 'Серый', 'Синий', 'Красный', 'Зелёный', 'Жёлтый', 'Фиолетовый', 'Розовый', 'Коричневый'][Math.floor(Math.random() * 10)],
      barcode: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
      currentPrice,
      originalPrice
    };
  });

  // Включение аудио при первом взаимодействии
  const enableAudio = () => {
    if (!audioEnabled) {
      setAudioEnabled(true);
      // Тестовый тихий звук для разблокировки
      const silent = new Audio('data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAAAMAC4AAAAAA//8AAAAAAAAAAAAAAAAAAAAAAAAA//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      silent.play().catch(() => {});
      console.log('🔊 Аудио разблокировано');
    }
  };

  // Обработчики для выдачи
  const handleQRScan = async () => {
    enableAudio();
    if (activeTab === 'delivery' && !isProcessing) {
      setIsProcessing(true);
      setIsScanning(true);
      
      try {
        // 1. Озвучка ячейки и скидки (клиент сканирует QR)
        console.log('🔊 Начинаем озвучку для QR сканирования');
        
        try {
          await playAudio('cell-number');
          await new Promise(resolve => setTimeout(resolve, 500));
          await playCellAudio(String(cellNumber));
          await new Promise(resolve => setTimeout(resolve, 1500));
          await playAudio('check-discount-wallet');
        } catch (audioError) {
          console.warn('Ошибка озвучки (продолжаем):', audioError);
        }
        
        // Завершаем сканирование и переходим к следующему этапу
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsScanning(false);
        setCurrentStep('manager-scan');
        
        // Автоматически имитируем действие менеджера через 1 секунду
        setTimeout(() => {
          handleManagerScan();
        }, 1000);
        
      } catch (error) {
        console.error('Ошибка в процессе QR сканирования:', error);
        setIsScanning(false);
        setIsProcessing(false);
      }
    }
  };

  const handleManagerScan = async () => {
    enableAudio();
    try {
      console.log('🔊 Менеджер сканирует товар');
      setCurrentStep('check');
      
      // Озвучка проверки товара под камерой
      try {
        await playAudio('check-product-camera');
      } catch (audioError) {
        console.warn('Ошибка озвучки (продолжаем):', audioError);
      }
      
      // Через 1 секунду переходим к действиям
      setTimeout(() => {
        setCurrentStep('actions');
      }, 1000);
      
    } catch (error) {
      console.error('Ошибка при сканировании менеджером:', error);
      // В любом случае переходим к actions
      setTimeout(() => {
        setCurrentStep('actions');
      }, 1000);
    }
  };

  const handleTryOn = async () => {
    if (isProcessing) return;
    
    enableAudio();
    setIsProcessing(true);
    console.log('✅ Товар отправлен на примерку');
    setCurrentStep('payment');
    
    try {
      // Имитируем время на примерку (2 секунды)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // После примерки запускаем процесс оплаты и оценки
      try {
        await playAudio('rate-pickup-point');
      } catch (audioError) {
        console.warn('Ошибка озвучки (продолжаем):', audioError);
      }
      
      // В любом случае завершаем через 1.5 секунды
      setTimeout(() => {
        setCurrentStep('scan');
        setPhoneNumber('');
        setIsProcessing(false);
      }, 1500);
      
    } catch (error) {
      console.error('Ошибка в процессе примерки:', error);
      setIsProcessing(false);
    }
  };

  const handleIssue = async () => {
    if (isProcessing) return;
    
    enableAudio();
    setIsProcessing(true);
    console.log('✅ Товар выдан клиенту');
    setCurrentStep('payment');
    
    try {
      // Симуляция ожидания оплаты (1.5 секунды)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Озвучка просьбы оценить пункт выдачи
      try {
        await playAudio('rate-pickup-point');
      } catch (audioError) {
        console.warn('Ошибка озвучки (продолжаем):', audioError);
      }
      
      // В любом случае завершаем через 1.5 секунды
      setTimeout(() => {
        setCurrentStep('scan');
        setPhoneNumber(''); // Очищаем номер телефона
        setIsProcessing(false); // Разрешаем новый цикл
      }, 1500);
      
    } catch (error) {
      console.error('Ошибка в процессе выдачи:', error);
      setIsProcessing(false);
    }
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

  // Функция обновления аудиофайлов (старая система)
  const handleAudioFilesUpdate = (newAudioFiles: AudioFiles) => {
    setAudioFiles(newAudioFiles);
    console.log('Аудиофайлы обновлены:', newAudioFiles);
  };

  // Обновление аудио через AudioManager
  const handleAudioManagerUpdate = (newFiles: { [key: string]: string }) => {
    updateAudioFiles(newFiles);
    console.log('Озвучка обновлена через AudioManager:', Object.keys(newFiles));
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
              <Button
                variant="ghost" 
                size="sm"
                onClick={() => setShowAudioManager(true)}
                className="text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
              >
                <Icon name="Volume2" className="w-5 h-5 mr-2" />
                Загрузить озвучку
              </Button>
              <Button
                variant="ghost" 
                size="sm"
                onClick={() => setShowAudioSettings(true)}
                className="text-gray-600 hover:text-blue-600"
              >
                <Icon name="Settings" className="w-5 h-5 mr-2" />
                Настройки
              </Button>
              <Icon name="Menu" className="w-6 h-6 text-gray-600" />
              <Icon name="Package" className="w-6 h-6 text-gray-600" />
              <Icon name="Search" className="w-6 h-6 text-gray-600" />
              <Icon name="MessageCircle" className="w-6 h-6 text-gray-600" />
              <Icon name="User" className="w-6 h-6 text-gray-600" />
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
            isProcessing={isProcessing}
            phoneNumber={phoneNumber}
            customerPhone={customerPhone}
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

      {/* Модальное окно загрузки озвучки */}
      {showAudioManager && (
        <AudioManager
          onClose={() => setShowAudioManager(false)}
          onAudioFilesUpdate={handleAudioManagerUpdate}
        />
      )}

      {/* Модальное окно настроек озвучки (старое) */}
      {showAudioSettings && (
        <AudioSettings
          onClose={() => setShowAudioSettings(false)}
          onAudioFilesUpdate={handleAudioFilesUpdate}
          existingFiles={audioFiles}
        />
      )}
    </div>
  );
};

export default Index;