import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ReturnTabProps {
  handleReturnStart: () => void;
  playAudio: (audioKey: string, priority?: 'high' | 'normal') => void;
}

export const ReturnTab = ({ handleReturnStart, playAudio }: ReturnTabProps) => {
  const returnReasons = [
    'Не подошел размер',
    'Дефект товара',
    'Не соответствует описанию',
    'Передумал покупать',
    'Другая причина'
  ];

  return (
    <Card className="p-8 max-w-4xl mx-auto">
      <CardContent className="text-center space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Возврат товаров
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-left">Отсканируйте товар</h3>
            <div className="w-full h-48 bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors"
                 onClick={handleReturnStart}>
              <Icon name="RotateCcw" size={64} className="text-purple-400" />
            </div>
            
            <div className="text-gray-500">или</div>
            
            <Input
              placeholder="Введите штрих-код товара"
              onFocus={() => playAudio('input-focus')}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-left">Причина возврата</h3>
            <div className="space-y-2">
              {returnReasons.map((reason) => (
                <Button
                  key={reason}
                  variant="outline"
                  className="w-full text-left justify-start"
                  onClick={() => playAudio('button-click')}
                >
                  {reason}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t">
          <Button 
            className="bg-purple-500 hover:bg-purple-600 w-full py-3"
            onClick={() => playAudio('return-complete', 'high')}
          >
            Оформить возврат
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};