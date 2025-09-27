import QRScanner from '@/components/QRScanner';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import TabContent from '@/components/TabContent';
import SettingsModal from '@/components/SettingsModal';
import Footer from '@/components/Footer';

import { useAudio } from '@/hooks/useAudio';
import { useAppState } from '@/hooks/useAppState';
import { useAppHandlers } from '@/hooks/useAppHandlers';
import { useAudioHelpers } from '@/hooks/useAudioHelpers';


const WBPVZApp = () => {
  // Используем разделенные хуки для управления состоянием
  const appState = useAppState();
  const { playAudio, updateAudioFiles, customAudioFiles, clearAllAudio } = useAudio();
  
  // Создаем обработчики событий
  const appHandlers = useAppHandlers({
    activeTab: appState.activeTab,
    deliveryStep: appState.deliveryStep,
    currentOrder: appState.currentOrder,
    customAudioFiles,
    expandedMenuItems: appState.expandedMenuItems,
    audioSettings: appState.audioSettings,
    playAudio,
    updateAudioFiles,
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

  // Создаем вспомогательные функции для аудио
  const audioHelpers = useAudioHelpers(updateAudioFiles, customAudioFiles);

  // Функция полной очистки озвучки
  const handleClearAllAudio = () => {
    if (confirm('⚠️ Удалить ВСЮ озвучку?\n\nЭто действие нельзя отменить. Будут удалены все MP3 файлы ячеек и системные звуки.')) {
      clearAllAudio();
      alert('✅ Вся озвучка удалена!\n\nТеперь можете загрузить новые файлы.');
    }
  };



  // Функция для смены вкладки с сбросом состояния
  const handleTabChange = (tab: string) => {
    appState.setActiveTab(tab);
    appHandlers.handleTabChange(tab);
  };

  // Обертка для togglePhraseEnabled с правильными параметрами
  const handleTogglePhraseEnabled = (tabId: string, phraseIndex: number) => {
    audioHelpers.togglePhraseEnabled(tabId, phraseIndex, appState.audioSettings, appHandlers.updateAudioSetting);
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
          playAudio={playAudio}
          customAudioFiles={customAudioFiles}
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
        handleDiscountAudio={appHandlers.handleDiscountAudio}
        handleCheckProductAudio={appHandlers.handleCheckProductAudio}
        handleRatePvzAudio={appHandlers.handleRatePvzAudio}
        handleClearAllAudio={handleClearAllAudio}
      />

      <SettingsModal
        isOpen={appState.showSettings}
        onClose={() => appState.setShowSettings(false)}
        audioSettings={appState.audioSettings}
        customAudioFiles={customAudioFiles}
        updateAudioSetting={appHandlers.updateAudioSetting}
        playAudio={playAudio}
        handleFolderUpload={audioHelpers.handleFolderUpload}
        getTabName={audioHelpers.getTabName}
        getPhrasesByTab={audioHelpers.getPhrasesByTab}
        getDescriptionsByTab={audioHelpers.getDescriptionsByTab}
        togglePhraseEnabled={handleTogglePhraseEnabled}
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