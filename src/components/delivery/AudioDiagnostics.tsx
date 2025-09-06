import { Order } from '@/data/mockOrders';
import { playCellAudio, hasCellAudio } from '@/utils/cellAudioPlayer';

interface AudioDiagnosticsProps {
  order: Order;
}

export const AudioDiagnostics = ({ order }: AudioDiagnosticsProps) => {
  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-sm font-bold text-red-800 mb-2">🚨 ЭКСТРЕННАЯ ДИАГНОСТИКА ОЗВУЧКИ</div>
      
      {/* Тест новой системы озвучки ячеек */}
      <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
        <div className="text-xs font-bold text-green-800 mb-1">🆕 ТЕСТ НОВОЙ СИСТЕМЫ ОЗВУЧКИ</div>
        <button
          onClick={async () => {
            console.log(`🎯 ТЕСТИРУЮ НОВУЮ ОЗВУЧКУ ЯЧЕЙКИ ${order.cellNumber}`);
            try {
              const played = await playCellAudio(order.cellNumber);
              console.log(`✅ Новая система озвучки: ${played ? 'РАБОТАЕТ' : 'НЕТ ФАЙЛА'}`);
              if (!played) {
                alert(`Озвучка для ячейки ${order.cellNumber} не найдена. Настройте её в разделе "Настройки озвучки".`);
              }
            } catch (error) {
              console.error('❌ Ошибка новой системы:', error);
            }
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold mr-2"
        >
          🎯 ТЕСТ НОВОЙ ОЗВУЧКИ {order.cellNumber}
        </button>
        
        <button
          onClick={() => {
            const hasAudio = hasCellAudio(order.cellNumber);
            alert(`Ячейка ${order.cellNumber} ${hasAudio ? 'ИМЕЕТ' : 'НЕ ИМЕЕТ'} настроенную озвучку`);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold"
        >
          ℹ️ ПРОВЕРИТЬ НАЛИЧИЕ
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        
        <button
          onClick={async () => {
            const cellNum = order.cellNumber;
            console.log(`🔍 === ДИАГНОСТИКА ЯЧЕЙКИ ${cellNum} ===`);
            
            // Проверяем ВСЕ хранилища
            const allStorages = Array.from({length: 20}, (_, i) => `wb-test-${i}`).concat([
              'wb-audio-files',
              'wb-pvz-cell-audio-settings-permanent', 
              'wb-pvz-cell-audio-cement',
              'wb-pvz-cell-audio-IMMEDIATE',
              'cellAudios',
              'audioFiles'
            ]);
            
            let found = false;
            let report = `🔍 ПОИСК ЯЧЕЙКИ ${cellNum}:\n\n`;
            
            for (const storageKey of allStorages) {
              const data = localStorage.getItem(storageKey);
              if (data) {
                try {
                  const files = JSON.parse(data);
                  const keys = Object.keys(files);
                  const cellKeys = keys.filter(k => 
                    k === cellNum || 
                    k === `cell-${cellNum}` || 
                    k === `ячейка-${cellNum}` ||
                    k.includes(cellNum)
                  );
                  
                  if (cellKeys.length > 0) {
                    report += `✅ ${storageKey}: НАЙДЕНО ${cellKeys.length} ключей\n`;
                    report += `   📋 Ключи: ${cellKeys.join(', ')}\n`;
                    found = true;
                    
                    // Пробуем воспроизвести ПЕРВЫЙ найденный
                    const firstKey = cellKeys[0];
                    const audioUrl = files[firstKey];
                    
                    try {
                      const audio = new Audio(audioUrl);
                      audio.volume = 1.0;
                      await audio.play();
                      report += `   🎵 ЗВУК РАБОТАЕТ!\n`;
                      setTimeout(() => audio.pause(), 3000);
                    } catch (playError) {
                      report += `   ❌ Ошибка воспроизведения: ${playError.message}\n`;
                    }
                  }
                } catch (parseError) {
                  // Игнорируем ошибки парсинга
                }
              }
            }
            
            if (!found) {
              report += '❌ ЯЧЕЙКА НЕ НАЙДЕНА НИ В ОДНОМ ХРАНИЛИЩЕ!';
            }
            
            alert(report);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-bold"
        >
          🔍 ПОИСК
        </button>
        
        <button
          onClick={() => {
            const cellNum = order.cellNumber;
            console.log(`💾 === ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ ТЕСТОВОГО ФАЙЛА ===`);
            
            // Создаем тестовый аудио файл (тишина 1 сек)
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 1;
            canvas.height = 1;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 1, 1);
            
            canvas.toBlob(async (blob) => {
              if (blob) {
                const audioUrl = URL.createObjectURL(blob);
                
                // Сохраняем во ВСЕ возможные ключи
                const testFiles = {
                  [cellNum]: audioUrl,
                  [`cell-${cellNum}`]: audioUrl,
                  [`ячейка-${cellNum}`]: audioUrl
                };
                
                // Сохраняем в основные хранилища
                localStorage.setItem('wb-audio-files', JSON.stringify(testFiles));
                localStorage.setItem('wb-pvz-cell-audio-settings-permanent', JSON.stringify(testFiles));
                localStorage.setItem('cellAudios', JSON.stringify(testFiles));
                
                console.log(`💾 Тестовые файлы сохранены:`, Object.keys(testFiles));
                alert(`💾 ТЕСТОВЫЕ ФАЙЛЫ СОЗДАНЫ!\n\nКлючи: ${Object.keys(testFiles).join(', ')}\n\nТеперь кликните по ячейке!`);
              }
            });
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-bold"
        >
          💾 СОЗДАТЬ ТЕСТ
        </button>
        
        {/* ТЕСТ ПРОСТОЙ СИСТЕМЫ */}
        <button
          onClick={async () => {
            const { diagnoseCellSystem, playCellAudio } = await import('@/utils/simpleCellAudio');
            const cellNum = order.cellNumber;
            
            console.log(`🚀 === ТЕСТ ПРОСТОЙ СИСТЕМЫ ===`);
            
            // Диагностика
            diagnoseCellSystem();
            
            // Попытка воспроизведения
            const success = await playCellAudio(cellNum);
            
            if (success) {
              alert(`✅ ПРОСТАЯ СИСТЕМА РАБОТАЕТ!\n\nЯчейка ${cellNum} воспроизведена успешно!`);
            } else {
              alert(`❌ ПРОСТАЯ СИСТЕМА НЕ РАБОТАЕТ!\n\nЯчейка ${cellNum} не найдена.\n\nЗагрузите файлы ячеек заново.`);
            }
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-bold"
        >
          🚀 ТЕСТ ПРОСТОЙ
        </button>
        
      </div>
    </div>
  );
};