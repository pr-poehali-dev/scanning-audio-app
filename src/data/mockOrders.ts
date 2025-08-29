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
    customerName: 'Иван Петров',
    phone: '+7 (999) 123-45-67',
    status: 'ready_for_pickup',
    cellNumber: 'A12',
    items: [
      {
        id: '1',
        name: 'Smite / Футболка оверсайз спортивная',
        barcode: '4565676985879',
        color: 'Серый',
        size: 'XL',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
        price: 1299
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
    cellNumber: 'B05',
    items: [
      {
        id: '2',
        name: 'Zeyd / Худи оверсайз с начесом',
        barcode: '7891234567890',
        color: 'Небесный',
        size: 'L',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop',
        price: 2199
      },
      {
        id: '3',
        name: 'ТЕЛОДВИЖЕНИЯ / Лонгслив женский',
        barcode: '1122334455667',
        color: 'Бежевый',
        size: 'M',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop',
        price: 1599
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
    cellNumber: 'C07',
    items: [
      {
        id: '4',
        name: 'Кроссовки спортивные Nike',
        barcode: '9988776655443',
        color: 'Белый',
        size: '42',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
        price: 8999
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
    cellNumber: 'D13',
    items: [
      {
        id: '5',
        name: 'Платье летнее миди',
        barcode: '3344556677889',
        color: 'Розовый',
        size: 'S',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop',
        price: 2799
      },
      {
        id: '6',
        name: 'Сумка женская кожаная',
        barcode: '6677889900112',
        color: 'Черный',
        size: 'Средний',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
        price: 4599
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
    cellNumber: 'E09',
    items: [
      {
        id: '7',
        name: 'Рюкзак городской',
        barcode: '2233445566778',
        color: 'Синий',
        size: '20л',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
        price: 3299
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