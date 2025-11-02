import { useCallback } from 'react';
import { findOrderByPhone, Order } from '@/data/mockOrders';

interface DeliveryHandlersProps {
  currentOrder: any;
  setCurrentOrder: (order: any) => void;
  setDeliveryStep: (step: any) => void;
  setIsProductScanned: (value: boolean) => void;
  setScannedData: (data: string) => void;
  setPhoneNumber: (value: string) => void;
  playAudio?: (phraseKey: string, cellNumber?: number, itemCount?: number) => void;
  activeClients: Order[];
  setActiveClients: (clients: Order[]) => void;
  currentClientId: string | null;
  setCurrentClientId: (id: string | null) => void;
}

export const createDeliveryHandlers = (props: DeliveryHandlersProps) => {
  const {
    currentOrder, setCurrentOrder,
    setDeliveryStep, setIsProductScanned, setScannedData, setPhoneNumber,
    playAudio, activeClients, setActiveClients, currentClientId, setCurrentClientId
  } = props;

  // Обработчик ввода номера телефона
  const handlePhoneSubmit = useCallback(async (lastFourDigits: string) => {
    console.log(`📞 === ПОИСК ЗАКАЗА ПО ТЕЛЕФОНУ: ${lastFourDigits} ===`);
    
    const order = findOrderByPhone(lastFourDigits);
    if (order) {
      console.log(`✅ ЗАКАЗ НАЙДЕН:`, order);
      
      // Генерируем случайную ячейку от 1 до 482
      const randomCellNumber = Math.floor(Math.random() * 482) + 1;
      const orderWithCell = { ...order, cellNumber: randomCellNumber.toString() };
      
      // Добавляем клиента в список активных
      const updatedClients = [...activeClients, orderWithCell];
      console.log(`👥 Добавляю клиента в список. Было: ${activeClients.length}, Стало: ${updatedClients.length}`);
      console.log(`📋 Клиент:`, { id: orderWithCell.id, cellNumber: orderWithCell.cellNumber, items: orderWithCell.items.length });
      setActiveClients(updatedClients);
      setCurrentClientId(orderWithCell.id);
      setCurrentOrder(orderWithCell);
      setDeliveryStep('client-scanned');
      
      console.log(`🏠 Назначена ячейка: ${orderWithCell.cellNumber}`);
      
      // Озвучка: номер ячейки, количество товаров, оплата
      const itemCount = orderWithCell.items?.length || 0;
      if (playAudio) {
        playAudio('delivery-cell-info', randomCellNumber, itemCount);
      }
      
      // Очищаем номер телефона
      setPhoneNumber('');
    } else {
      console.log('❌ Заказ не найден');
      alert('Заказ не найден');
    }
  }, [setPhoneNumber, setCurrentOrder, setDeliveryStep, playAudio, activeClients, setActiveClients, setCurrentClientId]);

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
    
    // Озвучка благодарности
    if (playAudio) {
      playAudio('delivery-thanks');
    }
    
    console.log('✅ Товар выдан');
    
    // Удаляем клиента из списка активных
    const updatedClients = activeClients.filter(client => client.id !== currentClientId);
    setActiveClients(updatedClients);
    
    // Переключаемся на следующего клиента или сбрасываем
    if (updatedClients.length > 0) {
      const nextClient = updatedClients[0];
      setCurrentClientId(nextClient.id);
      setCurrentOrder(nextClient);
      setDeliveryStep('client-scanned');
    } else {
      setTimeout(() => {
        setDeliveryStep('initial');
        setCurrentOrder(null);
        setCurrentClientId(null);
        setIsProductScanned(false);
        setScannedData('');
      }, 3000);
    }
    
    setIsProductScanned(false);
    setScannedData('');
  }, [setDeliveryStep, setCurrentOrder, setIsProductScanned, setScannedData, playAudio, activeClients, setActiveClients, currentClientId, setCurrentClientId]);

  // Обработчик смены вкладки
  const handleTabChange = useCallback((tab: string) => {
    if (tab !== 'delivery') {
      setDeliveryStep('initial');
      setCurrentOrder(null);
      setIsProductScanned(false);
      setScannedData('');
    }
  }, [setDeliveryStep, setCurrentOrder, setIsProductScanned, setScannedData]);

  // Обработчик переключения между клиентами
  const handleClientSwitch = useCallback((clientId: string) => {
    const client = activeClients.find(c => c.id === clientId);
    if (client) {
      setCurrentClientId(clientId);
      setCurrentOrder(client);
      // Если клиент уже отсканировал товар, возвращаемся к проверке под камерой
      // Иначе начинаем с начала процесса выдачи
      setDeliveryStep('product-scanned');
      setIsProductScanned(true);
      setScannedData(client.items.map((item: any) => item.barcode).join(','));
      
      console.log(`🔄 Переключение на клиента в ячейке ${client.cellNumber}`);
    }
  }, [activeClients, setCurrentClientId, setCurrentOrder, setDeliveryStep, setIsProductScanned, setScannedData]);

  return {
    handlePhoneSubmit,
    handleScanProduct,
    handleDeliverProduct,
    handleTabChange,
    handleClientSwitch
  };
};