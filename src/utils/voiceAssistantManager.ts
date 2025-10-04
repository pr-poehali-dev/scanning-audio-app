/**
 * Менеджер голосовых помощников
 * Поддерживает два голосовых помощника: старый и новый
 * Новый помощник включает дополнительные звуки для интерактивности
 */

export interface VoiceAssistantConfig {
  id: 'old' | 'new';
  name: string;
  description: string;
  enabled: boolean;
}

export interface VoiceSound {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'cell' | 'interaction' | 'feedback';
}

// Конфигурация голосовых помощников
export const VOICE_ASSISTANTS: VoiceAssistantConfig[] = [
  {
    id: 'old',
    name: 'Классический помощник',
    description: 'Базовая озвучка только номеров ячеек',
    enabled: true
  },
  {
    id: 'new',
    name: 'Интерактивный помощник',
    description: 'Полная озвучка с дополнительными звуками для лучшего UX',
    enabled: true
  }
];

// Звуки для нового голосового помощника
export const NEW_VOICE_SOUNDS: VoiceSound[] = [
  // ВАРИАНТ 1: Стандартная озвучка
  {
    id: 'discount',
    name: '🛍️ Товары со скидкой',
    description: 'Вариант 1: "товары со скидкой проверьте вб кошелек"',
    category: 'system'
  },
  {
    id: 'check-product-camera',
    name: '📷 Проверьте товар под камерой',
    description: 'Вариант 1: "проверьте товар под камерой"',
    category: 'interaction'
  },
  {
    id: 'rate-pvz',
    name: '⭐ Оцените пункт выдачи',
    description: 'Вариант 1: "пожалуйста оцените наш пункт выдачи в приложении"',
    category: 'feedback'
  },
  
  // ВАРИАНТ 2: Альтернативная озвучка
  {
    id: 'error_sound',
    name: '❌ Звук ошибки',
    description: 'Вариант 2: error_sound при сканировании',
    category: 'system'
  },
  {
    id: 'goods',
    name: '🔢 Цифра товаров',
    description: 'Вариант 2: goods - количество товаров',
    category: 'interaction'
  },
  {
    id: 'payment_on_delivery',
    name: '💰 Оплата при получении',
    description: 'Вариант 2: payment_on_delivery',
    category: 'interaction'
  },
  {
    id: 'please_check_good_under_camera',
    name: '📷 Проверка товара',
    description: 'Вариант 2: please_check_good_under_camera',
    category: 'interaction'
  },
  {
    id: 'thanks_for_order_rate_pickpoint',
    name: '🙏 Спасибо за заказ',
    description: 'Вариант 2: thanks_for_order_rate_pickpoint',
    category: 'feedback'
  },
  
  // Общие звуки (ячейки)
  {
    id: 'cell_number',
    name: '🏠 Номер ячейки',
    description: 'Произношение номера ячейки (1.mp3, 2.mp3...)',
    category: 'cell'
  }
];

class VoiceAssistantManager {
  private currentAssistant: 'old' | 'new' = 'old';
  private readonly STORAGE_KEY = 'wb-voice-assistant-config';
  private readonly NEW_SOUNDS_KEY = 'wb-new-voice-sounds';

  constructor() {
    this.loadConfiguration();
  }

  /**
   * Загрузка конфигурации из localStorage
   */
  private loadConfiguration(): void {
    try {
      const config = localStorage.getItem(this.STORAGE_KEY);
      if (config) {
        const parsed = JSON.parse(config);
        this.currentAssistant = parsed.currentAssistant || 'old';
      }
    } catch (error) {
      console.warn('⚠️ Ошибка загрузки конфигурации голосового помощника:', error);
    }
  }

