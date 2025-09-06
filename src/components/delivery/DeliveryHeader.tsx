import { Order, getOrderStatusText } from '@/data/mockOrders';

interface DeliveryHeaderProps {
  order: Order;
}

export const DeliveryHeader = ({ order }: DeliveryHeaderProps) => {
  const orderStatus = getOrderStatusText(order.status);

  return (
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-bold text-gray-900">Выдача</h2>
      <div className="space-y-1">
        <p className="text-gray-600">Клиент: <span className="font-medium">{order.customerName}</span></p>
        <p className="text-gray-600">Телефон: <span className="font-medium">{order.phone}</span></p>
        <p className="text-sm">
          Статус: <span className={`font-medium ${orderStatus.color}`}>{orderStatus.text}</span>
        </p>
      </div>
    </div>
  );
};