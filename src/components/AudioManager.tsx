import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { AudioSettings } from '@/hooks/useAppState';
import { CellAudioManager } from './CellAudioManager';
import { audioStorage } from '@/utils/audioStorage';

interface AudioManagerProps {
  audioSettings: AudioSettings;
  setAudioSettings: (settings: AudioSettings) => void;
  uploadedFiles: { [key: string]: string };
  setUploadedFiles: (files: { [key: string]: string }) => void;
  onTestAudio: (phraseKey: string) => void;
}

const AUDIO_PHRASES = {
  delivery: {
    'delivery-cell-info': 'Номер ячейки, количество товаров, оплата при получении',
    'delivery-scan-items': 'Сканируем товары (Снять все)',
    'delivery-check-product': 'Пожалуйста проверьте товар под камерой',
    'delivery-thanks': 'Спасибо за заказ, оцените пункт выдачи',
  },
  receiving: {
    'receiving-start': 'Начало приемки',
    'receiving-scan': 'Отсканируйте штрихкод',
    'receiving-next': 'Следующий товар',
    'receiving-complete': 'Приемка завершена',
  },
  return: {
    'return-start': 'Начало возврата',
    'return-scan-product': 'Отсканируйте товар для возврата',
    'return-confirm': 'Подтвердите возврат',
    'return-success': 'Возврат оформлен',
  }
};

export const AudioManager = ({
  audioSettings,
  setAudioSettings,
  uploadedFiles,
  setUploadedFiles,
  onTestAudio
}: AudioManagerProps) => {
  
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const files = await audioStorage.getAllFiles();
        if (Object.keys(files).length > 0) {
          console.log('📂 AudioManager: загружено файлов из IndexedDB:', Object.keys(files));
          setUploadedFiles(files);
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки файлов в AudioManager:', error);
      }
    };
    
    loadFiles();
  }, []);

  const handleDiagnose = async () => {
    console.log('🔍 === ДИАГНОСТИКА АУДИО СИСТЕМЫ ===');
    await audioStorage.diagnose();
    console.log('📋 Текущие uploadedFiles в компоненте:', Object.keys(uploadedFiles));
    console.log('📊 Настройки audioSettings.enabled:', audioSettings.enabled);
  };
  
  const handleFileUpload = async (phraseKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Сохраняем файл в IndexedDB и получаем URL
      const url = await audioStorage.saveFile(phraseKey, file);
      const newFiles = { ...uploadedFiles, [phraseKey]: url };
      setUploadedFiles(newFiles);
      
      console.log(`✅ Файл "${phraseKey}" сохранен в IndexedDB`);
    } catch (error) {
      console.error('Ошибка сохранения файла:', error);
      alert('Ошибка сохранения файла');
    }
  };

  const handleTogglePhrase = (phraseKey: string, enabled: boolean) => {
    const newSettings = {
      ...audioSettings,
      enabled: { ...audioSettings.enabled, [phraseKey]: enabled }
    };
    setAudioSettings(newSettings);
    localStorage.setItem('wb-pvz-audio-enabled', JSON.stringify(newSettings.enabled));
  };

  const handleSpeedChange = (speed: number) => {
    const newSettings = { ...audioSettings, speed };
    setAudioSettings(newSettings);
    localStorage.setItem('wb-pvz-audio-speed', speed.toString());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Volume2" className="w-5 h-5" />
            Управление озвучкой
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDiagnose}
          >
            <Icon name="Bug" className="w-4 h-4 mr-1" />
            Диагностика
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Скорость воспроизведения: {audioSettings.speed}x</Label>
          <Input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={audioSettings.speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <Tabs defaultValue="delivery" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="delivery">Выдача</TabsTrigger>
            <TabsTrigger value="receiving">Приемка</TabsTrigger>
            <TabsTrigger value="return">Возврат</TabsTrigger>
          </TabsList>

          {Object.entries(AUDIO_PHRASES).map(([tab, phrases]) => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {Object.entries(phrases).map(([phraseKey, phraseLabel]) => (
                <div key={phraseKey}>
                  {phraseKey === 'delivery-cell-info' ? (
                    // Специальный компонент для номеров ячеек
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b pb-2">
                        <Label className="text-sm font-medium">{phraseLabel}</Label>
                        <Switch
                          checked={audioSettings.enabled[phraseKey] || false}
                          onCheckedChange={(checked) => handleTogglePhrase(phraseKey, checked)}
                        />
                      </div>
                      <CellAudioManager
                        uploadedFiles={uploadedFiles}
                        setUploadedFiles={setUploadedFiles}
                        onTestAudio={onTestAudio}
                      />
                    </div>
                  ) : (
                    // Обычная загрузка для остальных фраз
                    <div className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">{phraseLabel}</Label>
                        <Switch
                          checked={audioSettings.enabled[phraseKey] || false}
                          onCheckedChange={(checked) => handleTogglePhrase(phraseKey, checked)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <Input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleFileUpload(phraseKey, e)}
                            className="flex-1"
                          />
                          {uploadedFiles[phraseKey] && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onTestAudio(phraseKey)}
                            >
                              <Icon name="Play" className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {uploadedFiles[phraseKey] && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Icon name="CheckCircle" className="w-3 h-3" />
                            <span>Файл загружен</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};