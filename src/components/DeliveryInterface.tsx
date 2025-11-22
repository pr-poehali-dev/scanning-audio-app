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
      {/* Левая боковая панель */}
      <div className="w-[380px] bg-white border-r flex flex-col">
        {/* Информация о клиенте */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="text-sm text-gray-600 mb-1">Клиент</div>
          <div className="text-xl font-bold">
            +7 (•••) •••-{order.phone.slice(-4)}
          </div>
        </div>

        {/* Ячейка */}
        <div className="px-6 py-8 border-b bg-white">
          <div className="text-sm text-gray-600 mb-3 text-center">Ячейка</div>
          <div className="text-[120px] font-black text-center leading-none text-gray-900">
            {order.cellNumber}
          </div>
        </div>

        {/* Товаров */}
        <div className="px-6 py-5 border-b">
          <div className="text-sm text-gray-600 mb-2">Товаров</div>
          <div className="text-4xl font-black">
            {selectedProducts.length} <span className="text-3xl text-gray-400">из {order.items.length}</span>
          </div>
        </div>

        {/* Пакетов */}
        <div className="px-6 py-5 border-b">
          <div className="text-sm text-gray-600 mb-3">Пакетов</div>
          <button
            onClick={() => setShowPackageModal(true)}
            className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all"
          >
            <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center">
              <Icon name="Plus" size={22} className="text-gray-400" />
            </div>
            <div className="text-base font-semibold text-gray-700">{totalPackages || 'Добавить'}</div>
          </button>
        </div>

        {/* К оплате */}
        <div className="px-6 py-5 border-b">
          <div className="text-sm text-gray-600 mb-2">К оплате</div>
          <div className="flex items-center gap-2">
            <Icon name="Wallet" size={22} className="text-purple-600" />
            <div className="text-3xl font-black text-purple-600">
              {totalAmount.toLocaleString('ru-RU')} <span className="text-2xl">₽</span>
            </div>
          </div>
          <button className="mt-3 text-sm text-purple-600 font-medium flex items-center gap-1 hover:text-purple-700">
            Подробнее
            <Icon name="ChevronDown" size={16} />
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* Кнопки действий */}
        <div className="px-6 py-6 space-y-3 border-t bg-white">
          <button
            onClick={onDeliverProduct}
            disabled={selectedProducts.length !== order.items.length}
            className={`w-full py-4 text-base font-bold rounded-xl transition-all ${
              selectedProducts.length === order.items.length
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Выдать
          </button>
          
          <button className="w-full py-4 text-base font-bold border-2 border-red-500 text-red-600 rounded-xl hover:bg-red-50 transition-all">
            Снять с примерки
          </button>
        </div>
      </div>

      {/* Правая часть с товарами */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Хедер с кнопкой */}
        <div className="px-6 py-4 bg-white border-b flex justify-between items-center">
          <div className="text-base text-gray-700 font-medium">Товары в заказе</div>
          <button
            onClick={() => {
              if (allProductsSelected) {
                setSelectedProducts([]);
              } else {
                setSelectedProducts(order.items.map((_, index) => index));
                playAudio?.('check-product-under-camera');
              }
            }}
            className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all text-base font-semibold shadow-lg shadow-purple-600/30"
          >
            <Icon name="Check" size={18} />
            <span>Снять все</span>
          </button>
        </div>

        {/* Список товаров - большие вертикальные карточки */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-2 gap-6">
            {order.items.map((item, index) => {
              const isSelected = selectedProducts.includes(index);
              const isPaid = Math.random() > 0.5;
              
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Изображение товара */}
                  <div className="relative bg-gray-100">
                    <img
                      src={item.image || "https://cdn.poehali.dev/files/b858b4bf-933e-42d2-85ef-ac50de2c51dd.png"}
                      alt={item.name}
                      className="w-full h-[450px] object-cover"
                    />
                    
                    {/* Кнопки слева сверху */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <button
                        onClick={() => handleProductSelect(index)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                          isSelected ? 'bg-purple-600 scale-105' : 'bg-white/95 backdrop-blur-sm'
                        }`}
                      >
                        {isSelected && <Icon name="Check" size={26} className="text-white stroke-[3]" />}
                      </button>
                      
                      <button className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-2xl flex items-center justify-center transition-all shadow-lg">
                        <Icon name="RotateCcw" size={22} className="text-white stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Бейдж оплаты справа сверху */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-lg ${
                        isPaid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {isPaid ? 'Оплачен' : 'Не оплачен'}
                      </span>
                    </div>

                    {/* Кнопка увеличения справа снизу */}
                    <button className="absolute bottom-4 right-4 w-14 h-14 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-all shadow-lg">
                      <Icon name="ZoomIn" size={22} className="text-gray-700" />
                    </button>
                  </div>

                  {/* Информация о товаре под изображением */}
                  <div className="p-5 bg-white space-y-3">
                    {/* Баркод */}
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xl">
                        {item.barcode.slice(0, 7)} <span className="font-black">{item.barcode.slice(7)}</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 p-2">
                        <Icon name="Copy" size={20} />
                      </button>
                    </div>
                    
                    {/* Название */}
                    <div className="text-base text-gray-600 line-clamp-2">
                      {item.brand || 'GENESIS'} / {item.name}
                    </div>
                    
                    {/* Цена */}
                    <div className="flex items-center gap-2">
                      <Icon name="Wallet" size={20} className="text-purple-600" />
                      <span className="text-2xl font-black text-purple-600">{item.price.toLocaleString()} <span className="text-xl">₽</span></span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-base text-gray-400 line-through">{item.originalPrice.toLocaleString()} ₽</span>
                      )}
                    </div>
                    
                    {/* Характеристики */}
                    <div className="text-sm text-gray-500 space-y-1.5 pt-2 border-t">
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