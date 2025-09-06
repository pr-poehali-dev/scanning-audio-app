import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Order } from '@/data/mockOrders';
import { DeliveryHeader } from './delivery/DeliveryHeader';
import { DeliveryCell } from './delivery/DeliveryCell';
import { AudioDiagnostics } from './delivery/AudioDiagnostics';
import { ProductsSection } from './delivery/ProductsSection';
import { DeliveryFooter } from './delivery/DeliveryFooter';

interface DeliveryInterfaceProps {
  order: Order | null;
  onCellClick: (cellNumber: string) => void;
  onScanProduct: () => void;
  onDeliverProduct: () => void;
  isProductScanned: boolean;
  scannedData: string;
  deliveryStep?: string;
}

const DeliveryInterface = ({
  order,
  onCellClick,
  onScanProduct,
  onDeliverProduct,
  isProductScanned,
  scannedData,
  deliveryStep = 'client-scanned'
}: DeliveryInterfaceProps) => {
  const [selectedCell, setSelectedCell] = useState<string>(order?.cellNumber || '');

  if (!order) {
    return (
      <div className="text-center py-8">
        <Icon name="AlertCircle" size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Заказ не найден</p>
      </div>
    );
  }

  const handleCellClick = (cellNumber: string) => {
    setSelectedCell(cellNumber);
    onCellClick(cellNumber);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <DeliveryHeader order={order} />
      
      <DeliveryCell 
        order={order}
        selectedCell={selectedCell}
        onCellClick={handleCellClick}
      />
      
      <AudioDiagnostics order={order} />

      <ProductsSection
        order={order}
        isProductScanned={isProductScanned}
        scannedData={scannedData}
        onScanProduct={onScanProduct}
        onDeliverProduct={onDeliverProduct}
      />

      <DeliveryFooter 
        order={order}
        deliveryStep={deliveryStep}
      />
    </div>
  );
};

export default DeliveryInterface;