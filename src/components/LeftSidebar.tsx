import Icon from '@/components/ui/icon';

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
}

const LeftSidebar = ({ pvzInfo, activeClients = [], currentClientId }: LeftSidebarProps) => {
  const currentClient = activeClients.find(c => c.id === currentClientId);
  
  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-[360px] bg-white shadow-lg z-40 flex-col">
      {/* Шапка с логотипом */}
      <div className="flex items-center gap-3 p-4 border-b">
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

      {currentClient ? (
        <>
          {/* Информация о клиенте */}
          <div className="p-4 border-b">
            <div className="text-sm text-gray-500 mb-1">Клиент</div>
            <div className="text-lg font-medium">+7 (***) *** {currentClient.phone}</div>
          </div>

          {/* Ячейка */}
          <div className="p-4 bg-gray-50">
            <div className="text-sm text-gray-500 mb-2">Ячейка</div>
            <div className="text-6xl font-bold text-center py-6">{currentClient.cellNumber}</div>
          </div>

          {/* Статистика */}
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Товаров</span>
              <span className="text-lg font-bold">{currentClient.itemsCount} из {currentClient.itemsCount}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Пакетов</span>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-gray-400">
                  <Icon name="Plus" size={16} className="text-gray-400" />
                </button>
                <span className="text-lg font-bold">3</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">К оплате</div>
              <div className="flex items-center gap-2">
                <Icon name="Wallet" size={20} className="text-purple-600" />
                <span className="text-xl font-bold text-purple-600">{currentClient.totalAmount.toLocaleString()} ₽</span>
              </div>
              <button className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                Подробнее <Icon name="ChevronDown" size={12} />
              </button>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="p-4 space-y-2 border-t">
            <button className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Выдать
            </button>
            <button className="w-full py-3 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors">
              Снять с примерки
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Icon name="User" size={48} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Выберите клиента</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftSidebar;