// Cloud storage for audio files - works across all devices
const BACKEND_URL = 'https://functions.poehali.dev/8339fb2e-ee81-4b48-b489-990d6cb5f3fb';

// Generate unique user ID for device (stored in localStorage)
const getUserId = (): string => {
  let userId = localStorage.getItem('audio-user-id');
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('audio-user-id', userId);
  }
  return userId;
};

class CloudAudioStorage {
  private userId: string;

  constructor() {
    this.userId = getUserId();
  }

  async saveFile(key: string, file: File): Promise<string> {
    const base64 = await this.fileToBase64(file);

    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': this.userId
      },
      body: JSON.stringify({
        key,
        data: base64
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to upload file: ${response.status} ${text}`);
    }

    return base64;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async getFile(key: string): Promise<string | null> {
    const response = await fetch(`${BACKEND_URL}?key=${encodeURIComponent(key)}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'X-User-Id': this.userId
      }
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data || null;
  }

  async getAllFiles(): Promise<{ [key: string]: string }> {
    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'X-User-Id': this.userId
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch files from cloud');
      return {};
    }

    const result = await response.json();
    return result.files || {};
  }

  async deleteFile(key: string): Promise<void> {
    const response = await fetch(`${BACKEND_URL}?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'X-User-Id': this.userId
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete file from cloud');
    }
  }

  async clear(): Promise<void> {
    const files = await this.getAllFiles();
    const keys = Object.keys(files);
    
    await Promise.all(keys.map(key => this.deleteFile(key)));
  }

  async getStoredKeys(): Promise<string[]> {
    const files = await this.getAllFiles();
    return Object.keys(files);
  }

  async uploadFile(key: string, base64Data: string): Promise<void> {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': this.userId
      },
      body: JSON.stringify({
        key,
        data: base64Data
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to upload ${key}: ${response.status} ${text}`);
    }
  }
}

export const cloudAudioStorage = new CloudAudioStorage();