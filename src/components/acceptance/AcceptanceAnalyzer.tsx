import { Button } from '@/components/ui/button';
import { AcceptanceAnalyzerProps, AcceptanceItem } from './AcceptanceTypes';

// Анализатор аудиофайлов для приемки
const AcceptanceAnalyzer = ({
  customAudioFiles,
  audioTranscriptions,
  setAudioTranscriptions,
  isAnalyzing,
  setIsAnalyzing,
  acceptanceItems,
  changeItemStatus,
  playAcceptanceAudio
}: AcceptanceAnalyzerProps) => {

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
    
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    return fakeTranscriptions[audioKey] || `Расшифровка аудио: ${audioKey}`;
  };

  // 🎯 Создание функции на основе расшифровки
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
    const baseCode = `const ${functionName} = () => {\n  console.log('🔊 ${transcription}');\n  playAudio('${functionName}');\n`;
    
    switch (actionType) {
      case 'scanning':
        return baseCode + `  // Запуск сканирования\n  setShowScanner(true);\n  return '${transcription}';\n};`;
      case 'acceptance':
        return baseCode + `  // Принятие товара\n  setCurrentStep('location');\n  return '${transcription}';\n};`;
      case 'damage':
        return baseCode + `  // Обработка повреждения\n  markItemAsDamaged();\n  return '${transcription}';\n};`;
      case 'error':
        return baseCode + `  // Обработка ошибки\n  console.error('Ошибка в процессе приемки');\n  setCurrentStep('scan');\n  return '${transcription}';\n};`;
      case 'bulk_operation':
        return baseCode + `  // Массовая операция\n  handleBulkAccept();\n  console.log('Массовая операция выполнена');\n  return '${transcription}';\n};`;
      default:
        return baseCode + `  // Общее действие\n  console.log('Выполнено действие: ${actionType}');\n  return '${transcription}';\n};`;
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

  if (Object.keys(audioTranscriptions).length === 0) {
    return null;
  }

  return (
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
                    <span className="font-semibold text-gray-800">{audioKey}</span>
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {actionType}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 italic">"{transcription}"</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => playAcceptanceAudio(actionType)}
                      variant="outline"
                      className="text-xs px-3 py-1"
                    >
                      🔊 Тест
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
        
        <Button 
          onClick={analyzeAllAudioFiles}
          disabled={isAnalyzing}
          variant="outline"
          className="px-6 py-3 mt-4 w-full"
        >
          {isAnalyzing ? (
            <>🔄 Анализирую аудио...</>
          ) : (
            <>🎤 Анализировать аудиофайлы</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AcceptanceAnalyzer;