import React, { useState } from 'react';
import Icon from '@/components/ui/icon';
import { voiceAssistantManager } from '@/utils/voiceAssistantManager';

interface VoiceTestUploadProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const VoiceTestUpload: React.FC<VoiceTestUploadProps> = ({ 
  isOpen = false, 
  onClose 
}) => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult('');

    try {
      console.log('🧪 [TEST] Тестовая загрузка файла:', file);
      
      // Пробуем загрузить как error_sound
      const success = await voiceAssistantManager.saveNewSound('error_sound', file);
      
      if (success) {
        setResult(`✅ Файл "${file.name}" успешно загружен как error_sound!`);
        
        // Проверяем, что файл действительно сохранился
        const hasSound = voiceAssistantManager.hasSound('error_sound');
        const loadedSounds = voiceAssistantManager.getLoadedSounds();
        
        console.log('🔍 [TEST] Проверка после загрузки:');
        console.log('- hasSound:', hasSound);
        console.log('- loadedSounds:', loadedSounds);
        
        if (hasSound) {
          setResult(prev => prev + '\n✅ Звук найден в хранилище');
        } else {
          setResult(prev => prev + '\n❌ Звук НЕ найден в хранилище');
        }
      } else {
        setResult(`❌ Ошибка загрузки файла "${file.name}"`);
      }
    } catch (error) {
      console.error('❌ [TEST] Ошибка тестовой загрузки:', error);
      setResult(`❌ Ошибка: ${error.message}`);
    } finally {
      setUploading(false);
      // Очищаем input
      e.target.value = '';
    }
  };

  const handleTestPlay = async () => {
    try {
      console.log('🔊 [TEST] Тестируем воспроизведение error_sound...');
      const success = await voiceAssistantManager.playNewAssistantSound('error_sound');
      
      if (success) {
        setResult(prev => prev + '\n🔊 Воспроизведение успешно!');
      } else {
        setResult(prev => prev + '\n❌ Ошибка воспроизведения');
      }
    } catch (error) {
      console.error('❌ [TEST] Ошибка тестового воспроизведения:', error);
      setResult(prev => prev + `\n❌ Ошибка воспроизведения: ${error.message}`);
    }
  };

  const handleClearTest = () => {
    voiceAssistantManager.removeSound('error_sound');
    setResult('🗑️ Тестовый звук удален');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Тест загрузки звуков
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Тестовая загрузка */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Быстрый тест загрузки</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="audio/*"
                onChange={handleTestUpload}
                className="hidden"
                id="test-audio-file"
                disabled={uploading}
              />
              <label
                htmlFor="test-audio-file"
                className={`inline-flex items-center px-4 py-2 rounded-lg cursor-pointer ${
                  uploading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {uploading ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={16} className="mr-2" />
                    Выбрать MP3 файл
                  </>
                )}
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Файл будет загружен как тестовый звук error_sound
              </p>
            </div>
          </div>

          {/* Кнопки тестирования */}
          <div className="flex space-x-3 mb-6">
            <button
              onClick={handleTestPlay}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
            >
              <Icon name="Play" size={16} className="mr-2" />
              Тест воспроизведения
            </button>
            <button
              onClick={handleClearTest}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Icon name="Trash2" size={16} />
            </button>
          </div>

          {/* Результат */}
          {result && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">Результат теста:</h4>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {result}
              </pre>
            </div>
          )}

          {/* Диагностика localStorage */}
          <div className="mt-6 bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Диагностика localStorage</h4>
            <button
              onClick={() => {
                const key = 'wb-new-voice-sounds';
                const data = localStorage.getItem(key);
                console.log(`🔍 [DIAG] localStorage["${key}"]`, data);
                
                let diagnostic = `Ключ: ${key}\n`;
                if (data) {
                  diagnostic += `Размер: ${data.length} символов\n`;
                  try {
                    const parsed = JSON.parse(data);
                    diagnostic += `Звуки: ${Object.keys(parsed).join(', ')}\n`;
                  } catch (e) {
                    diagnostic += `Ошибка парсинга: ${e.message}\n`;
                  }
                } else {
                  diagnostic += 'Данных нет\n';
                }
                
                setResult(diagnostic);
              }}
              className="text-sm px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Проверить localStorage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};