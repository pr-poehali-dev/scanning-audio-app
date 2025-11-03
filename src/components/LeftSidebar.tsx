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
}

const LeftSidebar = ({ pvzInfo, activeClients = [], currentClientId, onAddClient, onClientClick }: LeftSidebarProps) => {
  const totalClients = activeClients.length;
  
  console.log('🔍 LeftSidebar - activeClients:', activeClients.length, activeClients);
  console.log('🔍 LeftSidebar - номера ячеек:', activeClients.map(c => c.cellNumber));
  
  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-[420px] bg-gray-50 shadow-lg z-40 flex-col">
      {/* Шапка с логотипом */}
      <div className="flex items-center gap-3 p-4 bg-white border-b">
        <img 
          src="https://cdn.poehali.dev/files/b7690af9-49dc-4508-9957-156ce4be1834.png" 
          alt="Поехали!" 
          className="w-14 h-14 object-contain"
        />
        <div>
          <div className="text-sm text-gray-500">ID {pvzInfo.id || '50001234'}</div>
          <div className="text-xs text-gray-400">V1.0.51</div>
        </div>
      </div>

      {/* Кнопка добавить клиента */}
      <div className="p-4 bg-white">
        <button 
          onClick={onAddClient}
          className="w-full h-16 bg-purple-600 rounded-xl flex items-center justify-center text-white hover:bg-purple-700 transition-colors relative"
        >
          <Icon name="User" size={28} />
          {totalClients > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
              {totalClients}
            </span>
          )}
        </button>
      </div>

      {/* Список ячеек клиентов */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeClients.map((client) => (
          <div 
            key={client.id}
            onClick={() => onClientClick?.(client.id)}
            className={`bg-white rounded-2xl p-6 cursor-pointer transition-all border-2 ${
              currentClientId === client.id 
                ? 'border-purple-600 shadow-lg' 
                : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
            }`}
          >
            {/* Номер телефона клиента */}
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Клиент</div>
              <div className="text-base font-medium text-gray-700">
                +7 (•••) ••• {client.phone}
              </div>
            </div>

            {/* Номер ячейки - большой жирный шрифт */}
            <div className="mb-4 bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-2 text-center">Ячейка</div>
              <div className="text-8xl font-black text-gray-900 text-center leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {client.cellNumber}
              </div>
            </div>

            {/* Товаров */}
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Товаров</div>
              <div className="text-3xl font-bold text-gray-900">
                {client.itemsCount} из {client.itemsCount}
              </div>
            </div>

            {/* Пакетов */}
            <div className="mb-4 flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Icon name="Plus" size={24} className="text-gray-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Пакетов</div>
                <div className="text-2xl font-bold text-gray-900">0</div>
              </div>
            </div>

            {/* К оплате */}
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">К оплате</div>
              <div className="flex items-center gap-2">
                <Icon name="Wallet" size={20} className="text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  {client.totalAmount.toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1">Подробнее ↓</div>
            </div>

            {/* Кнопки действий */}
            <div className="space-y-3">
              <button 
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg rounded-xl transition-colors"
              >
                Выдать
              </button>
              <button 
                className="w-full py-3 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-medium text-base rounded-xl transition-colors"
              >
                Снять с примерки
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;
