import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

export const AudioUploadGuide = () => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Icon name="Info" className="w-5 h-5" />
          Как добавить озвучку
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert className="bg-white">
          <AlertDescription className="space-y-2">
            <p className="font-medium">Вариант 1: Загрузка через интерфейс</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Нажмите кнопку "Выбрать файл" рядом с нужной фразой</li>
              <li>Выберите ваш MP3 файл</li>
              <li>Включите переключатель справа</li>
              <li>Нажмите кнопку Play для проверки</li>
            </ol>
          </AlertDescription>
        </Alert>

        <Alert className="bg-white">
          <AlertDescription className="space-y-2">
            <p className="font-medium">Вариант 2: Названия файлов</p>
            <div className="text-sm space-y-2">
              <div>
                <strong className="text-purple-700">Вариант озвучки 1:</strong>
                <ul className="ml-4 mt-1 space-y-0.5 text-xs">
                  <li>• Ячейки: <code className="bg-gray-100 px-1 rounded">cell_v1_1.mp3 ... cell_v1_482.mp3</code></li>
                  <li>• Фразы: <code className="bg-gray-100 px-1 rounded">goods.mp3, payment_on_delivery.mp3, please_check_good_under_camera.mp3, thanks_for_order_rate_pickpoint.mp3</code></li>
                </ul>
              </div>
              <div>
                <strong className="text-purple-700">Вариант озвучки 2:</strong>
                <ul className="ml-4 mt-1 space-y-0.5 text-xs">
                  <li>• Ячейки: <code className="bg-gray-100 px-1 rounded">cell_v2_1.mp3 ... cell_v2_482.mp3</code></li>
                  <li>• Фразы: <code className="bg-gray-100 px-1 rounded">checkWBWallet.mp3, scanAfterQrClient.mp3, askRatePickPoint.mp3</code></li>
                </ul>
              </div>
              <p className="text-xs text-gray-600 mt-2">💡 При массовой загрузке можно использовать просто числа: 1.mp3, 2.mp3... - система автоматически добавит префикс текущего варианта</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800 font-medium">
            ✅ Все настройки сохраняются автоматически в вашем браузере
          </p>
        </div>
      </CardContent>
    </Card>
  );
};