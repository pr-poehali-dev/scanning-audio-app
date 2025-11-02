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

const LeftSidebar = ({ pvzInfo, activeClients = [] }: LeftSidebarProps) => {
  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-[104px] bg-white shadow-lg z-40 flex-col">
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

      {/* Кнопка профиля */}
      <div className="p-3">
        <button className="w-full aspect-square bg-purple-600 rounded-lg flex flex-col items-center justify-center text-white hover:bg-purple-700 transition-colors">
          <Icon name="User" size={20} />
          <span className="text-[10px] mt-1">4²</span>
        </button>
      </div>

      {/* Список ячеек */}
      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        {activeClients.map((client) => (
          <button 
            key={client.id}
            className="w-full aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <div className="text-2xl font-bold">{client.cellNumber}</div>
            <div className="text-[9px] text-gray-500 mt-1">{client.itemsCount}⁹</div>
          </button>
        ))}
        
        {/* Примеры дополнительных ячеек */}
        <button className="w-full aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200">
          <div className="text-2xl font-bold">344</div>
          <div className="text-[9px] text-gray-500 mt-1">9</div>
        </button>
        
        <button className="w-full aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200">
          <div className="text-2xl font-bold">190</div>
          <div className="text-[9px] text-gray-500 mt-1">7</div>
        </button>
        
        <button className="w-full aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200">
          <div className="text-2xl font-bold">521</div>
          <div className="text-[9px] text-gray-500 mt-1">12</div>
        </button>
        
        <button className="w-full aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200">
          <div className="text-2xl font-bold">90</div>
          <div className="text-[9px] text-gray-500 mt-1">2</div>
        </button>
        
        <button className="w-full aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200">
          <div className="text-2xl font-bold">345</div>
          <div className="text-[9px] text-gray-500 mt-1">1</div>
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;