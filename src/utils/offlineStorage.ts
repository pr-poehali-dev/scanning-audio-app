import { Order } from '@/data/mockOrders';

const STORAGE_KEY = 'wb-pvz-offline-data';
const LAST_SYNC_KEY = 'wb-pvz-last-sync';

export interface OfflineData {
  orders: Order[];
  timestamp: number;
}

export const saveOfflineData = (orders: Order[]): void => {
  try {
    const data: OfflineData = {
      orders,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Ошибка сохранения офлайн данных:', error);
  }
};

export const getOfflineData = (): Order[] | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const parsed: OfflineData = JSON.parse(data);
    
    const orders = parsed.orders.map(order => ({
      ...order,
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt)
    }));

    return orders;
  } catch (error) {
    console.error('Ошибка чтения офлайн данных:', error);
    return null;
  }
};

export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(LAST_SYNC_KEY);
};

export const clearOfflineData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_SYNC_KEY);
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const syncDataWhenOnline = (callback: () => void): void => {
  if (isOnline()) {
    callback();
  } else {
    const handleOnline = () => {
      callback();
      window.removeEventListener('online', handleOnline);
    };
    window.addEventListener('online', handleOnline);
  }
};
