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
  activeClients: any[];
  setActiveClients: (clients: any[]) => void;
  currentClientId: string | null;
  setCurrentClientId: (id: string | null) => void;
}

export const createQRHandlers = (props: QRHandlersProps) => {
  const {
    activeTab, deliveryStep, playAudio,
    setIsScanning, setShowQRScanner, setCurrentOrder, setDeliveryStep,
    setScannedData, setIsProductScanned,
    activeClients, setActiveClients, currentClientId, setCurrentClientId
  } = props;

  // Обработчик QR сканирования
  const handleQRScan = useCallback(async () => {
    if (activeTab === 'delivery') {
      // Фиктивное сканирование для вкладки выдачи
      setIsScanning(true);
      
      // Небольшая задержка только для визуального эффекта сканирования
      setTimeout(async () => {
        // Генерируем новый заказ с уникальными товарами
        const itemCount = Math.floor(Math.random() * 8) + 1;
        const randomCellNumber = Math.floor(Math.random() * 482) + 1;
        
        // Генерация товаров
        const productNames = [
          'Nike / Кроссовки мужские Air Max', 'Adidas / Футболка женская Originals',
          'Zara / Джинсы женские slim fit', 'H&M / Платье вечернее чёрное',
          'Uniqlo / Рубашка мужская белая', 'Levi\'s / Куртка джинсовая классическая',
          'Calvin Klein / Трусы мужские набор 3шт', 'Tommy Hilfiger / Поло мужское синее',
          'Apple / Чехол для iPhone 14 Pro', 'Samsung / Наушники Galaxy Buds Pro',
          'Xiaomi / Powerbank 20000mAh', 'Logitech / Мышь беспроводная MX Master',
          'ТЕЛОДВИЖЕНИЯ / Худи унисекс черное', 'ТЕЛОДВИЖЕНИЯ / Свитшот женский розовый',
          'ТЕЛОДВИЖЕНИЯ / Лонгслив мужской серый', 'Puma / Спортивные штаны мужские',
          'Reebok / Кроссовки женские Classic', 'New Balance / Кроссовки унисекс 574',
          'Converse / Кеды высокие Chuck Taylor', 'Vans / Кеды Old Skool черные',
          'The North Face / Куртка зимняя пуховик', 'Columbia / Ветровка мужская водонепроницаемая',
          'Patagonia / Флиска женская синяя', 'Mango / Блузка женская шёлковая',
          'Massimo Dutti / Брюки мужские классические', 'COS / Пальто женское шерстяное',
          'ASOS / Свитер оверсайз унисекс', 'Bershka / Юбка женская мини джинсовая',
          'Pull&Bear / Худи унисекс с принтом', 'Stradivarius / Топ женский кроп',
          'Reserved / Куртка бомбер мужская', 'Sinsay / Платье женское летнее',
          'Cropp / Джоггеры мужские карго', 'House / Рубашка женская оверсайз',
          'Mohito / Жакет женский твидовый'
        ];
        
        const items = Array.from({ length: itemCount }, (_, index) => {
          const originalPrice = Math.floor(Math.random() * 8000) + 500;
          const discountPercent = Math.floor(Math.random() * 70) + 10;
          const currentPrice = Math.floor(originalPrice * (100 - discountPercent) / 100);
          const productName = productNames[Math.floor(Math.random() * productNames.length)];
          
          return {
            id: `16466782${Math.floor(Math.random() * 9000) + 1000}${index}`,
            name: productName,
            barcode: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
            color: ['Черный', 'Белый', 'Серый', 'Синий', 'Красный', 'Зелёный', 'Жёлтый', 'Фиолетовый', 'Розовый', 'Коричневый'][Math.floor(Math.random() * 10)],
            size: ['XS', 'S', 'M', 'L', 'XL', '42', '43', '44', '46', '48', 'Универсальный'][Math.floor(Math.random() * 11)],
            image: 'https://cdn.poehali.dev/files/b858b4bf-933e-42d2-85ef-ac50de2c51dd.png',
            price: currentPrice,
            brand: productName.split('/')[0].trim()
          };
        });
        
        const generatedOrder = {
          id: `order-${Date.now()}`,
          customerName: 'Клиент',
          phone: `+7 (***) ***-${Math.floor(Math.random() * 9000) + 1000}`,
          status: 'ready_for_pickup' as const,
          cellNumber: randomCellNumber.toString(),
          items,
          createdAt: new Date(),
          updatedAt: new Date(),
          totalAmount: items.reduce((sum, item) => sum + item.price, 0),
          isActive: true
        };
        
        setCurrentOrder(generatedOrder);
        setDeliveryStep('client-scanned');
        setScannedData(`qr-${generatedOrder.id}-${generatedOrder.phone}`);
        
        // Добавляем клиента в активных клиентов
        const clientExists = activeClients.find(c => c.id === generatedOrder.id);
        if (!clientExists) {
          setActiveClients([...activeClients, generatedOrder]);
          setCurrentClientId(generatedOrder.id);
          console.log('✅ Клиент добавлен в activeClients:', generatedOrder.id);
        }
        
        console.log('✅ Новый заказ создан:', generatedOrder.customerName, 'Ячейка:', generatedOrder.cellNumber, 'Товаров:', itemCount);
        
        // Озвучка: номер ячейки, товары, оплата
        if (playAudio) {
          playAudio('delivery-cell-info', randomCellNumber, itemCount);
        }
        
        // НЕМЕДЛЕННО ОБНОВЛЯЕМ ИНТЕРФЕЙС
        setIsScanning(false);
        
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
          
          // Добавляем клиента в активных клиентов
          const clientExists = activeClients.find(c => c.id === order.id);
          if (!clientExists) {
            setActiveClients([...activeClients, order]);
            setCurrentClientId(order.id);
            console.log('✅ Клиент добавлен в activeClients:', order.id);
          }
          
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