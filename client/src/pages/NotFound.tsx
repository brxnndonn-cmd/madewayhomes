import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-brand-gray">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6 font-extrabold text-brand-red/20">404</div>
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white flex items-center justify-center shadow-sm">
          <span className="text-3xl">🏚️</span>
        </div>
        <h1 className="text-2xl font-bold text-brand-black mb-2">Page Not Found</h1>
        <p className="text-brand-gray-dark mb-8 leading-relaxed">
          Sorry, the page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">← Back to Home</Link>
          <Link to="/request" className="btn-secondary">Request a Service</Link>
        </div>
      </div>
    </div>
  );
}
