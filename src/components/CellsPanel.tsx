import Icon from '@/components/ui/icon';

export interface ActiveClient {
  id: string;
  phone: string;
  cellNumber: string;
  itemsCount: number;
  totalAmount: number;
}

interface CellsPanelProps {
  activeClients: ActiveClient[];
  currentClientId?: string;
  onClientClick?: (clientId: string) => void;
}

const CellsPanel = ({ activeClients, currentClientId, onClientClick }: CellsPanelProps) => {
  return (
    <div className="hidden lg:flex w-20 sm:w-24 bg-white border-r flex-col">
      <div className="p-2 sm:p-3 border-b bg-white">
        <img 
          src="https://cdn.poehali.dev/files/efef9a74-93b2-4603-ab83-2969a53a16d9.png" 
          alt="WB" 
          className="w-12 sm:w-14 h-12 sm:h-14 object-contain mx-auto"
        />
        <div className="text-center mt-1.5 sm:mt-2">
          <div className="text-[9px] sm:text-[10px] text-gray-500">ID 50001234</div>
          <div className="text-[9px] sm:text-[10px] text-gray-600 font-medium">V.1.0.51</div>
        </div>
      </div>

      <div className="p-1.5 sm:p-2 border-b bg-purple-600 text-white">
        <button className="w-full flex flex-col items-center p-1.5 sm:p-2">
          <Icon name="User" size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1.5 sm:space-y-2">
        {activeClients.map((client) => (
          <button
            key={client.id}
            onClick={() => onClientClick?.(client.id)}
            className={`w-full border-2 rounded-lg p-1.5 sm:p-2 transition-all active:scale-95 ${
              currentClientId === client.id
                ? 'border-purple-600 bg-purple-50'
                : 'border-purple-600 bg-white hover:bg-purple-50'
            }`}
          >
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">
              {client.cellNumber}
            </div>
            <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">
              {client.itemsCount} шт
            </div>
            <div className="text-[8px] sm:text-[9px] text-purple-600 font-medium mt-0.5 sm:mt-1">
              {client.totalAmount} ₽
            </div>
            <div className="text-[7px] sm:text-[8px] text-gray-400 mt-0.5">
              **{client.phone.slice(-2)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CellsPanel;