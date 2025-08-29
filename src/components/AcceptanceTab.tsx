import { useState } from 'react';
import { Package, Scan, CheckCircle, XCircle, AlertTriangle, Search, ArrowLeft } from 'lucide-react';
import QRScanner from './QRScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AcceptanceTabProps {
  playAudio: (audioName: string) => void;
  customAudioFiles: Record<string, string>;
}

type AcceptanceStep = 'scan' | 'confirm' | 'location' | 'complete';

interface AcceptanceItem {
  id: string;
  barcode: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'accepted' | 'damaged' | 'rejected';
  timestamp: string;
}

const AcceptanceTab = ({ playAudio, customAudioFiles }: AcceptanceTabProps) => {
  const [currentStep, setCurrentStep] = useState<AcceptanceStep>('scan');
  const [showScanner, setShowScanner] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [acceptanceItems, setAcceptanceItems] = useState<AcceptanceItem[]>([]);

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

  // Обработка сканирования
  const handleQRScan = (data: string) => {
    console.log('🔍 Отсканирован код для приемки:', data);
    setScannedCode(data);
    setShowScanner(false);
    
    // Озвучиваем сканирование
    playAcceptanceAudio('item_scanned', { barcode: data });
    
    // Переходим к следующему шагу
    setCurrentStep('confirm');
    
    const newItem: AcceptanceItem = {
      id: Date.now().toString(),
      barcode: data,
      productName: `Товар ${data.slice(-6)}`,
      quantity: 1,
      status: 'accepted',
      timestamp: new Date().toLocaleString('ru-RU')
    };

    setAcceptanceItems(prev => [newItem, ...prev]);
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

  // Открытие сканера
  const startScanning = () => {
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

  // Степпер компонент
  const StepIndicator = ({ step, isActive, isCompleted }: { step: number; isActive: boolean; isCompleted: boolean }) => (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
      isCompleted ? 'bg-green-500 text-white' :
      isActive ? 'bg-purple-500 text-white' :
      'bg-gray-200 text-gray-600'
    }`}>
      {isCompleted ? <CheckCircle size={16} /> : step}
    </div>
  );

  // QR код компонент (статичный)
  const QRCodeDisplay = () => (
    <div className="flex justify-center mb-8">
      <div className="w-48 h-48 bg-white border-4 border-purple-200 rounded-xl p-4 flex items-center justify-center">
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTc2IiBoZWlnaHQ9IjE3NiIgdmlld0JveD0iMCAwIDE3NiAxNzYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAwMDAiLz4KPHJlY3QgeD0iOCIgeT0iMCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8cmVjdCB4PSIxNiIgeT0iMCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4K"
          alt="QR Code"
          className="w-full h-full object-contain"
        />
        {/* Простая имитация QR кода */}
        <div className="grid grid-cols-8 gap-1 w-full h-full">
          {Array.from({length: 64}, (_, i) => (
            <div 
              key={i} 
              className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} rounded-sm`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Хедер с кнопкой назад */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Вернуться к приемке
        </Button>
      </div>

      {/* Степпер */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center space-x-8 mb-8">
          <div className="flex flex-col items-center">
            <StepIndicator step={1} isActive={currentStep === 'scan'} isCompleted={false} />
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <StepIndicator step={2} isActive={currentStep === 'confirm'} isCompleted={false} />
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <StepIndicator step={3} isActive={currentStep === 'location'} isCompleted={false} />
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <StepIndicator step={4} isActive={currentStep === 'complete'} isCompleted={false} />
          </div>
        </div>

        {/* Контент в зависимости от шага */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">
            Отсканируйте стикер коробки
          </h1>

          {/* QR код */}
          <QRCodeDisplay />

          {/* Разделитель */}
          <div className="text-gray-500 mb-6">или</div>

          {/* Поле поиска */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="89585787658"
                className="w-full pl-4 pr-12 py-3 text-lg border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              <Button 
                size="sm"
                className="absolute right-2 top-2 bg-purple-500 hover:bg-purple-600"
                onClick={() => {
                  if (searchValue) {
                    handleQRScan(searchValue);
                    setSearchValue('');
                  }
                }}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
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