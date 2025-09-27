import React, { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';

interface VoiceVariantUploaderProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceVariantUploader: React.FC<VoiceVariantUploaderProps> = ({ isOpen, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const variant1InputRef = useRef<HTMLInputElement>(null);
  const variant2InputRef = useRef<HTMLInputElement>(null);

  const handleVariantUpload = async (variantNumber: 1 | 2, files: FileList) => {
    setUploading(true);
    setUploadProgress(`Загружаю вариант ${variantNumber}...`);
    
    const base64Files: { [key: string]: string } = {};
    let processedCount = 0;
    
    const variantName = variantNumber === 1 ? 'Стандартная' : 'Альтернативная';
    console.log(`🎭 === ЗАГРУЗКА ${variantName.toUpperCase()} ОЗВУЧКИ ===`);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('audio/')) {
        console.warn(`⚠️ Пропущен не-аудио файл: ${file.name}`);
        continue;
      }
      
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        const baseFileName = file.name.replace(/\.[^/.]+$/, '');
        console.log(`📂 Обрабатываю файл: ${baseFileName}`);
        
        // Сохраняем исходный файл
        base64Files[baseFileName] = base64;
        
        // ОБРАБОТКА ЯЧЕЕК (числовые файлы 1-482)
        if (/^\d+$/.test(baseFileName)) {
          const cellNumber = baseFileName;
          base64Files[cellNumber] = base64;
          base64Files[`cell-${cellNumber}`] = base64;
          base64Files[`ячейка-${cellNumber}`] = base64;
          console.log(`🏠 ЯЧЕЙКА ${cellNumber}: сохранена`);
        }
        
        // ВАРИАНТ 1: Стандартная озвучка
        if (variantNumber === 1) {
          // товары со скидкой проверьте вб кошелек
          if (baseFileName.toLowerCase().includes('товары') && 
              (baseFileName.toLowerCase().includes('скидк') || 
               baseFileName.toLowerCase().includes('вб') || 
               baseFileName.toLowerCase().includes('кошелек'))) {
            base64Files['discount'] = base64;
            base64Files['товары со скидкой'] = base64;
            base64Files['Товары со скидкой проверьте ВБ кошелек'] = base64;
            console.log(`🛍️ СКИДКИ: ${baseFileName}`);
          }
          
          // проверьте товар под камерой
          if (baseFileName.toLowerCase().includes('проверьте') && 
              baseFileName.toLowerCase().includes('товар') && 
              baseFileName.toLowerCase().includes('камер')) {
            base64Files['check-product-camera'] = base64;
            base64Files['проверьте товар под камерой'] = base64;
            base64Files['Проверьте товар под камерой'] = base64;
            console.log(`📷 ПРОВЕРКА ТОВАРА: ${baseFileName}`);
          }
          
          // пожалуйста оцените наш пункт выдачи в приложении
          if ((baseFileName.toLowerCase().includes('пожалуйста') || 
               baseFileName.toLowerCase().includes('оцените')) && 
              baseFileName.toLowerCase().includes('пункт') && 
              baseFileName.toLowerCase().includes('выдачи')) {
            base64Files['rate-pvz'] = base64;
            base64Files['оцените пвз'] = base64;
            base64Files['Пожалуйста оцените наш пункт выдачи в приложении'] = base64;
            console.log(`⭐ ОЦЕНКА ПВЗ: ${baseFileName}`);
          }
        }
        
        // ВАРИАНТ 2: Альтернативная озвучка
        if (variantNumber === 2) {
          // error_sound
          if (baseFileName.toLowerCase().includes('error') || 
              baseFileName.toLowerCase().includes('ошибк')) {
            base64Files['error_sound'] = base64;
            base64Files['error-sound'] = base64;
            base64Files['ошибка'] = base64;
            console.log(`❌ ERROR SOUND: ${baseFileName}`);
          }
          
          // goods цифра
          if (baseFileName.toLowerCase().includes('goods') || 
              (baseFileName.toLowerCase().includes('цифра') && 
               baseFileName.toLowerCase().includes('товар'))) {
            base64Files['goods'] = base64;
            base64Files['goods-digit'] = base64;
            base64Files['цифра товаров'] = base64;
            console.log(`🔢 GOODS: ${baseFileName}`);
          }
          
          // payment_on_delivery
          if (baseFileName.toLowerCase().includes('payment_on_delivery') || 
              baseFileName.toLowerCase().includes('оплата при получении')) {
            base64Files['payment_on_delivery'] = base64;
            base64Files['cash-on-delivery'] = base64;
            base64Files['оплата при получении'] = base64;
            console.log(`💰 PAYMENT ON DELIVERY: ${baseFileName}`);
          }
          
          // please_check_good_under_camera
          if (baseFileName.toLowerCase().includes('please_check_good_under_camera') || 
              (baseFileName.toLowerCase().includes('проверьте') && 
               baseFileName.toLowerCase().includes('товар') && 
               baseFileName.toLowerCase().includes('камер'))) {
            base64Files['please_check_good_under_camera'] = base64;
            base64Files['check-product-camera'] = base64;
            base64Files['проверьте товар под камерой'] = base64;
            console.log(`📷 CHECK GOOD UNDER CAMERA: ${baseFileName}`);
          }
          
          // thanks_for_order_rate_pickpoint
          if (baseFileName.toLowerCase().includes('thanks_for_order_rate_pickpoint') || 
              (baseFileName.toLowerCase().includes('спасибо') && 
               baseFileName.toLowerCase().includes('заказ'))) {
            base64Files['thanks_for_order_rate_pickpoint'] = base64;
            base64Files['thanks'] = base64;
            base64Files['спасибо за заказ оцените пункт выдачи'] = base64;
            console.log(`🙏 THANKS FOR ORDER: ${baseFileName}`);
          }
        }
        
        processedCount++;
        setUploadProgress(`Обработано файлов: ${processedCount}/${files.length}`);
        
      } catch (error) {
        console.error(`❌ Ошибка обработки файла ${file.name}:`, error);
      }
    }
    
    // СОХРАНЯЕМ В LOCALSTORAGE НАВСЕГДА
    try {
      const storageKey = `wb-voice-variant-${variantNumber}-permanent`;
      localStorage.setItem(storageKey, JSON.stringify(base64Files));
      
      // Также сохраняем в основную систему озвучки
      const existingAudio = JSON.parse(localStorage.getItem('wb-audio-files') || '{}');
      const mergedAudio = { ...existingAudio, ...base64Files };
      localStorage.setItem('wb-audio-files', JSON.stringify(mergedAudio));
      
      // И в пуленепробиваемую систему
      localStorage.setItem('bulletproof-audio-system', JSON.stringify(base64Files));
      
      console.log(`💾 ${variantName} ОЗВУЧКА СОХРАНЕНА НАВСЕГДА!`);
      console.log(`📊 Всего файлов: ${Object.keys(base64Files).length}`);
      
      setUploadProgress(`✅ ${variantName} озвучка загружена! Файлов: ${Object.keys(base64Files).length}`);
      
      // Обновляем страницу через 2 секунды для применения изменений
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
      setUploadProgress('❌ Ошибка сохранения файлов');
    }
    
    setUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Загрузка вариантов озвучки
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={uploading}
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Статус загрузки */}
          {uploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 font-medium">{uploadProgress}</span>
              </div>
            </div>
          )}

          {/* ВАРИАНТ 1 */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎵 Вариант 1: Стандартная озвучка
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Последовательность озвучки:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>1. 📱 Сканирование → 🏠 номер ячейки (1.mp3, 2.mp3...482.mp3)</div>
                <div>2. 🛍️ товары со скидкой проверьте вб кошелек.mp3</div>
                <div>3. 📱 Сканирование товара → 📷 проверьте товар под камерой.mp3</div>
                <div>4. ✅ После выдачи → ⭐ пожалуйста оцените наш пункт выдачи в приложении.mp3</div>
              </div>
            </div>
            
            <button
              onClick={() => variant1InputRef.current?.click()}
              disabled={uploading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center space-x-2 text-sm font-medium"
            >
              <Icon name="Upload" size={16} />
              <span>Загрузить файлы варианта 1</span>
            </button>
          </div>

          {/* ВАРИАНТ 2 */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎵 Вариант 2: Альтернативная озвучка
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Последовательность озвучки:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>1. 📱 Сканирование → ❌ error_sound.mp3 → 🏠 номер ячейки (1.mp3, 2.mp3...482.mp3)</div>
                <div>2. 🔢 goods.mp3 (цифра товаров) → 💰 payment_on_delivery.mp3</div>
                <div>3. 📱 Сканирование товара → 📷 please_check_good_under_camera.mp3</div>
                <div>4. ✅ После выдачи → 🙏 thanks_for_order_rate_pickpoint.mp3</div>
              </div>
            </div>
            
            <button
              onClick={() => variant2InputRef.current?.click()}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center space-x-2 text-sm font-medium"
            >
              <Icon name="Upload" size={16} />
              <span>Загрузить файлы варианта 2</span>
            </button>
          </div>

          {/* Инструкции */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">📋 Инструкции по загрузке:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>• Выберите ВСЕ MP3 файлы сразу (ячейки 1-482 + системные звуки)</div>
              <div>• Файлы ячеек: 1.mp3, 2.mp3, 3.mp3...482.mp3</div>
              <div>• Системные звуки: называйте файлы по смыслу (например: "товары со скидкой.mp3")</div>
              <div>• После загрузки страница автоматически перезагрузится</div>
              <div>• Файлы сохраняются навсегда в браузере</div>
            </div>
          </div>
        </div>

        {/* Скрытые input'ы */}
        <input
          ref={variant1InputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleVariantUpload(1, e.target.files);
            }
          }}
          className="hidden"
        />
        
        <input
          ref={variant2InputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleVariantUpload(2, e.target.files);
            }
          }}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default VoiceVariantUploader;