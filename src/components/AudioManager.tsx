import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { AudioSettings } from '@/hooks/useAppState';
import { audioStorage } from '@/utils/audioStorage';
import { cloudAudioStorage } from '@/utils/cloudAudioStorage';
import { CloudSyncPanel } from './audio/CloudSyncPanel';
import { BasicFilesUploader } from './audio/BasicFilesUploader';
import { CellFilesUploader } from './audio/CellFilesUploader';

interface AudioManagerProps {
  audioSettings: AudioSettings;
  setAudioSettings: (settings: AudioSettings) => void;
  uploadedFiles: { [key: string]: string };
  setUploadedFiles: (files: { [key: string]: string }) => void;
  onTestAudio: (phraseKey: string) => void;
}

export const AudioManager = ({
  audioSettings,
  uploadedFiles,
  setUploadedFiles,
  onTestAudio
}: AudioManagerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  
  useEffect(() => {
    const loadFiles = async () => {
      const cloudFiles = await cloudAudioStorage.getAllFiles();
      console.log('☁️ Файлов в облаке:', Object.keys(cloudFiles).length);
      
      if (Object.keys(cloudFiles).length > 0) {
        setUploadedFiles(cloudFiles);
      } else {
        const files = await audioStorage.getAllFiles();
        console.log('📂 Загружено локально:', Object.keys(files).length);
        if (Object.keys(files).length > 0) {
          setUploadedFiles(files);
        }
      }
    };
    
    loadFiles();
  }, [setUploadedFiles]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Volume2" className="w-5 h-5" />
          Загрузка аудиофайлов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CloudSyncPanel
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          setIsUploading={setIsUploading}
          setUploadProgress={setUploadProgress}
        />

        <BasicFilesUploader
          audioSettings={audioSettings}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          onTestAudio={onTestAudio}
        />

        <CellFilesUploader
          audioSettings={audioSettings}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          setUploadProgress={setUploadProgress}
        />
      </CardContent>
    </Card>
  );
};
