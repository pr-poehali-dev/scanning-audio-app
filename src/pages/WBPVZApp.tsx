import { useState, useCallback } from 'react';
import { useAudio } from '@/hooks/useAudio';
import QRScanner from '@/components/QRScanner';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import TabContent from '@/components/TabContent';
import SettingsModal from '@/components/SettingsModal';
import Footer from '@/components/Footer';

const WBPVZApp = () => {
  const [activeTab, setActiveTab] = useState('acceptance');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [expandedMenuItems, setExpandedMenuItems] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem('wb-pvz-expanded-menu');
    return saved ? JSON.parse(saved) : { settings: false };
  });
  const [pvzInfo, setPvzInfo] = useState({
    id: localStorage.getItem('wb-pvz-id') || '',
    address: localStorage.getItem('wb-pvz-address') || '',
    employeeId: localStorage.getItem('wb-pvz-employee-id') || ''
  });
  const [audioSettings, setAudioSettings] = useState({
    speed: parseFloat(localStorage.getItem('wb-pvz-audio-speed') || '1'),
    activeTab: localStorage.getItem('wb-pvz-audio-tab') || 'delivery',
    phrases: JSON.parse(localStorage.getItem('wb-pvz-audio-phrases') || '{}'),
    enabled: JSON.parse(localStorage.getItem('wb-pvz-audio-enabled') || '{}')
  });
  
  const { playAudio, updateAudioFiles, customAudioFiles } = useAudio();

  const handleQRScan = useCallback(() => {
    setShowQRScanner(true);
  }, []);

  const toggleMenuItem = useCallback((item: string) => {
    const newExpanded = {
      ...expandedMenuItems,
      [item]: !expandedMenuItems[item]
    };
    setExpandedMenuItems(newExpanded);
    localStorage.setItem('wb-pvz-expanded-menu', JSON.stringify(newExpanded));
  }, [expandedMenuItems]);

  const updatePvzInfo = useCallback((field: string, value: string) => {
    setPvzInfo(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem(`wb-pvz-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
      return updated;
    });
  }, []);

  const handleQRScanResult = useCallback(async (data: string) => {
    console.log('QR код отсканирован:', data);
    setScannedData(data);
    setIsScanning(true);
    
    let audioKey = 'scan-success';
    
    if (data.includes('check_product') || data.includes('проверь')) {
      audioKey = 'check-product';
    } else if (data.includes('discount') || data.includes('скидка')) {
      audioKey = 'discount';
    } else if (data.includes('rate') || data.includes('оцените')) {
      audioKey = 'rate-service';
    } else if (data.includes('client') || data.includes('клиент')) {
      audioKey = 'client-found';
    }
    
    await playAudio(audioKey);
    
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  }, [playAudio]);

  const handlePhoneSubmit = useCallback(async () => {
    if (phoneNumber.length === 4) {
      await playAudio('phone-input');
      setPhoneNumber('');
    }
  }, [phoneNumber, playAudio]);

  const updateAudioSetting = useCallback((key: string, value: any) => {
    setAudioSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(`wb-pvz-audio-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, 
        typeof value === 'object' ? JSON.stringify(value) : String(value)
      );
      return updated;
    });
  }, []);

  const handleFolderUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, tabType: string) => {
    const files = event.target.files;
    console.log('Выбрано файлов для', tabType, ':', files?.length);
    
    if (!files) return;

    const audioFiles: { [key: string]: string } = { ...customAudioFiles };
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('Обрабатываю файл:', file.name, 'Тип:', file.type);
      
      if (file.type.startsWith('audio/')) {
        const fileName = `${tabType}-${file.name.replace(/\.[^/.]+$/, '')}`;
        const audioUrl = URL.createObjectURL(file);
        audioFiles[fileName] = audioUrl;
        console.log('Добавлен аудиофайл:', fileName);
      }
    }

    if (Object.keys(audioFiles).length > Object.keys(customAudioFiles).length) {
      updateAudioFiles(audioFiles);
      const newFilesCount = Object.keys(audioFiles).length - Object.keys(customAudioFiles).length;
      alert(`Для вкладки "${getTabName(tabType)}" загружено ${newFilesCount} аудиофайлов`);
    } else {
      alert('Аудиофайлы не найдены. Проверьте что выбрали файлы с расширением .mp3, .wav, .ogg или другими аудио форматами');
    }

    if (event.target) {
      event.target.value = '';
    }
  }, [updateAudioFiles, customAudioFiles]);

  const getTabName = (tabId: string) => {
    const names: { [key: string]: string } = {
      'delivery': 'Выдача',
      'acceptance': 'Приемка', 
      'returns': 'Возврат',
      'general': 'Общие'
    };
    return names[tabId] || tabId;
  };

  const getPhrasesByTab = (tabId: string) => {
    const phrases: { [key: string]: string[] } = {
      'delivery': ['Спасибо за заказ! Оцените пункт выдачи!', 'Верните на ячейку'],
      'acceptance': ['Принято в ПВЗ', 'Ошибка приемки'],
      'returns': ['Возврат оформлен', 'Ошибка возврата'],
      'general': ['Общий сигнал', 'Ошибка системы']
    };
    return phrases[tabId] || [];
  };

  const getDescriptionsByTab = (tabId: string) => {
    const descriptions: { [key: string]: { text: string; enabled: boolean }[] } = {
      'delivery': [
        { text: 'Завершение выдачи заказа клиенту', enabled: true },
        { text: 'Снятие заказа клиента с примерки', enabled: false }
      ],
      'acceptance': [
        { text: 'Успешное принятие товара', enabled: true },
        { text: 'Ошибка при приемке', enabled: true }
      ],
      'returns': [
        { text: 'Успешное оформление возврата', enabled: true },
        { text: 'Ошибка при возврате', enabled: false }
      ],
      'general': [
        { text: 'Общие уведомления', enabled: true },
        { text: 'Системные ошибки', enabled: true }
      ]
    };
    return descriptions[tabId] || [];
  };

  const togglePhraseEnabled = (tabId: string, phraseIndex: number) => {
    const currentEnabled = audioSettings.enabled[`${tabId}-${phraseIndex}`] || false;
    const newEnabled = {
      ...audioSettings.enabled,
      [`${tabId}-${phraseIndex}`]: !currentEnabled
    };
    updateAudioSetting('enabled', newEnabled);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        onMenuOpen={() => setShowSideMenu(true)}
        onSettingsOpen={() => setShowSettings(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 p-6">
        <TabContent
          activeTab={activeTab}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          isScanning={isScanning}
          scannedData={scannedData}
          onQRScan={handleQRScan}
          onPhoneSubmit={handlePhoneSubmit}
        />
      </div>

      <Footer customAudioFiles={customAudioFiles} playAudio={playAudio} />

      <SideMenu
        isOpen={showSideMenu}
        onClose={() => setShowSideMenu(false)}
        onSettingsOpen={() => setShowSettings(true)}
        pvzInfo={pvzInfo}
        updatePvzInfo={updatePvzInfo}
        expandedMenuItems={expandedMenuItems}
        toggleMenuItem={toggleMenuItem}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        audioSettings={audioSettings}
        customAudioFiles={customAudioFiles}
        updateAudioSetting={updateAudioSetting}
        playAudio={playAudio}
        handleFolderUpload={handleFolderUpload}
        getTabName={getTabName}
        getPhrasesByTab={getPhrasesByTab}
        getDescriptionsByTab={getDescriptionsByTab}
        togglePhraseEnabled={togglePhraseEnabled}
      />

      <QRScanner
        isOpen={showQRScanner}
        onScan={handleQRScanResult}
        onClose={() => setShowQRScanner(false)}
      />
    </div>
  );
};

export default WBPVZApp;