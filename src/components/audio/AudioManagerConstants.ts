export const BASIC_FILES_V1 = [
  { key: 'goods', label: 'Файл "goods.mp3" - озвучка товары', testKey: 'delivery-cell-info' },
  { key: 'payment_on_delivery', label: 'Файл "payment_on_delivery.mp3" - оплата при получении', testKey: 'delivery-cell-info' },
  { key: 'please_check_good_under_camera', label: 'Файл "please_check_good_under_camera.mp3" - проверьте товар', testKey: 'check-product-under-camera' },
  { key: 'thanks_for_order_rate_pickpoint', label: 'Файл "thanks_for_order_rate_pickpoint.mp3" - спасибо за заказ', testKey: 'delivery-thanks' },
  { key: 'success_sound', label: 'Файл "success_sound.mp3" - звук успеха', testKey: 'delivery-thanks' },
];

export const BASIC_FILES_V2 = [
  { key: 'checkWBWallet', label: 'Файл "checkWBWallet.mp3" - проверьте WB кошелёк', testKey: 'delivery-cell-info' },
  { key: 'scanAfterQrClient', label: 'Файл "scanAfterQrClient.mp3" - отсканируйте после QR клиента', testKey: 'delivery-cell-info' },
  { key: 'askRatePickPoint', label: 'Файл "askRatePickPoint.mp3" - оцените пункт выдачи', testKey: 'delivery-thanks' },
  { key: 'box_accepted', label: 'Файл "box_accepted.mp3" - коробка принята', testKey: 'box_accepted' },
  { key: 'quantity_text', label: 'Файл "quantity_text.mp3" - количество товаров', testKey: 'quantity-announcement' },
];

export const NUMBER_FILES = Array.from({ length: 10 }, (_, i) => ({
  key: `number_${i + 1}`,
  label: `Файл "number_${i + 1}.mp3" - число ${i + 1}`,
  testKey: 'quantity-announcement'
}));

export const COUNT_FILES = Array.from({ length: 20 }, (_, i) => ({
  key: `count_${i + 1}`,
  label: `Файл "count_${i + 1}.mp3" - количество ${i + 1}`,
  testKey: 'delivery-cell-info'
}));

export const getBasicFiles = (variant: 'v1' | 'v2') => variant === 'v1' ? BASIC_FILES_V1 : BASIC_FILES_V2;

export const getCellFiles = (variant: 'v1' | 'v2') => Array.from({ length: 482 }, (_, i) => ({
  key: `cell_${variant}_${i + 1}`,
  label: `Файл "cell_${variant}_${i + 1}.mp3" - ячейка ${i + 1}`,
  testKey: 'delivery-cell-info'
}));
