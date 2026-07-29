import { Outlet, Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50 flex flex-col">
      <header className="px-6 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">
            Campus<span className="text-primary-600">Nest</span>
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>
      <footer className="text-center py-4 text-xs text-gray-400">
        © 2026 CampusNest — Find your room. Find your roommate. Feel at home.
      </footer>
    </div>
  );
}
