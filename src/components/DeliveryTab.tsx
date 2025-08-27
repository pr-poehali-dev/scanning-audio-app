import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface DeliveryTabProps {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  secondPhone: string;
  setSecondPhone: (phone: string) => void;
  isScanning: boolean;
  cellNumber: number;
  scannedProducts: number;
  totalProducts: number;
  handleQRScan: () => void;
  handleConfirmCode: () => void;
  handleTryOn: () => void;
  handleIssue: () => void;
  playAudio: (audioKey: string, priority?: 'high' | 'normal') => void;
}

export const DeliveryTab = ({
  phoneNumber,
  setPhoneNumber,
  secondPhone,
  setSecondPhone,
  isScanning,
  cellNumber,
  scannedProducts,
  totalProducts,
  handleQRScan,
  handleConfirmCode,
  handleTryOn,
  handleIssue,
  playAudio
}: DeliveryTabProps) => {
  const mockProducts = [
    {
      id: '164667827',
      article: '4569',
      name: 'ТЕЛОДВИЖЕНИЯ / Лонгслив женский...',
      size: 'Серый',
      color: 'Серый',
      barcode: '485748574758',
      image: '/api/placeholder/80/80',
      scanned: false
    },
    {
      id: '164667828',
      article: '4570',
      name: 'ТЕЛОДВИЖЕНИЯ / Свитшот женский...',
      size: 'Черный',
      color: 'Черный', 
      barcode: '485748574759',
      image: '/api/placeholder/80/80',
      scanned: false
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* QR Scanner Section */}
      <Card className="p-8">
        <CardContent className="text-center space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Отсканируйте QR-код клиента
          </h2>
          
          <div className="relative cursor-pointer" onClick={handleQRScan}>
            <img 
              src="https://cdn.poehali.dev/files/3f883f17-7be0-4384-a434-f809f2537323.png"
              alt="QR Scanner"
              className="w-64 h-48 mx-auto object-contain hover:scale-105 transition-transform"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-purple-500 bg-opacity-20 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-purple-700 font-medium">Сканирование...</div>
              </div>
            )}
          </div>

          <div className="text-gray-500">или</div>
          
          <div className="space-y-4">
            <p className="text-gray-700">Введите номер телефона клиента</p>
            <div className="flex space-x-2">
              <Input
                placeholder="4456"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onFocus={() => playAudio('input-focus')}
                className="flex-1"
              />
              <Button 
                onClick={handleConfirmCode}
                className="bg-purple-500 hover:bg-purple-600 px-8"
                disabled={!phoneNumber}
              >
                <Icon name="ChevronRight" className="text-white" />
              </Button>
            </div>
            <Input
              placeholder="967898"
              value={secondPhone}
              onChange={(e) => setSecondPhone(e.target.value)}
              onFocus={() => playAudio('input-focus')}
            />
            <Button 
              onClick={handleConfirmCode}
              className="w-full bg-purple-500 hover:bg-purple-600 py-3"
              disabled={!phoneNumber}
            >
              Подтвердить код
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card className="p-6">
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              Отсканируйте товары перед примеркой: {scannedProducts} из {totalProducts}
            </h3>
            <Button variant="ghost" size="sm">
              <Icon name="ArrowLeft" className="text-gray-400" />
            </Button>
          </div>
          
          <Progress value={(scannedProducts / totalProducts) * 100} className="mb-4" />
          
          <div className="bg-gray-100 rounded-lg p-8 text-center mb-6">
            <div className="text-6xl font-bold text-gray-700 mb-2">
              {cellNumber}
            </div>
            <div className="text-gray-500">Ячейка:</div>
          </div>

          <div className="space-y-4">
            {mockProducts.map((product) => (
              <div key={product.id} className={`flex items-center space-x-4 p-4 border rounded-lg transition-all ${
                product.scanned ? 'bg-green-50 border-green-200' : 'bg-white'
              }`}>
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Icon name="Package" className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{product.id} {product.article}</div>
                  <div className="text-sm text-gray-600">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    Размер: {product.size} Цвет: {product.color}
                  </div>
                  <div className="text-xs text-gray-400">
                    Баркод: {product.barcode}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => playAudio('button-click')}
                  >
                    Не сканировать
                  </Button>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-purple-500"
                      onClick={handleTryOn}
                    >
                      На примерке
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleIssue}
                    >
                      Выдать
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button 
            className="w-full mt-6 bg-purple-500 hover:bg-purple-600"
            onClick={() => playAudio('button-click')}
          >
            Пропустить всё
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};