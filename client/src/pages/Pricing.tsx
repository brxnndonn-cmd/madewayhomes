import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: 'Free Listing',
    price: '$0',
    period: '/mo',
    description: 'Basic business profile with essential features.',
    features: [
      'Basic business profile',
      'Services and service areas',
      'Contact information',
      'Limited work photos',
    ],
    cta: 'Join Free',
    link: '/list-your-business',
    highlighted: false,
    badge: null,
  },
  {
    name: 'Featured Listing',
    price: '$49',
    period: '/mo',
    description: 'Higher placement and enhanced visibility.',
    features: [
      'Higher placement in search results',
      'Featured provider label',
      'More work photos',
      'Enhanced business profile',
      'Priority visibility',
    ],
    cta: 'Contact Us',
    link: '/contact',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Premium Partner',
    price: '$99',
    period: '/mo',
    description: 'Maximum exposure and priority opportunities.',
    features: [
      'Top placement in selected categories',
      'Enhanced profile',
      'Priority lead opportunities',
      'Expanded service areas',
      'Additional promotional options',
    ],
    cta: 'Contact Us',
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
          {/* Launch Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-10 max-w-3xl mx-auto text-center">
            <p className="text-amber-800 text-sm">
              <strong>Paid plans are not currently active.</strong> Founding providers can join free during the MadeWayHomes local launch.
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
                q: 'When will paid plans be available?',
                a: 'Paid promotional plans are planned for a future release. During the local launch period, all founding providers can join free with no payment information required.',
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
                q: 'What does "priority lead opportunities" mean?',
                a: 'Premium partners receive first access to customer requests that match your services and area before other providers.',
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
