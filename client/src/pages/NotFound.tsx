import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-4">🏠</div>
        <h1 className="text-6xl font-bold text-brand-red mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-brand-black mb-2">Page Not Found</h2>
        <p className="text-brand-gray-dark mb-2">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <p className="text-brand-gray-dark text-sm mb-8">
          It may have been moved, or the address might be typed incorrectly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
          <Link to="/contact" className="btn-secondary">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
