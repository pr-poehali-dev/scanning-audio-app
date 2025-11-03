import { PvzInfo, AudioSettings } from './useAppState';
import { createQRHandlers } from './handlers/qrHandlers';
import { createDeliveryHandlers } from './handlers/deliveryHandlers';
import { createSettingsHandlers } from './handlers/settingsHandlers';

interface UseAppHandlersProps {
  activeTab: string;
  deliveryStep: string;
  currentOrder: any;
  expandedMenuItems: Record<string, boolean>;
  audioSettings: AudioSettings;
  playAudio?: (phraseKey: string, cellNumber?: number) => void;
  setIsScanning: (value: boolean) => void;
  setShowQRScanner: (value: boolean) => void;
  setCurrentOrder: (order: any) => void;
  setDeliveryStep: (step: any) => void;
  setScannedData: (data: string) => void;
  setIsProductScanned: (value: boolean) => void;
  setPhoneNumber: (value: string) => void;
  setExpandedMenuItems: (items: Record<string, boolean>) => void;
  setPvzInfo: (info: PvzInfo) => void;
  setAudioSettings: (settings: AudioSettings) => void;
  activeClients: any[];
  setActiveClients: (clients: any[]) => void;
  currentClientId: string | null;
  setCurrentClientId: (id: string | null) => void;
}

export const useAppHandlers = (props: UseAppHandlersProps) => {
  const {
    activeTab, deliveryStep, currentOrder, expandedMenuItems, audioSettings, playAudio,
    setIsScanning, setShowQRScanner, setCurrentOrder, 
    setDeliveryStep, setScannedData, setIsProductScanned, setPhoneNumber,
    setExpandedMenuItems, setPvzInfo, setAudioSettings,
    activeClients, setActiveClients, currentClientId, setCurrentClientId
  } = props;

  // Создаем обработчики QR
  const qrHandlers = createQRHandlers({
    activeTab,
    deliveryStep,
    playAudio,
    setIsScanning,
    setShowQRScanner,
    setCurrentOrder,
    setDeliveryStep,
    setScannedData,
    setIsProductScanned,
    activeClients,
    setActiveClients,
    currentClientId,
    setCurrentClientId
  });

  // Создаем обработчики доставки
  const deliveryHandlers = createDeliveryHandlers({
    currentOrder,
    setCurrentOrder,
    setDeliveryStep,
    setIsProductScanned,
    setScannedData,
    setPhoneNumber,
    playAudio,
    activeClients,
    setActiveClients,
    currentClientId,
    setCurrentClientId
  });

  // Создаем обработчики настроек
  const settingsHandlers = createSettingsHandlers({
    expandedMenuItems,
    setExpandedMenuItems,
    setPvzInfo,
    setAudioSettings
  });

  // Заглушка для клика по ячейке (без аудио)
  const handleCellClick = (cellNumber: string) => {
    console.log(`Клик по ячейке: ${cellNumber}`);
  };

  return {
    handleQRScan: qrHandlers.handleQRScan,
    handleQRScanResult: qrHandlers.handleQRScanResult,
    handlePhoneSubmit: deliveryHandlers.handlePhoneSubmit,
    handleCellClick,
    handleScanProduct: deliveryHandlers.handleScanProduct,
    handleDeliverProduct: deliveryHandlers.handleDeliverProduct,
    handleTabChange: deliveryHandlers.handleTabChange,
    handleClientSwitch: deliveryHandlers.handleClientSwitch,
    toggleMenuItem: settingsHandlers.toggleMenuItem,
    updatePvzInfo: settingsHandlers.updatePvzInfo,
    updateAudioSetting: settingsHandlers.updateAudioSetting,
  };
};