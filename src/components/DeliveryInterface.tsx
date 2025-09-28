import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Order } from '@/data/mockOrders';

interface DeliveryInterfaceProps {
  order: Order | null;
  onCellClick: (cellNumber: string) => void;
  onScanProduct: () => void;
  onDeliverProduct: () => void;
  isProductScanned: boolean;
  scannedData: string;
  deliveryStep?: string;
}

const DeliveryInterface = ({
  order,
  onCellClick,
  onScanProduct,
  onDeliverProduct,
  isProductScanned,
  scannedData,
  deliveryStep = 'client-scanned'
}: DeliveryInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  if (!order) {
    return (
      <div className="text-center py-8">
        <Icon name="AlertCircle" size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Заказ не найден</p>
      </div>
    );
  }

  const handleProductSelect = (productIndex: number) => {
    setSelectedProducts(prev => 
      prev.includes(productIndex) 
        ? prev.filter(i => i !== productIndex)
        : [...prev, productIndex]
    );
  };

  const allProductsSelected = selectedProducts.length === order.items.length;

  return (
    <div className="h-full flex bg-gray-50">
      {/* Левая панель - информация */}
      <div className="w-1/3 bg-white p-6 space-y-6">
        {/* ID пользователя */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="text-xs text-purple-100">ID 50001234</div>
          <div className="text-xs text-purple-100">V.1.0.51</div>
          <div className="mt-2 flex items-center gap-2">
            <Icon name="User" size={16} />
            <span className="text-sm">Личный кабинет</span>
          </div>
        </div>

        {/* Информация о клиенте */}
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-500">Клиент</div>
            <div className="font-medium">+7 (***) **{order.phone}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Ячейка</div>
            <div className="text-4xl font-bold">{order.cellNumber}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Товаров</div>
            <div className="text-2xl font-semibold">{order.items.length} из {order.items.length}</div>
          </div>

          {/* Пакетов */}
          <div className="flex items-center justify-center w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg">
            <Icon name="Plus" size={24} className="text-gray-400" />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Пакетов</div>
            <div className="text-2xl font-semibold">0</div>
          </div>

          {/* К оплате */}
          <div className="space-y-2">
            <div className="text-sm text-gray-500">К оплате</div>
            <div className="flex items-center gap-2">
              <Icon name="CreditCard" size={20} className="text-purple-500" />
              <span className="text-xl font-semibold text-purple-600">{order.totalAmount} ₽</span>
            </div>
            <div className="text-xs text-gray-400">Подробнее</div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="space-y-3">
          <button
            onClick={onDeliverProduct}
            disabled={!allProductsSelected}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              allProductsSelected
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Выдать
          </button>
          
          <button className="w-full py-3 px-4 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors">
            Снять с примерки
          </button>
        </div>
      </div>

      {/* Правая панель - товары */}
      <div className="flex-1 p-6">
        {/* Кнопка "Снять все" */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Товары</h3>
          <button
            onClick={() => setSelectedProducts(order.items.map((_, index) => index))}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <Icon name="Check" size={16} />
            Снять все
          </button>
        </div>

        {/* Список товаров */}
        <div className="grid grid-cols-2 gap-4">
          {order.items.map((item, index) => {
            const isSelected = selectedProducts.includes(index);
            const isPaid = Math.random() > 0.5; // Случайно определяем статус оплаты
            
            return (
              <div key={index} className="bg-white rounded-xl p-4 relative">
                {/* Чекбокс */}
                <div className="absolute top-4 left-4 z-10">
                  <button
                    onClick={() => handleProductSelect(index)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {isSelected && <Icon name="Check" size={16} className="text-white" />}
                  </button>
                </div>

                {/* Статус оплаты */}
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isPaid ? 'Оплачен' : 'Не оплачен'}
                  </span>
                </div>

                {/* Кнопка возврата */}
                <div className="absolute top-12 right-4">
                  <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Icon name="RotateCcw" size={16} className="text-gray-600" />
                  </button>
                </div>

                {/* Изображение товара */}
                <div className="mt-8 mb-4">
                  <img
                    src={item.image || "https://cdn.poehali.dev/files/b858b4bf-933e-42d2-85ef-ac50de2c51dd.png"}
                    alt={item.name}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>

                {/* Информация о товаре */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-900">{item.barcode}</div>
                  <div className="text-sm text-gray-600 line-clamp-2">{item.name}</div>
                  
                  <div className="flex items-center gap-2">
                    <Icon name="CreditCard" size={16} className="text-purple-500" />
                    <span className="text-lg font-semibold text-purple-600">{item.price} ₽</span>
                    <span className="text-sm text-gray-400 line-through">{(item.price * 1.2).toFixed(0)} ₽</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Цвет: {item.color || 'черный'} Размер: {item.size || 'M'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Баркод: {item.barcode}
                  </div>
                </div>

                {/* Кнопка поиска */}
                <button className="absolute bottom-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Icon name="Search" size={16} className="text-gray-600" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeliveryInterface;