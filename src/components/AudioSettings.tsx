import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useAudio } from '@/hooks/useAudio';

interface AudioFiles {
  delivery: File[];
  receiving: File[];
  return: File[];
  cells: File[];
}

interface AudioSettingsProps {
  onClose: () => void;
  onAudioFilesUpdate: (files: AudioFiles) => void;
  existingFiles: AudioFiles;
}

export const AudioSettings = ({ onClose, onAudioFilesUpdate, existingFiles }: AudioSettingsProps) => {
  const [audioFiles, setAudioFiles] = useState<AudioFiles>(existingFiles);
  const [uploading, setUploading] = useState<string | null>(null);
  const { updateAudioFiles } = useAudio();

  const deliveryRef = useRef<HTMLInputElement>(null);
  const receivingRef = useRef<HTMLInputElement>(null);
  const returnRef = useRef<HTMLInputElement>(null);
  const cellsRef = useRef<HTMLInputElement>(null);

  const handleFolderUpload = async (
    type: keyof AudioFiles,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(type);
    
    // Фильтруем только аудио файлы
    const audioFileArray = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || 
      /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name)
    );

    if (audioFileArray.length === 0) {
      alert('В папке не найдено аудио файлов! Поддерживаются: MP3, WAV, OGG, M4A, AAC, FLAC');
      setUploading(null);
      return;
    }

    // Обновляем состояние
    const updatedFiles = {
      ...audioFiles,
      [type]: audioFileArray
    };
    
    setAudioFiles(updatedFiles);
    setUploading(null);
  };

  const clearSection = (type: keyof AudioFiles) => {
    const updatedFiles = {
      ...audioFiles,
      [type]: []
    };
    setAudioFiles(updatedFiles);
  };

  const handleSave = async () => {
    // Конвертируем File objects в URL для системы
    const convertedFiles: {[key: string]: string} = {};
    const cellFiles: {[key: string]: string} = {};
    let totalConverted = 0;
    
    // Обрабатываем все типы файлов
    for (const [type, files] of Object.entries(audioFiles)) {
      for (const file of files) {
        const baseFileName = file.name.replace(/\.[^/.]+$/, '');
        const audioUrl = URL.createObjectURL(file);
        
        // Сохраняем с префиксом типа
        const prefixedFileName = `${type}-${baseFileName}`;
        convertedFiles[prefixedFileName] = audioUrl;
        
        // ТАКЖЕ сохраняем БЕЗ префикса для глобального доступа
        convertedFiles[baseFileName] = audioUrl;
        
        // 🔒 Специальная обработка файлов для защищенного сохранения
        if (type === 'cells' || type === 'receiving' || type === 'delivery' || 
            /^\d+$/.test(baseFileName) || baseFileName.includes('cell-') || baseFileName.includes('ячейка') ||
            baseFileName.includes('коробка') || baseFileName.includes('товар') || baseFileName.includes('приемка')) {
          cellFiles[baseFileName] = audioUrl;
          cellFiles[prefixedFileName] = audioUrl;
          console.log(`🏠 Защищенный файл сохранен: ${baseFileName} (тип: ${type})`);
        }
        
        totalConverted++;
      }
    }
    
    // 🔒 ЗАЩИЩЕННОЕ СОХРАНЕНИЕ НАСТРОЕК ЯЧЕЕК И ПРИЕМКИ
    if (Object.keys(cellFiles).length > 0) {
      try {
        localStorage.setItem('wb-pvz-cell-audio-settings-permanent', JSON.stringify(cellFiles));
        localStorage.setItem('wb-pvz-cell-audio-lock', 'LOCKED');
        localStorage.setItem('wb-pvz-cell-audio-timestamp', new Date().toISOString());
        console.log(`🔒 ЗАЩИЩЕННОЕ СОХРАНЕНИЕ: ${Object.keys(cellFiles).length} файлов сохранены навсегда`);
        console.log('🔒 Защищенные файлы:', Object.keys(cellFiles));
      } catch (error) {
        console.error('❌ Ошибка защищенного сохранения:', error);
      }
    } else {
      console.log('⚠️ Нет файлов для защищенного сохранения');
    }
    
    if (totalConverted > 0) {
      // Сохраняем через useAudio (конвертирует в base64)
      await updateAudioFiles(convertedFiles);
      console.log(`✅ Сохранено ${totalConverted} аудиофайлов через useAudio`);
    }
    
    onAudioFilesUpdate(audioFiles);
    onClose();
  };

  const getTotalFiles = () => {
    return audioFiles.delivery.length + audioFiles.receiving.length + 
           audioFiles.return.length + audioFiles.cells.length;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Settings" size={24} className="text-blue-600" />
              <h2 className="text-xl font-semibold">Настройки озвучки</h2>
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
          <p className="text-gray-600 mt-2">
            Загрузите папки с аудиофайлами для автоматической озвучки процессов
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Процессы (Выдача/Приемка/Возврат) */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <Icon name="Play" size={20} className="text-green-600" />
              Озвучка процессов
            </h3>

            {/* Выдача */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Package" size={18} className="text-blue-600" />
                  <span className="font-medium">Выдача товаров</span>
                  <Badge variant="secondary">{audioFiles.delivery.length} файлов</Badge>
                </div>
                {audioFiles.delivery.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSection('delivery')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
              </div>
              
              <input
                ref={deliveryRef}
                type="file"
                multiple
                webkitdirectory="true"
                directory=""
                accept="audio/*"
                onChange={(e) => handleFolderUpload('delivery', e)}
                className="hidden"
              />
              
              <Button
                variant="outline"
                onClick={() => deliveryRef.current?.click()}
                disabled={uploading === 'delivery'}
                className="w-full"
              >
                {uploading === 'delivery' ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="FolderOpen" size={16} className="mr-2" />
                    Выбрать папку для выдачи
                  </>
                )}
              </Button>
            </div>

            {/* Приемка */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="PackageCheck" size={18} className="text-green-600" />
                  <span className="font-medium">Приемка товаров</span>
                  <Badge variant="secondary">{audioFiles.receiving.length} файлов</Badge>
                </div>
                {audioFiles.receiving.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSection('receiving')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
              </div>
              
              <input
                ref={receivingRef}
                type="file"
                multiple
                webkitdirectory="true"
                directory=""
                accept="audio/*"
                onChange={(e) => handleFolderUpload('receiving', e)}
                className="hidden"
              />
              
              <Button
                variant="outline"
                onClick={() => receivingRef.current?.click()}
                disabled={uploading === 'receiving'}
                className="w-full"
              >
                {uploading === 'receiving' ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="FolderOpen" size={16} className="mr-2" />
                    Выбрать папку для приемки
                  </>
                )}
              </Button>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium mb-2">💡 Рекомендуемые файлы для приемки:</p>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><strong>Действия:</strong> "коробка-принята.mp3", "отсканируйте-еще-раз.mp3", "продолжайте-приемку.mp3"</div>
                  <div><strong>Статусы:</strong> "товар-для-пвз.mp3", "отсканируйте-следующий-товар.mp3", "приоритетный-заказ.mp3"</div>
                  <div><strong>Проверки:</strong> "повтор-товар-уже-принят.mp3", "коробка-отсканирована.mp3"</div>
                  <div><strong>Ячейки:</strong> "1.mp3", "2.mp3", "3.mp3" ... "482.mp3" (номера ячеек)</div>
                </div>
              </div>
            </div>

            {/* Возврат */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Undo2" size={18} className="text-orange-600" />
                  <span className="font-medium">Возврат товаров</span>
                  <Badge variant="secondary">{audioFiles.return.length} файлов</Badge>
                </div>
                {audioFiles.return.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSection('return')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
              </div>
              
              <input
                ref={returnRef}
                type="file"
                multiple
                webkitdirectory="true"
                directory=""
                accept="audio/*"
                onChange={(e) => handleFolderUpload('return', e)}
                className="hidden"
              />
              
              <Button
                variant="outline"
                onClick={() => returnRef.current?.click()}
                disabled={uploading === 'return'}
                className="w-full"
              >
                {uploading === 'return' ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="FolderOpen" size={16} className="mr-2" />
                    Выбрать папку для возврата
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Ячейки */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <Icon name="Grid3X3" size={20} className="text-purple-600" />
              Озвучка ячеек
            </h3>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="MapPin" size={18} className="text-purple-600" />
                  <span className="font-medium">Номера ячеек</span>
                  <Badge variant="secondary">{audioFiles.cells.length} файлов</Badge>
                </div>
                {audioFiles.cells.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSection('cells')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
              </div>
              
              <input
                ref={cellsRef}
                type="file"
                multiple
                webkitdirectory="true"
                directory=""
                accept="audio/*"
                onChange={(e) => handleFolderUpload('cells', e)}
                className="hidden"
              />
              
              <Button
                variant="outline"
                onClick={() => cellsRef.current?.click()}
                disabled={uploading === 'cells'}
                className="w-full"
              >
                {uploading === 'cells' ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="FolderOpen" size={16} className="mr-2" />
                    Выбрать папку с номерами ячеек
                  </>
                )}
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Как работает озвучка ячеек:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Назовите файлы по номеру ячейки: <code>A1.mp3</code>, <code>B15.wav</code></li>
                    <li>• При показе товара в ячейке A1 проиграется файл A1.mp3</li>
                    <li>• Поддерживаются форматы: MP3, WAV, OGG, M4A, AAC, FLAC</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="FileAudio" size={16} />
              <span>Всего загружено: <strong>{getTotalFiles()} файлов</strong></span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button onClick={handleSave}>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить настройки
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};