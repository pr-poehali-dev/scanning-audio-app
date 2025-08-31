interface AudioFiles {
  delivery: File[];
  receiving: File[];
  return: File[];
  cells: File[];
}

export const saveAudioFiles = async (
  audioFiles: AudioFiles,
  updateAudioFiles: (files: {[key: string]: string}) => Promise<void>
) => {
  const convertedFiles: {[key: string]: string} = {};
  const cellFiles: {[key: string]: string} = {};
  let totalConverted = 0;
  
  for (const [type, files] of Object.entries(audioFiles)) {
    for (const file of files) {
      const baseFileName = file.name.replace(/\.[^/.]+$/, '');
      const audioUrl = URL.createObjectURL(file);
      
      const prefixedFileName = `${type}-${baseFileName}`;
      convertedFiles[prefixedFileName] = audioUrl;
      
      convertedFiles[baseFileName] = audioUrl;
      
      if (type === 'cells') {
        cellFiles[baseFileName] = audioUrl;
        cellFiles[prefixedFileName] = audioUrl;
        console.log(`🏠 ЯЧЕЙКА ПРИНУДИТЕЛЬНО ЗАЩИЩЕНА: ${baseFileName} (тип: ${type})`);
      }
      
      if (type === 'receiving' || type === 'delivery') {
        cellFiles[baseFileName] = audioUrl;
        cellFiles[prefixedFileName] = audioUrl;
        console.log(`🔄 ПРОЦЕСС ПРИНУДИТЕЛЬНО ЗАЩИЩЕН: ${baseFileName} (тип: ${type})`);
      }
      
      if (/^\d+$/.test(baseFileName) || baseFileName.includes('cell-') || baseFileName.includes('ячейка') ||
          baseFileName.includes('коробка') || baseFileName.includes('товар') || baseFileName.includes('приемка') ||
          baseFileName.includes('box-scanned') || baseFileName.includes('item-for-pvz') || baseFileName.includes('bulk-accepted')) {
        cellFiles[baseFileName] = audioUrl;
        cellFiles[prefixedFileName] = audioUrl;
        console.log(`🔑 КЛЮЧЕВОЕ СЛОВО ЗАЩИЩЕНО: ${baseFileName}`);
      }
      
      totalConverted++;
    }
  }
  
  if (Object.keys(cellFiles).length > 0) {
    try {
      localStorage.setItem('wb-pvz-cell-audio-settings-permanent', JSON.stringify(cellFiles));
      localStorage.setItem('wb-pvz-cell-audio-lock', 'LOCKED');
      localStorage.setItem('wb-pvz-cell-audio-timestamp', new Date().toISOString());
      console.log(`🔒 ЗАЩИЩЕННОЕ СОХРАНЕНИЕ: ${Object.keys(cellFiles).length} файлов сохранены навсегда`);
      console.log('🔒 Защищенные файлы:', Object.keys(cellFiles));
    } catch (error) {
      console.error('❌ Ошибка защищенного сохранения:', error);
    }
  } else {
    console.log('⚠️ Нет файлов для защищенного сохранения');
  }

  try {
    const cementedFiles = {};
    
    Object.keys(convertedFiles).forEach(key => {
      if (/^\d+$/.test(key) || key.includes('cell-') || key.includes('ячейка') || 
          key.includes('receiving-') || key.includes('delivery-') || key.includes('cells-') ||
          key.includes('A') || key.includes('B') || key.includes('C') || key.includes('D') ||
          /[A-Z]\d+/.test(key) || /\d+[A-Z]/.test(key)) {
        cementedFiles[key] = convertedFiles[key];
        console.log(`🏗️ ЗАБЕТОНИРОВАН ФАЙЛ: ${key}`);
      }
    });
    
    const existingCemented = JSON.parse(localStorage.getItem('wb-pvz-cell-audio-settings-permanent') || '{}');
    const ultimateFiles = { ...existingCemented, ...cementedFiles };
    
    localStorage.setItem('wb-pvz-cell-audio-settings-permanent', JSON.stringify(ultimateFiles));
    localStorage.setItem('wb-pvz-cell-audio-backup', JSON.stringify(ultimateFiles));
    localStorage.setItem('wb-pvz-cell-audio-cement', JSON.stringify(ultimateFiles));
    localStorage.setItem('wb-pvz-cell-audio-lock', 'CEMENTED');
    
    console.log(`🏗️ ЗАБЕТОНИРОВАНО: ${Object.keys(cementedFiles).length} новых файлов`);
    console.log(`🏗️ ВСЕГО В БЕТОНЕ: ${Object.keys(ultimateFiles).length} файлов`);
    console.log('🏗️ ФАЙЛЫ В БЕТОНЕ:', Object.keys(ultimateFiles));
    
    setTimeout(() => {
      const check = localStorage.getItem('wb-pvz-cell-audio-settings-permanent');
      if (!check) {
        localStorage.setItem('wb-pvz-cell-audio-settings-permanent', JSON.stringify(ultimateFiles));
        console.log('🏗️ ВОССТАНОВЛЕНО ИЗ РЕЗЕРВА!');
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Ошибка бетонирования:', error);
  }
  
  if (totalConverted > 0) {
    await updateAudioFiles(convertedFiles);
    console.log(`✅ Сохранено ${totalConverted} аудиофайлов через useAudio`);
  }
  
  return totalConverted;
};