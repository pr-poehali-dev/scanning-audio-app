import Icon from '@/components/ui/icon';

interface VoiceVariantButtonProps {
  onClick: () => void;
}

const VoiceVariantButton = ({ onClick }: VoiceVariantButtonProps) => {
  const getActiveVariantInfo = () => {
    const activeVariant = localStorage.getItem('wb-active-voice-variant');
    if (!activeVariant) return { name: 'Нет', count: 0 };
    
    try {
      const storageKey = `wb-voice-${activeVariant}-permanent`;
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        const count = Object.keys(parsed).filter(key => /^\d+$/.test(key)).length;
        const name = activeVariant === 'standard' ? 'Стандартная' : 
                    activeVariant === 'alternative' ? 'Альтернативная' : 
                    activeVariant;
        return { name, count };
      }
    } catch (error) {
      console.log('Ошибка чтения варианта:', error);
    }
    
    return { name: activeVariant, count: 0 };
  };

  const variantInfo = getActiveVariantInfo();

  return (
    <button 
      onClick={onClick}
      className="fixed bottom-4 left-[200px] bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50"
    >
      <Icon name="Mic2" size={16} />
      <div className="flex flex-col items-start text-xs">
        <span className="font-medium">Варианты озвучки</span>
        <span className="opacity-80">
          {variantInfo.name} ({variantInfo.count})
        </span>
      </div>
    </button>
  );
};

export default VoiceVariantButton;