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
            let report = `🔍 СУПЕР-ДИАГНОСТИКА ЯЧЕЙКИ ${cellNum}:\n\n`;
            
            // 1. ПРОВЕРЯЕМ ВСЕ КЛЮЧИ LOCALSTORAGE
            const allKeys = Object.keys(localStorage).filter(k => k.includes('audio') || k.includes('wb-'));
            report += `📦 НАЙДЕНО ${allKeys.length} аудио-ключей в localStorage:\n`;
            
            let foundAnyFile = false;
            let testedUrls = [];
            
            for (const key of allKeys) {
              try {
                const data = localStorage.getItem(key);
                if (data && data.length > 100) {
                  const parsed = JSON.parse(data);
                  
                  if (typeof parsed === 'object') {
                    // Это объект с файлами
                    const fileKeys = Object.keys(parsed);
                    const cellFiles = fileKeys.filter(fk => 
                      fk.includes(cellNum) || 
                      fk === cellNum ||
                      fk === `cell-${cellNum}` ||
                      fk === `ячейка-${cellNum}` ||
                      fk === `delivery-cell-${cellNum}`
                    );
                    
                    if (cellFiles.length > 0) {
                      report += `✅ ${key}: найдено ${cellFiles.length} файлов для ячейки\n`;
                      
                      for (const fileKey of cellFiles) {
                        const audioUrl = parsed[fileKey];
                        if (audioUrl && typeof audioUrl === 'string' && audioUrl.length > 50) {
                          foundAnyFile = true;
                          const urlType = audioUrl.startsWith('data:') ? 'DATA-URL' : 
                                         audioUrl.startsWith('blob:') ? 'BLOB-URL' : 'OTHER';
                          
                          report += `  → ${fileKey}: ${urlType} (${audioUrl.length} символов)\n`;
                          
                          // ПРОБУЕМ ВОСПРОИЗВЕСТИ НАПРЯМУЮ
                          try {
                            const audio = new Audio();
                            audio.volume = 0.7;
                            audio.src = audioUrl;
                            
                            await audio.play();
                            report += `    🎵 ВОСПРОИЗВЕДЕНИЕ УСПЕШНО!\n`;
                            testedUrls.push(`${key}[${fileKey}]: ✅ РАБОТАЕТ`);
                            
                            setTimeout(() => audio.pause(), 1500);
                            break; // Нашли рабочий файл, достаточно
                            
                          } catch (playError) {
                            report += `    ❌ Ошибка воспроизведения: ${playError.message}\n`;
                            testedUrls.push(`${key}[${fileKey}]: ❌ ${playError.message}`);
                          }
                        }
                      }
                    }
                  }
                }
              } catch (err) {
                // Пропускаем ключи которые не JSON
              }
            }
            
            if (!foundAnyFile) {
              report += `\n❌ НИ ОДНОГО ФАЙЛА ДЛЯ ЯЧЕЙКИ ${cellNum} НЕ НАЙДЕНО!\n`;
              report += `\n🔧 НУЖНО ЗАГРУЗИТЬ ФАЙЛ:\n`;
              report += `- Используйте поле загрузки рядом с этой кнопкой\n`;
              report += `- Или синюю кнопку в шапке\n`;
              report += `- Файл должен называться ${cellNum}.mp3 или cell-${cellNum}.mp3\n`;
            } else {
              report += `\n📊 РЕЗУЛЬТАТЫ ТЕСТОВ:\n`;
              testedUrls.forEach(test => report += `${test}\n`);
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
        
        <button
          onClick={async () => {
            const cellNum = order.cellNumber;
            console.log(`🚨 ЭКСТРЕННОЕ ВОСПРОИЗВЕДЕНИЕ ячейки ${cellNum}`);
            
            // Ищем ЛЮБОЙ аудио файл в localStorage который может подойти
            const allKeys = Object.keys(localStorage).filter(k => k.includes('audio') || k.includes('wb-'));
            
            for (const key of allKeys) {
              try {
                const data = localStorage.getItem(key);
                if (data && data.length > 100) {
                  const parsed = JSON.parse(data);
                  
                  if (typeof parsed === 'object') {
                    // Перебираем все ключи в объекте
                    for (const [fileKey, audioUrl] of Object.entries(parsed)) {
                      if (typeof audioUrl === 'string' && audioUrl.length > 50) {
                        // Проверяем что это может быть наша ячейка
                        const isOurCell = fileKey.includes(cellNum) || 
                                         fileKey === cellNum ||
                                         fileKey === `cell-${cellNum}` ||
                                         fileKey === `ячейка-${cellNum}`;
                        
                        if (isOurCell) {
                          console.log(`🎯 Найден файл: ${key}[${fileKey}]`);
                          
                          try {
                            const audio = new Audio();
                            audio.volume = 0.8;
                            audio.src = audioUrl;
                            
                            await audio.play();
                            console.log(`✅ ЭКСТРЕННОЕ ВОСПРОИЗВЕДЕНИЕ УСПЕШНО!`);
                            
                            setTimeout(() => audio.pause(), 2000);
                            return; // Успех!
                            
                          } catch (playError) {
                            console.warn(`❌ Не удалось воспроизвести ${key}[${fileKey}]:`, playError.message);
                          }
                        }
                      }
                    }
                  }
                }
              } catch (err) {
                // Пропускаем нечитаемые ключи
              }
            }
            
            alert(`❌ ЭКСТРЕННОЕ ВОСПРОИЗВЕДЕНИЕ НЕ УДАЛОСЬ!\n\nДля ячейки ${cellNum} не найдено ни одного рабочего аудио файла.\n\nЗагрузите файл через поле рядом.`);
          }}
          className="px-2 py-1 bg-green-600 text-white text-xs rounded"
          title="Экстренное воспроизведение - ищет файл напрямую в localStorage"
        >
          🚨
        </button>
      </div>
    </div>
  );
};