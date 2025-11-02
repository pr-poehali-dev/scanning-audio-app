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
          >
            <div className="text-2xl font-bold">{client.cellNumber}</div>
            <div className="text-[9px] text-gray-500 mt-0.5">{client.itemsCount}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;