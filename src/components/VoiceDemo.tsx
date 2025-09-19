import React from 'react';
import Icon from '@/components/ui/icon';
import { 
  playErrorSound, 
  playCellNumber, 
  playGoodsInfo,
  playPaymentOnDelivery,
  playCheckGoodUnderCamera,
  playThanksAndRate,
  playFullDeliveryScenario,
  getCurrentVoiceAssistant
} from '@/utils/voiceAPI';

interface VoiceDemoProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const VoiceDemo: React.FC<VoiceDemoProps> = ({ 
  isOpen = false, 
  onClose 
}) => {
  const [isPlaying, setIsPlaying] = React.useState<string | null>(null);
  const [voiceInfo, setVoiceInfo] = React.useState(getCurrentVoiceAssistant());

  React.useEffect(() => {
    if (isOpen) {
      setVoiceInfo(getCurrentVoiceAssistant());
    }
  }, [isOpen]);

  const playSound = async (soundId: string, playFunction: () => Promise<boolean>) => {
    if (isPlaying) return;
    
    setIsPlaying(soundId);
    try {
      const success = await playFunction();
      console.log(`Воспроизведение ${soundId}: ${success ? 'успешно' : 'неудачно'}`);
    } catch (error) {
      console.error(`Ошибка воспроизведения ${soundId}:`, error);
    } finally {
      setIsPlaying(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Демонстрация голосовой озвучки
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Информация о текущем помощнике */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Текущий голосовой помощник</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>🎤 Помощник: {voiceInfo.info?.name || 'Неизвестный'}</div>
              <div>📝 Описание: {voiceInfo.info?.description}</div>
              <div>🔊 Загружено звуков: {voiceInfo.loadedSounds.length}</div>
              <div>💽 Размер: {voiceInfo.storageInfo.totalSize}</div>
            </div>
          </div>

          {/* Системные звуки */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Icon name="AlertTriangle" size={20} className="mr-2 text-orange-500" />
              Системные звуки
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => playSound('error_sound', playErrorSound)}
                disabled={isPlaying !== null}
                className={`p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                  isPlaying === 'error_sound' ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">🚨 Звук ошибки</div>
                    <div className="text-sm text-gray-600">При сканировании неверного QR-кода</div>
                  </div>
                  {isPlaying === 'error_sound' ? (
                    <Icon name="Loader2" size={20} className="animate-spin text-blue-500" />
                  ) : (
                    <Icon name="Play" size={20} className="text-gray-400" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Озвучка ячеек */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Icon name="Grid3X3" size={20} className="mr-2 text-green-500" />
              Озвучка ячеек
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['A1', 'B15', '126', '999'].map(cellNumber => (
                <button
                  key={cellNumber}
                  onClick={() => playSound(`cell_${cellNumber}`, () => playCellNumber(cellNumber))}
                  disabled={isPlaying !== null}
                  className={`p-3 border rounded-lg text-center hover:bg-gray-50 transition-colors ${
                    isPlaying === `cell_${cellNumber}` ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium">🏠 {cellNumber}</div>
                  {isPlaying === `cell_${cellNumber}` && (
                    <Icon name="Loader2" size={16} className="animate-spin text-blue-500 mx-auto mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Озвучка товаров */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Icon name="Package" size={20} className="mr-2 text-purple-500" />
              Информация о товарах
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 3, 5, 21].map(count => (
                <button
                  key={count}
                  onClick={() => playSound(`goods_${count}`, () => playGoodsInfo(count))}
                  disabled={isPlaying !== null}
                  className={`p-3 border rounded-lg text-center hover:bg-gray-50 transition-colors ${
                    isPlaying === `goods_${count}` ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium">📦 {count}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {count === 1 ? 'товар' : count <= 4 ? 'товара' : 'товаров'}
                  </div>
                  {isPlaying === `goods_${count}` && (
                    <Icon name="Loader2" size={16} className="animate-spin text-blue-500 mx-auto mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Интерактивные звуки */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Icon name="MessageSquare" size={20} className="mr-2 text-blue-500" />
              Интерактивные сообщения
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => playSound('payment_delivery', playPaymentOnDelivery)}
                disabled={isPlaying !== null}
                className={`p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                  isPlaying === 'payment_delivery' ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">💰 Оплата при получении</div>
                    <div className="text-sm text-gray-600">Уведомление о способе оплаты</div>
                  </div>
                  {isPlaying === 'payment_delivery' ? (
                    <Icon name="Loader2" size={20} className="animate-spin text-blue-500" />
                  ) : (
                    <Icon name="Play" size={20} className="text-gray-400" />
                  )}
                </div>
              </button>

              <button
                onClick={() => playSound('check_camera', playCheckGoodUnderCamera)}
                disabled={isPlaying !== null}
                className={`p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                  isPlaying === 'check_camera' ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">📷 Проверьте товар</div>
                    <div className="text-sm text-gray-600">Инструкция проверить товар под камерой</div>
                  </div>
                  {isPlaying === 'check_camera' ? (
                    <Icon name="Loader2" size={20} className="animate-spin text-blue-500" />
                  ) : (
                    <Icon name="Play" size={20} className="text-gray-400" />
                  )}
                </div>
              </button>

              <button
                onClick={() => playSound('thanks_rate', playThanksAndRate)}
                disabled={isPlaying !== null}
                className={`p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                  isPlaying === 'thanks_rate' ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">⭐ Спасибо за заказ</div>
                    <div className="text-sm text-gray-600">Благодарность и просьба оценить PickPoint</div>
                  </div>
                  {isPlaying === 'thanks_rate' ? (
                    <Icon name="Loader2" size={20} className="animate-spin text-blue-500" />
                  ) : (
                    <Icon name="Play" size={20} className="text-gray-400" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Полный сценарий */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Icon name="Play" size={20} className="mr-2 text-red-500" />
              Полный сценарий выдачи
            </h3>
            <button
              onClick={() => playSound('full_scenario', () => playFullDeliveryScenario('A1', 3, true))}
              disabled={isPlaying !== null}
              className={`w-full p-6 border-2 border-dashed rounded-lg text-center hover:bg-gray-50 transition-colors ${
                isPlaying === 'full_scenario' ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                {isPlaying === 'full_scenario' ? (
                  <Icon name="Loader2" size={24} className="animate-spin text-blue-500" />
                ) : (
                  <Icon name="Play" size={24} className="text-gray-500" />
                )}
                <div>
                  <div className="font-medium text-lg">🎬 Воспроизвести полный сценарий</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Ячейка A1 → 3 товара → Оплата при получении → Проверка → Благодарность
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Информация */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Информация</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Для интерактивного помощника нужно загрузить соответствующие MP3 файлы</li>
              <li>Классический помощник использует только озвучку ячеек</li>
              <li>При отсутствии файлов используется синтез речи браузера</li>
              <li>Настройте голосового помощника через кнопку "Голос" в шапке</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};