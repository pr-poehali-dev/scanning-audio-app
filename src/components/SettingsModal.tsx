import { useRef } from 'react';
import Icon from '@/components/ui/icon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioSettings: {
    speed: number;
    activeTab: string;
    phrases: any;
    enabled: any;
  };
  customAudioFiles: { [key: string]: string };
  updateAudioSetting: (key: string, value: any) => void;
  playAudio: (key: string) => Promise<void>;
  handleFolderUpload: (event: React.ChangeEvent<HTMLInputElement>, tabType: string) => void;
  getTabName: (tabId: string) => string;
  getPhrasesByTab: (tabId: string) => string[];
  getDescriptionsByTab: (tabId: string) => { text: string; enabled: boolean }[];
  togglePhraseEnabled: (tabId: string, phraseIndex: number) => void;
}

const SettingsModal = ({
  isOpen,
  onClose,
  audioSettings,
  customAudioFiles,
  updateAudioSetting,
  playAudio,
  handleFolderUpload,
  getTabName,
  getPhrasesByTab,
  getDescriptionsByTab,
  togglePhraseEnabled
}: SettingsModalProps) => {
  const audioTabInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b bg-gray-50">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Icon name="ArrowLeft" size={20} className="text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">Настройки</h3>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Скорость озвучки */}
          <div className="mb-8">
            <h4 className="text-base font-medium text-gray-900 mb-4">Скорость озвучки</h4>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">x1</span>
              <div className="flex-1">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={audioSettings.speed}
                  onChange={(e) => updateAudioSetting('speed', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <span className="text-sm text-gray-600">x1,5</span>
              <button 
                onClick={() => playAudio('test')}
                className="p-2 bg-purple-100 hover:bg-purple-200 rounded-full"
              >
                <Icon name="Volume2" size={18} className="text-purple-600" />
              </button>
            </div>
          </div>

          {/* Фразы для озвучки */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Фразы для озвучки</h4>
            
            {/* Вкладки */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'delivery', name: 'Выдача', color: 'purple' },
                { id: 'acceptance', name: 'Приемка', color: 'gray' },
                { id: 'returns', name: 'Возврат', color: 'gray' },
                { id: 'general', name: 'Общие', color: 'gray' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => updateAudioSetting('activeTab', tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    audioSettings.activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Список фраз */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Левая колонка - Фразы */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Фраза или звук</h5>
                  <div className="space-y-3">
                    {getPhrasesByTab(audioSettings.activeTab).map((phrase, index) => (
                      <div key={index} className="text-sm text-gray-600 py-2">
                        {phrase}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Правая колонка - Описания и переключатели */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Описание действия в интерфейсе</h5>
                  <div className="space-y-3">
                    {getDescriptionsByTab(audioSettings.activeTab).map((desc, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600 flex-1">{desc.text}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{desc.enabled ? 'Вкл' : 'Выкл'}</span>
                          <button
                            onClick={() => togglePhraseEnabled(audioSettings.activeTab, index)}
                            className={`w-10 h-6 rounded-full transition-colors ${
                              desc.enabled ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              desc.enabled ? 'translate-x-5' : 'translate-x-1'
                            } mt-1`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Кнопка загрузки */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => audioTabInputRefs.current[audioSettings.activeTab]?.click()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Icon name="Upload" size={16} />
                  Загрузить аудио для вкладки "{getTabName(audioSettings.activeTab)}"
                </button>
                
                {/* Скрытые input'ы для каждой вкладки */}
                {['delivery', 'acceptance', 'returns', 'general'].map(tabId => (
                  <input
                    key={tabId}
                    ref={(el) => audioTabInputRefs.current[tabId] = el}
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={(e) => handleFolderUpload(e, tabId)}
                    className="hidden"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;