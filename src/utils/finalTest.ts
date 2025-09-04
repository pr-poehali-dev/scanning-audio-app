// Финальное тестирование всей системы озвучки ячеек

export const performFinalTest = () => {
  console.log('🎯 === ФИНАЛЬНОЕ ТЕСТИРОВАНИЕ ===');
  
  const results = {
    storages: 0,
    cellFiles: 0,
    workingKeys: 0,
    errors: [] as string[]
  };
  
  // Проверяем хранилища
  const storages = [
    'wb-audio-files',
    'wb-pvz-cell-audio-settings-permanent',
    'wb-pvz-cell-audio-cement'
  ];
  
  storages.forEach(storageKey => {
    const storage = localStorage.getItem(storageKey);
    if (storage) {
      try {
        const files = JSON.parse(storage);
        results.storages++;
        
        // Ищем файлы ячеек
        Object.keys(files).forEach(key => {
          if (/^\d+$/.test(key) || key.includes('cell-') || key.includes('ячейка')) {
            results.cellFiles++;
            
            // Проверяем что файл действительно работает
            const url = files[key];
            if (url && (url.startsWith('data:audio/') || url.startsWith('blob:'))) {
              results.workingKeys++;
            }
          }
        });
        
        console.log(`✅ ${storageKey}: OK`);
      } catch (error) {
        results.errors.push(`❌ ${storageKey}: ${error.message}`);
      }
    } else {
      results.errors.push(`❌ ${storageKey}: НЕТ ДАННЫХ`);
    }
  });
  
  // Финальный отчет
  console.log('\n🏆 === ИТОГОВЫЙ ОТЧЕТ ===');
  console.log(`📦 Рабочих хранилищ: ${results.storages}/${storages.length}`);
  console.log(`🏠 Файлов ячеек: ${results.cellFiles}`);
  console.log(`✅ Рабочих ключей: ${results.workingKeys}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ОШИБКИ:');
    results.errors.forEach(error => console.log(error));
  }
  
  const isWorking = results.workingKeys > 0;
  
  console.log(`\n🎯 РЕЗУЛЬТАТ: ${isWorking ? '✅ СИСТЕМА РАБОТАЕТ!' : '❌ СИСТЕМА НЕ РАБОТАЕТ!'}`);
  
  return {
    isWorking,
    storages: results.storages,
    cellFiles: results.cellFiles,
    workingKeys: results.workingKeys,
    errors: results.errors
  };
};