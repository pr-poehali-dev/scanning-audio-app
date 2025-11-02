import { useCallback, useRef, useState, useEffect } from 'react';
import { AudioSettings } from './useAppState';
import { AUDIO_FILE_MAP, getKeyMapping } from './audio/audioConstants';
import { loadAudioFiles } from './audio/audioLoader';
import { createSequentialAudioPlayer, initAudioContext } from './audio/audioPlayer';
import {
  buildDeliveryCellInfoSequence,
  buildThanksSequence,
  buildQuantitySequence,
  buildReceptionSequence
} from './audio/audioSequenceBuilder';

interface UseAudioProps {
  audioSettings: AudioSettings;
}

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
    
    loadAudioFiles(
      audioSettings.variant || 'v1',
      setUploadedFiles,
      uploadedFilesRef,
      setIsLoading,
      isMounted
    );
    
    const initContext = () => initAudioContext(audioContextInitialized);
    
    document.addEventListener('touchstart', initContext, { once: true });
    document.addEventListener('click', initContext, { once: true });
    
    return () => {
      document.removeEventListener('touchstart', initContext);
      document.removeEventListener('click', initContext);
      isMounted = false;
    };
  }, [audioSettings.variant]);

  const playSequentialAudio = createSequentialAudioPlayer(audioRef, setIsPlaying, audioSettings.speed);

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
    
    if (isPlaying) {
      console.log('⚠️ ОЗВУЧКА УЖЕ ИГРАЕТ, пропускаю запрос:', phraseKey);
      return;
    }
    
    const isEnabled = audioSettings.enabled[phraseKey];
    if (!isEnabled) {
      console.log('❌ ОЗВУЧКА ОТКЛЮЧЕНА В НАСТРОЙКАХ');
      return;
    }

    const keyMapping = getKeyMapping(variant);

    if (phraseKey === 'delivery-thanks') {
      const audioSequence = buildThanksSequence(currentFiles, variant);
      
      if (audioSequence.length > 0) {
        console.log(`🎵 Озвучка благодарности (${variant}):`, audioSequence.length, 'файлов');
        playSequentialAudio(audioSequence);
        return;
      }
      
      console.log('⚠️ Нет файлов для благодарности');
      return;
    }
    
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

    if (phraseKey === 'quantity-announcement' && cellNumber !== undefined) {
      const quantity = cellNumber;
      const audioSequence = buildQuantitySequence(currentFiles, quantity);
      
      if (audioSequence.length > 0) {
        console.log(`🎵 Озвучка количества товаров: ${quantity}`);
        playSequentialAudio(audioSequence);
        return;
      }
      
      console.log(`⚠️ Нет файлов для озвучки количества ${quantity}`);
      return;
    }

    if (phraseKey === 'delivery-cell-info' && cellNumber !== undefined) {
      console.log('📂 ВСЕ загруженные файлы:', Object.keys(currentFiles));
      console.log('🎵 Вариант озвучки:', variant);
      
      const audioSequence = buildDeliveryCellInfoSequence(
        currentFiles,
        variant,
        cellNumber,
        itemCount
      );

      if (audioSequence.length > 0) {
        playSequentialAudio(audioSequence);
        return;
      }
      
      console.log('⚠️ Нет файлов для составной озвучки');
      return;
    }

    if (phraseKey === 'receiving-complete' && cellNumber !== undefined) {
      const audioSequence = buildReceptionSequence(currentFiles, variant, cellNumber);
      
      if (audioSequence.length > 0) {
        console.log(`🎵 Озвучка приемки ячейки ${cellNumber}`);
        playSequentialAudio(audioSequence);
        return;
      }
      
      console.log('⚠️ Нет файлов для озвучки приемки');
      return;
    }

    const mappedKey = keyMapping[phraseKey] || phraseKey;
    
    let audioUrl = currentFiles[mappedKey];
    
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

    audio.onloadeddata = () => {
      console.log('✅ Аудио данные загружены');
    };

    audio.onended = () => {
      console.log('✅ ОЗВУЧКА ЗАВЕРШЕНА');
      setIsPlaying(false);
    };

    audio.onerror = (e) => {
      console.error('❌ ОШИБКА ВОСПРОИЗВЕДЕНИЯ:', e);
      setIsPlaying(false);
    };

    audio.play().then(() => {
      console.log('▶️ Воспроизведение началось');
    }).catch((error) => {
      console.error('❌ Не удалось начать воспроизведение:', error);
      setIsPlaying(false);
    });

  }, [audioSettings, isPlaying, playSequentialAudio]);

  return {
    playAudio,
    isPlaying,
    uploadedFiles,
    setUploadedFiles,
    isLoading
  };
};
