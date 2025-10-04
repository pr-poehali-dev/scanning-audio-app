import { useCallback, useRef, useState, useEffect } from 'react';
import { AudioSettings } from './useAppState';
import { audioStorage } from '@/utils/audioStorage';

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

  useEffect(() => {
    uploadedFilesRef.current = uploadedFiles;
  }, [uploadedFiles]);

  useEffect(() => {
    const loadAudioFiles = async () => {
      const files = await audioStorage.getAllFiles();
      console.log('📦 Загружено файлов:', Object.keys(files).length);
      console.log('📋 Список файлов:', Object.keys(files));
      setUploadedFiles(files);
      uploadedFilesRef.current = files;
      setIsLoading(false);
    };

    loadAudioFiles();
  }, []);

  const playAudio = useCallback((phraseKey: string, cellNumber?: number, itemCount?: number) => {
    const currentFiles = uploadedFilesRef.current;
    console.log('🎵 ========== ЗАПРОС ОЗВУЧКИ ==========');
    console.log('▶️ Ключ:', phraseKey);
    console.log('📦 Всего файлов:', Object.keys(currentFiles).length);
    console.log('📋 Доступные файлы:', Object.keys(currentFiles));
    console.log('⚙️ Настройка включена?', audioSettings.enabled[phraseKey]);
    
    const isEnabled = audioSettings.enabled[phraseKey];
    if (!isEnabled) {
      console.log('❌ ОЗВУЧКА ОТКЛЮЧЕНА В НАСТРОЙКАХ');
      return;
    }

    // Маппинг системных ключей на реальные названия файлов
    const keyMapping: { [key: string]: string } = {
      'delivery-cell-info': 'goods',
      'delivery-check-product': 'please_check_good_under_camera',
      'check-product-under-camera': 'please_check_good_under_camera',
      'delivery-thanks': 'thanks_for_order_rate_pickpoint',
      'payment-cod': 'payment_on_delivery'
    };

    // Специальная обработка для delivery-cell-info с составной озвучкой
    if (phraseKey === 'delivery-cell-info' && cellNumber !== undefined) {
      const audioSequence: string[] = [];
      
      // 1. Озвучка "товары"
      const goodsAudio = currentFiles['goods'];
      
      // 2. Озвучка количества (если передано)
      const countAudio = itemCount ? currentFiles[`count_${itemCount}`] : null;
      
      // 3. Оплата при получении
      const paymentAudio = currentFiles['payment_on_delivery'];

      // Собираем последовательность из загруженных файлов
      if (goodsAudio) audioSequence.push(goodsAudio);
      if (countAudio) audioSequence.push(countAudio);
      if (paymentAudio) audioSequence.push(paymentAudio);

      console.log('🎵 Составная озвучка:', {
        goods: !!goodsAudio,
        count: !!countAudio,
        payment: !!paymentAudio,
        total: audioSequence.length
      });

      // Если есть хотя бы один файл - играем последовательность
      if (audioSequence.length > 0) {
        playSequentialAudio(audioSequence);
        return;
      }
      console.log('❌ Нет файлов для составной озвучки');
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
      console.log('❌ Файл не найден. Проверьте названия:', mappedKey);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    console.log('🔊 СОЗДАЮ АУДИО ОБЪЕКТ');
    console.log('📏 Размер URL:', audioUrl.length, 'символов');
    
    const audio = new Audio(audioUrl);
    audio.playbackRate = audioSettings.speed;
    audioRef.current = audio;
    setIsPlaying(true);

    console.log('▶️ НАЧИНАЮ ВОСПРОИЗВЕДЕНИЕ...');
    audio.play()
      .then(() => {
        console.log('✅ ВОСПРОИЗВЕДЕНИЕ НАЧАЛОСЬ');
      })
      .catch((err) => {
        console.error('❌ ОШИБКА ВОСПРОИЗВЕДЕНИЯ:', err);
        console.error('Детали:', err.message, err.name);
        setIsPlaying(false);
      });

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

  const playSequentialAudio = useCallback((audioUrls: string[]) => {
    if (audioUrls.length === 0) return;

    let currentIndex = 0;
    setIsPlaying(true);

    const playNext = () => {
      if (currentIndex >= audioUrls.length) {
        setIsPlaying(false);
        audioRef.current = null;
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUrls[currentIndex]);
      audio.playbackRate = audioSettings.speed;
      audioRef.current = audio;

      console.log(`🔊 Воспроизведение части ${currentIndex + 1}/${audioUrls.length}`);

      audio.play().catch(err => {
        console.error('Ошибка воспроизведения:', err);
        currentIndex++;
        playNext();
      });

      audio.onended = () => {
        currentIndex++;
        playNext();
      };

      audio.onerror = () => {
        console.error('Ошибка загрузки аудио');
        currentIndex++;
        playNext();
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