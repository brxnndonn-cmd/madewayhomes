import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

interface Service {
  id: number;
  name: string;
  icon: string;
  slug: string;
}

interface Area {
  id: number;
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
  facebook: string | null;
  instagram: string | null;
  years_in_business: number | null;
  business_hours: string | null;
  is_verified: number;
  services: Service[];
  areas: Area[];
  images: string[];
  created_at: string;
}

export default function ProviderProfile() {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);

    apiFetch(`/providers/${id}`, { skipAuth: true })
      .then((data) => {
        setProvider(data.provider);
      })
      .catch((err: any) => {
        if (err.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="h-40 bg-gray-200 rounded-xl mb-8"></div>
        <div className="space-y-3 mb-8">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // ── 404 State ──────────────────────────────────────────────
  if (notFound || !provider) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-4">🏚️</div>
        <h1 className="text-2xl font-bold text-brand-black mb-2">Provider Not Found</h1>
        <p className="text-brand-gray-dark mb-6">
          This provider may have been removed or is not yet approved.
        </p>
        <Link to="/providers" className="btn-primary">
          ← Back to Directory
        </Link>
      </div>
    );
  }

  // ── Helpers ────────────────────────────────────────────────
  const primaryCity = provider.areas.length > 0
    ? provider.areas[0].city
    : 'Caldwell County';

  const areaDisplay = provider.areas
    .map((a) => {
      const parts = [a.city];
      if (a.zip_code) parts.push(a.zip_code);
      return parts.join(' ');
    })
    .join(', ');

  const formatBusinessHours = (hoursJson: string | null) => {
    if (!hoursJson) return null;
    try {
      const hours = JSON.parse(hoursJson);
      if (Array.isArray(hours)) {
        return hours;
      }
      // If it's an object like { monday: "9-5", ... }
      if (typeof hours === 'object') {
        const dayNames: Record<string, string> = {
          monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
          thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
        };
        return Object.entries(hours).map(([day, val]) => ({
          day: dayNames[day.toLowerCase()] || day,
          hours: val,
        }));
      }
    } catch {
      return null;
    }
  };

  const businessHours = formatBusinessHours(provider.business_hours);

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link to="/providers" className="text-sm text-brand-red hover:underline mb-4 inline-block">
            ← Back to Directory
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-brand-red/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {provider.logo_url ? (
                  <img src={provider.logo_url} alt={provider.business_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-brand-red font-bold text-2xl sm:text-3xl">
                    {provider.business_name.charAt(0)}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-brand-black">
                  {provider.business_name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {provider.is_verified ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-brand-red/10 text-brand-red text-xs font-semibold px-2.5 py-1 rounded-full">
                      Listed Provider
                    </span>
                  )}
                  <span className="text-sm text-brand-gray-dark">📍 {primaryCity}, NC</span>
                  {provider.years_in_business && (
                    <span className="text-sm text-brand-gray-dark">
                      · {provider.years_in_business}+ years in business
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Link
              to={`/request?provider=${provider.id}`}
              className="btn-primary text-sm px-6 py-2.5 whitespace-nowrap self-start"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-brand-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* ── About ────────────────────────────────────────── */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-brand-black mb-3">About</h2>
            <p className="text-brand-gray-dark text-sm leading-relaxed whitespace-pre-line">
              {provider.description || 'No description provided.'}
            </p>

            {businessHours && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h3 className="font-semibold text-brand-black text-sm mb-2">Business Hours</h3>
                <div className="space-y-1 text-sm">
                  {Array.isArray(businessHours)
                    ? businessHours.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-brand-gray-dark">
                          <span className="font-medium">{item.day || item.label}</span>
                          <span>{item.hours || item.value}</span>
                        </div>
                      ))
                    : null}
                </div>
              </div>
            )}
          </section>

          {/* ── Services ─────────────────────────────────────── */}
          {provider.services.length > 0 && (
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-brand-black mb-4">Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {provider.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center gap-3 p-3 bg-brand-gray rounded-lg border border-gray-100"
                  >
                    <span className="text-2xl">{service.icon || '🔧'}</span>
                    <span className="text-sm font-medium text-brand-black">{service.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Service Areas ────────────────────────────────── */}
          {provider.areas.length > 0 && (
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-brand-black mb-4">Service Areas</h2>
              <div className="flex flex-wrap gap-2">
                {provider.areas.map((area) => (
                  <span key={area.id} className="bg-brand-gray text-brand-gray-dark text-sm px-3 py-1.5 rounded-full border border-gray-200">
                    📍 {area.city}, {area.state}{area.zip_code ? ` ${area.zip_code}` : ''}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* ── Work Gallery ─────────────────────────────────── */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-brand-black mb-4">Work Gallery</h2>
            {provider.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {provider.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxImage(img)}
                    className="aspect-square rounded-lg overflow-hidden bg-brand-gray hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-red"
                  >
                    <img
                      src={img}
                      alt={`${provider.business_name} work photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-brand-gray-dark text-sm">
                <div className="text-4xl mb-2">📷</div>
                <p>No work photos yet</p>
              </div>
            )}
          </section>

          {/* ── Contact ──────────────────────────────────────── */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-brand-black mb-4">Contact</h2>
            <div className="space-y-3">
              {provider.phone && (
                <a
                  href={`tel:${provider.phone.replace(/[^\d+]/g, '')}`}
                  className="flex items-center gap-3 text-brand-gray-dark hover:text-brand-red transition-colors group"
                >
                  <span className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red/20 transition-colors">
                    <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-medium text-brand-black group-hover:text-brand-red transition-colors">Phone</div>
                    <div className="text-sm">{provider.phone}</div>
                  </div>
                </a>
              )}

              {provider.email && (
                <a
                  href={`mailto:${provider.email}`}
                  className="flex items-center gap-3 text-brand-gray-dark hover:text-brand-red transition-colors group"
                >
                  <span className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red/20 transition-colors">
                    <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-medium text-brand-black group-hover:text-brand-red transition-colors">Email</div>
                    <div className="text-sm">{provider.email}</div>
                  </div>
                </a>
              )}

              {provider.website && (
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-brand-gray-dark hover:text-brand-red transition-colors group"
                >
                  <span className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red/20 transition-colors">
                    <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-medium text-brand-black group-hover:text-brand-red transition-colors">Website</div>
                    <div className="text-sm">{provider.website}</div>
                  </div>
                </a>
              )}

              {/* Social links */}
              <div className="flex gap-3 pt-2">
                {provider.facebook && (
                  <a
                    href={provider.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center hover:bg-[#1877F2]/20 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {provider.instagram && (
                  <a
                    href={provider.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#E4405F]/10 flex items-center justify-center hover:bg-[#E4405F]/20 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex flex-wrap gap-3">
                {provider.phone && (
                  <a
                    href={`tel:${provider.phone.replace(/[^\d+]/g, '')}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call Business
                  </a>
                )}
                {provider.website && (
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Visit Website
                  </a>
                )}
                <Link
                  to={`/request?provider=${provider.id}`}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Request a Quote
                </Link>
                <Link
                  to="/providers"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  View Services
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── Lightbox ────────────────────────────────────────── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-brand-red-light transition-colors"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxImage}
            alt="Work photo"
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
