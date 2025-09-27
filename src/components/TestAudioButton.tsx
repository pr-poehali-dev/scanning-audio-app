import { useState } from 'react';
import Icon from '@/components/ui/icon';

const TestAudioButton = () => {
  const [testing, setTesting] = useState(false);

  const testAudio = async () => {
    setTesting(true);
    console.log('🧪 ЗАПУСК ПОЛНОЙ ДИАГНОСТИКИ...');

    try {
      // Запускаем диагностику
      const { testDirectAudio, forceActivateAudio } = await import('@/utils/directAudioTest');
      
      const diagnostic = await testDirectAudio();
      console.log(diagnostic);
      
      // Пробуем принудительную активацию
      console.log('🔄 ПРОБУЕМ ПРИНУДИТЕЛЬНУЮ АКТИВАЦИЮ...');
      const activated = await forceActivateAudio();
      
      if (activated) {
        // Если активация прошла - тестируем bulletproof
        const { playCellAudio } = await import('@/utils/bulletproofAudio');
        
        console.log('🔊 ТЕСТИРУЕМ ПОСЛЕ АКТИВАЦИИ...');
        const success = await playCellAudio('1');
        
        if (success) {
          alert('✅ ОЗВУЧКА РАБОТАЕТ!\n\nПосле принудительной активации все заработало.\n\nСмотрите консоль для деталей.');
        } else {
          alert('❌ Активация прошла, но озвучка все равно не работает.\n\nДетали в консоли (F12):\n\n' + diagnostic.slice(0, 500) + '...');
        }
      } else {
        alert('❌ ОЗВУЧКА НЕ РАБОТАЕТ\n\nДетали диагностики в консоли (F12):\n\n' + diagnostic.slice(0, 500) + '...');
      }
      
    } catch (error) {
      console.error('❌ Критическая ошибка диагностики:', error);
      alert(`❌ Критическая ошибка: ${error}`);
    }
    
    setTesting(false);
  };

  return (
    <button 
      onClick={testAudio}
      disabled={testing}
      className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50"
    >
      {testing ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon name="Volume2" size={16} />
      )}
      <span>{testing ? 'Тестируем...' : 'Тест озвучки'}</span>
    </button>
  );
};

export default TestAudioButton;