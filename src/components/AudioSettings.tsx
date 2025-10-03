import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AudioManager } from './AudioManager';
import { AudioSettings as AudioSettingsType } from '@/hooks/useAppState';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Настройки озвучки</DialogTitle>
        </DialogHeader>
        <AudioManager
          audioSettings={audioSettings}
          setAudioSettings={setAudioSettings}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          onTestAudio={onTestAudio}
        />
      </DialogContent>
    </Dialog>
  );
};