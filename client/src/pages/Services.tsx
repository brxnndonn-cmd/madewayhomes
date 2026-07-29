import { useSearchParams, Link } from 'react-router-dom';

export default function Services() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold text-brand-black mb-3">
          {category ? `Find ${category} Services` : 'Browse Services'}
        </h1>
        <p className="text-brand-gray-dark mb-6">
          Our full service listings and provider directory are coming soon. 
          We're onboarding local providers right now.
        </p>
        <p className="text-brand-gray-dark text-sm mb-6">
          In the meantime, submit a service request and we'll match you with the right provider.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/request" className="btn-primary">Request a Service</Link>
          <Link to="/" className="btn-secondary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
