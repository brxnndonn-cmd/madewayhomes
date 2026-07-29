import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ──────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
            : 'bg-white border-b border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0 group" onClick={closeMobile}>
              <span className="text-xl sm:text-2xl font-extrabold text-brand-black tracking-tight transition-colors">
                Made<span className="text-brand-red group-hover:text-brand-red-light transition-colors">Way</span>Homes
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/providers" className="nav-link">Find a Pro</Link>
              <Link to="/how-it-works" className="nav-link">How It Works</Link>
              <Link to="/pricing" className="nav-link">Pricing</Link>
              <Link to="/about" className="nav-link">About</Link>
              <Link to="/contact" className="nav-link">Contact</Link>

              {!user ? (
                <>
                  <Link to="/request" className="ml-3 btn-primary text-sm !py-2 !px-4">
                    Request a Service
                  </Link>
                  <Link to="/list-your-business" className="ml-2 btn-secondary text-sm !py-2 !px-4">
                    List Your Business
                  </Link>
                </>
              ) : user.role === 'admin' ? (
                <>
                  <Link to="/admin" className="ml-3 px-3 py-2 text-brand-red hover:text-brand-red-dark font-semibold transition-colors text-sm">
                    Admin Dashboard
                  </Link>
                  <NotificationBell />
                  <span className="ml-1 text-sm font-medium text-brand-black">{user.name}</span>
                  <button onClick={handleLogout} className="ml-2 text-sm text-brand-gray-dark hover:text-brand-red transition-colors font-medium">
                    Log Out
                  </button>
                </>
              ) : user.role === 'provider' ? (
                <>
                  <Link to="/provider-dashboard" className="ml-3 px-3 py-2 text-brand-gray-dark hover:text-brand-black transition-colors text-sm font-medium">
                    Dashboard
                  </Link>
                  <NotificationBell />
                  <span className="ml-1 text-sm font-medium text-brand-black">{user.name}</span>
                  <button onClick={handleLogout} className="ml-2 text-sm text-brand-gray-dark hover:text-brand-red transition-colors font-medium">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/my-requests" className="ml-3 px-3 py-2 text-brand-gray-dark hover:text-brand-black transition-colors text-sm font-medium">
                    My Requests
                  </Link>
                  <NotificationBell />
                  <span className="ml-1 text-sm font-medium text-brand-black">{user.name}</span>
                  <button onClick={handleLogout} className="ml-2 text-sm text-brand-gray-dark hover:text-brand-red transition-colors font-medium">
                    Log Out
                  </button>
                </>
              )}
            </nav>

            {/* Mobile buttons */}
            <div className="md:hidden flex items-center gap-2">
              {!user ? (
                <>
                  <Link to="/request" className="btn-primary text-xs !py-1.5 !px-3">
                    Request
                  </Link>
                  <Link to="/list-your-business" className="text-xs font-medium text-brand-red hover:text-brand-red-dark">
                    List
                  </Link>
                </>
              ) : (
                <NotificationBell />
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 -mr-2 text-brand-gray-dark hover:text-brand-black transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <div
          className={`md:hidden border-t border-gray-100 bg-white overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-3 space-y-1">
            <Link to="/" onClick={closeMobile} className="mobile-nav-link">🏠 Home</Link>
            <Link to="/providers" onClick={closeMobile} className="mobile-nav-link">🔍 Find a Pro</Link>
            <Link to="/how-it-works" onClick={closeMobile} className="mobile-nav-link">📋 How It Works</Link>
            <Link to="/pricing" onClick={closeMobile} className="mobile-nav-link">💰 Pricing</Link>
            <Link to="/about" onClick={closeMobile} className="mobile-nav-link">ℹ️ About</Link>
            <Link to="/contact" onClick={closeMobile} className="mobile-nav-link">💬 Contact</Link>
            <Link to="/request" onClick={closeMobile} className="mobile-nav-link !text-brand-red !font-semibold">📝 Request a Service</Link>
            <Link to="/list-your-business" onClick={closeMobile} className="mobile-nav-link">🏗️ List Your Business</Link>

            {user && (
              <>
                <hr className="my-2 border-gray-100" />
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="text-sm font-semibold text-brand-black">{user.name}</span>
                </div>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={closeMobile} className="mobile-nav-link !text-brand-red">Admin Dashboard</Link>
                )}
                {user.role === 'provider' && (
                  <Link to="/provider-dashboard" onClick={closeMobile} className="mobile-nav-link">Provider Dashboard</Link>
                )}
                {user.role === 'customer' && (
                  <Link to="/my-requests" onClick={closeMobile} className="mobile-nav-link">My Requests</Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 rounded-lg text-brand-gray-dark hover:bg-gray-50 transition-colors font-medium">
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-brand-black text-white mt-auto">
        {/* Top wave/divider */}
        <div className="h-1 bg-gradient-to-r from-brand-red via-brand-gold to-brand-red" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-extrabold mb-4 tracking-tight">
                Made<span className="text-brand-red-light">Way</span>Homes
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Making the way home easier. Connecting Caldwell County homeowners with trusted local service providers.
              </p>
              <p className="text-gray-500 text-xs mt-4 flex items-center gap-1">
                <span>📍</span> Serving Lenoir &amp; Caldwell County, NC
              </p>
            </div>

            {/* For Homeowners */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">For Homeowners</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link to="/request" className="footer-link">Request a Service</Link></li>
                <li><Link to="/providers" className="footer-link">Find a Pro</Link></li>
                <li><Link to="/how-it-works" className="footer-link">How It Works</Link></li>
                <li><Link to="/pricing" className="footer-link">Pricing</Link></li>
                <li><Link to="/services" className="footer-link">Browse Services</Link></li>
              </ul>
            </div>

            {/* For Providers */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">For Providers</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link to="/list-your-business" className="footer-link">List Your Business</Link></li>
                <li><Link to="/how-it-works" className="footer-link">How It Works</Link></li>
                <li><Link to="/providers" className="footer-link">Provider Directory</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link to="/about" className="footer-link">About</Link></li>
                <li><Link to="/contact" className="footer-link">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
                <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
                <li><Link to="/disclaimer" className="footer-link">Disclaimer</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} MadeWayHomes. All rights reserved.</p>
            <p className="mt-1 text-xs max-w-lg mx-auto">
              MadeWayHomes is a marketing and lead-generation platform, not a real estate brokerage.
              Service providers are independent businesses.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
