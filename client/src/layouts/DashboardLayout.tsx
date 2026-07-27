import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Plus, FileText, Users, LogOut, Shield, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const studentNav = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/search', label: 'Find Rooms', icon: Building },
    { href: '/roommates', label: 'Roommates', icon: Users },
    { href: '/compare', label: 'Compare', icon: FileText },
  ];

  const ownerNav = [
    { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/owner/add-property', label: 'Add Property', icon: Plus },
    { href: '/search', label: 'View Listings', icon: Building },
  ];

  const adminNav = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/search', label: 'All Properties', icon: Building },
    { href: '/admin/dashboard#users', label: 'Users', icon: Users },
  ];

  const navItems =
    user?.role === 'admin' ? adminNav :
    user?.role === 'owner' ? ownerNav :
    studentNav;

  const isActive = (href: string) => location.pathname === href || (href !== '/student/dashboard' && href !== '/owner/dashboard' && href !== '/admin/dashboard' && location.pathname.startsWith(href));

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 bg-white border-r border-gray-100 min-h-screen sticky top-0">
        <div className="p-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Home className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base text-gray-900">Campus<span className="text-primary-600">Nest</span></span>
          </Link>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              {user?.role === 'admin' ? <Shield className="w-4 h-4 text-primary-600" /> : <Users className="w-4 h-4 text-primary-600" />}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5" aria-label="Dashboard navigation">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
