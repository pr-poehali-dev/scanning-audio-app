import { useCallback } from 'react';
import { findOrderByPhone } from '@/data/mockOrders';

interface QRHandlersProps {
  activeTab: string;
  deliveryStep: string;
  playAudio?: (phraseKey: string, cellNumber?: number, itemCount?: number) => void;
  setIsScanning: (value: boolean) => void;
  setShowQRScanner: (value: boolean) => void;
  setCurrentOrder: (order: any) => void;
  setDeliveryStep: (step: any) => void;
  setScannedData: (data: string) => void;
  setIsProductScanned: (value: boolean) => void;
}

export const createQRHandlers = (props: QRHandlersProps) => {
  const {
    activeTab, deliveryStep, playAudio,
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
          setCurrentOrder(order);
          setDeliveryStep('client-scanned');
          setScannedData(`qr-${order.id}-${order.phone}`);
          
          console.log('✅ Заказ найден:', order.customerName, 'Ячейка:', order.cellNumber);
          
          // Генерируем случайный номер ячейки от 1 до 482
          const randomCellNumber = Math.floor(Math.random() * 482) + 1;
          order.cellNumber = randomCellNumber.toString();
          
          console.log(`🏠 Ячейка назначена: ${order.cellNumber}`);
          
          // Озвучка: номер ячейки, товары, оплата
          const itemCount = order.items?.length || 0;
          if (playAudio) {
            playAudio('delivery-cell-info', randomCellNumber, itemCount);
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
          }
          
          // НЕМЕДЛЕННО ОБНОВЛЯЕМ ИНТЕРФЕЙС
          setIsScanning(false);
        }
        
      }, 300); // Минимальная задержка для визуального эффекта
    } else if (activeTab === 'acceptance') {
      // Расширенное сканирование для приемки
      console.log('📦 ПРИЕМКА: Фиктивное сканирование товара');
      setIsScanning(true);
      
      setTimeout(async () => {
        console.log('✅ ПРИЕМКА: Товар отсканирован');
        setIsScanning(false);
      }, 2000);
      
    } else if (activeTab === 'returns') {
      // Расширенное сканирование для возврата
      console.log('↩️ ВОЗВРАТ: Фиктивное сканирование товара для возврата');
      setIsScanning(true);
      
      setTimeout(async () => {
        console.log('✅ ВОЗВРАТ: Товар отсканирован для возврата');
        setIsScanning(false);
      }, 2000);
      
    } else {
      // Для других вкладок открываем настоящий сканер
      setShowQRScanner(true);
    }
  }, [activeTab, setIsScanning, setShowQRScanner, setCurrentOrder, setDeliveryStep, setScannedData]);

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
          
          console.log(`🏠 Ячейка: ${order.cellNumber}`);
          
          // НЕМЕДЛЕННО ОБНОВЛЯЕМ ИНТЕРФЕЙС
          setIsScanning(false);
          
        } else {
          console.log('❌ Заказ не найден. Пробуем тестовые номера...');
          
          // Если не найден, пробуем тестовые заказы
          const testOrder = findOrderByPhone('7589'); // Елена Иванова
          if (testOrder) {
            setCurrentOrder(testOrder);
            setDeliveryStep('client-scanned');
          }
          
          // НЕМЕДЛЕННО ОБНОВЛЯЕМ ИНТЕРФЕЙС
          setIsScanning(false);
        }
        
      } else if (deliveryStep === 'client-scanned') {
        // Второе сканирование - товар со склада
        console.log('📦 Сканирование товара завершено');
        setDeliveryStep('product-scanned');
        setIsProductScanned(true);
        
        // Озвучка: проверьте товар
        if (playAudio) {
          playAudio('delivery-check-product');
        }
        
        // НЕМЕДЛЕННО ОБНОВЛЯЕМ ИНТЕРФЕЙС
        setIsScanning(false);
      }
    } else if (activeTab === 'receiving') {
      // Логика для приемки
      console.log('📦 ПРИЕМКА: Товар отсканирован');
      setIsScanning(false);
      
    } else if (activeTab === 'returns') {
      // Логика для возвратов
      console.log('↩️ ВОЗВРАТ: Товар отсканирован');
      setIsScanning(false);
      
    } else {
      console.log('📱 QR сканирование завершено');
      setIsScanning(false);
    }
  }, [activeTab, deliveryStep, setScannedData, setIsScanning, setCurrentOrder, setDeliveryStep, setIsProductScanned]);

  return {
    handleQRScan,
    handleQRScanResult
  };
};