import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Pages
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import POSPage from './pages/POSPage';
import KDSPage from './pages/KDSPage';
import DashboardPage from './pages/DashboardPage';
import TablePage from './pages/TablePage';
import InventoryPage from './pages/InventoryPage';
import StaffPage from './pages/StaffPage';
import OrdersPage from './pages/OrdersPage';
import CustomerPage from './pages/CustomerPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, role, isStaff } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><span className="text-coffee-600 font-display text-2xl">Đang tải...</span></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<MenuPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/menu" element={<MenuPage />} />

          {/* Staff POS */}
          <Route path="/pos" element={
            <ProtectedRoute allowedRoles={['Quản lý', 'Thu ngân']}>
              <POSPage />
            </ProtectedRoute>
          } />

          {/* Barista KDS */}
          <Route path="/kds" element={
            <ProtectedRoute allowedRoles={['Quản lý', 'Pha chế']}>
              <KDSPage />
            </ProtectedRoute>
          } />

          {/* Manager Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['Quản lý']}>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/tables" element={
            <ProtectedRoute allowedRoles={['Quản lý', 'Thu ngân']}>
              <TablePage />
            </ProtectedRoute>
          } />

          <Route path="/inventory" element={
            <ProtectedRoute allowedRoles={['Quản lý']}>
              <InventoryPage />
            </ProtectedRoute>
          } />

          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['Quản lý']}>
              <StaffPage />
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />

          <Route path="/account" element={
            <ProtectedRoute>
              <CustomerPage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
