import { useState } from 'react';
import Icon from '@/components/ui/icon';

const TestAudioButton = () => {
  const [testing, setTesting] = useState(false);

  const testAudio = async () => {
    setTesting(true);
    console.log('🧪 ТЕСТИРУЕМ ОЗВУЧКУ...');

    try {
      // Импортируем bulletproof систему
      const { playAudio, playCellAudio, getAudioStats } = await import('@/utils/bulletproofAudio');
      
      // Получаем статистику
      const stats = getAudioStats();
      console.log('📊 Статистика аудио:', stats);
      
      // Проверяем активный вариант
      const activeVariant = localStorage.getItem('wb-active-voice-variant');
      console.log('🎵 Активный вариант:', activeVariant);
      
      // Проверяем загруженные варианты
      const variant1Data = localStorage.getItem('wb-voice-variant1-permanent');
      const variant2Data = localStorage.getItem('wb-voice-variant2-permanent');
      
      console.log('📦 Вариант 1 загружен:', !!variant1Data, variant1Data ? 'размер:' + variant1Data.length : '');
      console.log('📦 Вариант 2 загружен:', !!variant2Data, variant2Data ? 'размер:' + variant2Data.length : '');
      
      // Пробуем воспроизвести тестовую ячейку
      console.log('🔊 Пробуем воспроизвести ячейку 1...');
      const success1 = await playCellAudio('1');
      console.log('🔊 Результат ячейки 1:', success1);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Пробуем воспроизвести ячейку 100
      console.log('🔊 Пробуем воспроизвести ячейку 100...');
      const success100 = await playCellAudio('100');
      console.log('🔊 Результат ячейки 100:', success100);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Пробуем системный звук
      console.log('🔊 Пробуем системный звук...');
      const successSystem = await playAudio('товары со скидкой');
      console.log('🔊 Результат системного звука:', successSystem);
      
      if (success1 || success100 || successSystem) {
        alert('✅ Тест прошел! Озвучка работает.\n\nПроверьте консоль браузера (F12) для деталей.');
      } else {
        alert('❌ Тест не прошел. Озвучка не работает.\n\nОткройте консоль браузера (F12) для диагностики.');
      }
      
    } catch (error) {
      console.error('❌ Ошибка тестирования:', error);
      alert(`❌ Ошибка тестирования: ${error}`);
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