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

const MOCK_BOXES: Box[] = [
  {
    boxBarcode: 'BOX123456',
    products: [
      {
        barcode: '1646827678',
        name: 'GENESIS / Спортивный костюм',
        image: 'https://cdn.poehali.dev/files/37460f9f-5236-49a3-ad2d-20dfe5141e6d.png',
        cell: 'А-15'
      },
      {
        barcode: '1667827368',
        name: 'Smite / Футболка оверсайз',
        image: 'https://cdn.poehali.dev/files/37460f9f-5236-49a3-ad2d-20dfe5141e6d.png',
        cell: 'Б-22'
      }
    ]
  },
  {
    boxBarcode: 'BOX789012',
    products: [
      {
        barcode: '1234567890',
        name: 'Nike / Кроссовки Air Max',
        image: 'https://cdn.poehali.dev/files/37460f9f-5236-49a3-ad2d-20dfe5141e6d.png',
        cell: 'В-08'
      }
    ]
  }
];

interface ReceptionInterfaceProps {
  playAudio: (fileName: string) => void;
}

const ReceptionInterface = ({ playAudio }: ReceptionInterfaceProps) => {
  const [step, setStep] = useState<'scan-box' | 'scan-products'>('scan-box');
  const [currentBox, setCurrentBox] = useState<Box | null>(null);
  const [scannedProducts, setScannedProducts] = useState<string[]>([]);
  const [currentScannedBarcode, setCurrentScannedBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Фейковый сканер
  useEffect(() => {
    if (!isScanning) return;

    const timeout = setTimeout(() => {
      if (step === 'scan-box') {
        // Сканируем коробку
        const randomBox = MOCK_BOXES[Math.floor(Math.random() * MOCK_BOXES.length)];
        setCurrentBox(randomBox);
        setCurrentScannedBarcode(randomBox.boxBarcode);
        setStep('scan-products');
        setIsScanning(false);
      } else if (step === 'scan-products' && currentBox) {
        // Сканируем товар из коробки
        const unscannedProducts = currentBox.products.filter(
          p => !scannedProducts.includes(p.barcode)
        );
        
        if (unscannedProducts.length > 0) {
          const product = unscannedProducts[0];
          setCurrentScannedBarcode(product.barcode);
          setScannedProducts([...scannedProducts, product.barcode]);
          
          // Озвучка ячейки
          playAudio('cell-announcement');
          
          // Проверяем, все ли товары отсканированы
          if (scannedProducts.length + 1 === currentBox.products.length) {
            setTimeout(() => {
              setStep('scan-box');
              setCurrentBox(null);
              setScannedProducts([]);
              setCurrentScannedBarcode('');
            }, 2000);
          }
        }
        
        setIsScanning(false);
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [isScanning, step, currentBox, scannedProducts, playAudio]);

  const handleScanClick = () => {
    setIsScanning(true);
  };

  const totalProducts = currentBox?.products.length || 0;
  const scannedCount = scannedProducts.length;
  const currentProduct = currentBox?.products.find(p => p.barcode === currentScannedBarcode);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Заголовок */}
      <div className="bg-white rounded-xl p-4 sm:p-6 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Приёмка товаров</h2>
          <div className="flex items-center gap-2">
            <Icon name="Package" size={24} className="text-purple-600" />
            <span className="text-lg font-semibold text-purple-600">
              {step === 'scan-box' ? 'Сканируйте коробку' : `${scannedCount} / ${totalProducts}`}
            </span>
          </div>
        </div>

        {/* Кнопка сканирования */}
        <button
          onClick={handleScanClick}
          disabled={isScanning}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
            isScanning
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
          }`}
        >
          <Icon name={isScanning ? 'Loader2' : 'Scan'} size={24} className={isScanning ? 'animate-spin' : ''} />
          {isScanning ? 'Сканирование...' : step === 'scan-box' ? 'Сканировать коробку' : 'Сканировать товар'}
        </button>

        {/* Информация о текущей коробке */}
        {currentBox && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 text-purple-700">
              <Icon name="Box" size={20} />
              <span className="font-semibold">Коробка: {currentBox.boxBarcode}</span>
            </div>
            <div className="text-sm text-purple-600 mt-1">
              Товаров в коробке: {totalProducts}
            </div>
          </div>
        )}
      </div>

      {/* Текущий отсканированный товар */}
      {currentProduct && step === 'scan-products' && (
        <div className="bg-white rounded-xl overflow-hidden shadow-lg mb-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative">
            {/* Изображение */}
            <img
              src={currentProduct.image}
              alt={currentProduct.name}
              className="w-full h-80 sm:h-96 object-cover"
            />
            
            {/* Номер ячейки поверх изображения */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="bg-purple-600 text-white px-12 py-8 rounded-3xl shadow-2xl animate-pulse">
                <div className="text-6xl sm:text-8xl font-bold text-center">{currentProduct.cell}</div>
                <div className="text-xl sm:text-2xl text-center mt-2 opacity-90">Ячейка</div>
              </div>
            </div>
          </div>

          {/* Информация о товаре */}
          <div className="p-6 bg-white">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="text-2xl font-bold text-gray-900">{currentProduct.barcode}</div>
              <div className="px-4 py-2 bg-green-500 text-white rounded-full font-semibold">
                Принят
              </div>
            </div>
            
            <div className="text-lg text-gray-700">{currentProduct.name}</div>
            
            <div className="mt-4 p-4 bg-purple-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="MapPin" size={24} className="text-purple-600" />
                <div>
                  <div className="text-sm text-purple-600">Разместите товар в ячейку</div>
                  <div className="text-2xl font-bold text-purple-700">{currentProduct.cell}</div>
                </div>
              </div>
              <Icon name="ArrowRight" size={32} className="text-purple-600 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Список товаров в коробке */}
      {currentBox && step === 'scan-products' && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Товары в коробке</h3>
          <div className="space-y-3">
            {currentBox.products.map((product) => {
              const isScanned = scannedProducts.includes(product.barcode);
              const isCurrent = currentScannedBarcode === product.barcode;
              
              return (
                <div
                  key={product.barcode}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCurrent
                      ? 'border-purple-600 bg-purple-50'
                      : isScanned
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isScanned ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {isScanned ? (
                        <Icon name="Check" size={20} className="text-white" />
                      ) : (
                        <span className="text-white font-semibold">
                          {currentBox.products.indexOf(product) + 1}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{product.barcode}</div>
                      <div className="text-sm text-gray-600">{product.name}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" size={18} className="text-purple-600" />
                      <span className="font-bold text-purple-600">{product.cell}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionInterface;
