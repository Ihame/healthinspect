import React from 'react';
import { 
  Home, 
  Building2, 
  ClipboardList, 
  FileText, 
  AlertTriangle,
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserPermissions } from '../../utils/permissions';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const permissions = currentUser ? getUserPermissions(currentUser) : null;

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      show: permissions?.canViewDashboard || false 
    },
    { 
      id: 'facility-management', 
      label: 'Manage Facilities', 
      icon: Settings, 
      show: permissions?.canAddFacilities || permissions?.canEditFacilities || false 
    },
    { 
      id: 'inspections', 
      label: 'Inspections', 
      icon: ClipboardList, 
      show: permissions?.canViewInspections || false 
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: FileText, 
      show: permissions?.canViewReports || false 
    },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: Users, 
      show: permissions?.canViewUsers || false 
    },
  ];

  const filteredMenuItems = menuItems.filter(item => item.show);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile backdrop - only show on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - Always visible on desktop, toggleable on mobile */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:shadow-none lg:z-auto
        w-64 border-r border-gray-200 overflow-y-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">HealthInspect</h1>
                <p className="text-sm text-gray-600">Rwanda</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 space-y-1 sm:space-y-2 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    // Only close sidebar on mobile
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`
                    w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-500' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-3 sm:p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-600 capitalize truncate">{currentUser?.role.replace('_', ' ')}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 sm:px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3 text-gray-500" />
              <span className="text-sm sm:text-base">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;