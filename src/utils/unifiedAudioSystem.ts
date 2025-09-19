/**
 * 🎯 ЕДИНАЯ БЕТОНИРОВАННАЯ СИСТЕМА ОЗВУЧКИ
 * Заменяет все сложные системы одной надежной
 * Работает ВСЕГДА после перезагрузки
 */

const UNIFIED_AUDIO_KEY = 'wb-unified-audio-system';
const BACKUP_KEYS = [
  'wb-pvz-cell-audio-settings-permanent',
  'wb-audio-files', 
  'wb-audio-files-backup',
  'customAudioFiles'
];

interface UnifiedAudioFile {
  url: string;
  name: string;
  type: 'cell' | 'system';
  cellNumber?: string;
  createdAt: string;
}

interface UnifiedAudioStorage {
  files: Record<string, UnifiedAudioFile>;
  lastUpdate: string;
  version: string;
}

class UnifiedAudioSystem {
  private static instance: UnifiedAudioSystem;
  private cache: Map<string, HTMLAudioElement> = new Map();
  private storage: UnifiedAudioStorage | null = null;

  static getInstance(): UnifiedAudioSystem {
    if (!UnifiedAudioSystem.instance) {
      UnifiedAudioSystem.instance = new UnifiedAudioSystem();
    }
    return UnifiedAudioSystem.instance;
  }

  constructor() {
    this.loadStorage();
    this.migrateFromAllSources();
  }

