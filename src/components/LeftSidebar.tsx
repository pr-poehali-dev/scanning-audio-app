import { useState } from 'react';
import Icon from '@/components/ui/icon';
import PackageModal from './PackageModal';

interface LeftSidebarProps {
  pvzInfo: {
    id: string;
    address: string;
    employeeId: string;
  };
  activeClients?: Array<{
    id: string;
    phone: string;
    cellNumber: string;
    itemsCount: number;
    totalAmount: number;
  }>;
  currentClientId?: string;
  onAddClient?: () => void;
  onClientClick?: (clientId: string) => void;
  onDeliverProduct?: () => void;
  selectedProductsCount?: number;
}

interface Package {
  type: string;
  price: number;
  quantity: number;
}

const LeftSidebar = ({ 
  pvzInfo, 
  activeClients = [], 
  currentClientId, 
  onAddClient, 
  onClientClick,
  onDeliverProduct,
  selectedProductsCount = 0
}: LeftSidebarProps) => {
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);

  const currentClient = activeClients.find(c => c.id === currentClientId);
  
  const totalPackages = packages.reduce((sum, pkg) => sum + pkg.quantity, 0);

  const handleAddPackages = (newPackages: Package[]) => {
    setPackages(newPackages);
  };

  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-[380px] bg-gray-50 shadow-lg z-40 flex-col">
      {/* Шапка с логотипом */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-3">
          <img 
            src="https://cdn.poehali.dev/files/b7690af9-49dc-4508-9957-156ce4be1834.png" 
            alt="Поехали!" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <div className="text-xs text-gray-500">ID {pvzInfo.id || '50001234'}</div>
            <div className="text-xs text-gray-400">V.1.0.51</div>
          </div>
        </div>
      </div>

      {currentClient ? (
        <>
          {/* Информация о текущем клиенте */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Клиент */}
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Клиент</div>
              <div className="text-sm font-medium text-gray-900">
                +7 (•••) •••-{currentClient.phone}
              </div>
            </div>

            {/* Ячейка */}
            <div className="bg-white rounded-2xl p-6">
              <div className="text-xs text-gray-500 mb-2 text-center">Ячейка</div>
              <div className="text-[120px] font-black text-gray-900 text-center leading-none">
                {currentClient.cellNumber}
              </div>
            </div>

            {/* Товаров */}
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Товаров</div>
              <div className="text-3xl font-bold text-gray-900">
                {selectedProductsCount} <span className="text-gray-400">из {currentClient.itemsCount}</span>
              </div>
            </div>

            {/* Пакетов */}
            <div>
              <div className="text-xs text-gray-500 mb-2 text-center">Пакетов</div>
              <button
                onClick={() => setShowPackageModal(true)}
                className="w-full flex items-center justify-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-colors bg-white"
              >
                <div className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center">
                  <Icon name="Plus" size={20} className="text-gray-400" />
                </div>
                <div className="text-base font-medium text-gray-700">{totalPackages || 'Добавить'}</div>
              </button>
            </div>

            {/* К оплате */}
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">К оплате</div>
              <div className="flex items-center justify-center gap-2">
                <Icon name="Wallet" size={20} className="text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  {currentClient.totalAmount.toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <button className="text-xs text-purple-600 mt-1 flex items-center justify-center gap-1 mx-auto">
                Подробнее <Icon name="ChevronDown" size={14} />
              </button>
            </div>
          </div>

          {/* Кнопки внизу */}
          <div className="p-4 space-y-3 bg-white border-t">
            <button
              onClick={onDeliverProduct}
              disabled={selectedProductsCount !== currentClient.itemsCount}
              className={`w-full py-3 text-base font-semibold rounded-xl transition-colors ${
                selectedProductsCount === currentClient.itemsCount
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Выдать
            </button>
            
            <button className="w-full py-3 text-base font-medium border-2 border-red-500 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
              Снять с примерки
            </button>
          </div>

          {/* Модальное окно пакетов */}
          <PackageModal
            isOpen={showPackageModal}
            onClose={() => setShowPackageModal(false)}
            onAddPackages={handleAddPackages}
            currentPackages={packages}
          />
        </>
      ) : (
        /* Когда нет выбранного клиента - показываем список ячеек */
        <>
          <div className="p-4">
            <button 
              onClick={onAddClient}
              className="w-full py-3 bg-purple-600 rounded-xl flex items-center justify-center gap-2 text-white hover:bg-purple-700 transition-colors font-semibold"
            >
              <Icon name="User" size={20} />
              Добавить клиента
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
            {activeClients.map((client) => (
              <button 
                key={client.id}
                onClick={() => onClientClick?.(client.id)}
                className="w-full p-4 rounded-xl flex items-center justify-between bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-purple-300 transition-all"
              >
                <div className="text-left">
                  <div className="text-2xl font-black text-gray-900">{client.cellNumber}</div>
                  <div className="text-xs text-gray-500">{client.itemsCount} товаров</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-purple-600">{client.totalAmount.toLocaleString()} ₽</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LeftSidebar;
