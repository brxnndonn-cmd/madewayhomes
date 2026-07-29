import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Service {
  id: number;
  name: string;
  icon: string;
}

interface Area {
  city: string;
  state: string;
  zip_code: string | null;
}

interface Provider {
  id: number;
  business_name: string;
  description: string;
  logo_url: string | null;
  phone: string;
  email: string;
  website: string | null;
  years_in_business: number | null;
  services: Service[];
  areas: Area[];
  images: string[];
  created_at: string;
}

export default function ProviderDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || '');
  const [searchFilter, setSearchFilter] = useState(searchParams.get('search') || '');

  useEffect(() => {
    apiFetch('/categories', { skipAuth: true })
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.set('category', categoryFilter);
      if (cityFilter) params.set('city', cityFilter);
      if (searchFilter) params.set('search', searchFilter);
      const query = params.toString();
      const data = await apiFetch(`/providers${query ? `?${query}` : ''}`, { skipAuth: true });
      setProviders(data.providers || []);
    } catch (_) {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, cityFilter, searchFilter]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (categoryFilter) newParams.set('category', categoryFilter);
    if (cityFilter) newParams.set('city', cityFilter);
    if (searchFilter) newParams.set('search', searchFilter);
    setSearchParams(newParams);
    fetchProviders();
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setCityFilter('');
    setSearchFilter('');
    setSearchParams({});
  };

  const hasFilters = categoryFilter || cityFilter || searchFilter;
  const getAreaCities = (areas: Area[]) => areas.slice(0, 3).map((a) => a.city).join(', ') + (areas.length > 3 ? ` +${areas.length - 3} more` : '');
  const getServiceNames = (services: Service[]) => services.map((s) => s.name).slice(0, 3).join(', ') + (services.length > 3 ? ` +${services.length - 3} more` : '');
  const truncate = (text: string, max: number) => text && text.length > max ? text.slice(0, max).trimEnd() + '...' : text || '';

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────── */}
      <section className="page-header text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Find Local Service Providers
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Browse trusted, approved providers right here in Caldwell County
          </p>
        </div>
      </section>

      {/* ── Filter Bar ──────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 sticky top-16 lg:top-18 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field sm:max-w-[200px]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="City or ZIP"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="input-field sm:max-w-[180px]"
            />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="input-field sm:flex-1"
            />
            <button type="submit" className="btn-primary whitespace-nowrap w-full sm:w-auto">
              🔍 Search
            </button>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="text-sm text-brand-red hover:underline font-medium whitespace-nowrap">
                Clear Filters
              </button>
            )}
          </form>
        </div>
      </section>

      {/* ── Results ─────────────────────────────────────────── */}
      <section className="py-12 bg-brand-gray min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                </div>
              ))}
            </div>
          ) : providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div key={provider.id} className="card-hover-lift overflow-hidden flex flex-col">
                  {/* Image */}
                  <div className="h-44 bg-gradient-to-br from-brand-red/20 via-brand-gray to-gray-200 flex items-center justify-center overflow-hidden">
                    {provider.images.length > 0 ? (
                      <img src={provider.images[0]} alt={provider.business_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-brand-gray-dark/40">
                        <svg className="w-16 h-16 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs">No photo yet</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-red to-brand-red-dark flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
                        {provider.logo_url ? (
                          <img src={provider.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-extrabold text-lg">{provider.business_name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-brand-black text-lg leading-tight truncate">{provider.business_name}</h3>
                        <span className="tag tag-red mt-1 inline-block">Approved</span>
                      </div>
                    </div>

                    {provider.services.length > 0 && (
                      <p className="text-sm text-brand-gray-dark mb-2">
                        <span className="font-semibold">Services:</span> {getServiceNames(provider.services)}
                      </p>
                    )}
                    {provider.areas.length > 0 && (
                      <p className="text-sm text-brand-gray-dark mb-3">
                        <span className="font-semibold">Areas:</span> {getAreaCities(provider.areas)}
                      </p>
                    )}
                    <p className="text-sm text-brand-gray-dark mb-4 flex-1">{truncate(provider.description || '', 120)}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Link to={`/providers/${provider.id}`} className="text-sm font-semibold text-brand-red hover:text-brand-red-dark transition-colors">
                        View Profile →
                      </Link>
                      <Link to={`/request?provider=${provider.id}`} className="btn-primary !py-2 !px-4 !text-xs">
                        Request Quote
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-16">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-brand-black mb-2">No providers found</h3>
              <p className="text-brand-gray-dark mb-8 leading-relaxed">
                {hasFilters
                  ? 'No providers found matching your criteria. Try adjusting your filters.'
                  : 'No providers found matching your criteria. Check back soon — new providers join regularly!'}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="btn-secondary mb-4">Clear All Filters</button>
              )}
              <div>
                <Link to="/list-your-business" className="text-brand-red hover:underline font-semibold">
                  Are you a service provider? List your business →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand-red/10 flex items-center justify-center">
            <span className="text-3xl">🏗️</span>
          </div>
          <h2 className="text-2xl font-bold text-brand-black mb-2">Are you a local service provider?</h2>
          <p className="text-brand-gray-dark mb-8">
            Join MadeWayHomes and get matched with homeowners in Caldwell County looking for your services.
          </p>
          <Link to="/list-your-business" className="btn-primary inline-flex items-center gap-2">
            List Your Business
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
