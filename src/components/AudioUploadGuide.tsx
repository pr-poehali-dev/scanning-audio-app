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
            <p className="font-medium">Вариант 2: Добавление файлов в проект</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Поместите MP3 файлы в папку <code className="bg-gray-100 px-1 rounded">/public/audio/</code></li>
              <li>Используйте названия:
                <ul className="ml-4 mt-1 space-y-0.5 text-xs">
                  <li><code className="bg-gray-100 px-1 rounded">cell-info.mp3</code> - Информация о ячейке</li>
                  <li><code className="bg-gray-100 px-1 rounded">check-product.mp3</code> - Проверка товара</li>
                  <li><code className="bg-gray-100 px-1 rounded">thanks.mp3</code> - Благодарность</li>
                </ul>
              </li>
              <li>Обновите страницу</li>
              <li>Включите переключатели для нужных фраз</li>
            </ol>
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
