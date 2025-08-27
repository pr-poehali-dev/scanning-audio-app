import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceControlProps {
  onCommand: (command: string) => void;
  isVisible?: boolean;
}

export const VoiceControl = ({ onCommand, isVisible = true }: VoiceControlProps) => {
  const [lastCommand, setLastCommand] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const handleCommand = (command: string) => {
    setLastCommand(command);
    setCommandHistory(prev => [command, ...prev.slice(0, 4)]);
    onCommand(command);
  };

  const handleTranscript = (transcript: string) => {
    // Обновляем отображение распознанного текста в реальном времени
  };

  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    toggleListening
  } = useSpeechRecognition({
    onCommand: handleCommand,
    onTranscript: handleTranscript,
    language: 'ru-RU'
  });

  if (!isVisible) return null;

  if (!isSupported) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-700">
            <Icon name="AlertCircle" className="w-5 h-5" />
            <span className="text-sm">Распознавание речи не поддерживается в этом браузере</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Заголовок */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Icon name="Mic" className="w-4 h-4" />
              Голосовое управление
            </h3>
            <Badge variant={isListening ? "default" : "secondary"}>
              {isListening ? 'Слушаю' : 'Остановлено'}
            </Badge>
          </div>

          {/* Кнопка управления */}
          <Button
            onClick={toggleListening}
            className={`w-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            <Icon 
              name={isListening ? "MicOff" : "Mic"} 
              className="w-4 h-4 mr-2" 
            />
            {isListening ? 'Остановить' : 'Начать слушать'}
          </Button>

          {/* Текущий распознанный текст */}
          {isListening && (
            <div className="bg-gray-50 rounded-lg p-3 min-h-[2.5rem]">
              <div className="text-xs text-gray-500 mb-1">Распознанный текст:</div>
              <div className="text-sm">
                {transcript || (
                  <span className="text-gray-400 italic">
                    {isListening ? 'Слушаю...' : 'Нет текста'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Последняя команда */}
          {lastCommand && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-green-600 mb-1">Последняя команда:</div>
              <div className="text-sm font-medium text-green-700">{lastCommand}</div>
            </div>
          )}

          {/* История команд */}
          {commandHistory.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">История команд:</div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {commandHistory.map((cmd, index) => (
                  <div key={index} className="text-xs bg-gray-100 rounded px-2 py-1">
                    {cmd}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Подсказки команд */}
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
              Доступные команды
            </summary>
            <div className="mt-2 space-y-1 text-gray-600">
              <div><strong>Навигация:</strong> выдача, приемка, возврат, настройки</div>
              <div><strong>Действия:</strong> сканировать, на примерку, выдать, принять</div>
              <div><strong>Управление:</strong> далее, назад, подтвердить, отмена</div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};