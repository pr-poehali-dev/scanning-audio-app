// Прямое тестирование озвучки без сложных систем

export const testDirectAudio = async (): Promise<string> => {
  const results: string[] = [];
  
  try {
    results.push('🔍 ДИАГНОСТИКА ОЗВУЧКИ');
    results.push('='.repeat(30));
    
    // 1. Проверяем localStorage
    const keys = Object.keys(localStorage);
    const audioKeys = keys.filter(key => 
      key.includes('audio') || 
      key.includes('voice') || 
      key.includes('wb-')
    );
    
    results.push(`📦 Найдено ключей с аудио: ${audioKeys.length}`);
    audioKeys.forEach(key => {
      const data = localStorage.getItem(key);
      results.push(`  - ${key}: ${data ? Math.floor(data.length / 1024) + 'KB' : 'null'}`);
    });
    
    // 2. Проверяем активный вариант
    const activeVariant = localStorage.getItem('wb-active-voice-variant');
    results.push(`🎵 Активный вариант: ${activeVariant || 'НЕ УСТАНОВЛЕН'}`);
    
    // 3. Проверяем конкретные варианты
    const variant1 = localStorage.getItem('wb-voice-variant1-permanent');
    const variant2 = localStorage.getItem('wb-voice-variant2-permanent');
    
    results.push(`📂 Вариант 1: ${variant1 ? 'ЗАГРУЖЕН (' + Math.floor(variant1.length / 1024) + 'KB)' : 'НЕ ЗАГРУЖЕН'}`);
    results.push(`📂 Вариант 2: ${variant2 ? 'ЗАГРУЖЕН (' + Math.floor(variant2.length / 1024) + 'KB)' : 'НЕ ЗАГРУЖЕН'}`);
    
    // 4. Если есть вариант - попробуем его распарсить
    if (variant1) {
      try {
        const parsed = JSON.parse(variant1);
        const keys = Object.keys(parsed);
        results.push(`🔧 Вариант 1 содержит: ${keys.length} файлов`);
        
        // Проверяем первые несколько файлов
        const testKeys = ['1', '2', '100', 'товары со скидкой'];
        testKeys.forEach(key => {
          if (parsed[key]) {
            const isValidAudio = parsed[key].startsWith('data:audio/');
            results.push(`  ✓ "${key}": ${isValidAudio ? 'ВАЛИДНЫЙ АУДИО' : 'НЕВАЛИДНЫЙ'}`);
          } else {
            results.push(`  ✗ "${key}": НЕ НАЙДЕН`);
          }
        });
        
        // Пробуем воспроизвести
        const testAudio = parsed['1'];
        if (testAudio && testAudio.startsWith('data:audio/')) {
          results.push('🔊 ТЕСТИРУЕМ ВОСПРОИЗВЕДЕНИЕ...');
          
          try {
            const audio = new Audio();
            audio.src = testAudio;
            audio.volume = 0.5;
            
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Таймаут воспроизведения'));
              }, 3000);

              audio.addEventListener('ended', () => {
                clearTimeout(timeout);
                resolve();
              });

              audio.addEventListener('error', (error) => {
                clearTimeout(timeout);
                reject(error);
              });

              audio.play().catch(reject);
            });
            
            results.push('🎉 ВОСПРОИЗВЕДЕНИЕ УСПЕШНО!');
            return results.join('\n');
            
          } catch (playError) {
            results.push(`❌ ОШИБКА ВОСПРОИЗВЕДЕНИЯ: ${playError}`);
          }
        } else {
          results.push('❌ НЕТ ВАЛИДНОГО АУДИО ДЛЯ ТЕСТА');
        }
        
      } catch (parseError) {
        results.push(`❌ ОШИБКА ПАРСИНГА ВАРИАНТА 1: ${parseError}`);
      }
    }
    
    return results.join('\n');
    
  } catch (error) {
    results.push(`❌ КРИТИЧЕСКАЯ ОШИБКА: ${error}`);
    return results.join('\n');
  }
};

// Принудительная активация озвучки
export const forceActivateAudio = async (): Promise<boolean> => {
  try {
    console.log('🔄 ПРИНУДИТЕЛЬНАЯ АКТИВАЦИЯ ОЗВУЧКИ...');
    
    // Проверяем есть ли загруженные варианты
    const variant1 = localStorage.getItem('wb-voice-variant1-permanent');
    const variant2 = localStorage.getItem('wb-voice-variant2-permanent');
    
    if (!variant1 && !variant2) {
      console.log('❌ НЕТ ЗАГРУЖЕННЫХ ВАРИАНТОВ');
      return false;
    }
    
    // Берем первый доступный вариант
    const variantData = variant1 || variant2;
    const variantKey = variant1 ? 'variant1' : 'variant2';
    
    // Устанавливаем активный вариант
    localStorage.setItem('wb-active-voice-variant', variantKey);
    
    // Загружаем в bulletproof систему
    const { activateVoiceVariant } = await import('@/utils/bulletproofAudio');
    const success = activateVoiceVariant(variantKey);
    
    console.log(`🎵 Активация ${variantKey}: ${success}`);
    
    return success;
    
  } catch (error) {
    console.error('❌ Ошибка принудительной активации:', error);
    return false;
  }
};