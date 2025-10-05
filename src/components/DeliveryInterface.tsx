import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Order } from '@/data/mockOrders';
import CellsPanel, { ActiveClient } from './CellsPanel';
import PackageModal from './PackageModal';

interface Package {
  type: string;
  price: number;
  quantity: number;
}

interface DeliveryInterfaceProps {
  order: Order | null;
  onCellClick: (cellNumber: string) => void;
  onScanProduct: () => void;
  onDeliverProduct: () => void;
  isProductScanned: boolean;
  scannedData: string;
  deliveryStep?: string;
  playAudio?: (key: string) => void;
  activeClients?: Order[];
  currentClientId?: string | null;
  onClientSwitch?: (clientId: string) => void;
}

const DeliveryInterface = ({
  order,
  onCellClick,
  onScanProduct,
  onDeliverProduct,
  isProductScanned,
  scannedData,
  deliveryStep = 'client-scanned',
  playAudio,
  activeClients = [],
  currentClientId,
  onClientSwitch
}: DeliveryInterfaceProps) => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [showPackageModal, setShowPackageModal] = useState(false);

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

  const handleAddPackages = (newPackages: Package[]) => {
    setPackages(newPackages);
  };

  const totalPackages = packages.reduce((sum, p) => sum + p.quantity, 0);
  const packagesCost = packages.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalAmount = (order.totalAmount || 0) + packagesCost;

  const allProductsSelected = selectedProducts.length === order.items.length;

  // Преобразуем активных клиентов в формат для CellsPanel
  const clientsData: ActiveClient[] = activeClients.map(client => ({
    id: client.id,
    phone: client.phone.slice(-2),
    cellNumber: client.cellNumber,
    itemsCount: client.items.length,
    totalAmount: client.totalAmount || client.items.reduce((sum, item) => sum + item.price, 0)
  }));
  
  console.log('🔍 DeliveryInterface - activeClients:', activeClients.length, activeClients);
  console.log('🔍 DeliveryInterface - clientsData:', clientsData);

  return (
    <div className="h-full flex bg-gray-50 overflow-hidden">
      {/* Панель с ячейками */}
      <CellsPanel 
        activeClients={clientsData}
        currentClientId={currentClientId || undefined}
        onClientClick={onClientSwitch}
      />

      {/* Средняя панель - информация */}
      <div className="w-80 bg-white p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
        {/* Информация о клиенте */}
        <div className="space-y-2 sm:space-y-3">
          <div>
            <div className="text-xs sm:text-sm text-gray-500">Клиент</div>
            <div className="text-sm sm:text-base font-medium">+7 (***) **{order.phone}</div>
          </div>
          
          <div>
            <div className="text-xs sm:text-sm text-gray-500">Ячейка</div>
            <div className="text-3xl sm:text-4xl font-bold">{order.cellNumber}</div>
          </div>
          
          <div>
            <div className="text-xs sm:text-sm text-gray-500">Товаров</div>
            <div className="text-xl sm:text-2xl font-semibold">{order.items.length} из {order.items.length}</div>
          </div>

          {/* Пакетов */}
          <div>
            <div className="text-xs sm:text-sm text-gray-500 mb-2">Пакеты</div>
            <button
              onClick={() => setShowPackageModal(true)}
              className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center">
                    <Icon name="Plus" size={20} className="text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-700">
                      {totalPackages > 0 ? `${totalPackages} шт` : 'Добавить'}
                    </div>
                    {packagesCost > 0 && (
                      <div className="text-xs text-gray-500">{packagesCost} ₽</div>
                    )}
                  </div>
                </div>
                {totalPackages > 0 && (
                  <div className="text-2xl font-bold text-purple-600">{totalPackages}</div>
                )}
              </div>
              
              {packages.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-left space-y-1">
                  {packages.map((pkg, idx) => (
                    <div key={idx} className="flex justify-between text-gray-600">
                      <span>{pkg.type} × {pkg.quantity}</span>
                      <span>{pkg.price * pkg.quantity} ₽</span>
                    </div>
                  ))}
                </div>
              )}
            </button>
          </div>

          {/* К оплате */}
          <div className="space-y-1 sm:space-y-2">
            <div className="text-xs sm:text-sm text-gray-500">К оплате</div>
            <div className="flex items-center gap-2">
              <Icon name="CreditCard" size={18} className="sm:w-5 sm:h-5 text-purple-500" />
              <span className="text-lg sm:text-xl font-semibold text-purple-600">{totalAmount} ₽</span>
            </div>
            {packagesCost > 0 && (
              <div className="text-xs text-gray-500">
                Товары: {order.totalAmount} ₽ + Пакеты: {packagesCost} ₽
              </div>
            )}
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={onDeliverProduct}
            disabled={!allProductsSelected}
            className={`w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base rounded-lg font-medium transition-colors ${
              allProductsSelected
                ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Выдать
          </button>
          
          <button className="w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 active:bg-red-100 transition-colors">
            Снять с примерки
          </button>
        </div>
      </div>

      {/* Правая панель - товары */}
      <div className="flex-1 p-4 sm:p-6">
        {/* Кнопка "Снять все" */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold">Товары</h3>
          <button
            onClick={() => {
              setSelectedProducts(order.items.map((_, index) => index));
              playAudio?.('check-product-under-camera');
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 active:bg-purple-300 transition-colors"
          >
            <Icon name="Check" size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Снять все</span>
            <span className="sm:hidden">Все</span>
          </button>
        </div>

        {/* Список товаров */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {order.items.map((item, index) => {
            const isSelected = selectedProducts.includes(index);
            const isPaid = Math.random() > 0.5; // Случайно определяем статус оплаты
            
            return (
              <div key={index} className="bg-gray-200 rounded-2xl relative overflow-hidden">
                {/* Чекбокс и кнопка возврата вверху */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                  <button
                    onClick={() => handleProductSelect(index)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-purple-600'
                        : 'bg-white/90 backdrop-blur'
                    }`}
                  >
                    {isSelected && <Icon name="Check" size={20} className="text-white" />}
                  </button>

                  <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-md flex items-center justify-center hover:bg-white transition-colors">
                    <Icon name="RotateCcw" size={18} className="text-gray-600" />
                  </button>
                </div>

                {/* Статус оплаты */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className={`px-4 py-1.5 text-sm font-medium rounded-full ${
                    isPaid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {isPaid ? 'Оплачен' : 'Не оплачен'}
                  </span>
                </div>

                {/* Изображение товара */}
                <div className="relative">
                  <img
                    src={item.image || "https://cdn.poehali.dev/files/b858b4bf-933e-42d2-85ef-ac50de2c51dd.png"}
                    alt={item.name}
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  
                  {/* Кнопка лупы поверх изображения */}
                  <button className="absolute bottom-4 right-4 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                    <Icon name="Search" size={22} className="text-gray-700" />
                  </button>
                </div>

                {/* Информация о товаре */}
                <div className="p-4 space-y-2 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-lg font-bold text-gray-900">{item.barcode}</div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Icon name="Copy" size={18} />
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600 line-clamp-1">{item.name}</div>
                  
                  <div className="flex items-center gap-2 pt-1">
                    <Icon name="Tag" size={18} className="text-purple-500" />
                    <span className="text-xl font-bold text-purple-600">{item.price} ₽</span>
                    <span className="text-sm text-gray-400 line-through">{(item.price * 1.3).toFixed(0)} ₽</span>
                  </div>
                  
                  <div className="text-sm text-gray-500 pt-1">
                    <span className="font-medium">Цвет:</span> {item.color || 'черный'} <span className="ml-3 font-medium">Размер:</span> {item.size || 'M'}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Баркод:</span> {item.barcode}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PackageModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        onAdd={handleAddPackages}
      />
    </div>
  );
};

export default DeliveryInterface;