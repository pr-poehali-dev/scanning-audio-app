// Глобальные типы для TypeScript

declare global {
  interface Window {
    gc?: () => void; // Функция сборки мусора (Chrome DevTools)
  }
}

export {};