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
    <div className="h-full flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
      {/* Панель с ячейками */}
      <CellsPanel 
        activeClients={clientsData}
        currentClientId={currentClientId || undefined}
        onClientClick={onClientSwitch}
      />

      {/* Средняя панель - информация */}
      <div className="w-full lg:w-80 bg-white p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 overflow-y-auto border-b lg:border-b-0 lg:border-r">
        {/* Информация о клиенте */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4 lg:space-y-0">
          <div>
            <div className="text-xs sm:text-sm text-gray-500">Клиент</div>
            <div className="text-xs sm:text-sm lg:text-base font-medium">+7 (***) **{order.phone}</div>
          </div>
          
          <div>
            <div className="text-xs sm:text-sm text-gray-500">Ячейка</div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">{order.cellNumber}</div>
          </div>
          
          <div>
            <div className="text-xs sm:text-sm text-gray-500">Товаров</div>
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold">{order.items.length} из {order.items.length}</div>
          </div>

          {/* Пакетов */}
          <div className="lg:mt-3">
            <div className="text-xs sm:text-sm text-gray-500 mb-2">Пакеты</div>
            <button
              onClick={() => setShowPackageModal(true)}
              className="w-full p-3 sm:p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
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
          <div className="space-y-1 sm:space-y-2 lg:mt-3">
            <div className="text-xs sm:text-sm text-gray-500">К оплате</div>
            <div className="flex items-center gap-2">
              <Icon name="CreditCard" size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-purple-500" />
              <span className="text-base sm:text-lg lg:text-xl font-semibold text-purple-600">{totalAmount} ₽</span>
            </div>
            {packagesCost > 0 && (
              <div className="text-xs text-gray-500">
                Товары: {order.totalAmount} ₽ + Пакеты: {packagesCost} ₽
              </div>
            )}
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex lg:flex-col gap-2 sm:gap-3">
          <button
            onClick={onDeliverProduct}
            disabled={!allProductsSelected}
            className={`flex-1 lg:w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base rounded-lg font-medium transition-colors ${
              allProductsSelected
                ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Выдать
          </button>
          
          <button className="flex-1 lg:w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 active:bg-red-100 transition-colors">
            Снять с примерки
          </button>
        </div>
      </div>

      {/* Правая панель - товары */}
      <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
        {/* Кнопка "Снять все" */}
        <div className="flex justify-between items-center mb-3 sm:mb-4 lg:mb-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold">Товары</h3>
          <button
            onClick={() => {
              setSelectedProducts(order.items.map((_, index) => index));
              playAudio?.('check-product-under-camera');
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 active:bg-purple-300 transition-colors"
          >
            <Icon name="Check" size={14} className="sm:w-4 sm:h-4" />
            <span>Снять все</span>
          </button>
        </div>

        {/* Список товаров */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {order.items.map((item, index) => {
            const isSelected = selectedProducts.includes(index);
            const isPaid = Math.random() > 0.5; // Случайно определяем статус оплаты
            
            return (
              <div key={index} className="bg-gray-200 rounded-xl sm:rounded-2xl relative overflow-hidden">
                {/* Чекбокс и кнопка возврата вверху */}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex justify-between items-start z-10">
                  <button
                    onClick={() => handleProductSelect(index)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-purple-600'
                        : 'bg-white/90 backdrop-blur'
                    }`}
                  >
                    {isSelected && <Icon name="Check" size={18} className="sm:w-5 sm:h-5 text-white" />}
                  </button>

                  <button className="w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur rounded-md flex items-center justify-center hover:bg-white transition-colors">
                    <Icon name="RotateCcw" size={16} className="sm:w-[18px] sm:h-[18px] text-gray-600" />
                  </button>
                </div>

                {/* Статус оплаты */}
                <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className={`px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium rounded-full ${
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
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  />
                  
                  {/* Кнопка лупы поверх изображения */}
                  <button className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                    <Icon name="Search" size={20} className="sm:w-[22px] sm:h-[22px] text-gray-700" />
                  </button>
                </div>

                {/* Информация о товаре */}
                <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-base sm:text-lg font-bold text-gray-900">{item.barcode}</div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Icon name="Copy" size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                  
                  <div className="text-xs sm:text-sm text-gray-600 line-clamp-1">{item.name}</div>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
                    <Icon name="Tag" size={16} className="sm:w-[18px] sm:h-[18px] text-purple-500" />
                    <span className="text-lg sm:text-xl font-bold text-purple-600">{item.price} ₽</span>
                    <span className="text-xs sm:text-sm text-gray-400 line-through">{(item.price * 1.3).toFixed(0)} ₽</span>
                  </div>
                  
                  <div className="text-xs sm:text-sm text-gray-500 pt-0.5 sm:pt-1">
                    <span className="font-medium">Цвет:</span> {item.color || 'черный'} <span className="ml-2 sm:ml-3 font-medium">Размер:</span> {item.size || 'M'}
                  </div>
                  
                  <div className="text-xs sm:text-sm text-gray-500">
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