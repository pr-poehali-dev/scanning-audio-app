import React, { useState } from 'react';
import { audioManager } from '@/utils/simpleAudioManager';
import { getCellsFromMainSystem } from '@/utils/cellAudioIntegration';
import Icon from '@/components/ui/icon';

// Импортируем подкомпоненты
import { StorageInfo } from './cell-audio/StorageInfo';
import { FileUploadZone } from './cell-audio/FileUploadZone';
import { DiagnosticTools } from './cell-audio/DiagnosticTools';
import { Instructions } from './cell-audio/Instructions';
import { CellsList } from './cell-audio/CellsList';
import { handleFileUpload } from './cell-audio/fileUploadUtils';

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files, setUploading, setUploadedCells, handleTestCell);
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
      handleFileUpload(e.target.files, setUploading, setUploadedCells, handleTestCell);
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
          <StorageInfo storageInfo={storageInfo} />

          {/* Зона загрузки */}
          <FileUploadZone
            uploading={uploading}
            dragActive={dragActive}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onFileInputChange={handleFileInputChange}
          />

          {/* Экстренная диагностика */}
          <DiagnosticTools />

          {/* Инструкции */}
          <Instructions />

          {/* Список загруженных ячеек */}
          <CellsList
            allCells={allCells}
            uploadedCells={uploadedCells}
            onTestCell={handleTestCell}
            onClearAll={clearAllAudio}
          />
        </div>
      </div>
    </div>
  );
};