import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Order, getOrderStatusText } from '@/data/mockOrders';

interface DeliveryInterfaceProps {
  order: Order | null;
  onCellClick: (cellNumber: string) => void;
  onScanProduct: () => void;
  onDeliverProduct: () => void;
  isProductScanned: boolean;
  scannedData: string;
  deliveryStep?: string; // Добавляем глобальный шаг
}

const DeliveryInterface = ({
  order,
  onCellClick,
  onScanProduct,
  onDeliverProduct,
  isProductScanned,
  scannedData,
  deliveryStep = 'client-scanned'
}: DeliveryInterfaceProps) => {
  const [selectedCell, setSelectedCell] = useState<string>(order?.cellNumber || '');
  
  // Убираем локальный currentStep, используем deliveryStep напрямую

  if (!order) {
    return (
      <div className="text-center py-8">
        <Icon name="AlertCircle" size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Заказ не найден</p>
      </div>
    );
  }

  const orderStatus = getOrderStatusText(order.status);

  const handleCellClick = (cellNumber: string) => {
    setSelectedCell(cellNumber);
    onCellClick(cellNumber);
  };

  const handleScanProduct = () => {
    onScanProduct();
  };

  const handleDeliverProduct = () => {
    onDeliverProduct();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Заголовок с информацией о заказе */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Выдача</h2>
        <div className="space-y-1">
          <p className="text-gray-600">Клиент: <span className="font-medium">{order.customerName}</span></p>
          <p className="text-gray-600">Телефон: <span className="font-medium">{order.phone}</span></p>
          <p className="text-sm">
            Статус: <span className={`font-medium ${orderStatus.color}`}>{orderStatus.text}</span>
          </p>
        </div>
      </div>

      {/* Ячейка */}
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
              <div className="text-sm text-gray-500 mb-2">Ячейка</div>
              <div className="text-4xl font-bold text-gray-900">{order.cellNumber}</div>
              <div className="text-sm text-gray-600 mt-3">
                Информация по товарам клиента
              </div>
              <div className="text-xs text-gray-500 mt-1">
                На ячейке: {order.items.length}
              </div>
            </div>
          </div>
          
          {/* ЭКСТРЕННАЯ ДИАГНОСТИКА ОЗВУЧКИ */}
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
            
          {selectedCell === order.cellNumber && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <Icon name="Check" size={16} className="text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Товары - показываем всегда */}
      <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Товары к выдаче</h3>
            {!isProductScanned && (
              <button
                onClick={handleScanProduct}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Icon name="Scan" size={16} />
                Сканировать товар
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  isProductScanned && scannedData.includes(item.barcode)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 mb-1 truncate">
                      {item.barcode}
                    </div>
                    <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {item.name}
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>Цвет: <span className="font-medium">{item.color}</span></div>
                      <div>Размер: <span className="font-medium">{item.size}</span></div>
                      <div>Цена: <span className="font-medium">{item.price} ₽</span></div>
                    </div>
                  </div>
                </div>

                {isProductScanned && scannedData.includes(item.barcode) && (
                  <div className="mt-3 flex items-center gap-2 text-green-700 text-sm">
                    <Icon name="CheckCircle" size={16} />
                    Товар проверен
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Кнопка "Выдать товар" */}
          {isProductScanned && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <button
                  onClick={handleDeliverProduct}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-lg"
                >
                  Выдать товар
                </button>
              </div>
            </div>
          )}
        </div>

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
    </div>
  );
};

export default DeliveryInterface;