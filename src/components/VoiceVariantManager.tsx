import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import VoiceVariantCard from './voice-variant/VoiceVariantCard';
import FileUploadSection from './voice-variant/FileUploadSection';
import InstructionsSection from './voice-variant/InstructionsSection';
import StatusSection from './voice-variant/StatusSection';
import { useVoiceVariantLogic } from './voice-variant/hooks/useVoiceVariantLogic';

interface VoiceVariantManagerProps {
  isOpen?: boolean;
  onClose: () => void;
}

const VoiceVariantManager: React.FC<VoiceVariantManagerProps> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;

  const {
    selectedVariant,
    setSelectedVariant,
    uploadProgress,
    isUploading,
    handleFileSelect,
    getVariantInfo,
    setActiveVariant,
    clearVariant,
    testVariant
  } = useVoiceVariantLogic();

  const standardInfo = getVariantInfo('standard');
  const alternativeInfo = getVariantInfo('alternative');
  const activeVariant = localStorage.getItem('wb-active-voice-variant');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Volume2" />
            Управление вариантами озвучки
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          
          {/* Информация о вариантах */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Стандартная озвучка */}
            <VoiceVariantCard
              variant="standard"
              info={standardInfo}
              isSelected={selectedVariant === 'standard'}
              isActive={activeVariant === 'standard'}
              onSelect={() => setSelectedVariant('standard')}
              onTest={() => testVariant('standard')}
              onActivate={() => setActiveVariant('standard')}
              onClear={() => clearVariant('standard')}
            />

            {/* Альтернативная озвучка */}
            <VoiceVariantCard
              variant="alternative"
              info={alternativeInfo}
              isSelected={selectedVariant === 'alternative'}
              isActive={activeVariant === 'alternative'}
              onSelect={() => setSelectedVariant('alternative')}
              onTest={() => testVariant('alternative')}
              onActivate={() => setActiveVariant('alternative')}
              onClear={() => clearVariant('alternative')}
            />
          </div>

          {/* Загрузка файлов */}
          <FileUploadSection
            selectedVariant={selectedVariant}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onFileSelect={handleFileSelect}
          />

          {/* Инструкции */}
          <InstructionsSection />

          {/* Статистика */}
          <StatusSection
            standardInfo={standardInfo}
            alternativeInfo={alternativeInfo}
            activeVariant={activeVariant}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceVariantManager;