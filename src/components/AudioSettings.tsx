import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AudioManager } from './AudioManager';
import { AudioUploadGuide } from './AudioUploadGuide';
import { TTSGenerator } from './TTSGenerator';
import { AudioSettings as AudioSettingsType } from '@/hooks/useAppState';
import { audioStorage } from '@/utils/audioStorage';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

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
  const handleClearAll = async () => {
    if (confirm('Удалить все загруженные аудиофайлы? Это действие нельзя отменить.')) {
      await audioStorage.clear();
      setUploadedFiles({});
      alert('Все файлы удалены. Загрузите озвучки заново.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Настройки озвучки</DialogTitle>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleClearAll}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Очистить все файлы
            </Button>
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