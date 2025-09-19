import React, { useState } from 'react';
import { audioManager } from '@/utils/simpleAudioManager';
import { objectUrlAudioManager } from '@/utils/objectUrlAudioManager';
import { saveCellAudioToMainSystem, getCellsFromMainSystem } from '@/utils/cellAudioIntegration';
import Icon from '@/components/ui/icon';

interface CellAudioUploaderProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CellAudioUploader: React.FC<CellAudioUploaderProps> = ({ 
  isOpen = false, 
  onClose 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedCells, setUploadedCells] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    const successCells: string[] = [];
    
    try {
      for (const file of Array.from(files)) {
        // Проверяем что это аудио файл
        if (!file.type.startsWith('audio/')) {
          console.warn(`⚠️ Пропускаем файл ${file.name}: не аудио`);
          continue;
        }
        
        // УМНОЕ ИЗВЛЕЧЕНИЕ НОМЕРА ЯЧЕЙКИ ИЗ ИМЕНИ ФАЙЛА
        let cellNumber = '';
        const fileName = file.name.toLowerCase();
        
        console.log(`🔍 Анализирую файл: ${file.name}`);
        
        // Список всех возможных паттернов
        const patterns = [
          // Основные форматы
          /(?:cell[-_]?)([a-z]\d+)/i,           // cell-A1, cell_A1, cellA1
          /(?:ячейка[-_]?)([a-z]\d+)/i,         // ячейка-A1, ячейка_A1
          /^([a-z]\d+)/i,                       // A1.mp3, B15.wav
          /(?:номер[-_]?)(\d+)/i,               // номер-126, номер_126
          /(?:number[-_]?)(\d+)/i,              // number-126, number_126
          /(?:cell[-_]?)(\d+)/i,                // cell-126, cell_126
          /(?:ячейка[-_]?)(\d+)/i,              // ячейка-126, ячейка_126
          /^(\d+)/,                             // 126.mp3, 999.wav
          
          // Дополнительные форматы
          /(?:box[-_]?)([a-z]\d+)/i,            // box-A1, box_A1
          /(?:slot[-_]?)([a-z]\d+)/i,           // slot-A1, slot_A1
          /(?:compartment[-_]?)([a-z]\d+)/i,    // compartment-A1
          /(?:locker[-_]?)([a-z]\d+)/i,         // locker-A1
          
          // Для числовых ячеек
          /(?:box[-_]?)(\d+)/i,                 // box-126, box_126
          /(?:slot[-_]?)(\d+)/i,                // slot-126, slot_126
          /(?:compartment[-_]?)(\d+)/i,         // compartment-126
          /(?:locker[-_]?)(\d+)/i,              // locker-126
        ];
        
        // Пробуем каждый паттерн
        for (const pattern of patterns) {
          const match = fileName.match(pattern);
          if (match && match[1]) {
            cellNumber = match[1].toUpperCase();
            console.log(`✅ Найден номер ячейки "${cellNumber}" по паттерну: ${pattern}`);
            break;
          }
        }
        
        // Если ничего не найдено - пробуем извлечь любые буквы+цифры или просто цифры
        if (!cellNumber) {
          // Ищем комбинацию буква+цифры
          const letterNumberMatch = fileName.match(/([a-z]\d+)/i);
          if (letterNumberMatch) {
            cellNumber = letterNumberMatch[1].toUpperCase();
            console.log(`✅ Найден номер ячейки "${cellNumber}" как буква+цифры`);
          } else {
            // Ищем просто цифры
            const numberMatch = fileName.match(/(\d+)/);
            if (numberMatch) {
              cellNumber = numberMatch[1];
              console.log(`✅ Найден номер ячейки "${cellNumber}" как числовой`);
            }
          }
        }
        
        if (!cellNumber) {
          console.warn(`⚠️ Не удалось определить номер ячейки из файла: ${file.name}`);
          console.warn(`💡 Переименуйте файл в формат: A1.mp3, cell-126.mp3, или 999.mp3`);
          continue;
        }
        
        // ГЛАВНАЯ СИСТЕМА - сохраняем в wb-audio-files (как системные озвучки)
        console.log(`💾 [ГЛАВНАЯ] Сохраняю ${file.name} для ячейки ${cellNumber} в основную систему...`);
        const mainSystemSuccess = await saveCellAudioToMainSystem(cellNumber, file);
        
        // РЕЗЕРВНЫЕ СИСТЕМЫ
        console.log(`💾 [РЕЗЕРВ] Сохраняю ${file.name} для ячейки ${cellNumber} через Object URL...`);
        const objectUrlSuccess = await objectUrlAudioManager.saveCellAudio(cellNumber, file);
        
        console.log(`💾 [РЕЗЕРВ] Сохраняю ${file.name} для ячейки ${cellNumber} через Data URL менеджер...`);
        const dataUrlSuccess = await audioManager.saveCellAudio(cellNumber, file);
        
        if (mainSystemSuccess || objectUrlSuccess || dataUrlSuccess) {
          successCells.push(cellNumber);
          console.log(`✅ Загружен файл для ячейки ${cellNumber}:`);
          console.log(`   Главная система: ${mainSystemSuccess ? '✅' : '❌'}`);
          console.log(`   Object URL: ${objectUrlSuccess ? '✅' : '❌'}`);
          console.log(`   Data URL: ${dataUrlSuccess ? '✅' : '❌'}`);
        } else {
          console.error(`❌ Ошибка загрузки файла для ячейки ${cellNumber} во все системы`);
        }
      }
      
      setUploadedCells(prev => [...new Set([...prev, ...successCells])]);
      
      if (successCells.length > 0) {
        console.log(`🎉 Успешно загружено ${successCells.length} файлов ячеек`);
        
        // Показываем успешное сообщение с кнопкой тестирования
        const message = `Успешно загружено ${successCells.length} файлов!\n\nЯчейки: ${successCells.join(', ')}\n\nХотите протестировать первую ячейку?`;
        if (window.confirm(message)) {
          handleTestCell(successCells[0]);
        }
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки файлов:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const handleTestCell = async (cellNumber: string) => {
    try {
      console.log(`🎵 Тестирование ячейки ${cellNumber}...`);
      
      // ИСПОЛЬЗУЕМ ПРАВИЛЬНУЮ СИСТЕМУ ОЗВУЧКИ ЯЧЕЕК
      const { playCellAudio } = await import('@/utils/cellAudioPlayer');
      const success = await playCellAudio(cellNumber);
      
      if (success) {
        console.log(`✅ Ячейка ${cellNumber} успешно воспроизведена!`);
      } else {
        console.warn(`❌ Не удалось воспроизвести ячейку ${cellNumber}`);
        
        // Показываем диагностическую информацию
        const { getAudioEnabledCells } = await import('@/utils/cellAudioPlayer');
        const availableCells = getAudioEnabledCells();
        console.log(`📋 Доступные ячейки:`, availableCells);
      }
    } catch (error) {
      console.error(`❌ Ошибка тестирования ячейки ${cellNumber}:`, error);
    }
  };

  const getAllCells = () => {
    try {
      // Сначала пробуем получить из главной системы
      const mainCells = getCellsFromMainSystem();
      if (mainCells.length > 0) {
        console.log(`📋 Показываем ${mainCells.length} ячеек из главной системы`);
        return mainCells;
      }
      
      // Если в главной системе нет, берем из старой
      const oldCells = audioManager.getCellsWithAudio();
      console.log(`📋 Показываем ${oldCells.length} ячеек из старой системы`);
      return oldCells;
    } catch (error) {
      console.error('❌ Ошибка получения списка ячеек:', error);
      return [];
    }
  };

  const getStorageInfo = () => {
    try {
      // Комбинируем информацию из всех систем
      const oldInfo = audioManager.getStorageInfo();
      const mainCells = getCellsFromMainSystem();
      
      return {
        totalFiles: oldInfo.totalFiles,
        totalSize: oldInfo.totalSize,
        cellsCount: Math.max(oldInfo.cellsCount, mainCells.length)
      };
    } catch (error) {
      console.error('❌ Ошибка получения информации о хранилище:', error);
      return { totalFiles: 0, totalSize: '0 MB', cellsCount: 0 };
    }
  };

  const clearAllAudio = () => {
    if (window.confirm('Удалить все аудио файлы ячеек?')) {
      audioManager.clearAllAudio();
      setUploadedCells([]);
      console.log('🗑️ Все аудио файлы удалены');
    }
  };

  if (!isOpen) return null;

  const allCells = getAllCells();
  const storageInfo = getStorageInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Загрузка аудио файлов ячеек
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Информация о хранилище */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Информация о хранилище</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>📁 Всего файлов: {storageInfo.totalFiles}</div>
              <div>💽 Размер: {storageInfo.totalSize}</div>
              <div>🏠 Ячеек с аудио: {storageInfo.cellsCount}</div>
            </div>
          </div>

          {/* Зона загрузки */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {uploading ? (
              <div className="flex items-center justify-center space-x-2">
                <Icon name="Loader2" size={20} className="animate-spin text-blue-500" />
                <span className="text-gray-600">Загрузка файлов...</span>
              </div>
            ) : (
              <>
                <Icon name="Upload" size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Перетащите аудио файлы сюда
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  или нажмите для выбора файлов
                </p>
                <input
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="audio-file-input"
                />
                <label
                  htmlFor="audio-file-input"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <Icon name="FolderOpen" size={16} className="mr-2" />
                  Выбрать файлы
                </label>
              </>
            )}
          </div>

          {/* ЭКСТРЕННАЯ ДИАГНОСТИКА */}
          <div className="bg-red-50 rounded-lg p-4 mt-4 border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">Экстренная диагностика:</h4>
            <button
              onClick={async () => {
                console.log('🚨 === ЭКСТРЕННАЯ ДИАГНОСТИКА СИСТЕМЫ ===');
                
                // 1. Проверяем localStorage напрямую
                console.log('📦 ПРОВЕРКА LOCALSTORAGE:');
                const keys = Object.keys(localStorage);
                const audioKeys = keys.filter(k => k.includes('audio') || k.includes('cell') || k.includes('wb-'));
                console.log(`Всего ключей: ${keys.length}`);
                console.log(`Аудио ключей: ${audioKeys.length}`);
                audioKeys.forEach(key => {
                  const data = localStorage.getItem(key);
                  const size = data ? Math.round(data.length / 1024) : 0;
                  console.log(`  - ${key}: ${size}KB`);
                  
                  // Детальная проверка новой системы
                  if (key === 'wb-audio-files-unified') {
                    try {
                      const parsed = JSON.parse(data);
                      console.log(`    📊 Структура:`, parsed);
                      console.log(`    🏠 Ячейки:`, Object.keys(parsed.cells || {}));
                    } catch (e) {
                      console.log(`    ❌ Ошибка парсинга: ${e.message}`);
                    }
                  }
                });
                
                // 2. Тестируем новую систему
                console.log('\n🧪 ТЕСТ НОВОЙ СИСТЕМЫ:');
                try {
                  const { audioManager } = await import('@/utils/simpleAudioManager');
                  const cells = audioManager.getCellsWithAudio();
                  const info = audioManager.getStorageInfo();
                  
                  console.log(`Ячеек в новой системе: ${cells.length}`);
                  console.log(`Доступные ячейки:`, cells);
                  console.log(`Информация о хранилище:`, info);
                  
                  // Тест воспроизведения
                  if (cells.length > 0) {
                    const testCell = cells[0];
                    console.log(`🎵 Тестирую воспроизведение ячейки ${testCell}...`);
                    const success = await audioManager.playCellAudio(testCell);
                    console.log(`Результат теста: ${success ? 'УСПЕХ ✅' : 'ПРОВАЛ ❌'}`);
                  }
                } catch (error) {
                  console.error('❌ Ошибка новой системы:', error);
                }
                
                // 3. Проверяем основную функцию
                console.log('\n🎯 ТЕСТ ОСНОВНОЙ ФУНКЦИИ:');
                try {
                  const { playCellAudio, getAudioEnabledCells } = await import('@/utils/cellAudioPlayer');
                  const enabledCells = getAudioEnabledCells();
                  console.log(`Ячейки через основную функцию: ${enabledCells.length}`);
                  console.log(`Список:`, enabledCells);
                  
                  if (enabledCells.length > 0) {
                    const testCell = enabledCells[0];
                    console.log(`🎵 Тестирую основную функцию с ячейкой ${testCell}...`);
                    const success = await playCellAudio(testCell);
                    console.log(`Результат основной функции: ${success ? 'УСПЕХ ✅' : 'ПРОВАЛ ❌'}`);
                  }
                } catch (error) {
                  console.error('❌ Ошибка основной функции:', error);
                }
                
                alert('Диагностика завершена! Проверьте консоль (F12) для подробностей.');
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
            >
              🚨 ЭКСТРЕННАЯ ДИАГНОСТИКА
            </button>
          </div>

          {/* Инструкция */}
          <div className="bg-green-50 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-green-800 mb-3">Как загрузить озвучку ячеек:</h4>
            
            <div className="space-y-3 text-sm text-green-700">
              <div>
                <div className="font-medium mb-1">Правила именования файлов:</div>
                <div className="bg-green-100 rounded p-2 font-mono text-xs space-y-1">
                  <div><code>A1.mp3</code> - ячейка A1</div>
                  <div><code>cell-B15.mp3</code> - ячейка B15</div>
                  <div><code>126.mp3</code> - ячейка 126</div>
                  <div><code>ячейка-A25.mp3</code> - ячейка A25</div>
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-1">Что должно содержать аудио:</div>
                <div className="bg-green-100 rounded p-2 text-xs">
                  Файл должен произносить номер ячейки, например:<br/>
                  <strong>"Ячейка А один"</strong> или <strong>"Номер сто двадцать шесть"</strong>
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-1">Технические требования:</div>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li>Форматы: MP3, WAV, M4A, OGG</li>
                  <li>Размер: до 2 МБ на файл</li>
                  <li>Длительность: желательно до 3 секунд</li>
                  <li>Качество: 44.1 кГц, 128 кбит/с достаточно</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Полезные советы */}
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Полезные советы:</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Можно перетащить папку с файлами прямо в окно</li>
              <li>Система автоматически определит номер ячейки из имени файла</li>
              <li>После загрузки нажмите на номер ячейки для проверки</li>
              <li>Файлы сохраняются в браузере и будут доступны при следующем запуске</li>
            </ul>
          </div>

          {/* Список загруженных ячеек */}
          {allCells.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Загруженные ячейки ({allCells.length})
                </h4>
                <button
                  onClick={clearAllAudio}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Очистить все
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-40 overflow-y-auto">
                {allCells.map(cellNumber => (
                  <button
                    key={cellNumber}
                    onClick={() => handleTestCell(cellNumber)}
                    className={`p-2 text-xs rounded border hover:bg-gray-50 transition-colors ${
                      uploadedCells.includes(cellNumber)
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                    title={`Нажмите для тестирования ячейки ${cellNumber}`}
                  >
                    {cellNumber}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Нажмите на ячейку для проверки воспроизведения
              </p>
              
              {/* ДИАГНОСТИЧЕСКАЯ КНОПКА */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <button
                  onClick={async () => {
                    console.log('🔍 === ДИАГНОСТИКА СИСТЕМЫ ОЗВУЧКИ ЯЧЕЕК ===');
                    
                    let report = 'ДИАГНОСТИКА СИСТЕМЫ ОЗВУЧКИ ЯЧЕЕК:\n\n';
                    
                    try {
                      // 1. Проверяем Data URL менеджер
                      const { audioManager, getStorageInfo } = await import('@/utils/simpleAudioManager');
                      const info = getStorageInfo();
                      const cells = audioManager.getCellsWithAudio();
                      
                      report += `📊 DATA URL СИСТЕМА:\n`;
                      report += `  Файлов: ${info.totalFiles}\n`;
                      report += `  Ячеек: ${info.cellsCount}\n`;
                      report += `  Размер: ${info.totalSize}\n`;
                      report += `  Доступные ячейки: ${cells.slice(0, 10).join(', ')}\n\n`;
                      
                      // 2. Проверяем Object URL менеджер
                      const { objectUrlAudioManager, getAudioManagerInfo } = await import('@/utils/objectUrlAudioManager');
                      const objInfo = getAudioManagerInfo();
                      const objCells = objectUrlAudioManager.getCellsWithAudio();
                      
                      report += `📊 OBJECT URL СИСТЕМА:\n`;
                      report += `  Ячеек: ${objInfo.cellsCount}\n`;
                      report += `  URLs: ${objInfo.totalUrls}\n`;
                      report += `  Доступные ячейки: ${objCells.slice(0, 10).join(', ')}\n\n`;
                      
                      // 3. Проверяем главную систему
                      const { getCellsFromMainSystem } = await import('@/utils/cellAudioIntegration');
                      const mainCells = getCellsFromMainSystem();
                      
                      report += `📊 ГЛАВНАЯ СИСТЕМА (wb-audio-files):\n`;
                      report += `  Ячеек: ${mainCells.length}\n`;
                      report += `  Доступные ячейки: ${mainCells.slice(0, 10).join(', ')}\n\n`;
                      
                      // 4. Тестируем первую ячейку через все системы
                      if (cells.length > 0) {
                        const testCell = cells[0];
                        report += `🧪 ТЕСТ ВОСПРОИЗВЕДЕНИЯ ЯЧЕЙКИ "${testCell}":\n`;
                        
                        // Тест через основную функцию
                        try {
                          const { playCellAudio } = await import('@/utils/cellAudioPlayer');
                          const success = await playCellAudio(testCell);
                          report += `  Основная функция: ${success ? 'РАБОТАЕТ ✅' : 'НЕ РАБОТАЕТ ❌'}\n`;
                        } catch (e) {
                          report += `  Основная функция: ОШИБКА ❌ - ${e.message}\n`;
                        }
                      } else {
                        report += `❌ НЕТ ЯЧЕЕК ДЛЯ ТЕСТИРОВАНИЯ!\n`;
                        report += `💡 Загрузите MP3 файлы через кнопку "Выбрать файлы" выше\n`;
                      }
                      
                    } catch (error) {
                      report += `❌ КРИТИЧЕСКАЯ ОШИБКА: ${error.message}\n`;
                    }
                    
                    alert(report);
                    console.log(report);
                  }}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium"
                >
                  🔍 Диагностика системы озвучки
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};