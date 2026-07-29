export default function Terms() {
  const lastUpdated = '2024';
  const companyName = 'MadeWayHomes';
  const contactEmail = 'hello@madewayhomes.com';
  const stateName = 'North Carolina';

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-brand-black mb-2">Terms of Service</h1>
          <p className="text-brand-gray-dark text-sm">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-sm max-w-none text-brand-gray-dark leading-relaxed space-y-8">
            <p>
              Welcome to {companyName}. By accessing or using our website and services (the "Platform"), 
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please 
              do not use the Platform.
            </p>

            {/* ── 1. Acceptance ──────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">1. Acceptance of Terms</h2>
              <p>
                By creating an account, submitting a service request, applying as a provider, or otherwise 
                using the Platform, you acknowledge that you have read, understood, and agree to these Terms. 
                We may update these Terms from time to time. Continued use after changes constitutes acceptance 
                of the revised Terms.
              </p>
            </div>

            {/* ── 2. Services Description ────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">2. Services Description</h2>
              <p>
                {companyName} is a marketing and lead-generation platform. We connect homeowners, renters, 
                and property owners with independent local service providers in {stateName}. We do not perform, 
                supervise, or guarantee any services provided by listed providers.
              </p>
              <p className="mt-3">
                <strong>Key disclaimer:</strong> {companyName} is a marketing and lead-generation platform. 
                Service providers are independent businesses, not employees, contractors, or agents of 
                {companyName}. We do not guarantee jobs, customers, revenue, or the quality of any work 
                performed by providers.
              </p>
            </div>

            {/* ── 3. User Accounts ──────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must provide accurate and complete information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You must be at least 18 years old to use the Platform.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
              </ul>
            </div>

            {/* ── 4. Customer Terms ──────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">4. Customer Terms</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Service requests are free to submit. There is no obligation to hire.</li>
                <li>We share your request details (including contact information) with matched providers so they can respond to your project.</li>
                <li>We do not guarantee that your request will be matched or fulfilled.</li>
                <li>You are responsible for vetting providers and negotiating terms directly with them.</li>
                <li>Any disputes between you and a provider are between you and the provider. We are not a party to any agreement between you and a provider.</li>
              </ul>
            </div>

            {/* ── 5. Provider Terms ──────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">5. Provider Terms</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must provide accurate business information during the application process.</li>
                <li>We review applications before listing but approval is at our sole discretion.</li>
                <li>Once approved, your business profile will be visible in our directory and you may receive leads matched to your services and area.</li>
                <li>You are an independent business. We do not employ, supervise, or direct your work.</li>
                <li>You are responsible for your own licensing, insurance, and compliance with applicable laws.</li>
                <li>We do not guarantee a minimum number of leads, customers, or revenue.</li>
                <li>We may remove your listing at any time for violation of these Terms or at our discretion.</li>
              </ul>
            </div>

            {/* ── 6. Payments ────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">6. Payments (Future Feature)</h2>
              <p>
                In the future, we may introduce paid subscription plans and lead purchasing for providers. 
                Any payment features will be governed by additional terms presented at the time of purchase. 
                Currently, the Platform does not process payments.
              </p>
            </div>

            {/* ── 7. Prohibited Conduct ──────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">7. Prohibited Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Provide false or misleading information.</li>
                <li>Use the Platform for any illegal purpose.</li>
                <li>Harass, abuse, or harm other users.</li>
                <li>Attempt to circumvent any security features of the Platform.</li>
                <li>Scrape, data mine, or otherwise extract data from the Platform without permission.</li>
                <li>Impersonate any person or entity.</li>
              </ul>
            </div>

            {/* ── 8. Intellectual Property ──────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">8. Intellectual Property</h2>
              <p>
                The Platform, including its design, code, text, graphics, and logos, is owned by or licensed 
                to {companyName}. You may not reproduce, distribute, or create derivative works without 
                our prior written permission.
              </p>
            </div>

            {/* ── 9. Disclaimers ─────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">9. Disclaimers</h2>
              <p>
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, 
                OR SECURE. WE DISCLAIM ALL LIABILITY FOR THE ACTS OR OMISSIONS OF SERVICE PROVIDERS 
                LISTED ON THE PLATFORM.
              </p>
            </div>

            {/* ── 10. Limitation of Liability ───────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">10. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, {companyName.toUpperCase()} SHALL NOT BE LIABLE 
                FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM 
                YOUR USE OF THE PLATFORM. OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT 
                YOU PAID US (IF ANY) IN THE TWELVE MONTHS PRECEDING THE CLAIM.
              </p>
            </div>

            {/* ── 11. Indemnification ────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">11. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless {companyName}, its owners, and affiliates from 
                any claims, damages, or expenses arising from your use of the Platform, violation of these 
                Terms, or disputes with other users.
              </p>
            </div>

            {/* ── 12. Governing Law ──────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">12. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the State of {stateName}, without regard to conflict 
                of law principles. Any disputes shall be resolved in the courts of Caldwell County, {stateName}.
              </p>
            </div>

            {/* ── 13. Termination ────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">13. Termination</h2>
              <p>
                We may terminate or suspend your access to the Platform at any time, with or without cause, 
                with or without notice. Upon termination, your right to use the Platform ceases immediately.
              </p>
            </div>

            {/* ── 14. Contact ────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-3">14. Contact</h2>
              <p>
                Questions about these Terms? Contact us at{' '}
                <a href={`mailto:${contactEmail}`} className="text-brand-red hover:underline font-medium">
                  {contactEmail}
                </a>.
              </p>
              <p className="text-sm mt-2">MadeWayHomes — Lenoir, Caldwell County, {stateName}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
