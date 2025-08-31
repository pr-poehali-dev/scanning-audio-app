import { useState } from 'react';
import { Package, Scan, CheckCircle, XCircle, AlertTriangle, Search, ArrowLeft } from 'lucide-react';
import QRScanner from './QRScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AcceptanceTabProps {
  playAudio: (audioName: string) => void;
  customAudioFiles: Record<string, string>;
}

type AcceptanceStep = 'box' | 'items' | 'location' | 'complete';

interface AcceptanceItem {
  id: string;
  barcode: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'accepted' | 'damaged' | 'rejected';
  timestamp: string;
  cellNumber?: number; // Номер ячейки
}

const AcceptanceTab = ({ playAudio, customAudioFiles }: AcceptanceTabProps) => {
  const [currentStep, setCurrentStep] = useState<AcceptanceStep>('box');
  const [boxBarcode, setBoxBarcode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [acceptanceItems, setAcceptanceItems] = useState<AcceptanceItem[]>([]);
  const [audioTranscriptions, setAudioTranscriptions] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  // 🔊 Озвучка ячейки в приемке (такая же как в выдаче)
  const playCellAudio = async (cellNumber: string) => {
    console.log(`🔊 === ОЗВУЧКА ЯЧЕЙКИ В ПРИЕМКЕ: ${cellNumber} ===`);
    
    const cellSearchOrder = [
      'cell-number',        // Универсальный файл для всех ячеек
      cellNumber,           // Точный номер ячейки
      `cell-${cellNumber}`, // С префиксом cell
      `ячейка-${cellNumber}`, // Русский вариант
      `ячейка_${cellNumber}`, // Русский с подчеркиванием
      `acceptance-cell-${cellNumber}`, // Специально для приемки
      `acceptance-ячейка-${cellNumber}` // Русский для приемки
    ];
    
    let cellAudioPlayed = false;
    console.log(`🔍 Поиск аудио для ячейки в порядке приоритета:`, cellSearchOrder);
    
    for (const audioKey of cellSearchOrder) {
      console.log(`🔍 Проверяю файл: "${audioKey}"`);
      
      if (customAudioFiles[audioKey]) {
        console.log(`✅ НАЙДЕН ФАЙЛ: "${audioKey}"`);
        
        try {
          const audio = new Audio(customAudioFiles[audioKey]);
          audio.volume = 1.0;
          
          const savedSpeed = localStorage.getItem('wb-pvz-audio-speed');
          if (savedSpeed) {
            audio.playbackRate = parseFloat(savedSpeed);
          }
          
          const playPromise = new Promise((resolve, reject) => {
            audio.onended = resolve;
            audio.onerror = reject;
            audio.oncanplaythrough = () => {
              audio.play().then(resolve).catch(reject);
            };
          });
          
          await playPromise;
          console.log(`🎵 ✅ ЯЧЕЙКА ${cellNumber} ОЗВУЧЕНА В ПРИЕМКЕ: "${audioKey}"`);
          cellAudioPlayed = true;
          break;
          
        } catch (error) {
          console.error(`❌ ОШИБКА ВОСПРОИЗВЕДЕНИЯ "${audioKey}":`, error);
          continue;
        }
      } else {
        console.log(`❌ НЕ НАЙДЕН: "${audioKey}"`);
      }
    }
    
    if (!cellAudioPlayed) {
      console.warn(`⚠️ ЯЧЕЙКА ${cellNumber} НЕ ОЗВУЧЕНА - ФАЙЛ НЕ НАЙДЕН!`);
      console.log('📤 Загрузите один из файлов:');
      console.log('  1. "cell-number" - универсальная озвучка для ВСЕХ ячеек');
      console.log(`  2. "${cellNumber}" - озвучка только для ячейки ${cellNumber}`);
    }
    
    return cellAudioPlayed;
  };

  // 🔊 Озвучка действий приемки
  const playAcceptanceAudio = async (action: string, itemData?: any) => {
    console.log(`🔊 === ОЗВУЧКА ДЕЙСТВИЯ ПРИЕМКИ: ${action} ===`, itemData);
    
    const actionAudios: Record<string, string[]> = {
      // Новые действия приемки
      'box-accepted': ['коробка-принята', 'receiving-коробка-принята', 'box-accepted'],
      'scan-again': ['отсканируйте-еще-раз', 'receiving-отсканируйте-еще-раз', 'scan-again'],
      'continue-acceptance': ['продолжайте-приемку', 'receiving-продолжайте-приемку', 'continue-acceptance'],
      'item-for-pvz': ['товар-для-пвз', 'receiving-товар-для-пвз', 'item-for-pvz'],
      'scan-next': ['отсканируйте-следующий-товар', 'receiving-отсканируйте-следующий-товар', 'scan-next'],
      'priority-order': ['приоритетный-заказ', 'receiving-приоритетный-заказ', 'priority-order'],
      'already-accepted': ['повтор-товар-уже-принят', 'receiving-повтор-товар-уже-принят', 'already-accepted'],
      'box-scanned': ['коробка-отсканирована', 'receiving-коробка-отсканирована', 'box-scanned'],
      // Старые действия для совместимости
      'item_scanned': ['acceptance-Товар отсканирован', 'acceptance-scan-success', 'scan-success'],
      'accepted': ['acceptance-Принято в ПВЗ', 'accepted-success', 'товар принят'],
      'bulk_accepted': ['acceptance-Все товары приняты', 'acceptance-bulk-success'],
      'damaged': ['acceptance-Товар поврежден', 'damaged-item'],
      'rejected': ['acceptance-Ошибка приемки', 'rejection-sound', 'error'],
      'start_scanning': ['acceptance-Начинаю сканирование', 'scan-start']
    };

    const searchKeys = actionAudios[action] || [action];
    let audioPlayed = false;
    
    for (const audioKey of searchKeys) {
      if (customAudioFiles[audioKey]) {
        try {
          console.log(`🎵 ВОСПРОИЗВОЖУ ДЕЙСТВИЕ ПРИЕМКИ: "${audioKey}"`);
          const audio = new Audio(customAudioFiles[audioKey]);
          await audio.play();
          console.log(`🎵 ✅ ДЕЙСТВИЕ ОЗВУЧЕНО: "${audioKey}"`);
          audioPlayed = true;
          break;
        } catch (error) {
          console.error(`❌ ОШИБКА ОЗВУЧКИ "${audioKey}":`, error);
          continue;
        }
      }
    }
    
    if (!audioPlayed) {
      console.warn(`⚠️ ДЕЙСТВИЕ "${action}" НЕ ОЗВУЧЕНО - ФАЙЛ НЕ НАЙДЕН!`);
    }
    
    return audioPlayed;
  };

  // 🎤 Функция расшифровки аудиофайлов (симуляция)
  const transcribeAudio = async (audioKey: string, audioUrl: string): Promise<string> => {
    console.log(`🎤 Расшифровка аудио: ${audioKey}`);
    
    // Симуляция расшифровки (в реальности здесь был бы API речевого распознавания)
    const fakeTranscriptions: Record<string, string> = {
      'acceptance-Товар отсканирован': 'Товар успешно отсканирован',
      'acceptance-Принято в ПВЗ': 'Принято в пункт выдачи заказов', 
      'acceptance-Товар поврежден': 'Обнаружено повреждение товара',
      'acceptance-Ошибка приемки': 'Произошла ошибка при приемке',
      'acceptance-Начинаю сканирование': 'Начинаю процесс сканирования штрихкода',
      'acceptance-scan-success': 'Сканирование выполнено успешно',
      'acceptance-bulk-success': 'Массовое принятие товаров завершено',
      'scan-success': 'Штрихкод успешно распознан',
      'accepted-success': 'Товар принят в работу',
      'damaged-item': 'Товар имеет повреждения'
    };
    
    // Имитируем задержку обработки
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const transcription = fakeTranscriptions[audioKey] || 
                         `Автоматическая расшифровка для: ${audioKey}`;
    
    console.log(`✅ Расшифровка готова: "${transcription}"`);
    return transcription;
  };

  // 🤖 Создание функций на основе расшифровки
  const createFunctionFromTranscription = (audioKey: string, transcription: string) => {
    const functionName = audioKey.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const actionType = getActionTypeFromKey(audioKey);
    
    console.log(`🔧 === СОЗДАНИЕ ФУНКЦИИ ПРИЕМКИ ===`);
    console.log(`📝 Аудиофайл: ${audioKey}`);
    console.log(`🎤 Расшифровка: "${transcription}"`);
    console.log(`⚙️ Тип действия: ${actionType}`);
    console.log(`🔌 Имя функции: ${functionName}()`);
    console.log(``);
    console.log(`// 🎯 Функция для: ${transcription}`);
    console.log(`const ${functionName} = () => {`);
    console.log(`  console.log('🔊 ${transcription}');`);
    console.log(`  playAudio('${audioKey}');`);
    
    if (actionType === 'scanning') {
      console.log(`  setShowScanner(true);`);
      console.log(`  // Запуск процесса сканирования`);
    } else if (actionType === 'acceptance') {
      console.log(`  // Обработка принятия товара`);
      console.log(`  setCurrentStep('location');`);
    } else if (actionType === 'damage') {
      console.log(`  // Обработка поврежденного товара`);
      console.log(`  markItemAsDamaged();`);
    } else if (actionType === 'error') {
      console.log(`  // Обработка ошибок приемки`);
      console.log(`  handleAcceptanceError();`);
    }
    
    console.log(`  return '${transcription}';`);
    console.log(`};`);
    console.log(``);
    
    return {
      functionName,
      code: generateFunctionCode(functionName, transcription, actionType),
      actionType,
      description: transcription
    };
  };

  // 🎯 Определение типа действия по ключу аудио
  const getActionTypeFromKey = (audioKey: string): string => {
    if (audioKey.includes('scan') || audioKey.includes('Сканирование')) return 'scanning';
    if (audioKey.includes('Принято') || audioKey.includes('accepted')) return 'acceptance';
    if (audioKey.includes('поврежден') || audioKey.includes('damaged')) return 'damage';
    if (audioKey.includes('Ошибка') || audioKey.includes('error')) return 'error';
    if (audioKey.includes('bulk') || audioKey.includes('Все товары')) return 'bulk_operation';
    return 'general';
  };

  // 💾 Генерация кода функции
  const generateFunctionCode = (functionName: string, transcription: string, actionType: string): string => {
    return `
// 🎯 Автосгенерированная функция: ${transcription}
const ${functionName} = async () => {
  console.log('🔊 ${transcription}');
  
  // Проиграть соответствующий звук
  playAudio('${functionName}');
  
  ${getActionCode(actionType)}
  
  return {
    success: true,
    message: '${transcription}',
    timestamp: new Date().toISOString()
  };
};
`;
  };

  // ⚡ Получение кода действия по типу
  const getActionCode = (actionType: string): string => {
    switch (actionType) {
      case 'scanning':
        return `  // Запуск сканирования\n  setShowScanner(true);\n  setIsAnalyzing(true);`;
      case 'acceptance':
        return `  // Принятие товара\n  if (acceptanceItems.length > 0) {\n    changeItemStatus(acceptanceItems[0].id, 'accepted');\n  }\n  setCurrentStep('location');`;
      case 'damage':
        return `  // Обработка повреждения\n  if (acceptanceItems.length > 0) {\n    changeItemStatus(acceptanceItems[0].id, 'damaged');\n  }\n  // Уведомление о повреждении`;
      case 'error':
        return `  // Обработка ошибки\n  console.error('Ошибка в процессе приемки');\n  setCurrentStep('scan');`;
      case 'bulk_operation':
        return `  // Массовая операция\n  handleBulkAccept();\n  console.log('Массовая операция выполнена');`;
      default:
        return `  // Общее действие\n  console.log('Выполнено действие: ${actionType}');`;
    }
  };

  // 🔍 Анализ всех загруженных аудиофайлов
  const analyzeAllAudioFiles = async () => {
    setIsAnalyzing(true);
    console.log('🎤 === НАЧАЛО АНАЛИЗА АУДИОФАЙЛОВ ===');
    console.log(`📁 Найдено ${Object.keys(customAudioFiles).length} аудиофайлов`);
    
    const acceptanceAudioFiles = Object.entries(customAudioFiles)
      .filter(([key]) => key.toLowerCase().includes('acceptance') || 
                         key.toLowerCase().includes('приемка') ||
                         key.toLowerCase().includes('scan') ||
                         key.toLowerCase().includes('товар'));
    
    console.log(`🎯 Файлов для приемки: ${acceptanceAudioFiles.length}`);
    
    const generatedFunctions = [];
    
    for (const [audioKey, audioUrl] of acceptanceAudioFiles) {
      try {
        console.log(`\n🔄 Обрабатываю: ${audioKey}`);
        const transcription = await transcribeAudio(audioKey, audioUrl);
        const functionInfo = createFunctionFromTranscription(audioKey, transcription);
        
        setAudioTranscriptions(prev => ({...prev, [audioKey]: transcription}));
        generatedFunctions.push(functionInfo);
        
      } catch (error) {
        console.error(`❌ Ошибка обработки ${audioKey}:`, error);
      }
    }
    
    console.log('\n🎉 === АНАЛИЗ ЗАВЕРШЕН ===');
    console.log(`✅ Создано функций: ${generatedFunctions.length}`);
    console.log('📋 Список созданных функций:');
    generatedFunctions.forEach((func, index) => {
      console.log(`  ${index + 1}. ${func.functionName}() - ${func.description}`);
    });
    
    setIsAnalyzing(false);
    return generatedFunctions;
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
      playAcceptanceAudio('box-scanned');
      setTimeout(() => {
        playAcceptanceAudio('continue-acceptance');
      }, 1500);
      setCurrentStep('items');
    } else if (currentStep === 'items') {
      // Сканирование товара
      console.log('📱 СКАНИРОВАНИЕ ТОВАРА');
      
      // Проверяем, не был ли товар уже принят
      const existingItem = acceptanceItems.find(item => item.barcode === data);
      if (existingItem) {
        playAcceptanceAudio('already-accepted');
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
      playAcceptanceAudio('item-for-pvz');
      setTimeout(async () => {
        await playCellAudio(cellNumber.toString());
        setTimeout(() => {
          playAcceptanceAudio('scan-next');
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
    
    const randomProduct = productNames[Math.floor(Math.random() * productNames.length)];
    const randomQuantity = Math.floor(Math.random() * 3) + 1;
    
    const newItem: AcceptanceItem = {
      id: Date.now().toString(),
      barcode: data,
      productName: randomProduct,
      quantity: randomQuantity,
      status: 'pending',
      timestamp: new Date().toLocaleString('ru-RU')
    };

    setAcceptanceItems(prev => [newItem, ...prev]);
    
    console.log(`✅ Товар добавлен: ${randomProduct} (${randomQuantity} шт.)`);
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
            <StepIndicator step={1} isActive={currentStep === 'box'} isCompleted={currentStep !== 'box'} />
            <span className="text-xs mt-2 text-gray-600">Коробка</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <StepIndicator step={2} isActive={currentStep === 'items'} isCompleted={currentStep === 'location' || currentStep === 'complete'} />
            <span className="text-xs mt-2 text-gray-600">Товары</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <StepIndicator step={3} isActive={currentStep === 'location'} isCompleted={currentStep === 'complete'} />
            <span className="text-xs mt-2 text-gray-600">Размещение</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <StepIndicator step={4} isActive={currentStep === 'complete'} isCompleted={false} />
            <span className="text-xs mt-2 text-gray-600">Завершено</span>
          </div>
        </div>

        {/* Контент в зависимости от шага */}
        {currentStep === 'box' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">
              📦 Отсканируйте стикер коробки
            </h1>

            {/* QR код с ФИКТИВНЫМ СКАНИРОВАНИЕМ */}
            <div 
              onClick={() => {
                // ФИКТИВНОЕ сканирование при клике на QR-код
                const fakeBarcode = `${Date.now().toString().slice(-8)}`;
                console.log('🔍 КЛИК ПО QR-КОДУ - запуск фиктивного сканирования');
                setTimeout(() => {
                  handleQRScan(fakeBarcode);
                }, 500);
              }}
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              <QRCodeDisplay />
            </div>

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
        )}
        
        {/* Шаг 2: Сканирование товаров */}
        {currentStep === 'items' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">
              📱 Сканируйте каждый товар
            </h1>
            
            {boxBarcode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  📦 <strong>Коробка:</strong> {boxBarcode}
                </p>
              </div>
            )}
            
            {acceptanceItems.length > 0 && (
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">✅ Принятые товары:</h3>
                <div className="space-y-2">
                  {acceptanceItems.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <span className="bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="text-left">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-600">Штрихкод: {item.barcode}</p>
                          {item.cellNumber && (
                            <p className="text-sm font-semibold text-purple-600">
                              🏠 Ячейка: {item.cellNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-bold">✅ Принят</div>
                        {item.cellNumber && (
                          <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full mt-1">
                            Ячейка {item.cellNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <Button
                onClick={() => setShowScanner(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 w-full"
              >
                📱 Сканировать товар
              </Button>
              
              {acceptanceItems.length > 0 && (
                <Button
                  onClick={() => setCurrentStep('location')}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 w-full"
                >
                  ➡️ Перейти к размещению
                </Button>
              )}
              
              <Button 
                onClick={() => {
                  if (acceptanceItems.length > 0) {
                    changeItemStatus(acceptanceItems[0].id, 'rejected');
                  }
                  setCurrentStep('scan');
                  playAcceptanceAudio('rejected');
                  setScannedCode('');
                }}
                variant="outline"
                className="px-8 py-3"
              >
                ❌ Отклонить
              </Button>
            </div>
          </div>
        )}
        
        {/* Шаг 3: Размещение */}
        {currentStep === 'location' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">
              Разместите товар в ячейку
            </h1>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
              <Package className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Размещение товара</h3>
              <p className="text-gray-600 mb-4">Поместите товар в назначенную ячейку</p>
              
              <div className="text-center space-y-2 mb-4">
                <div className="text-gray-600">
                  Товар готов к размещению в любую доступную ячейку
                </div>
                <div className="text-sm text-purple-600 bg-purple-50 rounded-lg p-3">
                  💡 <strong>Озвучка ячеек:</strong> Загрузите аудиофайлы в разделе<br/>
                  <em>Настройки → Голосовая озвучка → Приемка</em>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => {
                setCurrentStep('complete');
                playAcceptanceAudio('bulk_accepted');
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3"
            >
              📦 Товар размещен в ячейку
            </Button>
          </div>
        )}
        
        {/* Шаг 4: Завершение */}
        {currentStep === 'complete' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">
              Приемка завершена
            </h1>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Успешно!</h3>
              <p className="text-gray-600 mb-4">Товар принят и размещен</p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => {
                  setCurrentStep('box');
                  setBoxBarcode('');
                  setScannedCode('');
                  setSearchValue('');
                  setAcceptanceItems([]);
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3"
              >
                📦 Принять новую коробку
              </Button>
              
              <Button 
                onClick={analyzeAllAudioFiles}
                disabled={isAnalyzing}
                variant="outline"
                className="px-6 py-3"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Анализирую...
                  </>
                ) : (
                  <>
                    🎤 Расшифровать аудио
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 🎤 ПАНЕЛЬ РЕЗУЛЬТАТОВ АНАЛИЗА */}
      {Object.keys(audioTranscriptions).length > 0 && (
        <div className="bg-white rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            🎤 Результаты расшифровки аудио
            <span className="ml-2 text-sm bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
              {Object.keys(audioTranscriptions).length} файлов
            </span>
          </h3>
          
          <div className="grid gap-3">
            {Object.entries(audioTranscriptions).map(([audioKey, transcription]) => {
              const actionType = getActionTypeFromKey(audioKey);
              const actionEmoji = {
                'scanning': '🔍',
                'acceptance': '✅', 
                'damage': '⚠️',
                'error': '❌',
                'bulk_operation': '📦',
                'general': '🔊'
              }[actionType] || '🔊';
              
              return (
                <div key={audioKey} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-lg mr-2">{actionEmoji}</span>
                        <span className="font-medium text-gray-800">{audioKey}</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          {actionType}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">"<em>{transcription}</em>"</p>
                      
                      {/* Кнопки действий для каждой функции */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => playAcceptanceAudio(actionType)}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
                        >
                          🔊 Тест звука
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => {
                            console.log(generateFunctionCode(
                              audioKey.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
                              transcription,
                              actionType
                            ));
                          }}
                          variant="outline"
                          className="text-xs px-3 py-1"
                        >
                          📋 Показать код
                        </Button>
                        
                        {actionType === 'acceptance' && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              if (acceptanceItems.length > 0) {
                                changeItemStatus(acceptanceItems[0].id, 'accepted');
                              }
                              playAcceptanceAudio('accepted');
                            }}
                            className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 py-1"
                          >
                            ⚡ Выполнить
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Кнопка для показа всего сгенерированного кода */}
          <div className="mt-6 pt-4 border-t">
            <Button 
              onClick={() => {
                console.log('\n🎯 === ВЕСЬ СГЕНЕРИРОВАННЫЙ КОД ФУНКЦИЙ ===');
                Object.entries(audioTranscriptions).forEach(([audioKey, transcription]) => {
                  const functionName = audioKey.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                  const actionType = getActionTypeFromKey(audioKey);
                  const code = generateFunctionCode(functionName, transcription, actionType);
                  console.log(code);
                });
                console.log('\n✅ Код функций выведен в консоль!');
              }}
              variant="outline"
              className="w-full py-2"
            >
              📄 Показать весь код функций в консоли
            </Button>
          </div>
        </div>
      )}


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