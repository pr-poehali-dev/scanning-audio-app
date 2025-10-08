import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface Product {
  barcode: string;
  name: string;
  image: string;
  cell: string;
}

interface Box {
  boxBarcode: string;
  products: Product[];
}

// Функция генерации случайной коробки с товарами
const generateRandomBox = (): Box => {
  const productCount = Math.floor(Math.random() * 15) + 1; // От 1 до 15 товаров
  
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
    'Puma / Спортивные штаны мужские',
    'Reebok / Кроссовки женские Classic',
    'New Balance / Кроссовки унисекс 574',
    'Converse / Кеды высокие Chuck Taylor',
    'Vans / Кеды Old Skool черные'
  ];
  
  const products: Product[] = [];
  
  for (let i = 0; i < productCount; i++) {
    products.push({
      barcode: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
      name: productNames[Math.floor(Math.random() * productNames.length)],
      image: 'https://cdn.poehali.dev/files/37460f9f-5236-49a3-ad2d-20dfe5141e6d.png',
      cell: `${Math.floor(Math.random() * 482) + 1}` // Ячейки от 1 до 482
    });
  }
  
  return {
    boxBarcode: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
    products
  };
};

interface ReceptionInterfaceProps {
  playAudio: (fileName: string, cellNumber?: number) => void;
}

