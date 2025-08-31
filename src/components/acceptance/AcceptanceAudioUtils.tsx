import { AcceptanceAudioUtilsProps } from './AcceptanceTypes';

// Утилиты для озвучки в системе приемки

export const createAcceptanceAudioUtils = ({ playAudio, customAudioFiles }: AcceptanceAudioUtilsProps) => {
  
  // 🔊 Озвучка ячейки в приемке (такая же как в выдаче)
  const playCellAudio = async (cellNumber: string) => {
    console.log(`🔊 === ОЗВУЧКА ЯЧЕЙКИ В ПРИЕМКЕ: ${cellNumber} ===`);
    
    const cellSearchOrder = [
      'cell-number',        // Универсальный файл для всех ячеек
      cellNumber,           // Точный номер ячейки
      `cell-${cellNumber}`, // С префиксом cell
      `ячейка-${cellNumber}`, // Русский вариант
      `ячейка_${cellNumber}`, // Русский с подчеркиванием
      `acceptance-cell-${cellNumber}`, // Специально для приемки
      `acceptance-ячейка-${cellNumber}` // Русский для приемки
    ];
    
    let cellAudioPlayed = false;
    console.log(`🔍 Поиск аудио для ячейки в порядке приоритета:`, cellSearchOrder);
    
    for (const audioKey of cellSearchOrder) {
      if (customAudioFiles[audioKey]) {
        try {
          console.log(`🎵 НАЙДЕНО И ВОСПРОИЗВОДИТСЯ: "${audioKey}"`);
          const audio = new Audio(customAudioFiles[audioKey]);
          
          const playPromise = new Promise((resolve, reject) => {
            audio.onended = resolve;
            audio.onerror = reject;
            audio.oncanplaythrough = () => {
              audio.play().then(resolve).catch(reject);
            };
          });
          
          await playPromise;
          console.log(`🎵 ✅ ЯЧЕЙКА ${cellNumber} ОЗВУЧЕНА В ПРИЕМКЕ: "${audioKey}"`);
          cellAudioPlayed = true;
          break;
          
        } catch (error) {
          console.error(`❌ ОШИБКА ВОСПРОИЗВЕДЕНИЯ "${audioKey}":`, error);
          continue;
        }
      } else {
        console.log(`❌ НЕ НАЙДЕН: "${audioKey}"`);
      }
    }
    
    if (!cellAudioPlayed) {
      console.warn(`⚠️ ЯЧЕЙКА ${cellNumber} НЕ ОЗВУЧЕНА - ФАЙЛ НЕ НАЙДЕН!`);
      console.log('📤 Загрузите один из файлов:');
      console.log('  1. "cell-number" - универсальная озвучка для ВСЕХ ячеек');
      console.log(`  2. "${cellNumber}" - озвучка только для ячейки ${cellNumber}`);
    }
    
    return cellAudioPlayed;
  };

  // 🔊 Озвучка действий приемки
  const playAcceptanceAudio = async (action: string, itemData?: any) => {
    console.log(`🔊 === ОЗВУЧКА ДЕЙСТВИЯ ПРИЕМКИ: ${action} ===`, itemData);
    console.log(`📁 Доступные аудиофайлы:`, Object.keys(customAudioFiles));
    
    const actionAudios: Record<string, string[]> = {
      // Новые действия приемки
      'box-accepted': ['коробка-принята', 'receiving-коробка-принята', 'box-accepted'],
      'scan-again': ['отсканируйте-еще-раз', 'receiving-отсканируйте-еще-раз', 'scan-again'],
      'continue-acceptance': ['продолжайте-приемку', 'receiving-продолжайте-приемку', 'continue-acceptance'],
      'item-for-pvz': ['товар-для-пвз', 'receiving-товар-для-пвз', 'item-for-pvz'],
      'scan-next': ['отсканируйте-следующий-товар', 'receiving-отсканируйте-следующий-товар', 'scan-next'],
      'priority-order': ['приоритетный-заказ', 'receiving-приоритетный-заказ', 'priority-order'],
      'already-accepted': ['повтор-товар-уже-принят', 'receiving-повтор-товар-уже-принят', 'already-accepted'],
      'box-scanned': ['коробка-принята', 'коробка-отсканирована', 'receiving-коробка-принята', 'receiving-коробка-отсканирована', 'box-scanned'],
      // Старые действия для совместимости
      'item_scanned': ['acceptance-Товар отсканирован', 'acceptance-scan-success', 'scan-success'],
      'accepted': ['acceptance-Принято в ПВЗ', 'accepted-success', 'товар принят'],
      'bulk_accepted': ['acceptance-Все товары приняты', 'acceptance-bulk-success'],
      'damaged': ['acceptance-Товар поврежден', 'damaged-item'],
      'rejected': ['acceptance-Ошибка приемки', 'rejection-sound', 'error'],
      'start_scanning': ['acceptance-Начинаю сканирование', 'scan-start']
    };

    const searchKeys = actionAudios[action] || [action];
    let audioPlayed = false;
    
    console.log(`🔍 Поиск аудио в порядке приоритета:`, searchKeys);
    
    for (const audioKey of searchKeys) {
      console.log(`🔎 Проверяю ключ: "${audioKey}"`);
      if (customAudioFiles[audioKey]) {
        try {
          console.log(`🎵 ВОСПРОИЗВОЖУ ДЕЙСТВИЕ ПРИЕМКИ: "${audioKey}"`);
          const audio = new Audio(customAudioFiles[audioKey]);
          
          // Улучшенное воспроизведение с Promise
          const playPromise = new Promise((resolve, reject) => {
            audio.onended = resolve;
            audio.onerror = reject;
            audio.oncanplaythrough = () => {
              audio.play().then(resolve).catch(reject);
            };
          });
          
          await playPromise;
          console.log(`🎵 ✅ ДЕЙСТВИЕ ОЗВУЧЕНО: "${audioKey}"`);
          audioPlayed = true;
          break;
        } catch (error) {
          console.error(`❌ ОШИБКА ОЗВУЧКИ "${audioKey}":`, error);
          continue;
        }
      } else {
        console.log(`❌ НЕ НАЙДЕН: "${audioKey}"`);
      }
    }
    
    if (!audioPlayed) {
      console.warn(`⚠️ ДЕЙСТВИЕ "${action}" НЕ ОЗВУЧЕНО - ФАЙЛ НЕ НАЙДЕН!`);
      console.log('📤 Загрузите один из файлов:', searchKeys);
      
      // Резервная озвучка через общую функцию
      try {
        playAudio(action);
        console.log(`🔄 Попытка резервной озвучки через playAudio: "${action}"`);
        audioPlayed = true;
      } catch (error) {
        console.log(`❌ Резервная озвучка тоже не сработала`);
      }
    }
    
    return audioPlayed;
  };

  return {
    playCellAudio,
    playAcceptanceAudio
  };
};