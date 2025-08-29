import { useState, useEffect } from 'react';
import { Order } from '@/data/mockOrders';

export interface PvzInfo {
  id: string;
  address: string;
  employeeId: string;
}

export interface AudioSettings {
  speed: number;
  activeTab: string;
  phrases: Record<string, any>;
  enabled: Record<string, boolean>;
}

export const useAppState = () => {
  // Основные состояния интерфейса
  const [activeTab, setActiveTab] = useState('acceptance');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');

  // Состояния процесса выдачи
  const [deliveryStep, setDeliveryStep] = useState<'initial' | 'client-scanned' | 'product-scanned' | 'completed'>('initial');
  const [isProductScanned, setIsProductScanned] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Состояния меню и настроек
  const [expandedMenuItems, setExpandedMenuItems] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem('wb-pvz-expanded-menu');
    return saved ? JSON.parse(saved) : { settings: false };
  });

  const [pvzInfo, setPvzInfo] = useState<PvzInfo>({
    id: localStorage.getItem('wb-pvz-id') || '',
    address: localStorage.getItem('wb-pvz-address') || '',
    employeeId: localStorage.getItem('wb-pvz-employee-id') || ''
  });

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    speed: parseFloat(localStorage.getItem('wb-pvz-audio-speed') || '1'),
    activeTab: localStorage.getItem('wb-pvz-audio-tab') || 'delivery',
    phrases: JSON.parse(localStorage.getItem('wb-pvz-audio-phrases') || '{}'),
    enabled: JSON.parse(localStorage.getItem('wb-pvz-audio-enabled') || '{}')
  });

  // Восстанавливаем информацию о загруженных аудиофайлах при запуске
  useEffect(() => {
    const savedAudioFiles = localStorage.getItem('wb-pvz-uploaded-audio-files');
    if (savedAudioFiles) {
      try {
        const fileNames = JSON.parse(savedAudioFiles);
        console.log(`🔄 Найдено ${fileNames.length} сохраненных аудиофайлов в localStorage`);
        // Здесь могли бы восстановить файлы, но URL объекты не переживают перезагрузку
        // Показываем пользователю информацию о том, что файлы нужно загрузить заново
      } catch (e) {
        console.warn('Ошибка восстановления списка аудиофайлов:', e);
      }
    }
  }, []);

  return {
    // Основные состояния
    activeTab,
    setActiveTab,
    phoneNumber,
    setPhoneNumber,
    isScanning,
    setIsScanning,
    showQRScanner,
    setShowQRScanner,
    showSettings,
    setShowSettings,
    showSideMenu,
    setShowSideMenu,
    scannedData,
    setScannedData,

    // Состояния процесса выдачи
    deliveryStep,
    setDeliveryStep,
    isProductScanned,
    setIsProductScanned,
    currentOrder,
    setCurrentOrder,

    // Состояния настроек
    expandedMenuItems,
    setExpandedMenuItems,
    pvzInfo,
    setPvzInfo,
    audioSettings,
    setAudioSettings,
  };
};