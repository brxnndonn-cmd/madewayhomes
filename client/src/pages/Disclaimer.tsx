import { Link } from 'react-router-dom';

export default function Disclaimer() {
  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="page-header text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">Disclaimer</h1>
          <p className="text-white/60 text-sm">Important information about our platform</p>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────────── */}
      <section className="py-12 bg-brand-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 sm:p-10">
            <div className="space-y-8 text-brand-gray-dark leading-relaxed">

              <div>
                <h2 className="text-xl font-bold text-brand-black mb-3">What MadeWayHomes Is</h2>
                <p>
                  MadeWayHomes is a <strong>directory and referral platform</strong> — a marketing and 
                  lead-generation service. We connect homeowners, renters, and property owners in 
                  Caldwell County, North Carolina with independent local service providers.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-brand-black mb-3">What MadeWayHomes Is Not</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Not a contractor.</strong> We do not perform, supervise, or manage any home services.</li>
                  <li><strong>Not an employer.</strong> Service providers listed on MadeWayHomes are independent businesses. We do not employ, train, or direct any provider.</li>
                  <li><strong>Not a real estate brokerage.</strong> MadeWayHomes is not affiliated with any real estate brokerage and does not provide real estate services.</li>
                  <li><strong>Not a guarantor.</strong> We do not guarantee the quality, timeliness, or outcome of any work performed by listed providers.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-brand-black mb-3">Provider Verification</h2>
                <p>
                  We review provider applications before listing them on our platform. Our review includes 
                  verifying business details and contact information. However:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li><strong>Not all providers are verified</strong> unless explicitly marked with a verification badge.</li>
                  <li>We do not perform background checks, criminal history checks, or drug testing on providers.</li>
                  <li>We do not verify insurance coverage, licensing, or bonding unless the provider voluntarily submits this information.</li>
                  <li>A provider's approval on our platform does not constitute an endorsement or recommendation.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-brand-black mb-3">Your Responsibility as a Homeowner</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Do your own due diligence.</strong> Before hiring any provider, we recommend you:
                    <ul className="list-circle pl-5 space-y-1 mt-1">
                      <li>Ask for references and check reviews from other sources</li>
                      <li>Request proof of insurance and applicable licenses</li>
                      <li>Get multiple quotes for larger projects</li>
                      <li>Have a written agreement or contract before work begins</li>
                    </ul>
                  </li>
                  <li>You are responsible for vetting providers and negotiating terms directly with them.</li>
                  <li>Any agreement or contract is between you and the provider — MadeWayHomes is not a party to it.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-brand-black mb-3">No Guarantees</h2>
                <p>
                  MadeWayHomes does not guarantee:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>That your service request will be matched or fulfilled</li>
                  <li>The quality, safety, or legality of services provided</li>
                  <li>The truth or accuracy of provider listings, reviews, or profiles</li>
                  <li>The availability, reliability, or performance of the platform itself</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-brand-black mb-3">Limitation of Liability</h2>
                <p>
                  To the fullest extent permitted by law, MadeWayHomes and its owners, operators, and affiliates 
                  are not liable for any damages, losses, or injuries arising from your use of the platform or 
                  from services performed by listed providers. Your use of the platform is at your own risk.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-brand-black mb-3">Contact</h2>
                <p>
                  If you have questions about this disclaimer, please{' '}
                  <Link to="/contact" className="text-brand-red hover:underline font-medium">
                    contact us
                  </Link>
                  {' '}or email{' '}
                  <a href="mailto:hello@madewayhomes.com" className="text-brand-red hover:underline font-medium">
                    hello@madewayhomes.com
                  </a>
                  .
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
