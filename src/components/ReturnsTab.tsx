import { useState } from 'react';
import Icon from '@/components/ui/icon';
import QRScanner from './QRScanner';

interface ReturnItem {
  id: string;
  orderNumber: string;
  customerPhone: string;
  productName: string;
  returnReason: string;
  status: 'processing' | 'approved' | 'rejected' | 'completed';
  timestamp: string;
  refundAmount?: number;
}

const RETURN_REASONS = [
  'Не подошел размер',
  'Не понравился цвет',
  'Брак товара',
  'Не соответствует описанию',
  'Передумал',
  'Другое'
];

const ReturnsTab = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [currentReturn, setCurrentReturn] = useState({
    orderNumber: '',
    customerPhone: '',
    returnReason: '',
    productName: ''
  });

  // Обработка сканирования QR-кода заказа
  const handleOrderScan = (data: string) => {
    console.log('Отсканирован заказ для возврата:', data);
    setShowScanner(false);
    
    // Заполняем номер заказа
    setCurrentReturn(prev => ({
      ...prev,
      orderNumber: data,
      productName: `Товар из заказа ${data.slice(-6)}`
    }));
    
    setShowReturnForm(true);
  };

  // Обработка создания возврата
  const handleCreateReturn = () => {
    if (!currentReturn.orderNumber || !currentReturn.customerPhone || !currentReturn.returnReason) {
      alert('Заполните все обязательные поля');
      return;
    }

    const newReturn: ReturnItem = {
      id: Date.now().toString(),
      orderNumber: currentReturn.orderNumber,
      customerPhone: currentReturn.customerPhone,
      productName: currentReturn.productName,
      returnReason: currentReturn.returnReason,
      status: 'processing',
      timestamp: new Date().toLocaleString('ru-RU'),
      refundAmount: Math.floor(Math.random() * 5000) + 500 // Случайная сумма для демо
    };

    setReturnItems(prev => [newReturn, ...prev]);
    
    // Сбрасываем форму
    setCurrentReturn({
      orderNumber: '',
      customerPhone: '',
      returnReason: '',
      productName: ''
    });
    setShowReturnForm(false);
  };

  // Функция для изменения статуса возврата
  const changeReturnStatus = (itemId: string, newStatus: ReturnItem['status']) => {
    setReturnItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, status: newStatus, timestamp: new Date().toLocaleString('ru-RU') } : item
      )
    );
  };

  // Получаем статистику
  const stats = returnItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRefunds = returnItems
    .filter(item => item.status === 'completed')
    .reduce((sum, item) => sum + (item.refundAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="RotateCcw" size={28} className="text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Возврат товаров</h2>
        </div>
        
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.processing || 0}</div>
            <div className="text-sm text-blue-700">В обработке</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
            <div className="text-sm text-green-700">Одобрено</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
            <div className="text-sm text-red-700">Отклонено</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.completed || 0}</div>
            <div className="text-sm text-purple-700">Завершено</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-gray-600">{totalRefunds.toLocaleString('ru-RU')} ₽</div>
            <div className="text-sm text-gray-700">Возвращено</div>
          </div>
        </div>

        {/* Кнопка для создания возврата */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Icon name="Scan" size={20} />
            <span>Сканировать заказ для возврата</span>
          </button>
          
          <button
            onClick={() => setShowReturnForm(true)}
            className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Icon name="User" size={20} />
            <span>Ручной ввод</span>
          </button>
        </div>
      </div>

      {/* Форма создания возврата */}
      {showReturnForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Оформление возврата</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер заказа *
              </label>
              <input
                type="text"
                value={currentReturn.orderNumber}
                onChange={(e) => setCurrentReturn(prev => ({ ...prev, orderNumber: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Введите номер заказа"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон клиента *
              </label>
              <input
                type="text"
                value={currentReturn.customerPhone}
                onChange={(e) => setCurrentReturn(prev => ({ ...prev, customerPhone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+7 (___) ___-__-__"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название товара
              </label>
              <input
                type="text"
                value={currentReturn.productName}
                onChange={(e) => setCurrentReturn(prev => ({ ...prev, productName: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Автоматически заполнится"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Причина возврата *
              </label>
              <select
                value={currentReturn.returnReason}
                onChange={(e) => setCurrentReturn(prev => ({ ...prev, returnReason: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Выберите причину</option>
                {RETURN_REASONS.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleCreateReturn}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Оформить возврат
            </button>
            <button
              onClick={() => setShowReturnForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Список возвратов */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">История возвратов</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {returnItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Icon name="RotateCcw" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Пока нет оформленных возвратов</p>
              <p className="text-sm">Отсканируйте заказ для создания возврата</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {returnItems.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    item.status === 'completed' ? 'border-purple-200 bg-purple-50' :
                    item.status === 'approved' ? 'border-green-200 bg-green-50' :
                    item.status === 'rejected' ? 'border-red-200 bg-red-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">{item.productName}</h4>
                      <p className="text-sm text-gray-600">Заказ: {item.orderNumber}</p>
                      <p className="text-sm text-gray-600">Телефон: {item.customerPhone}</p>
                      <p className="text-sm text-gray-600">Причина: {item.returnReason}</p>
                      {item.refundAmount && (
                        <p className="text-sm font-medium text-green-600">К возврату: {item.refundAmount.toLocaleString('ru-RU')} ₽</p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                      item.status === 'approved' ? 'bg-green-100 text-green-800' :
                      item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status === 'processing' ? 'В обработке' :
                       item.status === 'approved' ? 'Одобрено' :
                       item.status === 'rejected' ? 'Отклонено' :
                       item.status === 'completed' ? 'Завершено' : item.status}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{item.timestamp}</span>
                    
                    {/* Кнопки управления статусом */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => changeReturnStatus(item.id, 'approved')}
                        className="text-green-600 hover:bg-green-100 p-1 rounded transition-colors"
                        title="Одобрить"
                        disabled={item.status === 'completed'}
                      >
                        <Icon name="CheckCircle" size={16} />
                      </button>
                      <button
                        onClick={() => changeReturnStatus(item.id, 'rejected')}
                        className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors"
                        title="Отклонить"
                        disabled={item.status === 'completed'}
                      >
                        <Icon name="XCircle" size={16} />
                      </button>
                      {item.status === 'approved' && (
                        <button
                          onClick={() => changeReturnStatus(item.id, 'completed')}
                          className="text-purple-600 hover:bg-purple-100 p-1 rounded transition-colors"
                          title="Завершить возврат"
                        >
                          <Icon name="RotateCcw" size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Сканер */}
      <QRScanner
        isOpen={showScanner}
        onScan={handleOrderScan}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
};

export default ReturnsTab;