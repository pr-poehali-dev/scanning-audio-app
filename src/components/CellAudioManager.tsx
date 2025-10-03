import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

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
  
  const handleFileUpload = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newFiles = { ...uploadedFiles, [key]: url };
    setUploadedFiles(newFiles);
    
    localStorage.setItem('wb-pvz-audio-files', JSON.stringify(newFiles));
  };

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = { ...uploadedFiles };
    let uploadedCount = 0;

    Array.from(files).forEach(file => {
      // Извлекаем номер из имени файла (например: "123.mp3" или "cell_123.mp3")
      const match = file.name.match(/(\d+)\.mp3$/i);
      if (match) {
        const cellNumber = match[1];
        const url = URL.createObjectURL(file);
        newFiles[`cell-${cellNumber}`] = url;
        uploadedCount++;
      }
    });

    setUploadedFiles(newFiles);
    localStorage.setItem('wb-pvz-audio-files', JSON.stringify(newFiles));
    alert(`Загружено ${uploadedCount} файлов ячеек`);
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
            <p className="text-sm font-medium mb-2">Как это работает:</p>
            <ul className="text-xs space-y-1">
              <li>• Загрузите озвучку для каждого номера ячейки (1-482)</li>
              <li>• Загрузите озвучку слова "товары" или "товаров"</li>
              <li>• При выдаче будет проигрываться: "ячейка_123.mp3" + "товары.mp3"</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="common" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="common">Общие файлы</TabsTrigger>
            <TabsTrigger value="cells">Номера ячеек</TabsTrigger>
          </TabsList>

          {/* Общие файлы */}
          <TabsContent value="common" className="space-y-3">
            <div className="border rounded-lg p-3 space-y-2">
              <Label className="text-sm font-medium">Слово "товары" / "товаров"</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload('word-tovary', e)}
                  className="flex-1"
                />
                {uploadedFiles['word-tovary'] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTestAudio('word-tovary')}
                  >
                    <Icon name="Play" className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-3 space-y-2">
              <Label className="text-sm font-medium">Оплата при получении</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload('payment-cod', e)}
                  className="flex-1"
                />
                {uploadedFiles['payment-cod'] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTestAudio('payment-cod')}
                  >
                    <Icon name="Play" className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Номера ячеек */}
          <TabsContent value="cells" className="space-y-3">
            {/* Массовая загрузка */}
            <div className="border rounded-lg p-3 space-y-2 bg-blue-50">
              <Label className="text-sm font-medium">Массовая загрузка ячеек</Label>
              <p className="text-xs text-gray-600">
                Выберите несколько MP3 файлов с названиями: 1.mp3, 2.mp3, 123.mp3 и т.д.
              </p>
              <Input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleBulkUpload}
              />
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
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(`cell-${num}`, e)}
                      className="flex-1 text-xs"
                    />
                    {uploadedFiles[`cell-${num}`] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTestAudio(`cell-${num}`)}
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
            • Номеров ячеек: {Object.keys(uploadedFiles).filter(k => k.startsWith('cell-')).length}
          </div>
          <div className="text-xs text-green-700">
            • Слово "товары": {uploadedFiles['word-tovary'] ? '✅' : '❌'}
          </div>
          <div className="text-xs text-green-700">
            • Оплата при получении: {uploadedFiles['payment-cod'] ? '✅' : '❌'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
