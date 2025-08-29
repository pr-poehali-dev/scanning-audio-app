import { useState, useEffect } from 'react';
import { Package, Scan, CheckCircle, XCircle, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import QRScanner from './QRScanner';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface AcceptanceTabProps {
  playAudio: (audioName: string) => void;
  customAudioFiles: Record<string, string>;
}

interface AcceptanceItem {
  id: string;
  barcode: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'accepted' | 'damaged' | 'rejected';
  timestamp: string;
}

const AcceptanceTab = ({ playAudio, customAudioFiles }: AcceptanceTabProps) => {
  const [showScanner, setShowScanner] = useState(false);
  const [acceptanceItems, setAcceptanceItems] = useState<AcceptanceItem[]>([]);
  const [currentScanMode, setCurrentScanMode] = useState<'accept' | 'damage' | 'reject'>('accept');

  // Расширенная функция для проигрывания аудио с умным алгоритмом
  const playAcceptanceAudio = (action: string, itemData?: any) => {
    console.log(`🔊 Запрос на озвучку приемки: ${action}`, itemData);
    
    // Расширенная карта аудиофайлов для разных действий
    const audioMap: Record<string, string[]> = {
      // Успешные действия
      'item_scanned': [
        'acceptance-Товар отсканирован',
        'acceptance-Сканирование успешно', 
        'acceptance-scan-success',
        'scan-success',
        'Товар найден'
      ],
      'accepted': [
        'acceptance-Принято в ПВЗ', 
        'Принято в ПВЗ',
        'acceptance-accepted',
        'accepted-success',
        'товар принят'
      ],
      'bulk_accepted': [
        'acceptance-Все товары приняты',
        'acceptance-bulk-success',
        'Массовое принятие завершено'
      ],
      // Проблемные ситуации
      'damaged': [
        'acceptance-Товар поврежден', 
        'Товар поврежден',
        'acceptance-damaged',
        'Обнаружено повреждение',
        'damaged-item'
      ],
      'rejected': [
        'acceptance-Ошибка приемки', 
        'Ошибка приемки',
        'acceptance-error',
        'rejection-sound',
        'error'
      ],
      'scan_error': [
        'acceptance-Ошибка сканирования',
        'scan-error', 
        'Штрихкод не распознан',
        'error'
      ],
      // Общие звуки
      'start_scanning': [
        'acceptance-Начинаю сканирование',
        'scan-start',
        'Сканер запущен'
      ]
    };

    const possibleAudios = audioMap[action] || [];
    let audioPlayed = false;
    
    // Пробуем найти и воспроизвести аудиофайл
    for (const audioName of possibleAudios) {
      if (customAudioFiles[audioName]) {
        console.log(`🔊 ✅ Проигрываю аудио для приемки: ${audioName}`);
        playAudio(audioName);
        audioPlayed = true;
        break;
      }
    }
    
    if (!audioPlayed) {
      console.log(`⚠️ Аудиофайл для "${action}" не найден. Проверьте загруженные файлы.`);
      console.log('Доступные аудиофайлы:', Object.keys(customAudioFiles));
      
      // Показываем уведомление пользователю
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate([100, 50, 100]); // Вибрация как альтернатива
      }
    }
    
    return audioPlayed;
  };

  // Обработка сканирования QR-кода с расширенной озвучкой
  const handleQRScan = (data: string) => {
    console.log('Отсканирован товар для приемки:', data);
    setShowScanner(false);
    
    // Сначала озвучиваем факт сканирования
    playAcceptanceAudio('item_scanned', { barcode: data });
    
    const newItem: AcceptanceItem = {
      id: Date.now().toString(),
      barcode: data,
      productName: `Товар ${data.slice(-6)}`,
      quantity: 1,
      status: currentScanMode === 'accept' ? 'accepted' : 
              currentScanMode === 'damage' ? 'damaged' : 'rejected',
      timestamp: new Date().toLocaleString('ru-RU')
    };

    setAcceptanceItems(prev => [newItem, ...prev]);
    
    // Через небольшую задержку озвучиваем результат обработки
    setTimeout(() => {
      if (currentScanMode === 'accept') {
        playAcceptanceAudio('accepted', newItem);
      } else if (currentScanMode === 'damage') {
        playAcceptanceAudio('damaged', newItem);
      } else {
        playAcceptanceAudio('rejected', newItem);
      }
    }, 500);
  };

  // Функция для изменения статуса товара
  const changeItemStatus = (itemId: string, newStatus: AcceptanceItem['status']) => {
    setAcceptanceItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, status: newStatus, timestamp: new Date().toLocaleString('ru-RU') } : item
      )
    );
    
    // Проигрываем аудио для нового статуса
    playAcceptanceAudio(newStatus);
  };

  // Функция для открытия сканера с определенным режимом и озвучкой
  const startScanning = (mode: 'accept' | 'damage' | 'reject') => {
    setCurrentScanMode(mode);
    playAcceptanceAudio('start_scanning');
    setShowScanner(true);
  };

  // Массовые действия с озвучкой
  const handleBulkAccept = () => {
    const pendingItems = acceptanceItems.filter(item => item.status === 'pending');
    if (pendingItems.length > 0) {
      pendingItems.forEach(item => {
        changeItemStatus(item.id, 'accepted');
      });
      setTimeout(() => playAcceptanceAudio('bulk_accepted'), 300);
    }
  };

  // Функция тестирования аудио
  const testAcceptanceAudio = () => {
    const testSounds = ['accepted', 'damaged', 'rejected'];
    testSounds.forEach((sound, index) => {
      setTimeout(() => {
        playAcceptanceAudio(sound);
      }, index * 1000);
    });
  };

  // Получаем статистику
  const stats = acceptanceItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="text-blue-600" size={28} />
          <h2 className="text-2xl font-bold text-gray-800">Приемка товаров</h2>
        </div>
        
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.accepted || 0}</div>
            <div className="text-sm text-green-700">Принято</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.damaged || 0}</div>
            <div className="text-sm text-yellow-700">Повреждено</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
            <div className="text-sm text-red-700">Отклонено</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-600">{acceptanceItems.length}</div>
            <div className="text-sm text-gray-700">Всего</div>
          </div>
        </div>

        {/* Кнопки для сканирования */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => startScanning('accept')}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors"
          >
            <CheckCircle size={20} />
            <Scan size={20} />
            <span>Принять товар</span>
          </button>
          
          <button
            onClick={() => startScanning('damage')}
            className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-lg transition-colors"
          >
            <AlertTriangle size={20} />
            <Scan size={20} />
            <span>Товар поврежден</span>
          </button>
          
          <button
            onClick={() => startScanning('reject')}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg transition-colors"
          >
            <XCircle size={20} />
            <Scan size={20} />
            <span>Отклонить товар</span>
          </button>
        </div>
      </div>

      {/* Список товаров */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">История приемки</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {acceptanceItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>Пока нет отсканированных товаров</p>
              <p className="text-sm">Нажмите на кнопку сканирования выше</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {acceptanceItems.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    item.status === 'accepted' ? 'border-green-200 bg-green-50' :
                    item.status === 'damaged' ? 'border-yellow-200 bg-yellow-50' :
                    item.status === 'rejected' ? 'border-red-200 bg-red-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">{item.productName}</h4>
                      <p className="text-sm text-gray-600">Штрихкод: {item.barcode}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      item.status === 'damaged' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'accepted' ? 'Принято' :
                       item.status === 'damaged' ? 'Повреждено' :
                       item.status === 'rejected' ? 'Отклонено' : item.status}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{item.timestamp}</span>
                    
                    {/* Кнопки для смены статуса */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => changeItemStatus(item.id, 'accepted')}
                        className="text-green-600 hover:bg-green-100 p-1 rounded transition-colors"
                        title="Принять"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => changeItemStatus(item.id, 'damaged')}
                        className="text-yellow-600 hover:bg-yellow-100 p-1 rounded transition-colors"
                        title="Повреждено"
                      >
                        <AlertTriangle size={16} />
                      </button>
                      <button
                        onClick={() => changeItemStatus(item.id, 'rejected')}
                        className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors"
                        title="Отклонить"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Сканер */}
      <QRScanner
        isOpen={showScanner}
        onScan={handleQRScan}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
};

export default AcceptanceTab;