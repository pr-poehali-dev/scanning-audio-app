import { MutableRefObject } from 'react';

export const createSequentialAudioPlayer = (
  audioRef: MutableRefObject<HTMLAudioElement | null>,
  setIsPlaying: (value: boolean) => void,
  audioSpeed: number
) => {
  return (audioUrls: string[]) => {
    if (audioUrls.length === 0) {
      console.log('⚠️ Нет файлов для воспроизведения');
      return;
    }

    console.log(`🎵 НАЧИНАЮ ПОСЛЕДОВАТЕЛЬНОЕ ВОСПРОИЗВЕДЕНИЕ: ${audioUrls.length} файлов`);
    setIsPlaying(true);

    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex >= audioUrls.length) {
        console.log('✅ ВСЕ ФАЙЛЫ ВОСПРОИЗВЕДЕНЫ');
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current = null;
        }
        return;
      }

      const audioUrl = audioUrls[currentIndex];
      console.log(`🔊 ПРОИГРЫВАЮ ФАЙЛ ${currentIndex + 1}/${audioUrls.length}`);
      console.log('📏 Размер URL:', audioUrl.length, 'символов');

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = 1.0;
      audio.src = audioUrl;
      audio.playbackRate = audioSpeed;
      audioRef.current = audio;

      audio.onloadeddata = () => {
        console.log('✅ Аудио данные загружены');
      };

      audio.onended = () => {
        console.log('✅ ФАЙЛ ЗАВЕРШЕН');
        currentIndex++;
        playNext();
      };

      audio.onerror = (e) => {
        console.error('❌ ОШИБКА ВОСПРОИЗВЕДЕНИЯ:', e);
        currentIndex++;
        playNext();
      };

      audio.play().then(() => {
        console.log('▶️ Воспроизведение началось');
      }).catch((error) => {
        console.error('❌ Не удалось начать воспроизведение:', error);
        currentIndex++;
        playNext();
      });
    };

    playNext();
  };
};

export const initAudioContext = (audioContextInitialized: MutableRefObject<boolean>) => {
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
