import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { AudioSettings } from '@/hooks/useAppState';
import { audioStorage } from '@/utils/audioStorage';
import { cloudAudioStorage } from '@/utils/cloudAudioStorage';
import { getBasicFiles, NUMBER_FILES } from './AudioManagerConstants';

interface BasicFilesUploaderProps {
  audioSettings: AudioSettings;
  uploadedFiles: { [key: string]: string };
  setUploadedFiles: (files: { [key: string]: string }) => void;
  onTestAudio: (phraseKey: string) => void;
}

export const BasicFilesUploader = ({
  audioSettings,
  uploadedFiles,
  setUploadedFiles,
  onTestAudio
}: BasicFilesUploaderProps) => {
  const handleFileUpload = async (fileKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const variant = audioSettings.variant;
    const v1Files = ['goods', 'payment_on_delivery', 'please_check_good_under_camera', 'thanks_for_order_rate_pickpoint', 'success_sound'];
    const v2Files = ['checkWBWallet', 'scanAfterQrClient', 'askRatePickPoint', 'box_accepted', 'quantity_text'];
    const allowedFiles = variant === 'v1' ? v1Files : v2Files;
    
    const isCellFile = fileKey.startsWith(`cell_${variant}_`);
    const isBasicFile = allowedFiles.includes(fileKey);
    const isCountFile = fileKey.startsWith('count_');
    const isNumberFile = fileKey.startsWith('number_');
    
    if (!isCellFile && !isBasicFile && !isCountFile && !isNumberFile) {
      alert(`❌ Ошибка: файл "${fileKey}" не соответствует варианту ${variant}!\n\nВы выбрали вариант ${variant}, но пытаетесь загрузить файл для другого варианта.`);
      return;
    }

    const url = await audioStorage.saveFile(fileKey, file);
    
    try {
      await cloudAudioStorage.saveFile(fileKey, file);
      console.log('✅ Загружен локально и в облако:', fileKey);
    } catch (cloudError) {
      console.warn('⚠️ Облако недоступно, файл сохранён локально:', fileKey);
    }
    
    setUploadedFiles({ ...uploadedFiles, [fileKey]: url });
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Основные файлы ({audioSettings.variant === 'v1' ? 'Вариант 1' : 'Вариант 2'})</h3>
        {getBasicFiles(audioSettings.variant).map((file) => (
          <div key={file.key} className="border rounded-lg p-3 space-y-2">
            <Label className="text-sm font-medium">{file.label}</Label>
            
            <div className="flex gap-2">
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileUpload(file.key, e)}
                className="flex-1"
              />
              {uploadedFiles[file.key] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTestAudio(file.testKey)}
                >
                  <Icon name="Play" className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {uploadedFiles[file.key] && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Icon name="CheckCircle" className="w-3 h-3" />
                <span>Файл загружен</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {audioSettings.variant === 'v2' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Озвучка чисел (для приёмки)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {NUMBER_FILES.map((file) => (
              <div key={file.key} className="border rounded-lg p-3 space-y-2">
                <Label className="text-xs font-medium">{file.label}</Label>
                
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileUpload(file.key, e)}
                    className="text-xs"
                  />
                </div>
                
                {uploadedFiles[file.key] && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Icon name="CheckCircle" className="w-3 h-3" />
                    <span>Загружен</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
