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
}

const LeftSidebar = ({ pvzInfo, activeClients = [], onAddClient }: LeftSidebarProps) => {
  const totalClients = activeClients.length;
  
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
      <div className="p-3 flex-1 flex items-start">
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
    </div>
  );
};

export default LeftSidebar;