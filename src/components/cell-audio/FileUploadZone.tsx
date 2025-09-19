import React from 'react';
import Icon from '@/components/ui/icon';

interface FileUploadZoneProps {
  uploading: boolean;
  dragActive: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  uploading,
  dragActive,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileInputChange
}) => {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
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
            onChange={onFileInputChange}
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
  );
};