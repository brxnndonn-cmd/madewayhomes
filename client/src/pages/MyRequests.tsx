import { Link } from 'react-router-dom';

export default function MyRequests() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-brand-gray">
      <div className="card p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand-red/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
          Coming Soon
        </span>
        <h1 className="text-2xl font-bold text-brand-black mb-3">My Requests</h1>
        <p className="text-brand-gray-dark mb-8 leading-relaxed">
          Your service requests dashboard isn't available yet. Soon you'll be able to track 
          your requests, communicate with providers, and manage your projects — all from one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/request" className="btn-primary">Submit a Request</Link>
          <Link to="/" className="btn-secondary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
