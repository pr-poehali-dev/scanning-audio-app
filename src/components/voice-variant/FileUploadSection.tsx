import React, { useRef } from 'react';
import Icon from '@/components/ui/icon';

interface FileUploadSectionProps {
  selectedVariant: 'standard' | 'alternative';
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  selectedVariant,
  isUploading,
  uploadProgress,
  onFileSelect
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Icon name="Upload" size={20} />
        Загрузка для варианта: {selectedVariant === 'standard' ? 'Стандартная' : 'Альтернативная'}
      </h3>
      
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.m4a,.ogg"
          onChange={onFileSelect}
          className="hidden"
          id="cell-audio-upload"
        />
        
        <div className="flex gap-3">
          <label
            htmlFor="cell-audio-upload"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium cursor-pointer transition-all flex-1 justify-center ${
              isUploading
                ? 'bg-gray-300 cursor-not-allowed'
                : selectedVariant === 'standard'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            {isUploading ? (
              <>
                <Icon name="Loader" size={20} className="animate-spin" />
                Загружаем...
              </>
            ) : (
              <>
                <Icon name="Upload" size={20} />
                Выбрать аудиофайлы
              </>
            )}
          </label>
        </div>
        
        {/* Прогресс загрузки */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Icon name="BarChart" size={16} />
              Прогресс загрузки:
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(uploadProgress).map(([cellNumber, progress]) => (
                <div key={cellNumber} className="flex items-center gap-3">
                  <span className="text-sm font-mono w-12">#{cellNumber}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        progress === 100 ? 'bg-green-500' : 
                        progress === -1 ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.max(0, progress)}%` }}
                    />
                  </div>
                  <span className="text-sm w-8">
                    {progress === 100 ? '✅' : progress === -1 ? '❌' : `${progress}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadSection;