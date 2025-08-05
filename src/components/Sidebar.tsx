import { Link } from 'react-router-dom';
import { useAuth } from '../authentication/AuthProvider';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  role: string;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  role,
  activeMenu,
  setActiveMenu,
}) => {
  const adminMenuItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' }, // Overview of parking system
    { id: 'zones', icon: 'fa-map-marked-alt', label: 'Parking Zones' }, // Manage parking zones
    { id: 'spaces', icon: 'fa-parking', label: 'Parking Spaces' }, // View/manage individual spaces
    { id: 'reservations', icon: 'fa-calendar-check', label: 'Reservations' }, // Current and upcoming reservations
    { id: 'users', icon: 'fa-user-gear', label: 'Users' }, // Manage all user types
    { id: 'staff', icon: 'fa-user-tie', label: 'Staff' }, // Staff management
    { id: 'visitors', icon: 'fa-user-clock', label: 'Visitors' }, // Visitor management
    { id: 'students', icon: 'fa-user-graduate', label: 'Students' }, // Student management
    { id: 'events', icon: 'fa-calendar-alt', label: 'Events' }, // Special events affecting parking
    { id: 'reports', icon: 'fa-chart-bar', label: 'Reports' }, // Analytics and reports
    { id: 'settings', icon: 'fa-cog', label: 'Settings' }, // System settings
  ];

  const menuItems = adminMenuItems;

  const { logout } = useAuth();

  const handleLogout = () => {
    console.log('Logout button clicked');
    logout();
  };

  return (
    <div
      className={`
        bg-white shadow-xl transition-all duration-300
        fixed inset-y-0 left-0 z-40 flex flex-col h-screen
        ${isSidebarOpen ? 'w-64' : 'w-20'}
      `}
    >
      <div className="h-20 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-2 no-underline" onClick={() => setActiveMenu('dashboard')}>
          {isSidebarOpen && (
            <span className="text-xl font-bold text-blue-800 whitespace-nowrap overflow-hidden">
              Parking Admin
            </span>
          )}
        </Link>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-500 hover:text-gray-700 cursor-pointer !rounded-button"
        >
          <i className={`fas ${isSidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={`/${item.id}`}
            onClick={() => setActiveMenu(item.id)}
            className={`w-full flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 !rounded-button
              ${activeMenu === item.id
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <i className={`fas ${item.icon} ${isSidebarOpen ? 'w-6 text-center' : 'w-full text-center'} text-lg`}></i>
            {isSidebarOpen && <span className="ml-3 truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200">
        <div className="p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 py-2 transition-colors duration-200 !rounded-button"
          >
            <i className="fas fa-sign-out-alt text-lg"></i>
            {isSidebarOpen && <span className="ml-3 font-medium">Log out</span>}
          </button>
        </div>
      </div>
    </div>
  );
};