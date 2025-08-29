import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export const AudioDiagnostics = () => {
  const handleDiagnostics = () => {
    const storage1 = localStorage.getItem('wb-audio-files');
    const storage2 = localStorage.getItem('cellAudios');
    const info = `
🔍 ДИАГНОСТИКА СОХРАНЕНИЯ:

📁 Основные файлы: ${storage1 ? 'найдены' : 'НЕ НАЙДЕНЫ'}
📱 Ячейки: ${storage2 ? 'найдены' : 'НЕ НАЙДЕНЫ'}

💾 Размер localStorage: ${((JSON.stringify(localStorage).length * 2) / 1024 / 1024).toFixed(2)} МБ

🌐 Браузер: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Другой'}
🔒 Приватный режим: ${!window.indexedDB ? 'ДА (может блокировать сохранение)' : 'НЕТ'}

📊 Детали:
- Основные: ${storage1 ? Object.keys(JSON.parse(storage1)).length + ' файлов' : '0 файлов'}  
- Ячейки: ${storage2 ? Object.keys(JSON.parse(storage2)).length + ' ячеек' : '0 ячеек'}
    `.trim();
    alert(info);
  };

  const handleTestAudio = async () => {
    const storage = localStorage.getItem('wb-audio-files');
    if (storage) {
      const files = JSON.parse(storage);
      const keys = Object.keys(files);
      if (keys.length > 0) {
        try {
          console.log('🧪 ТЕСТ ОЗВУЧКИ:', keys[0]);
          const audio = new Audio(files[keys[0]]);
          await audio.play();
          alert(`✅ Озвучка работает!\nТестирован файл: ${keys[0]}`);
        } catch (error) {
          alert(`❌ Ошибка воспроизведения!\nОшибка: ${(error as Error).message}`);
        }
      } else {
        alert('⚠️ Нет загруженных файлов для тестирования');
      }
    } else {
      alert('❌ Аудиофайлы не найдены в хранилище');
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2">💾 Автоматическое сохранение</h4>
      <p className="text-blue-700 text-sm mb-3">
        Загруженные аудиофайлы автоматически сохраняются в браузере и будут работать 
        даже после закрытия и повторного открытия приложения.
      </p>
      
      {/* Диагностика */}
      <div className="border-t border-blue-200 pt-3 space-y-2">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDiagnostics}
            className="text-xs"
          >
            <Icon name="Search" className="w-3 h-3 mr-1" />
            Диагностика
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleTestAudio}
            className="text-xs text-green-700"
          >
            <Icon name="Play" className="w-3 h-3 mr-1" />
            Тест озвучки
          </Button>
        </div>
      </div>
    </div>
  );
};