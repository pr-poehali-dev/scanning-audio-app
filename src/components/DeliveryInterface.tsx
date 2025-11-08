import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Order } from '@/data/mockOrders';
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
}

const DeliveryInterface = ({
  order,
  onCellClick,
  onScanProduct,
  onDeliverProduct,
  isProductScanned,
  scannedData,
  deliveryStep = 'client-scanned',
  playAudio
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

  return (
    <div className="h-full bg-white flex overflow-hidden">
      {/* Левая боковая панель */}
      <div className="w-[280px] bg-white border-r flex flex-col">
        {/* Информация о клиенте и заказе */}
        <div className="p-4 border-b">
          <div className="text-xs text-gray-500 mb-1">Клиент</div>
          <div className="text-lg font-semibold">
            +7 (•••) •••-{order.phone.slice(-4)}
          </div>
        </div>

        {/* Ячейка */}
        <div className="p-6 border-b">
          <div className="text-xs text-gray-500 mb-2 text-center">Ячейка</div>
          <div className="text-[80px] font-black text-center leading-none">
            {order.cellNumber}
          </div>
        </div>

        {/* Товаров */}
        <div className="p-4 border-b">
          <div className="text-xs text-gray-500 mb-1">Товаров</div>
          <div className="text-3xl font-bold">
            {selectedProducts.length} <span className="text-2xl text-gray-400">из {order.items.length}</span>
          </div>
        </div>

        {/* Пакетов */}
        <div className="p-4 border-b">
          <div className="text-xs text-gray-500 mb-2">Пакетов</div>
          <button
            onClick={() => setShowPackageModal(true)}
            className="w-full flex items-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors"
          >
            <div className="w-10 h-10 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
              <Icon name="Plus" size={18} className="text-gray-400" />
            </div>
            <div className="text-sm font-medium">{totalPackages || 'Добавить'}</div>
          </button>
        </div>

        {/* К оплате */}
        <div className="p-4 border-b">
          <div className="text-xs text-gray-500 mb-1">К оплате</div>
          <div className="flex items-center gap-2">
            <Icon name="Wallet" size={18} className="text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">
              {totalAmount.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        {/* Кнопки действий - spacer для прижатия вниз */}
        <div className="flex-1"></div>
        
        <div className="p-4 space-y-2 border-t">
          <button
            onClick={onDeliverProduct}
            disabled={selectedProducts.length !== order.items.length}
            className={`w-full py-3 text-sm font-semibold rounded-lg transition-colors ${
              selectedProducts.length === order.items.length
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Выдать
          </button>
          
          <button className="w-full py-3 text-sm font-medium border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            Снять с примерки
          </button>
        </div>
      </div>

      {/* Правая часть с товарами */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Хедер с кнопкой */}
        <div className="px-4 py-3 bg-white border-b flex justify-between items-center">
          <div className="text-sm text-gray-600">Товары в заказе</div>
          <button
            onClick={() => {
              if (allProductsSelected) {
                setSelectedProducts([]);
              } else {
                setSelectedProducts(order.items.map((_, index) => index));
                playAudio?.('check-product-under-camera');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Icon name="Check" size={16} />
            <span>Снять все</span>
          </button>
        </div>

        {/* Список товаров - компактные карточки */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {order.items.map((item, index) => {
              const isSelected = selectedProducts.includes(index);
              const isPaid = Math.random() > 0.5;
              
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow"
                >
                  {/* Изображение товара */}
                  <div className="relative bg-gray-100">
                    <img
                      src={item.image || "https://cdn.poehali.dev/files/b858b4bf-933e-42d2-85ef-ac50de2c51dd.png"}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Кнопка выбора */}
                    <button
                      onClick={() => handleProductSelect(index)}
                      className={`absolute top-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isSelected ? 'bg-purple-600' : 'bg-white/90 backdrop-blur'
                      }`}
                    >
                      {isSelected && <Icon name="Check" size={18} className="text-white stroke-[3]" />}
                    </button>

                    {/* Бейдж оплаты */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        isPaid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {isPaid ? 'Оплачен' : 'Не оплачен'}
                      </span>
                    </div>

                    {/* Кнопка возврата */}
                    <button className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center transition-all">
                      <Icon name="RotateCcw" size={16} className="text-white stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Информация о товаре */}
                  <div className="p-3 space-y-1">
                    {/* Баркод */}
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm">
                        {item.barcode.slice(0, 7)} <span className="font-black">{item.barcode.slice(7)}</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Icon name="Copy" size={14} />
                      </button>
                    </div>
                    
                    {/* Название */}
                    <div className="text-xs text-gray-600 line-clamp-2 h-8">
                      {item.brand || 'GENESIS'} / {item.name}
                    </div>
                    
                    {/* Цена */}
                    <div className="flex items-center gap-1">
                      <Icon name="Wallet" size={14} className="text-purple-600" />
                      <span className="text-base font-bold text-purple-600">{item.price.toLocaleString()} ₽</span>
                    </div>
                    
                    {/* Характеристики */}
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div>Цвет: <span className="text-gray-700 font-medium">{item.color || 'черный'}</span></div>
                      <div>Размер: <span className="text-gray-700 font-medium">{item.size || 'M'}</span></div>
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
