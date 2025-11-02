import { useState, useEffect } from 'react';
import QRScanner from '@/components/QRScanner';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import LeftSidebar from '@/components/LeftSidebar';
import TabContent from '@/components/TabContent';
import SettingsModal from '@/components/SettingsModal';
import { AudioSettings } from '@/components/AudioSettings';
import Footer from '@/components/Footer';
import InstallPrompt from '@/components/InstallPrompt';
import InstallPWA from '@/components/InstallPWA';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileAudioTest from '@/components/MobileAudioTest';

import { useAppState } from '@/hooks/useAppState';
import { useAppHandlers } from '@/hooks/useAppHandlers';
import { useAudio } from '@/hooks/useAudio';
import { detectDevice } from '@/utils/deviceDetection';

const WBPVZApp = () => {
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [deviceInfo] = useState(() => detectDevice());
  const isMobile = deviceInfo.isMobile;
  
  useEffect(() => {
    console.log('📱 Устройство:', {
      mobile: deviceInfo.isMobile,
      ios: deviceInfo.isIOS,
      android: deviceInfo.isAndroid,
      desktop: deviceInfo.isDesktop,
      pwa: deviceInfo.isPWA
    });
    console.log('✅ WBPVZApp component mounted');
  }, [deviceInfo]);
  
  // Используем разделенные хуки для управления состоянием
  const appState = useAppState();
  console.log('🔍 appState loaded:', !!appState);
  
  // Хук для работы с аудио
  const { playAudio, uploadedFiles, setUploadedFiles } = useAudio({ audioSettings: appState.audioSettings });
  
  // Создаем обработчики событий
  const appHandlers = useAppHandlers({
    activeTab: appState.activeTab,
    deliveryStep: appState.deliveryStep,
    currentOrder: appState.currentOrder,
    expandedMenuItems: appState.expandedMenuItems,
    audioSettings: appState.audioSettings,
    playAudio,
    setIsScanning: appState.setIsScanning,
    setShowQRScanner: appState.setShowQRScanner,
    setCurrentOrder: appState.setCurrentOrder,
    setDeliveryStep: appState.setDeliveryStep,
    setScannedData: appState.setScannedData,
    setIsProductScanned: appState.setIsProductScanned,
    setPhoneNumber: appState.setPhoneNumber,
    setExpandedMenuItems: appState.setExpandedMenuItems,
    setPvzInfo: appState.setPvzInfo,
    setAudioSettings: appState.setAudioSettings,
    activeClients: appState.activeClients,
    setActiveClients: appState.setActiveClients,
    currentClientId: appState.currentClientId,
    setCurrentClientId: appState.setCurrentClientId,
  });

  // Функция для смены вкладки с сбросом состояния
  const handleTabChange = (tab: string) => {
    appState.setActiveTab(tab);
    appHandlers.handleTabChange(tab);
  };

  return (
    <div className={`min-h-screen bg-gray-100 flex flex-col ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
      {/* Левая панель - только на ПК */}
      {!isMobile && <LeftSidebar pvzInfo={appState.pvzInfo} />}

      {/* Хедер - всегда показываем */}
      <Header
        onMenuOpen={() => appState.setShowSideMenu(true)}
        onSettingsOpen={() => appState.setShowSettings(true)}
        onAudioSettingsOpen={() => setShowAudioSettings(true)}
        activeTab={appState.activeTab}
        setActiveTab={handleTabChange}
        audioVariant={appState.audioSettings.variant}
      />

      {/* Основной контент */}
      <div className={`flex-1 overflow-auto ${isMobile ? 'pb-16 pl-0' : 'pb-0 lg:pl-[140px]'}`}>
        <TabContent
          activeTab={appState.activeTab}
          phoneNumber={appState.phoneNumber}
          setPhoneNumber={appState.setPhoneNumber}
          isScanning={appState.isScanning}
          scannedData={appState.scannedData}
          onQRScan={appHandlers.handleQRScan}
          onPhoneSubmit={appHandlers.handlePhoneSubmit}
          deliveryStep={appState.deliveryStep}
          isProductScanned={appState.isProductScanned}
          onCellClick={appHandlers.handleCellClick}
          onScanProduct={appHandlers.handleScanProduct}
          onDeliverProduct={appHandlers.handleDeliverProduct}
          currentOrder={appState.currentOrder}
          playAudio={playAudio}
          activeClients={appState.activeClients}
          currentClientId={appState.currentClientId}
          onClientSwitch={appHandlers.handleClientSwitch}
        />
      </div>

      {/* Футер - только на ПК */}
      {!isMobile && <Footer />}
      
      {/* Мобильное меню - только на мобильных */}
      {isMobile && (
        <MobileBottomNav
          activeTab={appState.activeTab}
          setActiveTab={handleTabChange}
          onMenuOpen={() => appState.setShowSideMenu(true)}
        />
      )}

      <SideMenu
        isOpen={appState.showSideMenu}
        onClose={() => appState.setShowSideMenu(false)}
        onSettingsOpen={() => appState.setShowSettings(true)}
        onAudioSettingsOpen={() => setShowAudioSettings(true)}
        pvzInfo={appState.pvzInfo}
        updatePvzInfo={appHandlers.updatePvzInfo}
        expandedMenuItems={appState.expandedMenuItems}
        toggleMenuItem={appHandlers.toggleMenuItem}
      />

      <SettingsModal
        isOpen={appState.showSettings}
        onClose={() => appState.setShowSettings(false)}
        audioSettings={appState.audioSettings}
        updateAudioSetting={appHandlers.updateAudioSetting}
      />
      
      <AudioSettings
        open={showAudioSettings}
        onOpenChange={setShowAudioSettings}
        audioSettings={appState.audioSettings}
        setAudioSettings={appState.setAudioSettings}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        onTestAudio={playAudio}
      />

      <QRScanner
        isOpen={appState.showQRScanner}
        onScan={appHandlers.handleQRScanResult}
        onClose={() => appState.setShowQRScanner(false)}
      />

      <InstallPrompt />
      <InstallPWA />
      
      <MobileAudioTest 
        onTest={() => {
          playAudio('delivery-cell-info', 44, 3);
        }}
      />
    </div>
  );
};

export default WBPVZApp;