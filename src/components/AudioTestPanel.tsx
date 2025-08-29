import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AudioTestPanelProps {
  playAudio: (audioName: string) => void;
  customAudioFiles: Record<string, string>;
  isVisible?: boolean;
  onToggle?: () => void;
}

const AudioTestPanel = ({ 
  playAudio, 
  customAudioFiles, 
  isVisible = false, 
  onToggle 
}: AudioTestPanelProps) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string>('');

  // Тестовые аудио для каждой категории
  const testCategories = {
    'delivery': {
      title: '📦 Выдача',
      color: 'bg-blue-50 border-blue-200',
      audios: [
        'delivery-Спасибо за заказ! Оцените пункт выдачи!',
        'Спасибо за заказ! Оцените пункт выдачи!',
        'delivery-Верните на ячейку',
        'Верните на ячейку',
        'discount',
        'Товары со со скидкой проверьте ВБ кошелек',
        '123', '67', '234', '345', '156', '42', '101', '482'
      ]
    },
    'acceptance': {
      title: '📥 Приемка',
      color: 'bg-green-50 border-green-200',
      audios: [
        'acceptance-Принято в ПВЗ',
        'Принято в ПВЗ',
        'acceptance-Ошибка приемки',
        'Ошибка приемки',
        'acceptance-scan-success',
        'acceptance-товар найден',
        'acceptance-Товар поврежден',
        'acceptance-Товар отсканирован'
      ]
    },
    'returns': {
      title: '↩️ Возврат',
      color: 'bg-orange-50 border-orange-200',
      audios: [
        'returns-Возврат оформлен',
        'Возврат оформлен',
        'returns-Ошибка возврата',
        'Ошибка возврата',
        'returns-scan-success',
        'returns-товар найден',
        'returns-Сумма возврата рассчитана',
        'returns-Укажите номер телефона'
      ]
    },
    'general': {
      title: '🔊 Общие',
      color: 'bg-gray-50 border-gray-200',
      audios: [
        'general-Общий сигнал',
        'Общий сигнал',
        'general-Ошибка системы',
        'scan-start',
        'scan-success',
        'error',
        'phone-required'
      ]
    }
  };

  const handlePlayAudio = async (audioName: string) => {
    setCurrentlyPlaying(audioName);
    console.log(`🧪 ТЕСТ АУДИО: Пытаемся воспроизвести "${audioName}"`);
    
    try {
      if (customAudioFiles[audioName]) {
        await playAudio(audioName);
        console.log(`✅ ТЕСТ: Успешно воспроизвели "${audioName}"`);
      } else {
        console.log(`❌ ТЕСТ: Аудиофайл "${audioName}" не найден`);
        console.log('📁 Доступные файлы:', Object.keys(customAudioFiles));
      }
    } catch (error) {
      console.log(`❌ ТЕСТ: Ошибка при воспроизведении "${audioName}":`, error);
    } finally {
      setTimeout(() => setCurrentlyPlaying(''), 2000);
    }
  };

  const playSequentialTest = async (category: keyof typeof testCategories) => {
    const audios = testCategories[category].audios;
    console.log(`🎵 ТЕСТ: Запуск последовательного тестирования категории "${category}"`);
    
    for (const audioName of audios) {
      if (customAudioFiles[audioName]) {
        console.log(`🔊 ТЕСТ: Воспроизводим "${audioName}"`);
        setCurrentlyPlaying(audioName);
        await handlePlayAudio(audioName);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    setCurrentlyPlaying('');
    console.log(`✅ ТЕСТ: Завершен тест категории "${category}"`);
  };

  const getAudioStats = () => {
    const totalPossible = Object.values(testCategories).reduce((sum, cat) => sum + cat.audios.length, 0);
    const totalAvailable = Object.values(testCategories).reduce((sum, cat) => 
      sum + cat.audios.filter(audio => customAudioFiles[audio]).length, 0
    );
    
    return { totalPossible, totalAvailable };
  };

  const { totalPossible, totalAvailable } = getAudioStats();

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg"
        >
          <Icon name="Volume2" size={16} className="mr-2" />
          Тест аудио
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Volume2" size={24} />
            Тестирование озвучки ПВЗ
          </CardTitle>
          <Button onClick={onToggle} size="sm" variant="outline">
            <Icon name="X" size={16} />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto">
          {/* Общая статистика */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Статистика загруженных аудиофайлов:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                totalAvailable > totalPossible / 2 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {totalAvailable} / {totalPossible}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {totalAvailable === 0 
                ? '⚠️ Аудиофайлы не загружены. Загрузите файлы в настройках для каждой вкладки.'
                : `✅ Загружено ${Math.round(totalAvailable / totalPossible * 100)}% аудиофайлов`
              }
            </div>
          </div>

          {/* Тесты по категориям */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(testCategories).map(([key, category]) => (
              <Card key={key} className={`${category.color}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{category.title}</span>
                    <Button
                      onClick={() => playSequentialTest(key as keyof typeof testCategories)}
                      size="sm"
                      variant="outline"
                      disabled={currentlyPlaying !== ''}
                    >
                      <Icon name="Play" size={14} className="mr-1" />
                      Тест всех
                    </Button>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {category.audios.map((audioName, index) => {
                      const isAvailable = customAudioFiles[audioName];
                      const isPlaying = currentlyPlaying === audioName;
                      
                      return (
                        <Button
                          key={index}
                          onClick={() => handlePlayAudio(audioName)}
                          variant={isAvailable ? "default" : "secondary"}
                          size="sm"
                          disabled={!isAvailable || (currentlyPlaying !== '' && !isPlaying)}
                          className={`justify-start text-left h-auto py-2 px-3 ${
                            isPlaying ? 'bg-blue-500 text-white animate-pulse' : ''
                          } ${
                            !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Icon 
                              name={isAvailable ? (isPlaying ? "Volume2" : "Play") : "VolumeX"} 
                              size={14} 
                            />
                            <span className="flex-1 truncate text-xs">
                              {audioName}
                            </span>
                            {isAvailable && (
                              <span className="text-xs bg-green-100 text-green-700 px-1 rounded">✓</span>
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Инструкция */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">📋 Инструкция по тестированию:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Зеленые кнопки</strong> - аудиофайлы загружены и готовы к воспроизведению</li>
              <li>• <strong>Серые кнопки</strong> - аудиофайлы не найдены, нужно загрузить в настройках</li>
              <li>• <strong>"Тест всех"</strong> - воспроизводит все доступные файлы категории по очереди</li>
              <li>• Загружайте аудиофайлы через <strong>Настройки → Озвучка</strong> для каждой вкладки</li>
              <li>• Названия файлов должны точно совпадать с указанными в кнопках</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioTestPanel;