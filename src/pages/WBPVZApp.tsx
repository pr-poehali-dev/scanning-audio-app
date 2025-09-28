import { useState } from 'react';
import QRScanner from '@/components/QRScanner';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import TabContent from '@/components/TabContent';
import SettingsModal from '@/components/SettingsModal';
import Footer from '@/components/Footer';

import { useAppState } from '@/hooks/useAppState';
import { useAppHandlers } from '@/hooks/useAppHandlers';

const WBPVZApp = () => {
  // Используем разделенные хуки для управления состоянием
  const appState = useAppState();
  
  // Создаем обработчики событий
  const appHandlers = useAppHandlers({
    activeTab: appState.activeTab,
    deliveryStep: appState.deliveryStep,
    currentOrder: appState.currentOrder,
    expandedMenuItems: appState.expandedMenuItems,
    audioSettings: appState.audioSettings,
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
  });

  // Функция для смены вкладки с сбросом состояния
  const handleTabChange = (tab: string) => {
    appState.setActiveTab(tab);
    appHandlers.handleTabChange(tab);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        onMenuOpen={() => appState.setShowSideMenu(true)}
        onSettingsOpen={() => appState.setShowSettings(true)}
        activeTab={appState.activeTab}
        setActiveTab={handleTabChange}
      />

      <div className="flex-1 p-6">
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
        />
      </div>

      <Footer />

      <SideMenu
        isOpen={appState.showSideMenu}
        onClose={() => appState.setShowSideMenu(false)}
        onSettingsOpen={() => appState.setShowSettings(true)}
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

      <QRScanner
        isOpen={appState.showQRScanner}
        onScan={appHandlers.handleQRScanResult}
        onClose={() => appState.setShowQRScanner(false)}
      />
    </div>
  );
};

export default WBPVZApp;