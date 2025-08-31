import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import DeliveryProductList from './delivery/DeliveryProductList';

interface Product {
  id: string;
  article: string;
  name: string;
  size: string;
  color: string;
  barcode: string;
  currentPrice: number;
  originalPrice: number;
}

interface DeliveryTabProps {
  currentStep: string;
  cellNumber: number;
  itemsCount: number;
  mockProducts: Product[];
  isScanning: boolean;
  isProcessing: boolean;
  phoneNumber: string;
  customerPhone: string;
  onPhoneNumberChange: (value: string) => void;
  onQRScan: () => void;
  onManagerScan: () => void;
  onTryOn: () => void;
  onIssue: () => void;
  onConfirmCode: () => void;
}

export const DeliveryTab = ({
  currentStep,
  cellNumber,
  itemsCount,
  mockProducts,
  isScanning,
  isProcessing,
  phoneNumber,
  customerPhone,
  onPhoneNumberChange,
  onQRScan,
  onManagerScan,
  onTryOn,
  onIssue,
  onConfirmCode
}: DeliveryTabProps) => {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      {currentStep === 'scan' && (
        <>
          <h1 className="text-2xl font-semibold text-gray-800">
            Отсканируйте QR-код клиента или курьера
          </h1>

          <div className="relative">
            <img 
              src="https://cdn.poehali.dev/files/b424339e-eb83-4c2d-8902-4d08926a37df.png"
              alt="QR Scanner"
              className="w-80 h-60 mx-auto object-contain cursor-pointer hover:scale-105 transition-transform"
              onClick={onQRScan}
            />
            {isScanning && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-blue-700 font-medium">Сканирование...</div>
              </div>
            )}
          </div>

          <div className="text-lg text-gray-600">или</div>

          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Введите номер телефона клиента</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Последние 4 цифры номера"
                  value={phoneNumber}
                  onChange={(e) => onPhoneNumberChange(e.target.value)}
                  className="text-center text-lg"
                  maxLength={4}
                />
                <Button 
                  onClick={onConfirmCode}
                  className="w-full bg-purple-500 hover:bg-purple-600 py-3"
                  disabled={!phoneNumber || phoneNumber.length !== 4 || isProcessing}
                >
                  {isProcessing ? 'Обработка...' : 'Найти заказы'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {currentStep === 'manager-scan' && (
        <DeliveryProductList
          cellNumber={cellNumber}
          itemsCount={itemsCount}
          scannedCount={0}
          products={mockProducts.map(p => ({
            ...p,
            image: `https://via.placeholder.com/80x80/f0f0f0/999?text=Товар`,
            scanned: false
          }))}
          onScanProduct={(productId) => {
            console.log('Пропущен товар:', productId);
            onManagerScan();
          }}
          onSkipAll={() => {
            console.log('Все товары пропущены');
            onManagerScan();
          }}
        />
      )}

      {currentStep === 'check' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Ячейка: {cellNumber}</h2>
          <div className="text-lg text-green-600">📱 Товар отсканирован менеджером</div>
          <div className="text-lg text-blue-600">🔍 "Проверьте товар под камерой"</div>
        </div>
      )}

      {currentStep === 'actions' && (
        <div className="flex h-screen">
          {/* Левая панель - информация о ячейке */}
          <div className="w-80 bg-gray-50 p-6 flex flex-col">
            <div className="text-center mb-8">
              <div className="text-sm text-gray-600 mb-1">Ячейка</div>
              <div className="text-6xl font-bold text-gray-800 mb-6">{cellNumber}</div>
              
              <div className="text-sm text-gray-600 mb-2">Товаров</div>
              <div className="text-2xl font-bold text-gray-800 mb-4">{itemsCount} из {itemsCount}</div>
              
              <div className="text-sm text-gray-600 mb-2">Пакетов</div>
              <div className="text-2xl font-bold text-gray-800 mb-6">3</div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6">
                <Icon name="Plus" className="mx-auto w-8 h-8 text-gray-400" />
              </div>
              
              <div className="text-sm text-gray-600 mb-2">К оплате</div>
              <div className="text-xl font-bold text-purple-600 mb-6">17 876 ₽</div>
            </div>
            
            <div className="mt-auto space-y-3">
              <Button 
                onClick={onIssue}
                className="w-full bg-purple-500 hover:bg-purple-600 py-3"
                disabled={isProcessing}
              >
                {isProcessing ? 'Обработка...' : 'Выдать'}
              </Button>
              <Button 
                onClick={onTryOn}
                variant="outline"
                className="w-full py-3"
                disabled={isProcessing}
              >
                {isProcessing ? 'Обработка...' : 'Снять с примерки'}
              </Button>
            </div>
          </div>

          {/* Правая часть - товары */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                  <span className="text-sm">Снять все</span>
                </div>
                <div className="text-sm text-gray-600">
                  Клиент {customerPhone}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              {mockProducts.map((product) => (
                <div key={product.id} className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Icon name="Check" className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Оплачен
                    </div>
                  </div>
                  <div className="absolute top-8 right-2 z-10">
                    <Icon name="RotateCcw" className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div className="bg-white rounded-lg border p-3 h-[380px] flex flex-col">
                    <img 
                      src={`https://via.placeholder.com/200x200/f0f0f0/999?text=Товар`}
                      alt="Product"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="font-medium text-xs truncate">{product.id} {product.article}</div>
                      <div className="text-xs text-gray-600 h-6 overflow-hidden line-clamp-2">
                        {product.name.slice(0, 30)}{product.name.length > 30 ? '...' : ''}
                      </div>
                      <div className="text-purple-600 text-sm font-bold">
                        {product.currentPrice.toLocaleString()} ₽ <span className="text-gray-400 line-through">{product.originalPrice.toLocaleString()} ₽</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.color} • {product.size}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {product.barcode.slice(0, 15)}...
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4">
                    <Icon name="MoreHorizontal" className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStep === 'payment' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">💳 Ожидание оплаты</h2>
          <div className="text-lg text-blue-600">Клиент производит оплату...</div>
          <div className="text-sm text-gray-500">После оплаты прозвучит просьба оценить пункт выдачи</div>
          <div className="animate-pulse text-green-600">⏳ Ожидание...</div>
        </div>
      )}
    </div>
  );
};