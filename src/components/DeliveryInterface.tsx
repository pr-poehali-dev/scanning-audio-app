import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Order, getOrderStatusText } from '@/data/mockOrders';
import { useVoice } from '@/hooks/useVoice';

interface DeliveryInterfaceProps {
  order: Order | null;
  onCellClick: (cellNumber: string) => void;
  onScanProduct: () => void;
  onDeliverProduct: () => void;
  isProductScanned: boolean;
  scannedData: string;
}

const DeliveryInterface = ({
  order,
  onCellClick,
  onScanProduct,
  onDeliverProduct,
  isProductScanned,
  scannedData
}: DeliveryInterfaceProps) => {
  const [selectedCell, setSelectedCell] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'cell' | 'scan' | 'check' | 'deliver'>('cell');
  const { announceCell, announceProductCheck, announceRating } = useVoice();

  if (!order) {
    return (
      <div className="text-center py-8">
        <Icon name="AlertCircle" size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Заказ не найден</p>
      </div>
    );
  }

  const orderStatus = getOrderStatusText(order.status);

  const handleCellClick = (cellNumber: string) => {
    setSelectedCell(cellNumber);
    onCellClick(cellNumber);
    announceCell(cellNumber);
    setCurrentStep('scan');
  };

  const handleScanProduct = () => {
    onScanProduct();
    announceProductCheck();
    setCurrentStep('check');
  };

  const handleDeliverProduct = () => {
    onDeliverProduct();
    announceRating();
    setCurrentStep('deliver');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Заголовок с информацией о заказе */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Выдача</h2>
        <div className="space-y-1">
          <p className="text-gray-600">Клиент: <span className="font-medium">{order.customerName}</span></p>
          <p className="text-gray-600">Телефон: <span className="font-medium">{order.phone}</span></p>
          <p className="text-sm">
            Статус: <span className={`font-medium ${orderStatus.color}`}>{orderStatus.text}</span>
          </p>
        </div>
      </div>

      {/* Ячейка */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ячейка для выдачи</h3>
        <div className="max-w-sm mx-auto">
          <div
            onClick={() => handleCellClick(order.cellNumber)}
            className={`relative cursor-pointer transition-all duration-200 ${
              selectedCell === order.cellNumber 
                ? 'ring-2 ring-purple-500 bg-purple-50' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="bg-gray-100 rounded-lg p-8 text-center border-2 border-gray-200">
              <div className="text-sm text-gray-500 mb-2">Ячейка</div>
              <div className="text-4xl font-bold text-gray-900">{order.cellNumber}</div>
              <div className="text-sm text-gray-600 mt-3">
                Информация по товарам клиента
              </div>
              <div className="text-xs text-gray-500 mt-1">
                На ячейке: {order.items.length}
              </div>
            </div>
            
            {selectedCell === order.cellNumber && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <Icon name="Check" size={16} className="text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Товары */}
      {currentStep !== 'cell' && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Товары к выдаче</h3>
            {currentStep === 'scan' && (
              <button
                onClick={handleScanProduct}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Icon name="Scan" size={16} />
                Сканировать товар
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  isProductScanned && scannedData.includes(item.barcode)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 mb-1 truncate">
                      {item.barcode}
                    </div>
                    <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {item.name}
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>Цвет: <span className="font-medium">{item.color}</span></div>
                      <div>Размер: <span className="font-medium">{item.size}</span></div>
                      <div>Цена: <span className="font-medium">{item.price} ₽</span></div>
                    </div>
                  </div>
                </div>

                {isProductScanned && scannedData.includes(item.barcode) && (
                  <div className="mt-3 flex items-center gap-2 text-green-700 text-sm">
                    <Icon name="CheckCircle" size={16} />
                    Товар проверен
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Кнопка "Выдать товар" */}
          {currentStep === 'check' && isProductScanned && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <button
                  onClick={handleDeliverProduct}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-lg"
                >
                  Выдать товар
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Сообщение о выдаче */}
      {currentStep === 'deliver' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <Icon name="CheckCircle" size={48} className="text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">Товар выдан!</h3>
          <p className="text-green-700">Не забудьте попросить клиента оценить пункт выдачи в приложении</p>
        </div>
      )}

      {/* QR для брака */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h4 className="font-medium text-gray-900 mb-2">QR-код для брака до приемки</h4>
        <div className="inline-block bg-white p-4 rounded-lg border">
          <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <Icon name="QrCode" size={48} className="text-gray-400" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Для отметки брака: отсканируйте QR-код, указанный выше
        </p>
      </div>
    </div>
  );
};

export default DeliveryInterface;