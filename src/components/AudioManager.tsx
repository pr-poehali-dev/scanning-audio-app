import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { AudioSettings } from '@/hooks/useAppState';
import { audioStorage } from '@/utils/audioStorage';

interface AudioManagerProps {
  audioSettings: AudioSettings;
  setAudioSettings: (settings: AudioSettings) => void;
  uploadedFiles: { [key: string]: string };
  setUploadedFiles: (files: { [key: string]: string }) => void;
  onTestAudio: (phraseKey: string) => void;
}

const REQUIRED_FILES = [
  { key: 'goods', label: 'Файл "goods.mp3" - озвучка товары', testKey: 'delivery-cell-info' },
  { key: 'count_1', label: 'Файл "count_1.mp3" - цифра 1', testKey: 'delivery-cell-info' },
  { key: 'count_2', label: 'Файл "count_2.mp3" - цифра 2', testKey: 'delivery-cell-info' },
  { key: 'count_3', label: 'Файл "count_3.mp3" - цифра 3', testKey: 'delivery-cell-info' },
  { key: 'count_4', label: 'Файл "count_4.mp3" - цифра 4', testKey: 'delivery-cell-info' },
  { key: 'count_5', label: 'Файл "count_5.mp3" - цифра 5', testKey: 'delivery-cell-info' },
  { key: 'payment_on_delivery', label: 'Файл "payment_on_delivery.mp3" - оплата при получении', testKey: 'delivery-cell-info' },
  { key: 'please_check_good_under_camera', label: 'Файл "please_check_good_under_camera.mp3" - проверьте товар', testKey: 'check-product-under-camera' },
  { key: 'thanks_for_order_rate_pickpoint', label: 'Файл "thanks_for_order_rate_pickpoint.mp3" - спасибо за заказ', testKey: 'delivery-thanks' },
];

export const AudioManager = ({
  uploadedFiles,
  setUploadedFiles,
  onTestAudio
}: AudioManagerProps) => {
  
  useEffect(() => {
    const loadFiles = async () => {
      const files = await audioStorage.getAllFiles();
      console.log('📂 Загружено:', Object.keys(files));
      if (Object.keys(files).length > 0) {
        setUploadedFiles(files);
      }
    };
    
    loadFiles();
  }, [setUploadedFiles]);
  
  const handleFileUpload = async (fileKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await audioStorage.saveFile(fileKey, file);
    setUploadedFiles({ ...uploadedFiles, [fileKey]: url });
    console.log('✅ Загружен:', fileKey);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Volume2" className="w-5 h-5" />
          Загрузка аудиофайлов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
          <strong>Важно:</strong> Загрузите 4 файла с ТОЧНЫМИ названиями как указано ниже
        </div>

        {REQUIRED_FILES.map((file) => (
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
      </CardContent>
    </Card>
  );
};