import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface ReceivingTabProps {
  receivingStep: number;
  receivingBarcode: string;
  onReceivingBarcodeChange: (value: string) => void;
  onReceivingStart: () => void;
  onReceivingNext: () => void;
  onReceivingReset: () => void;
}

export const ReceivingTab = ({
  receivingStep,
  receivingBarcode,
  onReceivingBarcodeChange,
  onReceivingStart,
  onReceivingNext,
  onReceivingReset
}: ReceivingTabProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-center">Приёмка товара</h1>
      
      {receivingStep === 1 && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-xl">Готовы начать приёмку?</h2>
            <Button onClick={onReceivingStart} className="bg-purple-500">
              Начать приёмку
            </Button>
          </CardContent>
        </Card>
      )}

      {receivingStep === 2 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl">Этап 1: Сканирование стикера коробки</h2>
            <Input
              placeholder="Отсканируйте или введите штрихкод"
              value={receivingBarcode}
              onChange={(e) => onReceivingBarcodeChange(e.target.value)}
            />
            <Button onClick={onReceivingNext} disabled={!receivingBarcode}>
              Далее
            </Button>
          </CardContent>
        </Card>
      )}

      {receivingStep === 3 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl">Этап 2: Проверка упаковки</h2>
            <div className="space-y-2">
              <Button onClick={onReceivingNext} className="w-full bg-green-500">
                Упаковка в порядке
              </Button>
              <Button variant="outline" className="w-full text-red-600 border-red-300">
                Упаковка повреждена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {receivingStep === 4 && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-xl text-green-600">Приёмка завершена успешно!</h2>
            <Button onClick={onReceivingReset}>
              Новая приёмка
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};