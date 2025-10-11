export interface DeviceInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isPWA: boolean;
  canInstallPWA: boolean;
}

export const detectDevice = (): DeviceInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
  const isDesktop = !isMobile;

  const isPWA = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  const canInstallPWA = 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;

  return {
    isMobile,
    isIOS,
    isAndroid,
    isDesktop,
    isPWA,
    canInstallPWA
  };
};

export const isMobileDevice = (): boolean => {
  return detectDevice().isMobile;
};

export const isIOSDevice = (): boolean => {
  return detectDevice().isIOS;
};

export const isAndroidDevice = (): boolean => {
  return detectDevice().isAndroid;
};

export const isDesktopDevice = (): boolean => {
  return detectDevice().isDesktop;
};

export const isPWAMode = (): boolean => {
  return detectDevice().isPWA;
};
