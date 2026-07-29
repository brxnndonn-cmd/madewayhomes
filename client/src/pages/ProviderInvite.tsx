import { Link } from 'react-router-dom';

const BENEFITS = [
  {
    icon: '🆓',
    title: 'Free to join',
    desc: 'No cost during our launch period. Listing is completely free — no credit card required.',
  },
  {
    icon: '📋',
    title: 'No contracts',
    desc: 'No long-term commitments. You can update or remove your listing anytime.',
  },
  {
    icon: '✅',
    title: 'Reviewed for quality',
    desc: 'Every application is manually reviewed before publication to ensure quality listings.',
  },
  {
    icon: '📍',
    title: 'Caldwell County focus',
    desc: 'We exclusively serve Lenoir and Caldwell County, NC — your local community.',
  },
];

export default function ProviderInvite() {
  return (
    <div>
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-red-light/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-brand-gold/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <span className="section-badge !bg-white/20 !text-white">For Providers</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight leading-[1.15]">
              List Your Business on MadeWayHomes
            </h1>
            <p className="text-white/70 text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Free during our launch period — Caldwell County, NC
            </p>
            <Link
              to="/list-your-business"
              className="btn-white text-lg !px-8 !py-4 inline-flex items-center gap-2 shadow-2xl"
            >
              Apply Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── What is MadeWayHomes ──────────────────────────────── */}
      <section className="py-16 bg-brand-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-brand-black mb-4">
              What is MadeWayHomes?
            </h2>
            <p className="text-brand-gray-dark leading-relaxed mb-4">
              MadeWayHomes is a local directory connecting homeowners and renters in Caldwell County
              with independent local service providers. When a homeowner needs a plumber, electrician,
              painter, or any other home service, they submit a request through our platform. We match
              them with approved local providers like you.
            </p>
            <p className="text-brand-gray-dark leading-relaxed mb-4">
              <strong>Listings are free during our launch period.</strong> We're building the directory
              now and inviting quality local businesses to be founding providers. There's no cost —
              just a simple application.
            </p>
            <p className="text-brand-gray-dark leading-relaxed">
              All applications are <strong>manually reviewed</strong> before publication. We verify
              business details to ensure quality listings for Caldwell County homeowners.
            </p>
          </div>
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-black mb-3">
              Why list your business?
            </h2>
            <p className="text-brand-gray-dark max-w-xl mx-auto">
              Join a growing directory focused exclusively on Caldwell County.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {BENEFITS.map((item) => (
              <div key={item.title} className="card p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center flex-shrink-0 text-xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-brand-black mb-1">{item.title}</h3>
                  <p className="text-sm text-brand-gray-dark leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            Ready to get listed?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto">
            Fill out a quick application and we'll review it. No payment required.
          </p>
          <Link
            to="/list-your-business"
            className="btn-white text-lg !px-8 !py-4 inline-flex items-center gap-2 shadow-2xl"
          >
            Apply Now — It's Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
