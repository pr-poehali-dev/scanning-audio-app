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

  const generateAllAudio = async (variant: 'v1' | 'v2') => {
    setIsGenerating(true);
    setProgress(0);
    
    const newFiles = { ...uploadedFiles };
    const totalFiles = 482 + 20 + 4; // ячейки + количество + общие

    let processed = 0;

    try {
      // 1. Генерация общих фраз
      setStatus('Генерация общих фраз...');
      
      const wordItemsBlob = await textToAudioBlob('товаров');
      newFiles['word_items'] = await blobToBase64(wordItemsBlob);
      await audioStorage.saveFile('word_items', new File([wordItemsBlob], 'word_items.webm'));
      processed++;
      setProgress(Math.round((processed / totalFiles) * 100));

      if (variant === 'v1') {
        const goodsBlob = await textToAudioBlob('товары');
        newFiles['goods'] = await blobToBase64(goodsBlob);
        await audioStorage.saveFile('goods', new File([goodsBlob], 'goods.webm'));
        processed++;
        setProgress(Math.round((processed / totalFiles) * 100));

        const paymentBlob = await textToAudioBlob('оплата при получении');
        newFiles['payment_on_delivery'] = await blobToBase64(paymentBlob);
        await audioStorage.saveFile('payment_on_delivery', new File([paymentBlob], 'payment_on_delivery.webm'));
        processed++;
        setProgress(Math.round((processed / totalFiles) * 100));
      } else {
        const goodsDiscountBlob = await textToAudioBlob('товары со скидкой проверьте вайлдберриз кошелёк');
        newFiles['goods'] = await blobToBase64(goodsDiscountBlob);
        await audioStorage.saveFile('goods', new File([goodsDiscountBlob], 'goods.webm'));
        processed++;
        setProgress(Math.round((processed / totalFiles) * 100));

        const paymentBlob = await textToAudioBlob('пожалуйста оплатите товар');
        newFiles['payment_on_delivery'] = await blobToBase64(paymentBlob);
        await audioStorage.saveFile('payment_on_delivery', new File([paymentBlob], 'payment_on_delivery.webm'));
        processed++;
        setProgress(Math.round((processed / totalFiles) * 100));
      }

      const checkProductBlob = await textToAudioBlob('пожалуйста проверьте товар под камерой');
      newFiles['please_check_good_under_camera'] = await blobToBase64(checkProductBlob);
      await audioStorage.saveFile('please_check_good_under_camera', new File([checkProductBlob], 'please_check_good_under_camera.webm'));
      processed++;
      setProgress(Math.round((processed / totalFiles) * 100));

      const thanksBlob = await textToAudioBlob('пожалуйста оцените наш пункт выдачи в приложении');
      newFiles['thanks_for_order_rate_pickpoint'] = await blobToBase64(thanksBlob);
      await audioStorage.saveFile('thanks_for_order_rate_pickpoint', new File([thanksBlob], 'thanks_for_order_rate_pickpoint.webm'));
      processed++;
      setProgress(Math.round((processed / totalFiles) * 100));

      // 2. Генерация количества (1-20)
      setStatus('Генерация чисел для количества...');
      for (let i = 1; i <= 20; i++) {
        const text = String(i);
        const blob = await textToAudioBlob(text);
        newFiles[`count_${i}`] = await blobToBase64(blob);
        await audioStorage.saveFile(`count_${i}`, new File([blob], `count_${i}.webm`));
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
        newFiles[`cell_${i}`] = await blobToBase64(blob);
        await audioStorage.saveFile(`cell_${i}`, new File([blob], `cell_${i}.webm`));
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

  const cellCount = Object.keys(uploadedFiles).filter(k => k.startsWith('cell_')).length;
  const countCount = Object.keys(uploadedFiles).filter(k => k.startsWith('count_')).length;
  const hasWordItems = !!uploadedFiles['word_items'];
  const hasPayment = !!uploadedFiles['payment_on_delivery'];
  const hasGoods = !!uploadedFiles['goods'];
  const hasCheckProduct = !!uploadedFiles['please_check_good_under_camera'];
  const hasThanks = !!uploadedFiles['thanks_for_order_rate_pickpoint'];

  const isComplete = cellCount === 482 && countCount >= 20 && hasWordItems && hasPayment && hasGoods && hasCheckProduct && hasThanks;

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
            <div>• Товары/скидки: {hasGoods ? '✅' : '❌'}</div>
            <div>• Оплата: {hasPayment ? '✅' : '❌'}</div>
            <div>• Проверка товара: {hasCheckProduct ? '✅' : '❌'}</div>
            <div>• Оцените ПВЗ: {hasThanks ? '✅' : '❌'}</div>
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

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => generateAllAudio('v1')}
            disabled={isGenerating || isComplete}
            className="w-full"
            size="lg"
            variant="outline"
          >
            {isGenerating ? (
              <>
                <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                {progress}%
              </>
            ) : isComplete ? (
              <>
                <Icon name="Check" className="w-4 h-4 mr-2" />
                Готово
              </>
            ) : (
              <>
                <Icon name="Mic" className="w-4 h-4 mr-2" />
                Вариант 1
              </>
            )}
          </Button>
          <Button
            onClick={() => generateAllAudio('v2')}
            disabled={isGenerating || isComplete}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                {progress}%
              </>
            ) : isComplete ? (
              <>
                <Icon name="Check" className="w-4 h-4 mr-2" />
                Готово
              </>
            ) : (
              <>
                <Icon name="Mic" className="w-4 h-4 mr-2" />
                Вариант 2
              </>
            )}
          </Button>
        </div>
        
        <Alert className="bg-gray-50">
          <AlertDescription>
            <div className="text-xs space-y-1">
              <div><strong>Вариант 1:</strong> "товары" + "оплата при получении"</div>
              <div><strong>Вариант 2:</strong> "товары со скидкой проверьте ВБ кошелёк" + "пожалуйста оплатите товар"</div>
            </div>
          </AlertDescription>
        </Alert>

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