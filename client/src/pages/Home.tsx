import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Provider {
  id: number;
  business_name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  years_in_business: number;
  approval_status: string;
}

const STATIC_CATEGORIES = [
  { id: 1, name: 'Plumbing', slug: 'plumbing', description: 'Pipe repair, leaks, fixtures', icon: '🔧' },
  { id: 2, name: 'Electrical', slug: 'electrical', description: 'Wiring, outlets, lighting', icon: '⚡' },
  { id: 3, name: 'HVAC', slug: 'hvac', description: 'Heating, cooling, air quality', icon: '❄️' },
  { id: 4, name: 'Painting', slug: 'painting', description: 'Interior, exterior, trim', icon: '🎨' },
  { id: 5, name: 'Cleaning', slug: 'cleaning', description: 'House cleaning, deep clean', icon: '🧹' },
  { id: 6, name: 'Landscaping', slug: 'landscaping', description: 'Lawn care, hardscaping', icon: '🌿' },
  { id: 7, name: 'Roofing', slug: 'roofing', description: 'Repair, replacement, inspection', icon: '🏠' },
  { id: 8, name: 'Carpentry', slug: 'carpentry', description: 'Framing, trim, custom work', icon: '🪚' },
];

const FAQS = [
  { q: 'How does MadeWayHomes work?', a: 'You submit a service request telling us what you need. We match your request with local, approved service providers in Caldwell County. Your matched provider then reaches out to you directly to discuss details and schedule the work.' },
  { q: 'Is MadeWayHomes a real estate brokerage?', a: 'No. MadeWayHomes is a marketing and lead-generation platform — not a real estate brokerage. We connect homeowners with independent local service providers.' },
  { q: 'Are providers vetted?', a: 'Yes. Every provider who applies to be listed goes through our review process. We verify business details before approving any listing.' },
  { q: 'What areas do you serve?', a: 'We proudly serve Lenoir and all of Caldwell County, North Carolina. Our providers are local independent businesses who live and work in the community.' },
  { q: 'How much does it cost?', a: 'Submitting a service request is completely free for homeowners. There\'s no obligation — you\'re in control of who you work with.' },
];

