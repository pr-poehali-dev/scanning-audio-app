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
    <div className="h-full flex flex-col lg:flex-row bg-gray-50 overflow-hidden relative">

      {/* Мобильная шапка с информацией */}
      <div className="lg:hidden bg-white border-b shadow-sm">
        <div className="px-4 py-4">
          {/* Большой номер ячейки и количество товаров */}
          <div className="flex items-center gap-4 mb-3">
            <div className="text-7xl font-black text-gray-900 leading-none tracking-tighter">{order.cellNumber}</div>
            <div className="flex flex-col">
              <div className="text-sm text-gray-500 font-medium">Товаров</div>
              <div className="text-3xl font-black text-gray-900">{order.items.length}</div>
            </div>
          </div>
          
          {/* Телефон */}
          <div className="text-lg text-gray-700 font-semibold">+7 (***) ***-{order.phone}</div>
        </div>
      </div>

      {/* Desktop панель - информация */}
      <div className="hidden lg:block w-80 bg-white p-6 space-y-6 overflow-y-auto border-r">
        {/* Информация о клиенте */}
        <div className="space-y-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Клиент</div>
            <div className="text-lg font-semibold text-gray-900">+7 (***) **{order.phone}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-2">Ячейка</div>
            <div className="text-7xl font-black text-gray-900 leading-none tracking-tighter">{order.cellNumber}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Товаров</div>
            <div className="text-3xl font-black text-gray-900">{order.items.length} <span className="text-2xl text-gray-500 font-semibold">из {order.items.length}</span></div>
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
            onClick={() => {
              playAudio?.('delivery-complete-sequence');
              onDeliverProduct();
            }}
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
      <div className="flex-1 overflow-y-auto lg:ml-20 xl:ml-24">
        {/* Мобильная кнопка проверки товаров */}
        <div className="lg:hidden sticky top-0 bg-white border-b px-4 py-3 z-10">
          <button
            onClick={() => {
              setSelectedProducts(order.items.map((_, index) => index));
              playAudio?.('check-product-under-camera');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium"
          >
            <Icon name="ScanBarcode" size={20} />
            <span>Проверить товары</span>
          </button>
          
          <div className="flex items-center justify-between mt-3 text-sm">
            <button className="text-purple-600 font-medium">Выбрать все</button>
            <span className="text-gray-600">{selectedProducts.length} из {order.items.length} выбрано</span>
          </div>
        </div>
        
        {/* Desktop кнопка "Снять все" */}
        <div className="hidden lg:flex justify-between items-center mb-6 p-6 pb-0">
          <h3 className="text-lg font-semibold">Товары</h3>
          <button
            onClick={() => {
              setSelectedProducts(order.items.map((_, index) => index));
              playAudio?.('check-product-under-camera');
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 active:bg-purple-300 transition-colors"
          >
            <Icon name="Check" size={16} />
            <span>Снять все</span>
          </button>
        </div>

        {/* Список товаров */}
        <div className="p-4 lg:p-6 lg:pt-0">
          <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
            {order.items.map((item, index) => {
              const isSelected = selectedProducts.includes(index);
              const isPaid = Math.random() > 0.5;
              
              return (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 lg:shadow-none lg:border-0 lg:bg-gray-200">
                  {/* Мобильная версия карточки */}
                  <div className="lg:hidden">
                    <div className="flex gap-3 p-3">
                      {/* Чекбокс */}
                      <button
                        onClick={() => handleProductSelect(index)}
                        className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-purple-600' : 'border-2 border-gray-300'
                        }`}
                      >
                        {isSelected && <Icon name="Check" size={16} className="text-white" />}
                      </button>
                      
                      {/* Изображение */}
                      <div className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-xl overflow-hidden">
                        <img
                          src={item.image || "https://cdn.poehali.dev/files/b858b4bf-933e-42d2-85ef-ac50de2c51dd.png"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Информация */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-lg font-bold text-gray-900">{item.barcode.slice(-4)}</div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                            isPaid ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700'
                          }`}>
                            {isPaid ? 'ОПЛАЧЕН' : 'НЕ ОПЛАЧЕН'}
                          </span>
                        </div>
                        
                        {item.statusBadge && (
                          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                            item.statusBadge === 'НЕВОЗВРАТНЫЙ' ? 'bg-green-100 text-green-700' : ''
                          }`}>
                            {item.statusBadge}
                          </span>
                        )}
                        
                        <div className="text-sm text-gray-700 line-clamp-2">{item.name}</div>
                        
                        <div className="text-xs text-gray-500">{item.brand || 'Pepe Jeans'}</div>
                        
                        <div className="text-lg font-bold text-gray-900">{item.price.toLocaleString()} ₽</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop версия карточки */}
                  <div className="hidden lg:block relative">
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                      <button
                        onClick={() => handleProductSelect(index)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-purple-600' : 'bg-white/90 backdrop-blur'
                        }`}
                      >
                        {isSelected && <Icon name="Check" size={20} className="text-white" />}
                      </button>

                      <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-md flex items-center justify-center hover:bg-white transition-colors">
                        <Icon name="RotateCcw" size={18} className="text-gray-600" />
                      </button>
                    </div>

                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className={`px-4 py-1.5 text-sm font-medium rounded-full ${
                        isPaid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {isPaid ? 'Оплачен' : 'Не оплачен'}
                      </span>
                    </div>

                    <div className="relative">
                      <img
                        src={item.image || "https://cdn.poehali.dev/files/b858b4bf-933e-42d2-85ef-ac50de2c51dd.png"}
                        alt={item.name}
                        className="w-full h-96 object-cover"
                      />
                      
                      <button className="absolute bottom-4 right-4 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                        <Icon name="Search" size={22} className="text-gray-700" />
                      </button>
                    </div>

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
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Нижняя фиксированная кнопка для мобильной версии */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t p-4 shadow-lg z-30">
        <button
          onClick={onDeliverProduct}
          disabled={!allProductsSelected}
          className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
            allProductsSelected
              ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {allProductsSelected ? `Выдать ${order.items.length} товара на ${totalAmount} ₽` : `Проверьте товары (${selectedProducts.length}/${order.items.length})`}
        </button>
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