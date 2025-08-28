import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AppHeaderProps {
  customAudioFiles: {[key: string]: string};
  onShowAudioManager: () => void;
  onShowAudioSettings: () => void;
  onTestAudio: () => void;
  onClearAudio: () => void;
}

export const AppHeader = ({
  customAudioFiles,
  onShowAudioManager,
  onShowAudioSettings,
  onTestAudio,
  onClearAudio
}: AppHeaderProps) => {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="https://cdn.poehali.dev/files/042b80d5-4fd3-473f-b81d-c42ef32edea0.png" alt="WB" className="w-8 h-8" />
            </div>
            <div className="text-sm text-gray-600">
              <div>ID 50006760</div>
              <div>V1.0.67</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost" 
              size="sm"
              onClick={onShowAudioManager}
              className="text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg relative"
            >
              <Icon name="Volume2" className="w-5 h-5 mr-2" />
              Загрузить озвучку
              {Object.keys(customAudioFiles).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {Object.keys(customAudioFiles).length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost" 
              size="sm"
              onClick={onShowAudioSettings}
              className="text-gray-600 hover:text-blue-600"
            >
              <Icon name="Settings" className="w-5 h-5 mr-2" />
              Настройки
            </Button>
            {Object.keys(customAudioFiles).length > 0 && (
              <>
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={onTestAudio}
                  className="text-green-600 hover:text-green-700"
                >
                  <Icon name="Play" className="w-5 h-5 mr-2" />
                  Тест
                </Button>
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    if (confirm('Удалить все загруженные аудиофайлы?')) {
                      onClearAudio();
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Icon name="Trash2" className="w-5 h-5 mr-2" />
                  Очистить
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};