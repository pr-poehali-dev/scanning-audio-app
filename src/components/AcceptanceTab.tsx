import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import QRScanner from './QRScanner';
import { Button } from '@/components/ui/button';

// Импорты новых компонентов
import AcceptanceSteps from './acceptance/AcceptanceSteps';
import AcceptanceAnalyzer from './acceptance/AcceptanceAnalyzer';
import { createAcceptanceAudioUtils } from './acceptance/AcceptanceAudioUtils';
import { 
  AcceptanceTabProps, 
  AcceptanceStep, 
  AcceptanceItem 
} from './acceptance/AcceptanceTypes';

const AcceptanceTab = ({ playAudio, customAudioFiles }: AcceptanceTabProps) => {
  const [currentStep, setCurrentStep] = useState<AcceptanceStep>('box');
  const [boxBarcode, setBoxBarcode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [acceptanceItems, setAcceptanceItems] = useState<AcceptanceItem[]>([]);
  const [audioTranscriptions, setAudioTranscriptions] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Создание утилит для озвучки
  const audioUtils = createAcceptanceAudioUtils({ playAudio, customAudioFiles });

  // Генерация случайного названия товара
  const generateRandomProductName = () => {
    const productNames = [
      'Смартфон Samsung Galaxy',
      'Наушники Apple AirPods',  
      'Куртка зимняя Nike',
      'Кроссовки Adidas',
      'Рюкзак школьный',
      'Планшет iPad',
      'Книга "Мастер и Маргарита"',
      'Игрушка мягкая медведь',
      'Часы Xiaomi Mi Band',
      'Термос Stanley',
      'Джинсы Levi\'s 501',
      'Футболка с принтом'
    ];
    
    return productNames[Math.floor(Math.random() * productNames.length)];
  };

  // 📦 Обработчик сканирования в приемке
  const handleQRScan = (data: string) => {
    console.log('📦 === СКАНИРОВАНИЕ В ПРИЕМКЕ ===');
    console.log('🔍 Отсканирован код:', data);
    setScannedCode(data);
    setShowScanner(false);
    
    if (currentStep === 'box') {
      // Сканирование коробки
      console.log('📦 СКАНИРОВАНИЕ КОРОБКИ');
      setBoxBarcode(data);
      audioUtils.playAcceptanceAudio('box-scanned');
      setTimeout(() => {
        audioUtils.playAcceptanceAudio('continue-acceptance');
      }, 1500);
      setCurrentStep('items');
    } else if (currentStep === 'items') {
      // Сканирование товара
      console.log('📱 СКАНИРОВАНИЕ ТОВАРА');
      
      // Проверяем, не был ли товар уже принят
      const existingItem = acceptanceItems.find(item => item.barcode === data);
      if (existingItem) {
        audioUtils.playAcceptanceAudio('already-accepted');
        return;
      }
      
      // Генерируем случайный номер ячейки
      const cellNumber = Math.floor(Math.random() * 482) + 1;
      
      // Создаем новый товар с номером ячейки
      const newItem: AcceptanceItem = {
        id: `item-${Date.now()}`,
        barcode: data,
        productName: generateRandomProductName(),
        quantity: 1,
        status: 'accepted',
        timestamp: new Date().toISOString(),
        cellNumber: cellNumber // Добавляем номер ячейки
      };
      
      console.log(`📱 ТОВАР ПРИНЯТ В ЯЧЕЙКУ ${cellNumber}:`, newItem);
      
      // Добавляем товар
      setAcceptanceItems(prev => [...prev, newItem]);
      
      // Озвучиваем действия
      audioUtils.playAcceptanceAudio('item-for-pvz');
      setTimeout(async () => {
        await audioUtils.playCellAudio(cellNumber.toString());
        setTimeout(() => {
          audioUtils.playAcceptanceAudio('scan-next');
        }, 1000);
      }, 1500);
      
      // Переходим к размещению если это первый товар
      if (acceptanceItems.length === 0) {
        setTimeout(() => {
          setCurrentStep('location');
        }, 3000);
      }
    }
  };

  // Функция тестирования аудио
  const testAcceptanceAudio = () => {
    const testSounds = ['accepted', 'damaged', 'rejected'];
    testSounds.forEach((sound, index) => {
      setTimeout(() => {
        audioUtils.playAcceptanceAudio(sound);
      }, index * 1000);
    });
  };

  // Изменение статуса товара
  const changeItemStatus = (itemId: string, status: AcceptanceItem['status']) => {
    setAcceptanceItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, status } : item
      )
    );
  };

  // Массовые действия с озвучкой
  const handleBulkAccept = () => {
    const pendingItems = acceptanceItems.filter(item => item.status === 'pending');
    if (pendingItems.length > 0) {
      pendingItems.forEach(item => {
        changeItemStatus(item.id, 'accepted');
      });
      setTimeout(() => audioUtils.playAcceptanceAudio('bulk_accepted'), 300);
    }
  };

  // Функция для запуска сканирования
  const startScanning = () => {
    audioUtils.playAcceptanceAudio('start_scanning');
    setShowScanner(true);
  };

  // Получаем статистику
  const stats = acceptanceItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Хедер с кнопкой назад */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Вернуться к приемке
        </Button>
      </div>

      {/* Основные этапы приемки */}
      <AcceptanceSteps
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        boxBarcode={boxBarcode}
        acceptanceItems={acceptanceItems}
        setShowScanner={setShowScanner}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        handleQRScan={handleQRScan}
        playAcceptanceAudio={audioUtils.playAcceptanceAudio}
        setAcceptanceItems={setAcceptanceItems}
      />

      {/* Анализатор аудиофайлов */}
      <AcceptanceAnalyzer
        customAudioFiles={customAudioFiles}
        audioTranscriptions={audioTranscriptions}
        setAudioTranscriptions={setAudioTranscriptions}
        isAnalyzing={isAnalyzing}
        setIsAnalyzing={setIsAnalyzing}
        acceptanceItems={acceptanceItems}
        changeItemStatus={changeItemStatus}
        playAcceptanceAudio={audioUtils.playAcceptanceAudio}
      />

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