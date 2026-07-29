import { Link } from 'react-router-dom';

export default function ProviderDashboard() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-brand-gray">
      <div className="card p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand-red/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
          Coming Soon
        </span>
        <h1 className="text-2xl font-bold text-brand-black mb-3">Provider Dashboard</h1>
        <p className="text-brand-gray-dark mb-8 leading-relaxed">
          Your provider dashboard isn't available yet. Soon you'll be able to manage leads, 
          update your profile, track your activity, and grow your business — all from one place.
        </p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
