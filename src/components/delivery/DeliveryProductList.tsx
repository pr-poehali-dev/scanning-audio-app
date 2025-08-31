import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleScanProduct = (productId: string) => {
    onScanProduct(productId);
    // Озвучка ячейки при сканировании
    if (playAudio) {
      playAudio(cellNumber.toString());
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Icon name="Package" className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Выдача</h1>
            <p className="text-sm text-gray-600">v.1.0.23</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            Выдача {scannedCount}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left panel - Cell and scan count */}
        <div className="space-y-6">
          <Card className="p-6 bg-gray-50 border-2 border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Отсканируйте товары перед приемкой: {scannedCount} из {itemsCount}
              </p>
              <div className="relative">
                <div className="text-8xl font-bold text-gray-900 mb-4">
                  {cellNumber}
                </div>
                <p className="text-lg font-medium text-gray-700">Ячейка:</p>
              </div>
            </div>
          </Card>

          {/* QR Scanner placeholder */}
          <Card className="p-6 border-2 border-purple-200">
            <div className="aspect-square max-w-xs mx-auto bg-white border-4 border-purple-100 rounded-xl p-4 flex items-center justify-center">
              <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="w-24 h-24 border-4 border-white rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-white rounded-sm" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              Наведите камеру на QR-код товара
            </p>
          </Card>
        </div>

        {/* Right panel - Products list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">
              Список товаров для сканирования:
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Product image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                        <Icon name="Package" className="text-gray-400" size={20} />
                      </div>
                    )}
                  </div>

                  {/* Product details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {product.article} {product.id}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1 truncate">{product.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Размер: <strong className="text-gray-900">{product.size}</strong></span>
                      <span>Цвет: <strong className="text-gray-900">{product.color}</strong></span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Баркод: {product.barcode}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2">
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
                        className="whitespace-nowrap"
                      >
                        Не сканировать
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      Смотреть все
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Bottom action button */}
          <div className="pt-4 border-t">
            <Button 
              onClick={onSkipAll}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl"
            >
              Пропустить все
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProductList;