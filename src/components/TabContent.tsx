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
      <div className="max-w-md mx-auto text-center space-y-8">
        {/* QR Scanner для приемки */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-700">
            Фиктивное сканирование товара для приемки
          </h2>
          
          <div 
            className={`relative w-48 h-48 mx-auto transition-all duration-300 ${
              isScanning ? 'animate-pulse' : ''
            }`}
            onClick={() => {
              console.log('📦 ПРИЕМКА: Фиктивное сканирование товара');
              // Фиктивное сканирование для приемки - БЕЗ камеры
              if (!isScanning) {
                onQRScan(); // Запускаем анимацию
                setTimeout(() => {
                  console.log('✅ ПРИЕМКА: Товар успешно принят на склад');
                }, 2000);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <img 
              src="https://cdn.poehali.dev/files/f9ab2ff9-989f-470e-8af1-67520cb6feec.png"
              alt="QR Scanner приемка"
              className="w-full h-full object-contain"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-green-100 bg-opacity-80 rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-green-600 text-sm font-medium">Сканирование товара...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Инструкции */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="ArrowDown" size={20} className="text-green-600" />
            <h3 className="text-green-900 font-medium">Приемка товаров</h3>
          </div>
          <p className="text-green-700 text-sm text-left">
            • Отсканируйте QR-код товара<br/>
            • Проверьте соответствие товара<br/>
            • Разместите в соответствующую ячейку<br/>
            • Подтвердите размещение
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === 'returns') {
    return (
      <div className="max-w-md mx-auto text-center space-y-8">
        {/* QR Scanner для возвратов */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-700">
            Фиктивное сканирование товара для возврата
          </h2>
          
          <div 
            className={`relative w-48 h-48 mx-auto transition-all duration-300 ${
              isScanning ? 'animate-pulse' : ''
            }`}
            onClick={() => {
              console.log('↩️ ВОЗВРАТ: Фиктивное сканирование товара');
              // Фиктивное сканирование для возврата - БЕЗ камеры
              if (!isScanning) {
                onQRScan(); // Запускаем анимацию
                setTimeout(() => {
                  console.log('✅ ВОЗВРАТ: Товар успешно возвращен');
                }, 2000);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <img 
              src="https://cdn.poehali.dev/files/f9ab2ff9-989f-470e-8af1-67520cb6feec.png"
              alt="QR Scanner возврат"
              className="w-full h-full object-contain"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-red-100 bg-opacity-80 rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-red-600 text-sm font-medium">Обработка возврата...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Инструкции */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="RotateCcw" size={20} className="text-red-600" />
            <h3 className="text-red-900 font-medium">Возврат товаров</h3>
          </div>
          <p className="text-red-700 text-sm text-left">
            • Отсканируйте QR-код возвращаемого товара<br/>
            • Проверьте состояние товара<br/>
            • Укажите причину возврата<br/>
            • Разместите в зону возвратов<br/>
            • Подтвердите возврат в системе
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default TabContent;