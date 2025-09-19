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
  // Системные звуки
  {
    id: 'error_sound',
    name: 'Звук ошибки',
    description: 'При сканировании неверного QR-кода клиента или курьера',
    category: 'system'
  },
  
  // Звуки ячеек (существующие)
  {
    id: 'cell_number',
    name: 'Номер ячейки',
    description: 'Произношение номера ячейки (например: "Ячейка А один")',
    category: 'cell'
  },
  
  // Звуки количества товаров
  {
    id: 'goods_count',
    name: 'Количество товаров',
    description: 'Произношение количества (например: "Три")',
    category: 'interaction'
  },
  
  {
    id: 'goods_word',
    name: 'Слово "товаров"',
    description: 'Склонение слова товар (товар/товара/товаров)',
    category: 'interaction'
  },
  
  // Звуки взаимодействия
  {
    id: 'payment_on_delivery',
    name: 'Оплата при получении',
    description: 'Уведомление о том, что заказ с оплатой при получении',
    category: 'feedback'
  },
  
  {
    id: 'please_check_good_under_camera',
    name: 'Проверьте товар под камерой',
    description: 'Инструкция проверить товар под камерой',
    category: 'feedback'
  },
  
  {
    id: 'thanks_for_order_rate_pickpoint',
    name: 'Спасибо за заказ',
    description: 'Благодарность и просьба оценить PickPoint',
    category: 'feedback'
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
      // Используем старую систему
      const { playCellAudio } = await import('./cellAudioPlayer');
      return playCellAudio(cellNumber);
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

      // Для номера ячейки используем существующую систему
      if (soundId === 'cell_number' && params?.cellNumber) {
        const { playCellAudio } = await import('./cellAudioPlayer');
        return playCellAudio(params.cellNumber);
      }

      // Для других звуков проверяем наличие в хранилище
      const audioData = this.getNewSoundData(soundId);
      if (!audioData) {
        console.warn(`⚠️ [NEW ASSISTANT] Звук "${soundId}" не найден`);
        return false;
      }

      // Воспроизводим звук
      const audio = new Audio(audioData);
      await new Promise((resolve, reject) => {
        audio.onended = () => resolve(true);
        audio.onerror = () => reject(new Error('Ошибка воспроизведения'));
        audio.play().catch(reject);
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
}

// Экспортируем единственный экземпляр
export const voiceAssistantManager = new VoiceAssistantManager();