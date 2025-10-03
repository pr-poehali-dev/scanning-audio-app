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

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
    });
  }

  async saveFile(key: string, file: File): Promise<string> {
    if (!this.db) await this.init();

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
        console.log(`💾 Файл сохранен: ${key}`);
        resolve(url);
      };

      request.onerror = () => reject(request.error);
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
    if (!this.db) await this.init();

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

        console.log(`📂 Загружено ${results.length} аудиофайлов из IndexedDB`);
        resolve(files);
      };

      request.onerror = () => reject(request.error);
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
        resolve(request.result as string[]);
      };

      request.onerror = () => reject(request.error);
    });
  }
}

export const audioStorage = new AudioStorage();
