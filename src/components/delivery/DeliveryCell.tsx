import Icon from '@/components/ui/icon';
import { Order } from '@/data/mockOrders';

interface DeliveryCellProps {
  order: Order;
  selectedCell: string;
  onCellClick: (cellNumber: string) => void;
}

export const DeliveryCell = ({ order, selectedCell, onCellClick }: DeliveryCellProps) => {
  const handleCellClick = async (cellNumber: string) => {
    console.log(`Клик по ячейке ${cellNumber}`);
    
    try {
      // Интеграция с основной системой озвучки
      const { playAudio } = await import('@/hooks/audio/audioPlayer');
      const { loadAudioFilesFromStorage } = await import('@/hooks/audio/audioStorage');
      
      const audioFiles = loadAudioFilesFromStorage();
      await playAudio(cellNumber, audioFiles);
      console.log(`Ячейка ${cellNumber} озвучена!`);
      
    } catch (error) {
      console.warn(`Ошибка озвучки ячейки ${cellNumber}:`, error);
    }
    
    // Вызываем основной обработчик
    onCellClick(cellNumber);
  };

  const isSelected = selectedCell === order.cellNumber;

  return (
    <div 
      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-purple-500 bg-purple-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={() => handleCellClick(order.cellNumber)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
            isSelected ? 'bg-purple-600' : 'bg-gray-400'
          }`}>
            {order.cellNumber}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Ячейка {order.cellNumber}</h3>
            <p className="text-sm text-gray-600">Заказ #{order.id}</p>
          </div>
        </div>
        
        {isSelected && (
          <Icon name="Check" size={24} className="text-purple-600" />
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Товары:</span>
          <span className="text-sm text-gray-600">{order.items.length} шт.</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Общая стоимость:</span>
          <span className="text-sm font-semibold text-gray-900">{order.totalPrice} ₽</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Статус:</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            order.status === 'ready' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {order.status === 'ready' ? 'Готов к выдаче' : 'В обработке'}
          </span>
        </div>
      </div>
    </div>
  );
};