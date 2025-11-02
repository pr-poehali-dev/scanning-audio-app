export const filterFilesByVariant = (
  allFiles: { [key: string]: string },
  variant: 'v1' | 'v2'
): { [key: string]: string } => {
  const filtered: { [key: string]: string } = {};
  
  const v1Files = ['goods', 'payment_on_delivery', 'please_check_good_under_camera', 'thanks_for_order_rate_pickpoint', 'success_sound'];
  const v2Files = ['checkWBWallet', 'scanAfterQrClient', 'askRatePickPoint', 'box_accepted', 'quantity_text'];
  
  const allowedFiles = variant === 'v1' ? v1Files : v2Files;
  
  Object.keys(allFiles).forEach(key => {
    if (key.startsWith(`cell_${variant}_`)) {
      filtered[key] = allFiles[key];
    }
    else if (allowedFiles.includes(key)) {
      filtered[key] = allFiles[key];
    }
    else if (key.startsWith('count_')) {
      filtered[key] = allFiles[key];
    }
    else if (key.startsWith('number_')) {
      filtered[key] = allFiles[key];
    }
  });
  
  console.log(`🔍 Фильтрация для ${variant}:`, {
    всего: Object.keys(allFiles).length,
    отфильтровано: Object.keys(filtered).length,
    ячейки: Object.keys(filtered).filter(k => k.startsWith(`cell_${variant}_`)).length,
    базовые: Object.keys(filtered).filter(k => allowedFiles.includes(k)).length
  });
  
  console.log(`📋 Базовые файлы ${variant}:`, Object.keys(filtered).filter(k => allowedFiles.includes(k)));
  console.log(`🚫 Заблокированные файлы:`, Object.keys(allFiles).filter(k => !filtered[k]).slice(0, 10));
  
  return filtered;
};
