import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Home, Search, Users, Menu, X, LogOut, User, LayoutDashboard, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NestAIChat from '../components/ai/NestAIChat';

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'owner') return '/owner/dashboard';
    return '/admin/dashboard';
  };

  const navLinks = [
    { href: '/search', label: 'Find Rooms', icon: Search },
    { href: '/roommates', label: 'Find Roommates', icon: Users },
  ];

  const isActive = (href: string) => location.pathname.startsWith(href);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">
                Campus<span className="text-primary-600">Nest</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  to={href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/compare"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/compare') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Compare
              </Link>
            </nav>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {user?.role === 'owner' && (
                    <Link to="/owner/add-property" className="btn-teal text-sm py-2 px-4">
                      <Plus className="w-4 h-4" />
                      Add Property
                    </Link>
                  )}
                  <Link
                    to={getDashboardPath()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="font-medium max-w-[120px] truncate">{user?.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm py-2 px-4">Log In</Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <Link to="/compare" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <LayoutDashboard className="w-4 h-4" />
              Compare Properties
            </Link>
            <div className="border-t border-gray-100 pt-2 mt-2">
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardPath()} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 mt-1">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-sm py-2">Log In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-sm py-2">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* NestAI Floating Chat Widget */}
      <NestAIChat />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Home className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white">Campus<span className="text-primary-400">Nest</span></span>
              </Link>
              <p className="text-sm leading-relaxed">
                Find your room. Find your roommate. Feel at home.<br />
                Trusted student housing near top colleges in Guwahati.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Students</h4>
              <ul className="space-y-1.5 text-sm">
                <li><Link to="/search" className="hover:text-white transition-colors">Find Rooms</Link></li>
                <li><Link to="/roommates" className="hover:text-white transition-colors">Find Roommates</Link></li>
                <li><Link to="/compare" className="hover:text-white transition-colors">Compare Properties</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Owners</h4>
              <ul className="space-y-1.5 text-sm">
                <li><Link to="/register?role=owner" className="hover:text-white transition-colors">List Property</Link></li>
                <li><Link to="/owner/dashboard" className="hover:text-white transition-colors">Owner Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
            <p>© 2026 CampusNest. Built for students, by students.</p>
            <p className="text-gray-500">⚠️ Always verify a property before making any payment.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
