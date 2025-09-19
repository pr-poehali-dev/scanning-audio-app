import Icon from '@/components/ui/icon';
import DeliveryInterface from './DeliveryInterface';
import AcceptanceTab from './AcceptanceTab';
import ReturnsTab from './ReturnsTab';
import { AudioTestButton } from './AudioTestButton';
import { findOrderByPhone } from '@/data/mockOrders';

interface TabContentProps {
  activeTab: string;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  isScanning: boolean;
  scannedData: string;
  onQRScan: () => void;
  onPhoneSubmit: (digits: string) => void;
  deliveryStep: 'initial' | 'client-scanned' | 'product-scanned' | 'completed';
  isProductScanned: boolean;
  onCellClick: (cellNumber: string) => void;
  onScanProduct: () => void;
  onDeliverProduct: () => void;
  currentOrder?: any;
  playAudio?: (audioName: string) => void;
  customAudioFiles?: Record<string, string>;
}

const TabContent = ({
  activeTab,
  phoneNumber,
  setPhoneNumber,
  isScanning,
  scannedData,
  onQRScan,
  onPhoneSubmit,
  deliveryStep,
  isProductScanned,
  onCellClick,
  onScanProduct,
  onDeliverProduct,
  currentOrder,
  playAudio,
  customAudioFiles
}: TabContentProps) => {
  if (activeTab === 'delivery') {
    // Если клиент отсканирован, показываем интерфейс выдачи  
    if (deliveryStep === 'client-scanned' || deliveryStep === 'product-scanned' || deliveryStep === 'completed') {
      return (
        <DeliveryInterface
          order={currentOrder}
          onCellClick={onCellClick}
          onScanProduct={onScanProduct}
          onDeliverProduct={onDeliverProduct}
          isProductScanned={isProductScanned}
          scannedData={scannedData}
          deliveryStep={deliveryStep}
        />
      );
    }

    // Изначальное состояние - сканирование клиента
    return (
      <div className="max-w-md mx-auto text-center space-y-8">
        {/* QR Scanner */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-700">
            Отсканируйте QR-код клиента или курьера
          </h2>
          
          <div 
            className={`relative w-48 h-48 mx-auto transition-all duration-300 ${
              isScanning ? 'animate-pulse' : ''
            }`}
            onClick={onQRScan}
            style={{ cursor: 'pointer' }}
          >
            <img 
              src="https://cdn.poehali.dev/files/f9ab2ff9-989f-470e-8af1-67520cb6feec.png"
              alt="QR Scanner"
              className="w-full h-full object-contain"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-purple-100 bg-opacity-80 rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-purple-600 text-sm font-medium">Поиск заказа...</span>
                </div>
              </div>
            )}
          </div>
          

        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-500 text-sm font-medium">ИЛИ</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Phone Input */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-700">
            Введите номер телефона клиента
          </h3>
          
          <div className="space-y-2">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Последние 4 цифры номера"
              className="w-full px-4 py-3 text-lg text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              maxLength={4}
            />
            
            <button
              onClick={async () => {
                console.log(`🔘 === КНОПКА "НАЙТИ ЗАКАЗ" НАЖАТА! ===`);
                console.log(`📱 Введен номер: "${phoneNumber}"`);
                console.log(`🔍 Длина введенного номера: ${phoneNumber.length} символов`);
                
                if (phoneNumber.length === 0) {
                  console.warn('⚠️ Пустое поле номера!');
                  return;
                }
                
                console.log('🔎 ВЫЗЫВАЕМ findOrderByPhone...');
                const order = findOrderByPhone(phoneNumber);
                console.log('📋 РЕЗУЛЬТАТ findOrderByPhone:', order);
                
                if (order) {
                  console.log(`✅ === ЗАКАЗ НАЙДЕН! ===`);
                  console.log(`👤 Имя клиента: ${order.customerName}`);
                  console.log(`🏠 Ячейка: ${order.cellNumber}`);
                  console.log(`📞 Телефон заказа: ${order.phone}`);
                  
                  // Озвучиваем ячейку
                  console.log(`🔊 === НАЧИНАЕМ ОЗВУЧКУ ЯЧЕЙКИ ${order.cellNumber} ===`);
                  try {
                    const { playCellAudio } = await import('@/utils/cellAudioPlayer');
                    console.log('📦 playCellAudio импортирован успешно');
                    
                    const success = await playCellAudio(order.cellNumber);
                    console.log(`🎵 === РЕЗУЛЬТАТ ОЗВУЧКИ: ${success ? '✅ УСПЕХ' : '❌ НЕУДАЧА'} ===`);
                    
                    if (!success) {
                      console.log('🔍 Проверяем доступные ячейки...');
                      const { audioManager } = await import('@/utils/simpleAudioManager');
                      const availableCells = audioManager.getCellsWithAudio();
                      console.log(`📋 Всего озвученных ячеек: ${availableCells.length}`);
                      console.log(`📋 Первые 10 ячеек:`, availableCells.slice(0, 10));
                      
                      // Проверяем похожие ячейки
                      const similarCells = availableCells.filter(cell => 
                        cell.includes(order.cellNumber) || order.cellNumber.includes(cell)
                      );
                      if (similarCells.length > 0) {
                        console.log(`🔍 Похожие ячейки найдены:`, similarCells);
                      }
                    }
                    
                  } catch (error) {
                    console.error('❌ === ОШИБКА ПРИ ОЗВУЧКЕ ===', error);
                    console.error('📍 Место ошибки:', error.stack);
                  }
                  
                } else {
                  console.log(`❌ === ЗАКАЗ НЕ НАЙДЕН ===`);
                  console.log(`📱 Искали по номеру: "${phoneNumber}"`);
                }
                
                console.log('🏁 === ОБРАБОТКА ПОИСКА ЗАВЕРШЕНА ===');
                
                // Вызываем оригинальную функцию
                onPhoneSubmit(phoneNumber);
              }}
              disabled={phoneNumber.length !== 4}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                phoneNumber.length === 4
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Найти заказ
            </button>
          </div>
        </div>
        
        {/* Кнопки диагностики озвучки */}
        <AudioTestButton />
      </div>
    );
  }

  if (activeTab === 'acceptance') {
    return (
      <AcceptanceTab 
        playAudio={playAudio || (() => {})} 
        customAudioFiles={customAudioFiles || {}} 
      />
    );
  }

  if (activeTab === 'returns') {
    return (
      <ReturnsTab 
        playAudio={playAudio || (() => {})} 
        customAudioFiles={customAudioFiles || {}} 
      />
    );
  }

  return null;
};

export default TabContent;