import { useState, useEffect } from 'react';
import { Order, mockOrders } from '@/data/mockOrders';
import { saveOfflineData, getOfflineData } from '@/utils/offlineStorage';

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
  const [activeTab, setActiveTab] = useState('delivery');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showAudioTest, setShowAudioTest] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');

  // Состояния процесса выдачи
  const [deliveryStep, setDeliveryStep] = useState<'initial' | 'client-scanned' | 'product-scanned' | 'completed'>('initial');
  const [isProductScanned, setIsProductScanned] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  // Состояния для работы с несколькими клиентами
  const [activeClients, setActiveClients] = useState<Order[]>([]);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);

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

  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => {
    const savedEnabled = localStorage.getItem('wb-pvz-audio-enabled');
    const defaultEnabled = {
      'delivery-cell-info': true,
      'delivery-scan-items': true,
      'delivery-check-product': true,
      'check-product-under-camera': true,
      'delivery-thanks': true,
      'receiving-start': true,
      'receiving-scan': true,
      'receiving-next': true,
      'receiving-complete': true,
      'return-start': true,
      'return-scan-product': true,
      'return-confirm': true,
      'return-success': true,
      'box_accepted': true,
      'cell-number': true,
      'success_sound': true,
    };
    
    return {
      speed: parseFloat(localStorage.getItem('wb-pvz-audio-speed') || '1'),
      activeTab: localStorage.getItem('wb-pvz-audio-tab') || 'delivery',
      phrases: JSON.parse(localStorage.getItem('wb-pvz-audio-phrases') || '{}'),
      enabled: savedEnabled ? JSON.parse(savedEnabled) : defaultEnabled
    };
  });

  useEffect(() => {
    saveOfflineData(mockOrders);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Приложение онлайн - данные синхронизируются');
      saveOfflineData(mockOrders);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
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
    showAudioTest,
    setShowAudioTest,
    scannedData,
    setScannedData,

    // Состояния процесса выдачи
    deliveryStep,
    setDeliveryStep,
    isProductScanned,
    setIsProductScanned,
    currentOrder,
    setCurrentOrder,
    
    // Состояния для работы с несколькими клиентами
    activeClients,
    setActiveClients,
    currentClientId,
    setCurrentClientId,

    // Состояния настроек
    expandedMenuItems,
    setExpandedMenuItems,
    pvzInfo,
    setPvzInfo,
    audioSettings,
    setAudioSettings,
  };
};