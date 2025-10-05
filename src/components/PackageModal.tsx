import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface Package {
  type: string;
  price: number;
  quantity: number;
}

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (packages: Package[]) => void;
}

const PACKAGE_TYPES = [
  { type: 'Малый', price: 5 },
  { type: 'Средний', price: 10 },
  { type: 'Большой', price: 15 },
  { type: 'XL', price: 20 }
];

const PackageModal = ({ isOpen, onClose, onAdd }: PackageModalProps) => {
  const [selectedPackages, setSelectedPackages] = useState<Package[]>([]);

  if (!isOpen) return null;

  const handleQuantityChange = (type: string, price: number, delta: number) => {
    setSelectedPackages(prev => {
      const existing = prev.find(p => p.type === type);
      
      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter(p => p.type !== type);
        }
        return prev.map(p => 
          p.type === type ? { ...p, quantity: newQuantity } : p
        );
      } else if (delta > 0) {
        return [...prev, { type, price, quantity: 1 }];
      }
      
      return prev;
    });
  };

  const getQuantity = (type: string) => {
    return selectedPackages.find(p => p.type === type)?.quantity || 0;
  };

  const totalCost = selectedPackages.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalPackages = selectedPackages.reduce((sum, p) => sum + p.quantity, 0);

  const handleAdd = () => {
    onAdd(selectedPackages);
    setSelectedPackages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Добавить пакеты</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {PACKAGE_TYPES.map(({ type, price }) => {
            const quantity = getQuantity(type);
            
            return (
              <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{type}</div>
                  <div className="text-sm text-gray-500">{price} ₽</div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(type, price, -1)}
                    disabled={quantity === 0}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                      quantity === 0
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200 active:bg-purple-300'
                    }`}
                  >
                    <Icon name="Minus" size={16} />
                  </button>

                  <span className="w-8 text-center font-semibold">{quantity}</span>

                  <button
                    onClick={() => handleQuantityChange(type, price, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 transition-colors"
                  >
                    <Icon name="Plus" size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Всего пакетов:</span>
            <span className="font-semibold">{totalPackages} шт</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Итого:</span>
            <span className="text-xl font-bold text-purple-600">{totalCost} ₽</span>
          </div>

          <button
            onClick={handleAdd}
            disabled={totalPackages === 0}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              totalPackages > 0
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Добавить {totalPackages > 0 && `(${totalPackages} шт)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageModal;
