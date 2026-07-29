import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-black mb-4">How It Works</h1>
          <p className="text-brand-gray-dark text-lg max-w-2xl mx-auto">
            Getting help for your home is simple, free, and puts you in control.
          </p>
        </div>
      </section>

      {/* ── For Customers ──────────────────────────────────────── */}
      <section className="py-16 bg-brand-gray">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-brand-black">For Homeowners &amp; Renters</h2>

          <div className="space-y-12">
            {[
              {
                step: '1',
                title: 'Tell us what you need',
                detail: 'Fill out a simple service request form. Tell us what kind of work you need done, where you\'re located in Caldwell County, your preferred timeline, and any budget preferences. You can even upload photos of the project to help providers understand the job.',
                icon: '📝',
              },
              {
                step: '2',
                title: 'We match your request',
                detail: 'Our platform identifies local independent service providers who specialize in your type of project and serve your area. We send your request to the best-matched provider, so you don\'t have to search through dozens of listings.',
                icon: '🔍',
              },
              {
                step: '3',
                title: 'Your provider reaches out',
                detail: 'Your matched provider contacts you directly — by phone, text, or email — to discuss the project details, answer questions, and provide a quote. You\'re never obligated to hire, and you stay in control of the process.',
                icon: '📞',
              },
              {
                step: '4',
                title: 'Get the job done',
                detail: 'Once you\'re happy with the provider and the quote, you schedule the work directly with them. After the job is complete, you can leave a review to help other homeowners in the community.',
                icon: '✅',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col sm:flex-row gap-6 bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="flex-shrink-0 w-14 h-14 bg-brand-red text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md mx-auto sm:mx-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-brand-black mb-2">{item.icon} {item.title}</h3>
                  <p className="text-brand-gray-dark leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/request" className="btn-primary text-lg px-8 py-3">
              Submit a Service Request
            </Link>
          </div>
        </div>
      </section>

      {/* ── For Providers ──────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-brand-black">For Service Providers</h2>
          <p className="text-center text-brand-gray-dark mb-12 max-w-2xl mx-auto">
            MadeWayHomes helps independent local businesses connect with customers who need their services.
          </p>

          <div className="space-y-10">
            {[
              {
                step: '1',
                title: 'Apply to be listed',
                detail: 'Fill out our provider application with your business name, contact information, services you offer, areas you serve, and some photos of your work. Applications are free to submit.',
                icon: '📋',
              },
              {
                step: '2',
                title: 'We review your application',
                detail: 'Our team reviews your business details to ensure you\'re a legitimate local service provider. This helps us maintain trust and quality on the platform. Most applications are reviewed within 2-3 business days.',
                icon: '👀',
              },
              {
                step: '3',
                title: 'Get listed & start receiving leads',
                detail: 'Once approved, your business appears in our provider directory. When a customer submits a request matching your services and area, you\'ll be matched and can reach out to them directly.',
                icon: '🚀',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col sm:flex-row gap-6 bg-brand-gray rounded-xl p-6 sm:p-8">
                <div className="flex-shrink-0 w-14 h-14 bg-brand-black text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md mx-auto sm:mx-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-brand-black mb-2">{item.icon} {item.title}</h3>
                  <p className="text-brand-gray-dark leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/list-your-business" className="btn-primary text-lg px-8 py-3">
              List Your Business
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10 text-brand-black">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How does MadeWayHomes work?', a: 'You submit a service request telling us what you need. We match your request with local, approved service providers in Caldwell County. Your matched provider then reaches out to you directly to discuss details.' },
              { q: 'Is there any cost to submit a service request?', a: 'No. Submitting a service request is completely free for homeowners and renters. There\'s no obligation to hire anyone.' },
              { q: 'Is MadeWayHomes a real estate brokerage?', a: 'No. MadeWayHomes is a marketing and lead-generation platform, not a real estate brokerage. We connect homeowners with independent local service providers.' },
              { q: 'Are the providers vetted?', a: 'Yes. Every provider who applies is reviewed before being listed. We verify business details to help ensure quality and trust.' },
              { q: 'What areas do you serve?', a: 'We proudly serve Lenoir and all of Caldwell County, North Carolina. All our providers are local independent businesses operating in the area.' },
              { q: 'How do I become a listed provider?', a: 'Go to the "List Your Business" page and fill out the application. We\'ll review your business details and get back to you within a few business days.' },
              { q: 'What if I\'m not happy with the matched provider?', a: 'You\'re always in control. If the match isn\'t a good fit, you can decline and submit a new request. There\'s no obligation.' },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-100 group">
                <summary className="px-6 py-4 cursor-pointer font-medium text-brand-black hover:text-brand-red transition-colors marker:text-brand-red">
                  {faq.q}
                </summary>
                <div className="px-6 pb-4 text-brand-gray-dark text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Still have questions?</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            We're here to help. Reach out and we'll get back to you.
          </p>
          <Link to="/contact" className="inline-block bg-white text-brand-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
