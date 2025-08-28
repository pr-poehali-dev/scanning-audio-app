import { DeliveryTab } from '@/components/DeliveryTab';
import { ReceivingTab } from '@/components/ReceivingTab';
import { ReturnTab } from '@/components/ReturnTab';
import { AudioSettings } from '@/components/AudioSettings';
import { AudioManager } from '@/components/AudioManager';
import { AppHeader } from '@/components/AppHeader';
import { TabNavigation } from '@/components/TabNavigation';
import { useWarehouseApp } from '@/hooks/useWarehouseApp';

const Index = () => {
  const {
    // Состояния
    activeTab,
    phoneNumber,
    isScanning,
    showAudioSettings,
    showAudioManager,
    audioFiles,
    isProcessing,
    audioEnabled,
    cellNumber,
    currentStep,
    itemsCount,
    customerPhone,
    receivingStep,
    receivingBarcode,
    returnStep,
    returnReason,
    mockProducts,
    customAudioFiles,
    
    // Сеттеры
    setActiveTab,
    setPhoneNumber,
    setShowAudioSettings,
    setShowAudioManager,
    setAudioFiles,
    setAudioEnabled,
    setReceivingBarcode,
    
    // Обработчики
    handleQRScan,
    handleConfirmCode,
    handleReceivingStart,
    handleReceivingNext,
    handleReceivingReset,
    handleReturnStart,
    handleReturnComplete,
    handleReturnReasonSelect,
    handleReturnStepChange,
    handleAudioManagerUpdate,
    handleTestAudio,
    clearAllAudio,
    removeAudioFile
  } = useWarehouseApp();

  // Конфигурация вкладок
  const tabs = [
    { id: 'delivery', label: 'Выдача', count: itemsCount, icon: 'Package' },
    { id: 'receiving', label: 'Приёмка', count: 47, icon: 'ArrowDown' },
    { id: 'return', label: 'Возврат', count: 13, icon: 'RotateCcw' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <AppHeader
        customAudioFiles={customAudioFiles}
        onShowAudioManager={() => setShowAudioManager(true)}
        onShowAudioSettings={() => setShowAudioSettings(true)}
        onTestAudio={handleTestAudio}
        onClearAudio={clearAllAudio}
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
      </div>

      {/* Модальные окна */}
      {showAudioSettings && (
        <AudioSettings 
          onClose={() => setShowAudioSettings(false)}
          onAudioFilesUpdate={(files) => {
            setAudioFiles(files);
          }}
          existingFiles={audioFiles}
        />
      )}

      {showAudioManager && (
        <AudioManager 
          onClose={() => setShowAudioManager(false)}
          onAudioUpdate={handleAudioManagerUpdate}
          existingFiles={customAudioFiles}
        />
      )}
    </div>
  );
};

export default Index;