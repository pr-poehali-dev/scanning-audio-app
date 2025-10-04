/**
 * API для работы с новой системой голосовой озвучки
 * Предоставляет удобные функции для воспроизведения различных звуков
 */

import { voiceAssistantManager } from './voiceAssistantManager';

/**
 * Воспроизведение звука ошибки при сканировании неверного QR-кода
 */
export const playErrorSound = async (): Promise<boolean> => {
  console.log('🚨 Воспроизведение звука ошибки');
  return voiceAssistantManager.playNewAssistantSound('error_sound');
};

/**
 * Воспроизведение озвучки ячейки
 */
export const playCellNumber = async (cellNumber: string): Promise<boolean> => {
  console.log(`🏠 Озвучка ячейки: ${cellNumber}`);
  return voiceAssistantManager.playCellAudio(cellNumber);
};

/**
 * Воспроизведение количества товаров
 */
export const playGoodsCount = async (count: number): Promise<boolean> => {
  console.log(`📦 Озвучка количества: ${count}`);
  
  // Для нового помощника используем загруженные звуки
  if (voiceAssistantManager.getCurrentAssistant() === 'new') {
    // Попробуем найти соответствующий звук для числа
    const success = await voiceAssistantManager.playNewAssistantSound('goods_count', { count });
    if (success) return true;
  }
  
  // Fallback: используем синтез речи браузера
  return playTextToSpeech(count.toString());
};

/**
 * Воспроизведение правильного склонения слова "товар"
 */
export const playGoodsWord = async (count: number): Promise<boolean> => {
  console.log(`📝 Озвучка слова "товар" для количества: ${count}`);
  
  // Для нового помощника используем загруженные звуки
  if (voiceAssistantManager.getCurrentAssistant() === 'new') {
    const success = await voiceAssistantManager.playNewAssistantSound('goods_word', { count });
    if (success) return true;
  }
  
  // Fallback: определяем правильное склонение и озвучиваем
  const word = getGoodsWordDeclension(count);
  return playTextToSpeech(word);
};

/**
 * Полная озвучка количества товаров с правильным склонением
 */
export const playGoodsInfo = async (count: number): Promise<boolean> => {
  console.log(`📊 Полная озвучка товаров: ${count}`);
  
  try {
    // Воспроизводим количество
    const countSuccess = await playGoodsCount(count);
    
    // Небольшая пауза
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Воспроизводим слово
    const wordSuccess = await playGoodsWord(count);
    
    return countSuccess && wordSuccess;
  } catch (error) {
    console.error('❌ Ошибка озвучки информации о товарах:', error);
    return false;
  }
};

/**
 * Воспроизведение уведомления об оплате при получении
 */
export const playPaymentOnDelivery = async (): Promise<boolean> => {
  console.log('💰 Уведомление об оплате при получении');
  
  if (voiceAssistantManager.getCurrentAssistant() === 'new') {
    const success = await voiceAssistantManager.playNewAssistantSound('payment_on_delivery');
    if (success) return true;
  }
  
  // Fallback
  return playTextToSpeech('Оплата при получении');
};

/**
 * Воспроизведение инструкции проверить товар под камерой
 */
export const playCheckGoodUnderCamera = async (): Promise<boolean> => {
  console.log('📷 Инструкция проверить товар под камерой');
  
  if (voiceAssistantManager.getCurrentAssistant() === 'new') {
    const success = await voiceAssistantManager.playNewAssistantSound('please_check_good_under_camera');
    if (success) return true;
  }
  
  // Fallback
  return playTextToSpeech('Пожалуйста, проверьте товар под камерой');
};

/**
 * Воспроизведение благодарности и просьбы оценить PickPoint
 */
export const playThanksAndRate = async (): Promise<boolean> => {
  console.log('⭐ Благодарность и просьба оценить PickPoint');
  
  if (voiceAssistantManager.getCurrentAssistant() === 'new') {
    const success = await voiceAssistantManager.playNewAssistantSound('thanks_for_order_rate_pickpoint');
    if (success) return true;
  }
  
  // Fallback
  return playTextToSpeech('Спасибо за заказ! Пожалуйста, оцените работу PickPoint');
};

/**
 * Полный голосовой сценарий выдачи заказа
 */
export const playFullDeliveryScenario = async (cellNumber: string, goodsCount: number, hasPaymentOnDelivery: boolean): Promise<boolean> => {
  console.log(`🎬 Полный сценарий выдачи: ячейка ${cellNumber}, товаров ${goodsCount}, оплата при получении: ${hasPaymentOnDelivery}`);
  
  try {
    // 1. Озвучиваем ячейку
    await playCellNumber(cellNumber);
    await pause(500);
    
    // 2. Озвучиваем количество товаров
    await playGoodsInfo(goodsCount);
    await pause(300);
    
    // 3. Если оплата при получении
    if (hasPaymentOnDelivery) {
      await playPaymentOnDelivery();
      await pause(300);
    }
    
    // 4. Инструкция проверить товар
    await playCheckGoodUnderCamera();
    await pause(1000);
    
    // 5. Благодарность
    await playThanksAndRate();
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка воспроизведения полного сценария:', error);
    return false;
  }
};

/**
 * Вспомогательные функции
 */

/**
 * Определение правильного склонения слова "товар"
 */
function getGoodsWordDeclension(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'товаров';
  }
  
  if (lastDigit === 1) {
    return 'товар';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return 'товара';
  } else {
    return 'товаров';
  }
}

/**
 * Воспроизведение текста через синтез речи браузера (fallback)
 */
async function playTextToSpeech(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS || isAndroid) {
          utterance.volume = 1;
          utterance.rate = 1.0;
        }
        
        utterance.onend = () => {
          console.log('✅ Озвучка завершена');
          resolve(true);
        };
        
        utterance.onerror = (event) => {
          console.error('❌ Ошибка озвучки:', event);
          resolve(false);
        };
        
        if (isIOS) {
          setTimeout(() => {
            window.speechSynthesis.speak(utterance);
          }, 100);
        } else {
          window.speechSynthesis.speak(utterance);
        }
      } else {
        console.warn('⚠️ Синтез речи не поддерживается браузером');
        resolve(false);
      }
    } catch (error) {
      console.error('❌ Ошибка синтеза речи:', error);
      resolve(false);
    }
  });
}

/**
 * Пауза между звуками
 */
function pause(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Получение информации о текущем голосовом помощнике
 */
export const getCurrentVoiceAssistant = () => {
  return {
    id: voiceAssistantManager.getCurrentAssistant(),
    info: voiceAssistantManager.getAssistantInfo(voiceAssistantManager.getCurrentAssistant()),
    loadedSounds: voiceAssistantManager.getLoadedSounds(),
    storageInfo: voiceAssistantManager.getStorageInfo()
  };
};