  /**
   * Сохранение конфигурации в localStorage
   */
  private saveConfiguration(): void {
    try {
      const config = {
        currentAssistant: this.currentAssistant,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('❌ Ошибка сохранения конфигурации голосового помощника:', error);
    }
  }

  /**
   * Получение текущего помощника
   */
  getCurrentAssistant(): 'old' | 'new' {
    return this.currentAssistant;
  }

  /**
   * Установка текущего помощника
   */
  setCurrentAssistant(assistantId: 'old' | 'new'): void {
    this.currentAssistant = assistantId;
    this.saveConfiguration();
    console.log(`🎤 Переключен голосовой помощник: ${assistantId}`);
  }

  /**
   * Получение информации о помощнике
   */
  getAssistantInfo(assistantId: 'old' | 'new'): VoiceAssistantConfig | undefined {
    return VOICE_ASSISTANTS.find(a => a.id === assistantId);
  }

  /**
   * Получение всех помощников
   */
  getAllAssistants(): VoiceAssistantConfig[] {
    return VOICE_ASSISTANTS;
  }

  /**
   * Воспроизведение звука ячейки (совместимость со старой системой)
   */
  async playCellAudio(cellNumber: string): Promise<boolean> {
    if (this.currentAssistant === 'old') {
      // Используем старую систему напрямую без цикла
      const { audioManager } = await import('./simpleAudioManager');
      return audioManager.playCellAudio(cellNumber);
    } else {
      // Используем новую систему с дополнительной логикой
      return this.playNewAssistantSound('cell_number', { cellNumber });
    }
  }

  /**
   * Воспроизведение звука нового помощника
   */
  async playNewAssistantSound(soundId: string, params?: any): Promise<boolean> {
    try {
      console.log(`🎤 [NEW ASSISTANT] Воспроизведение звука: ${soundId}`, params);

      // Для номера ячейки используем прямой доступ к старой системе без цикла
      if (soundId === 'cell_number' && params?.cellNumber) {
        const { audioManager } = await import('./simpleAudioManager');
        return audioManager.playCellAudio(params.cellNumber);
      }

      // Для других звуков проверяем наличие в хранилище
      const audioData = this.getNewSoundData(soundId);
      if (!audioData) {
        console.warn(`⚠️ [NEW ASSISTANT] Звук "${soundId}" не найден в новой системе`);
        
        // Пробуем найти в старой системе
        console.log(`🔍 Ищем "${soundId}" в старой системе...`);
        const oldAudioFiles = JSON.parse(localStorage.getItem('wb-audio-files') || '{}');
        
        // Для discount ищем в разных вариантах
        if (soundId === 'discount') {
          const possibleKeys = [
            'discount',
            'Товары со со скидкой проверьте ВБ кошелек',
            'delivery-Товары со со скидкой проверьте ВБ кошелек',
            'скидка',
            'кошелек',
            'check-discount-wallet'
          ];
          
          for (const key of possibleKeys) {
            if (oldAudioFiles[key]) {
              console.log(`✅ Найден "${soundId}" в старой системе как "${key}"`);
              const audio = new Audio(oldAudioFiles[key]);
              
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              const isAndroid = /Android/.test(navigator.userAgent);
              
              if (isIOS || isAndroid) {
                audio.load();
              }
              
              await new Promise((resolve, reject) => {
                audio.onended = () => resolve(true);
                audio.onerror = (e) => {
                  console.error('❌ Ошибка:', e);
                  reject(new Error('Ошибка воспроизведения'));
                };
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                  playPromise.catch(reject);
                }
              });
              return true;
            }
          }
        }
        
        return false;
      }

      // Воспроизводим звук
      const audio = new Audio(audioData);
      
      // Поддержка iOS/Android
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS || isAndroid) {
        audio.load();
      }
      
      await new Promise((resolve, reject) => {
        audio.onended = () => resolve(true);
        audio.onerror = (e) => {
          console.error('❌ Ошибка воспроизведения аудио:', e);
          reject(new Error('Ошибка воспроизведения'));
        };
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(reject);
        }
      });

