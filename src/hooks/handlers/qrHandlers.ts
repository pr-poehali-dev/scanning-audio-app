import { useCallback } from 'react';
import { findOrderByPhone } from '@/data/mockOrders';

interface QRHandlersProps {
  activeTab: string;
  deliveryStep: string;
  customAudioFiles: Record<string, string>;
  playAudio: (key: string) => Promise<void>;
  setIsScanning: (value: boolean) => void;
  setShowQRScanner: (value: boolean) => void;
  setCurrentOrder: (order: any) => void;
  setDeliveryStep: (step: any) => void;
  setScannedData: (data: string) => void;
  setIsProductScanned: (value: boolean) => void;
}

// Функция для озвучки ячейки с множественными попытками
export const playCellAudioSafely = async (
  cellNumber: string, 
  playAudio: (key: string) => Promise<void>
): Promise<boolean> => {
  const cellAudioKeys = [
    'cell-number',        // Универсальная озвучка (приоритет!)
    cellNumber,           // Конкретный номер
    `cell-${cellNumber}`, // cell-123
    `ячейка-${cellNumber}` // ячейка-123
  ];
  
  for (const key of cellAudioKeys) {
    try {
      await playAudio(key);
      console.log(`✅ ОЗВУЧКА ЯЧЕЙКИ НАЙДЕНА: ${key}`);
      return true;
    } catch (error) {
      console.log(`⚠️ Не найден ключ: ${key}`);
    }
  }
  
  console.warn(`❌ ОЗВУЧКА ДЛЯ ЯЧЕЙКИ "${cellNumber}" НЕ НАЙДЕНА!`);
  return false;
};

export const createQRHandlers = (props: QRHandlersProps) => {
  const {
    activeTab, deliveryStep, customAudioFiles, playAudio,
    setIsScanning, setShowQRScanner, setCurrentOrder, setDeliveryStep,
    setScannedData, setIsProductScanned
  } = props;

  // Обработчик QR сканирования
  const handleQRScan = useCallback(async () => {
    if (activeTab === 'delivery') {
      // Фиктивное сканирование для вкладки выдачи
      setIsScanning(true);
      
      // Мгновенный поиск заказа без задержки - используем актуальные телефоны
      const testPhones = ['7589', '4321', '8899', '1144', '3366']; // 7589 = Елена Иванова
      const randomPhone = testPhones[Math.floor(Math.random() * testPhones.length)];
      const order = findOrderByPhone(randomPhone);
      
      // Небольшая задержка только для визуального эффекта сканирования
      setTimeout(async () => {
        
        if (order) {
          console.log('🎯 ЗАКАЗ НАЙДЕН! Устанавливаем deliveryStep = client-scanned');
          setCurrentOrder(order);
          setDeliveryStep('client-scanned');
          setScannedData(`qr-${order.id}-${order.phone}`);
          
          console.log('📋 Данные заказа:', {
            customerName: order.customerName, 
            cellNumber: order.cellNumber,
            itemsCount: order.items?.length || 0
          });
          
          // Генерируем случайный номер ячейки от 1 до 482
          const randomCellNumber = Math.floor(Math.random() * 482) + 1;
          order.cellNumber = randomCellNumber.toString();
          
          // УПРОЩЕННАЯ И НАДЕЖНАЯ озвучка ячейки
          console.log(`🏠 === НАДЕЖНАЯ ОЗВУЧКА ЯЧЕЙКИ ${order.cellNumber} ===`);
          
          await playCellAudioSafely(order.cellNumber, playAudio);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Озвучиваем скидку
          console.log('🔊 ПОПЫТКА ВОСПРОИЗВЕСТИ СКИДКУ...');
          try {
            await playAudio('discount');
          } catch (error) {
            console.log('⚠️ Аудио скидки не найдено');
          }
          
          // НЕМЕДЛЕННО ОБНОВЛЯЕМ ИНТЕРФЕЙС
          setIsScanning(false);
          
        } else {
          console.log('❌ Заказ не найден. Пробуем тестовые номера...');
          
          // Если не найден, пробуем тестовые заказы
          const testOrder = findOrderByPhone('7589'); // Елена Иванова
          if (testOrder) {
            setCurrentOrder(testOrder);
            setDeliveryStep('client-scanned');
            
            await playCellAudioSafely(testOrder.cellNumber, playAudio);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
              await playAudio('discount');
            } catch (error) {
              console.log('⚠️ Аудио скидки не найдено');
            }
          }
          
          // НЕМЕДЛЕННО ОБНОВЛЯЕМ ИНТЕРФЕЙС
          setIsScanning(false);
        }
        
      }, 300); // Минимальная задержка для визуального эффекта
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
          
          // ИСПРАВЛЕННАЯ ОЗВУЧКА ЯЧЕЙКИ
          console.log(`🔊 Озвучиваем ячейку: ${order.cellNumber}`);
          await playCellAudioSafely(order.cellNumber, playAudio);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Озвучиваем скидку
          console.log('🔊 ПОПЫТКА ВОСПРОИЗВЕСТИ СКИДКУ...');
          try {
            await playAudio('discount');
          } catch (error) {
            console.log('⚠️ Аудио скидки не найдено');
          }
          
          // НЕМЕДЛЕННО ОБНОВЛЯЕМ ИНТЕРФЕЙС
          setIsScanning(false);
          
        } else {
          console.log('❌ Заказ не найден. Пробуем тестовые номера...');
          
          // Если не найден, пробуем тестовые заказы
          const testOrder = findOrderByPhone('7589'); // Елена Иванова
          if (testOrder) {
            setCurrentOrder(testOrder);
            setDeliveryStep('client-scanned');
            
            await playCellAudioSafely(testOrder.cellNumber, playAudio);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
              await playAudio('discount');
            } catch (error) {
              console.log('⚠️ Аудио скидки не найдено');
            }
          }
          
          // НЕМЕДЛЕННО ОБНОВЛЯЕМ ИНТЕРФЕЙС
          setIsScanning(false);
        }
        
      } else if (deliveryStep === 'client-scanned') {
        // Второе сканирование - товар со склада
        console.log('📦 Сканирование товара завершено');
        setDeliveryStep('product-scanned');
        setIsProductScanned(true);
        
        // Озвучиваем "Проверьте товар под камерой"
        try {
          await playAudio('check-product-camera');
        } catch (error) {
          try {
            await playAudio('check-product');
          } catch (error2) {
            console.log('⚠️ Аудио проверки товара не найдено');
          }
        }
        
        // НЕМЕДЛЕННО ОБНОВЛЯЕМ ИНТЕРФЕЙС
        setIsScanning(false);
      }
    } else if (activeTab === 'receiving') {
      // Логика для приемки
      console.log('📦 ПРИЕМКА: Товар отсканирован');
      try {
        await playAudio('receiving-start');
      } catch (error) {
        console.log('⚠️ Аудио приемки не найдено');
      }
      setIsScanning(false);
      
    } else if (activeTab === 'returns') {
      // Логика для возвратов
      console.log('↩️ ВОЗВРАТ: Товар отсканирован');
      try {
        await playAudio('return-start');
      } catch (error) {
        console.log('⚠️ Аудио возврата не найдено');
      }
      setIsScanning(false);
      
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
      
      try {
        await playAudio(audioKey);
      } catch (error) {
        console.log('⚠️ Аудио не найдено');
      }
      setIsScanning(false);
    }
  }, [playAudio, activeTab, deliveryStep, customAudioFiles, setScannedData, setIsScanning, setCurrentOrder, setDeliveryStep, setIsProductScanned]);

  return {
    handleQRScan,
    handleQRScanResult
  };
};