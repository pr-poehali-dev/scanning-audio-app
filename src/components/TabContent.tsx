import Icon from '@/components/ui/icon';
import DeliveryInterface from './DeliveryInterface';
import AcceptanceTab from './AcceptanceTab';
import ReturnsTab from './ReturnsTab';
import ReceptionInterface from './ReceptionInterface';
import { findOrderByPhone } from '@/data/mockOrders';

interface TabContentProps {
  activeTab: string;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  isScanning: boolean;
  scannedData: string;
  onQRScan: () => void;
  onPhoneSubmit: (digits: string) => void;
  deliveryStep: 'initial' | 'client-scanned' | 'product-scanned' | 'completed';
  isProductScanned: boolean;
  onCellClick: (cellNumber: string) => void;
  onScanProduct: () => void;
  onDeliverProduct: () => void;
  currentOrder?: any;
  playAudio?: (key: string) => void;
  activeClients?: any[];
  currentClientId?: string | null;
  onClientSwitch?: (clientId: string) => void;
}

const TabContent = ({
  activeTab,
  phoneNumber,
  setPhoneNumber,
  isScanning,
  scannedData,
  onQRScan,
  onPhoneSubmit,
  deliveryStep,
  isProductScanned,
  onCellClick,
  onScanProduct,
  onDeliverProduct,
  currentOrder,
  playAudio,
  activeClients = [],
  currentClientId,
  onClientSwitch
}: TabContentProps) => {
  if (activeTab === 'delivery') {
    // Если клиент отсканирован, показываем интерфейс выдачи  
    if (deliveryStep === 'client-scanned' || deliveryStep === 'product-scanned' || deliveryStep === 'completed') {
      return (
        <DeliveryInterface
          order={currentOrder}
          onCellClick={onCellClick}
          onScanProduct={onScanProduct}
          onDeliverProduct={onDeliverProduct}
          isProductScanned={isProductScanned}
          scannedData={scannedData}
          deliveryStep={deliveryStep}
          playAudio={playAudio}
          activeClients={activeClients}
          currentClientId={currentClientId}
          onClientSwitch={onClientSwitch}
        />
      );
    }

    // Изначальное состояние - сканирование клиента
    return (
      <div className="h-full flex items-center justify-center py-8 md:py-12">
        <div className="max-w-lg w-full mx-auto text-center space-y-8 md:space-y-10 px-4">
          {/* QR Scanner */}
          <div className="space-y-6 md:space-y-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              Отсканируйте QR-код клиента или курьера
            </h2>
            
            <div 
              className={`relative w-56 h-56 md:w-72 md:h-72 mx-auto transition-all duration-300 ${
                isScanning ? 'animate-pulse' : ''
              }`}
              onClick={onQRScan}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src="https://cdn.poehali.dev/files/f9ab2ff9-989f-470e-8af1-67520cb6feec.png"
                alt="QR Scanner"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
              {isScanning && (
                <div className="absolute inset-0 bg-purple-100 bg-opacity-80 rounded-xl flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-purple-600 text-base font-medium">Поиск заказа...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-500 text-base font-medium">ИЛИ</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Phone Input */}
          <div className="space-y-4">
            <h3 className="text-base md:text-lg font-medium text-gray-700">
              Введите номер телефона клиента
            </h3>
            
            <div className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Последние 4 цифры номера"
                className="w-full px-4 py-4 text-xl text-center border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                maxLength={4}
              />
              
              <button
                onClick={() => onPhoneSubmit(phoneNumber)}
                disabled={phoneNumber.length !== 4}
                className={`w-full py-4 text-base rounded-xl font-semibold transition-colors ${
                  phoneNumber.length === 4
                    ? 'bg-purple-600 hover:bg-purple-700 text-white active:bg-purple-800 shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Найти заказ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'acceptance') {
    return <ReceptionInterface playAudio={playAudio || (() => {})} />;
  }

  if (activeTab === 'returns') {
    return <ReturnsTab />;
  }

  return null;
};

export default TabContent;