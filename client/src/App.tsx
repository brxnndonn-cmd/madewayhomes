import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import RequestService from './pages/RequestService';
import ListYourBusiness from './pages/ListYourBusiness';
import Services from './pages/Services';
import ProviderDirectory from './pages/ProviderDirectory';
import ProviderProfile from './pages/ProviderProfile';
import MyRequests from './pages/MyRequests';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Pricing from './pages/Pricing';
import Disclaimer from './pages/Disclaimer';
import SampleLanding from './pages/SampleLanding';

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/request" element={<RequestService />} />
        <Route path="/list-your-business" element={<ListYourBusiness />} />
        <Route path="/services" element={<Services />} />
        <Route path="/providers" element={<ProviderDirectory />} />
        <Route path="/providers/:id" element={<ProviderProfile />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/demo-landing" element={<SampleLanding />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected: Customer */}
        <Route
          path="/my-requests"
          element={
            <ProtectedRoute requiredRole="customer">
              <MyRequests />
            </ProtectedRoute>
          }
        />

        {/* Protected: Provider */}
        <Route
          path="/provider-dashboard"
          element={
            <ProtectedRoute requiredRole="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected: Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