  /**
   * Загрузить хранилище
   */
  private loadStorage(): void {
    try {
      const data = localStorage.getItem(UNIFIED_AUDIO_KEY);
      if (data) {
        this.storage = JSON.parse(data);
      } else {
        this.storage = {
          files: {},
          lastUpdate: new Date().toISOString(),
          version: '1.0'
        };
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки единого хранилища:', error);
      this.storage = {
        files: {},
        lastUpdate: new Date().toISOString(),
        version: '1.0'
      };
    }
  }

  /**
   * Сохранить хранилище
   */
  private saveStorage(): boolean {
    if (!this.storage) return false;
    
    try {
      this.storage.lastUpdate = new Date().toISOString();
      localStorage.setItem(UNIFIED_AUDIO_KEY, JSON.stringify(this.storage));
      
      // ДУБЛИРУЕМ в старые ключи для совместимости
      const legacyFormat: Record<string, string> = {};
      Object.entries(this.storage.files).forEach(([key, file]) => {
        legacyFormat[key] = file.url;
      });
      
      BACKUP_KEYS.forEach(backupKey => {
        try {
          localStorage.setItem(backupKey, JSON.stringify(legacyFormat));
        } catch (e) {
          // Игнорируем ошибки бэкапа
        }
      });
      
      console.log(`✅ ЕДИНАЯ СИСТЕМА: сохранено ${Object.keys(this.storage.files).length} файлов`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка сохранения единого хранилища:', error);
      return false;
    }
  }

  /**
   * ПРИНУДИТЕЛЬНАЯ миграция из всех источников
   */
  private migrateFromAllSources(): void {
    if (!this.storage) return;

    console.log('🔄 === ПРИНУДИТЕЛЬНАЯ МИГРАЦИЯ ИЗ ВСЕХ ИСТОЧНИКОВ ===');
    let migratedCount = 0;

    // Мигрируем из всех старых ключей
    BACKUP_KEYS.forEach(key => {
      try {
        const oldData = localStorage.getItem(key);
        if (oldData) {
          const parsed = JSON.parse(oldData);
          console.log(`🔍 Проверяю ${key}: ${Object.keys(parsed).length} файлов`);

          Object.entries(parsed).forEach(([fileKey, fileUrl]) => {
            if (typeof fileUrl !== 'string' || !fileUrl.startsWith('data:audio/')) return;

            // Определяем тип файла
            let audioFile: UnifiedAudioFile;
            
            if (this.isCellKey(fileKey)) {
              const cellNumber = this.extractCellNumber(fileKey);
              if (cellNumber) {
                // Файл ячейки
                audioFile = {
                  url: fileUrl,
                  name: `cell-${cellNumber}.mp3`,
                  type: 'cell',
                  cellNumber: cellNumber,
                  createdAt: new Date().toISOString()
                };
                
                // Сохраняем под всеми возможными ключами для надёжности
                const cellKeys = [cellNumber, `cell-${cellNumber}`, `ячейка-${cellNumber}`];
                cellKeys.forEach(ck => {
                  if (!this.storage!.files[ck]) {
                    this.storage!.files[ck] = audioFile;
                    migratedCount++;
                  }
                });
                
                console.log(`✅ Мигрирована ячейка ${cellNumber} из ${key}`);
              }
            } else if (this.isSystemKey(fileKey)) {
              // Системный файл
              audioFile = {
                url: fileUrl,
                name: fileKey,
                type: 'system',
                createdAt: new Date().toISOString()
              };
              
              if (!this.storage!.files[fileKey]) {
                this.storage!.files[fileKey] = audioFile;
                migratedCount++;
                console.log(`✅ Мигрирован системный звук ${fileKey} из ${key}`);
              }
            }
          });
        }
      } catch (error) {
        console.warn(`⚠️ Ошибка миграции из ${key}:`, error);
      }
    });

    if (migratedCount > 0) {
      this.saveStorage();
      console.log(`🎯 ЕДИНАЯ СИСТЕМА: мигрировано ${migratedCount} файлов`);
    }
  }

  /**
   * Проверить является ли ключ ячейкой
   */
  private isCellKey(key: string): boolean {
    return /^\d+$/.test(key) || 
           key.includes('cell-') || 
           key.includes('ячейка-') ||
           key.includes('коробка-') ||
           key.includes('box-');
  }

  /**
   * Извлечь номер ячейки из ключа
   */
  private extractCellNumber(key: string): string | null {
    const match = key.match(/(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Проверить является ли ключ системным звуком
   */
  private isSystemKey(key: string): boolean {
    const systemKeywords = [
      'скидк', 'кошелек', 'discount', 'Товары со со скидкой',
      'камер', 'товар', 'check-product', 'Проверьте товар'
    ];
    
    return systemKeywords.some(keyword => 
      key.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * 🎯 ГЛАВНАЯ ФУНКЦИЯ: Воспроизвести аудио ячейки
   */
  async playCellAudio(cellNumber: string): Promise<boolean> {
    console.log(`🎯 === ЕДИНАЯ СИСТЕМА: ВОСПРОИЗВЕДЕНИЕ ЯЧЕЙКИ ${cellNumber} ===`);
    
    if (!this.storage) {
      this.loadStorage();
      this.migrateFromAllSources();
    }

    const possibleKeys = [
      cellNumber,
      `cell-${cellNumber}`,
      `ячейка-${cellNumber}`
    ];

    // Ищем файл
    let audioFile: UnifiedAudioFile | null = null;
    let foundKey = '';

    for (const key of possibleKeys) {
      if (this.storage!.files[key]) {
        audioFile = this.storage!.files[key];
        foundKey = key;
        break;
      }
    }

    if (!audioFile) {
      console.warn(`❌ ЕДИНАЯ СИСТЕМА: Ячейка ${cellNumber} не найдена, пересканирую...`);
      
      // ЭКСТРЕННАЯ пересинхронизация
      this.migrateFromAllSources();
      
      // Ищем ещё раз
      for (const key of possibleKeys) {
        if (this.storage!.files[key]) {
          audioFile = this.storage!.files[key];
          foundKey = key;
          break;
        }
      }
      
      if (!audioFile) {
        console.error(`❌ КРИТИЧНО: Ячейка ${cellNumber} не найдена даже после пересканирования!`);
        return false;
      }
    }

    // Воспроизводим
    try {
      const audio = new Audio(audioFile.url);
      audio.volume = 0.8;
      await audio.play();
      console.log(`✅ ЕДИНАЯ СИСТЕМА: Ячейка ${cellNumber} воспроизведена (ключ: ${foundKey})`);
      return true;
    } catch (error) {
      console.error(`❌ ЕДИНАЯ СИСТЕМА: Ошибка воспроизведения ячейки ${cellNumber}:`, error);
      return false;
    }
  }

  /**
   * 🎯 ГЛАВНАЯ ФУНКЦИЯ: Воспроизвести системный звук
   */
  async playSystemAudio(soundKey: string): Promise<boolean> {
    console.log(`🎯 === ЕДИНАЯ СИСТЕМА: ВОСПРОИЗВЕДЕНИЕ СИСТЕМНОГО ЗВУКА ${soundKey} ===`);
    
    if (!this.storage) {
      this.loadStorage();
      this.migrateFromAllSources();
    }

    // Маппинг системных звуков
    const soundMappings: Record<string, string[]> = {
      'discount': [
        'Товары со со скидкой проверьте ВБ кошелек',
        'Товары со скидкой проверьте ВБ кошелек',
        'скидка',
        'кошелек',
        'discount'
      ],
      'check-product': [
        'Проверьте товар под камерой',
        'камера',
        'товар',
        'check-product'
      ]
    };

    const possibleKeys = soundMappings[soundKey] || [soundKey];
    
    // Ищем файл
    let audioFile: UnifiedAudioFile | null = null;
    let foundKey = '';

    for (const key of possibleKeys) {
      if (this.storage!.files[key]) {
        audioFile = this.storage!.files[key];
        foundKey = key;
        break;
      }
    }

    if (!audioFile) {
      console.warn(`❌ ЕДИНАЯ СИСТЕМА: Системный звук ${soundKey} не найден, пересканирую...`);
      
      // ЭКСТРЕННАЯ пересинхронизация
      this.migrateFromAllSources();
      
      // Ищем ещё раз
      for (const key of possibleKeys) {
        if (this.storage!.files[key]) {
          audioFile = this.storage!.files[key];
          foundKey = key;
          break;
        }
      }
      
      if (!audioFile) {
        console.error(`❌ КРИТИЧНО: Системный звук ${soundKey} не найден даже после пересканирования!`);
        return false;
      }
    }

    // Воспроизводим
    try {
      const audio = new Audio(audioFile.url);
      audio.volume = 0.8;
      await audio.play();
      console.log(`✅ ЕДИНАЯ СИСТЕМА: Системный звук ${soundKey} воспроизведен (ключ: ${foundKey})`);
      return true;
    } catch (error) {
      console.error(`❌ ЕДИНАЯ СИСТЕМА: Ошибка воспроизведения системного звука ${soundKey}:`, error);
      return false;
    }
  }

  /**
   * Получить информацию о файлах
   */
  getInfo(): { totalFiles: number; cellFiles: number; systemFiles: number } {
    if (!this.storage) return { totalFiles: 0, cellFiles: 0, systemFiles: 0 };
    
    const files = Object.values(this.storage.files);
    const cellFiles = files.filter(f => f.type === 'cell').length;
    const systemFiles = files.filter(f => f.type === 'system').length;
    
    return {
      totalFiles: files.length,
      cellFiles,
      systemFiles
    };
  }

  /**
   * Получить список ячеек с озвучкой
   */
  getCellsWithAudio(): string[] {
    if (!this.storage) return [];
    
    const cells = new Set<string>();
    Object.values(this.storage.files).forEach(file => {
      if (file.type === 'cell' && file.cellNumber) {
        cells.add(file.cellNumber);
      }
    });
    
    return Array.from(cells).sort((a, b) => parseInt(a) - parseInt(b));
  }
}

// Экспортируем единственный экземпляр
export const unifiedAudioSystem = UnifiedAudioSystem.getInstance();

// Главные функции для использования в коде
export const playCellAudio = (cellNumber: string) => unifiedAudioSystem.playCellAudio(cellNumber);
export const playSystemAudio = (soundKey: string) => unifiedAudioSystem.playSystemAudio(soundKey);
export const getAudioInfo = () => unifiedAudioSystem.getInfo();
export const getCellsWithAudio = () => unifiedAudioSystem.getCellsWithAudio();