import Icon from '@/components/ui/icon';
import DeliveryInterface from './DeliveryInterface';
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
  currentOrder
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
        />
      );
    }

    // Изначальное состояние - сканирование клиента
    return (
      <div className="max-w-md mx-auto text-center space-y-8">
        {/* QR Scanner */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-700">
            Отсканируйте QR-код клиента или курьера
          </h2>
          
          <div 
            className={`relative w-48 h-48 mx-auto transition-all duration-300 ${
              isScanning ? 'animate-pulse' : ''
            }`}
            onClick={onQRScan}
            style={{ cursor: 'pointer' }}
          >
            <img 
              src="https://cdn.poehali.dev/files/f9ab2ff9-989f-470e-8af1-67520cb6feec.png"
              alt="QR Scanner"
              className="w-full h-full object-contain"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-purple-100 bg-opacity-80 rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-purple-600 text-sm font-medium">Поиск заказа...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Результат сканирования */}
          {scannedData && currentOrder && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
                <h4 className="font-medium text-green-800">Готово к выдаче!</h4>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Клиент:</strong> {currentOrder.customerName}</p>
                <p><strong>Ячейка:</strong> {currentOrder.cellNumber}</p>
                <p><strong>Товаров:</strong> {currentOrder.items.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-500 text-sm font-medium">ИЛИ</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Phone Input */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-700">
            Введите номер телефона клиента
          </h3>
          
          <div className="space-y-2">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Последние 4 цифры номера"
              className="w-full px-4 py-3 text-lg text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              maxLength={4}
            />
            
            <button
              onClick={() => onPhoneSubmit(phoneNumber)}
              disabled={phoneNumber.length !== 4}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                phoneNumber.length === 4
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Найти заказ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'acceptance') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="space-y-6">
          <Icon name="ArrowDown" size={48} className="text-purple-600 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">Приёмка товаров</h2>
          <p className="text-gray-600">Функция приёмки в разработке</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'returns') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="space-y-6">
          <Icon name="RotateCcw" size={48} className="text-purple-600 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">Возврат товаров</h2>
          <p className="text-gray-600">Функция возврата в разработке</p>
        </div>
      </div>
    );
  }

  return null;
};

export default TabContent;