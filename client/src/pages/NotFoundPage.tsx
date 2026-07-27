import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center">
        <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
          The page you are looking for doesn't exist or may have been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary"><Home className="w-4 h-4" /> Go Home</Link>
          <Link to="/search" className="btn-secondary"><Search className="w-4 h-4" /> Search Rooms</Link>
        </div>
      </div>
    </div>
  );
}
