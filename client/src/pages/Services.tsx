import { useSearchParams, Link } from 'react-router-dom';

export default function Services() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  return (
    <div>
      <section className="page-header text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Services` : 'Browse Services'}
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Explore all the home services available through MadeWayHomes.
          </p>
        </div>
      </section>

      <section className="py-20 bg-brand-gray">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            <span className="text-5xl">🔍</span>
          </div>
          <h2 className="text-2xl font-bold text-brand-black mb-3">
            Full service directory coming soon
          </h2>
          <p className="text-brand-gray-dark mb-8 leading-relaxed">
            We're building out our complete service listings as we onboard local providers. 
            In the meantime, submit a service request and we'll match you with the right provider.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/request" className="btn-primary inline-flex items-center gap-2">
              Request a Service
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/providers" className="btn-secondary">
              Browse Providers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
