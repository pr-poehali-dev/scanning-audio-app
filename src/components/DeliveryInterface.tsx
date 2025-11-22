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
    <div className="h-full bg-gray-50 flex overflow-hidden">
      {/* Левая боковая панель - УЗКАЯ как на скрине */}
      <div className="w-[260px] bg-white border-r flex flex-col">
        {/* Информация о клиенте */}
        <div className="px-4 py-3 border-b bg-gray-50">
          <div className="text-xs text-gray-500 mb-0.5">Клиент</div>
          <div className="text-base font-semibold text-gray-900">
            +7 (•••) •••-{order.phone.slice(-4)}
          </div>
        </div>

        {/* Ячейка - компактный размер */}
        <div className="px-4 py-6 border-b bg-white">
          <div className="text-xs text-gray-500 mb-2 text-center">Ячейка</div>
          <div className="text-[80px] font-black text-center leading-none text-gray-900">
            {order.cellNumber}
          </div>
        </div>

        {/* Товаров - компактно как "2 из 2" */}
        <div className="px-4 py-4 border-b">
          <div className="text-xs text-gray-500 mb-1">Товаров</div>
          <div className="text-3xl font-black text-gray-900">
            {selectedProducts.length} <span className="text-2xl text-gray-400">из {order.items.length}</span>
          </div>
        </div>

        {/* Пакетов */}
        <div className="px-4 py-4 border-b">
          <div className="text-xs text-gray-500 mb-2">Пакетов</div>
          <button
            onClick={() => setShowPackageModal(true)}
            className="w-full flex items-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all"
          >
            <div className="w-10 h-10 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
              <Icon name="Plus" size={18} className="text-gray-400" />
            </div>
            <div className="text-sm font-semibold text-gray-700">{totalPackages || 'Добавить'}</div>
          </button>
        </div>

        {/* К оплате */}
        <div className="px-4 py-4 border-b">
          <div className="text-xs text-gray-500 mb-1">К оплате</div>
          <div className="flex items-center gap-1.5">
            <Icon name="Wallet" size={18} className="text-purple-600" />
            <div className="text-2xl font-black text-purple-600">
              {totalAmount.toLocaleString('ru-RU')} <span className="text-lg">₽</span>
            </div>
          </div>
          <button className="mt-2 text-xs text-purple-600 font-medium flex items-center gap-0.5 hover:text-purple-700">
            Подробнее
            <Icon name="ChevronDown" size={14} />
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* Кнопки действий */}
        <div className="px-4 py-4 space-y-2 border-t bg-white">
          <button
            onClick={onDeliverProduct}
            disabled={selectedProducts.length !== order.items.length}
            className={`w-full py-3 text-sm font-bold rounded-xl transition-all ${
              selectedProducts.length === order.items.length
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Выдать
          </button>
          
          <button className="w-full py-3 text-sm font-bold border-2 border-red-500 text-red-600 rounded-xl hover:bg-red-50 transition-all">
            Снять с примерки
          </button>
        </div>
      </div>

      {/* Правая часть с товарами */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Хедер с кнопкой */}
        <div className="px-5 py-3 bg-white border-b flex justify-between items-center">
          <div className="text-sm text-gray-700 font-medium">Товары в заказе</div>
          <button
            onClick={() => {
              if (allProductsSelected) {
                setSelectedProducts([]);
              } else {
                setSelectedProducts(order.items.map((_, index) => index));
                playAudio?.('check-product-under-camera');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm font-semibold"
          >
            <Icon name="Check" size={16} />
            <span>Снять все</span>
          </button>
        </div>

        {/* Список товаров - компактные карточки как на скрине */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
          <div className="grid grid-cols-2 gap-5">
            {order.items.map((item, index) => {
              const isSelected = selectedProducts.includes(index);
              const isPaid = Math.random() > 0.5;
              
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Изображение товара - меньше высота */}
                  <div className="relative bg-gray-100">
                    <img
                      src={item.image || "https://cdn.poehali.dev/files/b858b4bf-933e-42d2-85ef-ac50de2c51dd.png"}
                      alt={item.name}
                      className="w-full h-[350px] object-cover"
                    />
                    
                    {/* Кнопки слева сверху */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <button
                        onClick={() => handleProductSelect(index)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md ${
                          isSelected ? 'bg-purple-600 scale-105' : 'bg-white/95 backdrop-blur-sm'
                        }`}
                      >
                        {isSelected && <Icon name="Check" size={22} className="text-white stroke-[3]" />}
                      </button>
                      
                      <button className="w-11 h-11 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all shadow-md">
                        <Icon name="RotateCcw" size={18} className="text-white stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Бейдж оплаты справа сверху */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-md ${
                        isPaid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {isPaid ? 'Оплачен' : 'Не оплачен'}
                      </span>
                    </div>

                    {/* Кнопка увеличения справа снизу */}
                    <button className="absolute bottom-3 right-3 w-11 h-11 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-all shadow-md">
                      <Icon name="ZoomIn" size={18} className="text-gray-700" />
                    </button>
                  </div>

                  {/* Информация о товаре под изображением */}
                  <div className="p-4 bg-white space-y-2">
                    {/* Баркод */}
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-base">
                        {item.barcode.slice(0, 7)} <span className="font-black">{item.barcode.slice(7)}</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <Icon name="Copy" size={16} />
                      </button>
                    </div>
                    
                    {/* Название */}
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {item.brand || 'GENESIS'} / {item.name}
                    </div>
                    
                    {/* Цена */}
                    <div className="flex items-center gap-1.5">
                      <Icon name="Wallet" size={16} className="text-purple-600" />
                      <span className="text-lg font-black text-purple-600">{item.price.toLocaleString()} <span className="text-base">₽</span></span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-sm text-gray-400 line-through">{item.originalPrice.toLocaleString()} ₽</span>
                      )}
                    </div>
                    
                    {/* Характеристики */}
                    <div className="text-xs text-gray-500 space-y-0.5 pt-2 border-t">
                      <div>Цвет: <span className="text-gray-900 font-semibold">{item.color || 'черный'}</span></div>
                      <div>Размер: <span className="text-gray-900 font-semibold">{item.size || 'M'}</span></div>
                      <div>Баркод: <span className="text-gray-900 font-semibold">{item.barcode}</span></div>
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
