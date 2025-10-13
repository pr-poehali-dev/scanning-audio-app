import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AudioManager } from './AudioManager';
import { AudioUploadGuide } from './AudioUploadGuide';
import { TTSGenerator } from './TTSGenerator';
import { AudioSettings as AudioSettingsType } from '@/hooks/useAppState';
import { audioStorage } from '@/utils/audioStorage';
import { cloudAudioStorage } from '@/utils/cloudAudioStorage';
import { Button } from './ui/button';
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