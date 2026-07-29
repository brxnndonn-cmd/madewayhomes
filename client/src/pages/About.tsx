import { Link } from 'react-router-dom';

const CITIES = ['Lenoir', 'Granite Falls', 'Hudson', 'Gamewell', 'Sawmills', "Cajah's Mountain", 'Rhodhiss', 'Collettsville'];

export default function About() {
  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────── */}
      <section className="page-header text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">About MadeWayHomes</h1>
          <p className="text-white/70 text-xl">
            Making the way home easier — one service request at a time.
          </p>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────── */}
      <section className="py-16 bg-brand-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 sm:p-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-red/10 flex items-center justify-center mb-6">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-brand-black mb-4">Our Mission</h2>
            <p className="text-brand-gray-dark leading-relaxed mb-4">
              MadeWayHomes is a local directory and referral platform connecting homeowners, renters, and property owners
              in Lenoir and Caldwell County, North Carolina with independent local service providers.
            </p>
            <p className="text-brand-gray-dark leading-relaxed mb-4">
              We believe finding reliable help for your home shouldn't be a guessing game. Whether you need a plumber,
              painter, electrician, or landscaper, MadeWayHomes makes it easy to describe what you need and get connected
              with a local professional.
            </p>
            <p className="text-brand-gray-dark leading-relaxed">
              MadeWayHomes does not perform home services, does not employ providers, and does not guarantee pricing, 
              availability, workmanship, licensing, insurance, or results. Providers are independent businesses. 
              Customers should review providers before hiring.
            </p>
          </div>
        </div>
      </section>

      {/* ── What We Are / Are Not ────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-4">What We Are</h3>
              <ul className="space-y-3 text-green-700 text-sm leading-relaxed">
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> A local marketplace connecting homeowners with independent service providers</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> A marketing and lead-generation platform for local businesses</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> Community-focused — built specifically for Caldwell County</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> Free for homeowners to submit service requests</li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-4">What We're Not</h3>
              <ul className="space-y-3 text-red-700 text-sm leading-relaxed">
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">✗</span> A real estate brokerage — we do not buy, sell, or manage property</li>
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">✗</span> An employer of service providers — all providers are independent businesses</li>
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">✗</span> A guarantee of work — we match requests, but providers and customers work directly</li>
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold mt-0.5">✗</span> A national chain — we're local to Caldwell County, North Carolina</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community Focus ──────────────────────────────────── */}
      <section className="py-20 bg-brand-black text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🏡</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Rooted in Caldwell County</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            We're not a faceless tech company — we're building MadeWayHomes specifically for the community
            we know and love. Caldwell County has a rich tradition of hard-working, skilled tradespeople and
            homeowners who take pride in their property. We're here to bring them together.
          </p>
          <p className="text-gray-400 leading-relaxed mb-10">
            Every provider listed on MadeWayHomes is a local, independent business. When you hire through
            our platform, your money stays in the community — supporting local families and strengthening
            the local economy.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {CITIES.map((city) => (
              <span key={city} className="bg-white/10 text-gray-300 px-3 py-1.5 rounded-full text-sm border border-white/10">{city}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ──────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 text-sm text-amber-800 leading-relaxed flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <strong>Important disclaimer:</strong> MadeWayHomes is a directory and referral platform, not a real estate brokerage or home services company. Service providers listed on our platform are independent businesses, not employees or contractors of MadeWayHomes. We do not guarantee the quality of work, availability of providers, pricing, or that any particular service request will be fulfilled. A Verified badge means certain provider information was reviewed — it does not guarantee quality. Always do your own due diligence when hiring a service provider. See our <Link to="/disclaimer" className="text-amber-900 underline font-medium">full disclaimer</Link>.
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="hero-gradient py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-3">Have questions or feedback?</h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">We'd love to hear from you. Your input helps us make MadeWayHomes better for everyone.</p>
          <Link to="/contact" className="btn-white inline-flex items-center gap-2 text-lg !px-8 !py-3.5">
            Contact Us
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
