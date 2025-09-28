import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface VoiceDownloadHelperProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceDownloadHelper: React.FC<VoiceDownloadHelperProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const voiceVariants = [
    {
      title: 'Стандартная озвучка',
      subtitle: 'Вариант 1',
      url: 'https://disk.yandex.ru/d/r1i0nby_m-PmiA',
      color: 'blue',
      description: 'Основная озвучка для повседневного использования'
    },
    {
      title: 'Альтернативная озвучка', 
      subtitle: 'Вариант 2',
      url: 'https://disk.yandex.ru/d/xDFLiDXNSOxPJA',
      color: 'purple',
      description: 'Дополнительная озвучка (другой голос/стиль)'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Download" />
            Помощник загрузки озвучки
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          
          {/* Инструкция */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <Icon name="Info" size={16} />
              Как загрузить озвучки:
            </h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Нажмите кнопку "Скачать с Яндекс.Диска" для нужного варианта</li>
              <li>На открывшейся странице нажмите "Скачать" и выберите формат ZIP</li>
              <li>Распакуйте архив с аудиофайлами на компьютер</li>
              <li>Вернитесь в приложение и выберите соответствующий вариант</li>
              <li>Нажмите "Выбрать аудиофайлы" и загрузите все файлы из папки</li>
            </ol>
          </div>

          {/* Варианты озвучки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voiceVariants.map((variant, index) => (
              <div key={index} className={`border-2 border-${variant.color}-200 bg-${variant.color}-50 rounded-lg p-4`}>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <Icon name={variant.color === 'blue' ? 'Mic' : 'Mic2'} size={20} />
                      {variant.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{variant.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`text-xs font-medium text-${variant.color}-700 uppercase tracking-wide`}>
                      {variant.subtitle}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        className={`flex-1 bg-${variant.color}-500 hover:bg-${variant.color}-600 text-white`}
                        onClick={() => window.open(variant.url, '_blank')}
                      >
                        <Icon name="ExternalLink" size={16} className="mr-2" />
                        Скачать с Яндекс.Диска
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(variant.url, variant.subtitle)}
                        className={copied === variant.subtitle ? 'bg-green-100' : ''}
                      >
                        {copied === variant.subtitle ? (
                          <Icon name="Check" size={16} />
                        ) : (
                          <Icon name="Copy" size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Дополнительные советы */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <Icon name="Lightbulb" size={16} />
              Полезные советы:
            </h4>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li><strong>Имена файлов:</strong> должны содержать номер ячейки (1.mp3, 25.wav, cell_150.m4a)</li>
              <li><strong>Поддерживаемые форматы:</strong> MP3, WAV, M4A, OGG</li>
              <li><strong>Размер файлов:</strong> рекомендуется до 10 МБ на файл для стабильной работы</li>
              <li><strong>Количество:</strong> можно загружать сразу все файлы варианта одновременно</li>
              <li><strong>Активация:</strong> после загрузки нажмите кнопку "Power" для активации варианта</li>
            </ul>
          </div>

          {/* Быстрые действия */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Icon name="Zap" size={16} />
              Быстрые действия:
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  window.open('https://disk.yandex.ru/d/r1i0nby_m-PmiA', '_blank');
                  window.open('https://disk.yandex.ru/d/xDFLiDXNSOxPJA', '_blank');
                }}
                className="flex items-center gap-2"
              >
                <Icon name="Download" size={16} />
                Открыть оба варианта
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  copyToClipboard(`Стандартная: https://disk.yandex.ru/d/r1i0nby_m-PmiA\nАльтернативная: https://disk.yandex.ru/d/xDFLiDXNSOxPJA`, 'both');
                }}
                className="flex items-center gap-2"
              >
                <Icon name="Copy" size={16} />
                {copied === 'both' ? 'Скопировано!' : 'Копировать ссылки'}
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceDownloadHelper;