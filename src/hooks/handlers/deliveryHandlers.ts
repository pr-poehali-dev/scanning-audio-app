import { useCallback } from 'react';
import { findOrderByPhone } from '@/data/mockOrders';
import { playCellAudioSafely } from './qrHandlers';

interface DeliveryHandlersProps {
  customAudioFiles: Record<string, string>;
  currentOrder: any;
  playAudio: (key: string) => Promise<void>;
  setCurrentOrder: (order: any) => void;
  setDeliveryStep: (step: any) => void;
  setIsProductScanned: (value: boolean) => void;
  setScannedData: (data: string) => void;
  setPhoneNumber: (value: string) => void;
}

export const createDeliveryHandlers = (props: DeliveryHandlersProps) => {
  const {
    customAudioFiles, currentOrder, playAudio, setCurrentOrder,
    setDeliveryStep, setIsProductScanned, setScannedData, setPhoneNumber
  } = props;

  // Обработчик ввода номера телефона
  const handlePhoneSubmit = useCallback(async (lastFourDigits: string) => {
    const order = findOrderByPhone(lastFourDigits);
    if (order) {
      setCurrentOrder(order);
      setDeliveryStep('client-scanned');
      
      // Озвучиваем номер ячейки и про скидку
      await playCellAudioSafely(order.cellNumber, playAudio);
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

  // Обработчик сканирования товара
  const handleScanProduct = useCallback(async () => {
    // Эмуляция сканирования товара
    setDeliveryStep('product-scanned');
    setIsProductScanned(true);
    if (currentOrder) {
      setScannedData(currentOrder.items.map((item: any) => item.barcode).join(','));
    }
    
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
  }, [currentOrder, playAudio, setDeliveryStep, setIsProductScanned, setScannedData]);

  // Обработчик выдачи товара
  const handleDeliverProduct = useCallback(async () => {
    // Устанавливаем состояние завершения
    setDeliveryStep('completed');
    
    // Финальная выдача товара с озвучкой "Оцените наш ПВЗ"
    try {
      await playAudio('rate-service');
    } catch (error) {
      console.log('⚠️ Аудио оценки не найдено');
    }
    
    // Сброс состояния через некоторое время
    setTimeout(() => {
      setDeliveryStep('initial');
      setCurrentOrder(null);
      setIsProductScanned(false);
      setScannedData('');
    }, 5000); // Увеличиваем время для показа сообщения
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

  return {
    handlePhoneSubmit,
    handleScanProduct,
    handleDeliverProduct,
    handleTabChange
  };
};