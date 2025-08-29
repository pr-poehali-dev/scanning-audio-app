import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface PhoneInputProps {
  onPhoneSubmit: (lastFourDigits: string) => void;
}

const PhoneInput = ({ onPhoneSubmit }: PhoneInputProps) => {
  const [phoneDigits, setPhoneDigits] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneDigits.length !== 4) {
      setError('Введите 4 цифры');
      return;
    }
    setError('');
    onPhoneSubmit(phoneDigits);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPhoneDigits(value);
    if (error) setError('');
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg border p-6 text-center">
        <Icon name="Phone" size={48} className="text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Поиск заказа</h2>
        <p className="text-gray-600 mb-6">Введите последние 4 цифры номера телефона клиента</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={phoneDigits}
              onChange={handlePhoneChange}
              placeholder="****"
              className={`w-full px-4 py-3 text-center text-2xl font-mono border rounded-lg focus:outline-none focus:ring-2 ${
                error 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
              maxLength={4}
            />
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>
          
          <button
            type="submit"
            disabled={phoneDigits.length !== 4}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            <Icon name="Search" size={20} />
            Найти заказ
          </button>
        </form>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => onPhoneSubmit('fake-scan')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Icon name="Scan" size={20} />
            Сканировать QR-код
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneInput;