import { useState } from 'react';
import Icon from '@/components/ui/icon';

const AudioTestDebug = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runFullDiagnostic = async () => {
    setIsLoading(true);
    setTestResult('');
    
    let result = '🔍 ПОЛНАЯ ДИАГНОСТИКА АУДИО СИСТЕМЫ:\n\n';
    
    try {
      // 1. Проверяем localStorage
      result += '📦 ПРОВЕРКА LOCALSTORAGE:\n';
      const keys = Object.keys(localStorage);
      const audioKeys = keys.filter(k => k.includes('audio') || k.includes('wb-'));
      result += `Всего ключей: ${keys.length}\n`;
      result += `Аудио ключей: ${audioKeys.length}\n`;
      audioKeys.forEach(key => {
        const size = localStorage.getItem(key)?.length || 0;
        result += `  - ${key}: ${Math.round(size/1024)}KB\n`;
      });
      
      // 2. Проверяем новый менеджер
      result += '\n🔧 ПРОВЕРКА НОВОГО МЕНЕДЖЕРА:\n';
      try {
        const { audioManager, getStorageInfo, getCellsWithAudio } = await import('@/utils/simpleAudioManager');
        const info = getStorageInfo();
        const cells = getCellsWithAudio();
        
        result += `Файлов: ${info.totalFiles}\n`;
        result += `Размер: ${info.totalSize}\n`;
        result += `Ячеек: ${info.cellsCount}\n`;
        result += `Доступные ячейки: ${cells.slice(0, 5).join(', ')}\n`;
        
        // Пробуем воспроизвести первую ячейку
        if (cells.length > 0) {
          const testCell = cells[0];
          result += `\n🎵 ТЕСТ ВОСПРОИЗВЕДЕНИЯ ЯЧЕЙКИ ${testCell}:\n`;
          const success = await audioManager.playCellAudio(testCell);
          result += success ? '✅ РАБОТАЕТ!\n' : '❌ НЕ РАБОТАЕТ\n';
        }
        
      } catch (error) {
        result += `❌ Ошибка нового менеджера: ${error.message}\n`;
      }
      
      // 3. Проверяем старую систему
      result += '\n🏗️ ПРОВЕРКА СТАРОЙ СИСТЕМЫ:\n';
      const oldFiles = localStorage.getItem('wb-audio-files');
      if (oldFiles) {
        try {
          const files = JSON.parse(oldFiles);
          const fileKeys = Object.keys(files);
          result += `Файлов в старой системе: ${fileKeys.length}\n`;
          
          const cellKeys = fileKeys.filter(k => k.includes('cell-') || /^\d+$/.test(k));
          result += `Ячеек в старой системе: ${cellKeys.length}\n`;
          
          if (cellKeys.length > 0) {
            const testKey = cellKeys[0];
            const testUrl = files[testKey];
            result += `\n🎵 ТЕСТ ПРЯМОГО ВОСПРОИЗВЕДЕНИЯ ${testKey}:\n`;
            
            try {
              const audio = new Audio(testUrl);
              await audio.play();
              result += '✅ ПРЯМОЕ ВОСПРОИЗВЕДЕНИЕ РАБОТАЕТ!\n';
              setTimeout(() => audio.pause(), 1000);
            } catch (playError) {
              result += `❌ Ошибка воспроизведения: ${playError.message}\n`;
            }
          }
        } catch (parseError) {
          result += `❌ Ошибка парсинга старых файлов: ${parseError.message}\n`;
        }
      } else {
        result += '❌ Старые файлы не найдены\n';
      }
      
      // 4. Проверяем браузерную поддержку
      result += '\n🌐 ПРОВЕРКА БРАУЗЕРА:\n';
      result += `User Agent: ${navigator.userAgent}\n`;
      result += `Audio поддержка: ${!!(window.Audio)}\n`;
      
      // Проверяем разрешения на автовоспроизведение
      if ('permissions' in navigator) {
        try {
          // @ts-ignore
          const permission = await navigator.permissions.query({name: 'autoplay'});
          result += `Autoplay разрешение: ${permission.state}\n`;
        } catch (e) {
          result += 'Autoplay проверка недоступна\n';
        }
      }
      
      // 5. Тест простого звука
      result += '\n🔊 ТЕСТ ПРОСТОГО ЗВУКА:\n';
      try {
        // Создаем простой тестовый звук
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        
        result += '✅ Браузерный звук работает\n';
      } catch (audioError) {
        result += `❌ Ошибка браузерного звука: ${audioError.message}\n`;
      }
      
    } catch (error) {
      result += `❌ КРИТИЧЕСКАЯ ОШИБКА: ${error.message}\n`;
    }
    
    setTestResult(result);
    setIsLoading(false);
  };

  const testDirectPlay = async () => {
    const testUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDmM1fPMeTEGJXzJ8N2PQgkTXrHo7qpYFAhMoj/yo9mOBCl91fLOeFAGJXzI8N2OQwkTXq/o8KFg69oDAWHN8t+QQQkSXrXr7ahVFgdLno/0wnkjBDJ+zPPeiUIJEV2+7vKnUBMGUZzh8KBZEwU3f9H//';
    
    try {
      setTestResult('🎵 Тестирую прямое воспроизведение...\n');
      const audio = new Audio(testUrl);
      await audio.play();
      setTestResult(prev => prev + '✅ Прямое воспроизведение работает!\n');
      setTimeout(() => audio.pause(), 500);
    } catch (error) {
      setTestResult(prev => prev + `❌ Ошибка: ${error.message}\n`);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Bug" size={20} className="text-red-600" />
        <h3 className="font-semibold">Диагностика аудио системы</h3>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={runFullDiagnostic}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Проверка...' : 'Полная диагностика'}
        </button>
        
        <button
          onClick={testDirectPlay}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Тест звука
        </button>
      </div>
      
      {testResult && (
        <div className="bg-gray-100 p-3 rounded text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
          {testResult}
        </div>
      )}
    </div>
  );
};

export default AudioTestDebug;