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

  const clientsData: ActiveClient[] = activeClients.map(client => ({
    id: client.id,
    phone: client.phone.slice(-2),
    cellNumber: client.cellNumber,
    itemsCount: client.items.length,
    totalAmount: client.totalAmount || client.items.reduce((sum, item) => sum + item.price, 0)
  }));

  return (
    <div className="h-full flex bg-gray-50 overflow-hidden">
      {/* Узкая левая панель */}
      <div className="hidden lg:flex flex-col w-[115px] bg-white border-r shadow-sm">
        <div className="flex flex-col h-full py-6 px-3">
          {/* Клиент */}
          <div className="mb-6">
            <div className="text-[10px] text-gray-500 mb-1 text-center">Клиент</div>
            <div className="text-xs font-medium text-gray-700 text-center">
              +7 (•••) ••• +7 (•••) •••-{order.phone}
            </div>
          </div>

          {/* Ячейка */}
          <div className="mb-6">
            <div className="text-[10px] text-gray-500 mb-2 text-center">Ячейка</div>
            <div className="text-7xl font-black text-gray-900 text-center leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {order.cellNumber}
            </div>
          </div>

          {/* Товаров */}
          <div className="mb-6">
            <div className="text-[10px] text-gray-500 mb-1 text-center">Товаров</div>
            <div className="text-center">
              <div className="text-4xl font-black text-gray-900 leading-none">{selectedProducts.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">из {order.items.length}</div>
            </div>
          </div>

          {/* Пакетов */}
          <div className="mb-6">
            <div className="text-[10px] text-gray-500 mb-2 text-center">Пакетов</div>
            <button
              onClick={() => setShowPackageModal(true)}
              className="w-full flex flex-col items-center justify-center p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <Icon name="Plus" size={20} className="text-gray-400" />
              {totalPackages > 0 && (
                <div className="text-lg font-bold text-gray-900 mt-1">{totalPackages}</div>
              )}
            </button>
          </div>

          {/* К оплате */}
          <div className="mb-8">
            <div className="text-[10px] text-gray-500 mb-1 text-center">К оплате</div>
            <div className="flex flex-col items-center">
              <Icon name="Wallet" size={18} className="text-purple-600 mb-1" />
              <div className="text-base font-bold text-purple-600 text-center leading-tight">
                {totalAmount.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <button className="text-[9px] text-gray-500 mt-1 hover:text-gray-700 text-center w-full">
              Подробнее
            </button>
          </div>

          {/* Кнопки внизу */}
          <div className="mt-auto space-y-2">
            <button
              onClick={() => {
                playAudio?.('delivery-complete-sequence');
                onDeliverProduct();
              }}
              disabled={!allProductsSelected}
              className={`w-full py-3 text-xs font-semibold rounded-xl transition-colors ${
                allProductsSelected
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Выдать
            </button>
            
            <button className="w-full py-3 text-xs font-medium border-2 border-red-500 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
              Снять с примерки
            </button>
          </div>
        </div>
      </div>

      {/* Правая панель - товары */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Хедер с кнопкой "Снять все" */}
        <div className="flex justify-between items-center px-6 py-4 bg-white border-b">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Клиент</span> +7 (•••) ••• {order.phone}
          </div>
          <button
            onClick={() => {
              if (allProductsSelected) {
                setSelectedProducts([]);
              } else {
                setSelectedProducts(order.items.map((_, index) => index));
                playAudio?.('check-product-under-camera');
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
          >
            <Icon name="Check" size={20} />
            <span>Снять все</span>
          </button>
        </div>

        {/* Список товаров */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {order.items.map((item, index) => {
            const isSelected = selectedProducts.includes(index);
            const isPaid = Math.random() > 0.5;
            
            return (
              <div key={index} className="bg-gray-200 rounded-2xl overflow-hidden relative">
                {/* Кнопки сверху */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                  <button
                    onClick={() => handleProductSelect(index)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                      isSelected ? 'bg-purple-600 scale-105' : 'bg-white/95 backdrop-blur hover:bg-white'
                    }`}
                  >
                    {isSelected && <Icon name="Check" size={26} className="text-white stroke-[3]" />}
                  </button>

                  <button className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center shadow-lg transition-all">
                    <Icon name="RotateCcw" size={22} className="text-white stroke-[2.5]" />
                  </button>
                </div>

                {/* Бейдж оплаты */}
                <div className="absolute top-20 right-4 z-10">
                  <span className={`px-4 py-2 text-sm font-bold rounded-lg shadow-lg ${
                    isPaid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {isPaid ? 'Оплачен' : 'Не оплачен'}
                  </span>
                </div>

                {/* Изображение товара */}
                <div className="relative bg-gray-300">
                  <img
                    src={item.image || "https://cdn.poehali.dev/files/b858b4bf-933e-42d2-85ef-ac50de2c51dd.png"}
                    alt={item.name}
                    className="w-full h-[380px] object-cover"
                  />
                  
                  {/* Кнопка поиска/увеличения */}
                  <button className="absolute bottom-4 right-4 w-14 h-14 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-lg">
                    <Icon name="ZoomIn" size={28} className="text-gray-700" />
                  </button>
                </div>

                {/* Информация о товаре */}
                <div className="p-5 bg-white space-y-2">
                  {/* Баркод с кнопкой копирования */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-2xl text-gray-900">
                      {item.barcode.slice(0, 7)} <span className="font-black">{item.barcode.slice(7)}</span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <Icon name="Copy" size={22} />
                    </button>
                  </div>
                  
                  {/* Название товара */}
                  <div className="text-sm text-gray-600 line-clamp-1">
                    {item.brand || 'GENESIS'} / {item.name}
                  </div>
                  
                  {/* Цена */}
                  <div className="flex items-center gap-3 pt-1">
                    <Icon name="Wallet" size={20} className="text-purple-600" />
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-purple-600">{item.price.toLocaleString()} ₽</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-base text-gray-400 line-through">{item.originalPrice.toLocaleString()} ₽</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Цвет, Размер, Баркод */}
                  <div className="pt-2 space-y-1 text-sm text-gray-600">
                    <div>Цвет: <span className="font-medium text-gray-900">{item.color || 'черный'}</span></div>
                    <div>Размер: <span className="font-medium text-gray-900">{item.size || 'M'}</span></div>
                    <div>Баркод: <span className="font-medium text-gray-900">{item.barcode}</span></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* Модальное окно пакетов */}
      <PackageModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        onAddPackages={handleAddPackages}
        currentPackages={packages}
      />
    </div>
  );
};

export default DeliveryInterface;