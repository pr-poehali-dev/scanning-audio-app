import Icon from '@/components/ui/icon';

interface FooterProps {
  customAudioFiles: { [key: string]: string };
  playAudio: (key: string) => Promise<void>;
}

const Footer = ({ customAudioFiles, playAudio }: FooterProps) => {
  return (
    <div className="bg-white border-t px-4 py-3">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Версия 2.1.0</span>
        <div className="flex items-center gap-4">
          <span>Загружено аудио: {Object.keys(customAudioFiles).length}</span>
          <button 
            onClick={() => playAudio('test')}
            className="text-purple-600 hover:text-purple-700 text-xs"
          >
            🔊 Тест звука
          </button>
        </div>
      </div>
    </div>
  );
};

export default Footer;