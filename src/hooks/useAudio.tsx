import { useCallback, useRef, useState, useEffect } from 'react';
import { AudioSettings } from './useAppState';
import { audioStorage } from '@/utils/audioStorage';
import { speakText, generateCellText, generateCountText, PHRASE_TEXTS } from '@/utils/textToSpeech';

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
        console.log('🚀 === ИНИЦИАЛИЗАЦИЯ АУДИО СИСТЕМЫ ===');
        await audioStorage.init();
        
        // Диагностика для отладки
        await audioStorage.diagnose();
        
        const files = await audioStorage.getAllFiles();
        setUploadedFiles(files);
        
        if (Object.keys(files).length > 0) {
          console.log(`✅ Загружено ${Object.keys(files).length} аудиофайлов из IndexedDB`);
          console.log('📋 Список загруженных файлов:', Object.keys(files));
        } else {
          console.log('⚠️ IndexedDB пуста. Загрузите аудиофайлы в настройках озвучки.');
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки аудиофайлов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAudioFiles();
  }, []);

  const playAudio = useCallback((phraseKey: string, cellNumber?: number, itemCount?: number) => {
    console.log(`🎯 Запрос на озвучку: "${phraseKey}"${cellNumber ? ` (ячейка: ${cellNumber}, товаров: ${itemCount})` : ''}`);
    
    const isEnabled = audioSettings.enabled[phraseKey];
    if (!isEnabled) {
      console.log(`🔇 Озвучка "${phraseKey}" отключена в настройках`);
      return;
    }

    // Специальная обработка для delivery-cell-info с составной озвучкой
    if (phraseKey === 'delivery-cell-info' && cellNumber !== undefined) {
      const audioSequence: string[] = [];
      
      // 1. Файл номера ячейки: cell-123.mp3
      const cellAudioKey = `cell-${cellNumber}`;
      const cellAudio = uploadedFiles[cellAudioKey];
      
      // 2. Файл количества товаров: count-2.mp3
      const countAudioKey = itemCount ? `count-${itemCount}` : undefined;
      const countAudio = countAudioKey ? uploadedFiles[countAudioKey] : undefined;
      
      // 3. Файл "оплата при получении": payment-cod.mp3
      const paymentAudio = uploadedFiles['payment-cod'];

      console.log(`📦 Проверка составной озвучки:`, {
        cellNumber,
        cellAudio: cellAudioKey + ' → ' + (cellAudio ? 'ЕСТЬ' : 'НЕТ'),
        itemCount,
        countAudio: countAudioKey + ' → ' + (countAudio ? 'ЕСТЬ' : 'НЕТ'),
        paymentAudio: 'payment-cod → ' + (paymentAudio ? 'ЕСТЬ' : 'НЕТ')
      });

      // Собираем последовательность из загруженных файлов
      if (cellAudio) audioSequence.push(cellAudio);
      if (countAudio) audioSequence.push(countAudio);
      if (paymentAudio) audioSequence.push(paymentAudio);

      // Если есть хотя бы один файл - играем последовательность
      if (audioSequence.length > 0) {
        console.log(`🔊 Воспроизведение составной озвучки (${audioSequence.length} файлов)`);
        playSequentialAudio(audioSequence);
        return;
      } else {
        // ФОЛБЕК: используем синтез речи
        console.warn('⚠️ Файлы не загружены, используем синтез речи (TTS)');
        const texts: string[] = [];
        
        if (cellNumber) texts.push(generateCellText(cellNumber));
        if (itemCount) texts.push(generateCountText(itemCount));
        texts.push('Оплата при получении');
        
        playTextSequence(texts);
        return;
      }
    }

    // Проверяем сначала загруженный пользователем файл
    let audioUrl = uploadedFiles[phraseKey];
    
    console.log(`📂 Загруженные файлы:`, Object.keys(uploadedFiles));
    console.log(`🔍 Поиск файла "${phraseKey}":`, audioUrl ? 'НАЙДЕН' : 'НЕ НАЙДЕН');
    
    // Если нет загруженного файла, пытаемся использовать файл из /public/audio
    if (!audioUrl) {
      const publicAudioPath = AUDIO_FILE_MAP[phraseKey];
      if (publicAudioPath) {
        console.log(`📁 Попытка использовать файл из /public/audio: ${publicAudioPath}`);
        audioUrl = publicAudioPath;
      }
    }
    
    if (!audioUrl) {
      // ФОЛБЕК: используем синтез речи
      const text = PHRASE_TEXTS[phraseKey];
      if (text) {
        console.warn(`⚠️ Файл не загружен, используем синтез речи для "${phraseKey}"`);
        playTextSequence([text]);
        return;
      } else {
        console.warn(`⚠️ Аудиофайл для "${phraseKey}" не загружен и нет текста для TTS`);
        return;
      }
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audio.playbackRate = audioSettings.speed;
    audioRef.current = audio;

    setIsPlaying(true);
    console.log(`🔊 ВОСПРОИЗВЕДЕНИЕ: "${phraseKey}" (URL: ${audioUrl.substring(0, 50)}...)`);

    audio.play().catch(err => {
      console.error(`❌ Ошибка воспроизведения "${phraseKey}":`, err);
      setIsPlaying(false);
    });

    audio.onended = () => {
      console.log(`✅ Озвучка "${phraseKey}" завершена`);
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.onerror = (e) => {
      console.error(`❌ Ошибка загрузки аудио "${phraseKey}":`, e);
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

  const playTextSequence = useCallback(async (texts: string[]) => {
    if (texts.length === 0) return;

    setIsPlaying(true);
    console.log(`🗣️ Синтез речи: ${texts.length} фраз`);

    for (const text of texts) {
      try {
        await speakText(text, audioSettings.speed);
      } catch (err) {
        console.error(`Ошибка TTS для "${text}":`, err);
      }
    }

    setIsPlaying(false);
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