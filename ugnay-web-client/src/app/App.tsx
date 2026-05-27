import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '../features/auth/store';
import AppLayout from '../shared/components/layout/AppLayout';

/* ---------- Auth ---------- */
const Login = lazy(() => import('../features/auth/pages/Login'));
const Register = lazy(() => import('../features/auth/pages/Register'));
const CompleteGoogleProfile = lazy(() => import('../features/auth/pages/CompleteGoogleProfile'));
const PaymentResult = lazy(() => import('../features/payment/pages/PaymentResult'));

/* ---------- Vendor ---------- */
const VendorDashboard = lazy(() => import('../features/dashboard/pages/VendorDashboard'));
const Discover = lazy(() => import('../features/discovery/pages/Discover'));
const ManufacturerProfileView = lazy(() => import('../features/discovery/pages/ViewManufacturer'));
const ProductDetail = lazy(() => import('../features/product/pages/ProductDetail'));
const CreateRequest = lazy(() => import('../features/sample-request/pages/CreateRequest'));
const MyRequests = lazy(() => import('../features/sample-request/pages/MyRequests'));
const RequestDetail = lazy(() => import('../features/sample-request/pages/RequestDetail'));
const Connections = lazy(() => import('../features/connection/pages/VendorConnections'));
const VendorProfile = lazy(() => import('../features/profile/pages/VendorProfile'));

/* ---------- Manufacturer ---------- */
const MfDashboard = lazy(() => import('../features/dashboard/pages/ManufacturerDashboard'));
const ProductManagement = lazy(() => import('../features/product/pages/ProductManagement'));
const AddEditProduct = lazy(() => import('../features/product/pages/AddEditProduct'));
const IncomingRequests = lazy(() => import('../features/sample-request/pages/IncomingRequests'));
const MfRequestDetail = lazy(() => import('../features/sample-request/pages/ManufacturerRequestDetail'));
const ShipmentManagement = lazy(() => import('../features/sample-request/pages/ShipmentManagement'));
const MfProfile = lazy(() => import('../features/profile/pages/EditManufacturerProfile'));
const MfConnections = lazy(() => import('../features/connection/pages/ManufacturerConnections'));

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

/* ---------- Smart redirect: if logged in → dashboard, else → login ---------- */
function SmartRedirect() {
  const { user } = useAuthStore();
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return <Navigate to="/login" replace />;
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
          {/* Root — detects login and redirects */}
          <Route path="/" element={<SmartRedirect />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<CompleteGoogleProfile />} />
          <Route path="/payment/result" element={<PaymentResult />} />

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
