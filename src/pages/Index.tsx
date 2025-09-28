import { DeliveryTab } from '@/components/DeliveryTab';
import { ReceivingTab } from '@/components/ReceivingTab';
import ReturnsTab from '@/components/ReturnsTab';
import { AppHeader } from '@/components/AppHeader';
import { TabNavigation } from '@/components/TabNavigation';
import { useWarehouseApp } from '@/hooks/useWarehouseApp';

const Index = () => {
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
      <AppHeader />

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