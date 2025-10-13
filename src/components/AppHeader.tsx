import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AppHeaderProps {
  onOpenAudioSettings: () => void;
  onTestAudio?: () => void;
}

export const AppHeader = ({ onOpenAudioSettings, onTestAudio }: AppHeaderProps) => {
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
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {onTestAudio && (
              <Button
                variant="outline" 
                size="sm"
                onClick={onTestAudio}
                className="text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700"
              >
                <Icon name="Play" className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Тест</span>
              </Button>
            )}
            <Button
              variant="ghost" 
              size="sm"
              onClick={onOpenAudioSettings}
              className="text-gray-600 hover:text-blue-600"
            >
              <Icon name="Volume2" className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Озвучка</span>
            </Button>
            <Button
              variant="ghost" 
              size="sm"
              className="text-gray-600 hover:text-blue-600 hidden sm:inline-flex"
            >
              <Icon name="Settings" className="w-5 h-5 mr-2" />
              Настройки
            </Button>
            <Button
              variant="ghost" 
              size="sm"
              className="text-gray-600 hover:text-blue-600 hidden sm:inline-flex"
            >
              <Icon name="User" className="w-5 h-5 mr-2" />
              Профиль
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};