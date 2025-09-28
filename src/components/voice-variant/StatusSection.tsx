import React from 'react';
import Icon from '@/components/ui/icon';

interface VoiceVariantInfo {
  count: number;
  exists: boolean;
  cells: string[];
}

interface StatusSectionProps {
  standardInfo: VoiceVariantInfo;
  alternativeInfo: VoiceVariantInfo;
  activeVariant: string | null;
}

const StatusSection: React.FC<StatusSectionProps> = ({
  standardInfo,
  alternativeInfo,
  activeVariant
}) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
        <Icon name="BarChart3" size={16} />
        Текущее состояние:
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-green-700">
            <strong>Стандартная:</strong> {standardInfo.count} файлов
            {activeVariant === 'standard' && ' (активна)'}
          </div>
        </div>
        <div>
          <div className="text-green-700">
            <strong>Альтернативная:</strong> {alternativeInfo.count} файлов
            {activeVariant === 'alternative' && ' (активна)'}
          </div>
        </div>
      </div>
      
      {!activeVariant && (
        <div className="mt-2 text-orange-600 text-sm">
          ⚠️ Нет активного варианта озвучки
        </div>
      )}
    </div>
  );
};

export default StatusSection;