      console.log(`✅ [NEW ASSISTANT] Звук "${soundId}" воспроизведен успешно`);
      return true;
    } catch (error) {
      console.error(`❌ [NEW ASSISTANT] Ошибка воспроизведения звука "${soundId}":`, error);
      return false;
    }
  }

  /**
   * Сохранение звука нового помощника
   */
  saveNewSound(soundId: string, file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      console.log(`💾 [MANAGER] Начинаем сохранение звука "${soundId}"`);
      console.log(`📋 [MANAGER] Файл: "${file.name}", размер: ${file.size} байт, тип: "${file.type}"`);
      
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const audioData = reader.result as string;
          console.log(`📊 [MANAGER] Данные прочитаны, размер: ${audioData.length} символов`);
          
          const sounds = this.getNewSoundsStorage();
          console.log(`📦 [MANAGER] Текущее хранилище:`, Object.keys(sounds));
          
          sounds[soundId] = {
            data: audioData,
            name: file.name,
            size: file.size,
            type: file.type,
            timestamp: Date.now()
          };
          
          const jsonString = JSON.stringify(sounds);
          console.log(`💽 [MANAGER] Сохраняем в localStorage под ключом "${this.NEW_SOUNDS_KEY}"`);
          console.log(`📊 [MANAGER] Размер JSON: ${jsonString.length} символов`);
          
          localStorage.setItem(this.NEW_SOUNDS_KEY, jsonString);
          
          // Проверяем, что сохранение прошло успешно
          const savedData = localStorage.getItem(this.NEW_SOUNDS_KEY);
          if (savedData) {
            const savedSounds = JSON.parse(savedData);
            if (savedSounds[soundId]) {
              console.log(`✅ [MANAGER] Звук "${soundId}" успешно сохранен и проверен`);
              resolve(true);
            } else {
              console.error(`❌ [MANAGER] Звук "${soundId}" не найден после сохранения`);
              reject(new Error('Звук не сохранился'));
            }
          } else {
            console.error(`❌ [MANAGER] Данные не найдены в localStorage после сохранения`);
            reject(new Error('Ошибка записи в localStorage'));
          }
        } catch (error) {
          console.error(`❌ [MANAGER] Ошибка сохранения звука "${soundId}":`, error);
          reject(error);
        }
      };

      reader.onerror = () => {
        console.error(`❌ [MANAGER] Ошибка чтения файла для звука "${soundId}"`);
        reject(new Error('Ошибка чтения файла'));
      };

      console.log(`📖 [MANAGER] Начинаем чтение файла как Data URL...`);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Получение данных звука
   */
  private getNewSoundData(soundId: string): string | null {
    try {
      const sounds = this.getNewSoundsStorage();
      return sounds[soundId]?.data || null;
    } catch (error) {
      console.error(`❌ Ошибка получения данных звука "${soundId}":`, error);
      return null;
    }
  }

  /**
   * Получение хранилища звуков
   */
  private getNewSoundsStorage(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.NEW_SOUNDS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.warn('⚠️ Ошибка загрузки хранилища звуков нового помощника:', error);
      return {};
    }
  }

  /**
   * Получение списка загруженных звуков
   */
  getLoadedSounds(): string[] {
    const sounds = this.getNewSoundsStorage();
    return Object.keys(sounds);
  }

  /**
   * Проверка наличия звука
   */
  hasSound(soundId: string): boolean {
    const sounds = this.getNewSoundsStorage();
    return !!sounds[soundId];
  }

  /**
   * Удаление звука
   */
  removeSound(soundId: string): boolean {
    try {
      const sounds = this.getNewSoundsStorage();
      if (sounds[soundId]) {
        delete sounds[soundId];
        localStorage.setItem(this.NEW_SOUNDS_KEY, JSON.stringify(sounds));
        console.log(`🗑️ Звук "${soundId}" удален`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Ошибка удаления звука "${soundId}":`, error);
      return false;
    }
  }

  /**
   * Очистка всех звуков нового помощника
   */
  clearAllNewSounds(): void {
    try {
      localStorage.removeItem(this.NEW_SOUNDS_KEY);
      console.log('🗑️ Все звуки нового помощника удалены');
    } catch (error) {
      console.error('❌ Ошибка очистки звуков нового помощника:', error);
    }
  }

  /**
   * Получение информации о хранилище
   */
  getStorageInfo(): { soundsCount: number; totalSize: string; assistant: string } {
    try {
      const sounds = this.getNewSoundsStorage();
      const soundsCount = Object.keys(sounds).length;
      
      let totalBytes = 0;
      Object.values(sounds).forEach((sound: any) => {
        if (sound.size) totalBytes += sound.size;
      });

      const totalSize = totalBytes > 1024 * 1024 
        ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(totalBytes / 1024)} KB`;

      const currentInfo = this.getAssistantInfo(this.currentAssistant);
      
      return {
        soundsCount,
        totalSize,
        assistant: currentInfo?.name || 'Неизвестный'
      };
    } catch (error) {
      console.error('❌ Ошибка получения информации о хранилище:', error);
      return { soundsCount: 0, totalSize: '0 KB', assistant: 'Ошибка' };
    }
  }

  /**
   * Воспроизведение ячейки через выбранного помощника
   */
  async playCellAudio(cellNumber: string): Promise<boolean> {
    try {
      console.log(`🎤 [VOICE ASSISTANT MANAGER] Воспроизведение ячейки ${cellNumber} через ${this.currentAssistant} помощника`);
      
      if (this.currentAssistant === 'old') {
        // Используем старую систему через audioManager
        const { audioManager } = await import('./simpleAudioManager');
        const success = await audioManager.playCellAudio(cellNumber);
        console.log(`${success ? '✅' : '❌'} [OLD ASSISTANT] Результат воспроизведения ячейки ${cellNumber}: ${success}`);
        return success;
      } else {
        // Используем новую систему 
        console.log(`🔊 [NEW ASSISTANT] Пробуем воспроизвести ячейку ${cellNumber} из нового хранилища`);
        
        // Сначала пробуем найти в новом хранилище
        const soundData = this.getNewSoundData(`cell-${cellNumber}`);
        if (soundData) {
          const audio = new Audio(soundData);
          
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isAndroid = /Android/.test(navigator.userAgent);
          
          if (isIOS || isAndroid) {
            audio.load();
          }
          
          await audio.play();
          console.log(`✅ [NEW ASSISTANT] Ячейка ${cellNumber} воспроизведена из нового хранилища`);
          return true;
        }
        
        // Если не найдено в новом, пробуем старое хранилище как fallback
        console.log(`🔄 [NEW ASSISTANT] Ячейка ${cellNumber} не найдена в новом хранилище, пробуем старое...`);
        const { audioManager } = await import('./simpleAudioManager');
        const success = await audioManager.playCellAudio(cellNumber);
        console.log(`${success ? '✅' : '❌'} [NEW ASSISTANT FALLBACK] Результат воспроизведения ячейки ${cellNumber}: ${success}`);
        return success;
      }
    } catch (error) {
      console.error(`❌ [VOICE ASSISTANT MANAGER] Ошибка воспроизведения ячейки ${cellNumber}:`, error);
      return false;
    }
  }
}

// Экспортируем единственный экземпляр
export const voiceAssistantManager = new VoiceAssistantManager();