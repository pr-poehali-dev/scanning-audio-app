import Icon from '@/components/ui/icon';

interface LeftSidebarProps {
  pvzInfo: {
    id: string;
    address: string;
    employeeId: string;
  };
}

const LeftSidebar = ({ pvzInfo }: LeftSidebarProps) => {
  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-full w-[140px] bg-white shadow-lg z-30 flex-col">
      <div className="flex flex-col items-center p-4 gap-3 border-b">
        <img 
          src="https://cdn.poehali.dev/files/be8acfbd-86e8-4684-a4ea-c81b413adb99.png" 
          alt="WB ПВЗ" 
          className="w-16 h-16 object-contain"
        />
        <div className="text-center">
          <div className="text-xs text-gray-500">ID {pvzInfo.id || '50001234'}</div>
          <div className="text-xs text-gray-400">V.1.0.51</div>
        </div>
      </div>

      <div className="flex-1 bg-purple-600 flex items-start justify-center pt-6">
        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Icon name="User" size={24} className="text-purple-600" />
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;