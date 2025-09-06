import Icon from '@/components/ui/icon';
import { Order } from '@/data/mockOrders';
import { playCellAudio, hasCellAudio } from '@/utils/cellAudioPlayer';

interface DeliveryCellProps {
  order: Order;
  selectedCell: string;
  onCellClick: (cellNumber: string) => void;
}

export const DeliveryCell = ({ order, selectedCell, onCellClick }: DeliveryCellProps) => {
  const handleCellClick = async (cellNumber: string) => {
    onCellClick(cellNumber);
    
    // Воспроизводим озвучку ячейки если она настроена
    try {
      await playCellAudio(cellNumber);
    } catch (error) {
      console.error('Ошибка воспроизведения озвучки ячейки:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ячейка для выдачи</h3>
      <div className="max-w-sm mx-auto">
        <div
          onClick={() => handleCellClick(order.cellNumber)}
          className={`relative cursor-pointer transition-all duration-200 ${
            selectedCell === order.cellNumber 
              ? 'ring-2 ring-purple-500 bg-purple-50' 
              : 'hover:bg-gray-50'
          }`}
        >
          <div className="bg-gray-100 rounded-lg p-8 text-center border-2 border-gray-200">
            <div className="text-sm text-gray-500 mb-2 flex items-center justify-center gap-2">
              Ячейка
              {hasCellAudio(order.cellNumber) && (
                <Icon name="Volume2" size={16} className="text-green-600" title="Озвучена" />
              )}
            </div>
            <div className="text-4xl font-bold text-gray-900">{order.cellNumber}</div>
            <div className="text-sm text-gray-600 mt-3">
              Информация по товарам клиента
            </div>
            <div className="text-xs text-gray-500 mt-1">
              На ячейке: {order.items.length}
              {hasCellAudio(order.cellNumber) && (
                <span className="text-green-600 ml-2">• Озвучена</span>
              )}
            </div>
          </div>
        </div>
          
        {selectedCell === order.cellNumber && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
              <Icon name="Check" size={16} className="text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};