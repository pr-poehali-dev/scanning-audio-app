import { useState } from 'react';
import { DeliveryTab } from '@/components/DeliveryTab';
import { ReceivingTab } from '@/components/ReceivingTab';
import ReturnsTab from '@/components/ReturnsTab';
import { AppHeader } from '@/components/AppHeader';
import { TabNavigation } from '@/components/TabNavigation';
import { AudioSettings } from '@/components/AudioSettings';
import { useWarehouseApp } from '@/hooks/useWarehouseApp';
import { useAppState } from '@/hooks/useAppState';

const Index = () => {
  const { audioSettings, setAudioSettings } = useAppState();
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  
  const {
    // Состояния
    activeTab,
    phoneNumber,
    isScanning,
    isProcessing,
    cellNumber,
    currentOrder,
    currentStep,
    itemsCount,
    customerPhone,
    receivingStep,
    receivingBarcode,
    mockProducts,
    
    // Аудио
    playAudio,
    uploadedFiles,
    setUploadedFiles,
    
    // Сеттеры
    setActiveTab,
    setPhoneNumber,
    setReceivingBarcode,
    
    // Обработчики
    handleQRScan,
    handleConfirmCode,
    handleReceivingStart,
    handleReceivingNext,
    handleReceivingReset,
  } = useWarehouseApp(audioSettings);

  // Конфигурация вкладок
  const tabs = [
    { id: 'delivery', label: 'Выдача', count: itemsCount, icon: 'Package' },
    { id: 'receiving', label: 'Приёмка', count: 47, icon: 'ArrowDown' },
    { id: 'return', label: 'Возврат', count: 13, icon: 'RotateCcw' }
  ];

  const handleTestAudio = async () => {
    console.log('🧪 Тест озвучки');
    console.log('📦 Загружено файлов:', Object.keys(uploadedFiles).length);
    console.log('📋 Список:', Object.keys(uploadedFiles));
    
    const filesCount = Object.keys(uploadedFiles).length;
    const hasSomeFiles = filesCount > 0;
    const hasGoodsFile = uploadedFiles['goods'] !== undefined;
    
    if (!hasSomeFiles) {
      alert('⚠️ Озвучка не работает!\n\nНе загружено ни одного файла.\n\n1. Открой "Озвучка"\n2. Загрузи аудиофайлы\n3. Попробуй снова');
      return;
    }
    
    if (!hasGoodsFile) {
      alert(`⚠️ Файл "goods.mp3" не найден!\n\nЗагружено файлов: ${filesCount}\n\nПроверь названия файлов в настройках озвучки.`);
      return;
    }
    
    alert(`✅ Всё готово!\n\nФайлов: ${filesCount}\nФайл goods.mp3: найден\n\nСейчас запущу тестовую озвучку...`);
    
    playAudio('goods');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <AppHeader 
        onOpenAudioSettings={() => setShowAudioSettings(true)} 
        onTestAudio={handleTestAudio}
      />
      
      {/* Audio Settings Dialog */}
      <AudioSettings
        open={showAudioSettings}
        onOpenChange={setShowAudioSettings}
        audioSettings={audioSettings}
        setAudioSettings={setAudioSettings}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        onTestAudio={playAudio}
      />

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Выдача */}
          {activeTab === 'delivery' && (
            <DeliveryTab
              cellNumber={cellNumber}
              currentStep={currentStep}
              itemsCount={itemsCount}
              customerPhone={customerPhone}
              phoneNumber={phoneNumber}
              isScanning={isScanning}
              isProcessing={isProcessing}
              products={mockProducts}
              currentOrder={currentOrder}
              onPhoneNumberChange={setPhoneNumber}
              onConfirmCode={handleConfirmCode}
              onQRScan={handleQRScan}
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
            <ReturnsTab />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;