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
      alert('Все файлы удалены. Загрузите озвучки заново.');
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

      let uploaded = 0;
      for (const [key, data] of Object.entries(localFiles)) {
        // Convert base64 data URL to blob, then to file
        const response = await fetch(data);
        const blob = await response.blob();
        const file = new File([blob], `${key}.mp3`, { type: 'audio/mp3' });
        
        await cloudAudioStorage.saveFile(key, file);
        uploaded++;
      }

      setCloudFileCount(uploaded);
      alert(`✅ Загружено в облако: ${uploaded} файлов`);
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
      alert('Ошибка при загрузке файлов в облако');
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
      console.error('Ошибка проверки облака:', error);
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
                {cloudFileCount !== null ? `${cloudFileCount} в облаке` : 'Проверить облако'}
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