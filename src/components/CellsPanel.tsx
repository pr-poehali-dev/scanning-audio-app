import Icon from '@/components/ui/icon';

interface CellData {
  cell: number;
  items: number;
}

interface CellsPanelProps {
  cells: CellData[];
  currentCell?: number;
  onCellClick?: (cell: number) => void;
}

const CellsPanel = ({ cells, currentCell, onCellClick }: CellsPanelProps) => {
  return (
    <div className="w-24 bg-white border-r flex flex-col">
      <div className="p-3 border-b bg-white">
        <img 
          src="https://cdn.poehali.dev/files/85c8d8ae-4b8f-45da-8f82-ca7b135fbe9f.png" 
          alt="WB" 
          className="w-14 h-14 object-contain mx-auto"
        />
        <div className="text-center mt-2">
          <div className="text-[10px] text-gray-500">ID 50001234</div>
          <div className="text-[10px] text-gray-600 font-medium">V.1.0.51</div>
        </div>
      </div>

      <div className="p-2 border-b bg-purple-600 text-white">
        <button className="w-full flex flex-col items-center p-2">
          <Icon name="User" size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {cells.map((data, index) => (
          <button
            key={index}
            onClick={() => onCellClick?.(data.cell)}
            className={`w-full border-2 rounded-lg p-2 transition-all active:scale-95 ${
              currentCell === data.cell
                ? 'border-purple-600 bg-purple-50'
                : 'border-purple-600 bg-white hover:bg-purple-50'
            }`}
          >
            <div className="text-3xl font-bold text-gray-900 leading-none">
              {data.cell}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {data.items}<sup>2</sup>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CellsPanel;
