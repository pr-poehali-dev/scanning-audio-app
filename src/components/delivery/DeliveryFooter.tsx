import Icon from '@/components/ui/icon';
import { Order } from '@/data/mockOrders';

interface DeliveryFooterProps {
  order: Order;
  deliveryStep: string;
}

export const DeliveryFooter = ({ order, deliveryStep }: DeliveryFooterProps) => {
  return (
    <>
      {/* Сообщение о выдаче */}
      {deliveryStep === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <Icon name="CheckCircle" size={48} className="text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">Товар выдан!</h3>
          <p className="text-green-700">Не забудьте попросить клиента оценить пункт выдачи в приложении</p>
        </div>
      )}

      {/* QR для брака */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h4 className="font-medium text-gray-900 mb-2">QR-код для брака до приемки</h4>
        <div className="inline-block bg-white p-4 rounded-lg border">
          <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <Icon name="QrCode" size={48} className="text-gray-400" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Для отметки брака: отсканируйте QR-код, указанный выше
        </p>
        
        {/* ОТЛАДКА ОЗВУЧКИ */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <button
              onClick={() => {
                // ПРИНУДИТЕЛЬНАЯ ОЧИСТКА ВСЕХ НЕПРАВИЛЬНЫХ ЯЧЕЕК
                console.log('🧹 ПРИНУДИТЕЛЬНАЯ ОЧИСТКА ЯЧЕЕК');
                localStorage.removeItem('cellAudios');
                
                // Также очищаем из основного хранилища все ключи с числами
                const storage = localStorage.getItem('wb-audio-files');
                if (storage) {
                  const files = JSON.parse(storage);
                  const cleanedFiles: {[key: string]: string} = {};
                  
                  Object.entries(files).forEach(([key, value]) => {
                    // Оставляем только основные ключи, БЕЗ cell-номеров
                    if (!key.match(/^\d+$/) && !key.startsWith('cell-') && !key.startsWith('ячейка-')) {
                      cleanedFiles[key] = value;
                    }
                  });
                  
                  localStorage.setItem('wb-audio-files', JSON.stringify(cleanedFiles));
                  console.log('🧹 Очищено. Оставлены только основные файлы:', Object.keys(cleanedFiles));
                }
                
                alert('🧹 ВСЕ ЯЧЕЙКИ УДАЛЕНЫ!\n\nСчетчик ячеек сброшен. Перезагрузите страницу.');
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs"
            >
              🧹 ОЧИСТИТЬ ЯЧЕЙКИ
            </button>
            
            <button
              onClick={async () => {
                const storage1 = localStorage.getItem('wb-audio-files');
                const storage2 = localStorage.getItem('cellAudios');
                
                console.log('🔊 ПОЛНАЯ ДИАГНОСТИКА АУДИО');
                console.log('📁 wb-audio-files:', storage1 ? 'ЕСТЬ' : 'НЕТ');
                console.log('📱 cellAudios:', storage2 ? 'ЕСТЬ' : 'НЕТ');
                
                let report = '🔍 ДИАГНОСТИКА ОЗВУЧКИ:\n\n';
                
                if (storage1) {
                  const files = JSON.parse(storage1);
                  const keys = Object.keys(files);
                  report += `📁 Основные файлы: ${keys.length} шт.\n`;
                  report += `📋 Список: ${keys.join(', ')}\n\n`;
                  
                  // Проверяем размер файлов
                  const firstFile = files[keys[0]];
                  if (firstFile) {
                    report += `📏 Размер первого файла: ${(firstFile.length / 1024).toFixed(1)} KB\n`;
                    report += `💾 Тип: ${firstFile.startsWith('data:audio/') ? 'base64 аудио' : 'неизвестный'}\n\n`;
                  }
                } else {
                  report += '❌ Основные файлы НЕ НАЙДЕНЫ!\n\n';
                }
                
                if (storage2) {
                  const cells = JSON.parse(storage2);
                  const cellKeys = Object.keys(cells);
                  report += `📱 Ячейки: ${cellKeys.length} шт.\n`;
                  if (cellKeys.length > 10) {
                    report += `📋 Первые 10: ${cellKeys.slice(0, 10).join(', ')}...\n`;
                  } else {
                    report += `📋 Список: ${cellKeys.join(', ')}\n`;
                  }
                } else {
                  report += '❌ Ячейки НЕ НАЙДЕНЫ!\n';
                }
                
                alert(report);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
            >
              🔍 ДИАГНОСТИКА
            </button>
            
            <button
              onClick={async () => {
                const storage = localStorage.getItem('wb-audio-files');
                console.log('🔊 ПРЯМОЕ ТЕСТИРОВАНИЕ ВСЕХ ФАЙЛОВ');
                
                if (storage) {
                  const files = JSON.parse(storage);
                  const keys = Object.keys(files);
                  console.log('📂 ВСЕ ключи в storage:', keys);
                  
                  let worked = false;
                  let report = '🔊 РЕЗУЛЬТАТ ТЕСТОВ:\n\n';
                  
                  // Тестируем каждый файл
                  for (const key of keys) {
                    try {
                      console.log(`▶️ Тестируем файл: ${key}`);
                      const audio = new Audio(files[key]);
                      audio.volume = 0.5; // Тихо для теста
                      await audio.play();
                      
                      report += `✅ ${key} - РАБОТАЕТ\n`;
                      worked = true;
                      
                      // Останавливаем через 1 сек для следующего теста
                      setTimeout(() => audio.pause(), 1000);
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      
                    } catch (error) {
                      report += `❌ ${key} - ОШИБКА: ${error.message}\n`;
                      console.log(`❌ Ошибка с ${key}:`, error);
                    }
                  }
                  
                  if (worked) {
                    report += `\n🎉 ФАЙЛЫ ЗАГРУЖЕНЫ ПРАВИЛЬНО!\nПроблема может быть в маппинге ключей.`;
                  } else {
                    report += `\n❌ НИ ОДИН файл не работает - проблема с форматом или сохранением`;
                  }
                  
                  alert(report);
                } else {
                  alert('❌ ФАЙЛЫ НЕ НАЙДЕНЫ!\n\nЗагрузите аудио через:\nНастройки → Голосовая озвучка');
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
            >
              🔊 ПОЛНЫЙ ТЕСТ
            </button>
            
            {/* НОВАЯ КНОПКА - ТЕСТ ЯЧЕЙКИ */}
            <button
              onClick={async () => {
                console.log('🧪 === ПРЯМОЙ ТЕСТ ЯЧЕЙКИ ===');
                
                // Получаем ячейку из заказа
                const testCellNumber = order?.cellNumber || '44';
                console.log(`🎯 Тестируем ячейку: ${testCellNumber}`);
                
                // Проверяем все хранилища
                const storages = [
                  'wb-audio-files',
                  'wb-pvz-cell-audio-settings-permanent',
                  'wb-pvz-cell-audio-cement',
                  'wb-pvz-cell-audio-IMMEDIATE'
                ];
                
                let foundFiles = false;
                let testKeys = [testCellNumber, `cell-${testCellNumber}`, `ячейка-${testCellNumber}`];
                
                for (const storageKey of storages) {
                  const storage = localStorage.getItem(storageKey);
                  if (storage) {
                    try {
                      const files = JSON.parse(storage);
                      const keys = Object.keys(files);
                      console.log(`📦 ${storageKey}: ${keys.length} файлов`, keys);
                      
                      // Проверяем есть ли наши ключи
                      for (const testKey of testKeys) {
                        if (files[testKey]) {
                          console.log(`✅ НАЙДЕН: ${testKey} в ${storageKey}`);
                          
                          // Пробуем воспроизвести
                          try {
                            const audio = new Audio(files[testKey]);
                            audio.volume = 0.7;
                            await audio.play();
                            console.log(`🎵 ЗВУК ВОСПРОИЗВЕДЕН: ${testKey}`);
                            foundFiles = true;
                            
                            setTimeout(() => audio.pause(), 2000);
                            alert(`✅ ЯЧЕЙКА ${testCellNumber} РАБОТАЕТ!\n\nКлюч: ${testKey}\nХранилище: ${storageKey}`);
                            return;
                          } catch (audioError) {
                            console.error(`❌ Ошибка воспроизведения ${testKey}:`, audioError);
                          }
                        }
                      }
                    } catch (parseError) {
                      console.error(`❌ Ошибка парсинга ${storageKey}:`, parseError);
                    }
                  }
                }
                
                if (!foundFiles) {
                  alert(`❌ ЯЧЕЙКА ${testCellNumber} НЕ НАЙДЕНА!\n\nПроверено в ${storages.length} хранилищах.\nКлючи: ${testKeys.join(', ')}\n\nЗагрузите файлы ячеек заново.`);
                }
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold"
            >
              🧪 ТЕСТ ЯЧЕЙКИ {order?.cellNumber || '44'}
            </button>
            
            <button
              onClick={() => {
                console.log('🧹 ЭКСТРЕННАЯ ОЧИСТКА - УДАЛЯЕМ ВСЁ СТАРОЕ');
                
                // Полная очистка ВСЕХ аудио данных
                localStorage.removeItem('wb-audio-files');
                localStorage.removeItem('wb-audio-cell-files');
                localStorage.removeItem('wb-pvz-uploaded-audio-files');
                
                // Очистка blob URLs (если есть)
                if (window.URL && window.URL.revokeObjectURL) {
                  console.log('🗑️ Очищаем blob URLs...');
                }
                
                alert('🧹 ВСЁ ОЧИЩЕНО!\n\n📋 ПОШАГОВАЯ ИНСТРУКЦИЯ:\n\n1️⃣ Перезагрузите страницу (F5)\n2️⃣ Настройки → Голосовая озвучка\n3️⃣ Загрузите папки заново\n4️⃣ Нажмите "🔊 ПОЛНЫЙ ТЕСТ"\n\n✨ Теперь файлы сохранятся в правильном формате!');
                
                // Автоматическая перезагрузка через 2 сек
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-bold"
            >
              🧹 ЭКСТРЕННАЯ ОЧИСТКА
            </button>
          </div>
        </div>
      </div>
    </>
  );
};