import { useCallback } from 'react';
import { PvzInfo, AudioSettings } from '../useAppState';

interface SettingsHandlersProps {
  expandedMenuItems: Record<string, boolean>;
  setExpandedMenuItems: (items: Record<string, boolean>) => void;
  setPvzInfo: (info: PvzInfo) => void;
  setAudioSettings: (settings: AudioSettings) => void;
}

export const createSettingsHandlers = (props: SettingsHandlersProps) => {
  const { expandedMenuItems, setExpandedMenuItems, setPvzInfo, setAudioSettings } = props;

  // Обработчики для меню и настроек
  const toggleMenuItem = useCallback((item: string) => {
    const newExpanded = {
      ...expandedMenuItems,
      [item]: !expandedMenuItems[item]
    };
    setExpandedMenuItems(newExpanded);
    localStorage.setItem('wb-pvz-expanded-menu', JSON.stringify(newExpanded));
  }, [expandedMenuItems, setExpandedMenuItems]);

  const updatePvzInfo = useCallback((field: string, value: string) => {
    setPvzInfo(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem(`wb-pvz-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
      return updated;
    });
  }, [setPvzInfo]);

  const updateAudioSetting = useCallback((key: string, value: any) => {
    setAudioSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(`wb-pvz-audio-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, 
        typeof value === 'object' ? JSON.stringify(value) : String(value)
      );
      return updated;
    });
  }, [setAudioSettings]);

  return {
    toggleMenuItem,
    updatePvzInfo,
    updateAudioSetting
  };
};