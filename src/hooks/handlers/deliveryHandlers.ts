import { useCallback } from 'react';
import { findOrderByPhone } from '@/data/mockOrders';

interface DeliveryHandlersProps {
  currentOrder: any;
  setCurrentOrder: (order: any) => void;
  setDeliveryStep: (step: any) => void;
  setIsProductScanned: (value: boolean) => void;
  setScannedData: (data: string) => void;
  setPhoneNumber: (value: string) => void;
  playAudio?: (phraseKey: string, cellNumber?: number) => void;
}

export const createDeliveryHandlers = (props: DeliveryHandlersProps) => {
  const {
    currentOrder, setCurrentOrder,
    setDeliveryStep, setIsProductScanned, setScannedData, setPhoneNumber,
    playAudio
  } = props;

  // Обработчик ввода номера телефона
  const handlePhoneSubmit = useCallback(async (lastFourDigits: string) => {
    console.log(`📞 === ПОИСК ЗАКАЗА ПО ТЕЛЕФОНУ: ${lastFourDigits} ===`);
    
    const order = findOrderByPhone(lastFourDigits);
    if (order) {
      console.log(`✅ ЗАКАЗ НАЙДЕН:`, order);
      
      setCurrentOrder(order);
      setDeliveryStep('client-scanned');
      
      // Генерируем случайную ячейку от 1 до 482
      const randomCellNumber = Math.floor(Math.random() * 482) + 1;
      order.cellNumber = randomCellNumber.toString();
      
      console.log(`🏠 Назначена ячейка: ${order.cellNumber}`);
      
      // Озвучка: номер ячейки, количество товаров, оплата
      if (playAudio) {
        playAudio('delivery-cell-info', randomCellNumber);
      }
      
      // Очищаем номер телефона
      setPhoneNumber('');
    } else {
      console.log('❌ Заказ не найден');
      alert('Заказ не найден');
    }
  }, [setPhoneNumber, setCurrentOrder, setDeliveryStep, playAudio]);

  // Обработчик сканирования товара
  const handleScanProduct = useCallback(async () => {
    // Эмуляция сканирования товара
    setDeliveryStep('product-scanned');
    setIsProductScanned(true);
    if (currentOrder) {
      setScannedData(currentOrder.items.map((item: any) => item.barcode).join(','));
    }
    
    // Озвучка: проверьте товар под камерой
    if (playAudio) {
      playAudio('delivery-check-product');
    }
    
    console.log('📦 Товар отсканирован');
  }, [currentOrder, setDeliveryStep, setIsProductScanned, setScannedData, playAudio]);

  // Обработчик выдачи товара
  const handleDeliverProduct = useCallback(async () => {
    // Устанавливаем состояние завершения
    setDeliveryStep('completed');
    
    // Озвучка: спасибо за заказ, оцените ПВЗ
    if (playAudio) {
      playAudio('delivery-thanks');
    }
    
    console.log('✅ Товар выдан');
    
    // Сброс состояния через некоторое время
    setTimeout(() => {
      setDeliveryStep('initial');
      setCurrentOrder(null);
      setIsProductScanned(false);
      setScannedData('');
    }, 5000); // Увеличиваем время для показа сообщения
  }, [setDeliveryStep, setCurrentOrder, setIsProductScanned, setScannedData, playAudio]);

  // Обработчик смены вкладки
  const handleTabChange = useCallback((tab: string) => {
    if (tab !== 'delivery') {
      setDeliveryStep('initial');
      setCurrentOrder(null);
      setIsProductScanned(false);
      setScannedData('');
    }
  }, [setDeliveryStep, setCurrentOrder, setIsProductScanned, setScannedData]);

  return {
    handlePhoneSubmit,
    handleScanProduct,
    handleDeliverProduct,
    handleTabChange
  };
};