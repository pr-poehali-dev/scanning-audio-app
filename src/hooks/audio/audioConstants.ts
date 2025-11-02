export const AUDIO_FILE_MAP: { [key: string]: string } = {
  'delivery-cell-info': '/audio/cell-info.mp3',
  'delivery-scan-items': '/audio/scan-items.mp3',
  'delivery-check-product': '/audio/check-product.mp3',
  'delivery-thanks': '/audio/thanks.mp3',
  'receiving-start': '/audio/receiving-start.mp3',
  'receiving-scan': '/audio/receiving-scan.mp3',
  'receiving-next': '/audio/receiving-next.mp3',
  'receiving-complete': '/audio/receiving-complete.mp3',
  'return-start': '/audio/return-start.mp3',
  'return-scan-product': '/audio/return-scan.mp3',
  'return-confirm': '/audio/return-confirm.mp3',
  'return-success': '/audio/return-success.mp3',
};

export const getKeyMapping = (variant: 'v1' | 'v2'): { [key: string]: string } => ({
  'delivery-cell-info': variant === 'v1' ? 'goods' : 'checkWBWallet',
  'delivery-check-product': variant === 'v1' ? 'please_check_good_under_camera' : 'scanAfterQrClient',
  'check-product-under-camera': variant === 'v1' ? 'please_check_good_under_camera' : 'scanAfterQrClient',
  'delivery-thanks': variant === 'v1' ? 'thanks_for_order_rate_pickpoint' : 'askRatePickPoint',
});
