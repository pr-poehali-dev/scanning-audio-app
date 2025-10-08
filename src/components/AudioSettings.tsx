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
      
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async ([key, data]) => {
          try {
            await cloudAudioStorage.uploadFile(key, data);
            uploaded++;
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
        alert(`✅ Загружено: ${uploaded} из ${fileCount}\n⚠️ Ошибок: ${errors}\n\n❌ Последняя ошибка:\n${errorMsg}`);
      } else {
        alert(`✅ Загружено: ${uploaded} из ${fileCount}`);
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