import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AudioUploaderProps {
  onAudioFilesUpdate: (files: { [key: string]: string }) => Promise<void>;
  onClose: () => void;
  removeAudioFile: (key: string) => void;
  clearAllAudio: () => void;
  existingFiles: { [key: string]: string };
}

interface AudioStage {
  key: string;
  name: string;
  description: string;
  category: 'delivery' | 'receiving' | 'returns' | 'general';
}

export const AudioUploader = ({ 
  onAudioFilesUpdate, 
  onClose, 
  removeAudioFile,
  clearAllAudio,
  existingFiles 
}: AudioUploaderProps) => {
  
  // Определяем все этапы озвучки
  const audioStages: AudioStage[] = [
    // ВЫДАЧА
    { key: 'check-discount-wallet', name: '💰 Скидки и кошелек', description: 'Проверьте ВБ кошелек, товары со скидкой', category: 'delivery' },
    { key: 'check-product-camera', name: '📷 Проверка товара', description: 'Проверьте товар под камерой', category: 'delivery' },
    { key: 'rate-pickup-point', name: '⭐ Оценка ПВЗ', description: 'Оцените пункт выдачи', category: 'delivery' },
    
    // ПРИЕМКА - РАСШИРЕННЫЙ СПИСОК
    { key: 'acceptance-Товар отсканирован', name: '📱 Товар отсканирован', description: 'Озвучка при успешном сканировании товара', category: 'receiving' },
    { key: 'acceptance-Принято в ПВЗ', name: '✅ Товар принят', description: 'Подтверждение принятия товара', category: 'receiving' },
    { key: 'acceptance-Товар поврежден', name: '⚠️ Товар поврежден', description: 'Уведомление о повреждении товара', category: 'receiving' },
    { key: 'acceptance-Ошибка приемки', name: '❌ Ошибка приемки', description: 'Сообщение об ошибке в процессе приемки', category: 'receiving' },
    { key: 'acceptance-Размещение товара', name: '📦 Размещение товара', description: 'Инструкция по размещению товара', category: 'receiving' },
    { key: 'acceptance-Приемка завершена', name: '🎉 Приемка завершена', description: 'Подтверждение завершения приемки', category: 'receiving' },
    { key: 'acceptance-scan-success', name: '🔍 Сканирование успешно', description: 'Подтверждение успешного сканирования', category: 'receiving' },
    { key: 'acceptance-товар найден', name: '🎯 Товар найден', description: 'Подтверждение нахождения товара в системе', category: 'receiving' },
    
    // ВОЗВРАТЫ
    { key: 'return-start', name: '↩️ Начало возврата', description: 'Начинаем процедуру возврата', category: 'returns' },
    { key: 'return-complete', name: '✅ Возврат завершен', description: 'Возврат успешно завершен', category: 'returns' },
  ];

  const [loadedFiles, setLoadedFiles] = useState<Set<string>>(new Set());
  const [cellAudioFile, setCellAudioFile] = useState<File | null>(null);
  const [cellAudioCount, setCellAudioCount] = useState(0);

  useEffect(() => {
    // Обновляем состояние загруженных файлов
    setLoadedFiles(new Set(Object.keys(existingFiles)));
    
    // Проверяем количество загруженных ячеек
    const cellAudios = JSON.parse(localStorage.getItem('cellAudios') || '{}');
    setCellAudioCount(Object.keys(cellAudios).length);
  }, [existingFiles]);

  const handleFileUpload = async (key: string, file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('❌ Выберите аудиофайл (mp3, wav, ogg, m4a)');
      return;
    }

    try {
      // Конвертируем в base64 для постоянного сохранения
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('🔄 === КРИТИЧЕСКАЯ ОТЛАДКА ЗАГРУЗКИ ===');
      console.log(`📁 Загружаю файл: ${key}`);
      console.log(`📊 Размер base64: ${(base64.length / 1024).toFixed(2)} КБ`);
      console.log(`🎯 Ключ для сохранения: "${key}"`);
      
      // КРИТИЧНО: Обновляем файлы с детальным логированием
      try {
        await onAudioFilesUpdate({ [key]: base64 });
        console.log(`✅ onAudioFilesUpdate УСПЕШНО для ${key}`);
      } catch (updateError) {
        console.error(`❌ ОШИБКА onAudioFilesUpdate для ${key}:`, updateError);
        throw updateError;
      }
      
      setLoadedFiles(prev => new Set([...prev, key]));
      
      // ПРОВЕРЯЕМ ЧТО РЕАЛЬНО СОХРАНИЛОСЬ
      setTimeout(() => {
        const savedCheck = localStorage.getItem('wb-audio-files');
        if (savedCheck) {
          const parsed = JSON.parse(savedCheck);
          const hasKey = parsed[key];
          console.log(`🔍 ПРОВЕРКА СОХРАНЕНИЯ ${key}: ${hasKey ? '✅ НАЙДЕН' : '❌ НЕ НАЙДЕН'}`);
          console.log(`📊 Всего в localStorage: ${Object.keys(parsed).length} файлов`);
        } else {
          console.error('❌ КРИТИЧНО: localStorage пуст!');
        }
      }, 100);
      
      console.log(`✅ Файл "${key}" успешно загружен и сохранен`);
      alert(`✅ Аудио загружено и АВТОСОХРАНЕНО!\n"${audioStages.find(s => s.key === key)?.name}"`);
      
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      alert('❌ Ошибка загрузки файла');
    }
  };

  const handleCellAudioUpload = async () => {
    if (!cellAudioFile) return;

    if (!cellAudioFile.type.startsWith('audio/')) {
      alert('❌ Выберите аудиофайл для озвучки номеров ячеек');
      return;
    }

    try {
      // Конвертируем в base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(cellAudioFile);
      });

      console.log('🏠 === КРИТИЧЕСКАЯ ОТЛАДКА ЯЧЕЕК ===');
      console.log(`📁 Загружаю общую озвучку ячеек`);
      console.log(`📊 Размер base64: ${(base64.length / 1024).toFixed(2)} КБ`);
      
      // КРИТИЧНО: Сохраняем как общий файл для всех ячеек
      try {
        await onAudioFilesUpdate({ 'cell-number': base64 });
        console.log('✅ onAudioFilesUpdate УСПЕШНО для cell-number');
      } catch (updateError) {
        console.error('❌ ОШИБКА onAudioFilesUpdate для cell-number:', updateError);
        throw updateError;
      }
      
      // Также сохраняем отдельно для резерва
      const cellData = { 'general': base64 };
      localStorage.setItem('cellAudios', JSON.stringify(cellData));
      console.log('💾 Дополнительно сохранено в cellAudios');
      
      setCellAudioCount(1);
      setCellAudioFile(null);
      
      // ПРОВЕРЯЕМ ЧТО РЕАЛЬНО СОХРАНИЛОСЬ
      setTimeout(() => {
        const savedCheck = localStorage.getItem('wb-audio-files');
        if (savedCheck) {
          const parsed = JSON.parse(savedCheck);
          const hasCellNumber = parsed['cell-number'];
          console.log(`🔍 ПРОВЕРКА СОХРАНЕНИЯ cell-number: ${hasCellNumber ? '✅ НАЙДЕН' : '❌ НЕ НАЙДЕН'}`);
        }
        
        const cellCheck = localStorage.getItem('cellAudios');
        console.log(`🔍 ПРОВЕРКА cellAudios: ${cellCheck ? '✅ НАЙДЕН' : '❌ НЕ НАЙДЕН'}`);
      }, 100);
      
      console.log('✅ Общая озвучка ячеек загружена и АВТОСОХРАНЕНА');
      alert('✅ Озвучка номеров ячеек АВТОСОХРАНЕНА!\nБудет использоваться для всех ячеек');
      
    } catch (error) {
      console.error('Ошибка загрузки озвучки ячеек:', error);
      alert('❌ Ошибка загрузки озвучки ячеек');
    }
  };

  const handleRemoveFile = (key: string) => {
    removeAudioFile(key);
    setLoadedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  };

  const handlePlayFile = (key: string) => {
    const file = existingFiles[key];
    if (file) {
      try {
        const audio = new Audio(file);
        audio.volume = 0.8;
        audio.play();
      } catch (error) {
        alert('❌ Ошибка воспроизведения');
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('🗑️ Удалить ВСЮ озвучку?\n\n- Все файлы этапов\n- Озвучка ячеек\n- Все настройки')) {
      clearAllAudio();
      localStorage.removeItem('cellAudios');
      setLoadedFiles(new Set());
      setCellAudioCount(0);
      alert('🧹 Вся озвучка удалена');
    }
  };

  const getCategoryName = (category: string) => {
    const names = {
      'delivery': '📤 ВЫДАЧА',
      'receiving': '📥 ПРИЕМКА', 
      'returns': '↩️ ВОЗВРАТЫ',
      'general': '⚙️ ОБЩЕЕ'
    };
    return names[category] || category;
  };

  const groupedStages = audioStages.reduce((acc, stage) => {
    if (!acc[stage.category]) acc[stage.category] = [];
    acc[stage.category].push(stage);
    return acc;
  }, {} as Record<string, AudioStage[]>);

  const totalLoaded = loadedFiles.size + cellAudioCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Volume2" />
            Настройка озвучки ({totalLoaded} файлов)
          </CardTitle>
          <div className="flex gap-2">
            {totalLoaded > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearAll} className="text-red-600">
                <Icon name="Trash" className="w-4 h-4 mr-1" />
                Очистить всё
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          
          {/* ОЗВУЧКА ЯЧЕЕК */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-blue-800 flex items-center gap-2">
                  <Icon name="Hash" />
                  📱 Озвучка номеров ячеек
                </h3>
                <p className="text-blue-600 text-sm mt-1">
                  Один файл для озвучки всех номеров ячеек (будет использоваться системный синтез речи)
                </p>
              </div>
              {cellAudioCount > 0 && (
                <div className="text-blue-600 font-medium">
                  ✅ Загружено
                </div>
              )}
            </div>
            
            <div className="flex gap-3 items-center">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setCellAudioFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Button 
                onClick={handleCellAudioUpload}
                disabled={!cellAudioFile}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {cellAudioCount > 0 ? 'Заменить' : 'Загрузить'}
              </Button>
              {cellAudioCount > 0 && (
                <Button
                  variant="outline"
                  size="sm" 
                  onClick={() => handlePlayFile('cell-number')}
                >
                  <Icon name="Play" className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* ЭТАПЫ ПО КАТЕГОРИЯМ */}
          {Object.entries(groupedStages).map(([category, stages]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                {getCategoryName(category)}
              </h3>
              
              <div className="grid gap-4">
                {stages.map((stage) => {
                  const isLoaded = loadedFiles.has(stage.key);
                  
                  return (
                    <div key={stage.key} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isLoaded ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div>
                              <h4 className="font-medium text-gray-800">{stage.name}</h4>
                              <p className="text-sm text-gray-600">{stage.description}</p>
                              <p className="text-xs text-gray-500 mt-1">Ключ: {stage.key}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 items-center">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(stage.key, file);
                            }}
                            className="w-40 text-xs"
                          />
                          
                          {isLoaded && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePlayFile(stage.key)}
                              >
                                <Icon name="Play" className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveFile(stage.key)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Icon name="Trash" className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ИНФОРМАЦИЯ */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">💾 Автоматическое сохранение</h4>
            <div className="text-green-700 text-sm space-y-1">
              <p>✅ Все файлы конвертируются в base64 и сохраняются постоянно в браузере</p>
              <p>✅ Работают после перезагрузки страницы и закрытия браузера</p>
              <p>✅ Загруженные файлы: {totalLoaded} из {audioStages.length + 1}</p>
            </div>
          </div>

          {/* ТЕСТ ОЗВУЧКИ */}
          {totalLoaded > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <Button 
                  onClick={async () => {
                    // Тест любого загруженного файла
                    const testKeys = Array.from(loadedFiles);
                    if (testKeys.length > 0) {
                      handlePlayFile(testKeys[0]);
                      alert(`🔊 Тестируется: ${audioStages.find(s => s.key === testKeys[0])?.name}`);
                    }
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Icon name="Play" className="w-4 h-4 mr-2" />
                  🧪 Тест озвучки
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};