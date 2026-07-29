import { Link } from 'react-router-dom';

const CUSTOMER_STEPS = [
  { step: '01', title: 'Tell us what you need', icon: '📝', detail: 'Fill out a simple service request form. Tell us what kind of work you need done, where you\'re located in Caldwell County, your preferred timeline, and any budget preferences. You can even upload photos of the project to help providers understand the job.' },
  { step: '02', title: 'We match your request', icon: '🎯', detail: 'Our platform identifies local independent service providers who specialize in your type of project and serve your area. We send your request to the best-matched provider, so you don\'t have to search through dozens of listings.' },
  { step: '03', title: 'Your provider reaches out', icon: '📞', detail: 'Your matched provider contacts you — by phone, text, or email — to discuss the project details, answer questions, and provide a quote. You\'re never obligated to hire, and you stay in control of the process.' },
  { step: '04', title: 'Get the job done', icon: '✅', detail: 'Once you\'re happy with the provider and the quote, you schedule the work directly with them. After the job is complete, you can leave a review to help other homeowners in the community.' },
];

const PROVIDER_STEPS = [
  { step: '01', title: 'Apply to be listed', icon: '📋', detail: 'Fill out our provider application with your business name, contact information, services you offer, areas you serve, and photos of your work. Applications are free to submit.' },
  { step: '02', title: 'We review your application', icon: '🔍', detail: 'Our team reviews your business details to ensure you\'re a legitimate local service provider. This helps maintain trust and quality on the platform. Most applications are reviewed within 2-3 business days.' },
  { step: '03', title: 'Get listed & start receiving leads', icon: '🚀', detail: 'Once approved, your business appears in our provider directory. When a customer submits a request matching your services and area, you\'ll be matched and can reach out directly.' },
];

const FAQS = [
  { q: 'Is there any cost to submit a service request?', a: 'No. Submitting a service request is completely free for homeowners and renters. There\'s no obligation to hire anyone.' },
  { q: 'Is MadeWayHomes a real estate brokerage?', a: 'No. MadeWayHomes is a marketing and lead-generation platform, not a real estate brokerage. We connect homeowners with independent local service providers.' },
  { q: 'Are the providers vetted?', a: 'Yes. Every provider who applies is reviewed before being listed. We verify business details to help ensure quality and trust.' },
  { q: 'What areas do you serve?', a: 'We proudly serve Lenoir and all of Caldwell County, North Carolina. All our providers are local independent businesses operating in the area.' },
  { q: 'How do I become a listed provider?', a: 'Go to the "List Your Business" page and fill out the application. We\'ll review your business details and get back to you within a few business days.' },
  { q: 'What if I\'m not happy with the matched provider?', a: 'You\'re always in control. If the match isn\'t a good fit, you can decline and submit a new request. There\'s no obligation.' },
];

export default function HowItWorks() {
  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────── */}
      <section className="page-header text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">How It Works</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Getting help for your home is simple, free, and puts you in control.
          </p>
        </div>
      </section>

      {/* ── For Customers ────────────────────────────────────── */}
      <section className="py-20 bg-brand-gray">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-badge">For Homeowners</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-black mb-3">How to find help</h2>
            <p className="text-brand-gray-dark max-w-xl mx-auto">
              Four simple steps to get connected with a trusted local provider.
            </p>
          </div>

          <div className="space-y-6">
            {CUSTOMER_STEPS.map((item) => (
              <div key={item.step} className="flex flex-col sm:flex-row gap-6 card p-6 sm:p-8 group">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-red to-brand-red-dark flex items-center justify-center text-2xl font-extrabold text-white shadow-lg shadow-brand-red/20 group-hover:scale-105 transition-transform mx-auto sm:mx-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-black mb-2">{item.icon} {item.title}</h3>
                  <p className="text-brand-gray-dark leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/request" className="btn-primary inline-flex items-center gap-2 text-lg !px-8 !py-3.5">
              Submit a Service Request
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── For Providers ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-badge">For Providers</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-black mb-3">How to grow your business</h2>
            <p className="text-brand-gray-dark max-w-xl mx-auto">
              MadeWayHomes helps independent local businesses connect with customers who need their services.
            </p>
          </div>

          <div className="space-y-6">
            {PROVIDER_STEPS.map((item) => (
              <div key={item.step} className="flex flex-col sm:flex-row gap-6 bg-brand-gray rounded-2xl p-6 sm:p-8 group">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-black to-gray-700 flex items-center justify-center text-2xl font-extrabold text-white shadow-lg mx-auto sm:mx-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-black mb-2">{item.icon} {item.title}</h3>
                  <p className="text-brand-gray-dark leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/list-your-business" className="btn-primary inline-flex items-center gap-2 text-lg !px-8 !py-3.5">
              List Your Business
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="section-badge">FAQ</span>
            <h2 className="text-3xl font-bold text-brand-black mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i} className="card group cursor-pointer">
                <summary className="px-6 py-4 font-semibold text-brand-black hover:text-brand-red transition-colors marker:text-brand-red flex items-center justify-between">
                  {faq.q}
                </summary>
                <div className="px-6 pb-4 text-brand-gray-dark text-sm leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="hero-gradient py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-3">Still have questions?</h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">We're here to help. Reach out and we'll get back to you.</p>
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
