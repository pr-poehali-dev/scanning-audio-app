import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Product {
  id: string;
  article: string;
  name: string;
  size: string;
  color: string;
  barcode: string;
  image?: string;
  scanned?: boolean;
}

interface DeliveryProductListProps {
  cellNumber: number;
  itemsCount: number;
  scannedCount: number;
  products: Product[];
  onScanProduct: (productId: string) => void;
  onSkipAll: () => void;
  playAudio?: (key: string) => void;
}

export const DeliveryProductList = ({
  cellNumber,
  itemsCount,
  scannedCount,
  products,
  onScanProduct,
  onSkipAll,
  playAudio
}: DeliveryProductListProps) => {

  const handleScanProduct = (productId: string) => {
    onScanProduct(productId);
    // Озвучка ячейки при сканировании
    if (playAudio) {
      playAudio(cellNumber.toString());
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left panel - ОГРОМНАЯ ЯЧЕЙКА как на скрине */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-white p-8">
        {/* ГИГАНТСКАЯ ЯЧЕЙКА - ОСНОВНОЙ ФОКУС */}
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-gray-100 rounded-3xl p-12 shadow-lg border-4 border-gray-300">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-4 font-medium">Ячейка</p>
              <div className="text-[12rem] font-bold text-gray-800 leading-none">
                {cellNumber}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-6 text-center">
            Товары: {scannedCount} из {itemsCount}
          </p>
        </div>
      </div>

      {/* Right panel - Products list */}
      <div className="w-1/2 bg-white p-6 flex flex-col">
        {/* Products header */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">Список товаров для сканирования:</p>
        </div>

        {/* Products list */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
              {/* Product image */}
              <div className="w-16 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img
                  src="https://cdn.poehali.dev/files/6e824208-60ff-4deb-921b-478d146f6a9d.png"
                  alt={product.name}
                  className="w-12 h-12 object-contain"
                />
              </div>

              {/* Product details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {product.article} <span className="font-bold">{product.id}</span>
                </h4>
                <p className="text-sm text-gray-600 mb-2 truncate uppercase font-medium">
                  {product.name}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-1">
                  <span>Размер: <strong className="text-gray-900">{product.size}</strong></span>
                  <span>Цвет: <strong className="text-gray-900">{product.color}</strong></span>
                </div>
                <p className="text-xs text-gray-500">
                  Баркод: {product.barcode}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {product.scanned ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <Icon name="CheckCircle" size={16} />
                    Отсканировано
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScanProduct(product.id)}
                    className="whitespace-nowrap border-gray-300 hover:bg-gray-50"
                  >
                    Не сканировать
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  Смотреть все
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom button */}
        <div className="pt-6 border-t border-gray-200 mt-4">
          <Button 
            onClick={onSkipAll}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-medium"
          >
            Пропустить все
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProductList;