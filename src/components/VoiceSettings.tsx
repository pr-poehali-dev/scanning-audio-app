import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { voiceAssistantManager, VOICE_ASSISTANTS, NEW_VOICE_SOUNDS } from '@/utils/voiceAssistantManager';

interface VoiceSettingsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ 
  isOpen = false, 
  onClose 
}) => {
  const [currentAssistant, setCurrentAssistant] = useState<'old' | 'new'>('old');
  const [uploading, setUploading] = useState(false);
  const [uploadingSoundId, setUploadingSoundId] = useState<string | null>(null);
  const [loadedSounds, setLoadedSounds] = useState<string[]>([]);
  const [storageInfo, setStorageInfo] = useState({ soundsCount: 0, totalSize: '0 KB', assistant: '' });

  useEffect(() => {
    if (isOpen) {
      loadCurrentSettings();
    }
  }, [isOpen]);

  const loadCurrentSettings = () => {
    setCurrentAssistant(voiceAssistantManager.getCurrentAssistant());
    setLoadedSounds(voiceAssistantManager.getLoadedSounds());
    setStorageInfo(voiceAssistantManager.getStorageInfo());
  };

  const handleAssistantChange = (assistantId: 'old' | 'new') => {
    voiceAssistantManager.setCurrentAssistant(assistantId);
    setCurrentAssistant(assistantId);
    setStorageInfo(voiceAssistantManager.getStorageInfo());
  };

  const handleSoundUpload = async (soundId: string, file: File) => {
    setUploading(true);
    setUploadingSoundId(soundId);
    
    try {
      const success = await voiceAssistantManager.saveNewSound(soundId, file);
      if (success) {
        setLoadedSounds(voiceAssistantManager.getLoadedSounds());
        setStorageInfo(voiceAssistantManager.getStorageInfo());
        console.log(`✅ Звук "${soundId}" успешно загружен`);
      }
    } catch (error) {
      console.error(`❌ Ошибка загрузки звука "${soundId}":`, error);
      alert(`Ошибка загрузки звука: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadingSoundId(null);
    }
  };

  const handleSoundTest = async (soundId: string) => {
    try {
      const success = await voiceAssistantManager.playNewAssistantSound(soundId);
      if (!success) {
        alert('Звук не загружен или произошла ошибка воспроизведения');
      }
    } catch (error) {
      console.error(`❌ Ошибка тестирования звука "${soundId}":`, error);
    }
  };

  const handleSoundRemove = (soundId: string) => {
    if (window.confirm(`Удалить звук "${getSoundName(soundId)}"?`)) {
      const success = voiceAssistantManager.removeSound(soundId);
      if (success) {
        setLoadedSounds(voiceAssistantManager.getLoadedSounds());
        setStorageInfo(voiceAssistantManager.getStorageInfo());
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Удалить все звуки нового голосового помощника?')) {
      voiceAssistantManager.clearAllNewSounds();
      setLoadedSounds([]);
      setStorageInfo(voiceAssistantManager.getStorageInfo());
    }
  };

  const getSoundName = (soundId: string): string => {
    const sound = NEW_VOICE_SOUNDS.find(s => s.id === soundId);
    return sound?.name || soundId;
  };

  const getSoundDescription = (soundId: string): string => {
    const sound = NEW_VOICE_SOUNDS.find(s => s.id === soundId);
    return sound?.description || '';
  };

  const getSoundCategory = (soundId: string): string => {
    const sound = NEW_VOICE_SOUNDS.find(s => s.id === soundId);
    const categoryNames = {
      'system': 'Системные',
      'cell': 'Ячейки',
      'interaction': 'Взаимодействие',
      'feedback': 'Обратная связь'
    };
    return categoryNames[sound?.category || 'system'] || 'Другое';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Системные': 'AlertTriangle',
      'Ячейки': 'Grid3X3',
      'Взаимодействие': 'MessageSquare',
      'Обратная связь': 'Heart'
    };
    return icons[category] || 'Volume2';
  };

  const groupedSounds = NEW_VOICE_SOUNDS.reduce((groups, sound) => {
    const category = getSoundCategory(sound.id);
    if (!groups[category]) groups[category] = [];
    groups[category].push(sound);
    return groups;
  }, {} as Record<string, typeof NEW_VOICE_SOUNDS>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Настройки голосовой озвучки
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Выбор голосового помощника */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Выберите голосового помощника</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VOICE_ASSISTANTS.map(assistant => (
                <div
                  key={assistant.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    currentAssistant === assistant.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleAssistantChange(assistant.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                      currentAssistant === assistant.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {currentAssistant === assistant.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{assistant.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{assistant.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Информация о хранилище */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Текущие настройки</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>🎤 Активный помощник: {storageInfo.assistant}</div>
              <div>🔊 Загружено звуков: {storageInfo.soundsCount}</div>
              <div>💽 Размер: {storageInfo.totalSize}</div>
            </div>
          </div>

          {/* Настройки нового помощника */}
          {currentAssistant === 'new' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Звуки интерактивного помощника</h3>
                {loadedSounds.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Очистить все
                  </button>
                )}
              </div>

              {Object.entries(groupedSounds).map(([category, sounds]) => (
                <div key={category} className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon name={getCategoryIcon(category)} size={18} className="text-gray-600" />
                    <h4 className="font-medium text-gray-900">{category}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {sounds.map(sound => {
                      const isLoaded = loadedSounds.includes(sound.id);
                      const isUploading = uploadingSoundId === sound.id;
                      
                      return (
                        <div
                          key={sound.id}
                          className={`border rounded-lg p-4 ${
                            isLoaded ? 'border-green-200 bg-green-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h5 className="font-medium text-gray-900">{sound.name}</h5>
                                {isLoaded && (
                                  <Icon name="CheckCircle" size={16} className="text-green-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{sound.description}</p>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              {isLoaded && (
                                <>
                                  <button
                                    onClick={() => handleSoundTest(sound.id)}
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                    title="Тестировать звук"
                                  >
                                    <Icon name="Play" size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleSoundRemove(sound.id)}
                                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                    title="Удалить звук"
                                  >
                                    <Icon name="Trash2" size={14} />
                                  </button>
                                </>
                              )}
                              
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleSoundUpload(sound.id, file);
                                  }
                                }}
                                className="hidden"
                                id={`sound-${sound.id}`}
                                disabled={isUploading}
                              />
                              <label
                                htmlFor={`sound-${sound.id}`}
                                className={`px-3 py-1 text-sm rounded cursor-pointer inline-flex items-center ${
                                  isUploading
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : isLoaded
                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                {isUploading ? (
                                  <>
                                    <Icon name="Loader2" size={14} className="animate-spin mr-1" />
                                    Загрузка...
                                  </>
                                ) : (
                                  <>
                                    <Icon name="Upload" size={14} className="mr-1" />
                                    {isLoaded ? 'Заменить' : 'Загрузить'}
                                  </>
                                )}
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Инструкция */}
              <div className="bg-yellow-50 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-yellow-800 mb-2">Инструкция по загрузке звуков</h4>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Поддерживаемые форматы: MP3, WAV, M4A, OGG</li>
                  <li>Рекомендуемая длительность: до 5 секунд</li>
                  <li>Качество: 44.1 кГц, 128 кбит/с достаточно</li>
                  <li>Размер файла: до 2 МБ</li>
                  <li>Записывайте четко и громко для лучшего восприятия</li>
                </ul>
              </div>
            </div>
          )}

          {/* Сообщение для классического помощника */}
          {currentAssistant === 'old' && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Icon name="Mic" size={48} className="mx-auto text-gray-400 mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">Классический помощник активен</h4>
              <p className="text-sm text-gray-600">
                Используется базовая озвучка только номеров ячеек.
                Переключитесь на "Интерактивный помощник" для дополнительных возможностей.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};