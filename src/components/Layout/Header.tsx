import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, title }) => {
  const { currentUser } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="ml-4 lg:ml-0">
          <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">{title}</h1>
          <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">
            Ministry of Health - Rwanda
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* Search - Hidden on mobile to save space */}
        <div className="hidden xl:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search facilities..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm w-64"
            />
          </div>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-red-500 rounded-full"></span>
        </button>

        {/* User avatar */}
        <div className="flex items-center">
          <div className="w-7 h-7 lg:w-8 lg:h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-xs lg:text-sm font-medium text-white">
              {currentUser?.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="ml-2 lg:ml-3 hidden lg:block">
            <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
            <p className="text-xs text-gray-600 capitalize truncate">{currentUser?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;