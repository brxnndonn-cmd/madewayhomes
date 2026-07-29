import { Link } from 'react-router-dom';

export default function ProviderDashboard() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
          Coming Soon
        </span>
        <h1 className="text-3xl font-bold text-brand-black mb-3">Provider Dashboard</h1>
        <p className="text-brand-gray-dark mb-6">
          Your provider dashboard is coming soon. You'll be able to manage leads, 
          update your profile, and track your activity here.
        </p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