const ReceptionInterface = ({ playAudio }: ReceptionInterfaceProps) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [currentBox, setCurrentBox] = useState<Box | null>(null);
  const [scannedProducts, setScannedProducts] = useState<string[]>([]);
  const [currentScannedBarcode, setCurrentScannedBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Автосканирование при клике на кнопку
  const handleScanClick = () => {
    if (step === 1) {
      setIsScanning(true);
      setTimeout(() => {
        // Генерируем новую коробку
        const newBox = generateRandomBox();
        setCurrentBox(newBox);
        setCurrentScannedBarcode(newBox.boxBarcode);
        setStep(2);
        setIsScanning(false);
        
        // Озвучка: коробка принята
        playAudio('box_accepted');
      }, 1000);
    } else if (step === 2 && currentBox) {
      // Сканируем следующий товар
      const unscannedProducts = currentBox.products.filter(
        p => !scannedProducts.includes(p.barcode)
      );
      
      if (unscannedProducts.length > 0) {
        setIsScanning(true);
        setTimeout(() => {
          const product = unscannedProducts[0];
          setCurrentScannedBarcode(product.barcode);
          setScannedProducts([...scannedProducts, product.barcode]);
          
          // Озвучка номера ячейки
          const cellNumber = parseInt(product.cell);
          playAudio('cell-number', cellNumber);
          
          // Переходим к шагу 3 (показываем ячейку)
          setStep(3);
          setIsScanning(false);
          
          // Автоматически возвращаемся к шагу 2 через 3 секунды
          setTimeout(() => {
            // Проверяем, все ли товары отсканированы
            if (scannedProducts.length + 1 === currentBox.products.length) {
              setStep(4);
              setTimeout(() => {
                // Сброс к начальному состоянию
                setStep(1);
                setCurrentBox(null);
                setScannedProducts([]);
                setCurrentScannedBarcode('');
              }, 2000);
            } else {
              setStep(2);
            }
          }, 3000);
        }, 1000);
      }
    }
  };

  const totalProducts = currentBox?.products.length || 0;
  const scannedCount = scannedProducts.length;
  const currentProduct = currentBox?.products.find(p => p.barcode === currentScannedBarcode);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Прогресс-бар с шагами */}
      <div className="bg-white px-6 py-4 border-b">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= num 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-purple-100 text-purple-300'
                }`}>
                  {num}
                </div>
                {num < 4 && (
                  <div className={`w-16 h-1 mx-1 transition-colors ${
                    step > num ? 'bg-purple-600' : 'bg-purple-100'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          
          {/* Шаг 1: Сканирование коробки */}
          {step === 1 && (
            <div className="text-center space-y-8">
              <h2 className="text-3xl font-bold text-gray-900">Отсканируйте стикер коробки</h2>
              
              {/* QR-код иконка */}
              <div 
                className="relative w-64 h-64 mx-auto cursor-pointer transition-transform hover:scale-105"
                onClick={handleScanClick}
              >
                <img 
                  src="https://cdn.poehali.dev/files/8be579d0-2d62-46e0-a9e9-f276698b985c.png"
                  alt="Сканировать QR"
                  className="w-full h-full object-contain"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-purple-100 bg-opacity-80 rounded-xl flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Icon name="Loader2" size={32} className="animate-spin text-purple-600" />
                      <span className="text-purple-600 font-medium">Сканирование...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-lg text-gray-500">или</div>

              {/* Поле ввода штрихкода */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Введите штрихкод вручную"
                    className="w-full px-4 py-4 pr-12 text-lg border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="Search" size={24} className="text-purple-600" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Шаг 2: Сканирование товаров */}
          {step === 2 && currentBox && (
            <div className="space-y-6">
              {/* Большая карточка коробки */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-md">
                        <Icon name="Package" size={40} className="text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-purple-600 font-medium mb-1">Коробка</div>
                        <div className="text-3xl font-bold text-gray-900">{currentBox.boxBarcode}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-purple-600 font-medium mb-1">Товаров</div>
                      <div className="text-5xl font-bold text-purple-600">
                        {totalProducts}
                      </div>
                    </div>
                  </div>
                  
                  {/* Прогресс */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700">Прогресс приёмки</span>
                      <span className="text-sm font-bold text-purple-900">{scannedCount} / {totalProducts}</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-3">
                      <div 
                        className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(scannedCount / totalProducts) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <button
                    onClick={handleScanClick}
                    disabled={isScanning}
                    className={`w-full py-5 rounded-xl font-bold text-xl transition-all flex items-center justify-center gap-3 ${
                      isScanning
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <Icon name={isScanning ? 'Loader2' : 'Scan'} size={28} className={isScanning ? 'animate-spin' : ''} />
                    <span>{isScanning ? 'Сканирование...' : 'Сканировать товар'}</span>
                  </button>
                </div>
              </div>

              {/* Карточки товаров */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 px-2">Информация по товарам клиента</h3>
                {currentBox.products.map((product, index) => {
                  const isScanned = scannedProducts.includes(product.barcode);
                  
                  return (
                    <div
                      key={product.barcode}
                      className={`bg-white rounded-2xl overflow-hidden shadow-md transition-all ${
                        isScanned ? 'ring-2 ring-green-500' : ''
                      }`}
                    >
                      <div className="flex">
                        {/* Изображение товара */}
                        <div className="w-32 h-32 flex-shrink-0 bg-gray-100 relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {isScanned && (
                            <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <Icon name="Check" size={24} className="text-white" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Информация о товаре */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="text-xl font-bold text-gray-900 mb-1">
                                {product.barcode}
                              </div>
                              <div className="text-sm text-gray-600 line-clamp-2">
                                {product.name}
                              </div>
                            </div>
                          </div>

                          {/* Ячейка */}
                          <div className="mt-3 inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-xl border-2 border-purple-200">
                            <Icon name="MapPin" size={20} className="text-purple-600" />
                            <span className="text-sm text-purple-600 font-medium">Ячейка:</span>
                            <span className="text-2xl font-bold text-purple-700">{product.cell}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Шаг 3: Показ ячейки */}
          {step === 3 && currentProduct && (
            <div className="bg-white rounded-xl overflow-hidden shadow-lg animate-in fade-in zoom-in duration-300">
              <div className="relative">
                {/* Изображение товара */}
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="w-full h-96 object-cover"
                />
                
                {/* Большой номер ячейки поверх изображения */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="bg-purple-600 text-white px-16 py-12 rounded-3xl shadow-2xl">
                    <div className="text-8xl font-bold text-center mb-2">{currentProduct.cell}</div>
                    <div className="text-2xl text-center opacity-90">Ячейка</div>
                  </div>
                </div>
              </div>

              {/* Информация о товаре */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl font-bold text-gray-900">{currentProduct.barcode}</div>
                  <div className="px-4 py-2 bg-green-500 text-white rounded-full text-base font-semibold">
                    Принят
                  </div>
                </div>
                
                <div className="text-lg text-gray-700 mb-4">{currentProduct.name}</div>
                
                <div className="p-4 bg-purple-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="MapPin" size={24} className="text-purple-600" />
                    <div>
                      <div className="text-sm text-purple-600">Разместите товар в ячейку</div>
                      <div className="text-3xl font-bold text-purple-700">{currentProduct.cell}</div>
                    </div>
                  </div>
                  <Icon name="ArrowRight" size={32} className="text-purple-600 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Шаг 4: Завершение */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Check" size={48} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Коробка принята!</h2>
              <p className="text-lg text-gray-600">Все товары размещены</p>
              <div className="text-2xl font-bold text-purple-600">{totalProducts} товаров</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptionInterface;