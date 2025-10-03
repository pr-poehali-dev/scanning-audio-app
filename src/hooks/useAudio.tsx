import { useCallback, useRef, useState, useEffect } from 'react';
import { AudioSettings } from './useAppState';
import { audioStorage } from '@/utils/audioStorage';

interface UseAudioProps {
  audioSettings: AudioSettings;
}

const AUDIO_FILE_MAP: { [key: string]: string } = {
  'delivery-cell-info': '/audio/cell-info.mp3',
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

  // Загрузка файлов из IndexedDB при монтировании
  useEffect(() => {
    const loadAudioFiles = async () => {
      try {
        await audioStorage.init();
        const files = await audioStorage.getAllFiles();
        setUploadedFiles(files);
        console.log(`✅ Загружено ${Object.keys(files).length} аудиофайлов из IndexedDB`);
      } catch (error) {
        console.error('Ошибка загрузки аудиофайлов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAudioFiles();
  }, []);

  const playAudio = useCallback((phraseKey: string, cellNumber?: number) => {
    const isEnabled = audioSettings.enabled[phraseKey];
    if (!isEnabled) {
      console.log(`🔇 Озвучка "${phraseKey}" отключена`);
      return;
    }

    // Специальная обработка для delivery-cell-info с составной озвучкой
    if (phraseKey === 'delivery-cell-info' && cellNumber) {
      const cellAudioKey = `cell-${cellNumber}`;
      const cellAudio = uploadedFiles[cellAudioKey];
      const tovaryAudio = uploadedFiles['word-tovary'];
      const paymentAudio = uploadedFiles['payment-cod'];

      // Если есть файлы для составной озвучки
      if (cellAudio || tovaryAudio || paymentAudio) {
        playSequentialAudio([cellAudio, tovaryAudio, paymentAudio].filter(Boolean));
        return;
      }
    }

    // Проверяем сначала загруженный пользователем файл
    let audioUrl = uploadedFiles[phraseKey];
    
    // Если нет загруженного файла, используем файл из /public/audio
    if (!audioUrl) {
      audioUrl = AUDIO_FILE_MAP[phraseKey];
    }
    
    if (!audioUrl) {
      console.warn(`⚠️ Аудиофайл для "${phraseKey}" не найден`);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audio.playbackRate = audioSettings.speed;
    audioRef.current = audio;

    setIsPlaying(true);
    console.log(`🔊 Воспроизведение: "${phraseKey}" (${audioUrl})`);

    audio.play().catch(err => {
      console.error('Ошибка воспроизведения:', err);
      setIsPlaying(false);
    });

    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      console.error('Ошибка загрузки аудио');
      setIsPlaying(false);
      audioRef.current = null;
    };
  }, [audioSettings, uploadedFiles]);

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