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

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<Provider[]>([]);
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
        setFeaturedProviders(provRes.providers || []);
      } catch (_) {
        // Use fallback data if API unavailable
      }
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
      setEmailMsg('Thanks! You\'re signed up.');
      setEmail('');
    } catch (err: any) {
      setEmailStatus('error');
      setEmailMsg(err.data?.error || 'Something went wrong.');
    }
  };

  const faqs = [
    { q: 'How does MadeWayHomes work?', a: 'You submit a service request telling us what you need. We match your request with local, approved service providers in Caldwell County. Your matched provider then reaches out to you directly to discuss details and schedule the work.' },
    { q: 'Is MadeWayHomes a real estate brokerage?', a: 'No. MadeWayHomes is a marketing and lead-generation platform — not a real estate brokerage. We connect homeowners with independent local service providers.' },
    { q: 'Are providers vetted?', a: 'Yes. Every provider who applies to be listed goes through our review process. We verify business details before approving any listing.' },
    { q: 'What areas do you serve?', a: 'We proudly serve Lenoir and all of Caldwell County, North Carolina. Our providers are local independent businesses who live and work in the community.' },
    { q: 'How much does it cost?', a: 'Submitting a service request is completely free for homeowners. There\'s no obligation — you\'re in control of who you work with.' },
  ];

  const popularCategories = categories.length > 0
    ? categories.slice(0, 6)
    : [
        { id: 1, name: 'Plumbing', slug: 'plumbing', description: 'Pipe repair, leaks, fixtures, water heaters', icon: '🔧' },
        { id: 2, name: 'Electrical', slug: 'electrical', description: 'Wiring, outlets, panels, lighting', icon: '⚡' },
        { id: 3, name: 'HVAC', slug: 'hvac', description: 'Heating, cooling, ventilation, air quality', icon: '❄️' },
        { id: 4, name: 'Painting', slug: 'painting', description: 'Interior, exterior, trim, staining', icon: '🎨' },
        { id: 5, name: 'Cleaning', slug: 'cleaning', description: 'House cleaning, deep clean, move-in/out', icon: '🧹' },
        { id: 6, name: 'Landscaping', slug: 'landscaping', description: 'Lawn care, gardening, hardscaping', icon: '🌿' },
      ];

  return (
    <div>
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-brand-black leading-tight tracking-tight">
              Find trusted local help
              <br />
              <span className="text-brand-red">for your home.</span>
            </h1>
            <p className="mt-6 text-base sm:text-xl text-brand-gray-dark max-w-2xl mx-auto leading-relaxed">
              Tell us what you need, and MadeWayHomes will help connect you with local independent service providers in Caldwell County.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request" className="btn-primary text-lg px-8 py-3.5 shadow-md w-full sm:w-auto text-center">
                Request a Service
              </Link>
              <Link to="/list-your-business" className="btn-secondary text-lg px-8 py-3.5 w-full sm:w-auto text-center">
                List Your Business
              </Link>
            </div>

            {/* Quick Search */}
            <div className="mt-10 max-w-lg mx-auto bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field flex-1 text-sm"
                >
                  <option value="">Service needed...</option>
                  {popularCategories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Lenoir, NC or ZIP code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-field flex-1 text-sm"
                />
                <Link
                  to={selectedCategory ? `/services?category=${selectedCategory}` : '/request'}
                  className="btn-primary text-sm px-5 py-2.5 whitespace-nowrap"
                >
                  Find Help
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Services ─────────────────────────────────────── */}
      <section className="py-16 bg-brand-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-3 text-brand-black">Popular Services</h2>
          <p className="text-center text-brand-gray-dark mb-12 max-w-xl mx-auto">
            Everything your home needs, all in one place.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/services?category=${cat.slug}`}
                className="bg-white rounded-xl p-5 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 group"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="font-semibold text-brand-black text-sm group-hover:text-brand-red transition-colors">
                  {cat.name}
                </div>
                <div className="text-xs text-brand-gray-dark mt-1">{cat.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-3 text-brand-black">How It Works</h2>
          <p className="text-center text-brand-gray-dark mb-12 max-w-xl mx-auto">
            Getting help for your home is simple and free.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Tell us what you need',
                description: 'Submit a service request with your details — what job you need done, where you\'re located, and your preferred timeline.',
              },
              {
                step: '2',
                title: 'We find local pros',
                description: 'We match your request with verified, independent local providers who serve your area and specialize in your type of project.',
              },
              {
                step: '3',
                title: 'Get it done',
                description: 'Your matched provider reaches out to discuss the details. You\'re always in control of who you work with.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center px-4">
                <div className="w-14 h-14 bg-brand-red text-white rounded-full flex items-center justify-center mx-auto mb-5 text-xl font-bold shadow-md">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-brand-black">{item.title}</h3>
                <p className="text-brand-gray-dark text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Providers ──────────────────────────────────── */}
      <section className="py-16 bg-brand-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-3 text-brand-black">Featured Providers</h2>
          <p className="text-center text-brand-gray-dark mb-12 max-w-xl mx-auto">
            Trusted local businesses ready to help with your home.
          </p>

          {dataLoaded && featuredProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProviders.map((provider) => (
                <div key={provider.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                    Approved Provider
                  </span>
                  <h3 className="text-lg font-bold text-brand-black mb-1">{provider.business_name}</h3>
                  {provider.years_in_business && (
                    <p className="text-xs text-brand-gray-dark mb-2">{provider.years_in_business} years in business</p>
                  )}
                  <p className="text-sm text-brand-gray-dark mb-4 line-clamp-3">
                    {provider.description}
                  </p>
                  {provider.website && (
                    <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-red hover:underline font-medium">
                      Visit website →
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-3">🏗️</div>
              <h3 className="text-lg font-semibold text-brand-black mb-2">Local providers are joining soon</h3>
              <p className="text-brand-gray-dark text-sm mb-4">
                We're onboarding trusted local businesses in Caldwell County. Apply to be among the first listed here!
              </p>
              <Link to="/list-your-business" className="btn-primary text-sm">
                List Your Business
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Locations Served ─────────────────────────────────────── */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-brand-black mb-4">
            Proudly serving Lenoir and Caldwell County, North Carolina
          </h2>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-brand-gray-dark">
            {['Lenoir', 'Granite Falls', 'Hudson', 'Gamewell', 'Sawmills', 'Cajah\'s Mountain', 'Rhodhiss', 'Collettsville'].map((city) => (
              <span key={city} className="bg-brand-gray px-3 py-1.5 rounded-full">{city}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Providers ────────────────────────────────────────── */}
      <section className="py-16 bg-brand-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-3">Grow your business with MadeWayHomes</h2>
            <p className="text-gray-400 mb-10 max-w-xl mx-auto">
              Join the marketplace that connects Caldwell County homeowners with trusted local pros like you.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10 text-left">
              {[
                { title: 'Get matched', desc: 'Receive leads from local customers actively looking for your services.' },
                { title: 'Professional presence', desc: 'Showcase your business with a profile, photos, and reviews.' },
                { title: 'Simple management', desc: 'Manage your leads in one place. No complicated tools or contracts.' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">✓</div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
            <Link to="/list-your-business" className="inline-block bg-white text-brand-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              List Your Business
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust & Safety ────────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-brand-black mb-4">Trust &amp; Safety</h2>
          <p className="text-brand-gray-dark text-sm leading-relaxed">
            We review every provider before they're listed. Your contact information is protected. 
            You're in control of who you work with — there's no obligation when you submit a request.
          </p>
        </div>
      </section>

      {/* ── FAQ Preview ──────────────────────────────────────────── */}
      <section className="py-16 bg-brand-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-3 text-brand-black">Frequently Asked Questions</h2>
          <p className="text-center text-brand-gray-dark mb-10">Quick answers to common questions.</p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-brand-black pr-4">{faq.q}</span>
                  <span className={`text-brand-red transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-brand-gray-dark text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/how-it-works" className="text-brand-red hover:underline font-medium text-sm">
              See all FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Email Signup ─────────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-brand-black mb-2">Stay Updated</h2>
          <p className="text-brand-gray-dark text-sm mb-6">
            Be the first to know when new providers join and features launch.
          </p>
          {emailStatus === 'success' ? (
            <p className="text-green-600 font-medium">{emailMsg}</p>
          ) : (
            <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-field flex-1 text-sm"
              />
              <button type="submit" disabled={emailStatus === 'loading'} className="btn-primary text-sm whitespace-nowrap">
                {emailStatus === 'loading' ? 'Signing up...' : 'Stay Updated'}
              </button>
            </form>
          )}
          {emailStatus === 'error' && (
            <p className="text-red-500 text-sm mt-2">{emailMsg}</p>
          )}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Join homeowners across Caldwell County who are finding trusted local help for their homes.
          </p>
          <Link
            to="/request"
            className="inline-block bg-white text-brand-red px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md text-lg"
          >
            Request a Service
          </Link>
        </div>
      </section>
    </div>
  );
}
