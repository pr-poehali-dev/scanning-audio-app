import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation = ({ tabs, activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto">
        <div className="flex">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`
                relative rounded-none border-b-2 h-auto py-4 px-6 flex items-center space-x-3
                ${activeTab === tab.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon name={tab.icon as any} className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <Badge 
                  variant={activeTab === tab.id ? "default" : "secondary"} 
                  className={`
                    ml-2 min-w-[20px] h-5 text-xs px-1.5 rounded-full
                    ${activeTab === tab.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                    }
                  `}
                >
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};