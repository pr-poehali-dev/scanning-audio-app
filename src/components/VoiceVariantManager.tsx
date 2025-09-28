import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface VoiceVariantManagerProps {
  isOpen?: boolean;
  onClose: () => void;
}

const VoiceVariantManager: React.FC<VoiceVariantManagerProps> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;
  const [selectedVariant, setSelectedVariant] = useState<'standard' | 'alternative'>('standard');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const filesArray = Array.from(files);
    
    console.log(`📁 Загружаем ${filesArray.length} файлов для варианта: ${selectedVariant}`);

    // Получаем или создаем хранилище для выбранного варианта
    const storageKey = `wb-voice-${selectedVariant}-permanent`;
    let audioData: Record<string, string> = {};
    
    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) {
        audioData = JSON.parse(existing);
      }
    } catch (error) {
      console.log('🆕 Создаем новое хранилище для варианта:', selectedVariant);
    }

    let successCount = 0;

    // Обрабатываем каждый файл
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const fileName = file.name;
      
      // Извлекаем номер ячейки из имени файла
      const cellMatch = fileName.match(/(\d+)/);
      if (!cellMatch) {
        console.warn(`⚠️ Не удалось извлечь номер ячейки из файла: ${fileName}`);
        continue;
      }
      
      const cellNumber = cellMatch[1];
      setUploadProgress(prev => ({ ...prev, [cellNumber]: 0 }));

      try {
        // Проверяем тип файла
        if (!file.type.startsWith('audio/')) {
          console.warn(`⚠️ Файл ${fileName} не является аудиофайлом`);
          setUploadProgress(prev => ({ ...prev, [cellNumber]: -1 }));
          continue;
        }

        // Конвертируем в base64
        const base64 = await fileToBase64(file);
        audioData[cellNumber] = base64;
        successCount++;
        
        setUploadProgress(prev => ({ ...prev, [cellNumber]: 100 }));
        console.log(`✅ Файл ${fileName} загружен для ячейки ${cellNumber}`);
        
      } catch (error) {
        console.error(`❌ Ошибка загрузки файла ${fileName}:`, error);
        setUploadProgress(prev => ({ ...prev, [cellNumber]: -1 }));
      }
    }

    // Сохраняем все данные
    localStorage.setItem(storageKey, JSON.stringify(audioData));
    
    // Устанавливаем активный вариант если это первая загрузка или если загружаем в уже активный
    const currentActiveVariant = localStorage.getItem('wb-active-voice-variant');
    if (!currentActiveVariant || currentActiveVariant === selectedVariant) {
      localStorage.setItem('wb-active-voice-variant', selectedVariant);
      console.log(`🎯 Установлен активный вариант: ${selectedVariant}`);
    }

    console.log(`💾 Сохранено ${successCount} файлов для варианта ${selectedVariant}`);
    setIsUploading(false);
    
    // Очищаем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (successCount > 0) {
      alert(`✅ Успешно загружено ${successCount} озвучек для варианта "${selectedVariant}"`);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getVariantInfo = (variant: 'standard' | 'alternative') => {
    const storageKey = `wb-voice-${variant}-permanent`;
    try {
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        const count = Object.keys(parsed).filter(key => /^\d+$/.test(key)).length;
        const cells = Object.keys(parsed).filter(key => /^\d+$/.test(key)).sort((a, b) => parseInt(a) - parseInt(b));
        return { count, exists: count > 0, cells };
      }
    } catch (error) {
      console.log(`Ошибка чтения данных для ${variant}:`, error);
    }
    return { count: 0, exists: false, cells: [] };
  };

  const setActiveVariant = async (variant: 'standard' | 'alternative') => {
    try {
      const { activateVoiceVariant } = await import('@/utils/bulletproofAudio');
      const success = activateVoiceVariant(variant);
      
      if (success) {
        console.log(`🎯 Активный вариант изменен на: ${variant}`);
        alert(`✅ Активный вариант озвучки: ${variant === 'standard' ? 'Стандартная' : 'Альтернативная'}`);
      } else {
        alert(`❌ Ошибка активации варианта "${variant}"`);
      }
    } catch (error) {
      console.error('Ошибка активации варианта:', error);
      alert('❌ Ошибка активации варианта');
    }
  };

  const clearVariant = (variant: 'standard' | 'alternative') => {
    if (confirm(`🗑️ Удалить все озвучки для варианта "${variant === 'standard' ? 'Стандартная' : 'Альтернативная'}"?`)) {
      const storageKey = `wb-voice-${variant}-permanent`;
      localStorage.removeItem(storageKey);
      
      // Если удаляем активный вариант, сбрасываем активность
      const activeVariant = localStorage.getItem('wb-active-voice-variant');
      if (activeVariant === variant) {
        localStorage.removeItem('wb-active-voice-variant');
      }
      
      alert(`🧹 Вариант "${variant === 'standard' ? 'Стандартная' : 'Альтернативная'}" очищен`);
    }
  };

  const testVariant = async (variant: 'standard' | 'alternative') => {
    const info = getVariantInfo(variant);
    if (info.cells.length === 0) {
      alert('❌ Нет загруженных ячеек для тестирования');
      return;
    }

    const testCell = info.cells[0];
    try {
      // Сохраняем оригинальный активный вариант
      const originalActive = localStorage.getItem('wb-active-voice-variant');
      
      // Активируем тестируемый вариант через bulletproof систему
      const { activateVoiceVariant, playCellAudio } = await import('@/utils/bulletproofAudio');
      
      console.log(`🧪 Тестируем вариант ${variant} с ячейкой ${testCell}`);
      const activated = activateVoiceVariant(variant);
      
      if (!activated) {
        alert(`❌ Не удалось активировать вариант "${variant}"`);
        return;
      }
      
      // Тестируем воспроизведение
      const success = await playCellAudio(testCell);
      
      // Восстанавливаем оригинальный активный вариант
      if (originalActive) {
        activateVoiceVariant(originalActive);
      } else {
        localStorage.removeItem('wb-active-voice-variant');
      }
      
      if (success) {
        alert(`✅ Тест варианта "${variant}" успешен! Ячейка ${testCell} воспроизведена.`);
      } else {
        alert(`❌ Ошибка воспроизведения ячейки ${testCell} для варианта "${variant}"`);
      }
    } catch (error) {
      console.error('Ошибка тестирования:', error);
      alert('❌ Ошибка тестирования озвучки');
    }
  };

  const standardInfo = getVariantInfo('standard');
  const alternativeInfo = getVariantInfo('alternative');
  const activeVariant = localStorage.getItem('wb-active-voice-variant');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Volume2" />
            Управление вариантами озвучки
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          
          {/* Информация о вариантах */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Стандартная озвучка */}
            <div className={`border-2 rounded-lg p-4 transition-all ${
              selectedVariant === 'standard' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <Icon name="Mic" size={20} />
                  Стандартная
                </h3>
                {activeVariant === 'standard' && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                    АКТИВНА
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                {standardInfo.exists ? (
                  <div className="text-sm">
                    <div className="text-green-600 font-medium mb-2">
                      <Icon name="CheckCircle" size={16} className="inline mr-1" />
                      {standardInfo.count} файлов загружено
                    </div>
                    <div className="text-gray-600">
                      Ячейки: {standardInfo.cells.slice(0, 10).join(', ')}
                      {standardInfo.count > 10 && '...'}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">Не загружена</div>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={selectedVariant === 'standard' ? 'default' : 'outline'}
                    onClick={() => setSelectedVariant('standard')}
                    className="flex-1"
                  >
                    Выбрать
                  </Button>
                  {standardInfo.exists && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testVariant('standard')}
                        className="text-blue-600"
                      >
                        <Icon name="Play" size={16} />
                      </Button>
                      {activeVariant !== 'standard' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveVariant('standard')}
                          className="text-green-600"
                        >
                          <Icon name="Power" size={16} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => clearVariant('standard')}
                        className="text-red-600"
                      >
                        <Icon name="Trash" size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Альтернативная озвучка */}
            <div className={`border-2 rounded-lg p-4 transition-all ${
              selectedVariant === 'alternative' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <Icon name="Mic2" size={20} />
                  Альтернативная
                </h3>
                {activeVariant === 'alternative' && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                    АКТИВНА
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                {alternativeInfo.exists ? (
                  <div className="text-sm">
                    <div className="text-green-600 font-medium mb-2">
                      <Icon name="CheckCircle" size={16} className="inline mr-1" />
                      {alternativeInfo.count} файлов загружено
                    </div>
                    <div className="text-gray-600">
                      Ячейки: {alternativeInfo.cells.slice(0, 10).join(', ')}
                      {alternativeInfo.count > 10 && '...'}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">Не загружена</div>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={selectedVariant === 'alternative' ? 'default' : 'outline'}
                    onClick={() => setSelectedVariant('alternative')}
                    className="flex-1"
                  >
                    Выбрать
                  </Button>
                  {alternativeInfo.exists && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testVariant('alternative')}
                        className="text-purple-600"
                      >
                        <Icon name="Play" size={16} />
                      </Button>
                      {activeVariant !== 'alternative' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveVariant('alternative')}
                          className="text-green-600"
                        >
                          <Icon name="Power" size={16} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => clearVariant('alternative')}
                        className="text-red-600"
                      >
                        <Icon name="Trash" size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Загрузка файлов */}
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
                onChange={handleFileSelect}
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

          {/* Инструкции */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <Icon name="Info" size={16} />
              Инструкции по загрузке:
            </h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Имена файлов:</strong> должны содержать номер ячейки (1.mp3, cell_25.wav, audio-150.m4a)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Форматы:</strong> MP3, WAV, M4A, OGG и другие аудиоформаты</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Множественная загрузка:</strong> можно выбрать сразу много файлов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Стандартная:</strong> основная озвучка для повседневного использования</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>Альтернативная:</strong> дополнительная озвучка (другой голос, язык, стиль)</span>
              </li>
            </ul>
          </div>

          {/* Статистика */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              Текущее состояние:
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-green-700">
                  <strong>Стандартная:</strong> {standardInfo.count} файлов
                  {activeVariant === 'standard' && ' (активна)'}
                </div>
              </div>
              <div>
                <div className="text-green-700">
                  <strong>Альтернативная:</strong> {alternativeInfo.count} файлов
                  {activeVariant === 'alternative' && ' (активна)'}
                </div>
              </div>
            </div>
            
            {!activeVariant && (
              <div className="mt-2 text-orange-600 text-sm">
                ⚠️ Нет активного варианта озвучки
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceVariantManager;