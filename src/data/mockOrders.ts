export interface OrderItem {
  id: string;
  name: string;
  barcode: string;
  color: string;
  size: string;
  image: string;
  price: number;
  brand?: string;
  statusBadge?: string;
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
  totalAmount?: number;
  isActive?: boolean;
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

const calculateTotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

export const mockOrders: Order[] = [
  {
    id: '1',
    customerName: 'Елена Иванова',
    phone: '+7 (999) 123-45-67',
    status: 'ready_for_pickup',
    cellNumber: '44',
    items: [
      {
        id: 'hoodie_beige_1',
        name: 'Zeyd / Худи оверсайз с начесом женский',
        barcode: '48758785940',
        color: 'Бежевый',
        size: 'M',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop',
        price: 1935,
        brand: 'Zeyd'
      },
      {
        id: 'sportsuit_longsleeve_1',
        name: 'ТЕЛОДВИЖЕНИЯ / Лонгслив женский костюм спортивный',
        barcode: '48758785941',
        color: 'Серый',
        size: 'M',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
        price: 1497,
        brand: 'ТЕЛОДВИЖЕНИЯ'
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
        id: 'vitamins_multivit_1',
        name: 'Витамины Мультивит комплекс №60',
        barcode: '7891234567890',
        color: 'Без цвета',
        size: '60 капс',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
        price: 899,
        brand: 'Эвалар'
      },
      {
        id: 'medicine_painkiller_1',
        name: 'Нурофен Экспресс Нео 200мг №12',
        barcode: '1122334455667',
        color: 'Без цвета',
        size: '12 таб',
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop',
        price: 289
      },
      {
        id: 'thermometer_digital_1',
        name: 'Термометр электронный медицинский',
        barcode: '1122334455668',
        color: 'Белый',
        size: 'Стандарт',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
        price: 549
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
        id: 'coffee_lavazza_1',
        name: 'Lavazza Crema E Gusto кофе зерновой 1кг',
        barcode: '9988776655443',
        color: 'Без цвета',
        size: '1 кг',
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&h=200&fit=crop',
        price: 1299,
        brand: 'Lavazza'
      },
      {
        id: 'chocolate_milka_1',
        name: 'Milka шоколад молочный альпийский 90г',
        barcode: '5544332211009',
        color: 'Без цвета',
        size: '90 г',
        image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=200&h=200&fit=crop',
        price: 119,
        brand: 'Milka'
      },
      {
        id: 'pasta_barilla_1',
        name: 'Barilla спагетти №5 500г',
        barcode: '5544332211010',
        color: 'Без цвета',
        size: '500 г',
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop',
        price: 189,
        brand: 'Barilla'
      }
    ],
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: '4',
    customerName: 'Мария Петрова',
    phone: '+7 (903) 222-11-44',
    status: 'ready_for_pickup',
    cellNumber: '345',
    items: [
      {
        id: 'chair_office_1',
        name: 'Кресло офисное эргономичное с подлокотниками',
        barcode: '3344556677889',
        color: 'Черный',
        size: 'Стандарт',
        image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=200&h=200&fit=crop',
        price: 8999,
        brand: 'Бюрократ'
      },
      {
        id: 'lamp_desk_1',
        name: 'Лампа настольная LED с регулировкой яркости',
        barcode: '6677889900112',
        color: 'Белый',
        size: 'Средний',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&h=200&fit=crop',
        price: 2499
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
        id: 'sneakers_nike_1',
        name: 'Nike Air Max кроссовки спортивные',
        barcode: '2233445566778',
        color: 'Белый/Черный',
        size: '42',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
        price: 12999,
        brand: 'Nike'
      },
      {
        id: 'watch_smart_1',
        name: 'Apple Watch SE 2023 смарт-часы',
        barcode: '9900112233445',
        color: 'Черный',
        size: '44мм',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
        price: 32999,
        brand: 'Apple'
      }
    ],
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '6',
    customerName: 'Светлана Козлова',
    phone: '+7 (917) 444-55-77',
    status: 'ready_for_pickup',
    cellNumber: '67',
    items: [
      {
        id: 'dress_summer_1',
        name: 'Платье летнее миди с цветочным принтом',
        barcode: '3344556677890',
        color: 'Цветочный',
        size: 'S',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop',
        price: 2799
      },
      {
        id: 'sandals_leather_1',
        name: 'Сандалии женские кожаные на платформе',
        barcode: '3344556677891',
        color: 'Бежевый',
        size: '38',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop',
        price: 3499
      },
      {
        id: 'sunglasses_ray_1',
        name: 'Ray-Ban очки солнцезащитные авиаторы',
        barcode: '3344556677892',
        color: 'Золото',
        size: 'Universal',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop',
        price: 9999,
        brand: 'Ray-Ban'
      }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-11')
  },
  {
    id: '7',
    customerName: 'Игорь Соколов',
    phone: '+7 (905) 888-99-00',
    status: 'ready_for_pickup',
    cellNumber: '123',
    items: [
      {
        id: 'fridge_samsung_1',
        name: 'Samsung холодильник двухкамерный NoFrost 350л',
        barcode: '4455667788990',
        color: 'Серебристый',
        size: '180см',
        image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=200&h=200&fit=crop',
        price: 54999,
        brand: 'Samsung'
      },
      {
        id: 'microwave_lg_1',
        name: 'LG микроволновая печь с грилем 25л',
        barcode: '4455667788991',
        color: 'Черный',
        size: '25 л',
        image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=200&h=200&fit=crop',
        price: 8499,
        brand: 'LG'
      }
    ],
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '8',
    customerName: 'Ольга Морозова',
    phone: '+7 (915) 111-22-33',
    status: 'ready_for_pickup',
    cellNumber: '78',
    items: [
      {
        id: 'perfume_chanel_1',
        name: 'Chanel Coco Mademoiselle парфюмерная вода 100мл',
        barcode: '5566778899001',
        color: 'Без цвета',
        size: '100 мл',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop',
        price: 12999,
        brand: 'Chanel'
      },
      {
        id: 'cream_nivea_1',
        name: 'Nivea крем для лица увлажняющий 50мл',
        barcode: '5566778899002',
        color: 'Без цвета',
        size: '50 мл',
        image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop',
        price: 449,
        brand: 'Nivea'
      },
      {
        id: 'lipstick_mac_1',
        name: 'MAC помада матовая Ruby Woo',
        barcode: '5566778899003',
        color: 'Красный',
        size: '3 г',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&h=200&fit=crop',
        price: 2299,
        brand: 'MAC'
      }
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-09')
  },
  {
    id: '9',
    customerName: 'Артём Новиков',
    phone: '+7 (909) 333-44-55',
    status: 'ready_for_pickup',
    cellNumber: '201',
    items: [
      {
        id: 'laptop_asus_1',
        name: 'ASUS VivoBook ноутбук 15.6" i5/16GB/512GB',
        barcode: '6677889900113',
        color: 'Серый',
        size: '15.6"',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop',
        price: 64999,
        brand: 'ASUS'
      },
      {
        id: 'mouse_logitech_1',
        name: 'Logitech MX Master 3S беспроводная мышь',
        barcode: '6677889900114',
        color: 'Черный',
        size: 'Средний',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop',
        price: 8999,
        brand: 'Logitech'
      },
      {
        id: 'keyboard_keychron_1',
        name: 'Keychron K2 механическая клавиатура RGB',
        barcode: '6677889900115',
        color: 'Черный',
        size: '75%',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&h=200&fit=crop',
        price: 11999,
        brand: 'Keychron'
      }
    ],
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: '10',
    customerName: 'Екатерина Белова',
    phone: '+7 (925) 666-77-88',
    status: 'ready_for_pickup',
    cellNumber: '45',
    items: [
      {
        id: 'book_dostoevsky_1',
        name: 'Ф.М. Достоевский "Преступление и наказание"',
        barcode: '7788990011224',
        color: 'Без цвета',
        size: 'Стандарт',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=200&fit=crop',
        price: 599
      },
      {
        id: 'notebook_moleskine_1',
        name: 'Moleskine блокнот Classic в линейку A5',
        barcode: '7788990011225',
        color: 'Черный',
        size: 'A5',
        image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=200&h=200&fit=crop',
        price: 1299,
        brand: 'Moleskine'
      },
      {
        id: 'pen_parker_1',
        name: 'Parker ручка шариковая Jotter синяя',
        barcode: '7788990011226',
        color: 'Синий/Серебро',
        size: 'Стандарт',
        image: 'https://images.unsplash.com/photo-1565022536102-b2f7b4b26c1e?w=200&h=200&fit=crop',
        price: 899,
        brand: 'Parker'
      }
    ],
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-07')
  },
  {
    id: '11',
    customerName: 'Сергей Кузнецов',
    phone: '+7 (916) 222-33-44',
    status: 'ready_for_pickup',
    cellNumber: '167',
    items: [
      {
        id: 'drill_bosch_1',
        name: 'Bosch дрель-шуруповерт аккумуляторная 18V',
        barcode: '8899001122334',
        color: 'Зелено-черный',
        size: 'Средний',
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=200&h=200&fit=crop',
        price: 9999,
        brand: 'Bosch'
      },
      {
        id: 'toolbox_stanley_1',
        name: 'Stanley набор инструментов 120 предметов',
        barcode: '8899001122335',
        color: 'Черно-желтый',
        size: 'Большой',
        image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&h=200&fit=crop',
        price: 7999,
        brand: 'Stanley'
      }
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-06')
  },
  {
    id: '12',
    customerName: 'Наталья Федорова',
    phone: '+7 (919) 555-66-77',
    status: 'ready_for_pickup',
    cellNumber: '289',
    items: [
      {
        id: 'sofa_ikea_1',
        name: 'IKEA диван трехместный Ektorp серый',
        barcode: '9900112233446',
        color: 'Серый',
        size: '218см',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop',
        price: 39999,
        brand: 'IKEA'
      },
      {
        id: 'table_coffee_1',
        name: 'Журнальный столик стеклянный современный',
        barcode: '9900112233447',
        color: 'Черный/Стекло',
        size: '110x60см',
        image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=200&h=200&fit=crop',
        price: 8999
      },
      {
        id: 'carpet_modern_1',
        name: 'Ковер современный геометрический 200x300см',
        barcode: '9900112233448',
        color: 'Серо-белый',
        size: '200x300см',
        image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=200&h=200&fit=crop',
        price: 12999
      }
    ],
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: '13',
    customerName: 'Владимир Попов',
    phone: '+7 (910) 777-88-99',
    status: 'ready_for_pickup',
    cellNumber: '56',
    items: [
      {
        id: 'guitar_yamaha_1',
        name: 'Yamaha гитара акустическая F310',
        barcode: '1011121314151',
        color: 'Натуральное дерево',
        size: 'Стандарт',
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&h=200&fit=crop',
        price: 17999,
        brand: 'Yamaha'
      },
      {
        id: 'capo_dunlop_1',
        name: 'Dunlop каподастр для гитары',
        barcode: '1011121314152',
        color: 'Черный',
        size: 'Universal',
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop',
        price: 799,
        brand: 'Dunlop'
      }
    ],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-04')
  },
  {
    id: '14',
    customerName: 'Юлия Романова',
    phone: '+7 (921) 123-45-78',
    status: 'ready_for_pickup',
    cellNumber: '134',
    items: [
      {
        id: 'vacuum_dyson_1',
        name: 'Dyson пылесос беспроводной V11 Absolute',
        barcode: '2021222324252',
        color: 'Фиолетовый',
        size: 'Средний',
        image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=200&h=200&fit=crop',
        price: 49999,
        brand: 'Dyson'
      },
      {
        id: 'iron_philips_1',
        name: 'Philips утюг с паром Azur Elite',
        barcode: '2021222324253',
        color: 'Синий',
        size: 'Стандарт',
        image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop',
        price: 8999,
        brand: 'Philips'
      }
    ],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-03')
  },
  {
    id: '15',
    customerName: 'Алексей Лебедев',
    phone: '+7 (913) 999-00-11',
    status: 'ready_for_pickup',
    cellNumber: '92',
    items: [
      {
        id: 'jacket_north_1',
        name: 'The North Face куртка зимняя пуховик',
        barcode: '3031323334353',
        color: 'Черный',
        size: 'L',
        image: 'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=200&h=200&fit=crop',
        price: 24999,
        brand: 'The North Face'
      },
      {
        id: 'boots_timberland_1',
        name: 'Timberland ботинки зимние мужские',
        barcode: '3031323334354',
        color: 'Коричневый',
        size: '43',
        image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=200&h=200&fit=crop',
        price: 15999,
        brand: 'Timberland'
      },
      {
        id: 'gloves_winter_1',
        name: 'Перчатки мужские кожаные зимние утепленные',
        barcode: '3031323334355',
        color: 'Черный',
        size: 'L',
        image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=200&h=200&fit=crop',
        price: 2999
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02')
  }
];

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
