import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { audioStorage } from '@/utils/audioStorage';

interface TTSGeneratorProps {
  uploadedFiles: { [key: string]: string };
  setUploadedFiles: (files: { [key: string]: string }) => void;
}

export const TTSGenerator = ({ uploadedFiles, setUploadedFiles }: TTSGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const textToAudioBlob = async (text: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      const chunks: BlobPart[] = [];
      const mediaRecorder = new MediaRecorder(new MediaStream());

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        resolve(new Blob(chunks, { type: 'audio/webm' }));
      };

      utterance.onend = () => {
        mediaRecorder.stop();
      };

      utterance.onerror = (err) => {
        reject(err);
      };

      mediaRecorder.start();
      speechSynthesis.speak(utterance);
    });
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generateAllAudio = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    const newFiles = { ...uploadedFiles };
    const totalFiles = 482 + 20 + 2; // ячейки + количество + общие

    let processed = 0;

    try {
      // 1. Генерация общих фраз
      setStatus('Генерация общих фраз...');
      
      const wordItemsBlob = await textToAudioBlob('товаров');
      newFiles['word-items'] = await blobToBase64(wordItemsBlob);
      await audioStorage.saveFile('word-items', new File([wordItemsBlob], 'word-items.webm'));
      processed++;
      setProgress(Math.round((processed / totalFiles) * 100));

      const paymentBlob = await textToAudioBlob('оплата при получении');
      newFiles['payment_on_delivery'] = await blobToBase64(paymentBlob);
      await audioStorage.saveFile('payment_on_delivery', new File([paymentBlob], 'payment_on_delivery.webm'));
      processed++;
      setProgress(Math.round((processed / totalFiles) * 100));

      // 2. Генерация количества (1-20)
      setStatus('Генерация чисел для количества...');
      for (let i = 1; i <= 20; i++) {
        const text = String(i);
        const blob = await textToAudioBlob(text);
        newFiles[`count-${i}`] = await blobToBase64(blob);
        await audioStorage.saveFile(`count-${i}`, new File([blob], `count-${i}.webm`));
        processed++;
        if (processed % 5 === 0) {
          setProgress(Math.round((processed / totalFiles) * 100));
        }
      }

      // 3. Генерация номеров ячеек (1-482)
      setStatus('Генерация номеров ячеек (это займет 3-5 минут)...');
      for (let i = 1; i <= 482; i++) {
        const text = String(i);
        const blob = await textToAudioBlob(text);
        newFiles[`cell-${i}`] = await blobToBase64(blob);
        await audioStorage.saveFile(`cell-${i}`, new File([blob], `cell-${i}.webm`));
        processed++;
        if (processed % 10 === 0) {
          setProgress(Math.round((processed / totalFiles) * 100));
          setStatus(`Генерация ячеек: ${i}/482...`);
        }
      }

      setUploadedFiles(newFiles);
      setStatus('✅ Готово! Озвучка сгенерирована');
      setProgress(100);
    } catch (error) {
      console.error('Ошибка генерации:', error);
      setStatus('❌ Ошибка генерации озвучки');
    } finally {
      setIsGenerating(false);
    }
  };

  const cellCount = Object.keys(uploadedFiles).filter(k => k.startsWith('cell-')).length;
  const countCount = Object.keys(uploadedFiles).filter(k => k.startsWith('count-')).length;
  const hasWordItems = !!uploadedFiles['word-items'];
  const hasPayment = !!uploadedFiles['payment_on_delivery'];

  const isComplete = cellCount === 482 && countCount >= 20 && hasWordItems && hasPayment;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Mic" className="w-5 h-5" />
          Автогенерация озвучки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <p className="text-sm font-medium mb-2">🤖 Автоматическая генерация</p>
            <p className="text-xs">
              Браузер автоматически создаст озвучку всех 482 ячеек + количество товаров + общие фразы.
              Это займет 3-5 минут. Озвучка будет сохранена в памяти телефона.
            </p>
          </AlertDescription>
        </Alert>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <div className="text-sm font-medium">📊 Текущий прогресс:</div>
          <div className="text-xs space-y-1">
            <div>• Ячейки: {cellCount}/482</div>
            <div>• Количество: {countCount}/20</div>
            <div>• Слово "товаров": {hasWordItems ? '✅' : '❌'}</div>
            <div>• Оплата: {hasPayment ? '✅' : '❌'}</div>
          </div>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="text-sm font-medium">{status}</div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-center text-gray-600">{progress}%</div>
          </div>
        )}

        <Button
          onClick={generateAllAudio}
          disabled={isGenerating || isComplete}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
              Генерация... {progress}%
            </>
          ) : isComplete ? (
            <>
              <Icon name="Check" className="w-4 h-4 mr-2" />
              Озвучка готова
            </>
          ) : (
            <>
              <Icon name="Mic" className="w-4 h-4 mr-2" />
              Сгенерировать озвучку
            </>
          )}
        </Button>

        {isComplete && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription>
              <div className="flex items-center gap-2 text-green-800">
                <Icon name="CheckCircle" className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Озвучка готова! Теперь можно использовать приложение
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertDescription>
            <p className="text-xs text-gray-600">
              ⚠️ Озвучка генерируется голосом браузера. Для профессиональной озвучки загрузите свои файлы через компьютер.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};