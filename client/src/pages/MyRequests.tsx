import { Link } from 'react-router-dom';

export default function MyRequests() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-bold text-brand-black mb-3">My Requests</h1>
        <p className="text-brand-gray-dark mb-6">
          Your service requests dashboard is coming soon. You'll be able to track 
          your requests, communicate with providers, and manage your projects here.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/request" className="btn-primary">Submit a Request</Link>
          <Link to="/" className="btn-secondary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
