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
  onAddClient?: () => void;
  onClientClick?: (clientId: string) => void;
  currentOrder?: any;
  showExtended?: boolean;
  onDeliverProduct?: () => void;
  selectedProductsCount?: number;
  totalProductsCount?: number;
}

const LeftSidebar = ({ 
  pvzInfo, 
  activeClients = [], 
  currentClientId, 
  onAddClient, 
  onClientClick,
  currentOrder,
  showExtended = false,
  onDeliverProduct,
  selectedProductsCount = 0,
  totalProductsCount = 0
}: LeftSidebarProps) => {
  const totalClients = activeClients.length;
  
  console.log('🔍 LeftSidebar - activeClients:', activeClients.length, activeClients);
  console.log('🔍 LeftSidebar - номера ячеек:', activeClients.map(c => c.cellNumber));
  console.log('🔍 LeftSidebar - showExtended:', showExtended);
  
  // Если показываем расширенную панель с заказом
  if (showExtended && currentOrder) {
    return (
      <div className="hidden lg:flex fixed left-0 top-0 h-screen w-[365px] bg-white shadow-lg z-40 flex-col">
        {/* Шапка с логотипом */}
        <div className="flex flex-col items-center p-4 border-b gap-2">
          <img 
            src="https://cdn.poehali.dev/files/b7690af9-49dc-4508-9957-156ce4be1834.png" 
            alt="Поехали!" 
            className="w-12 h-12 object-contain"
          />
          <div className="text-center">
            <div className="text-[10px] text-gray-500">ID {pvzInfo.id || '50001234'}</div>
            <div className="text-[9px] text-gray-400">V1.0.51</div>
          </div>
        </div>

        {/* Информация о заказе */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Клиент */}
          <div>
            <div className="text-sm text-gray-500 mb-2">Клиент</div>
            <div className="text-base font-medium text-gray-700">
              +7 (•••) ••• +7 (•••) •••-{currentOrder.phone}
            </div>
          </div>

          {/* Ячейка */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <div className="text-sm text-gray-500 mb-3 text-center">Ячейка</div>
            <div className="text-[130px] font-black text-gray-900 text-center leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {currentOrder.cellNumber}
            </div>
          </div>

          {/* Товаров */}
          <div>
            <div className="text-sm text-gray-500 mb-2">Товаров</div>
            <div className="text-3xl font-bold text-gray-900">
              {selectedProductsCount} <span className="text-gray-500">из {totalProductsCount}</span>
            </div>
          </div>

          {/* Пакетов */}
          <div>
            <div className="text-sm text-gray-500 mb-2">Пакетов</div>
            <div className="w-full flex items-center gap-3 p-3.5 border-2 border-dashed border-gray-300 rounded-xl">
              <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-400 flex items-center justify-center">
                <Icon name="Plus" size={26} className="text-gray-400" />
              </div>
              <div className="text-base font-medium text-gray-700">Добавить</div>
            </div>
          </div>

          {/* К оплате */}
          <div>
            <div className="text-sm text-gray-500 mb-2">К оплате</div>
            <div className="flex items-center gap-3">
              <Icon name="Wallet" size={22} className="text-purple-600" />
              <div className="text-3xl font-bold text-purple-600">
                {currentOrder.totalAmount?.toLocaleString('ru-RU') || '0'} ₽
              </div>
            </div>
            <button className="text-sm text-gray-500 mt-2 hover:text-gray-700 flex items-center gap-1">
              Подробнее
              <Icon name="ChevronDown" size={16} />
            </button>
          </div>
        </div>

        {/* Кнопки внизу */}
        <div className="p-5 space-y-3 border-t bg-white">
          <button
            onClick={onDeliverProduct}
            disabled={selectedProductsCount !== totalProductsCount}
            className={`w-full py-4 text-lg font-semibold rounded-2xl transition-colors ${
              selectedProductsCount === totalProductsCount
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Выдать
          </button>
          
          <button className="w-full py-4 text-lg font-medium border-2 border-red-500 text-red-600 rounded-2xl hover:bg-red-50 transition-colors">
            Снять с примерки
          </button>
        </div>
      </div>
    );
  }

  // Обычная узкая панель
  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-[92px] bg-white shadow-lg z-40 flex-col">
      {/* Шапка с логотипом */}
      <div className="flex flex-col items-center p-3 border-b gap-2">
        <img 
          src="https://cdn.poehali.dev/files/b7690af9-49dc-4508-9957-156ce4be1834.png" 
          alt="Поехали!" 
          className="w-12 h-12 object-contain"
        />
        <div className="text-center">
          <div className="text-[10px] text-gray-500">ID {pvzInfo.id || '50001234'}</div>
          <div className="text-[9px] text-gray-400">V.1.0.51</div>
        </div>
      </div>

      {/* Кнопка добавить клиента */}
      <div className="p-3">
        <button 
          onClick={onAddClient}
          className="w-full aspect-square bg-purple-600 rounded-lg flex flex-col items-center justify-center text-white hover:bg-purple-700 transition-colors relative group"
          title="Добавить клиента для выдачи"
        >
          <Icon name="User" size={24} />
          {totalClients > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalClients}
            </span>
          )}
          <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Добавить клиента
          </div>
        </button>
      </div>

      {/* Список ячеек клиентов */}
      <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-3">
        {activeClients.map((client) => (
          <button 
            key={client.id}
            onClick={() => onClientClick?.(client.id)}
            className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all border-2 ${
              currentClientId === client.id 
                ? 'bg-purple-100 border-purple-600' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-purple-300'
            }`}
            title={`Ячейка ${client.cellNumber} - ${client.itemsCount} товар(ов)`}
          >
            <div className="text-3xl font-black text-gray-900 leading-none">{client.cellNumber}</div>
            <div className="text-[10px] text-gray-500 mt-1 font-medium">{client.itemsCount} шт</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;