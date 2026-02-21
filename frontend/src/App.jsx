import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/customer/Home';
import Login from './pages/auth/Login';
import OAuthCallback from './pages/auth/OAuthCallback';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import ShopPage from './pages/customer/ShopPage';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import SearchResults from './pages/customer/SearchResults';
import ShopsList from './pages/customer/ShopsList';
import AllProducts from './pages/customer/AllProducts';
import About from './pages/customer/About';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import AddEditProduct from './pages/seller/AddEditProduct';
import SellerOrders from './pages/seller/SellerOrders';
import RegisterShop from './pages/seller/RegisterShop';
import SellerShop from './pages/seller/SellerShop';
import SellerAnalytics from './pages/seller/SellerAnalytics';
import SellerInventory from './pages/seller/SellerInventory';
import Profile from './pages/customer/Profile';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminShops from './pages/admin/AdminShops';
import AdminProducts from './pages/admin/AdminProducts';
import CustomerAIAssistant from './components/customer/CustomerAIAssistant';

function Layout({ children }) {
  const location = useLocation();

  // Hide navbar and footer on seller and admin routes
  const hideNavAndFooter = location.pathname.startsWith('/seller') ||
    location.pathname.startsWith('/admin');

  // Show AI assistant on customer routes only
  const isAuthPage = location.pathname === '/login' || location.pathname.startsWith('/auth');
  const showAIAssistant = !hideNavAndFooter && !isAuthPage;

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavAndFooter && <Navbar />}
      {children}
      {!hideNavAndFooter && <Footer />}
      {showAIAssistant && <CustomerAIAssistant />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/shops" element={<ShopsList />} />
            <Route path="/products" element={<AllProducts />} />
            <Route path="/shop/:id" element={<ShopPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute allowedRoles={['customer']}><Orders /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
            <Route path="/seller/products" element={<ProtectedRoute allowedRoles={['seller']}><SellerProducts /></ProtectedRoute>} />
            <Route path="/seller/products/add" element={<ProtectedRoute allowedRoles={['seller']}><AddEditProduct /></ProtectedRoute>} />
            <Route path="/seller/products/edit/:id" element={<ProtectedRoute allowedRoles={['seller']}><AddEditProduct /></ProtectedRoute>} />
            <Route path="/seller/orders" element={<ProtectedRoute allowedRoles={['seller']}><SellerOrders /></ProtectedRoute>} />
            <Route path="/seller/shop" element={<ProtectedRoute allowedRoles={['seller']}><SellerShop /></ProtectedRoute>} />
            <Route path="/seller/analytics" element={<ProtectedRoute allowedRoles={['seller']}><SellerAnalytics /></ProtectedRoute>} />
            <Route path="/seller/inventory" element={<ProtectedRoute allowedRoles={['seller']}><SellerInventory /></ProtectedRoute>} />
            <Route path="/seller/register-shop" element={<ProtectedRoute allowedRoles={['customer', 'seller']}><RegisterShop /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/coupons" element={<ProtectedRoute allowedRoles={['admin']}><AdminCoupons /></ProtectedRoute>} />
            <Route path="/admin/shops" element={<ProtectedRoute allowedRoles={['admin']}><AdminShops /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><AdminProducts /></ProtectedRoute>} />

          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
