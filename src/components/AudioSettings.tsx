import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useAudio } from '@/hooks/useAudio';
import { AudioSettingsHeader } from './audio-settings/AudioSettingsHeader';
import { AudioSettingsFooter } from './audio-settings/AudioSettingsFooter';
import { ProcessSectionComponent } from './audio-settings/ProcessSectionComponent';
import { CellsSectionComponent } from './audio-settings/CellsSectionComponent';
import { saveAudioFiles } from './audio-settings/AudioSaveLogic';

interface AudioFiles {
  delivery: File[];
  receiving: File[];
  return: File[];
  cells: File[];
}

interface AudioSettingsProps {
  onClose: () => void;
  onAudioFilesUpdate: (files: AudioFiles) => void;
  existingFiles: AudioFiles;
}

export const AudioSettings = ({ onClose, onAudioFilesUpdate, existingFiles }: AudioSettingsProps) => {
  const [audioFiles, setAudioFiles] = useState<AudioFiles>(existingFiles);
  const [uploading, setUploading] = useState<string | null>(null);
  const { updateAudioFiles } = useAudio();

  const handleFolderUpload = async (
    type: keyof AudioFiles,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(type);
    
    const audioFileArray = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || 
      /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name)
    );

    if (audioFileArray.length === 0) {
      alert('В папке не найдено аудио файлов! Поддерживаются: MP3, WAV, OGG, M4A, AAC, FLAC');
      setUploading(null);
      return;
    }

    const updatedFiles = {
      ...audioFiles,
      [type]: audioFileArray
    };
    
    setAudioFiles(updatedFiles);
    setUploading(null);
  };

  const clearSection = (type: keyof AudioFiles) => {
    const updatedFiles = {
      ...audioFiles,
      [type]: []
    };
    setAudioFiles(updatedFiles);
  };

  const handleSave = async () => {
    await saveAudioFiles(audioFiles, updateAudioFiles);
    onAudioFilesUpdate(audioFiles);
    onClose();
  };

  const getTotalFiles = () => {
    return audioFiles.delivery.length + audioFiles.receiving.length + 
           audioFiles.return.length + audioFiles.cells.length;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        <AudioSettingsHeader onClose={onClose} />

        <div className="p-6 space-y-6">
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <Icon name="Play" size={20} className="text-green-600" />
              Озвучка процессов
            </h3>

            <ProcessSectionComponent
              type="delivery"
              title="Выдача товаров"
              iconName="Package"
              iconColor="text-blue-600"
              files={audioFiles.delivery}
              uploading={uploading}
              onFolderUpload={handleFolderUpload}
              onClearSection={clearSection}
            />

            <ProcessSectionComponent
              type="receiving"
              title="Приемка товаров"
              iconName="PackageCheck"
              iconColor="text-green-600"
              files={audioFiles.receiving}
              uploading={uploading}
              onFolderUpload={handleFolderUpload}
              onClearSection={clearSection}
              showRecommendations={true}
            />

            <ProcessSectionComponent
              type="return"
              title="Возврат товаров"
              iconName="Undo2"
              iconColor="text-orange-600"
              files={audioFiles.return}
              uploading={uploading}
              onFolderUpload={handleFolderUpload}
              onClearSection={clearSection}
            />
          </div>

          <CellsSectionComponent
            files={audioFiles.cells}
            uploading={uploading}
            onFolderUpload={handleFolderUpload}
            onClearSection={clearSection}
          />
        </div>

        <AudioSettingsFooter
          totalFiles={getTotalFiles()}
          onClose={onClose}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};