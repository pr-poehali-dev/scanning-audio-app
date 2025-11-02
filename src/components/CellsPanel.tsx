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
    <div className="hidden lg:flex w-20 sm:w-24 bg-white border-r flex-col fixed left-[140px] top-0 h-full z-20">

      <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1.5 sm:space-y-2 pt-4">
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