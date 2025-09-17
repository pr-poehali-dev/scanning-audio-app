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
        
        // Извлекаем номер ячейки из имени файла
        const cellMatch = file.name.match(/(?:cell-)?(\w+\d+)(?:\.mp3|\.wav|\.m4a|\.ogg)?$/i);
        if (!cellMatch) {
          console.warn(`⚠️ Не удалось определить номер ячейки из файла: ${file.name}`);
          continue;
        }
        
        const cellNumber = cellMatch[1].toUpperCase();
        
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
      
      // Сначала пробуем главную систему
      const { playCellAudioFromMainSystem } = await import('@/utils/cellAudioIntegration');
      const mainSuccess = await playCellAudioFromMainSystem(cellNumber);
      
      if (mainSuccess) {
        console.log(`✅ Ячейка ${cellNumber} воспроизведена через главную систему`);
        return;
      }
      
      // Если главная система не сработала, пробуем старые
      console.log(`⚠️ Главная система не сработала, пробую резервные...`);
      const oldSuccess = await audioManager.playCellAudio(cellNumber);
      
      if (!oldSuccess) {
        console.warn(`❌ Не удалось воспроизвести ячейку ${cellNumber} через все системы`);
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

          {/* Инструкция */}
          <div className="bg-yellow-50 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-yellow-800 mb-2">📋 Инструкция:</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Именуйте файлы как <code className="bg-yellow-200 px-1 rounded">cell-A1.mp3</code> или <code className="bg-yellow-200 px-1 rounded">B15.mp3</code></li>
              <li>Поддерживаются форматы: MP3, WAV, M4A, OGG</li>
              <li>Можно загружать несколько файлов одновременно</li>
              <li>Файлы сохраняются в localStorage браузера</li>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};