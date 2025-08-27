import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AudioManagerProps {
  onClose: () => void;
  onAudioFilesUpdate: (files: { [key: string]: string }) => void;
}

export const AudioManager = ({ onClose, onAudioFilesUpdate }: AudioManagerProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Предустановленные звуки для системы
  const audioKeys = {
    'cell-number': 'Объявление номера ячейки',
    'check-discount-wallet': 'Проверить скидку/кошелек',
    'check-product-camera': 'Покажите товар под камеру',
    'delivery-complete': 'Товар выдан',
    'receiving-scan': 'Сканирование при приемке',
    'return-complete': 'Возврат завершен',
    'rate-pickup-point': 'Оцените пункт выдачи'
  };

  // Конвертация файла в Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Обработка загрузки файлов
  const handleFilesUpload = async (files: FileList) => {
    setUploading(true);
    const newFiles: { [key: string]: string } = {};

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name)) {
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        const fileName = file.name.toLowerCase();
        
        // Автоматическое сопоставление файлов по именам
        let audioKey = '';
        if (fileName.includes('ячейк') || fileName.includes('cell')) {
          audioKey = 'cell-number';
        } else if (fileName.includes('скидк') || fileName.includes('кошел') || fileName.includes('discount')) {
          audioKey = 'check-discount-wallet';
        } else if (fileName.includes('камер') || fileName.includes('camera') || fileName.includes('покаж')) {
          audioKey = 'check-product-camera';
        } else if (fileName.includes('выдач') || fileName.includes('выдан') || fileName.includes('delivery')) {
          audioKey = 'delivery-complete';
        } else if (fileName.includes('приемк') || fileName.includes('скан') || fileName.includes('receiving')) {
          audioKey = 'receiving-scan';
        } else if (fileName.includes('возврат') || fileName.includes('return')) {
          audioKey = 'return-complete';
        } else if (fileName.includes('оцен') || fileName.includes('rate') || fileName.includes('пункт')) {
          audioKey = 'rate-pickup-point';
        } else {
          // Если не удалось сопоставить, используем имя файла
          audioKey = file.name.replace(/\.[^/.]+$/, "");
        }
        
        newFiles[audioKey] = base64;
      } catch (error) {
        console.error(`Ошибка загрузки файла ${file.name}:`, error);
      }
    }

    setUploadedFiles(prev => ({ ...prev, ...newFiles }));
    setUploading(false);
  };

  // Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Выбор файлов через input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesUpload(e.target.files);
    }
  };

  // Ручное сопоставление файла с ключом
  const assignFileToKey = (file: string, key: string) => {
    const updatedFiles = { ...uploadedFiles };
    delete updatedFiles[file];
    updatedFiles[key] = uploadedFiles[file];
    setUploadedFiles(updatedFiles);
  };

  // Удаление файла
  const removeFile = (key: string) => {
    const updatedFiles = { ...uploadedFiles };
    delete updatedFiles[key];
    setUploadedFiles(updatedFiles);
  };

  // Сохранение
  const handleSave = () => {
    onAudioFilesUpdate(uploadedFiles);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Volume2" size={24} className="text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Менеджер озвучки</h2>
                <p className="text-sm text-gray-600">Загрузите аудиофайлы для автоматической озвучки</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Инструкции */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="Info" size={18} className="text-blue-600" />
                Как загрузить озвучку с Mail.ru Cloud
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <span>Перейдите по ссылке: <code className="bg-blue-100 px-2 py-1 rounded">https://cloud.mail.ru/public/vmnn/73ri9QfHz</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <span>Скачайте архив с аудиофайлами</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <span>Разархивируйте файлы</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                  <span>Перетащите все аудиофайлы в область ниже или нажмите "Выбрать файлы"</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Зона загрузки */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <Icon 
                name={uploading ? "Loader2" : "Upload"} 
                size={48} 
                className={`mx-auto text-gray-400 ${uploading ? "animate-spin" : ""}`} 
              />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {uploading ? 'Загружаю файлы...' : 'Перетащите аудиофайлы сюда'}
                </p>
                <p className="text-gray-500">или</p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-2"
                >
                  <Icon name="FolderOpen" size={16} className="mr-2" />
                  Выбрать файлы
                </Button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*"
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Загруженные файлы */}
          {Object.keys(uploadedFiles).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Загруженные файлы ({Object.keys(uploadedFiles).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(uploadedFiles).map(([key, file]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon name="FileAudio" size={20} className="text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">{audioKeys[key as keyof typeof audioKeys] || key}</div>
                          <div className="text-xs text-gray-500">
                            {key} • {(file.length / 1024 / 1.37).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const audio = new Audio(file);
                            audio.play();
                          }}
                        >
                          <Icon name="Play" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(key)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Системные звуки */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Необходимые звуки для системы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(audioKeys).map(([key, description]) => (
                  <div 
                    key={key} 
                    className={`p-3 rounded-lg border ${
                      uploadedFiles[key] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{description}</div>
                        <div className="text-xs text-gray-500">{key}</div>
                      </div>
                      {uploadedFiles[key] ? (
                        <Icon name="CheckCircle" size={20} className="text-green-600" />
                      ) : (
                        <Icon name="Circle" size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Загружено: <strong>{Object.keys(uploadedFiles).length}</strong> из <strong>{Object.keys(audioKeys).length}</strong> файлов
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button 
                onClick={handleSave}
                disabled={Object.keys(uploadedFiles).length === 0}
              >
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить озвучку
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};