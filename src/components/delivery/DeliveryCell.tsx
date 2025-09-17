import Icon from '@/components/ui/icon';
import { Order } from '@/data/mockOrders';
import { hasCellAudio } from '@/utils/cellAudioPlayer';

interface DeliveryCellProps {
  order: Order;
  selectedCell: string;
  onCellClick: (cellNumber: string) => void;
}

export const DeliveryCell = ({ order, selectedCell, onCellClick }: DeliveryCellProps) => {
  const handleCellClick = async (cellNumber: string) => {
    console.log(`🎯 DeliveryCell: Клик по ячейке ${cellNumber}`);
    
    // Вызываем проп onCellClick, который должен содержать логику озвучки
    onCellClick(cellNumber);
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

      {/* ДИАГНОСТИКА + ТЕСТ ЗАГРУЗКИ */}
      <div className="mt-2 flex gap-1">
        <button
          onClick={async () => {
            const cellNum = order.cellNumber;
            let report = `🔍 ДИАГНОСТИКА ЯЧЕЙКИ ${cellNum}:\n\n`;
            
            // Проверяем localStorage
            const mainFiles = localStorage.getItem('wb-audio-files');
            if (mainFiles) {
              const files = JSON.parse(mainFiles);
              const keys = Object.keys(files);
              
              report += `📦 wb-audio-files содержит ${keys.length} файлов:\n`;
              
              const cellKeys = keys.filter(k => 
                k.includes(cellNum) || 
                k.startsWith('cell-') || 
                k === cellNum
              );
              
              if (cellKeys.length > 0) {
                report += `✅ Найдены ключи для ячейки ${cellNum}:\n`;
                cellKeys.forEach(key => {
                  const url = files[key];
                  const urlType = url ? (url.startsWith('data:') ? 'DATA' : url.startsWith('blob:') ? 'BLOB' : 'OTHER') : 'EMPTY';
                  report += `  - ${key}: ${urlType} (${url ? url.substring(0, 30) + '...' : 'пустой'})\n`;
                });
              } else {
                report += `❌ НЕ найдены файлы для ячейки ${cellNum}\n`;
                report += `📋 Все ключи: ${keys.slice(0, 10).join(', ')}${keys.length > 10 ? '...' : ''}\n`;
              }
            } else {
              report += `❌ wb-audio-files ПУСТОЕ!\n`;
            }
            
            alert(report);
          }}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded"
        >
          🔍
        </button>
        
        <input
          type="file"
          accept="audio/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            
            const cellNum = order.cellNumber;
            console.log(`🧪 ТЕСТ ЗАГРУЗКИ: ${file.name} → ячейка ${cellNum}`);
            
            try {
              const { saveCellAudioToMainSystem } = await import('@/utils/cellAudioIntegration');
              const success = await saveCellAudioToMainSystem(cellNum, file);
              
              if (success) {
                alert(`✅ Файл ${file.name} успешно сохранен для ячейки ${cellNum}!\n\nТеперь кликните по ячейке для проверки.`);
              } else {
                alert(`❌ Ошибка сохранения файла для ячейки ${cellNum}`);
              }
            } catch (error) {
              alert(`❌ Критическая ошибка: ${error.message}`);
            }
          }}
          className="text-xs w-20"
        />
      </div>
    </div>
  );
};