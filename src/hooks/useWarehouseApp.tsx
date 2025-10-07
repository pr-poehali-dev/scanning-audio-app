import { useState, useEffect } from 'react';
import { findOrderByPhone } from '@/data/mockOrders';
import { useAudio } from './useAudio';
import { AudioSettings } from './useAppState';

export interface Product {
  id: string;
  article: string;
  name: string;
  size: string;
  color: string;
  barcode: string;
  currentPrice: number;
  originalPrice: number;
}

export const useWarehouseApp = (audioSettings: AudioSettings) => {
  const { playAudio, stopAudio, isPlaying, uploadedFiles, setUploadedFiles } = useAudio({ audioSettings });
  
  // Основные состояния
  const [activeTab, setActiveTab] = useState('delivery');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Состояния для выдачи
  const [cellNumber, setCellNumber] = useState(() => Math.floor(Math.random() * 482) + 1);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState('scan');
  const [itemsCount] = useState(() => Math.floor(Math.random() * 8) + 1);
  const [customerPhone] = useState(() => {
    const codes = ['9', '8', '7', '6', '5'];
    const code = codes[Math.floor(Math.random() * codes.length)];
    const digits = Math.floor(Math.random() * 9000) + 1000;
    return `+7 (...) ... ${code}${digits.toString().slice(0, 1)} ${digits.toString().slice(1, 3)}`;
  });
  
  // Состояния для приемки
  const [receivingStep, setReceivingStep] = useState(1);
  const [receivingBarcode, setReceivingBarcode] = useState('');
  
  // Данные для товаров
  const productNames = [
    'Nike / Кроссовки мужские Air Max',
    'Adidas / Футболка женская Originals',
    'Zara / Джинсы женские slim fit',
    'H&M / Платье вечернее чёрное',
    'Uniqlo / Рубашка мужская белая',
    'Levi\'s / Куртка джинсовая классическая',
    'Calvin Klein / Трусы мужские набор 3шт',
    'Tommy Hilfiger / Поло мужское синее',
    'Apple / Чехол для iPhone 14 Pro',
    'Samsung / Наушники Galaxy Buds Pro',
    'Xiaomi / Powerbank 20000mAh',
    'Logitech / Мышь беспроводная MX Master',
    'ТЕЛОДВИЖЕНИЯ / Худи унисекс черное',
    'ТЕЛОДВИЖЕНИЯ / Свитшот женский розовый',
    'ТЕЛОДВИЖЕНИЯ / Лонгслив мужской серый'
  ];

  const generatePrices = () => {
    const originalPrice = Math.floor(Math.random() * 8000) + 500;
    const discountPercent = Math.floor(Math.random() * 70) + 10;
    const currentPrice = Math.floor(originalPrice * (100 - discountPercent) / 100);
    return { currentPrice, originalPrice };
  };

  const mockProducts: Product[] = Array.from({ length: itemsCount }, (_, index) => {
    const { currentPrice, originalPrice } = generatePrices();
    return {
      id: `16466782${Math.floor(Math.random() * 9000) + 1000}${index}`,
      article: `${Math.floor(Math.random() * 9000) + 1000}`,
      name: productNames[Math.floor(Math.random() * productNames.length)],
      size: ['XS', 'S', 'M', 'L', 'XL', '42', '43', '44', '46', '48', 'Универсальный'][Math.floor(Math.random() * 11)],
      color: ['Черный', 'Белый', 'Серый', 'Синий', 'Красный', 'Зелёный', 'Жёлтый', 'Фиолетовый', 'Розовый', 'Коричневый'][Math.floor(Math.random() * 10)],
      barcode: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
      currentPrice,
      originalPrice
    };
  });

  // Эффекты
  useEffect(() => {
    if (isProcessing) {
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Мгновенный сброс isProcessing');
        setIsProcessing(false);
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isProcessing]);

  // Обработчики для выдачи
  const handleQRScan = async () => {
    if (activeTab === 'delivery' && !isProcessing) {
      setIsProcessing(true);
      setIsScanning(true);
      
      try {
        console.log('⚡ МГНОВЕННОЕ СКАНИРОВАНИЕ QR!');
        
        // Озвучка: номер ячейки, количество товаров, оплата при получении
        playAudio('delivery-cell-info', cellNumber, itemsCount);
        
        // МГНОВЕННЫЙ ПЕРЕХОД БЕЗ ЗАДЕРЖЕК
        setIsScanning(false);
        setCurrentStep('manager-scan');
        
        // МГНОВЕННЫЙ ПЕРЕХОД К СКАНИРОВАНИЮ МЕНЕДЖЕРА
        handleManagerScan();
        
      } catch (error) {
        console.error('Ошибка в процессе QR сканирования:', error);
        setIsScanning(false);
        setIsProcessing(false);
      }
    }
  };

  const handleManagerScan = async () => {
    if (isProcessing && currentStep === 'manager-scan') {
      try {
        console.log('⚡ МГНОВЕННОЕ СКАНИРОВАНИЕ МЕНЕДЖЕРА!');
        
        // Озвучка: сканируем товары (Снять все)
        playAudio('delivery-scan-items');
        
        // МГНОВЕННЫЙ ПЕРЕХОД БЕЗ ЗАДЕРЖЕК
        setCurrentStep('check');
        
        // Озвучка: проверьте товар под камерой
        playAudio('delivery-check-product');
        
        // МГНОВЕННАЯ ВЫДАЧА ТОВАРА
        handleGiveItem();
        
      } catch (error) {
        console.error('Ошибка в процессе сканирования менеджера:', error);
        setIsProcessing(false);
      }
    }
  };

  const handleGiveItem = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    console.log('⚡ МГНОВЕННАЯ ВЫДАЧА ТОВАРА!');
    setCurrentStep('payment');
    
    // Озвучка: спасибо за заказ, оцените пункт выдачи
    playAudio('delivery-thanks');
    
    try {
      // МГНОВЕННЫЙ СБРОС БЕЗ ЗАДЕРЖЕК
      setCurrentStep('scan');
      setPhoneNumber('');
      setCurrentOrder(null); // Сбрасываем заказ
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Ошибка в процессе выдачи:', error);
      setIsProcessing(false);
    }
  };

  const handleConfirmCode = () => {
    if (phoneNumber.length === 4) {
      // Ищем заказ по последним 4 цифрам телефона
      const foundOrder = findOrderByPhone(phoneNumber);
      
      if (foundOrder) {
        // Устанавливаем реальную ячейку из заказа
        const cellNumberFromOrder = parseInt(foundOrder.cellNumber);
        setCellNumber(cellNumberFromOrder);
        setCurrentOrder(foundOrder);
        console.log(`📦 Найден заказ для телефона ${phoneNumber}, ячейка: ${cellNumberFromOrder}`);
      } else {
        // Если заказ не найден, генерируем реалистичную ячейку
        const randomCellNumber = Math.floor(Math.random() * 400) + 50;  // От 50 до 450
        setCellNumber(randomCellNumber);
        console.log(`📦 Заказ не найден для телефона ${phoneNumber}, используем ячейку: ${randomCellNumber}`);
      }
      
      handleQRScan();
    }
  };

  // Обработчики для приемки
  const handleReceivingStart = async () => {
    setReceivingStep(2);
    console.log('📦 Начало приемки');
  };

  const handleReceivingNext = async () => {
    if (receivingStep < 4) {
      const nextStep = receivingStep + 1;
      setReceivingStep(nextStep);
      console.log(`📦 Приемка - шаг ${nextStep}`);
    }
  };

  const handleReceivingReset = () => {
    setReceivingStep(1);
    console.log('📦 Сброс приемки');
  };

  return {
    // Состояния
    activeTab,
    phoneNumber,
    isScanning,
    isProcessing,
    cellNumber,
    currentOrder,
    currentStep,
    itemsCount,
    customerPhone,
    receivingStep,
    receivingBarcode,
    mockProducts,
    
    // Аудио
    playAudio,
    stopAudio,
    isPlaying,
    uploadedFiles,
    setUploadedFiles,
    
    // Сеттеры
    setActiveTab,
    setPhoneNumber,
    setReceivingBarcode,
    
    // Обработчики
    handleQRScan,
    handleConfirmCode,
    handleReceivingStart,
    handleReceivingNext,
    handleReceivingReset,
  };
};