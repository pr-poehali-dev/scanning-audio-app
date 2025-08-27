import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ReceivingTabProps {
  receivingStep: number;
  barcode: string;
  setBarcode: (barcode: string) => void;
  cellNumber: number;
  handleReceivingNext: () => void;
  handleReceivingStart: () => void;
  playAudio: (message: string, priority?: 'high' | 'normal') => void;
}

export const ReceivingTab = ({
  receivingStep,
  barcode,
  setBarcode,
  cellNumber,
  handleReceivingNext,
  handleReceivingStart,
  playAudio
}: ReceivingTabProps) => {
  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <CardContent className="text-center space-y-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2"
            onClick={() => playAudio('Возвращаемся к приемке')}
          >
            <Icon name="ArrowLeft" />
            <span>Вернуться к приемке</span>
          </Button>
          <Badge className="bg-purple-100 text-purple-700">
            Шаг {receivingStep} из 4
          </Badge>
        </div>
        
        <div className="flex justify-center space-x-8 mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
                  step <= receivingStep ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-1 mx-2 rounded transition-all ${
                    step < receivingStep ? 'bg-purple-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {receivingStep === 1 && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Отсканируйте стикер коробки
            </h2>
            
            <div className="w-64 h-64 mx-auto bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center mb-6 cursor-pointer hover:bg-purple-100 transition-colors"
                 onClick={handleReceivingNext}>
              <div className="w-32 h-32 border-4 border-purple-500 rounded-lg flex items-center justify-center">
                <Icon name="QrCode" size={64} className="text-purple-500" />
              </div>
            </div>

            <div className="text-gray-500 mb-4">или</div>
            
            <div className="flex space-x-2 max-w-md mx-auto">
              <Input
                placeholder="89585787658"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onFocus={() => playAudio('Поле ввода штрих-кода')}
              />
              <Button 
                onClick={handleReceivingNext}
                className="bg-purple-500 hover:bg-purple-600"
                disabled={!barcode}
              >
                <Icon name="Search" />
              </Button>
            </div>
          </>
        )}

        {receivingStep === 2 && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Проверьте целостность упаковки
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <Icon name="CheckCircle" className="text-green-500 mx-auto mb-2" size={48} />
                <p className="text-green-700">Упаковка в хорошем состоянии</p>
              </div>
              <div className="flex space-x-4 justify-center">
                <Button 
                  className="bg-green-500 hover:bg-green-600"
                  onClick={handleReceivingNext}
                >
                  Упаковка целая
                </Button>
                <Button 
                  variant="outline"
                  className="border-red-300 text-red-600"
                  onClick={() => playAudio('Упаковка повреждена, требуется проверка')}
                >
                  Повреждения
                </Button>
              </div>
            </div>
          </>
        )}

        {receivingStep === 3 && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Разместите товар в ячейке
            </h2>
            <div className="bg-purple-50 rounded-lg p-8 mb-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {cellNumber + 1}
              </div>
              <p className="text-purple-700">Рекомендуемая ячейка</p>
            </div>
            <Button 
              className="bg-purple-500 hover:bg-purple-600 w-full py-3"
              onClick={handleReceivingNext}
            >
              Товар размещен
            </Button>
          </>
        )}

        {receivingStep === 4 && (
          <>
            <div className="text-green-500 mb-4">
              <Icon name="CheckCircle" size={64} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Приемка завершена успешно!
            </h2>
            <Button 
              className="bg-purple-500 hover:bg-purple-600"
              onClick={() => {
                setBarcode('');
                handleReceivingStart();
              }}
            >
              Принять следующий товар
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};