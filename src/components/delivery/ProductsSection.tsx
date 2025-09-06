import Icon from '@/components/ui/icon';
import { Order } from '@/data/mockOrders';

interface ProductsSectionProps {
  order: Order;
  isProductScanned: boolean;
  scannedData: string;
  onScanProduct: () => void;
  onDeliverProduct: () => void;
}

export const ProductsSection = ({ 
  order, 
  isProductScanned, 
  scannedData, 
  onScanProduct, 
  onDeliverProduct 
}: ProductsSectionProps) => {
  return (
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
  );
};