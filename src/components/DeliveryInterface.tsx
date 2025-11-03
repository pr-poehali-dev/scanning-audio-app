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
    <div className="h-full flex flex-col lg:flex-row bg-gray-50 overflow-hidden relative">
      {/* Desktop заголовок с кнопкой "Снять все" */}
      <div className="hidden lg:flex justify-end items-center mb-2 px-6 pt-6">
        <button
          onClick={() => {
            if (allProductsSelected) {
              setSelectedProducts([]);
            } else {
              setSelectedProducts(order.items.map((_, index) => index));
              playAudio?.('check-product-under-camera');
            }
          }}
          className="flex items-center gap-2 px-6 py-3 text-base bg-purple-600 text-white rounded-xl hover:bg-purple-700 active:bg-purple-800 transition-colors font-semibold shadow-sm"
        >
          <Icon name="Check" size={20} />
          <span>{allProductsSelected ? 'Снять все' : 'Снять все'}</span>
        </button>
      </div>

      {/* Список товаров */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {order.items.map((item, index) => {
            const isSelected = selectedProducts.includes(index);
            const isPaid = Math.random() > 0.5;
            
            return (
              <div key={index} className="bg-gray-200 rounded-2xl overflow-hidden relative">
                {/* Кнопки сверху */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                  <button
                    onClick={() => handleProductSelect(index)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                      isSelected ? 'bg-purple-600 scale-110' : 'bg-white/95 backdrop-blur hover:bg-white'
                    }`}
                  >
                    {isSelected && <Icon name="Check" size={24} className="text-white stroke-[3]" />}
                  </button>

                  <button className="w-11 h-11 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center shadow-lg transition-all">
                    <Icon name="RotateCcw" size={22} className="text-white" />
                  </button>
                </div>

                {/* Бейдж оплаты */}
                <div className="absolute top-16 right-3 z-10">
                  <span className={`px-4 py-2 text-sm font-bold rounded-lg shadow-lg ${
                    isPaid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {isPaid ? 'Оплачен' : 'Не оплачен'}
                  </span>
                </div>

                {/* Изображение товара */}
                <div className="relative bg-gray-200">
                  <img
                    src={item.image || "https://cdn.poehali.dev/files/b858b4bf-933e-42d2-85ef-ac50de2c51dd.png"}
                    alt={item.name}
                    className="w-full h-[340px] object-cover"
                  />
                  
                  {/* Кнопка поиска/увеличения */}
                  <button className="absolute bottom-4 right-4 w-14 h-14 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-lg">
                    <Icon name="ZoomIn" size={28} className="text-gray-700" />
                  </button>
                </div>

                {/* Информация о товаре */}
                <div className="p-4 bg-white space-y-2">
                  {/* Баркод с кнопкой копирования */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-2xl text-gray-900">{item.barcode.slice(0, 7)} <span className="font-black">{item.barcode.slice(7)}</span></div>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <Icon name="Copy" size={22} />
                    </button>
                  </div>
                  
                  {/* Название товара */}
                  <div className="text-sm text-gray-600 line-clamp-1">{item.brand || 'H&M'} / {item.name}</div>
                  
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
                  <div className="pt-2 space-y-1 text-sm">
                    <div className="text-gray-600">Цвет: <span className="font-semibold text-gray-900">{item.color || 'Черный'}</span></div>
                    <div className="text-gray-600">Размер: <span className="font-semibold text-gray-900">{item.size || 'M'}</span></div>
                    <div className="text-gray-600">Баркод: <span className="font-semibold text-gray-900">{item.barcode}</span></div>
                  </div>
                </div>
              </div>
            );
          })}
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
