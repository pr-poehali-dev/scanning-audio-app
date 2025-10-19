import { useCallback, useRef, useState, useEffect } from 'react';
import { AudioSettings } from './useAppState';
import { audioStorage } from '@/utils/audioStorage';
import { cloudAudioStorage } from '@/utils/cloudAudioStorage';
import { defaultAudioGenerator } from '@/utils/defaultAudioGenerator';

interface UseAudioProps {
  audioSettings: AudioSettings;
}

const AUDIO_FILE_MAP: { [key: string]: string } = {
  'delivery-cell-info': '/audio/cell-info.mp3',
  'delivery-scan-items': '/audio/scan-items.mp3',
  'delivery-check-product': '/audio/check-product.mp3',
  'delivery-thanks': '/audio/thanks.mp3',
  'receiving-start': '/audio/receiving-start.mp3',
  'receiving-scan': '/audio/receiving-scan.mp3',
  'receiving-next': '/audio/receiving-next.mp3',
  'receiving-complete': '/audio/receiving-complete.mp3',
  'return-start': '/audio/return-start.mp3',
  'return-scan-product': '/audio/return-scan.mp3',
  'return-confirm': '/audio/return-confirm.mp3',
  'return-success': '/audio/return-success.mp3',
};

export const useAudio = ({ audioSettings }: UseAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const uploadedFilesRef = useRef<{ [key: string]: string }>({});
  const audioContextInitialized = useRef(false);

  useEffect(() => {
    uploadedFilesRef.current = uploadedFiles;
  }, [uploadedFiles]);

  useEffect(() => {
    let isMounted = true;
    
    const loadAudioFiles = async () => {
      try {
        console.log('🔄 Начинаю загрузку аудиофайлов...');
        
        // Сначала пробуем загрузить из облака
        try {
          const cloudFiles = await cloudAudioStorage.getAllFiles();
          console.log('☁️ Файлов в облаке:', Object.keys(cloudFiles).length);
          console.log('☁️ Ключи облачных файлов:', Object.keys(cloudFiles));
          
          if (!isMounted) return;
          
          if (Object.keys(cloudFiles).length > 0) {
            console.log('✅ Загружено из облака:', Object.keys(cloudFiles).length);
            const files = { ...cloudFiles };
            setUploadedFiles(files);
            uploadedFilesRef.current = files;
            if (isMounted) setIsLoading(false);
            return;
          }
        } catch (cloudError) {
          console.warn('⚠️ Не удалось загрузить из облака, загружаю локально:', cloudError);
        }
        
        // Загружаем из локального хранилища
        console.log('📂 Проверяю локальное хранилище...');
        const files = await audioStorage.getAllFiles();
        console.log('📦 Загружено локально:', Object.keys(files).length);
        console.log('📋 Список файлов:', Object.keys(files));
        
        if (!isMounted) return;
        
        const localFiles = { ...files };
        setUploadedFiles(localFiles);
        uploadedFilesRef.current = localFiles;
      } catch (error) {
        console.error('❌ Критическая ошибка загрузки:', error);
        if (!isMounted) return;
        setUploadedFiles({});
        uploadedFilesRef.current = {};
      }
      
      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadAudioFiles();
    
    // Инициализация аудио-контекста для мобильных браузеров
    const initAudioContext = () => {
      if (!audioContextInitialized.current) {
        console.log('🎵 Инициализация аудио-контекста для мобильного');
        const tempAudio = new Audio();
        tempAudio.volume = 0.01;
        tempAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4SRUbpxAAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEDwPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
        tempAudio.play().then(() => {
          console.log('✅ Аудио-контекст инициализирован');
          audioContextInitialized.current = true;
        }).catch((err) => {
          console.log('⚠️ Не удалось инициализировать аудио-контекст (требуется взаимодействие пользователя):', err);
        });
      }
    };
    
    // Инициализируем при первом взаимодействии
    document.addEventListener('touchstart', initAudioContext, { once: true });
    document.addEventListener('click', initAudioContext, { once: true });
    
    return () => {
      document.removeEventListener('touchstart', initAudioContext);
      document.removeEventListener('click', initAudioContext);
      isMounted = false;
    };
  }, []);

  const playAudio = useCallback((phraseKey: string, cellNumber?: number, itemCount?: number) => {
    const currentFiles = uploadedFilesRef.current;
    const variant = audioSettings.variant || 'v1';
    console.log('🎵 ========== ЗАПРОС ОЗВУЧКИ ==========');
    console.log('▶️ Ключ:', phraseKey);
    console.log('🎛️ ВАРИАНТ ОЗВУЧКИ:', variant, '(из audioSettings.variant:', audioSettings.variant, ')');
    console.log('📦 Всего файлов:', Object.keys(currentFiles).length);
    console.log('📋 Доступные файлы V1:', Object.keys(currentFiles).filter(k => k.includes('_v1_') || k === 'goods' || k === 'payment_on_delivery').length);
    console.log('📋 Доступные файлы V2:', Object.keys(currentFiles).filter(k => k.includes('_v2_') || k === 'checkWBWallet' || k === 'scanAfterQrClient').length);
    console.log('⚙️ Настройка включена?', audioSettings.enabled[phraseKey]);
    console.log('🔊 Аудио-контекст инициализирован?', audioContextInitialized.current);
    
    // Специальная обработка для последовательного воспроизведения
    if (phraseKey === 'delivery-complete-sequence') {
      const successAudio = currentFiles['success_sound'];
      const thanksAudio = currentFiles['thanks_for_order_rate_pickpoint'];
      const sequence: string[] = [];
      
      console.log('🔍 Поиск файлов для последовательности:');
      console.log('  success_sound:', successAudio ? 'НАЙДЕН' : 'НЕ НАЙДЕН');
      console.log('  thanks_for_order_rate_pickpoint:', thanksAudio ? 'НАЙДЕН' : 'НЕ НАЙДЕН');
      console.log('  Все файлы:', Object.keys(currentFiles));
      
      if (successAudio) sequence.push(successAudio);
      if (thanksAudio) sequence.push(thanksAudio);
      
      if (sequence.length > 0) {
        console.log('✅ Запускаю последовательность из', sequence.length, 'звуков');
        playSequentialAudio(sequence, 500);
      } else {
        console.log('⚠️ Нет файлов для воспроизведения');
      }
      return;
    }
    
    const isEnabled = audioSettings.enabled[phraseKey];
    if (!isEnabled) {
      console.log('❌ ОЗВУЧКА ОТКЛЮЧЕНА В НАСТРОЙКАХ');
      return;
    }

    // Маппинг системных ключей на реальные названия файлов
    const keyMapping: { [key: string]: string } = {
      'delivery-cell-info': variant === 'v1' ? 'goods' : 'checkWBWallet',
      'delivery-check-product': 'please_check_good_under_camera',
      'check-product-under-camera': 'please_check_good_under_camera',
      'delivery-thanks': variant === 'v1' ? 'thanks_for_order_rate_pickpoint' : 'askRatePickPoint',
      'payment_on_delivery': variant === 'v1' ? 'payment_on_delivery' : 'scanAfterQrClient',
      'box_accepted': 'box_accepted',
      'success_sound': 'success_sound'
    };

    // Специальная обработка для delivery-thanks (благодарность после выдачи)
    if (phraseKey === 'delivery-thanks') {
      const audioSequence: string[] = [];
      
      if (variant === 'v1') {
        // V1: success_sound + thanks_for_order_rate_pickpoint
        const successSound = currentFiles['success_sound'];
        const thanksAudio = currentFiles['thanks_for_order_rate_pickpoint'];
        
        if (successSound) audioSequence.push(successSound);
        if (thanksAudio) audioSequence.push(thanksAudio);
      } else {
        // V2: только askRatePickPoint
        const askRate = currentFiles['askRatePickPoint'];
        if (askRate) audioSequence.push(askRate);
      }
      
      if (audioSequence.length > 0) {
        console.log(`🎵 Озвучка благодарности (${variant}):`, audioSequence.length, 'файлов');
        playSequentialAudio(audioSequence);
        return;
      }
      
      console.log('⚠️ Нет файлов для благодарности');
      return;
    }
    
    // Специальная обработка для озвучки только номера ячейки
    if (phraseKey === 'cell-number' && cellNumber !== undefined) {
      const cellKey = `cell_${variant}_${cellNumber}`;
      const cellAudio = currentFiles[cellKey];
      
      if (cellAudio) {
        console.log(`🎵 Озвучка ячейки ${cellNumber} (вариант ${variant})`);
        playSequentialAudio([cellAudio]);
        return;
      }
      
      console.log(`⚠️ Нет файла для ячейки ${cellNumber} (${cellKey})`);
      return;
    }

    // Специальная обработка для delivery-cell-info с составной озвучкой
    if (phraseKey === 'delivery-cell-info' && cellNumber !== undefined) {
      console.log('📂 ВСЕ загруженные файлы:', Object.keys(currentFiles));
      console.log('🎵 Вариант озвучки:', variant);
      
      const audioSequence: string[] = [];
      
      // 1. Озвучка номера ячейки (с префиксом варианта)
      const cellKey = `cell_${variant}_${cellNumber}`;
      const cellAudio = currentFiles[cellKey];
      
      // 2. Озвучка "товары" или "checkWBWallet"
      const goodsKey = variant === 'v1' ? 'goods' : 'checkWBWallet';
      const goodsAudio = currentFiles[goodsKey];
      
      // 3. Озвучка "оплата при получении" или "scanAfterQrClient"
      const paymentKey = variant === 'v1' ? 'payment_on_delivery' : 'scanAfterQrClient';
      const paymentAudio = currentFiles[paymentKey];

      // Собираем последовательность
      if (cellAudio) audioSequence.push(cellAudio);
      if (goodsAudio) audioSequence.push(goodsAudio);
      if (paymentAudio) audioSequence.push(paymentAudio);

      console.log('🎵 Составная озвучка:', {
        variant,
        cellKey,
        cell: !!cellAudio,
        goodsKey,
        goods: !!goodsAudio,
        paymentKey,
        payment: !!paymentAudio,
        total: audioSequence.length
      });

      // Если есть хотя бы один файл - играем последовательность
      if (audioSequence.length > 0) {
        playSequentialAudio(audioSequence);
        return;
      }
      
      console.log('⚠️ Нет файлов для составной озвучки');
      return;
    }

    // Преобразуем системный ключ в реальное название файла
    const mappedKey = keyMapping[phraseKey] || phraseKey;
    
    // Проверяем сначала загруженный пользователем файл
    let audioUrl = currentFiles[mappedKey];
    
    // Если нет загруженного файла, пытаемся использовать файл из /public/audio
    if (!audioUrl) {
      audioUrl = AUDIO_FILE_MAP[phraseKey];
    }
    
    console.log('🎵 Ищем:', phraseKey, '→', mappedKey, '→', audioUrl ? 'НАЙДЕН' : 'НЕ НАЙДЕН');
    
    if (!audioUrl) {
      console.log('⚠️ Файл не найден');
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    console.log('🔊 СОЗДАЮ АУДИО ОБЪЕКТ');
    console.log('📏 Размер URL:', audioUrl.length, 'символов');
    
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 1.0;
    audio.src = audioUrl;
    audio.playbackRate = audioSettings.speed;
    audioRef.current = audio;
    setIsPlaying(true);

    console.log('▶️ НАЧИНАЮ ВОСПРОИЗВЕДЕНИЕ...');
    
    // Для мобильных устройств - дополнительная обработка
    const playWithRetry = async (retries = 5) => {
      for (let i = 0; i < retries; i++) {
        try {
          console.log(`🔄 Попытка воспроизведения ${i + 1}/${retries}`);
          
          // Загружаем аудио перед воспроизведением
          await audio.load();
          console.log('✅ Аудио загружено, начинаю play()');
          
          await audio.play();
          console.log('✅ ВОСПРОИЗВЕДЕНИЕ НАЧАЛОСЬ (попытка', i + 1, ')');
          return;
        } catch (err: any) {
          console.warn(`⚠️ Попытка ${i + 1} не удалась:`, err.message);
          console.warn('Тип ошибки:', err.name);
          console.warn('Код ошибки:', err.code);
          
          if (i === retries - 1) {
            console.error('❌ ОШИБКА ВОСПРОИЗВЕДЕНИЯ после всех попыток:', err);
            console.error('Детали:', err.message, err.name);
            setIsPlaying(false);
          } else {
            // Увеличенная задержка между попытками
            await new Promise(resolve => setTimeout(resolve, 200 * (i + 1)));
          }
        }
      }
    };
    
    playWithRetry();

    audio.onended = () => {
      console.log('✅ ВОСПРОИЗВЕДЕНИЕ ЗАВЕРШЕНО');
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.onerror = (e) => {
      console.error(`❌ ОШИБКА ЗАГРУЗКИ АУДИО "${phraseKey}":`, e);
      console.error('Audio error event:', audio.error);
      setIsPlaying(false);
      audioRef.current = null;
    };
  }, [audioSettings]);

  const playSequentialAudio = useCallback((audioUrls: string[], delayMs: number = 500) => {
    if (audioUrls.length === 0) return;

    console.log('🎬 НАЧАЛО ПОСЛЕДОВАТЕЛЬНОСТИ:', audioUrls);
    let currentIndex = 0;
    setIsPlaying(true);

    const playNext = () => {
      if (currentIndex >= audioUrls.length) {
        console.log('🏁 ПОСЛЕДОВАТЕЛЬНОСТЬ ЗАВЕРШЕНА');
        setIsPlaying(false);
        audioRef.current = null;
        return;
      }

      // Останавливаем предыдущий звук если он есть
      if (audioRef.current) {
        console.log('⏹️ Останавливаю предыдущий звук');
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = 1.0;
      audio.src = audioUrls[currentIndex];
      audio.playbackRate = audioSettings.speed;
      audioRef.current = audio;

      console.log(`🔊 Часть ${currentIndex + 1}/${audioUrls.length}:`, audioUrls[currentIndex]);
      console.log(`⏱️ Скорость: ${audioSettings.speed}x`);

      const playWithRetry = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            await audio.load();
            await audio.play();
            console.log(`▶️ Часть ${currentIndex + 1} ИГРАЕТ`);
            return;
          } catch (err) {
            console.error(`❌ Попытка ${i + 1} не удалась:`, err);
            if (i === retries - 1) {
              console.error('❌ Ошибка воспроизведения части', currentIndex + 1);
              currentIndex++;
              setTimeout(() => playNext(), delayMs);
            } else {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
      };
      
      playWithRetry();

      audio.onended = () => {
        console.log(`✅ Часть ${currentIndex + 1} ЗАВЕРШЕНА, пауза ${delayMs}мс`);
        currentIndex++;
        setTimeout(() => playNext(), delayMs);
      };

      audio.onerror = () => {
        console.error('❌ Ошибка загрузки аудио части', currentIndex + 1);
        currentIndex++;
        setTimeout(() => playNext(), delayMs);
      };
    };

    playNext();
  }, [audioSettings]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    playAudio,
    stopAudio,
    isPlaying,
    uploadedFiles,
    setUploadedFiles
  };
};