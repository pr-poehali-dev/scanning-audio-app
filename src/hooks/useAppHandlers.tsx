import { useCallback } from 'react';
import { findOrderByPhone } from '@/data/mockOrders';
import { PvzInfo, AudioSettings } from './useAppState';

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

  // Обработчик QR сканирования
  const handleQRScan = useCallback(async () => {
    if (activeTab === 'delivery') {
      // Фиктивное сканирование для вкладки выдачи
      setIsScanning(true);
      
      // Эмулируем процесс сканирования
      setTimeout(async () => {
        // Берем случайный тестовый заказ
        const testPhones = ['5667', '3321', '8899', '1144', '3366'];
        const randomPhone = testPhones[Math.floor(Math.random() * testPhones.length)];
        const order = findOrderByPhone(randomPhone);
        
        if (order) {
          setCurrentOrder(order);
          setDeliveryStep('client-scanned');
          setScannedData(`qr-${order.id}-${order.phone}`);
          
          console.log('Заказ найден:', order.customerName, 'Ячейка:', order.cellNumber);
          
          // Озвучиваем номер ячейки и про скидку
          // Пробуем несколько вариантов названий аудиофайлов для ячейки
          try {
            await playAudio(order.cellNumber); // A12, B05, C07, D13, E09
          } catch {
            try {
              await playAudio(`cell-${order.cellNumber}`); // cell-A12
            } catch {
              await playAudio(`ячейка-${order.cellNumber}`); // ячейка-A12
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          await playAudio('discount');
        }
        
        setIsScanning(false);
      }, 1500); // Имитируем задержку сканирования
    } else if (activeTab === 'acceptance') {
      // Расширенное сканирование для приемки с умной озвучкой
      console.log('📦 ПРИЕМКА: Фиктивное сканирование товара');
      setIsScanning(true);
      
      setTimeout(async () => {
        console.log('✅ ПРИЕМКА: Товар отсканирован');
        
        // Пытаемся озвучить различные варианты аудио для приемки
        const acceptanceAudios = [
          'acceptance-Принято в ПВЗ',
          'Принято в ПВЗ', 
          'acceptance-scan-success',
          'scan-success',
          'acceptance-товар найден'
        ];
        
        let audioPlayed = false;
        for (const audioKey of acceptanceAudios) {
          if (customAudioFiles[audioKey]) {
            await playAudio(audioKey);
            audioPlayed = true;
            console.log(`🔊 ПРИЕМКА: Проиграл аудио "${audioKey}"`);
            break;
          }
        }
        
        if (!audioPlayed) {
          console.log('⚠️ ПРИЕМКА: Аудиофайлы для приемки не найдены');
        }
        
        setIsScanning(false);
      }, 2000);
      
    } else if (activeTab === 'returns') {
      // Расширенное сканирование для возврата с умной озвучкой
      console.log('↩️ ВОЗВРАТ: Фиктивное сканирование товара для возврата');
      setIsScanning(true);
      
      setTimeout(async () => {
        console.log('✅ ВОЗВРАТ: Товар отсканирован для возврата');
        
        // Пытаемся озвучить различные варианты аудио для возврата
        const returnAudios = [
          'returns-Возврат оформлен',
          'Возврат оформлен',
          'returns-scan-success', 
          'return-success',
          'returns-товар найден'
        ];
        
        let audioPlayed = false;
        for (const audioKey of returnAudios) {
          if (customAudioFiles[audioKey]) {
            await playAudio(audioKey);
            audioPlayed = true;
            console.log(`🔊 ВОЗВРАТ: Проиграл аудио "${audioKey}"`);
            break;
          }
        }
        
        if (!audioPlayed) {
          console.log('⚠️ ВОЗВРАТ: Аудиофайлы для возврата не найдены');
        }
        
        setIsScanning(false);
      }, 2000);
      
    } else {
      // Для других вкладок открываем настоящий сканер
      setShowQRScanner(true);
    }
  }, [activeTab, playAudio, setIsScanning, setShowQRScanner, setCurrentOrder, setDeliveryStep, setScannedData]);

  // Обработчик результата QR сканирования
  const handleQRScanResult = useCallback(async (data: string) => {
    console.log('📱 QR код отсканирован:', data);
    setScannedData(data);
    setIsScanning(true);
    
    if (activeTab === 'delivery') {
      if (deliveryStep === 'initial') {
        // Первое сканирование - QR клиента/курьера
        console.log('🔍 Поиск заказа по данным сканирования...');
        
        // Пытаемся извлечь номер телефона из QR кода
        let phoneDigits = '';
        
        // Ищем 4 цифры подряд в конце строки (последние 4 цифры телефона)
        const phoneMatch = data.match(/(\d{4})$/);
        if (phoneMatch) {
          phoneDigits = phoneMatch[1];
        } else {
          // Ищем любые 4 цифры в строке
          const allDigits = data.replace(/\D/g, '');
          if (allDigits.length >= 4) {
            phoneDigits = allDigits.slice(-4);
          }
        }
        
        console.log('📞 Найденные последние 4 цифры телефона:', phoneDigits);
        
        // Ищем заказ
        const order = findOrderByPhone(phoneDigits);
        
        if (order) {
          console.log('✅ Заказ найден:', order);
          setCurrentOrder(order);
          setDeliveryStep('client-scanned');
          
          // Озвучиваем номер ячейки и про скидку
          console.log('🔊 Озвучиваем ячейку:', order.cellNumber);
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('🔊 ПОПЫТКА ВОСПРОИЗВЕСТИ СКИДКУ...');
          console.log('📁 customAudioFiles:', customAudioFiles);
          await playAudio('discount');
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          await playAudio(`cell-${order.cellNumber}`);
        } else {
          console.log('❌ Заказ не найден. Пробуем тестовые номера...');
          
          // Если не найден, пробуем тестовые заказы
          const testOrder = findOrderByPhone('5667');
          if (testOrder) {
            setCurrentOrder(testOrder);
            setDeliveryStep('client-scanned');
            
            await playAudio(`cell-${testOrder.cellNumber}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await playAudio('discount');
          }
        }
        
      } else if (deliveryStep === 'client-scanned') {
        // Второе сканирование - товар со склада
        console.log('📦 Сканирование товара завершено');
        setDeliveryStep('product-scanned');
        setIsProductScanned(true);
        
        // Озвучиваем "Проверьте товар под камерой"
        await playAudio('check-product-camera');
      }
    } else if (activeTab === 'receiving') {
      // Логика для приемки
      console.log('📦 ПРИЕМКА: Товар отсканирован');
      await playAudio('receiving-start');
      
    } else if (activeTab === 'returns') {
      // Логика для возвратов
      console.log('↩️ ВОЗВРАТ: Товар отсканирован');
      await playAudio('return-start');
      
    } else {
      // Старая логика для других вкладок
      let audioKey = 'scan-success';
      
      if (data.includes('check_product') || data.includes('проверь')) {
        audioKey = 'check-product-camera';
      } else if (data.includes('discount') || data.includes('скидка')) {
        audioKey = 'discount';
      } else if (data.includes('rate') || data.includes('оцените')) {
        audioKey = 'rate-pickup-point';
      } else if (data.includes('client') || data.includes('клиент')) {
        audioKey = 'client-found';
      }
      
      await playAudio(audioKey);
    }
    
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  }, [playAudio, activeTab, deliveryStep, customAudioFiles, setScannedData, setIsScanning, setCurrentOrder, setDeliveryStep, setIsProductScanned]);

  // Обработчик ввода номера телефона
  const handlePhoneSubmit = useCallback(async (lastFourDigits: string) => {
    const order = findOrderByPhone(lastFourDigits);
    if (order) {
      setCurrentOrder(order);
      setDeliveryStep('client-scanned');
      
      // Озвучиваем номер ячейки и про скидку
      // Пробуем несколько вариантов названий аудиофайлов для ячейки
      try {
        await playAudio(order.cellNumber); // A12, B05, C07, D13, E09
      } catch {
        try {
          await playAudio(`cell-${order.cellNumber}`); // cell-A12
        } catch {
          await playAudio(`ячейка-${order.cellNumber}`); // ячейка-A12
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔊 ПОПЫТКА ВОСПРОИЗВЕСТИ СКИДКУ...');
      console.log('📁 customAudioFiles:', customAudioFiles);
      await playAudio('discount');
      
      // Очищаем номер телефона
      setPhoneNumber('');
    } else {
      alert('Заказ не найден');
    }
  }, [playAudio, setPhoneNumber, setCurrentOrder, setDeliveryStep, customAudioFiles]);

  // Обработчик клика по ячейке
  const handleCellClick = useCallback(async (cellNumber: string) => {
    console.log(`🏠 КЛИК ПО ЯЧЕЙКЕ: "${cellNumber}"`);
    
    // Пробуем разные варианты названий файлов
    const cellAudioKeys = [
      cellNumber,           // 123
      `cell-${cellNumber}`, // cell-123  
      `ячейка-${cellNumber}`, // ячейка-123
      `${cellNumber}.mp3`,    // 123.mp3
      `${cellNumber}.wav`     // 123.wav
    ];
    
    console.log(`🎯 Пробуем ключи для ячейки:`, cellAudioKeys);
    
    for (const key of cellAudioKeys) {
      try {
        await playAudio(key);
        console.log(`✅ ОЗВУЧКА ЯЧЕЙКИ НАЙДЕНА: ${key}`);
        return; // Успешно воспроизвели
      } catch (error) {
        console.log(`⚠️ Не найден ключ: ${key}`);
      }
    }
    
    console.warn(`❌ ОЗВУЧКА ДЛЯ ЯЧЕЙКИ "${cellNumber}" НЕ НАЙДЕНА!`);
  }, [playAudio]);

  // Обработчик сканирования товара
  const handleScanProduct = useCallback(async () => {
    // Эмуляция сканирования товара
    setIsProductScanned(true);
    if (currentOrder) {
      setScannedData(currentOrder.items.map((item: any) => item.barcode).join(','));
    }
    
    // Озвучиваем "Проверьте товар под камерой"
    await playAudio('check-product');
  }, [currentOrder, playAudio, setIsProductScanned, setScannedData]);

  // Обработчик выдачи товара
  const handleDeliverProduct = useCallback(async () => {
    // Финальная выдача товара с озвучкой "Оцените наш ПВЗ"
    await playAudio('rate-service');
    
    // Сброс состояния через некоторое время
    setTimeout(() => {
      setDeliveryStep('initial');
      setCurrentOrder(null);
      setIsProductScanned(false);
      setScannedData('');
    }, 3000);
  }, [playAudio, setDeliveryStep, setCurrentOrder, setIsProductScanned, setScannedData]);

  // Обработчик смены вкладки
  const handleTabChange = useCallback((tab: string) => {
    if (tab !== 'delivery') {
      setDeliveryStep('initial');
      setCurrentOrder(null);
      setIsProductScanned(false);
      setScannedData('');
    }
  }, [setDeliveryStep, setCurrentOrder, setIsProductScanned, setScannedData]);

  // Обработчики для меню и настроек
  const toggleMenuItem = useCallback((item: string) => {
    const newExpanded = {
      ...expandedMenuItems,
      [item]: !expandedMenuItems[item]
    };
    setExpandedMenuItems(newExpanded);
    localStorage.setItem('wb-pvz-expanded-menu', JSON.stringify(newExpanded));
  }, [expandedMenuItems, setExpandedMenuItems]);

  const updatePvzInfo = useCallback((field: string, value: string) => {
    setPvzInfo(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem(`wb-pvz-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
      return updated;
    });
  }, [setPvzInfo]);

  const updateAudioSetting = useCallback((key: string, value: any) => {
    setAudioSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(`wb-pvz-audio-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, 
        typeof value === 'object' ? JSON.stringify(value) : String(value)
      );
      return updated;
    });
  }, [setAudioSettings]);

  return {
    handleQRScan,
    handleQRScanResult,
    handlePhoneSubmit,
    handleCellClick,
    handleScanProduct,
    handleDeliverProduct,
    handleTabChange,
    toggleMenuItem,
    updatePvzInfo,
    updateAudioSetting,
  };
};