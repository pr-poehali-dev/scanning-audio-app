export const AUDIO_FILES = {
  delivery: {
    cellInfo: '/audio/cell-info.mp3',
    checkProduct: '/audio/check-product.mp3', 
    thanks: '/audio/thanks.mp3',
  },
  receiving: {
    start: '/audio/receiving-start.mp3',
    scan: '/audio/receiving-scan.mp3',
    next: '/audio/receiving-next.mp3',
    complete: '/audio/receiving-complete.mp3',
  },
  return: {
    start: '/audio/return-start.mp3',
    scan: '/audio/return-scan.mp3',
    confirm: '/audio/return-confirm.mp3',
    success: '/audio/return-success.mp3',
  },
} as const;

export const AUDIO_EVENTS = {
  CELL_INFO: 'cell-info',
  CHECK_PRODUCT: 'check-product',
  THANKS: 'thanks',
  RECEIVING_START: 'receiving-start',
  RECEIVING_SCAN: 'receiving-scan',
  RECEIVING_NEXT: 'receiving-next',
  RECEIVING_COMPLETE: 'receiving-complete',
  RETURN_START: 'return-start',
  RETURN_SCAN: 'return-scan',
  RETURN_CONFIRM: 'return-confirm',
  RETURN_SUCCESS: 'return-success',
} as const;
