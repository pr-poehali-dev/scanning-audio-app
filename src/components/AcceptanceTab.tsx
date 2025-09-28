import React, { useState } from 'react';
import Icon from '@/components/ui/icon';
import QRScanner from './QRScanner';

interface AcceptanceItem {
  id: string;
  barcode: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected' | 'damaged';
  timestamp: string;
  cellNumber?: number;
}

type AcceptanceStep = 'box' | 'items' | 'location' | 'complete';

const AcceptanceTab = () => {
  const [currentStep, setCurrentStep] = useState<AcceptanceStep>('box');
  const [boxBarcode, setBoxBarcode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [acceptanceItems, setAcceptanceItems] = useState<AcceptanceItem[]>([]);

  // Генерация случайного названия товара
  const generateRandomProductName = () => {
    const productNames = [
      'Смартфон Samsung Galaxy',
      'Наушники Apple AirPods',  
      'Куртка зимняя Nike',
      'Кроссовки Adidas',
      'Рюкзак школьный',
      'Планшет iPad',
      'Книга "Мастер и Маргарита"',
      'Игрушка мягкая медведь',
      'Часы Xiaomi Mi Band',
      'Термос Stanley',
      'Джинсы Levi\'s 501',
      'Футболка с принтом'
    ];
    
    return productNames[Math.floor(Math.random() * productNames.length)];
  };

  const handleQRScan = (data: string) => {
    console.log('📦 === СКАНИРОВАНИЕ В ПРИЕМКЕ ===');
    console.log('🔍 Отсканирован код:', data);
    setShowScanner(false);
    
    if (currentStep === 'box') {
      // Сканирование коробки
      console.log('📦 СКАНИРОВАНИЕ КОРОБКИ');
      setBoxBarcode(data);
      setCurrentStep('items');
    } else if (currentStep === 'items') {
      // Сканирование товара
      console.log('📱 СКАНИРОВАНИЕ ТОВАРА');
      
      // Проверяем, не был ли товар уже принят
      const existingItem = acceptanceItems.find(item => item.barcode === data);
      if (existingItem) {
        console.log('⚠️ Товар уже принят');
        return;
      }
      
      // Генерируем УНИКАЛЬНЫЙ номер ячейки (не повторяется)
      const usedCells = acceptanceItems.map(item => item.cellNumber).filter(Boolean);
      let cellNumber;
      do {
        cellNumber = Math.floor(Math.random() * 482) + 1;
      } while (usedCells.includes(cellNumber));
      
      console.log(`🔄 Уже использованные ячейки:`, usedCells);
      console.log(`✨ Новая свободная ячейка: ${cellNumber}`);
      
      // Создаем новый товар с номером ячейки
      const newItem: AcceptanceItem = {
        id: `item-${Date.now()}`,
        barcode: data,
        productName: generateRandomProductName(),
        quantity: 1,
        status: 'accepted',
        timestamp: new Date().toISOString(),
        cellNumber: cellNumber
      };
      
      console.log(`📱 ТОВАР ПРИНЯТ В ЯЧЕЙКУ ${cellNumber}:`, newItem);
      
      // Добавляем товар
      setAcceptanceItems(prev => [...prev, newItem]);
      
      // Переходим к размещению если это первый товар
      if (acceptanceItems.length === 0) {
        setTimeout(() => {
          setCurrentStep('location');
        }, 3000);
      }
    }
  };

  const changeItemStatus = (itemId: string, status: AcceptanceItem['status']) => {
    setAcceptanceItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, status } : item
      )
    );
  };

  // Получаем статистику
  const stats = acceptanceItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Приемка товаров</h1>
        <p className="text-gray-600">Сканируйте товары для размещения в ПВЗ</p>
      </div>

      {/* Этапы приемки */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 ${currentStep === 'box' ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'box' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>1</div>
            <span>Коробка</span>
          </div>
          <div className={`flex items-center gap-2 ${currentStep === 'items' ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'items' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>2</div>
            <span>Товары</span>
          </div>
          <div className={`flex items-center gap-2 ${currentStep === 'location' ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'location' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>3</div>
            <span>Размещение</span>
          </div>
        </div>

        {/* Контент этапа */}
        {currentStep === 'box' && (
          <div className="text-center py-8">
            <Icon name="Package" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Отсканируйте коробку</h3>
            <p className="text-gray-600 mb-4">Начните с QR-кода на упаковке</p>
            <button
              onClick={() => setShowScanner(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Сканировать коробку
            </button>
          </div>
        )}

        {currentStep === 'items' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Сканирование товаров</h3>
              <button
                onClick={() => setShowScanner(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                Сканировать товар
              </button>
            </div>
            
            {boxBarcode && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-600">Коробка: </span>
                <span className="font-mono">{boxBarcode}</span>
              </div>
            )}

            {acceptanceItems.length > 0 && (
              <div className="space-y-2">
                {acceptanceItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-gray-600">Ячейка: {item.cellNumber}</div>
                      <div className="text-xs text-gray-500">{item.barcode}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status === 'accepted' ? 'Принят' :
                       item.status === 'rejected' ? 'Отклонен' : 'Ожидание'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 'location' && (
          <div className="text-center py-8">
            <Icon name="MapPin" size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Товары размещены</h3>
            <p className="text-gray-600">Принято товаров: {acceptanceItems.length}</p>
            <div className="mt-4">
              <button
                onClick={() => {
                  setCurrentStep('box');
                  setBoxBarcode('');
                  setAcceptanceItems([]);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Начать новую приемку
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Статистика */}
      {acceptanceItems.length > 0 && (
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Статистика приемки</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.accepted || 0}</div>
              <div className="text-sm text-gray-600">Принято</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
              <div className="text-sm text-gray-600">Ожидание</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
              <div className="text-sm text-gray-600">Отклонено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.damaged || 0}</div>
              <div className="text-sm text-gray-600">Повреждено</div>
            </div>
          </div>
        </div>
      )}

      {/* QR Сканер */}
      <QRScanner
        isOpen={showScanner}
        onScan={handleQRScan}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
};

export default AcceptanceTab;