import { CheckCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AcceptanceStepsProps } from './AcceptanceTypes';

// Компонент индикатора этапа
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
const QRCodeDisplay = ({ handleQRScan }: { handleQRScan: (data: string) => void }) => (
  <div className="flex justify-center mb-8">
    <div className="w-48 h-48 bg-white border-4 border-purple-200 rounded-xl p-4 flex items-center justify-center">
      <div
        onClick={() => {
          // ФИКТИВНОЕ сканирование при клике на QR-код
          const fakeBarcode = `${Date.now().toString().slice(-8)}`;
          console.log('🔍 КЛИК ПО QR-КОДУ - запуск фиктивного сканирования');
          setTimeout(() => {
            handleQRScan(fakeBarcode);
          }, 500);
        }}
        className="w-full h-full bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors flex items-center justify-center"
        title="Кликните для фиктивного сканирования"
      >
        <div className="text-white text-center text-sm">
          <div className="mb-2">📱</div>
          <div>Тапните для сканирования</div>
        </div>
      </div>
    </div>
  </div>
);

// Основной компонент этапов приемки
const AcceptanceSteps = ({
  currentStep,
  setCurrentStep,
  boxBarcode,
  acceptanceItems,
  setShowScanner,
  searchValue,
  setSearchValue,
  handleQRScan,
  playAcceptanceAudio,
  setAcceptanceItems
}: AcceptanceStepsProps) => {

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      {/* Степпер */}
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
          <QRCodeDisplay handleQRScan={handleQRScan} />

          <div className="space-y-4">
            <Button
              onClick={() => setShowScanner(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3"
            >
              📱 Открыть сканер
            </Button>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Input
                  placeholder="Или введите код вручную"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="max-w-xs"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (searchValue.trim()) {
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
          </div>
        </div>
      )}
      
      {/* Шаг 3: Размещение товара */}
      {currentStep === 'location' && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">
            Размещение товара
          </h1>
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
                setAcceptanceItems([]);
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3"
            >
              📦 Принять новую коробку
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptanceSteps;