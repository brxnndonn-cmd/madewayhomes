import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: 'Free Listing',
    price: '$0',
    period: '/mo',
    description: 'Get listed in our directory and start receiving leads.',
    features: [
      'Basic profile in provider directory',
      'Receive lead notifications',
      'Up to 5 work photos',
      'Directory visibility in Caldwell County',
    ],
    cta: 'Apply Now — It\'s Free',
    link: '/list-your-business',
    highlighted: false,
    badge: null,
  },
  {
    name: 'Featured Listing',
    price: '$49',
    period: '/mo',
    description: 'Stand out from the crowd with priority placement.',
    features: [
      'Everything in Free Listing',
      'Priority placement in search results',
      'Highlighted profile with Featured badge',
      'Up to 10 work photos',
      'Featured on category pages',
      'More visibility to customers',
    ],
    cta: 'Contact Us to Join',
    link: '/contact',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Premium Partner',
    price: '$99',
    period: '/mo',
    description: 'Maximum exposure and priority lead matching.',
    features: [
      'Everything in Featured Listing',
      'Top of search results',
      'Featured on homepage',
      'Priority lead matching',
      'Premium Partner badge',
      'Unlimited work photos',
      'Dedicated support',
    ],
    cta: 'Contact Us to Join',
    link: '/contact',
    highlighted: false,
    badge: 'Best Value',
  },
];

export default function Pricing() {
  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <section className="page-header text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="section-badge !bg-white/20 !text-white">Plans</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Pricing Plans for Providers
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans are month-to-month — no long-term contracts.
          </p>
        </div>
      </section>

      {/* ── Pricing Cards ────────────────────────────────────────── */}
      <section className="py-16 bg-brand-gray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Coming Soon Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-10 max-w-3xl mx-auto text-center">
            <p className="text-amber-800 text-sm">
              <strong>💰 Payments coming soon!</strong> Online signup and payment processing are not yet available.
              For now, use the "Contact Us to Join" option and we'll get you set up manually.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative card p-6 sm:p-8 flex flex-col ${
                  plan.highlighted
                    ? 'ring-2 ring-brand-red shadow-xl scale-[1.02] md:scale-105 z-10 bg-white'
                    : 'bg-white'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap ${
                      plan.badge === 'Most Popular'
                        ? 'bg-brand-red'
                        : 'bg-brand-gold text-brand-black'
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-brand-black mb-1">{plan.name}</h3>
                <p className="text-sm text-brand-gray-dark mb-5">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-brand-black">{plan.price}</span>
                  <span className="text-brand-gray-dark text-lg">{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-brand-gray-dark">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  to={plan.link}
                  className={`w-full text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 active:scale-[0.98] ${
                    plan.highlighted
                      ? 'btn-primary text-base'
                      : 'btn-secondary text-base'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Bottom Note */}
          <div className="text-center mt-10">
            <p className="text-sm text-brand-gray-dark">
              Homeowners: submitting a service request is <strong>always free</strong>.{' '}
              <Link to="/request" className="text-brand-red hover:underline font-medium">
                Request a service →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-brand-black mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {[
              {
                q: 'When will online payments be available?',
                a: 'We\'re working on integrating secure payment processing. In the meantime, we handle plan setup manually — just contact us and we\'ll get you started.',
              },
              {
                q: 'Can I switch plans later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
              },
              {
                q: 'Is there a long-term contract?',
                a: 'No. All plans are month-to-month. You can cancel anytime with no penalty.',
              },
              {
                q: 'What does "priority lead matching" mean?',
                a: 'Premium partners receive new leads before other providers. This means you get first access to customer requests that match your services and area.',
              },
            ].map((faq, i) => (
              <div key={i} className="card p-5">
                <h3 className="font-semibold text-brand-black mb-2">{faq.q}</h3>
                <p className="text-sm text-brand-gray-dark">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
