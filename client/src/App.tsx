import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AddPropertyPage from './pages/AddPropertyPage';
import RoommateMatchingPage from './pages/RoommateMatchingPage';
import ComparePropertiesPage from './pages/ComparePropertiesPage';
import NotFoundPage from './pages/NotFoundPage';

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: 'student' | 'owner' | 'admin';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role && user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
        <Route path="/compare" element={<ComparePropertiesPage />} />
        <Route path="/roommates" element={<RoommateMatchingPage />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<DashboardLayout />}>
        <Route
          path="/student/dashboard"
          element={<PrivateRoute role="student"><StudentDashboardPage /></PrivateRoute>}
        />
        <Route
          path="/owner/dashboard"
          element={<PrivateRoute role="owner"><OwnerDashboardPage /></PrivateRoute>}
        />
        <Route
          path="/owner/add-property"
          element={<PrivateRoute role="owner"><AddPropertyPage /></PrivateRoute>}
        />
        <Route
          path="/owner/edit-property/:id"
          element={<PrivateRoute role="owner"><AddPropertyPage /></PrivateRoute>}
        />
        <Route
          path="/admin/dashboard"
          element={<PrivateRoute role="admin"><AdminDashboardPage /></PrivateRoute>}
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
