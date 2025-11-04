import { useState } from 'react';
import Icon from '@/components/ui/icon';
import PackageModal from './PackageModal';

interface ClientInfoPanelProps {
  client: {
    id: string;
    phone: string;
    cellNumber: string;
    itemsCount: number;
    totalAmount: number;
  } | null;
  selectedProductsCount?: number;
  onDeliverProduct?: () => void;
}

interface Package {
  type: string;
  price: number;
  quantity: number;
}

const ClientInfoPanel = ({ 
  client,
  selectedProductsCount = 0,
  onDeliverProduct
}: ClientInfoPanelProps) => {
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);

  const totalPackages = packages.reduce((sum, pkg) => sum + pkg.quantity, 0);

  const handleAddPackages = (newPackages: Package[]) => {
    setPackages(newPackages);
  };

  if (!client) return null;

  return (
    <>
      <div className="hidden lg:flex fixed left-[92px] top-0 h-screen w-[250px] bg-white border-r flex-col">
        {/* Информация о текущем клиенте */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Клиент */}
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Клиент</div>
            <div className="text-sm font-medium text-gray-900">
              +7 (•••) ••• {client.phone}
            </div>
          </div>

          {/* Ячейка */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="text-xs text-gray-500 mb-2 text-center">Ячейка</div>
            <div className="text-[110px] font-black text-gray-900 text-center leading-none">
              {client.cellNumber}
            </div>
          </div>

          {/* Товаров */}
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Товаров</div>
            <div className="text-3xl font-bold text-gray-900">
              {selectedProductsCount} <span className="text-gray-400">из {client.itemsCount}</span>
            </div>
          </div>

          {/* Пакетов */}
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-2">Пакетов</div>
            <button
              onClick={() => setShowPackageModal(true)}
              className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center">
                <Icon name="Plus" size={22} className="text-gray-400" />
              </div>
              <div className="text-lg font-bold text-gray-900">{totalPackages || '0'}</div>
            </button>
          </div>

          {/* К оплате */}
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">К оплате</div>
            <div className="flex items-center justify-end gap-2">
              <Icon name="Wallet" size={20} className="text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {client.totalAmount.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <button className="text-xs text-purple-600 mt-1 flex items-center justify-end gap-1">
              Подробнее <Icon name="ChevronDown" size={14} />
            </button>
          </div>
        </div>

        {/* Кнопки внизу */}
        <div className="p-5 space-y-3 border-t">
          <button
            onClick={onDeliverProduct}
            disabled={selectedProductsCount !== client.itemsCount}
            className={`w-full py-4 text-lg font-semibold rounded-2xl transition-colors ${
              selectedProductsCount === client.itemsCount
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Выдать
          </button>
          
          <button className="w-full py-4 text-lg font-medium border-2 border-red-500 text-red-600 rounded-2xl hover:bg-red-50 transition-colors">
            Снять с примерки
          </button>
        </div>
      </div>

      {/* Модальное окно пакетов */}
      <PackageModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        onAddPackages={handleAddPackages}
        currentPackages={packages}
      />
    </>
  );
};

export default ClientInfoPanel;