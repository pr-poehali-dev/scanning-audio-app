// Утилита для тестирования всей аудио системы

export const testAudioSystem = () => {
  console.log('🧪 === ПОЛНОЕ ТЕСТИРОВАНИЕ АУДИО СИСТЕМЫ ===');
  
  // Проверяем все хранилища
  const storages = [
    'wb-audio-files',
    'wb-pvz-cell-audio-settings-permanent',
    'wb-pvz-cell-audio-cement',
    'wb-pvz-cell-audio-IMMEDIATE',
    'wb-NEVER-LOSE-CELLS-BACKUP'
  ];
  
  let totalCellFiles = 0;
  let workingStorages = 0;
  
  console.log('📦 ПРОВЕРКА ВСЕХ ХРАНИЛИЩ:');
  
  storages.forEach(storageKey => {
    const storage = localStorage.getItem(storageKey);
    if (storage) {
      try {
        const files = JSON.parse(storage);
        const cellFiles = Object.keys(files).filter(key => 
          /^\d+$/.test(key) || 
          key.includes('cell-') || 
          key.includes('ячейка')
        );
        
        if (cellFiles.length > 0) {
          console.log(`✅ ${storageKey}: ${cellFiles.length} файлов ячеек`, cellFiles.slice(0, 3));
          totalCellFiles += cellFiles.length;
          workingStorages++;
        } else {
          console.log(`⚠️ ${storageKey}: Есть, но нет файлов ячеек`);
        }
      } catch (error) {
        console.error(`❌ ${storageKey}: Ошибка парсинга`, error);
      }
    } else {
      console.log(`❌ ${storageKey}: НЕТ ДАННЫХ`);
    }
  });
  
  console.log(`\n🏆 РЕЗУЛЬТАТ ТЕСТИРОВАНИЯ:`);
  console.log(`📊 Рабочих хранилищ: ${workingStorages}/${storages.length}`);
  console.log(`🏠 Всего файлов ячеек: ${totalCellFiles}`);
  
  if (totalCellFiles === 0) {
    console.log(`\n❌ СИСТЕМА НЕ НАСТРОЕНА!`);
    console.log(`💡 РЕШЕНИЕ: Настройки → Голосовая озвучка → Загрузить папку ячеек`);
    return false;
  } else {
    console.log(`\n✅ СИСТЕМА ГОТОВА К РАБОТЕ!`);
    return true;
  }
};

// Автоматическое тестирование при загрузке приложения
export const autoTestOnStart = () => {
  setTimeout(() => {
    testAudioSystem();
  }, 2000); // Ждем 2 секунды после старта
};