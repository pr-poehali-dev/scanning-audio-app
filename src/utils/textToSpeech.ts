// Утилита для синтеза речи (фолбек если нет загруженных файлов)

export const speakText = (text: string, rate: number = 1.0): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn('⚠️ Text-to-Speech не поддерживается браузером');
      reject(new Error('TTS not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      console.log(`✅ TTS озвучка завершена: "${text}"`);
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('❌ Ошибка TTS:', event.error);
      reject(event.error);
    };

    console.log(`🔊 TTS озвучка: "${text}"`);
    window.speechSynthesis.cancel(); // Останавливаем предыдущую озвучку
    window.speechSynthesis.speak(utterance);
  });
};

// Функции для генерации текста озвучки
export const generateCellText = (cellNumber: number): string => {
  return `Ячейка ${cellNumber}`;
};

export const generateCountText = (count: number): string => {
  const forms = ['товар', 'товара', 'товаров'];
  let form: string;
  
  if (count % 10 === 1 && count % 100 !== 11) {
    form = forms[0];
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    form = forms[1];
  } else {
    form = forms[2];
  }
  
  return `${count} ${form}`;
};

export const PHRASE_TEXTS: Record<string, string> = {
  'delivery-cell-info': 'Информация о заказе',
  'delivery-check-product': 'Пожалуйста, проверьте товар под камерой',
  'delivery-thanks': 'Спасибо за заказ, оцените пункт выдачи',
  'payment-cod': 'Оплата при получении',
  'receiving-start': 'Начало приемки',
  'receiving-scan': 'Отсканируйте штрихкод',
  'receiving-next': 'Следующий товар',
  'receiving-complete': 'Приемка завершена',
  'return-start': 'Начало возврата',
  'return-scan-product': 'Отсканируйте товар для возврата',
  'return-confirm': 'Подтвердите возврат',
  'return-success': 'Возврат оформлен',
};
