import React from 'react';
import Icon from '@/components/ui/icon';

const InstructionsSection: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
        <Icon name="Info" size={16} />
        Инструкции по загрузке:
      </h4>
      <ul className="text-sm text-blue-800 space-y-2">
        <li className="flex items-start gap-2">
          <span className="text-blue-600">•</span>
          <span><strong>Имена файлов:</strong> должны содержать номер ячейки (1.mp3, cell_25.wav, audio-150.m4a)</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600">•</span>
          <span><strong>Форматы:</strong> MP3, WAV, M4A, OGG и другие аудиоформаты</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600">•</span>
          <span><strong>Множественная загрузка:</strong> можно выбрать сразу много файлов</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600">•</span>
          <span><strong>Стандартная:</strong> основная озвучка для повседневного использования</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-600">•</span>
          <span><strong>Альтернативная:</strong> дополнительная озвучка (другой голос, язык, стиль)</span>
        </li>
      </ul>
    </div>
  );
};

export default InstructionsSection;