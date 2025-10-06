import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { audioStorage } from '@/utils/audioStorage';

interface CellAudioManagerProps {
  uploadedFiles: { [key: string]: string };
  setUploadedFiles: (files: { [key: string]: string }) => void;
  onTestAudio: (phraseKey: string) => void;
}

export const CellAudioManager = ({
  uploadedFiles,
  setUploadedFiles,
  onTestAudio
}: CellAudioManagerProps) => {
  const [bulkCellNumbers, setBulkCellNumbers] = useState('');
  
  const handleFileUpload = async (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await audioStorage.saveFile(key, file);
    setUploadedFiles({ ...uploadedFiles, [key]: url });
    console.log('✅', key);
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = { ...uploadedFiles };
    let uploadedCount = 0;
    const totalFiles = files.length;

    // Показываем прогресс
    const startTime = Date.now();
    console.log(`🚀 Начинаем загрузку ${totalFiles} файлов...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const match = file.name.match(/(\d+)\.(mp3|wav|ogg|m4a|mpeg)$/i);
      if (match) {
        const cellNumber = match[1];
        const key = `cell_${cellNumber}`;
        const url = await audioStorage.saveFile(key, file);
        newFiles[key] = url;
        uploadedCount++;
        
        // Лог каждые 50 файлов
        if (uploadedCount % 50 === 0) {
          console.log(`📦 Загружено ${uploadedCount}/${totalFiles}...`);
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    setUploadedFiles(newFiles);
    alert(`✅ Загружено ${uploadedCount} файлов за ${duration} сек`);
    console.log(`✅ Загрузка завершена: ${uploadedCount} файлов за ${duration} сек`);
  };

  const getCellNumbers = (): number[] => {
    if (!bulkCellNumbers.trim()) return [];
    
    const numbers: number[] = [];
    const parts = bulkCellNumbers.split(',');
    
    parts.forEach(part => {
      const trimmed = part.trim();
      
      // Диапазон (например: 1-10)
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= 482) numbers.push(i);
          }
        }
      } 
      // Одно число
      else {
        const num = parseInt(trimmed);
        if (!isNaN(num) && num >= 1 && num <= 482) {
          numbers.push(num);
        }
      }
    });
    
    return [...new Set(numbers)].sort((a, b) => a - b);
  };

  const cellNumbers = getCellNumbers();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Hash" className="w-5 h-5" />
          Озвучка номеров ячеек
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <p className="text-sm font-medium mb-2">🎯 Как работает составная озвучка:</p>
            <ul className="text-xs space-y-1">
              <li>• <strong>Шаг 1:</strong> Озвучка "goods" (goods.mp3 = "товар в ячейке")</li>
              <li>• <strong>Шаг 2:</strong> Озвучка номера ячейки (cell_123.mp3 = "сто двадцать три")</li>
              <li>• <strong>Шаг 3:</strong> Озвучка количества (count_2.mp3 = "два")</li>
              <li>• <strong>Шаг 4:</strong> Озвучка слова "товаров" (word_items.mp3 = "товаров")</li>
            </ul>
            <p className="text-xs mt-2 text-blue-600 font-medium">
              Пример: "Ячейка сто двадцать три" → "Два" → "Товаров" → "Оплата при получении"
            </p>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="common" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="common">Общие файлы</TabsTrigger>
            <TabsTrigger value="cells">Номера ячеек</TabsTrigger>
          </TabsList>

          {/* Общие файлы */}
          <TabsContent value="common" className="space-y-3">
            <Alert>
              <AlertDescription>
                <p className="text-sm font-medium mb-2">📝 Составная озвучка:</p>
                <ul className="text-xs space-y-1">
                  <li>• <strong>goods.mp3</strong> - "Товар в ячейке"</li>
                  <li>• <strong>cell_123.mp3</strong> - "Сто двадцать три"</li>
                  <li>• <strong>count_2.mp3</strong> - "Два" (просто число)</li>
                  <li>• <strong>word_items.mp3</strong> - "Товаров" (само слово)</li>
                </ul>
                <p className="text-xs mt-2 text-blue-600">
                  Будет играть: goods → cell_123 → count_2 → word_items
                </p>
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg p-3 space-y-2">
              <Label className="text-sm font-medium">Количество товаров (1-20)</Label>
              <p className="text-xs text-gray-600 mb-2">
                Загрузите файлы: count_1.mp3 ("один товар"), count_2.mp3 ("два товара") и т.д.
              </p>
              <Input
                type="file"
                accept=".mp3,.wav,.m4a,.ogg,.mpeg"
                multiple
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files) return;
                  
                  let uploadedCount = 0;
                  const newFiles = { ...uploadedFiles };
                  
                  for (const file of Array.from(files)) {
                    const match = file.name.match(/count_(\d+)\.(mp3|wav|ogg|m4a|mpeg)$/i);
                    if (match) {
                      const count = match[1];
                      const key = `count_${count}`;
                      const url = await audioStorage.saveFile(key, file);
                      newFiles[key] = url;
                      uploadedCount++;
                    }
                  }
                  
                  setUploadedFiles(newFiles);
                  if (uploadedCount > 0) {
                    alert(`Загружено ${uploadedCount}`);
                  }
                }}
              />
              <div className="text-xs text-gray-500 mt-1">
                Загружено: {Object.keys(uploadedFiles).filter(k => k.startsWith('count_')).length} файлов
              </div>
            </div>

            <div className="border rounded-lg p-3 space-y-2">
              <Label className="text-sm font-medium">Слово "товаров"</Label>
              <p className="text-xs text-gray-600 mb-2">
                Озвучка слова "товаров" для составной фразы (например: "два товаров")
              </p>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,.mpeg"
                  onChange={(e) => handleFileUpload('word_items', e)}
                  className="flex-1"
                />
                {uploadedFiles['word_items'] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTestAudio('word_items')}
                  >
                    <Icon name="Play" className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {uploadedFiles['word_items'] && (
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <Icon name="Check" className="w-3 h-3" />
                  Файл загружен
                </div>
              )}
            </div>

            <div className="border rounded-lg p-3 space-y-2">
              <Label className="text-sm font-medium">Оплата при получении</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,.mpeg"
                  onChange={(e) => handleFileUpload('payment_on_delivery', e)}
                  className="flex-1"
                />
                {uploadedFiles['payment_on_delivery'] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTestAudio('payment_on_delivery')}
                  >
                    <Icon name="Play" className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {uploadedFiles['payment_on_delivery'] && (
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <Icon name="Check" className="w-3 h-3" />
                  Файл загружен
                </div>
              )}
            </div>
          </TabsContent>

          {/* Номера ячеек */}
          <TabsContent value="cells" className="space-y-3">
            {/* Массовая загрузка */}
            <div className="border rounded-lg p-3 space-y-3 bg-blue-50">
              <div>
                <Label className="text-sm font-medium">📱 Массовая загрузка ячеек</Label>
                <p className="text-xs text-gray-600 mt-1">
                  Выберите СРАЗУ ВСЕ файлы с названиями: 1.mp3, 2.mp3, 3.mp3 ... 482.mp3
                </p>
              </div>
              
              <Input
                type="file"
                accept=".mp3,.wav,.m4a,.ogg,.mpeg"
                multiple
                onChange={handleBulkUpload}
              />
              
              <Alert className="bg-white">
                <AlertDescription>
                  <p className="text-xs font-medium mb-1">💡 Как загрузить на телефоне:</p>
                  <ol className="text-xs space-y-1 ml-3 list-decimal">
                    <li>Нажмите на кнопку выбора файлов выше</li>
                    <li>Выберите ВСЕ файлы сразу (нажмите "Выбрать" → выберите все)</li>
                    <li>Файлы должны называться: 1.mp3, 2.mp3, 3.mp3 и т.д.</li>
                    <li>Загрузка может занять 1-2 минуты</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>

            {/* Выбор номеров для отображения */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Показать номера ячеек (через запятую или диапазон)
              </Label>
              <Input
                placeholder="Например: 1-10, 15, 20-30, 100"
                value={bulkCellNumbers}
                onChange={(e) => setBulkCellNumbers(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                {cellNumbers.length > 0 
                  ? `Будет показано ${cellNumbers.length} ячеек`
                  : 'Введите номера для отображения'}
              </p>
            </div>

            {/* Список ячеек */}
            {cellNumbers.length > 0 && (
              <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-3">
                {cellNumbers.map(num => (
                  <div key={num} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium min-w-[60px]">
                      Ячейка {num}
                    </span>
                    <Input
                      type="file"
                      accept=".mp3,.wav,.m4a,.ogg,.mpeg"
                      onChange={(e) => handleFileUpload(`cell_${num}`, e)}
                      className="flex-1 text-xs"
                    />
                    {uploadedFiles[`cell_${num}`] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTestAudio(`cell_${num}`)}
                      >
                        <Icon name="Play" className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {cellNumbers.length === 0 && (
              <Alert>
                <AlertDescription className="text-sm">
                  Введите номера ячеек выше, чтобы загрузить для них озвучку
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        {/* Статистика */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1 text-sm">
          <div className="font-medium text-green-800">📊 Статистика загруженных файлов:</div>
          <div className="text-xs text-green-700">
            • Номеров ячеек: {Object.keys(uploadedFiles).filter(k => k.startsWith('cell_')).length}
          </div>
          <div className="text-xs text-green-700">
            • Количество товаров: {Object.keys(uploadedFiles).filter(k => k.startsWith('count_')).length}
          </div>
          <div className="text-xs text-green-700">
            • Файл "goods": {uploadedFiles['goods'] ? '✅' : '❌'}
          </div>
          <div className="text-xs text-green-700">
            • Слово "товаров": {uploadedFiles['word_items'] ? '✅' : '❌'}
          </div>
          <div className="text-xs text-green-700">
            • Оплата при получении: {uploadedFiles['payment_on_delivery'] ? '✅' : '❌'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};