import React from 'react';

interface StorageInfoProps {
  storageInfo: {
    totalFiles: number;
    totalSize: string;
    cellsCount: number;
  };
}

export const StorageInfo: React.FC<StorageInfoProps> = ({ storageInfo }) => {
  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-blue-900 mb-2">Информация о хранилище</h3>
      <div className="text-sm text-blue-700 space-y-1">
        <div>📁 Всего файлов: {storageInfo.totalFiles}</div>
        <div>💽 Размер: {storageInfo.totalSize}</div>
        <div>🏠 Ячеек с аудио: {storageInfo.cellsCount}</div>
      </div>
    </div>
  );
};