import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';
import AppLayout from './components/layout/AppLayout';

/* ---------- Auth ---------- */
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

/* ---------- Vendor ---------- */
const VendorDashboard = lazy(() => import('./pages/vendor/Dashboard'));
const Discover = lazy(() => import('./pages/vendor/Discover'));
const ManufacturerProfileView = lazy(() => import('./pages/vendor/ManufacturerProfile'));
const ProductDetail = lazy(() => import('./pages/vendor/ProductDetail'));
const CreateRequest = lazy(() => import('./pages/vendor/CreateRequest'));
const MyRequests = lazy(() => import('./pages/vendor/MyRequests'));
const RequestDetail = lazy(() => import('./pages/vendor/RequestDetail'));
const Connections = lazy(() => import('./pages/vendor/Connections'));
const VendorProfile = lazy(() => import('./pages/vendor/VendorProfile'));

/* ---------- Manufacturer ---------- */
const MfDashboard = lazy(() => import('./pages/manufacturer/Dashboard'));
const ProductManagement = lazy(() => import('./pages/manufacturer/ProductManagement'));
const AddEditProduct = lazy(() => import('./pages/manufacturer/AddEditProduct'));
const IncomingRequests = lazy(() => import('./pages/manufacturer/IncomingRequests'));
const MfRequestDetail = lazy(() => import('./pages/manufacturer/ManufacturerRequestDetail'));
const ShipmentManagement = lazy(() => import('./pages/manufacturer/ShipmentManagement'));
const MfProfile = lazy(() => import('./pages/manufacturer/ManufacturerProfile'));
const MfConnections = lazy(() => import('./pages/manufacturer/Connections'));

/* ---------- Loading fallback ---------- */
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/* ---------- Protected wrapper ---------- */
function RequireAuth({ role, children }: { role?: string; children: ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Vendor routes */}
          <Route
            path="/vendor"
            element={
              <RequireAuth role="vendor">
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="discover" element={<Discover />} />
            <Route path="manufacturer/:id" element={<ManufacturerProfileView />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="request/create" element={<CreateRequest />} />
            <Route path="requests" element={<MyRequests />} />
            <Route path="requests/:id" element={<RequestDetail />} />
            <Route path="connections" element={<Connections />} />
            <Route path="profile" element={<VendorProfile />} />
          </Route>

          {/* Manufacturer routes */}
          <Route
            path="/manufacturer"
            element={
              <RequireAuth role="manufacturer">
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MfDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/add" element={<AddEditProduct />} />
            <Route path="products/edit/:id" element={<AddEditProduct />} />
            <Route path="requests" element={<IncomingRequests />} />
            <Route path="requests/:id" element={<MfRequestDetail />} />
            <Route path="shipments" element={<ShipmentManagement />} />
            <Route path="connections" element={<MfConnections />} />
            <Route path="profile" element={<MfProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
