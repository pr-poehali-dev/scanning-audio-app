import { useCallback, useRef, useState, useEffect } from 'react';
import { AudioSettings } from './useAppState';

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

  useEffect(() => {
    const savedFiles = localStorage.getItem('wb-pvz-audio-files');
    if (savedFiles) {
      try {
        setUploadedFiles(JSON.parse(savedFiles));
      } catch (e) {
        console.warn('Ошибка загрузки аудиофайлов:', e);
      }
    }
  }, []);

  const playAudio = useCallback((phraseKey: string) => {
    const isEnabled = audioSettings.enabled[phraseKey];
    if (!isEnabled) {
      console.log(`🔇 Озвучка "${phraseKey}" отключена`);
      return;
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