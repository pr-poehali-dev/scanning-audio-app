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
    <div className="h-full flex flex-col bg-white">
          {/* Кнопка "Снять все" */}
          <div className="px-6 py-4 bg-white border-b flex justify-end">
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
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {order.items.map((item, index) => {
            const isSelected = selectedProducts.includes(index);
            const isPaid = Math.random() > 0.5;
            
            return (
              <div key={index} className="flex flex-col gap-4">
                {/* Карточка товара */}
                <div className="relative bg-gray-200 rounded-2xl overflow-hidden">
                  {/* Кнопки сверху */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                    <button
                      onClick={() => handleProductSelect(index)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                        isSelected ? 'bg-purple-600 scale-105' : 'bg-white/95 backdrop-blur hover:bg-white'
                      }`}
                    >
                      {isSelected && <Icon name="Check" size={24} className="text-white stroke-[3]" />}
                    </button>

                    <button className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center shadow-lg transition-all">
                      <Icon name="RotateCcw" size={20} className="text-white stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Бейдж оплаты */}
                  <div className="absolute top-20 right-3 z-10">
                    <span className={`px-4 py-2 text-sm font-bold rounded-xl shadow-lg ${
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
                    <button className="absolute bottom-3 right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-lg">
                      <Icon name="ZoomIn" size={20} className="text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Информация о товаре - отдельно снизу */}
                <div className="space-y-1.5">
                  {/* Баркод с кнопкой копирования */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-xl text-gray-900">
                      {item.barcode.slice(0, 7)} <span className="font-black">{item.barcode.slice(7)}</span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <Icon name="Copy" size={20} />
                    </button>
                  </div>
                  
                  {/* Название товара */}
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {item.brand || 'GENESIS'} / {item.name}
                  </div>
                  
                  {/* Цена */}
                  <div className="flex items-center gap-2">
                    <Icon name="Wallet" size={18} className="text-purple-600" />
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-purple-600">{item.price.toLocaleString()} ₽</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-sm text-gray-400 line-through">{item.originalPrice.toLocaleString()} ₽</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Цвет, Размер, Баркод */}
                  <div className="space-y-1 text-sm text-gray-600">
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