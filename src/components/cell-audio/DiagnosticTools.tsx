import React from 'react';

export const DiagnosticTools: React.FC = () => {
  const handleEmergencyDiagnostic = async () => {
    console.log('🚨 === ЭКСТРЕННАЯ ДИАГНОСТИКА СИСТЕМЫ ===');
    
    // 1. Проверяем localStorage напрямую
    console.log('📦 ПРОВЕРКА LOCALSTORAGE:');
    const keys = Object.keys(localStorage);
    const audioKeys = keys.filter(k => k.includes('audio') || k.includes('cell') || k.includes('wb-'));
    console.log(`Всего ключей: ${keys.length}`);
    console.log(`Аудио ключей: ${audioKeys.length}`);
    audioKeys.forEach(key => {
      const data = localStorage.getItem(key);
      const size = data ? Math.round(data.length / 1024) : 0;
      console.log(`  - ${key}: ${size}KB`);
      
      // Детальная проверка новой системы
      if (key === 'wb-audio-files-unified') {
        try {
          const parsed = JSON.parse(data);
          console.log(`    📊 Структура:`, parsed);
          console.log(`    🏠 Ячейки:`, Object.keys(parsed.cells || {}));
        } catch (e) {
          console.log(`    ❌ Ошибка парсинга: ${e.message}`);
        }
      }
    });
    
    // 2. Тестируем новую систему
    console.log('\n🧪 ТЕСТ НОВОЙ СИСТЕМЫ:');
    try {
      const { audioManager } = await import('@/utils/simpleAudioManager');
      const cells = audioManager.getCellsWithAudio();
      const info = audioManager.getStorageInfo();
      
      console.log(`Ячеек в новой системе: ${cells.length}`);
      console.log(`Доступные ячейки:`, cells);
      console.log(`Информация о хранилище:`, info);
      
      // Тест воспроизведения
      if (cells.length > 0) {
        const testCell = cells[0];
        console.log(`🎵 Тестирую воспроизведение ячейки ${testCell}...`);
        const success = await audioManager.playCellAudio(testCell);
        console.log(`Результат теста: ${success ? 'УСПЕХ ✅' : 'ПРОВАЛ ❌'}`);
      }
    } catch (error) {
      console.error('❌ Ошибка новой системы:', error);
    }
    
    // 3. Проверяем основную функцию
    console.log('\n🎯 ТЕСТ ОСНОВНОЙ ФУНКЦИИ:');
    try {
      const { playCellAudio, getAudioEnabledCells } = await import('@/utils/cellAudioPlayer');
      const enabledCells = getAudioEnabledCells();
      console.log(`Ячейки через основную функцию: ${enabledCells.length}`);
      console.log(`Список:`, enabledCells);
      
      if (enabledCells.length > 0) {
        const testCell = enabledCells[0];
        console.log(`🎵 Тестирую основную функцию с ячейкой ${testCell}...`);
        const success = await playCellAudio(testCell);
        console.log(`Результат основной функции: ${success ? 'УСПЕХ ✅' : 'ПРОВАЛ ❌'}`);
      }
    } catch (error) {
      console.error('❌ Ошибка основной функции:', error);
    }
    
    alert('Диагностика завершена! Проверьте консоль (F12) для подробностей.');
  };

  const handleDetailedDiagnostic = async () => {
    console.log('🔍 === ДИАГНОСТИКА СИСТЕМЫ ОЗВУЧКИ ЯЧЕЕК ===');
    
    let report = 'ДИАГНОСТИКА СИСТЕМЫ ОЗВУЧКИ ЯЧЕЕК:\n\n';
    
    try {
      // 1. Проверяем Data URL менеджер
      const { audioManager, getStorageInfo } = await import('@/utils/simpleAudioManager');
      const info = getStorageInfo();
      const cells = audioManager.getCellsWithAudio();
      
      report += `📊 DATA URL СИСТЕМА:\n`;
      report += `  Файлов: ${info.totalFiles}\n`;
      report += `  Ячеек: ${info.cellsCount}\n`;
      report += `  Размер: ${info.totalSize}\n`;
      report += `  Доступные ячейки: ${cells.slice(0, 10).join(', ')}\n\n`;
      
      // 2. Проверяем Object URL менеджер
      const { objectUrlAudioManager, getAudioManagerInfo } = await import('@/utils/objectUrlAudioManager');
      const objInfo = getAudioManagerInfo();
      const objCells = objectUrlAudioManager.getCellsWithAudio();
      
      report += `📊 OBJECT URL СИСТЕМА:\n`;
      report += `  Ячеек: ${objInfo.cellsCount}\n`;
      report += `  URLs: ${objInfo.totalUrls}\n`;
      report += `  Доступные ячейки: ${objCells.slice(0, 10).join(', ')}\n\n`;
      
      // 3. Проверяем главную систему
      const { getCellsFromMainSystem } = await import('@/utils/cellAudioIntegration');
      const mainCells = getCellsFromMainSystem();
      
      report += `📊 ГЛАВНАЯ СИСТЕМА (wb-audio-files):\n`;
      report += `  Ячеек: ${mainCells.length}\n`;
      report += `  Доступные ячейки: ${mainCells.slice(0, 10).join(', ')}\n\n`;
      
      // 4. Тестируем первую ячейку через все системы
      if (cells.length > 0) {
        const testCell = cells[0];
        report += `🧪 ТЕСТ ВОСПРОИЗВЕДЕНИЯ ЯЧЕЙКИ "${testCell}":\n`;
        
        // Тест через основную функцию
        try {
          const { playCellAudio } = await import('@/utils/cellAudioPlayer');
          const success = await playCellAudio(testCell);
          report += `  Основная функция: ${success ? 'РАБОТАЕТ ✅' : 'НЕ РАБОТАЕТ ❌'}\n`;
        } catch (e) {
          report += `  Основная функция: ОШИБКА ❌ - ${e.message}\n`;
        }
      } else {
        report += `❌ НЕТ ЯЧЕЕК ДЛЯ ТЕСТИРОВАНИЯ!\n`;
        report += `💡 Загрузите MP3 файлы через кнопку "Выбрать файлы" выше\n`;
      }
      
    } catch (error) {
      report += `❌ КРИТИЧЕСКАЯ ОШИБКА: ${error.message}\n`;
    }
    
    alert(report);
    console.log(report);
  };

  return (
    <>
      {/* ЭКСТРЕННАЯ ДИАГНОСТИКА */}
      <div className="bg-red-50 rounded-lg p-4 mt-4 border border-red-200">
        <h4 className="font-medium text-red-800 mb-2">Экстренная диагностика:</h4>
        <button
          onClick={handleEmergencyDiagnostic}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
        >
          🚨 ЭКСТРЕННАЯ ДИАГНОСТИКА
        </button>
      </div>

      {/* ДИАГНОСТИЧЕСКАЯ КНОПКА */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <button
          onClick={handleDetailedDiagnostic}
          className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium"
        >
          🔍 Диагностика системы озвучки
        </button>
      </div>
    </>
  );
};