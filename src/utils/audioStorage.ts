// Простое хранилище аудиофайлов в localStorage через base64

class AudioStorage {
  private readonly PREFIX = 'wb-audio-';

  async saveFile(key: string, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64 = reader.result as string;
        localStorage.setItem(this.PREFIX + key, base64);
        resolve(base64);
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async getFile(key: string): Promise<string | null> {
    return localStorage.getItem(this.PREFIX + key);
  }

  async getAllFiles(): Promise<{ [key: string]: string }> {
    const files: { [key: string]: string } = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        const fileKey = key.replace(this.PREFIX, '');
        const data = localStorage.getItem(key);
        if (data) {
          files[fileKey] = data;
        }
      }
    }
    
    return files;
  }

  async deleteFile(key: string): Promise<void> {
    localStorage.removeItem(this.PREFIX + key);
  }

  async clear(): Promise<void> {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  async init(): Promise<void> {
    return Promise.resolve();
  }

  async getStoredKeys(): Promise<string[]> {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        keys.push(key.replace(this.PREFIX, ''));
      }
    }
    
    return keys;
  }
}

export const audioStorage = new AudioStorage();