const CITIES = ['Lenoir', 'Granite Falls', 'Hudson', 'Gamewell', 'Sawmills', "Cajah's Mountain", 'Rhodhiss', 'Collettsville'];

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<Provider[]>([]);
  const [categoryCount, setCategoryCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [emailMsg, setEmailMsg] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, provRes] = await Promise.all([
          apiFetch('/categories', { skipAuth: true }),
          apiFetch('/providers/featured', { skipAuth: true }),
        ]);
        setCategories(catRes.categories || []);
        setCategoryCount(catRes.categories?.length || 0);
        setFeaturedProviders(provRes.providers || []);
      } catch (_) {}
      setDataLoaded(true);
    }
    loadData();
  }, []);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailStatus('loading');
    try {
      await apiFetch('/email-signup', {
        method: 'POST',
        body: JSON.stringify({ email }),
        skipAuth: true,
      });
      setEmailStatus('success');
      setEmailMsg("Thanks! You're signed up.");
      setEmail('');
    } catch (err: any) {
      setEmailStatus('error');
      setEmailMsg(err.data?.error || 'Something went wrong.');
    }
  };

  const displayCategories = categories.length > 0 ? categories.slice(0, 8) : STATIC_CATEGORIES;

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════ */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-red-light/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Now serving Caldwell County, NC
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              Your home deserves
              <br />
              <span className="text-brand-gold">the best</span> local pros
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Tell us what you need, and we'll connect you with trusted, independent service providers right here in Caldwell County.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request" className="btn-white text-lg !px-8 !py-4 inline-flex items-center gap-2 shadow-xl">
                Find a Pro
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/list-your-business" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white/40 text-white hover:bg-white/10 transition-all duration-200 active:scale-[0.98]">
                List Your Business
              </Link>
            </div>

            {/* Trust indicators — using real data where available */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-12">
              <div className="stat-card text-white">
                <div className="stat-number !text-white">{categoryCount > 0 ? `${categoryCount}+` : '24'}</div>
                <div className="stat-label !text-white/60">Service Categories</div>
              </div>
              <div className="stat-card text-white">
                <div className="stat-number !text-white">Local</div>
                <div className="stat-label !text-white/60">Serving Caldwell County</div>
              </div>
              <div className="stat-card text-white">
                <div className="stat-number !text-white">Free</div>
                <div className="stat-label !text-white/60">For Homeowners</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          POPULAR CATEGORIES
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-brand-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-badge">Services</span>
            <h2 className="section-title mb-4">What do you need help with?</h2>
            <p className="section-subtitle mx-auto">
              From plumbing to painting — find the right pro for any home project.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {displayCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/services?category=${cat.slug}`}
                className="card-hover-lift p-5 sm:p-6 text-center group cursor-pointer"
              >
                <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </div>
                <div className="font-bold text-brand-black group-hover:text-brand-red transition-colors text-base">
                  {cat.name}
                </div>
                <div className="text-xs text-brand-gray-dark mt-1.5 leading-relaxed">
                  {cat.description}
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/services" className="text-brand-red hover:text-brand-red-dark font-semibold text-sm inline-flex items-center gap-1">
              View all services
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title mb-4">Getting help in 3 easy steps</h2>
            <p className="section-subtitle mx-auto">
              No complicated forms. No obligation. Just local help when you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Tell us what you need',
                desc: 'Fill out a quick service request describing your project, location, and timeline. Upload photos if you have them.',
                icon: '📝',
              },
              {
                step: '02',
                title: 'We find local pros',
                desc: 'We match you with verified independent providers who specialize in your type of work and serve your area.',
                icon: '🎯',
              },
              {
                step: '03',
                title: 'Get it done right',
                desc: 'Your matched provider contacts you directly to discuss details and schedule the work. You\'re always in control.',
                icon: '✅',
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center group">
                {/* Connector line between steps (desktop) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 bg-gray-200" />
                )}

                <div className="icon-circle-red mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-brand-red/20">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="text-xs font-bold text-brand-red/40 mb-2 tracking-widest uppercase">{item.step}</div>
                <h3 className="text-lg font-bold text-brand-black mb-2">{item.title}</h3>
                <p className="text-sm text-brand-gray-dark leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/how-it-works" className="btn-secondary inline-flex items-center gap-2">
              Learn More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURED PROVIDERS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-brand-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-badge">Providers</span>
            <h2 className="section-title mb-4">Trusted local businesses</h2>
            <p className="section-subtitle mx-auto">
              Meet some of the approved providers ready to help with your home.
            </p>
          </div>

          {dataLoaded && featuredProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProviders.map((provider) => (
                <div key={provider.id} className="card-hover-lift p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-red to-brand-red-dark flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {provider.business_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-black">{provider.business_name}</h3>
                    </div>
                  </div>
                  <span className="tag tag-red self-start mb-3 text-xs">Approved Provider</span>
                  <p className="text-sm text-brand-gray-dark mb-4 flex-1 line-clamp-3">
                    {provider.description}
                  </p>
                  {provider.years_in_business && (
                    <p className="text-xs text-brand-gray-dark mb-3">
                      ⏱ {provider.years_in_business} years in business
                    </p>
                  )}
                  <Link
                    to={`/providers/${provider.id}`}
                    className="text-sm font-semibold text-brand-red hover:text-brand-red-dark transition-colors inline-flex items-center gap-1 mt-auto"
                  >
                    View Profile
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-red/10 to-brand-gold/10 flex items-center justify-center">
                <span className="text-4xl">🏗️</span>
              </div>
              <h3 className="text-xl font-bold text-brand-black mb-2">Local providers are joining soon</h3>
              <p className="text-brand-gray-dark text-sm mb-6 leading-relaxed">
                We're onboarding trusted local businesses in Caldwell County. Apply to be among the first listed!
              </p>
              <Link to="/list-your-business" className="btn-primary">
                List Your Business
              </Link>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/providers" className="text-brand-red hover:text-brand-red-dark font-semibold text-sm inline-flex items-center gap-1">
              Browse all providers
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CITIES SERVED
          ═══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-brand-black mb-3">
            Proudly serving Lenoir and Caldwell County, North Carolina
          </h2>
          <p className="text-brand-gray-dark mb-8 max-w-xl mx-auto">
            Every provider on MadeWayHomes is a local, independent business from the community.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {CITIES.map((city) => (
              <span key={city} className="tag tag-gray hover:border-brand-red hover:text-brand-red transition-colors cursor-default">
                📍 {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOR PROVIDERS
          ═══════════════════════════════════════════════════════ */}
      <section className="hero-dark-gradient relative overflow-hidden py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-red/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-brand-gold/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="section-badge !bg-brand-gold/20 !text-brand-gold">For Providers</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Grow your business with MadeWayHomes
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              Join the marketplace that connects Caldwell County homeowners with trusted local pros like you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
              {[
                { icon: '🎯', title: 'Get Matched', desc: 'Receive leads from local customers actively searching for your services.' },
                { icon: '🏪', title: 'Professional Presence', desc: 'Showcase your business with a dedicated profile, photos, and service listings.' },
                { icon: '📊', title: 'Simple Management', desc: 'Manage everything in one place — no complicated tools or long-term contracts.' },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 text-2xl">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <Link to="/list-your-business" className="btn-gold text-lg !px-8 !py-4 inline-flex items-center gap-2 shadow-xl">
              List Your Business
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRUST & SAFETY
          ═══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-green-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-brand-black mb-4">Trust &amp; Safety</h2>
          <p className="text-brand-gray-dark text-sm leading-relaxed max-w-xl mx-auto">
            We review every provider before they're listed. Your contact information is protected.
            You're in control of who you work with — there's no obligation when you submit a request.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ PREVIEW
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-brand-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-badge">FAQ</span>
            <h2 className="section-title mb-4">Frequently Asked Questions</h2>
            <p className="section-subtitle mx-auto">Quick answers to common questions.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-brand-black pr-4 text-sm sm:text-base">{faq.q}</span>
                  <span className={`text-brand-red transition-transform duration-200 flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? 'max-h-48 pb-4' : 'max-h-0'
                  }`}
                >
                  <p className="px-6 text-brand-gray-dark text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/how-it-works" className="text-brand-red hover:text-brand-red-dark font-semibold text-sm inline-flex items-center gap-1">
              See all FAQs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          EMAIL SIGNUP
          ═══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-brand-red/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-brand-black mb-2">Stay Updated</h2>
          <p className="text-brand-gray-dark text-sm mb-6">
            Be the first to know when new providers join and features launch.
          </p>
          {emailStatus === 'success' ? (
            <p className="text-green-600 font-semibold text-lg">✅ {emailMsg}</p>
          ) : (
            <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-field flex-1"
              />
              <button type="submit" disabled={emailStatus === 'loading'} className="btn-primary whitespace-nowrap">
                {emailStatus === 'loading' ? 'Signing up...' : 'Stay Updated'}
              </button>
            </form>
          )}
          {emailStatus === 'error' && <p className="text-red-500 text-sm mt-2">{emailMsg}</p>}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="hero-gradient relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto">
            Join homeowners across Caldwell County finding trusted local help for their homes.
          </p>
          <Link to="/request" className="btn-white text-lg !px-8 !py-4 inline-flex items-center gap-2 shadow-2xl">
            Request a Service — It's Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
