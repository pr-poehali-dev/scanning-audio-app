export interface OrderItem {
  id: string;
  name: string;
  barcode: string;
  color: string;
  size: string;
  image: string;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  status: 'in_storage' | 'ready_for_pickup' | 'picked_up';
  cellNumber: string;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export const getOrderStatusText = (status: Order['status']) => {
  switch (status) {
    case 'in_storage':
      return { text: 'На складе', color: 'text-yellow-600' };
    case 'ready_for_pickup':
      return { text: 'Готов к выдаче', color: 'text-green-600' };
    case 'picked_up':
      return { text: 'Выдан', color: 'text-gray-600' };
    default:
      return { text: 'Неизвестно', color: 'text-gray-600' };
  }
};

export const mockOrders: Order[] = [
  {
    id: '1',
    customerName: 'Елена Иванова',
    phone: '+7 (999) 888-75-89',
    status: 'ready_for_pickup',
    cellNumber: '44',
    items: [
      {
        id: '164667827_7911_1',
        name: 'Zeyd / Худи оверсайз с начесом женский бежевый',
        barcode: '48758785940',
        color: 'голубой',
        size: 'M',
        image: 'https://cdn.poehali.dev/files/e4031ba8-8735-47d2-90a6-e66749390613.png',
        price: 1935
      },
      {
        id: '164667827_7911_2',
        name: 'Zeyd / Худи оверсайз с начесом женский бежевый дубль',
        barcode: '48758785940',
        color: 'голубой',
        size: 'M',
        image: 'https://cdn.poehali.dev/files/e4031ba8-8735-47d2-90a6-e66749390613.png',
        price: 1935
      },
      {
        id: '164667827_4569',
        name: 'ТЕЛОДВИЖЕНИЯ / Лонгслив женский костюм спортивный',
        barcode: '48758785940',
        color: 'бежевый',
        size: 'M',
        image: 'https://cdn.poehali.dev/files/e4031ba8-8735-47d2-90a6-e66749390613.png',
        price: 1497
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: '2',
    customerName: 'Анна Смирнова',
    phone: '+7 (985) 765-43-21',
    status: 'ready_for_pickup',
    cellNumber: '156',
    items: [
      {
        id: 'sport_hoodie_1',
        name: 'Спортивное худи оверсайз женское',
        barcode: '7891234567890',
        color: 'Серый меланж',
        size: 'L',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop',
        price: 2499
      },
      {
        id: 'denim_jacket_1',
        name: 'Куртка джинсовая женская классическая',
        barcode: '1122334455667',
        color: 'Синий',
        size: 'M',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop',
        price: 3299
      }
    ],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    customerName: 'Дмитрий Волков',
    phone: '+7 (912) 555-88-99',
    status: 'ready_for_pickup',
    cellNumber: '234',
    items: [
      {
        id: 'sneakers_nike_1',
        name: 'Nike Air Max кроссовки спортивные',
        barcode: '9988776655443',
        color: 'Белый/Черный',
        size: '42',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
        price: 12999
      },
      {
        id: 'tshirt_adidas_1',
        name: 'Adidas футболка спортивная мужская',
        barcode: '5544332211009',
        color: 'Черный',
        size: 'L',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
        price: 2299
      }
    ],
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: '4',
    customerName: 'Елена Козлова',
    phone: '+7 (903) 222-11-44',
    status: 'ready_for_pickup',
    cellNumber: '345',
    items: [
      {
        id: 'dress_summer_1',
        name: 'Платье летнее миди с принтом',
        barcode: '3344556677889',
        color: 'Цветочный принт',
        size: 'S',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop',
        price: 2799
      },
      {
        id: 'bag_leather_1',
        name: 'Сумка женская кожаная классическая',
        barcode: '6677889900112',
        color: 'Коричневый',
        size: 'Средний',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
        price: 5999
      },
      {
        id: 'shoes_heels_1',
        name: 'Туфли женские на каблуке',
        barcode: '7788990011223',
        color: 'Черный',
        size: '37',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop',
        price: 4299
      }
    ],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-13')
  },
  {
    id: '5',
    customerName: 'Максим Орлов',
    phone: '+7 (926) 777-33-66',
    status: 'ready_for_pickup',
    cellNumber: '89',
    items: [
      {
        id: 'backpack_urban_1',
        name: 'Рюкзак городской водонепроницаемый',
        barcode: '2233445566778',
        color: 'Темно-синий',
        size: '25л',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
        price: 3799
      },
      {
        id: 'watch_smart_1',
        name: 'Смарт-часы спортивные водостойкие',
        barcode: '9900112233445',
        color: 'Черный',
        size: 'Universal',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
        price: 8999
      }
    ],
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-12')
  }
];

// Функция поиска заказа по последним 4 цифрам телефона
export const findOrderByPhone = (lastFourDigits: string): Order | null => {
  console.log('Поиск заказа по цифрам:', lastFourDigits);
  const order = mockOrders.find(order => {
    const phoneDigits = order.phone.replace(/\D/g, '').slice(-4);
    console.log(`Сравниваем ${phoneDigits} с ${lastFourDigits} для ${order.customerName}`);
    return phoneDigits === lastFourDigits;
  });
  if (order) {
    console.log('Найден заказ:', order.customerName, 'Ячейка:', order.cellNumber);
  } else {
    console.log('Заказ не найден');
  }
  return order || null;
};