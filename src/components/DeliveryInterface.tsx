import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface DeliveryInterfaceProps {
  cellNumbers: string[];
  onCellClick: (cellNumber: string) => void;
  onScanProduct: () => void;
  onDeliverProduct: () => void;
  isProductScanned: boolean;
  scannedData: string;
}

interface Product {
  barcode: string;
  name: string;
  color: string;
  size: string;
  image: string;
}

const DeliveryInterface = ({
  cellNumbers,
  onCellClick,
  onScanProduct,
  onDeliverProduct,
  isProductScanned,
  scannedData
}: DeliveryInterfaceProps) => {
  const [selectedCell, setSelectedCell] = useState<string>('');

  // Моковые данные товаров (в реальности будут получены по API)
  const products: Product[] = [
    {
      barcode: '456567698 5879',
      name: 'Smite / Футболка оверсайз спортивная',
      color: 'Серый',
      size: 'XL',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'
    },
    {
      barcode: '456567698 5879',
      name: 'Zeyd / Худи оверсайз с начесом',
      color: 'Небесный',
      size: 'L',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop'
    },
    {
      barcode: '456567698 5879',
      name: 'ТЕЛОДВИЖЕНИЯ / Лонгслив женский с...',
      color: 'Бежевый',
      size: 'M',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop'
    }
  ];

  const handleCellClick = (cellNumber: string) => {
    setSelectedCell(cellNumber);
    onCellClick(cellNumber);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Заголовок */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Выдача</h2>
        <p className="text-gray-600">Отсканирован QR-код клиента</p>
      </div>

      {/* Ячейки */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ячейки для выдачи</h3>
        <div className="grid grid-cols-3 gap-4">
          {cellNumbers.map((cellNumber) => (
            <div
              key={cellNumber}
              onClick={() => handleCellClick(cellNumber)}
              className={`relative cursor-pointer transition-all duration-200 ${
                selectedCell === cellNumber 
                  ? 'ring-2 ring-purple-500 bg-purple-50' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="bg-gray-100 rounded-lg p-6 text-center border-2 border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Ячейка</div>
                <div className="text-3xl font-bold text-gray-900">{cellNumber}</div>
                <div className="text-sm text-gray-600 mt-2">
                  Информация по товарам клиента
                </div>
                <div className="text-xs text-gray-500 mt-1">На ячейке: 1</div>
              </div>
              
              {selectedCell === cellNumber && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <Icon name="Check" size={16} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Товары */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Товары к выдаче</h3>
          {!isProductScanned && (
            <button
              onClick={onScanProduct}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Icon name="Scan" size={16} />
              Сканировать товар
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                isProductScanned && scannedData.includes(product.barcode)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 mb-1 truncate">
                    {product.barcode}
                  </div>
                  <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {product.name}
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Цвет: <span className="font-medium">{product.color}</span></div>
                    <div>Размер: <span className="font-medium">{product.size}</span></div>
                    <div>Баркод: <span className="font-mono text-xs">{product.barcode.split(' ')[1]}</span></div>
                  </div>
                </div>
              </div>

              {isProductScanned && scannedData.includes(product.barcode) && (
                <div className="mt-3 flex items-center gap-2 text-green-700 text-sm">
                  <Icon name="CheckCircle" size={16} />
                  Товар проверен
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Кнопка "Выдать товар" */}
        {isProductScanned && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <button
                onClick={onDeliverProduct}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-lg"
              >
                Выдать товар
              </button>
            </div>
          </div>
        )}
      </div>

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