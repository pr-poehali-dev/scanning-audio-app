import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';

interface AppHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AppHeader = ({ sidebarOpen, setSidebarOpen }: AppHeaderProps) => {
  const sidebarMenuItems = [
    { icon: 'Package', label: 'Товары', id: 'products', badge: '150' },
    { icon: 'RefreshCw', label: 'Смена ячейки', id: 'change-cell' },
    { icon: 'RotateCcw', label: 'Принять снова', id: 'reaccept', badge: '9' }
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">wb</span>
            </div>
            <div className="text-sm text-gray-500">
              <div>ID 50001234</div>
              <div>v1.0.51</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Icon name="Menu" className="text-gray-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="py-6">
                  <h3 className="text-lg font-semibold mb-4">Меню</h3>
                  <div className="space-y-2">
                    {sidebarMenuItems.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon name={item.icon} className="mr-3" />
                        {item.label}
                        {item.badge && (
                          <Badge className="ml-auto bg-purple-100 text-purple-700">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="sm">
              <Icon name="Package" className="text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="Search" className="text-gray-600" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">6</Badge>
              <Badge variant="secondary" className="bg-gray-100">12</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Icon name="MoreHorizontal" />
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="RefreshCw" />
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="MessageCircle" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};