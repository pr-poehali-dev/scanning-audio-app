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
  const [audioTranscriptions, setAudioTranscriptions] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  // ФИКТИВНОЕ сканирование для приемки
  const handleQRScan = (data: string) => {
    console.log('📦 === ФИКТИВНОЕ СКАНИРОВАНИЕ ПРИЕМКИ ===');
    console.log('🔍 Отсканирован код для приемки:', data);
    setScannedCode(data);
    setShowScanner(false);
    
    // Озвучиваем сканирование
    playAcceptanceAudio('item_scanned', { barcode: data });
    
    // Переходим к следующему шагу
    setCurrentStep('confirm');
    
    // Генерируем случайные данные товара
    const productNames = [
      'Смартфон Samsung Galaxy',
      'Наушники Apple AirPods',
      'Куртка зимняя Nike',
      'Кроссовки Adidas',
      'Рюкзак школьный',
      'Планшет iPad',
      'Книга "Мастер и Маргарита"',
      'Игрушка мягкая медведь'
    ];
    
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
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" className="mr-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Вернуться к приемке
        </Button>
        
        {/* Быстрые тесты озвучки */}
        <div className="flex gap-2">
          <Button 
            size="sm"
            onClick={() => playAcceptanceAudio('item_scanned')}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
            title="Тест звука сканирования"
          >
            🔍 Тест сканирования
          </Button>
          
          <Button 
            size="sm"
            onClick={() => playAcceptanceAudio('accepted')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs"
            title="Тест звука принятия"
          >
            ✅ Тест принятия
          </Button>
          
          <Button 
            size="sm"
            onClick={() => playAcceptanceAudio('damaged')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-xs"
            title="Тест звука повреждения"
          >
            ⚠️ Тест повреждения
          </Button>
        </div>
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
        {currentStep === 'scan' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">
              Отсканируйте стикер коробки
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
        
        {/* Шаг 2: Подтверждение товара */}
        {currentStep === 'confirm' && scannedCode && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">
              Подтвердите товар
            </h1>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Товар найден!</h3>
              <p className="text-gray-600 mb-4">Штрихкод: {scannedCode}</p>
              {acceptanceItems.length > 0 && (
                <p className="text-gray-800 font-medium">{acceptanceItems[0].productName}</p>
              )}
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => {
                  setCurrentStep('location');
                  playAcceptanceAudio('accepted');
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
              >
                ✅ Принять товар
              </Button>
              
              <Button 
                onClick={() => {
                  if (acceptanceItems.length > 0) {
                    changeItemStatus(acceptanceItems[0].id, 'damaged');
                  }
                  setCurrentStep('location');
                  playAcceptanceAudio('damaged');
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3"
              >
                ⚠️ Повреждено
              </Button>
              
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
              Разместите товар
            </h1>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
              <Package className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Размещение товара</h3>
              <p className="text-gray-600 mb-4">Поместите товар на стеллаж</p>
              <p className="text-gray-800 font-medium">Ячейка: {Math.floor(Math.random() * 500) + 1}</p>
            </div>
            
            <Button 
              onClick={() => {
                setCurrentStep('complete');
                playAcceptanceAudio('bulk_accepted');
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3"
            >
              📦 Товар размещен
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
                  setCurrentStep('scan');
                  setScannedCode('');
                  setSearchValue('');
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3"
              >
                📦 Принять еще товар
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