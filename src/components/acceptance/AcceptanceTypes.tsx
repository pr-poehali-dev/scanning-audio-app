// Типы и интерфейсы для системы приемки

export type AcceptanceStep = 'box' | 'items' | 'location' | 'complete';

export interface AcceptanceItem {
  id: string;
  barcode: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'accepted' | 'damaged' | 'rejected';
  timestamp: string;
  cellNumber?: number; // Номер ячейки
}

export interface AcceptanceTabProps {
  playAudio: (audioName: string) => void;
  customAudioFiles: Record<string, string>;
}

export interface AcceptanceStepsProps {
  currentStep: AcceptanceStep;
  setCurrentStep: (step: AcceptanceStep) => void;
  boxBarcode: string;
  acceptanceItems: AcceptanceItem[];
  setShowScanner: (show: boolean) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  handleQRScan: (data: string) => void;
  playAcceptanceAudio: (action: string, itemData?: any) => Promise<boolean>;
  setAcceptanceItems: React.Dispatch<React.SetStateAction<AcceptanceItem[]>>;
}

export interface AcceptanceAudioUtilsProps {
  playAudio: (audioName: string) => void;
  customAudioFiles: Record<string, string>;
}

export interface AcceptanceAnalyzerProps {
  customAudioFiles: Record<string, string>;
  audioTranscriptions: Record<string, string>;
  setAudioTranscriptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  acceptanceItems: AcceptanceItem[];
  changeItemStatus: (itemId: string, status: AcceptanceItem['status']) => void;
  playAcceptanceAudio: (action: string, itemData?: any) => Promise<boolean>;
}