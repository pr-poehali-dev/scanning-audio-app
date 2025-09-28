import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface VoiceVariantInfo {
  count: number;
  exists: boolean;
  cells: string[];
}

interface VoiceVariantCardProps {
  variant: 'standard' | 'alternative';
  info: VoiceVariantInfo;
  isSelected: boolean;
  isActive: boolean;
  onSelect: () => void;
  onTest: () => void;
  onActivate: () => void;
  onClear: () => void;
}

const VoiceVariantCard: React.FC<VoiceVariantCardProps> = ({
  variant,
  info,
  isSelected,
  isActive,
  onSelect,
  onTest,
  onActivate,
  onClear
}) => {
  const isStandard = variant === 'standard';
  const title = isStandard ? 'Стандартная' : 'Альтернативная';
  const colorScheme = isStandard ? 'blue' : 'purple';
  
  const borderClass = isSelected 
    ? `border-${colorScheme}-500 bg-${colorScheme}-50` 
    : 'border-gray-200';

  return (
    <div className={`border-2 rounded-lg p-4 transition-all ${borderClass}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-lg flex items-center gap-2">
          <Icon name={isStandard ? "Mic" : "Mic2"} size={20} />
          {title}
        </h3>
        {isActive && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
            АКТИВНА
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {info.exists ? (
          <div className="text-sm">
            <div className="text-green-600 font-medium mb-2">
              <Icon name="CheckCircle" size={16} className="inline mr-1" />
              {info.count} файлов загружено
            </div>
            <div className="text-gray-600">
              Ячейки: {info.cells.slice(0, 10).join(', ')}
              {info.count > 10 && '...'}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">Не загружена</div>
        )}
        
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            onClick={onSelect}
            className="flex-1"
          >
            Выбрать
          </Button>
          {info.exists && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={onTest}
                className={`text-${colorScheme}-600`}
              >
                <Icon name="Play" size={16} />
              </Button>
              {!isActive && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onActivate}
                  className="text-green-600"
                >
                  <Icon name="Power" size={16} />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={onClear}
                className="text-red-600"
              >
                <Icon name="Trash" size={16} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceVariantCard;