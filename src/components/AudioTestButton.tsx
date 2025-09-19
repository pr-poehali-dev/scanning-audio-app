import React from 'react';

export const AudioTestButton: React.FC = () => {
  const testCellAudio = async () => {
    console.log('🧪 === ТЕСТ ОЗВУЧКИ ЯЧЕЙКИ ===');
    
    try {
      // Тестируем прямой вызов
      console.log('🔧 Импорт cellAudioPlayer...');
      const { playCellAudio } = await import('@/utils/cellAudioPlayer');
      
      console.log('🔊 Попытка озвучить ячейку 123...');
      const success = await playCellAudio('123');
      
      if (success) {
        console.log('✅ ТЕСТ ПРОШЕЛ: Ячейка 123 озвучена!');
      } else {
        console.log('❌ ТЕСТ НЕ ПРОШЕЛ: Озвучка не сработала');
      }
    } catch (error) {
      console.error('❌ ОШИБКА ТЕСТА:', error);
    }
  };

  const testAudioManager = async () => {
    console.log('🧪 === ТЕСТ АУДИО МЕНЕДЖЕРА ===');
    
    try {
      const { audioManager } = await import('@/utils/simpleAudioManager');
      
      console.log('📊 Информация о хранилище:');
      const info = audioManager.getStorageInfo();
      console.log('- Ячеек с озвучкой:', info.cellsCount);
      console.log('- Всего файлов:', info.totalFiles);
      console.log('- Размер:', info.totalSize);
      
      const cells = audioManager.getCellsWithAudio();
      console.log('📋 Доступные ячейки:', cells.slice(0, 10));
      
      if (cells.length > 0) {
        const testCell = cells[0];
        console.log(`🔊 Тестируем ячейку: ${testCell}`);
        const success = await audioManager.playCellAudio(testCell);
        console.log('Результат:', success ? '✅ Успех' : '❌ Не удалось');
      }
    } catch (error) {
      console.error('❌ ОШИБКА ТЕСТА МЕНЕДЖЕРА:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
      <h3 className="text-sm font-bold mb-2">🧪 Диагностика озвучки</h3>
      <div className="space-y-2">
        <button
          onClick={testCellAudio}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Тест cellAudioPlayer
        </button>
        <button
          onClick={testAudioManager}
          className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          Тест audioManager
        </button>
      </div>
    </div>
  );
};