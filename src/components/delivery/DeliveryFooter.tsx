import Icon from '@/components/ui/icon';
import { Order } from '@/data/mockOrders';

interface DeliveryFooterProps {
  order: Order;
  deliveryStep: string;
}

export const DeliveryFooter = ({ order, deliveryStep }: DeliveryFooterProps) => {
  return (
    <>
      {/* Сообщение о выдаче */}
      {deliveryStep === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <Icon name="CheckCircle" size={48} className="text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">Товар выдан!</h3>
          <p className="text-green-700">Не забудьте попросить клиента оценить пункт выдачи в приложении</p>
        </div>
      )}
    </>
  );
};