import { PvzInfo, AudioSettings } from './useAppState';
import { createQRHandlers } from './handlers/qrHandlers';
import { createDeliveryHandlers } from './handlers/deliveryHandlers';
import { createCellAudioHandlers } from './handlers/cellAudioHandlers';
import { createSettingsHandlers } from './handlers/settingsHandlers';

interface UseAppHandlersProps {
  activeTab: string;
  deliveryStep: string;
  currentOrder: any;
  customAudioFiles: Record<string, string>;
  expandedMenuItems: Record<string, boolean>;
  audioSettings: AudioSettings;
  playAudio: (key: string) => Promise<void>;
  updateAudioFiles: (files: Record<string, string>) => void;
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
}

export const useAppHandlers = (props: UseAppHandlersProps) => {
  const {
    activeTab, deliveryStep, currentOrder, customAudioFiles, expandedMenuItems, audioSettings,
    playAudio, updateAudioFiles, setIsScanning, setShowQRScanner, setCurrentOrder, 
    setDeliveryStep, setScannedData, setIsProductScanned, setPhoneNumber,
    setExpandedMenuItems, setPvzInfo, setAudioSettings
  } = props;

  // Создаем обработчики QR
  const qrHandlers = createQRHandlers({
    activeTab,
    deliveryStep,
    customAudioFiles,
    playAudio,
    setIsScanning,
    setShowQRScanner,
    setCurrentOrder,
    setDeliveryStep,
    setScannedData,
    setIsProductScanned
  });

  // Создаем обработчики доставки
  const deliveryHandlers = createDeliveryHandlers({
    customAudioFiles,
    currentOrder,
    playAudio,
    setCurrentOrder,
    setDeliveryStep,
    setIsProductScanned,
    setScannedData,
    setPhoneNumber
  });

  // Создаем обработчики озвучки ячеек
  const cellAudioHandlers = createCellAudioHandlers({
    playAudio
  });

  // Создаем обработчики настроек
  const settingsHandlers = createSettingsHandlers({
    expandedMenuItems,
    setExpandedMenuItems,
    setPvzInfo,
    setAudioSettings
  });

  // Обработчики системных звуков
  const handleDiscountAudio = async () => {
    try {
      await playAudio('discount');
    } catch (error) {
      console.error('Ошибка воспроизведения скидки:', error);
    }
  };

  const handleCheckProductAudio = async () => {
    try {
      await playAudio('check-product-camera');
    } catch (error) {
      console.error('Ошибка воспроизведения проверки товара:', error);
    }
  };

  const handleRatePvzAudio = async () => {
    try {
      await playAudio('rate-pvz');
    } catch (error) {
      console.error('Ошибка воспроизведения оценки ПВЗ:', error);
    }
  };

  return {
    handleQRScan: qrHandlers.handleQRScan,
    handleQRScanResult: qrHandlers.handleQRScanResult,
    handlePhoneSubmit: deliveryHandlers.handlePhoneSubmit,
    handleCellClick: cellAudioHandlers.handleCellClick,
    handleScanProduct: deliveryHandlers.handleScanProduct,
    handleDeliverProduct: deliveryHandlers.handleDeliverProduct,
    handleTabChange: deliveryHandlers.handleTabChange,
    toggleMenuItem: settingsHandlers.toggleMenuItem,
    updatePvzInfo: settingsHandlers.updatePvzInfo,
    updateAudioSetting: settingsHandlers.updateAudioSetting,
    handleDiscountAudio,
    handleCheckProductAudio,
    handleRatePvzAudio,
  };
};