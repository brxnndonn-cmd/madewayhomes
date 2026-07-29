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

  // Load categories on mount
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

  // Fetch providers on mount and when filters change
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

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

  const getAreaCities = (areas: Area[]) => {
    return areas.slice(0, 3).map((a) => a.city).join(', ') + (areas.length > 3 ? ` +${areas.length - 3} more` : '');
  };

  const getServiceNames = (services: Service[]) => {
    const names = services.map((s) => s.name);
    if (names.length <= 3) return names.join(', ');
    return names.slice(0, 3).join(', ') + ` +${names.length - 3} more`;
  };

  const truncate = (text: string, max: number) => {
    if (!text) return '';
    return text.length > max ? text.slice(0, max).trimEnd() + '...' : text;
  };

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-black text-center">
            Find Local Service Providers
          </h1>
          <p className="text-brand-gray-dark text-center mt-3 max-w-xl mx-auto">
            Browse trusted, approved providers in Caldwell County
          </p>
        </div>
      </section>

      {/* ── Filter Bar ───────────────────────────────────────── */}
      <section className="bg-brand-gray border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field sm:max-w-[200px] text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="City or ZIP"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="input-field sm:max-w-[180px] text-sm"
            />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="input-field sm:flex-1 text-sm"
            />
            <button type="submit" className="btn-primary text-sm px-5 py-2.5 whitespace-nowrap w-full sm:w-auto">
              Search
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-brand-red hover:underline whitespace-nowrap px-2 w-full sm:w-auto text-center"
              >
                Clear Filters
              </button>
            )}
          </form>
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────── */}
      <section className="py-10 bg-brand-gray min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            /* Skeleton cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-28"></div>
                </div>
              ))}
            </div>
          ) : providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Work photo or placeholder */}
                  <div className="h-40 bg-gradient-to-br from-brand-gray to-gray-200 flex items-center justify-center overflow-hidden">
                    {provider.images.length > 0 ? (
                      <img
                        src={provider.images[0]}
                        alt={provider.business_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-brand-gray-dark">
                        <svg className="w-12 h-12 mx-auto mb-1 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs opacity-40">No photo</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    {/* Logo + Business name */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {provider.logo_url ? (
                          <img src={provider.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-brand-red font-bold text-sm">
                            {provider.business_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-brand-black text-lg leading-tight truncate">
                          {provider.business_name}
                        </h3>
                        <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                          Approved
                        </span>
                      </div>
                    </div>

                    {/* Services */}
                    {provider.services.length > 0 && (
                      <p className="text-sm text-brand-gray-dark mb-2">
                        <span className="font-medium">Services:</span> {getServiceNames(provider.services)}
                      </p>
                    )}

                    {/* Areas */}
                    {provider.areas.length > 0 && (
                      <p className="text-sm text-brand-gray-dark mb-3">
                        <span className="font-medium">Areas:</span> {getAreaCities(provider.areas)}
                      </p>
                    )}

                    {/* Description */}
                    <p className="text-sm text-brand-gray-dark mb-4 flex-1">
                      {truncate(provider.description || '', 120)}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <Link
                        to={`/providers/${provider.id}`}
                        className="text-sm font-medium text-brand-red hover:underline"
                      >
                        View Profile →
                      </Link>
                      <Link
                        to={`/request?provider=${provider.id}`}
                        className="btn-primary text-xs px-4 py-1.5"
                      >
                        Request Quote
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="max-w-md mx-auto bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-brand-black mb-2">No providers found</h3>
              <p className="text-brand-gray-dark text-sm mb-6 leading-relaxed">
                {hasFilters
                  ? 'No providers found matching your criteria. Try adjusting your filters.'
                  : 'No providers found matching your criteria. Check back soon — new providers join regularly!'}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="btn-secondary text-sm">
                  Clear All Filters
                </button>
              )}
              <div className="mt-4">
                <Link to="/list-your-business" className="text-sm text-brand-red hover:underline font-medium">
                  Are you a service provider? List your business →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-brand-black mb-2">Are you a local service provider?</h2>
          <p className="text-brand-gray-dark text-sm mb-6">
            Join MadeWayHomes and get matched with homeowners in Caldwell County looking for your services.
          </p>
          <Link to="/list-your-business" className="btn-primary">
            List Your Business
          </Link>
        </div>
      </section>
    </div>
  );
}
