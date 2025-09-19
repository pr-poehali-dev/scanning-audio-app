import { audioManager } from '@/utils/simpleAudioManager';
import { objectUrlAudioManager } from '@/utils/objectUrlAudioManager';
import { saveCellAudioToMainSystem } from '@/utils/cellAudioIntegration';

export const extractCellNumberFromFileName = (fileName: string): string => {
  const lowerFileName = fileName.toLowerCase();
  console.log(`🔍 Анализирую файл: ${fileName}`);
  
  // Список всех возможных паттернов
  const patterns = [
    // Основные форматы
    /(?:cell[-_]?)([a-z]\d+)/i,           // cell-A1, cell_A1, cellA1
    /(?:ячейка[-_]?)([a-z]\d+)/i,         // ячейка-A1, ячейка_A1
    /^([a-z]\d+)/i,                       // A1.mp3, B15.wav
    /(?:номер[-_]?)(\d+)/i,               // номер-126, номер_126
    /(?:number[-_]?)(\d+)/i,              // number-126, number_126
    /(?:cell[-_]?)(\d+)/i,                // cell-126, cell_126
    /(?:ячейка[-_]?)(\d+)/i,              // ячейка-126, ячейка_126
    /^(\d+)/,                             // 126.mp3, 999.wav
    
    // Дополнительные форматы
    /(?:box[-_]?)([a-z]\d+)/i,            // box-A1, box_A1
    /(?:slot[-_]?)([a-z]\d+)/i,           // slot-A1, slot_A1
    /(?:compartment[-_]?)([a-z]\d+)/i,    // compartment-A1
    /(?:locker[-_]?)([a-z]\d+)/i,         // locker-A1
    
    // Для числовых ячеек
    /(?:box[-_]?)(\d+)/i,                 // box-126, box_126
    /(?:slot[-_]?)(\d+)/i,                // slot-126, slot_126
    /(?:compartment[-_]?)(\d+)/i,         // compartment-126
    /(?:locker[-_]?)(\d+)/i,              // locker-126
  ];
  
  // Пробуем каждый паттерн
  for (const pattern of patterns) {
    const match = lowerFileName.match(pattern);
    if (match && match[1]) {
      const cellNumber = match[1].toUpperCase();
      console.log(`✅ Найден номер ячейки "${cellNumber}" по паттерну: ${pattern}`);
      return cellNumber;
    }
  }
  
  // Если ничего не найдено - пробуем извлечь любые буквы+цифры или просто цифры
  // Ищем комбинацию буква+цифры
  const letterNumberMatch = lowerFileName.match(/([a-z]\d+)/i);
  if (letterNumberMatch) {
    const cellNumber = letterNumberMatch[1].toUpperCase();
    console.log(`✅ Найден номер ячейки "${cellNumber}" как буква+цифры`);
    return cellNumber;
  }
  
  // Ищем просто цифры
  const numberMatch = lowerFileName.match(/(\d+)/);
  if (numberMatch) {
    const cellNumber = numberMatch[1];
    console.log(`✅ Найден номер ячейки "${cellNumber}" как числовой`);
    return cellNumber;
  }
  
  return '';
};

export const saveCellAudioToAllSystems = async (cellNumber: string, file: File): Promise<boolean> => {
  console.log(`💾 Сохраняю ${file.name} для ячейки ${cellNumber}...`);
  
  // ГЛАВНАЯ СИСТЕМА - сохраняем в wb-audio-files (как системные озвучки)
  console.log(`💾 [ГЛАВНАЯ] Сохраняю ${file.name} для ячейки ${cellNumber} в основную систему...`);
  const mainSystemSuccess = await saveCellAudioToMainSystem(cellNumber, file);
  
  // РЕЗЕРВНЫЕ СИСТЕМЫ
  console.log(`💾 [РЕЗЕРВ] Сохраняю ${file.name} для ячейки ${cellNumber} через Object URL...`);
  const objectUrlSuccess = await objectUrlAudioManager.saveCellAudio(cellNumber, file);
  
  console.log(`💾 [РЕЗЕРВ] Сохраняю ${file.name} для ячейки ${cellNumber} через Data URL менеджер...`);
  const dataUrlSuccess = await audioManager.saveCellAudio(cellNumber, file);
  
  const hasAnySuccess = mainSystemSuccess || objectUrlSuccess || dataUrlSuccess;
  
  if (hasAnySuccess) {
    console.log(`✅ Загружен файл для ячейки ${cellNumber}:`);
    console.log(`   Главная система: ${mainSystemSuccess ? '✅' : '❌'}`);
    console.log(`   Object URL: ${objectUrlSuccess ? '✅' : '❌'}`);
    console.log(`   Data URL: ${dataUrlSuccess ? '✅' : '❌'}`);
  } else {
    console.error(`❌ Ошибка загрузки файла для ячейки ${cellNumber} во все системы`);
  }
  
  return hasAnySuccess;
};

export const handleFileUpload = async (
  files: FileList,
  setUploading: (uploading: boolean) => void,
  setUploadedCells: React.Dispatch<React.SetStateAction<string[]>>,
  handleTestCell: (cellNumber: string) => void
): Promise<void> => {
  setUploading(true);
  const successCells: string[] = [];
  
  try {
    for (const file of Array.from(files)) {
      // Проверяем что это аудио файл
      if (!file.type.startsWith('audio/')) {
        console.warn(`⚠️ Пропускаем файл ${file.name}: не аудио`);
        continue;
      }
      
      // УМНОЕ ИЗВЛЕЧЕНИЕ НОМЕРА ЯЧЕЙКИ ИЗ ИМЕНИ ФАЙЛА
      const cellNumber = extractCellNumberFromFileName(file.name);
      
      if (!cellNumber) {
        console.warn(`⚠️ Не удалось определить номер ячейки из файла: ${file.name}`);
        console.warn(`💡 Переименуйте файл в формат: A1.mp3, cell-126.mp3, или 999.mp3`);
        continue;
      }
      
      const success = await saveCellAudioToAllSystems(cellNumber, file);
      
      if (success) {
        successCells.push(cellNumber);
      }
    }
    
    setUploadedCells(prev => [...new Set([...prev, ...successCells])]);
    
    if (successCells.length > 0) {
      console.log(`🎉 Успешно загружено ${successCells.length} файлов ячеек`);
      
      // Показываем успешное сообщение с кнопкой тестирования
      const message = `Успешно загружено ${successCells.length} файлов!\n\nЯчейки: ${successCells.join(', ')}\n\nХотите протестировать первую ячейку?`;
      if (window.confirm(message)) {
        handleTestCell(successCells[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка загрузки файлов:', error);
  } finally {
    setUploading(false);
  }
};