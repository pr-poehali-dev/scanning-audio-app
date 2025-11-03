export const buildDeliveryCellInfoSequence = (
  currentFiles: { [key: string]: string },
  variant: 'v1' | 'v2',
  cellNumber: number,
  itemCount?: number
): string[] => {
  const audioSequence: string[] = [];
  
  const cellKey = `cell_${variant}_${cellNumber}`;
  const cellAudio = currentFiles[cellKey];
  
  const goodsKey = variant === 'v1' ? 'goods' : 'checkWBWallet';
  const goodsAudio = currentFiles[goodsKey];
  
  const paymentKey = variant === 'v1' ? 'payment_on_delivery' : null;
  const paymentAudio = paymentKey ? currentFiles[paymentKey] : null;

  let itemCountAudio = null;
  if (itemCount !== undefined && itemCount > 0) {
    // Используем озвучку номера ячейки для количества товаров
    const countKey = `cell_${variant}_${itemCount}`;
    itemCountAudio = currentFiles[countKey];
  }

  if (variant === 'v1') {
    if (cellAudio) audioSequence.push(cellAudio);
    if (goodsAudio) audioSequence.push(goodsAudio);
    if (itemCountAudio) audioSequence.push(itemCountAudio);
    if (paymentAudio) audioSequence.push(paymentAudio);
  } else {
    if (cellAudio) audioSequence.push(cellAudio);
    if (goodsAudio) audioSequence.push(goodsAudio);
    if (itemCountAudio) audioSequence.push(itemCountAudio);
  }

  console.log('🎵 Составная озвучка:', {
    variant,
    cellKey,
    cell: !!cellAudio,
    goodsKey,
    goods: !!goodsAudio,
    paymentKey,
    payment: !!paymentAudio,
    itemCount: !!itemCountAudio,
    total: audioSequence.length
  });

  return audioSequence;
};

export const buildThanksSequence = (
  currentFiles: { [key: string]: string },
  variant: 'v1' | 'v2'
): string[] => {
  const audioSequence: string[] = [];
  
  if (variant === 'v1') {
    const successSound = currentFiles['success_sound'];
    const thanksAudio = currentFiles['thanks_for_order_rate_pickpoint'];
    
    if (successSound) audioSequence.push(successSound);
    if (thanksAudio) audioSequence.push(thanksAudio);
  } else {
    const askRate = currentFiles['askRatePickPoint'];
    if (askRate) audioSequence.push(askRate);
  }
  
  return audioSequence;
};

export const buildQuantitySequence = (
  currentFiles: { [key: string]: string },
  quantity: number
): string[] => {
  const audioSequence: string[] = [];
  
  const quantityTextKey = 'quantity_text';
  const quantityTextAudio = currentFiles[quantityTextKey];
  
  const numberKey = `number_${quantity}`;
  const numberAudio = currentFiles[numberKey];
  
  console.log(`🔍 Ищу файлы: ${quantityTextKey} (${quantityTextAudio ? 'есть' : 'нет'}), ${numberKey} (${numberAudio ? 'есть' : 'нет'})`);
  
  if (quantityTextAudio) audioSequence.push(quantityTextAudio);
  if (numberAudio) audioSequence.push(numberAudio);
  
  return audioSequence;
};

export const buildReceptionSequence = (
  currentFiles: { [key: string]: string },
  variant: 'v1' | 'v2',
  cellNumber: number
): string[] => {
  const audioSequence: string[] = [];
  
  const cellKey = `cell_${variant}_${cellNumber}`;
  const cellAudio = currentFiles[cellKey];
  
  const boxAcceptedAudio = currentFiles['box_accepted'];
  
  if (cellAudio) audioSequence.push(cellAudio);
  if (boxAcceptedAudio) audioSequence.push(boxAcceptedAudio);
  
  return audioSequence;
};