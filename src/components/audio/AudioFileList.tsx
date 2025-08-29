import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AudioFile {
  key: string;
  name: string;
  uploaded: boolean;
  url?: string;
}

interface AudioFileListProps {
  audioFiles: AudioFile[];
  onPlayFile: (url: string) => void;
  onRemoveFile: (key: string) => void;
}

export const AudioFileList = ({ audioFiles, onPlayFile, onRemoveFile }: AudioFileListProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Список аудиофайлов</h3>
      <div className="grid gap-3">
        {audioFiles.map((audioFile) => (
          <div key={audioFile.key} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                audioFile.uploaded ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <div>
                <div className="font-medium">{audioFile.name}</div>
                <div className="text-sm text-gray-500">{audioFile.key}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {audioFile.uploaded && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (audioFile.url) {
                        onPlayFile(audioFile.url);
                      }
                    }}
                  >
                    <Icon name="Play" className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRemoveFile(audioFile.key)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Icon name="Trash" className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};