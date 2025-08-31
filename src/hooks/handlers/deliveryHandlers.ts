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

  return {
    handlePhoneSubmit,
    handleScanProduct,
    handleDeliverProduct,
    handleTabChange
  };
};