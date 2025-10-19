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
  
  // Загрузка сохраненного состояния из localStorage
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem('deliveryState');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const savedState = loadSavedState();

  // Основные состояния
  const [activeTab, setActiveTab] = useState('delivery');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(savedState?.isProcessing || false);
  
  // Состояния для выдачи
  const [cellNumber, setCellNumber] = useState(() => 
    savedState?.cellNumber || Math.floor(Math.random() * 482) + 1
  );
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState(savedState?.currentStep || 'scan');
  const [itemsCount] = useState(() => 
    savedState?.itemsCount || Math.floor(Math.random() * 8) + 1
  );
  const [customerPhone] = useState(() => {
    if (savedState?.customerPhone) return savedState.customerPhone;
    const codes = ['9', '8', '7', '6', '5'];
    const code = codes[Math.floor(Math.random() * codes.length)];
    const digits = Math.floor(Math.random() * 9000) + 1000;
    return `+7 (...) ... ${code}${digits.toString().slice(0, 1)} ${digits.toString().slice(1, 3)}`;
  });
  
  // Состояния для приемки
  const [receivingStep, setReceivingStep] = useState(1);
  const [receivingBarcode, setReceivingBarcode] = useState('');
  
  // Данные для товаров
  // Генерация товаров для заказа
  const [mockProducts, setMockProducts] = useState<Product[]>(() => {
    // При загрузке проверяем сохраненные товары
    const saved = loadSavedState();
    if (saved?.products) {
      return saved.products;
    }
    return generateProducts(itemsCount);
  });

  // Функция генерации товаров
  function generateProducts(count: number): Product[] {
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
      'ТЕЛОДВИЖЕНИЯ / Лонгслив мужской серый',
      'Puma / Спортивные штаны мужские',
      'Reebok / Кроссовки женские Classic',
      'New Balance / Кроссовки унисекс 574',
      'Converse / Кеды высокие Chuck Taylor',
      'Vans / Кеды Old Skool черные',
      'The North Face / Куртка зимняя пуховик',
      'Columbia / Ветровка мужская водонепроницаемая',
      'Patagonia / Флиска женская синяя',
      'Mango / Блузка женская шёлковая',
      'Massimo Dutti / Брюки мужские классические',
      'COS / Пальто женское шерстяное',
      'ASOS / Свитер оверсайз унисекс',
      'Bershka / Юбка женская мини джинсовая',
      'Pull&Bear / Худи унисекс с принтом',
      'Stradivarius / Топ женский кроп',
      'Reserved / Куртка бомбер мужская',
      'Sinsay / Платье женское летнее',
      'Cropp / Джоггеры мужские карго',
      'House / Рубашка женская оверсайз',
      'Mohito / Жакет женский твидовый'
    ];

    return Array.from({ length: count }, (_, index) => {
      const originalPrice = Math.floor(Math.random() * 8000) + 500;
      const discountPercent = Math.floor(Math.random() * 70) + 10;
      const currentPrice = Math.floor(originalPrice * (100 - discountPercent) / 100);
      
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
  }

  // Сохранение состояния в localStorage
  useEffect(() => {
    const stateToSave = {
      cellNumber,
      currentStep,
      itemsCount,
      customerPhone,
      isProcessing,
      products: mockProducts
    };
    localStorage.setItem('deliveryState', JSON.stringify(stateToSave));
  }, [cellNumber, currentStep, itemsCount, customerPhone, isProcessing, mockProducts]);

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
        
        // Генерируем новый набор товаров для нового покупателя
        const newItemsCount = Math.floor(Math.random() * 8) + 1;
        const newProducts = generateProducts(newItemsCount);
        setMockProducts(newProducts);
        
        // Генерируем новую ячейку
        const newCellNumber = Math.floor(Math.random() * 400) + 50;
        setCellNumber(newCellNumber);
        
        // Создаем заказ из сгенерированных товаров
        const generatedOrder = {
          id: `order-${Date.now()}`,
          customerName: 'Клиент',
          phone: customerPhone,
          status: 'ready_for_pickup' as const,
          cellNumber: newCellNumber.toString(),
          items: newProducts.map(product => ({
            id: product.id,
            name: product.name,
            barcode: product.barcode,
            color: product.color,
            size: product.size,
            image: 'https://cdn.poehali.dev/files/b858b4bf-933e-42d2-85ef-ac50de2c51dd.png',
            price: product.currentPrice,
            brand: product.name.split('/')[0].trim()
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
          totalAmount: newProducts.reduce((sum, p) => sum + p.currentPrice, 0),
          isActive: true
        };
        
        setCurrentOrder(generatedOrder);
        
        // Озвучка: номер ячейки, количество товаров, оплата при получении
        playAudio('delivery-cell-info', newCellNumber, newItemsCount);
        
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
        
        // МГНОВЕННЫЙ ПЕРЕХОД БЕЗ ЗАДЕРЖЕК
        setCurrentStep('check');
        
        // Озвучка при нажатии "Снять все": V1=please_check_good_under_camera, V2=scanAfterQrClient
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
    
    // Озвучка происходит в DeliveryInterface.tsx через delivery-complete-sequence
    
    try {
      // МГНОВЕННЫЙ СБРОС БЕЗ ЗАДЕРЖЕК
      setCurrentStep('scan');
      setPhoneNumber('');
      setCurrentOrder(null); // Сбрасываем заказ
      setIsProcessing(false);
      
      // Очищаем сохраненное состояние
      localStorage.removeItem('deliveryState');
      
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
        // Если заказ не найден, создаем новый заказ из сгенерированных товаров
        const randomCellNumber = Math.floor(Math.random() * 400) + 50;
        setCellNumber(randomCellNumber);
        
        // Преобразуем mockProducts в формат Order
        const generatedOrder = {
          id: `order-${Date.now()}`,
          customerName: 'Новый клиент',
          phone: `+7 (***) ***-${phoneNumber}`,
          status: 'ready_for_pickup' as const,
          cellNumber: randomCellNumber.toString(),
          items: mockProducts.map(product => ({
            id: product.id,
            name: product.name,
            barcode: product.barcode,
            color: product.color,
            size: product.size,
            image: 'https://cdn.poehali.dev/files/b858b4bf-933e-42d2-85ef-ac50de2c51dd.png',
            price: product.currentPrice,
            brand: product.name.split('/')[0].trim()
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
          totalAmount: mockProducts.reduce((sum, p) => sum + p.currentPrice, 0),
          isActive: true
        };
        
        setCurrentOrder(generatedOrder);
        console.log(`📦 Создан новый заказ с ${mockProducts.length} товарами, ячейка: ${randomCellNumber}`);
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