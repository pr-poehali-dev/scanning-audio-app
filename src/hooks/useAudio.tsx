import { useCallback, useRef, useState, useEffect } from 'react';
import { AudioSettings } from './useAppState';

interface UseAudioProps {
  audioSettings: AudioSettings;
}

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
    if (!isEnabled) return;

    const audioUrl = uploadedFiles[phraseKey];
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audio.playbackRate = audioSettings.speed;
    audioRef.current = audio;

    setIsPlaying(true);

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