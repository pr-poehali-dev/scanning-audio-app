// Утилита для сохранения аудиофайлов в IndexedDB

const DB_NAME = 'wb-pvz-audio';
const DB_VERSION = 1;
const STORE_NAME = 'audio-files';

interface AudioFile {
  key: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
}

class AudioStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    // Если уже инициализировано, возвращаем результат
    if (this.db) {
      console.log('✅ IndexedDB уже инициализирована');
      return Promise.resolve();
    }

    // Если уже идет инициализация, ждем ее завершения
    if (this.initPromise) {
      console.log('⏳ Ожидание завершения инициализации...');
      return this.initPromise;
    }

    // Создаем новый промис инициализации
    this.initPromise = new Promise((resolve, reject) => {
      console.log(`🔄 Открытие IndexedDB: ${DB_NAME} v${DB_VERSION}`);
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ Ошибка открытия IndexedDB:', request.error);
        this.initPromise = null;
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB успешно инициализирована');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log(`🔧 Обновление схемы IndexedDB до версии ${DB_VERSION}`);
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          console.log(`✅ Создано хранилище: ${STORE_NAME}`);
        }
      };
    });

    return this.initPromise;
  }

  async saveFile(key: string, file: File): Promise<string> {
    if (!this.db) {
      console.log('🔄 Инициализация IndexedDB...');
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const audioFile: AudioFile = {
        key,
        blob: file,
        fileName: file.name,
        mimeType: file.type
      };

      const request = store.put(audioFile);

      request.onsuccess = () => {
        const url = URL.createObjectURL(file);
        console.log(`✅ Файл "${key}" сохранен в IndexedDB (размер: ${(file.size / 1024).toFixed(2)} KB)`);
        resolve(url);
      };

      request.onerror = () => {
        console.error(`❌ Ошибка сохранения файла "${key}":`, request.error);
        reject(request.error);
      };
    });
  }

  async getFile(key: string): Promise<string | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const audioFile = request.result as AudioFile | undefined;
        if (audioFile) {
          const url = URL.createObjectURL(audioFile.blob);
          console.log(`📂 Файл загружен: ${key}`);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAllFiles(): Promise<{ [key: string]: string }> {
    if (!this.db) {
      console.log('🔄 Инициализация IndexedDB для загрузки...');
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const files: { [key: string]: string } = {};
        const results = request.result as AudioFile[];
        
        results.forEach(audioFile => {
          files[audioFile.key] = URL.createObjectURL(audioFile.blob);
        });

        if (results.length > 0) {
          console.log(`✅ Загружено ${results.length} аудиофайлов из IndexedDB:`, results.map(f => f.key));
        } else {
          console.log('📂 IndexedDB пуста - аудиофайлов не найдено');
        }
        resolve(files);
      };

      request.onerror = () => {
        console.error('❌ Ошибка загрузки из IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => {
        console.log(`🗑️ Файл удален: ${key}`);
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ Все аудиофайлы удалены');
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getStoredKeys(): Promise<string[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        const keys = request.result as string[];
        console.log(`🔑 Ключи в IndexedDB (${keys.length}):`, keys);
        resolve(keys);
      };

      request.onerror = () => {
        console.error('❌ Ошибка получения ключей:', request.error);
        reject(request.error);
      };
    });
  }

  // Метод для диагностики состояния базы данных
  async diagnose(): Promise<void> {
    console.log('🔍 === ДИАГНОСТИКА IndexedDB ===');
    console.log('База данных инициализирована:', !!this.db);
    
    if (!this.db) {
      await this.init();
    }
    
    const keys = await this.getStoredKeys();
    const files = await this.getAllFiles();
    
    console.log('📊 Статистика:');
    console.log('  - Всего ключей:', keys.length);
    console.log('  - Всего файлов:', Object.keys(files).length);
    console.log('  - Список ключей:', keys);
    console.log('='.repeat(50));
  }
}

export const audioStorage = new AudioStorage();