import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ReturnTabProps {
  returnStep: number;
  returnReason: string;
  onReturnStart: () => void;
  onReturnComplete: () => void;
  onReturnReasonSelect: (reason: string) => void;
  onReturnStepChange: (step: number) => void;
}

const returnReasons = [
  'Не подошёл размер',
  'Не понравился товар',
  'Брак или повреждение',
  'Другая причина'
];

export const ReturnTab = ({
  returnStep,
  returnReason,
  onReturnStart,
  onReturnComplete,
  onReturnReasonSelect,
  onReturnStepChange
}: ReturnTabProps) => {
  const handleReasonSelect = (reason: string) => {
    onReturnReasonSelect(reason);
    onReturnStepChange(3);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-center">Возврат товара</h1>
      
      {returnStep === 1 && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-xl">Готовы оформить возврат?</h2>
            <Button onClick={onReturnStart} className="bg-red-500">
              Начать возврат
            </Button>
          </CardContent>
        </Card>
      )}

      {returnStep === 2 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl">Выберите причину возврата</h2>
            <div className="space-y-2">
              {returnReasons.map((reason) => (
                <Button
                  key={reason}
                  variant="outline"
                  className="w-full text-left"
                  onClick={() => handleReasonSelect(reason)}
                >
                  {reason}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {returnStep === 3 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl">Причина: {returnReason}</h2>
            <Button onClick={onReturnComplete} className="w-full bg-red-500">
              Оформить возврат
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};