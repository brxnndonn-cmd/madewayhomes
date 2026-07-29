import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-black mb-4">About MadeWayHomes</h1>
          <p className="text-brand-gray-dark text-lg">
            Making the way home easier — one service request at a time.
          </p>
        </div>
      </section>

      {/* ── Mission ─────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-brand-black mb-4">Our Mission</h2>
            <p className="text-brand-gray-dark leading-relaxed mb-4">
              MadeWayHomes is a local home-services marketplace connecting homeowners, renters, and property owners 
              in Lenoir and Caldwell County, North Carolina with independent local service providers.
            </p>
            <p className="text-brand-gray-dark leading-relaxed mb-4">
              We believe finding reliable help for your home shouldn't be a guessing game. Whether you need a plumber, 
              painter, electrician, or landscaper, MadeWayHomes makes it easy to describe what you need and get connected 
              with a trusted local professional.
            </p>
            <p className="text-brand-gray-dark leading-relaxed">
              Our tagline says it best: <strong className="text-brand-black">Making the way home easier.</strong> We're building a platform 
              that brings Caldwell County together — homeowners getting the help they need, and local businesses 
              growing through real community connections.
            </p>
          </div>
        </div>
      </section>

      {/* ── What We Are (and Aren't) ──────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-50 rounded-xl p-8 border border-green-100">
              <h3 className="text-xl font-bold text-green-800 mb-4">What We Are</h3>
              <ul className="space-y-3 text-green-700 text-sm leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  A local marketplace connecting homeowners with independent service providers
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  A marketing and lead-generation platform for local businesses
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  Community-focused — built specifically for Caldwell County
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  Free for homeowners to submit service requests
                </li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-xl p-8 border border-red-100">
              <h3 className="text-xl font-bold text-red-800 mb-4">What We're Not</h3>
              <ul className="space-y-3 text-red-700 text-sm leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  A real estate brokerage — we do not buy, sell, or manage property
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  An employer of service providers — all providers are independent businesses
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  A guarantee of work — we match requests, but providers and customers work directly
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  A national chain — we're local to Caldwell County, North Carolina
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community Focus ───────────────────────────────────── */}
      <section className="py-16 bg-brand-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-brand-black mb-4">Rooted in Caldwell County</h2>
          <p className="text-brand-gray-dark leading-relaxed mb-4">
            We're not a faceless tech company — we're building MadeWayHomes specifically for the community 
            we know and love. Caldwell County has a rich tradition of hard-working, skilled tradespeople and 
            homeowners who take pride in their property. We're here to bring them together.
          </p>
          <p className="text-brand-gray-dark leading-relaxed mb-8">
            Every provider listed on MadeWayHomes is a local, independent business. When you hire through 
            our platform, your money stays in the community — supporting local families and strengthening 
            the local economy.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-brand-gray-dark">
            {['Lenoir', 'Granite Falls', 'Hudson', 'Gamewell', 'Sawmills', 'Cajah\'s Mountain', 'Rhodhiss', 'Collettsville'].map((city) => (
              <span key={city} className="bg-white px-3 py-1.5 rounded-full shadow-sm">{city}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ─────────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 text-sm text-amber-800 leading-relaxed">
            <strong>Important disclaimer:</strong> MadeWayHomes is a marketing and lead-generation platform, 
            not a real estate brokerage. Service providers listed on our platform are independent businesses, 
            not employees or contractors of MadeWayHomes. We do not guarantee the quality of work, availability 
            of providers, or that any particular service request will be fulfilled. Always do your own due 
            diligence when hiring a service provider.
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Have questions or feedback?</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            We'd love to hear from you. Your input helps us make MadeWayHomes better for everyone.
          </p>
          <Link to="/contact" className="inline-block bg-white text-brand-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
