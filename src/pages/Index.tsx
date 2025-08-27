import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeTab, setActiveTab] = useState('delivery');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleQRScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Icon name="Package" className="text-white w-5 h-5" />
              </div>
              <div className="text-sm text-gray-500">
                <div>ID 50006760</div>
                <div>V1.0.67</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm">
                <Icon name="Menu" className="text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Package" className="text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Search" className="text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="MessageCircle" className="text-gray-600" />
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-4">
                <Icon name="Download" className="w-4 h-4 mr-2" />
                Установить версию
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('delivery')}
              className={`py-4 px-2 border-b-2 text-sm font-medium ${
                activeTab === 'delivery'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon name="Package" className="w-4 h-4" />
                <span>Выдача</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">13</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('receiving')}
              className={`py-4 px-2 border-b-2 text-sm font-medium ${
                activeTab === 'receiving'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon name="Archive" className="w-4 h-4" />
                <span>Приёмка</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('return')}
              className={`py-4 px-2 border-b-2 text-sm font-medium ${
                activeTab === 'return'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon name="RotateCcw" className="w-4 h-4" />
                <span>Возврат</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center space-y-8">
          <h1 className="text-2xl font-medium text-gray-800">
            Отсканируйте QR-код клиента или курьера
          </h1>
          
          {/* Scanner */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="https://cdn.poehali.dev/files/8b84a78c-ca0e-4093-9938-a71889099701.png"
                alt="3D Barcode Scanner"
                className="w-80 h-60 object-contain cursor-pointer hover:scale-105 transition-transform"
                onClick={handleQRScan}
              />
              {isScanning && (
                <div className="absolute inset-0 bg-purple-500 bg-opacity-20 rounded-lg animate-pulse flex items-center justify-center">
                  <div className="text-purple-700 font-medium">Сканирование...</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-gray-500 text-lg">или</div>
          
          {/* Phone Input */}
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-lg text-gray-700">
              Введите номер телефона клиента
            </h2>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Последние 4 цифры номера
                    </label>
                    <Input
                      type="text"
                      placeholder="1234"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="text-center text-lg"
                      maxLength={4}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleQRScan}
                    disabled={phoneNumber.length !== 4}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                  >
                    Найти клиента
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* User Icon */}
          <div className="flex justify-start">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Icon name="User" className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;