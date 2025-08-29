import { useState, useCallback, useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';
import QRScanner from '@/components/QRScanner';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import TabContent from '@/components/TabContent';
import SettingsModal from '@/components/SettingsModal';
import Footer from '@/components/Footer';
import { findOrderByPhone, Order } from '@/data/mockOrders';

const WBPVZApp = () => {
  const [activeTab, setActiveTab] = useState('acceptance');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [deliveryStep, setDeliveryStep] = useState<'initial' | 'client-scanned' | 'product-scanned' | 'completed'>('initial');
  const [isProductScanned, setIsProductScanned] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
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

  // Восстанавливаем информацию о загруженных аудиофайлах при запуске
  useEffect(() => {
    const savedAudioFiles = localStorage.getItem('wb-pvz-uploaded-audio-files');
    if (savedAudioFiles) {
      try {
        const fileNames = JSON.parse(savedAudioFiles);
        console.log(`🔄 Найдено ${fileNames.length} сохраненных аудиофайлов в localStorage`);
        // Здесь могли бы восстановить файлы, но URL объекты не переживают перезагрузку
        // Показываем пользователю информацию о том, что файлы нужно загрузить заново
      } catch (e) {
        console.warn('Ошибка восстановления списка аудиофайлов:', e);
      }
    }
  }, []);

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
    
    if (activeTab === 'delivery') {
      // Логика для выдачи - эмулируем поиск заказа
      if (deliveryStep === 'initial') {
        // Первое сканирование - QR клиента/курьера, берем случайный заказ
        const order = findOrderByPhone('5667'); // тестовый заказ
        if (order) {
          setCurrentOrder(order);
          setDeliveryStep('client-scanned');
          
          // Озвучиваем номер ячейки и про скидку
          await playAudio(`cell-${order.cellNumber}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          await playAudio('discount');
        }
        
      } else if (deliveryStep === 'client-scanned') {
        // Второе сканирование - товар со склада
        setDeliveryStep('product-scanned');
        setIsProductScanned(true);
        
        // Озвучиваем "Проверьте товар под камерой"
        await playAudio('check-product');
      }
    } else {
      // Старая логика для других вкладок
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
    }
    
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  }, [playAudio, activeTab, deliveryStep]);

  const handlePhoneSubmit = useCallback(async (lastFourDigits: string) => {
    const order = findOrderByPhone(lastFourDigits);
    if (order) {
      setCurrentOrder(order);
      setDeliveryStep('client-scanned');
      
      // Озвучиваем номер ячейки и про скидку
      await playAudio(`cell-${order.cellNumber}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await playAudio('discount');
      
      // Очищаем номер телефона
      setPhoneNumber('');
    } else {
      alert('Заказ не найден');
    }
  }, [playAudio, setPhoneNumber]);

  // Функции для процесса выдачи
  const handleCellClick = useCallback(async (cellNumber: string) => {
    // Озвучиваем номер ячейки при клике
    await playAudio(`cell-${cellNumber}`);
  }, [playAudio]);

  const handleScanProduct = useCallback(async () => {
    // Эмуляция сканирования товара
    setIsProductScanned(true);
    if (currentOrder) {
      setScannedData(currentOrder.items.map(item => item.barcode).join(','));
    }
    
    // Озвучиваем "Проверьте товар под камерой"
    await playAudio('check-product');
  }, [currentOrder, playAudio]);

  const handleDeliverProduct = useCallback(async () => {
    // Финальная выдача товара с озвучкой "Оцените наш ПВЗ"
    await playAudio('rate-service');
    
    // Сброс состояния через некоторое время
    setTimeout(() => {
      setDeliveryStep('initial');
      setCurrentOrder(null);
      setIsProductScanned(false);
      setScannedData('');
    }, 3000);
  }, [playAudio]);

  // Сброс состояния выдачи при смене вкладки
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (tab !== 'delivery') {
      setDeliveryStep('initial');
      setIsProductScanned(false);
      setScannedData('');
    }
  }, []);

  const updateAudioSetting = useCallback((key: string, value: any) => {
    setAudioSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(`wb-pvz-audio-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, 
        typeof value === 'object' ? JSON.stringify(value) : String(value)
      );
      return updated;
    });
  }, []);

  const getTabName = (tabId: string) => {
    const names: { [key: string]: string } = {
      'delivery': 'Выдача',
      'acceptance': 'Приемка', 
      'returns': 'Возврат',
      'general': 'Общие'
    };
    return names[tabId] || tabId;
  };

  const handleFolderUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, tabType: string) => {
    const files = event.target.files;
    console.log('Выбрано файлов для', tabType, ':', files?.length);
    
    if (!files) return;

    const audioFiles: { [key: string]: string } = { ...customAudioFiles };
    let newFilesCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('Обрабатываю файл:', file.name, 'Тип:', file.type);
      
      if (file.type.startsWith('audio/')) {
        const baseFileName = file.name.replace(/\.[^/.]+$/, '');
        const audioUrl = URL.createObjectURL(file);
        
        // Сохраняем файл с префиксом вкладки
        const prefixedFileName = `${tabType}-${baseFileName}`;
        audioFiles[prefixedFileName] = audioUrl;
        
        // ТАКЖЕ сохраняем файл БЕЗ префикса для глобального доступа
        audioFiles[baseFileName] = audioUrl;
        
        console.log(`✅ Добавлен аудиофайл:`, {
          withPrefix: prefixedFileName,
          global: baseFileName,
          url: audioUrl
        });
        
        newFilesCount++;
      }
    }

    if (newFilesCount > 0) {
      updateAudioFiles(audioFiles);
      
      // Сохраняем аудио файлы в localStorage для всей платформы
      try {
        const audioFilesToStore = { ...audioFiles };
        // Удаляем URL объекты из localStorage (они не сериализуются)
        // Сохраняем только названия файлов для восстановления при перезагрузке
        const fileNames = Object.keys(audioFiles).filter(key => !key.includes('blob:'));
        localStorage.setItem('wb-pvz-uploaded-audio-files', JSON.stringify(fileNames));
        console.log(`💾 Сохранено ${fileNames.length} названий аудиофайлов в localStorage`);
      } catch (e) {
        console.warn('Не удалось сохранить список аудиофайлов в localStorage:', e);
      }
      
      alert(`Для вкладки "${getTabName(tabType)}" загружено ${newFilesCount} аудиофайлов.\n\n✅ Файлы теперь доступны для всей платформы!`);
    } else {
      alert('Аудиофайлы не найдены. Проверьте что выбрали файлы с расширением .mp3, .wav, .ogg или другими аудио форматами');
    }

    if (event.target) {
      event.target.value = '';
    }
  }, [updateAudioFiles, customAudioFiles, getTabName]);

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
        setActiveTab={handleTabChange}
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
          deliveryStep={deliveryStep}
          isProductScanned={isProductScanned}
          onCellClick={handleCellClick}
          onScanProduct={handleScanProduct}
          onDeliverProduct={handleDeliverProduct}
          currentOrder={currentOrder}
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