import { useState } from 'react';
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

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0" onClick={closeMobile}>
              <span className="text-2xl font-bold text-brand-black tracking-tight">
                Made<span className="text-brand-red">Way</span>Homes
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/" className="px-3 py-2 text-brand-gray-dark hover:text-brand-black transition-colors rounded-lg text-sm font-medium">
                Home
              </Link>
              <Link to="/providers" className="px-3 py-2 text-brand-gray-dark hover:text-brand-black transition-colors rounded-lg text-sm font-medium">
                Find a Pro
              </Link>
              <Link to="/how-it-works" className="px-3 py-2 text-brand-gray-dark hover:text-brand-black transition-colors rounded-lg text-sm font-medium">
                How It Works
              </Link>
              <Link to="/about" className="px-3 py-2 text-brand-gray-dark hover:text-brand-black transition-colors rounded-lg text-sm font-medium">
                About
              </Link>
              <Link to="/contact" className="px-3 py-2 text-brand-gray-dark hover:text-brand-black transition-colors rounded-lg text-sm font-medium">
                Contact
              </Link>

              {!user ? (
                <>
                  <Link to="/request" className="ml-3 btn-primary text-sm px-4 py-2">
                    Request a Service
                  </Link>
                  <Link to="/list-your-business" className="ml-2 btn-secondary text-sm px-4 py-2">
                    List Your Business
                  </Link>
                </>
              ) : user.role === 'admin' ? (
                <>
                  <Link to="/admin" className="ml-3 px-3 py-2 text-brand-red hover:text-brand-red-dark font-medium transition-colors text-sm">
                    Admin Dashboard
                  </Link>
                  <NotificationBell />
                  <span className="ml-1 text-sm text-brand-gray-dark">{user.name}</span>
                  <button onClick={handleLogout} className="ml-2 text-sm text-brand-gray-dark hover:text-brand-black transition-colors">
                    Log Out
                  </button>
                </>
              ) : user.role === 'provider' ? (
                <>
                  <Link to="/provider-dashboard" className="ml-3 px-3 py-2 text-brand-gray-dark hover:text-brand-black transition-colors text-sm font-medium">
                    Provider Dashboard
                  </Link>
                  <NotificationBell />
                  <span className="ml-1 text-sm text-brand-gray-dark">{user.name}</span>
                  <button onClick={handleLogout} className="ml-2 text-sm text-brand-gray-dark hover:text-brand-black transition-colors">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/my-requests" className="ml-3 px-3 py-2 text-brand-gray-dark hover:text-brand-black transition-colors text-sm font-medium">
                    My Requests
                  </Link>
                  <NotificationBell />
                  <span className="ml-1 text-sm text-brand-gray-dark">{user.name}</span>
                  <button onClick={handleLogout} className="ml-2 text-sm text-brand-gray-dark hover:text-brand-black transition-colors">
                    Log Out
                  </button>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              {!user ? (
                <Link to="/request" className="btn-primary text-xs px-3 py-1.5">
                  Request
                </Link>
              ) : null}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-brand-gray-dark hover:text-brand-black"
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
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              <Link to="/" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-brand-gray-dark hover:bg-brand-gray hover:text-brand-black transition-colors font-medium">Home</Link>
              <Link to="/providers" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-brand-gray-dark hover:bg-brand-gray hover:text-brand-black transition-colors font-medium">Find a Pro</Link>
              <Link to="/how-it-works" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-brand-gray-dark hover:bg-brand-gray hover:text-brand-black transition-colors font-medium">How It Works</Link>
              <Link to="/about" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-brand-gray-dark hover:bg-brand-gray hover:text-brand-black transition-colors font-medium">About</Link>
              <Link to="/contact" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-brand-gray-dark hover:bg-brand-gray hover:text-brand-black transition-colors font-medium">Contact</Link>
              <Link to="/request" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-brand-red hover:bg-red-50 font-medium">Request a Service</Link>
              <Link to="/list-your-business" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-brand-gray-dark hover:bg-brand-gray hover:text-brand-black transition-colors font-medium">List Your Business</Link>

              {user && (
                <>
                  <hr className="my-2 border-gray-100" />
                  <div className="flex items-center justify-between px-3 py-1">
                    <span className="text-sm text-brand-gray-dark">{user.name}</span>
                    <NotificationBell />
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-brand-red font-medium">Admin Dashboard</Link>
                  )}
                  {user.role === 'provider' && (
                    <Link to="/provider-dashboard" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-brand-gray-dark font-medium">Provider Dashboard</Link>
                  )}
                  {user.role === 'customer' && (
                    <Link to="/my-requests" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-brand-gray-dark font-medium">My Requests</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 rounded-lg text-brand-gray-dark hover:bg-brand-gray">Log Out</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-brand-black text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-semibold mb-3 tracking-tight">
                Made<span className="text-brand-red-light">Way</span>Homes
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Making the way home easier. Connecting Caldwell County homeowners with trusted local service providers.
              </p>
              <p className="text-gray-500 text-xs mt-3">
                Serving Lenoir &amp; Caldwell County, NC
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-medium text-sm mb-3 text-gray-300">For Homeowners</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/request" className="hover:text-white transition-colors">Request a Service</Link></li>
                <li><Link to="/providers" className="hover:text-white transition-colors">Find a Pro</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Browse Services</Link></li>
              </ul>
            </div>

            {/* For Providers */}
            <div>
              <h4 className="font-medium text-sm mb-3 text-gray-300">For Providers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/list-your-business" className="hover:text-white transition-colors">List Your Business</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-medium text-sm mb-3 text-gray-300">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-medium text-sm mb-3 text-gray-300">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} MadeWayHomes. All rights reserved.</p>
            <p className="mt-1 text-xs">
              MadeWayHomes is a marketing and lead-generation platform, not a real estate brokerage. 
              Service providers are independent businesses.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
