import { useState, useEffect } from 'react';
import { useAudio } from './useAudio';
import { findOrderByPhone } from '@/data/mockOrders';

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

export interface AudioFiles {
  delivery: File[];
  receiving: File[];
  return: File[];
  cells: File[];
}

export const useWarehouseApp = () => {
  // Основные состояния
  const [activeTab, setActiveTab] = useState('delivery');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showAudioManager, setShowAudioManager] = useState(false);
  const [audioFiles, setAudioFiles] = useState<AudioFiles>({
    delivery: [],
    receiving: [],
    return: [],
    cells: []
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(() => {
    const saved = localStorage.getItem('audioEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
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
  
  // Состояния для возврата
  const [returnStep, setReturnStep] = useState(1);
  const [returnReason, setReturnReason] = useState('');
  
  // Аудио хук
  const { playAudio, playCellAudio, updateAudioFiles, removeAudioFile, clearAllAudio, customAudioFiles } = useAudio();
  
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
    localStorage.setItem('audioEnabled', JSON.stringify(audioEnabled));
  }, [audioEnabled]);
  
  useEffect(() => {
    if (isProcessing) {
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Мгновенный сброс isProcessing');
        setIsProcessing(false);
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isProcessing]);

  // Функции управления аудио
  const enableAudio = () => {
    if (!audioEnabled) {
      setAudioEnabled(true);
      const silent = new Audio('data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAAAMAC4AAAAAA//8AAAAAAAAAAAAAAAAAAAAAAAAA//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      silent.play().catch(() => {});
      console.log('🔊 Аудио разблокировано');
    }
  };

  // Обработчики для выдачи
  const handleQRScan = async () => {
    enableAudio();
    if (activeTab === 'delivery' && !isProcessing) {
      setIsProcessing(true);
      setIsScanning(true);
      
      try {
        console.log('⚡ МГНОВЕННОЕ СКАНИРОВАНИЕ QR!');
        
        // МГНОВЕННЫЙ ПЕРЕХОД БЕЗ ЗАДЕРЖЕК
        setIsScanning(false);
        setCurrentStep('manager-scan');
        
        // Озвучка ячейки (без await чтобы не блокировать)
        if (audioEnabled) {
          playCellAudio(String(cellNumber)).catch(audioError => {
            console.warn('Ошибка озвучки ячейки:', audioError);
          });
        }
        
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
        
        // МГНОВЕННЫЙ ПЕРЕХОД БЕЗ ЗАДЕРЖЕК
        setCurrentStep('check');
        
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
    
    enableAudio();
    setIsProcessing(true);
    console.log('⚡ МГНОВЕННАЯ ВЫДАЧА ТОВАРА!');
    setCurrentStep('payment');
    
    try {
      // Озвучка завершения (без await чтобы не блокировать)
      if (audioEnabled) {
        playAudio('delivery-complete').catch(audioError => {
          console.warn('Ошибка озвучки завершения:', audioError);
        });
      }
      
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
    enableAudio();
    setReceivingStep(2);
    
    if (audioEnabled) {
      try {
        await playAudio('receiving-start');
      } catch (audioError) {
        console.warn('Ошибка озвучки начала приемки:', audioError);
      }
    }
  };

  const handleReceivingNext = async () => {
    if (receivingStep < 4) {
      const nextStep = receivingStep + 1;
      setReceivingStep(nextStep);
      
      if (audioEnabled) {
        try {
          await playAudio('receiving-scan');
        } catch (audioError) {
          console.warn('Ошибка озвучки приемки:', audioError);
        }
      }
    }
  };

  const handleReceivingReset = () => {
    setReceivingStep(1);
  };

  // Обработчики для возврата
  const handleReturnStart = () => {
    setReturnStep(2);
  };

  const handleReturnComplete = async () => {
    setReturnStep(1);
    
    if (audioEnabled) {
      try {
        await playAudio('return-complete');
      } catch (audioError) {
        console.warn('Ошибка озвучки завершения возврата:', audioError);
      }
    }
  };

  const handleReturnReasonSelect = (reason: string) => {
    setReturnReason(reason);
  };

  const handleReturnStepChange = (step: number) => {
    setReturnStep(step);
  };

  // Обработчики аудио
  const handleAudioManagerUpdate = (newFiles: { [key: string]: string }) => {
    updateAudioFiles(newFiles);
    console.log('Озвучка обновлена через AudioManager:', Object.keys(newFiles));
  };

  const handleTestAudio = async () => {
    enableAudio();
    try {
      await playAudio('delivery-complete');
    } catch (error) {
      console.error('Ошибка тестирования аудио:', error);
    }
  };

  return {
    // Состояния
    activeTab,
    phoneNumber,
    isScanning,
    showAudioSettings,
    showAudioManager,
    audioFiles,
    isProcessing,
    audioEnabled,
    cellNumber,
    currentOrder,
    currentStep,
    itemsCount,
    customerPhone,
    receivingStep,
    receivingBarcode,
    returnStep,
    returnReason,
    mockProducts,
    customAudioFiles,
    
    // Сеттеры
    setActiveTab,
    setPhoneNumber,
    setShowAudioSettings,
    setShowAudioManager,
    setAudioFiles,
    setAudioEnabled,
    setReceivingBarcode,
    
    // Обработчики
    handleQRScan,
    handleConfirmCode,
    handleReceivingStart,
    handleReceivingNext,
    handleReceivingReset,
    handleReturnStart,
    handleReturnComplete,
    handleReturnReasonSelect,
    handleReturnStepChange,
    handleAudioManagerUpdate,
    handleTestAudio,
    clearAllAudio,
    removeAudioFile
  };
};