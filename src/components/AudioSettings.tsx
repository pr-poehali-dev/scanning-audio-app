import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AudioManager } from './AudioManager';
import { AudioUploadGuide } from './AudioUploadGuide';
import { TTSGenerator } from './TTSGenerator';
import { AudioSettings as AudioSettingsType } from '@/hooks/useAppState';
import { audioStorage } from '@/utils/audioStorage';
import { cloudAudioStorage } from '@/utils/cloudAudioStorage';
import { Button } from './ui/button';
import Icon from '@/components/ui/icon';
import { Trash2, Cloud, Upload } from 'lucide-react';
import { useState } from 'react';

interface AudioSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audioSettings: AudioSettingsType;
  setAudioSettings: (settings: AudioSettingsType) => void;
  uploadedFiles: { [key: string]: string };
  setUploadedFiles: (files: { [key: string]: string }) => void;
  onTestAudio: (phraseKey: string) => void;
}

export const AudioSettings = ({
  open,
  onOpenChange,
  audioSettings,
  setAudioSettings,
  uploadedFiles,
  setUploadedFiles,
  onTestAudio
}: AudioSettingsProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudFileCount, setCloudFileCount] = useState<number | null>(null);
  
  // Функция фильтрации файлов по варианту (копия из useAudio)
  const filterFilesByVariant = (allFiles: { [key: string]: string }, variant: 'v1' | 'v2') => {
    const filtered: { [key: string]: string } = {};
    const v1Files = ['goods', 'payment_on_delivery', 'please_check_good_under_camera', 'thanks_for_order_rate_pickpoint', 'success_sound'];
    const v2Files = ['checkWBWallet', 'scanAfterQrClient', 'askRatePickPoint'];
    const allowedFiles = variant === 'v1' ? v1Files : v2Files;
    
    Object.keys(allFiles).forEach(key => {
      if (key.startsWith(`cell_${variant}_`) || allowedFiles.includes(key) || key.startsWith('count_')) {
        filtered[key] = allFiles[key];
      }
    });
    
    return filtered;
  };

  const handleClearAll = async () => {
    if (confirm('Удалить все загруженные аудиофайлы? Это действие нельзя отменить.')) {
      await audioStorage.clear();
      await cloudAudioStorage.clear();
      setUploadedFiles({});
      setCloudFileCount(0);
      alert('Все файлы удалены.');
    }
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    try {
      const localFiles = await audioStorage.getAllFiles();
      const fileCount = Object.keys(localFiles).length;
      
      if (fileCount === 0) {
        alert('Нет локальных файлов для загрузки в облако');
        setIsSyncing(false);
        return;
      }

      console.log(`🚀 Загружаю ${fileCount} файлов в облако...`);
      let uploaded = 0;
      let errors = 0;

      const entries = Object.entries(localFiles);
      const batchSize = 10;
      let lastError: any = null;
      const uploadedKeys: string[] = [];
      
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async ([key, data]) => {
          try {
            await cloudAudioStorage.uploadFile(key, data);
            uploaded++;
            uploadedKeys.push(key);
            if (uploaded % 50 === 0 || uploaded === fileCount) {
              console.log(`📤 ${uploaded}/${fileCount}`);
            }
          } catch (err: any) {
            const errorDetails = {
              message: err?.message || String(err),
              name: err?.name,
              stack: err?.stack,
              cause: err?.cause
            };
            console.error(`❌ ${key}:`, errorDetails);
            lastError = err;
            errors++;
          }
        }));
        
        if (i + batchSize < entries.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setCloudFileCount(uploaded);
      
      if (errors > 0 && lastError) {
        const errorMsg = lastError?.message || String(lastError);
        const successList = uploadedKeys.length > 0 
          ? `\n\n✅ Загружены:\n${uploadedKeys.slice(0, 10).join('\n')}${uploadedKeys.length > 10 ? `\n... и ещё ${uploadedKeys.length - 10}` : ''}` 
          : '';
        alert(`✅ Загружено: ${uploaded} из ${fileCount}\n⚠️ Ошибок: ${errors}\n\n❌ Последняя ошибка:\n${errorMsg}${successList}`);
      } else {
        alert(`✅ Загружено: ${uploaded} из ${fileCount}\n\nВсе файлы успешно загружены в облако!`);
      }
    } catch (error: any) {
      const errorDetails = {
        message: error?.message || String(error),
        name: error?.name,
        stack: error?.stack
      };
      console.error('Ошибка:', errorDetails);
      alert(`Ошибка при загрузке:\n${errorDetails.message || error}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCheckCloud = async () => {
    try {
      const cloudFiles = await cloudAudioStorage.getAllFiles();
      const count = Object.keys(cloudFiles).length;
      setCloudFileCount(count);
      alert(`☁️ В облаке: ${count} файлов`);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при проверке облака');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center gap-2">
            <DialogTitle>Настройки озвучки</DialogTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCheckCloud}
                className="gap-2"
              >
                <Cloud className="w-4 h-4" />
                {cloudFileCount !== null ? `${cloudFileCount} в облаке` : 'Проверить'}
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSyncToCloud}
                disabled={isSyncing}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {isSyncing ? 'Загружаю...' : 'Загрузить в облако'}
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleClearAll}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Очистить
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Выбор варианта озвучки */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-4 shadow-sm">
            <div className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="Music" className="w-5 h-5 text-purple-600" />
              Выбор варианта озвучки
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={audioSettings.variant === 'v1' ? 'default' : 'outline'}
                onClick={async () => {
                  if (audioSettings.variant !== 'v1') {
                    console.log('🔄 Переключение на Вариант 1');
                    // Применяем фильтрацию файлов при переключении
                    const filtered = filterFilesByVariant(uploadedFiles, 'v1');
                    setUploadedFiles(filtered);
                    console.log('✅ Файлы отфильтрованы для V1:', Object.keys(filtered).length);
                  }
                  const newSettings = { ...audioSettings, variant: 'v1' as 'v1' | 'v2' };
                  setAudioSettings(newSettings);
                  localStorage.setItem('wb-pvz-audio-variant', 'v1');
                }}
                className={`w-full h-14 text-base font-semibold ${
                  audioSettings.variant === 'v1' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'border-2 border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>📦 Вариант 1</span>
                  {audioSettings.variant === 'v1' && <span className="text-xs">✓ Активен</span>}
                </div>
              </Button>
              <Button
                variant={audioSettings.variant === 'v2' ? 'default' : 'outline'}
                onClick={async () => {
                  if (audioSettings.variant !== 'v2') {
                    console.log('🔄 Переключение на Вариант 2');
                    // Применяем фильтрацию файлов при переключении
                    const filtered = filterFilesByVariant(uploadedFiles, 'v2');
                    setUploadedFiles(filtered);
                    console.log('✅ Файлы отфильтрованы для V2:', Object.keys(filtered).length);
                  }
                  const newSettings = { ...audioSettings, variant: 'v2' as 'v1' | 'v2' };
                  setAudioSettings(newSettings);
                  localStorage.setItem('wb-pvz-audio-variant', 'v2');
                }}
                className={`w-full h-14 text-base font-semibold ${
                  audioSettings.variant === 'v2' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'border-2 border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>📦 Вариант 2</span>
                  {audioSettings.variant === 'v2' && <span className="text-xs">✓ Активен</span>}
                </div>
              </Button>
            </div>
            <div className="mt-3 text-xs space-y-1">
              {audioSettings.variant === 'v1' ? (
                <div className="text-purple-700">
                  <div className="font-semibold mb-1">✅ Вариант 1 активен</div>
                  <div className="ml-2">
                    • QR код → ячейка + <strong>goods</strong> + <strong>payment_on_delivery</strong><br/>
                    • Снять все → <strong>please_check_good_under_camera</strong><br/>
                    • Выдать → <strong>success_sound</strong> + <strong>thanks_for_order_rate_pickpoint</strong>
                  </div>
                </div>
              ) : (
                <div className="text-blue-700">
                  <div className="font-semibold mb-1">✅ Вариант 2 активен</div>
                  <div className="ml-2">
                    • QR код → ячейка + <strong>checkWBWallet</strong><br/>
                    • Снять все → <strong>scanAfterQrClient</strong><br/>
                    • Выдать → <strong>askRatePickPoint</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Диагностическая информация */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-blue-900 mb-2">📊 Диагностика</div>
            <div className="space-y-1 text-xs text-blue-800">
              <div>📦 Локально загружено: {Object.keys(uploadedFiles).length} файлов</div>
              {cloudFileCount !== null && (
                <div>☁️ В облаке: {cloudFileCount} файлов</div>
              )}
              <div className="mt-2 pt-2 border-t border-blue-200">
                <details className="cursor-pointer">
                  <summary className="font-medium">Список файлов</summary>
                  <div className="mt-2 max-h-32 overflow-y-auto space-y-0.5">
                    {Object.keys(uploadedFiles).length > 0 ? (
                      Object.keys(uploadedFiles).map(key => (
                        <div key={key} className="text-blue-700">• {key}</div>
                      ))
                    ) : (
                      <div className="text-blue-600">Нет загруженных файлов</div>
                    )}
                  </div>
                </details>
              </div>
            </div>
          </div>

          <AudioUploadGuide />
          
          <TTSGenerator
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
          
          <AudioManager
            audioSettings={audioSettings}
            setAudioSettings={setAudioSettings}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            onTestAudio={onTestAudio}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};