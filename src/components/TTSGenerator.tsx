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
    const phrasesCount = variant === 'v1' ? 4 : 3; // v1: 4 фразы, v2: 3 фразы
    const totalFiles = 482 + phrasesCount; // ячейки + фразы (без count)

    let processed = 0;

    try {
      // 1. Генерация фраз для выбранного варианта
      setStatus('Генерация фраз...');

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
      } else {
        const checkWBWalletBlob = await textToAudioBlob('проверьте вайлдберриз кошелёк');
        newFiles['checkWBWallet'] = await blobToBase64(checkWBWalletBlob);
        await audioStorage.saveFile('checkWBWallet', new File([checkWBWalletBlob], 'checkWBWallet.webm'));
        processed++;
        setProgress(Math.round((processed / totalFiles) * 100));

        const scanAfterQrBlob = await textToAudioBlob('отсканируйте после кюар клиента');
        newFiles['scanAfterQrClient'] = await blobToBase64(scanAfterQrBlob);
        await audioStorage.saveFile('scanAfterQrClient', new File([scanAfterQrBlob], 'scanAfterQrClient.webm'));
        processed++;
        setProgress(Math.round((processed / totalFiles) * 100));

        const askRateBlob = await textToAudioBlob('оцените пункт выдачи');
        newFiles['askRatePickPoint'] = await blobToBase64(askRateBlob);
        await audioStorage.saveFile('askRatePickPoint', new File([askRateBlob], 'askRatePickPoint.webm'));
        processed++;
        setProgress(Math.round((processed / totalFiles) * 100));
      }

      // 2. Генерация номеров ячеек (1-482) - для каждого варианта своя озвучка
      setStatus('Генерация номеров ячеек (это займет 3-5 минут)...');
      const cellPrefix = variant === 'v1' ? 'cell_v1_' : 'cell_v2_';
      for (let i = 1; i <= 482; i++) {
        const text = String(i);
        const blob = await textToAudioBlob(text);
        newFiles[`${cellPrefix}${i}`] = await blobToBase64(blob);
        await audioStorage.saveFile(`${cellPrefix}${i}`, new File([blob], `${cellPrefix}${i}.webm`));
        processed++;
        if (processed % 10 === 0) {
          setProgress(Math.round((processed / totalFiles) * 100));
          setStatus(`Генерация ячеек (${variant}): ${i}/482...`);
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

  const cellV1Count = Object.keys(uploadedFiles).filter(k => k.startsWith('cell_v1_')).length;
  const cellV2Count = Object.keys(uploadedFiles).filter(k => k.startsWith('cell_v2_')).length;
  
  // Вариант 1
  const hasGoods = !!uploadedFiles['goods'];
  const hasPayment = !!uploadedFiles['payment_on_delivery'];
  const hasCheckProduct = !!uploadedFiles['please_check_good_under_camera'];
  const hasThanks = !!uploadedFiles['thanks_for_order_rate_pickpoint'];
  
  // Вариант 2
  const hasCheckWBWallet = !!uploadedFiles['checkWBWallet'];
  const hasScanAfterQr = !!uploadedFiles['scanAfterQrClient'];
  const hasAskRate = !!uploadedFiles['askRatePickPoint'];

  const isV1Complete = cellV1Count === 482 && hasPayment && hasGoods && hasCheckProduct && hasThanks;
  const isV2Complete = cellV2Count === 482 && hasCheckWBWallet && hasScanAfterQr && hasAskRate;

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
              Браузер автоматически создаст озвучку 482 ячеек + специальные фразы для выбранного варианта.
              Это займет 3-5 минут. Озвучка сохраняется локально.
            </p>
          </AlertDescription>
        </Alert>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <div className="text-sm font-medium">📊 Текущий прогресс:</div>
          <div className="text-xs space-y-1">
            <div className="font-semibold mt-2">Вариант 1:</div>
            <div className="ml-2">• Ячейки v1: {cellV1Count}/482</div>
            <div className="ml-2">• goods: {hasGoods ? '✅' : '❌'}</div>
            <div className="ml-2">• payment_on_delivery: {hasPayment ? '✅' : '❌'}</div>
            <div className="ml-2">• please_check_good_under_camera: {hasCheckProduct ? '✅' : '❌'}</div>
            <div className="ml-2">• thanks_for_order_rate_pickpoint: {hasThanks ? '✅' : '❌'}</div>
            <div className="font-semibold mt-2">Вариант 2:</div>
            <div className="ml-2">• Ячейки v2: {cellV2Count}/482</div>
            <div className="ml-2">• checkWBWallet: {hasCheckWBWallet ? '✅' : '❌'}</div>
            <div className="ml-2">• scanAfterQrClient: {hasScanAfterQr ? '✅' : '❌'}</div>
            <div className="ml-2">• askRatePickPoint: {hasAskRate ? '✅' : '❌'}</div>
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
            disabled={isGenerating || isV1Complete}
            className="w-full"
            size="lg"
            variant="outline"
          >
            {isGenerating ? (
              <>
                <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                {progress}%
              </>
            ) : isV1Complete ? (
              <>
                <Icon name="Check" className="w-4 h-4 mr-2" />
                V1 готово
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
            disabled={isGenerating || isV2Complete}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                {progress}%
              </>
            ) : isV2Complete ? (
              <>
                <Icon name="Check" className="w-4 h-4 mr-2" />
                V2 готово
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
              <div><strong>Вариант 1:</strong> Ячейки cell_v1_1...482 + goods, payment_on_delivery, please_check_good_under_camera, thanks_for_order_rate_pickpoint</div>
              <div><strong>Вариант 2:</strong> Ячейки cell_v2_1...482 + checkWBWallet, scanAfterQrClient, askRatePickPoint</div>
            </div>
          </AlertDescription>
        </Alert>

        {(isV1Complete || isV2Complete) && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription>
              <div className="flex items-center gap-2 text-green-800">
                <Icon name="CheckCircle" className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isV1Complete && isV2Complete ? 'Оба варианта озвучки готовы!' : isV1Complete ? 'Вариант 1 готов!' : 'Вариант 2 готов!'}
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